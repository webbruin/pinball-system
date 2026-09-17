// Upload products to the backend, re-uploading images to OSS first.
// Usage:
//   TOKEN=... node scripts/upload-products.cjs --smoke   # auth check + 1 image upload
//   TOKEN=... node scripts/upload-products.cjs           # full run (resumable)
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'https://www.bingobangai.com/prod-api';
const TOKEN = process.env.TOKEN || '';
const CATEGORY_ID = Number(process.env.CATEGORY_ID || 3);
const CONCURRENCY = Number(process.env.CONCURRENCY || 4);

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const PRODUCTS_PATH = path.join(DATA_DIR, 'products-save.json');
const CACHE_PATH = path.join(DATA_DIR, '.oss-url-cache.json');
const RESULTS_PATH = path.join(DATA_DIR, 'upload-results.json');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function jsonFetch(apiPath, body, isForm = false) {
  const headers = { token: TOKEN };
  let payload = body;
  if (!isForm) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(BASE + apiPath, { method: 'POST', headers, body: payload });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { status: res.status, data };
}

function sniff(buf) {
  if (buf.length > 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return { mime: 'image/jpeg', ext: 'jpg' };
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return { mime: 'image/png', ext: 'png' };
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return { mime: 'image/webp', ext: 'webp' };
  if (buf.length > 4 && buf.toString('ascii', 0, 4) === 'GIF8') return { mime: 'image/gif', ext: 'gif' };
  return { mime: 'application/octet-stream', ext: 'bin' };
}

// alicdn URLs end with resize/format suffixes (e.g. `_460x460q100.jpg_.webp`).
// Strip to the original `<hash>.jpg|png` so we get a JPEG/PNG (upload rejects webp).
function base(url) {
  const m = url.match(/^(.+?\.(?:jpg|png|jpeg))/i);
  return m ? m[1] : url;
}

async function download(url) {
  const res = await fetch(base(url), {
    headers: { 'User-Agent': UA, Referer: 'https://detail.1688.com/' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadImage(buf) {
  const { mime, ext } = sniff(buf);
  const filename = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const form = new FormData();
  form.append('file', new Blob([buf], { type: mime }), filename);
  const res = await fetch(BASE + '/admin/pinball/file/upload', {
    method: 'POST',
    headers: { token: TOKEN },
    body: form,
    signal: AbortSignal.timeout(30000),
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

// ---------- smoke test ----------
async function smoke() {
  console.log('BASE =', BASE);
  console.log('smoke: auth check via category/list ...');
  const cat = await jsonFetch('/admin/pinball/shop/category/list', { status: 1 });
  console.log('  category/list ->', cat.status, JSON.stringify(cat.data).slice(0, 200));
  if (cat.data.code !== 200) {
    console.error('AUTH FAILED: token invalid or wrong env.');
    process.exit(2);
  }

  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  const firstUrl = products[0].mainImage;
  console.log('smoke: download + upload one image:', firstUrl);
  const buf = await download(firstUrl);
  console.log('  downloaded', buf.length, 'bytes, type', sniff(buf));
  const oss = await uploadImage(buf);
  console.log('  uploaded ->', oss);
  console.log('SMOKE OK');
}

// ---------- full run ----------
async function full() {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  const cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')) : {};

  // collect unique URLs (mainImage + images), keyed by stripped base URL
  const urlSet = new Set();
  for (const p of products) {
    urlSet.add(base(p.mainImage));
    for (const u of JSON.parse(p.images || '[]')) urlSet.add(base(u));
  }
  const urls = [...urlSet];
  const todo = urls.filter((u) => !cache[u]);
  console.log(`images total=${urls.length}, already cached=${urls.length - todo.length}, to upload=${todo.length}`);

  let uploaded = 0;
  const failures = [];
  await pool(todo, async (url) => {
    try {
      const oss = await withRetry(async () => {
        const buf = await withRetry(() => download(url), 2);
        return uploadImage(buf);
      }, 3);
      cache[url] = oss;
      fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
      uploaded++;
      if (uploaded % 10 === 0) console.log(`  uploaded ${uploaded}/${todo.length}`);
      return oss;
    } catch (e) {
      failures.push({ url, error: String(e.message || e).slice(0, 300) });
      console.error('  FAIL', url, '->', e.message);
      return null;
    }
  }, CONCURRENCY);

  console.log(`upload done: ok=${uploaded}, failed=${failures.length}`);
  if (failures.length) fs.writeFileSync(path.join(DATA_DIR, '.image-failures.json'), JSON.stringify(failures, null, 2));

  // save products
  const results = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const imagesArr = JSON.parse(p.images || '[]').map((u) => cache[base(u)]);
    if (imagesArr.some((u) => !u)) {
      results.push({ productName: p.productName, status: 'skipped', reason: 'image missing' });
      console.error('  SKIP (missing image)', p.productName);
      continue;
    }
    const payload = {
      productName: p.productName,
      categoryId: CATEGORY_ID,
      description: p.description || '',
      mainImage: cache[base(p.mainImage)],
      images: JSON.stringify(imagesArr),
      detailHtml: imagesArr.map((u) => `<img src="${u}" style="width:100%;" />`).join('\n'),
      memberOnly: p.memberOnly ?? 0,
      sortOrder: p.sortOrder ?? 0,
      status: p.status ?? 1,
    };
    try {
      const { status, data } = await jsonFetch('/admin/pinball/shop/product/save', payload);
      if (data.code === 200) {
        results.push({ productName: p.productName, status: 'ok', data: data.data });
        console.log(`  OK  (${i + 1}/${products.length}) ${p.productName}`);
      } else {
        results.push({ productName: p.productName, status: 'fail', message: data.message });
        console.error(`  FAIL (${i + 1}/${products.length}) ${p.productName} -> ${data.message}`);
      }
    } catch (e) {
      results.push({ productName: p.productName, status: 'error', message: String(e.message || e) });
      console.error(`  ERR  (${i + 1}/${products.length}) ${p.productName} -> ${e.message}`);
    }
  }

  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
  const ok = results.filter((r) => r.status === 'ok').length;
  console.log(`\nDONE: products ok=${ok}, total=${products.length}`);
  console.log('results ->', RESULTS_PATH);
}

(async () => {
  if (!TOKEN) { console.error('missing TOKEN env'); process.exit(1); }
  if (process.argv.includes('--smoke')) return smoke();
  await full();
})();
