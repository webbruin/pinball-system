// Upload shop catalog: create 9 categories, upload main images, create products + SKUs.
// Usage:
//   TOKEN=... node scripts/upload-shop.cjs --smoke    # auth check + upload 1 image (no writes to catalog)
//   TOKEN=... node scripts/upload-shop.cjs --cats     # create categories only
//   TOKEN=... node scripts/upload-shop.cjs            # full run (resumable via cache files)
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'https://www.bingobangai.com/prod-api';
const TOKEN = process.env.TOKEN || '';
const CONCURRENCY = Number(process.env.CONCURRENCY || 6);

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const PRODUCTS_PATH = path.join(DATA_DIR, 'products-final.json');
const CAT_MAP_PATH = path.join(DATA_DIR, '.shop-categories.json');
const IMG_CACHE_PATH = path.join(DATA_DIR, '.shop-img-cache.json');
const RESULTS_PATH = path.join(DATA_DIR, 'shop-upload-results.json');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function jsonFetch(apiPath, body) {
  const res = await fetch(BASE + apiPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', token: TOKEN },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { status: res.status, data };
}

function sniff(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' };
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return { mime: 'image/png', ext: 'png' };
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return { mime: 'image/webp', ext: 'webp' };
  if (buf.length > 4 && buf.toString('ascii', 0, 4) === 'GIF8') return { mime: 'image/gif', ext: 'gif' };
  return { mime: 'application/octet-stream', ext: 'bin' };
}

async function uploadFile(filePath) {
  const buf = fs.readFileSync(filePath);
  const { mime, ext } = sniff(buf);
  const filename = `shop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const form = new FormData();
  form.append('file', new Blob([buf], { type: mime }), filename);
  const res = await fetch(BASE + '/admin/pinball/file/upload', {
    method: 'POST',
    headers: { token: TOKEN },
    body: form,
    signal: AbortSignal.timeout(60000),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (res.status !== 200 || data.code !== 200) throw new Error('upload fail: ' + text.slice(0, 300));
  return data.data.filePathUrl;
}

async function withRetry(fn, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) { lastErr = e; if (i < tries - 1) await sleep(1500 * (i + 1)); }
  }
  throw lastErr;
}

async function pool(items, worker, concurrency) {
  const results = new Array(items.length);
  let idx = 0;
  async function run() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return results;
}

async function listCategories() {
  const { data } = await jsonFetch('/admin/pinball/shop/category/list', {});
  if (data.code !== 200) throw new Error('category/list failed: ' + JSON.stringify(data).slice(0, 200));
  return data.data || [];
}

async function createCategory(name, sortOrder) {
  const { data } = await jsonFetch('/admin/pinball/shop/category/save', {
    categoryName: name,
    icon: '',
    sortOrder,
    status: 1,
  });
  if (data.code !== 200) throw new Error('category/save failed: ' + JSON.stringify(data).slice(0, 200));
  return data;
}

async function ensureCategories(products) {
  // categories in first-seen order
  const seen = [];
  for (const p of products) if (!seen.includes(p.cat)) seen.push(p.cat);

  const existing = await listCategories();
  const byName = new Map(existing.map((c) => [c.categoryName, c]));

  const map = {};
  for (let i = 0; i < seen.length; i++) {
    const name = seen[i];
    if (byName.has(name)) {
      map[name] = Number(byName.get(name).categoryId);
      console.log(`  category exists: ${name} -> ${map[name]}`);
    } else {
      const r = await createCategory(name, i + 1);
      // re-query to get authoritative id
      const fresh = await listCategories();
      const hit = fresh.find((c) => c.categoryName === name);
      map[name] = Number(hit ? hit.categoryId : r.data);
      console.log(`  category created: ${name} -> ${map[name]} (save.data=${JSON.stringify(r.data)})`);
    }
  }
  fs.writeFileSync(CAT_MAP_PATH, JSON.stringify(map, null, 2));
  return map;
}

async function smoke() {
  console.log('BASE =', BASE);
  const cats = await listCategories();
  console.log('auth OK, existing categories:', cats.length);
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  const first = products[0];
  console.log('smoke: upload one image', first.mainImage);
  const oss = await uploadFile(first.mainImage);
  console.log('  uploaded ->', oss);
  console.log('SMOKE OK');
}

async function runCatsOnly() {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  const map = await ensureCategories(products);
  console.log('categories map ->', CAT_MAP_PATH);
  console.log(JSON.stringify(map, null, 2));
}

async function full() {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));

  console.log('=== 1. categories ===');
  const catMap = await ensureCategories(products);

  console.log('=== 2. upload images ===');
  const imgCache = fs.existsSync(IMG_CACHE_PATH) ? JSON.parse(fs.readFileSync(IMG_CACHE_PATH, 'utf8')) : {};
  const todo = [];
  for (const p of products) if (!imgCache[p.mainImage]) todo.push(p.mainImage);
  console.log(`  images total=${products.length}, cached=${products.length - todo.length}, to upload=${todo.length}`);
  let done = 0;
  const imgFail = [];
  await pool([...new Set(todo)], async (filePath) => {
    try {
      const oss = await withRetry(() => uploadFile(filePath), 3);
      imgCache[filePath] = oss;
      fs.writeFileSync(IMG_CACHE_PATH, JSON.stringify(imgCache, null, 2));
      done++;
      if (done % 20 === 0) console.log(`  uploaded ${done}/${todo.length}`);
      return oss;
    } catch (e) {
      imgFail.push({ filePath, error: String(e.message || e) });
      console.error('  IMG FAIL', path.basename(filePath), '->', e.message);
      return null;
    }
  }, CONCURRENCY);
  console.log(`  images done: ok=${done}, failed=${imgFail.length}`);

  console.log('=== 3. products + SKUs ===');
  const results = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const mainOss = imgCache[p.mainImage];
    if (!mainOss) {
      results.push({ cat: p.cat, name: p.name, status: 'skip', reason: 'image missing' });
      console.error(`  SKIP ${p.cat}/${p.name}: image missing`);
      continue;
    }
    const productPayload = {
      categoryId: catMap[p.cat],
      productName: p.name,
      description: p.description,
      detailHtml: '',
      mainImage: mainOss,
      images: JSON.stringify([mainOss]),
      memberOnly: p.memberOnly,
      sortOrder: p.sortOrder,
      status: 1,
    };
    let productId;
    try {
      const { data } = await jsonFetch('/admin/pinball/shop/product/save', productPayload);
      if (data.code !== 200) {
        results.push({ cat: p.cat, name: p.name, status: 'fail', message: data.message });
        console.error(`  PRODUCT FAIL ${p.cat}/${p.name} -> ${data.message}`);
        continue;
      }
      productId = Number(data.data);
    } catch (e) {
      results.push({ cat: p.cat, name: p.name, status: 'error', message: String(e.message || e) });
      console.error(`  PRODUCT ERR ${p.cat}/${p.name} -> ${e.message}`);
      continue;
    }

    // SKU
    const skuPayload = {
      productId,
      skuName: '默认规格',
      skuAttrs: '[]',
      pointType: 0,
      price: p.points,
      stock: 100,
      image: mainOss,
      status: 1,
    };
    try {
      const { data } = await jsonFetch('/admin/pinball/shop/product/sku/save', skuPayload);
      if (data.code !== 200) {
        results.push({ cat: p.cat, name: p.name, productId, status: 'sku-fail', message: data.message });
        console.error(`  SKU FAIL ${p.cat}/${p.name} -> ${data.message}`);
        continue;
      }
      results.push({ cat: p.cat, name: p.name, productId, skuId: data.data, points: p.points, status: 'ok' });
      console.log(`  OK (${i + 1}/${products.length}) ${p.cat}/${p.name} [${p.points}分]`);
    } catch (e) {
      results.push({ cat: p.cat, name: p.name, productId, status: 'sku-error', message: String(e.message || e) });
      console.error(`  SKU ERR ${p.cat}/${p.name} -> ${e.message}`);
    }
  }

  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
  const ok = results.filter((r) => r.status === 'ok').length;
  console.log(`\nDONE: ok=${ok}, total=${products.length}`);
  console.log('results ->', RESULTS_PATH);
}

(async () => {
  if (!TOKEN) { console.error('missing TOKEN env'); process.exit(1); }
  if (process.argv.includes('--smoke')) return smoke();
  if (process.argv.includes('--cats')) return runCatsOnly();
  await full();
})();
