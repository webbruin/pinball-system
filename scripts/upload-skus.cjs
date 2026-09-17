// Upload SKUs, binding each to the productId returned by the product upload.
// Usage: TOKEN=... node scripts/upload-skus.cjs
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'https://www.bingobangai.com/prod-api';
const TOKEN = process.env.TOKEN || '';

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const SKUS_PATH = path.join(DATA_DIR, 'skus-save.json');
const RESULTS_PATH = path.join(DATA_DIR, 'upload-results.json');
const CACHE_PATH = path.join(DATA_DIR, '.oss-url-cache.json');
const SKU_RESULTS_PATH = path.join(DATA_DIR, 'sku-upload-results.json');

if (!TOKEN) { console.error('missing TOKEN env'); process.exit(1); }

function base(url) {
  const m = url.match(/^(.+?\.(?:jpg|png|jpeg))/i);
  return m ? m[1] : url;
}

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

(async () => {
  const skus = JSON.parse(fs.readFileSync(SKUS_PATH, 'utf8'));
  const results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
  const cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));

  if (skus.length !== results.length) {
    console.error('mismatch: skus=%d, product results=%d', skus.length, results.length);
    process.exit(1);
  }

  const out = [];
  for (let i = 0; i < skus.length; i++) {
    const s = skus[i];
    const productId = results[i].data;
    const payload = {
      productId: Number(productId),
      skuName: s.skuName,
      skuAttrs: s.skuAttrs || '[]',
      pointType: s.pointType ?? 0,
      price: s.price,
      stock: s.stock,
      image: cache[base(s.image)] || s.image,
      status: s.status ?? 1,
    };
    try {
      const { data } = await jsonFetch('/admin/pinball/shop/product/sku/save', payload);
      if (data.code === 200) {
        out.push({ productId: payload.productId, productName: s._productName, status: 'ok' });
        console.log(`  OK  (${i + 1}/${skus.length}) ${s._productName}`);
      } else {
        out.push({ productId: payload.productId, productName: s._productName, status: 'fail', message: data.message });
        console.error(`  FAIL (${i + 1}/${skus.length}) ${s._productName} -> ${data.message}`);
      }
    } catch (e) {
      out.push({ productId: payload.productId, productName: s._productName, status: 'error', message: String(e.message || e) });
      console.error(`  ERR  (${i + 1}/${skus.length}) ${s._productName} -> ${e.message}`);
    }
  }

  fs.writeFileSync(SKU_RESULTS_PATH, JSON.stringify(out, null, 2));
  const ok = out.filter((r) => r.status === 'ok').length;
  console.log(`\nDONE: skus ok=${ok}, total=${skus.length}`);
  console.log('results ->', SKU_RESULTS_PATH);
})();
