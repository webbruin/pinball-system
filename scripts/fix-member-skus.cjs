// Fix member-only products whose SKU failed: re-create SKU with pointType=1 (会员积分).
// Usage: TOKEN=... node scripts/fix-member-skus.cjs
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'https://www.bingobangai.com/prod-api';
const TOKEN = process.env.TOKEN || '';

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const PRODUCTS_PATH = path.join(DATA_DIR, 'products-final.json');
const IMG_CACHE_PATH = path.join(DATA_DIR, '.shop-img-cache.json');
const RESULTS_PATH = path.join(DATA_DIR, 'shop-upload-results.json');

if (!TOKEN) { console.error('missing TOKEN env'); process.exit(1); }

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
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  const results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
  const imgCache = JSON.parse(fs.readFileSync(IMG_CACHE_PATH, 'utf8'));

  if (products.length !== results.length) {
    console.error('mismatch: products=%d, results=%d', products.length, results.length);
    process.exit(1);
  }

  let fixed = 0;
  for (let i = 0; i < products.length; i++) {
    if (results[i].status !== 'sku-fail') continue;
    const p = products[i];
    const productId = results[i].productId;
    const image = imgCache[p.mainImage];
    if (!productId || !image) {
      console.error('  skip (missing productId/image)', p.cat, p.name, results[i]);
      continue;
    }
    const payload = {
      productId: Number(productId),
      skuName: '默认规格',
      skuAttrs: '[]',
      pointType: 1,
      price: p.points,
      stock: 100,
      image,
      status: 1,
    };
    try {
      const { data } = await jsonFetch('/admin/pinball/shop/product/sku/save', payload);
      if (data.code === 200) {
        results[i].status = 'ok';
        results[i].skuId = data.data;
        results[i].pointType = 1;
        fixed++;
        console.log(`  FIXED ${p.cat}/${p.name} [${p.points}分, 会员积分]`);
      } else {
        results[i].message = data.message;
        console.error(`  FAIL ${p.cat}/${p.name} -> ${data.message}`);
      }
    } catch (e) {
      results[i].message = String(e.message || e);
      console.error(`  ERR ${p.cat}/${p.name} -> ${e.message}`);
    }
  }

  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
  console.log(`\nDONE: fixed=${fixed}`);
})();
