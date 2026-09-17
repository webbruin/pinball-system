// Shorten product names: take the first whitespace-delimited segment as the
// name, move the remainder into description. Re-saves each product (edit mode).
// Usage: TOKEN=... node scripts/update-product-names.cjs
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'https://www.bingobangai.com/prod-api';
const TOKEN = process.env.TOKEN || '';
const CATEGORY_ID = Number(process.env.CATEGORY_ID || 3);

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const PRODUCTS_PATH = path.join(DATA_DIR, 'products-save.json');
const RESULTS_PATH = path.join(DATA_DIR, 'upload-results.json');
const CACHE_PATH = path.join(DATA_DIR, '.oss-url-cache.json');
const UPDATE_RESULTS_PATH = path.join(DATA_DIR, 'update-name-results.json');

if (!TOKEN) { console.error('missing TOKEN env'); process.exit(1); }

function base(url) {
  const m = url.match(/^(.+?\.(?:jpg|png|jpeg))/i);
  return m ? m[1] : url;
}

function splitName(title) {
  const idx = title.search(/\s/);
  if (idx === -1) return { name: title, desc: '' };
  return { name: title.slice(0, idx), desc: title.slice(idx).trim() };
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
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  const results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
  const cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));

  if (products.length !== results.length) {
    console.error('mismatch: products=%d, results=%d', products.length, results.length);
    process.exit(1);
  }

  const out = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const productId = Number(results[i].data);
    const { name, desc } = splitName(p.productName);
    const imagesArr = JSON.parse(p.images || '[]').map((u) => cache[base(u)]);

    const payload = {
      productId,
      productName: name,
      categoryId: CATEGORY_ID,
      description: desc,
      mainImage: cache[base(p.mainImage)],
      images: JSON.stringify(imagesArr),
      detailHtml: imagesArr.map((u) => `<img src="${u}" style="width:100%;" />`).join('\n'),
      memberOnly: p.memberOnly ?? 0,
      sortOrder: p.sortOrder ?? 0,
      status: p.status ?? 1,
    };

    try {
      const { data } = await jsonFetch('/admin/pinball/shop/product/save', payload);
      if (data.code === 200) {
        out.push({ productId, productName: name, description: desc, status: 'ok' });
        console.log(`  OK  (${i + 1}/${products.length}) name="${name}"${desc ? ' desc="' + desc.slice(0, 40) + '..."' : ''}`);
      } else {
        out.push({ productId, productName: name, status: 'fail', message: data.message });
        console.error(`  FAIL (${i + 1}/${products.length}) ${name} -> ${data.message}`);
      }
    } catch (e) {
      out.push({ productId, productName: name, status: 'error', message: String(e.message || e) });
      console.error(`  ERR  (${i + 1}/${products.length}) ${name} -> ${e.message}`);
    }
  }

  fs.writeFileSync(UPDATE_RESULTS_PATH, JSON.stringify(out, null, 2));
  const ok = out.filter((r) => r.status === 'ok').length;
  console.log(`\nDONE: ok=${ok}, total=${products.length}`);
  console.log('results ->', UPDATE_RESULTS_PATH);
})();
