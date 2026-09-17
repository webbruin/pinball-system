// Set concise, hand-written names for the 11 no-space titles; move the full
// original title into description. Re-saves each product (edit mode).
// Usage: TOKEN=... node scripts/update-remaining-names.cjs
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'https://www.bingobangai.com/prod-api';
const TOKEN = process.env.TOKEN || '';
const CATEGORY_ID = Number(process.env.CATEGORY_ID || 3);

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const PRODUCTS_PATH = path.join(DATA_DIR, 'products-save.json');
const RESULTS_PATH = path.join(DATA_DIR, 'upload-results.json');
const CACHE_PATH = path.join(DATA_DIR, '.oss-url-cache.json');
const UPDATE_RESULTS_PATH = path.join(DATA_DIR, 'update-remaining-name-results.json');

// productId -> concise name (original title goes into description)
const renames = {
  109: '仿真假鸡蛋壳引蛋玩具',
  110: '哪吒迷你小厨房',
  111: '喷雾吸水瓶玩具',
  113: '泡水膨胀恐龙蛋',
  114: '1:12迷你红酒杯',
  115: '彩色火焰粉魔术玩具',
  116: '仿真恐龙孵化蛋',
  118: '八大行星PU球',
  119: '迷你仿真筷子食玩',
  120: '磁力方块积木',
  121: '儿童过家家烧烤炉',
};

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
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  const results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
  const cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));

  const out = [];
  for (let i = 0; i < products.length; i++) {
    const productId = Number(results[i].data);
    if (!(productId in renames)) continue;

    const p = products[i];
    const name = renames[productId];
    const desc = p.productName; // full original title
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
        console.log(`  OK  ${productId} "${name}"`);
      } else {
        out.push({ productId, productName: name, status: 'fail', message: data.message });
        console.error(`  FAIL ${productId} ${name} -> ${data.message}`);
      }
    } catch (e) {
      out.push({ productId, productName: name, status: 'error', message: String(e.message || e) });
      console.error(`  ERR  ${productId} ${name} -> ${e.message}`);
    }
  }

  fs.writeFileSync(UPDATE_RESULTS_PATH, JSON.stringify(out, null, 2));
  console.log(`\nDONE: updated=${out.length}`);
  console.log('results ->', UPDATE_RESULTS_PATH);
})();
