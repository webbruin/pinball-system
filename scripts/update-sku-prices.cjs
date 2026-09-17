// Set SKU price (积分) = ceil(products.json price * 10).
// Fetches each product's SKU via sku/list, then re-saves with the new price.
// Usage: TOKEN=... node scripts/update-sku-prices.cjs
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'https://www.bingobangai.com/prod-api';
const TOKEN = process.env.TOKEN || '';

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const SRC_PATH = path.join(DATA_DIR, 'products.json');
const RESULTS_PATH = path.join(DATA_DIR, 'upload-results.json');
const UPDATE_RESULTS_PATH = path.join(DATA_DIR, 'update-sku-price-results.json');

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
  const src = JSON.parse(fs.readFileSync(SRC_PATH, 'utf8'));
  const results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));

  if (src.length !== results.length) {
    console.error('mismatch: src=%d, results=%d', src.length, results.length);
    process.exit(1);
  }

  const out = [];
  for (let i = 0; i < src.length; i++) {
    const productId = Number(results[i].data);
    const price = parseFloat(String(src[i].price || '').replace(/[^\d.]/g, ''));
    const points = Math.max(1, Math.round(price * 10));

    try {
      const listRes = await jsonFetch('/admin/pinball/shop/product/sku/list', { productId });
      if (listRes.data.code !== 200 || !Array.isArray(listRes.data.data) || !listRes.data.data.length) {
        out.push({ productId, status: 'fail', message: 'sku not found' });
        console.error(`  FAIL ${productId} -> sku not found`);
        continue;
      }
      const sku = listRes.data.data[0];
      const payload = {
        skuId: sku.skuId,
        productId,
        skuName: sku.skuName,
        skuAttrs: sku.skuAttrs || '[]',
        pointType: sku.pointType ?? 0,
        price: points,
        stock: sku.stock,
        image: sku.image || '',
        status: sku.status ?? 1,
      };
      const saveRes = await jsonFetch('/admin/pinball/shop/product/sku/save', payload);
      if (saveRes.data.code === 200) {
        out.push({ productId, price: points, status: 'ok' });
        console.log(`  OK  ${productId}  ¥${price} -> ${points} 积分`);
      } else {
        out.push({ productId, status: 'fail', message: saveRes.data.message });
        console.error(`  FAIL ${productId} -> ${saveRes.data.message}`);
      }
    } catch (e) {
      out.push({ productId, status: 'error', message: String(e.message || e) });
      console.error(`  ERR  ${productId} -> ${e.message}`);
    }
  }

  fs.writeFileSync(UPDATE_RESULTS_PATH, JSON.stringify(out, null, 2));
  const ok = out.filter((r) => r.status === 'ok').length;
  console.log(`\nDONE: ok=${ok}, total=${src.length}`);
  console.log('results ->', UPDATE_RESULTS_PATH);
})();
