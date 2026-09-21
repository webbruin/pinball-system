// Cap each product at 10 images (main + first 9 detail images).
// Rewrites `images` and `detailHtml`; excess OSS files remain on the CDN but are no longer referenced.
// Usage: TOKEN=... node scripts/limit-images.cjs
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'https://www.bingobangai.com/prod-api';
const TOKEN = process.env.TOKEN || '';
const MAX_DESC = 9; // main + 9 desc = 10 images total

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const PRODUCTS_PATH = path.join(DATA_DIR, 'products-final.json');
const CAT_MAP_PATH = path.join(DATA_DIR, '.shop-categories.json');
const IMG_CACHE_PATH = path.join(DATA_DIR, '.shop-img-cache.json');
const DESC_CACHE_PATH = path.join(DATA_DIR, '.shop-desc-cache.json');
const RESULTS_PATH = path.join(DATA_DIR, 'shop-upload-results.json');
const OUT_PATH = path.join(DATA_DIR, 'shop-limit-results.json');

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

function descFilesOf(mainImagePath) {
  const dir = path.dirname(mainImagePath);
  const files = fs.readdirSync(dir).filter((f) => /^desc_\d+\.(jpg|jpeg|png|webp|gif)$/i.test(f));
  files.sort((a, b) => parseInt(a.match(/desc_(\d+)/i)[1], 10) - parseInt(b.match(/desc_(\d+)/i)[1], 10));
  return files.map((f) => path.join(dir, f));
}

(async () => {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  const catMap = JSON.parse(fs.readFileSync(CAT_MAP_PATH, 'utf8'));
  const imgCache = JSON.parse(fs.readFileSync(IMG_CACHE_PATH, 'utf8'));
  const descCache = JSON.parse(fs.readFileSync(DESC_CACHE_PATH, 'utf8'));
  const results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));

  if (products.length !== results.length) {
    console.error('mismatch: products=%d results=%d', products.length, results.length);
    process.exit(1);
  }

  const out = [];
  let ok = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const productId = results[i] && results[i].productId;
    if (!productId) { out.push({ cat: p.cat, name: p.name, status: 'skip', reason: 'no productId' }); continue; }

    const mainOss = imgCache[p.mainImage];
    const descOss = descFilesOf(p.mainImage).slice(0, MAX_DESC).map((fp) => descCache[fp]);
    if (!mainOss || descOss.some((u) => !u)) {
      out.push({ cat: p.cat, name: p.name, status: 'skip', reason: 'missing image url' });
      console.error(`  SKIP ${p.cat}/${p.name} (missing url)`);
      continue;
    }

    const images = [mainOss, ...descOss];
    const detailHtml = descOss.map((u) => `<img src="${u}" style="width:100%;" />`).join('\n');

    const payload = {
      productId: Number(productId),
      categoryId: catMap[p.cat],
      productName: p.name,
      description: p.description,
      detailHtml,
      mainImage: mainOss,
      images: JSON.stringify(images),
      memberOnly: p.memberOnly,
      sortOrder: p.sortOrder,
      status: 1,
    };
    try {
      const { data } = await jsonFetch('/admin/pinball/shop/product/save', payload);
      if (data.code === 200) {
        out.push({ cat: p.cat, name: p.name, productId, images: images.length, status: 'ok' });
        ok++;
        console.log(`  OK (${i + 1}/${products.length}) ${p.cat}/${p.name} [${images.length}张图]`);
      } else {
        out.push({ cat: p.cat, name: p.name, productId, status: 'fail', message: data.message });
        console.error(`  FAIL ${p.cat}/${p.name} -> ${data.message}`);
      }
    } catch (e) {
      out.push({ cat: p.cat, name: p.name, productId, status: 'error', message: String(e.message || e) });
      console.error(`  ERR ${p.cat}/${p.name} -> ${e.message}`);
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`\nDONE: ok=${ok}, total=${products.length}`);
})();
