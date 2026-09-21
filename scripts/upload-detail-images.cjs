// Upload detail (desc_XX) images and populate each product's detailHtml.
// Usage:
//   TOKEN=... node scripts/upload-detail-images.cjs --upload   # upload all desc images (resumable)
//   TOKEN=... node scripts/upload-detail-images.cjs --update   # build detailHtml + update products
//   TOKEN=... node scripts/upload-detail-images.cjs            # both
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'https://www.bingobangai.com/prod-api';
const TOKEN = process.env.TOKEN || '';
const CONCURRENCY = Number(process.env.CONCURRENCY || 8);

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const PRODUCTS_PATH = path.join(DATA_DIR, 'products-final.json');
const CAT_MAP_PATH = path.join(DATA_DIR, '.shop-categories.json');
const IMG_CACHE_PATH = path.join(DATA_DIR, '.shop-img-cache.json');
const DESC_CACHE_PATH = path.join(DATA_DIR, '.shop-desc-cache.json');
const RESULTS_PATH = path.join(DATA_DIR, 'shop-upload-results.json');
const DETAIL_RESULTS_PATH = path.join(DATA_DIR, 'shop-detail-results.json');

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

function descFilesOf(mainImagePath) {
  const dir = path.dirname(mainImagePath);
  const files = fs.readdirSync(dir).filter((f) => /^desc_\d+\.(jpg|jpeg|png|webp|gif)$/i.test(f));
  files.sort((a, b) => {
    const na = parseInt(a.match(/desc_(\d+)/i)[1], 10);
    const nb = parseInt(b.match(/desc_(\d+)/i)[1], 10);
    return na - nb;
  });
  return files.map((f) => path.join(dir, f));
}

function loadJson(p, def) {
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : def;
}

async function phaseUpload() {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  const cache = loadJson(DESC_CACHE_PATH, {});

  // collect unique desc paths
  const allPaths = [];
  const seen = new Set();
  for (const p of products) {
    for (const fp of descFilesOf(p.mainImage)) {
      if (!seen.has(fp)) { seen.add(fp); allPaths.push(fp); }
    }
  }
  const todo = allPaths.filter((fp) => !cache[fp]);
  console.log(`desc images total=${allPaths.length}, cached=${allPaths.length - todo.length}, to upload=${todo.length}`);
  if (todo.length === 0) { console.log('nothing to upload'); return; }

  let done = 0;
  let failures = 0;
  let idx = 0;
  const SAVE_EVERY = 50;

  async function saveCache() {
    fs.writeFileSync(DESC_CACHE_PATH, JSON.stringify(cache, null, 2));
  }

  async function worker() {
    while (idx < todo.length) {
      const i = idx++;
      const fp = todo[i];
      try {
        const oss = await withRetry(() => uploadFile(fp), 3);
        cache[fp] = oss;
        done++;
        if (done % SAVE_EVERY === 0) { saveCache(); console.log(`  uploaded ${done}/${todo.length}`); }
      } catch (e) {
        failures++;
        console.error(`  FAIL ${path.basename(path.dirname(fp))}/${path.basename(fp)} -> ${e.message}`);
      }
    }
  }

  const start = Date.now();
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, todo.length) }, worker));
  saveCache();
  const secs = ((Date.now() - start) / 1000).toFixed(0);
  console.log(`upload done: ok=${done}, failed=${failures}, ${secs}s`);
}

async function phaseUpdate() {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  const catMap = loadJson(CAT_MAP_PATH, {});
  const imgCache = loadJson(IMG_CACHE_PATH, {});
  const descCache = loadJson(DESC_CACHE_PATH, {});
  const results = loadJson(RESULTS_PATH, []);

  if (products.length !== results.length) {
    console.error('mismatch: products=%d results=%d', products.length, results.length);
    process.exit(1);
  }

  const out = [];
  let ok = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const productId = results[i] && results[i].productId;
    if (!productId) { out.push({ cat: p.cat, name: p.name, status: 'skip', reason: 'no productId' }); console.error('  SKIP (no productId)', p.cat, p.name); continue; }

    const descPaths = descFilesOf(p.mainImage);
    const urls = descPaths.map((fp) => descCache[fp]);
    const missing = urls.filter((u) => !u).length;
    if (missing > 0) { out.push({ cat: p.cat, name: p.name, status: 'skip', reason: `missing ${missing} desc images` }); console.error(`  SKIP (${missing} missing desc)`, p.cat, p.name); continue; }

    const detailHtml = urls.map((u) => `<img src="${u}" style="width:100%;" />`).join('\n');
    const mainOss = imgCache[p.mainImage];
    const payload = {
      productId: Number(productId),
      categoryId: catMap[p.cat],
      productName: p.name,
      description: p.description,
      detailHtml,
      mainImage: mainOss,
      images: JSON.stringify([mainOss]),
      memberOnly: p.memberOnly,
      sortOrder: p.sortOrder,
      status: 1,
    };
    try {
      const { data } = await jsonFetch('/admin/pinball/shop/product/save', payload);
      if (data.code === 200) {
        out.push({ cat: p.cat, name: p.name, productId, descCount: descPaths.length, status: 'ok' });
        ok++;
        console.log(`  OK (${i + 1}/${products.length}) ${p.cat}/${p.name} [${descPaths.length}张详情图]`);
      } else {
        out.push({ cat: p.cat, name: p.name, productId, status: 'fail', message: data.message });
        console.error(`  FAIL ${p.cat}/${p.name} -> ${data.message}`);
      }
    } catch (e) {
      out.push({ cat: p.cat, name: p.name, productId, status: 'error', message: String(e.message || e) });
      console.error(`  ERR ${p.cat}/${p.name} -> ${e.message}`);
    }
  }

  fs.writeFileSync(DETAIL_RESULTS_PATH, JSON.stringify(out, null, 2));
  console.log(`\nDONE: ok=${ok}, total=${products.length}`);
  console.log('results ->', DETAIL_RESULTS_PATH);
}

(async () => {
  if (!TOKEN) { console.error('missing TOKEN env'); process.exit(1); }
  const uploadOnly = process.argv.includes('--upload');
  const updateOnly = process.argv.includes('--update');
  if (updateOnly) { await phaseUpdate(); return; }
  if (uploadOnly) { await phaseUpload(); return; }
  await phaseUpload();
  await phaseUpdate();
})();
