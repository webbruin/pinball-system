// Upload the 9 generated category icons and set each category's `icon` field.
// Usage: TOKEN=... node scripts/upload-icons.cjs
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'https://www.bingobangai.com/prod-api';
const TOKEN = process.env.TOKEN || '';

const ICON_DIR = '/tmp/category-icons';
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const CAT_MAP_PATH = path.join(DATA_DIR, '.shop-categories.json');
const ICON_CACHE_PATH = path.join(DATA_DIR, '.shop-icon-cache.json');

const ORDER = ['中外名酒', '休闲食品', '外设产品', '学习用品', '床上用品', '户外装备', '玩具潮玩', '生活日用', '粮油调味'];

async function jsonFetch(apiPath, body) {
  const res = await fetch(BASE + apiPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', token: TOKEN },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { status: res.status, data };
}

async function uploadIcon(name) {
  const filePath = path.join(ICON_DIR, `${name}.png`);
  const buf = fs.readFileSync(filePath);
  const filename = `category_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
  const form = new FormData();
  form.append('file', new Blob([buf], { type: 'image/png' }), filename);
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

(async () => {
  if (!TOKEN) { console.error('missing TOKEN env'); process.exit(1); }

  const catMap = JSON.parse(fs.readFileSync(CAT_MAP_PATH, 'utf8'));

  // Fetch current categories to preserve name/sortOrder/status.
  const { data: listResp } = await jsonFetch('/admin/pinball/shop/category/list');
  const catList = (listResp && listResp.data) || listResp || [];
  if (listResp && listResp.code !== undefined && listResp.code !== 200) {
    console.error('category list fail:', JSON.stringify(listResp).slice(0, 300));
    process.exit(1);
  }
  const byId = new Map(catList.map((c) => [Number(c.categoryId), c]));

  const cache = fs.existsSync(ICON_CACHE_PATH)
    ? JSON.parse(fs.readFileSync(ICON_CACHE_PATH, 'utf8'))
    : {};

  for (const name of ORDER) {
    const categoryId = Number(catMap[name]);
    if (!categoryId) { console.error(`  no categoryId for ${name}`); continue; }

    let iconUrl = cache[name];
    if (!iconUrl) {
      try {
        iconUrl = await uploadIcon(name);
        cache[name] = iconUrl;
        fs.writeFileSync(ICON_CACHE_PATH, JSON.stringify(cache, null, 2));
        console.log(`  uploaded ${name} -> ${iconUrl}`);
      } catch (e) {
        console.error(`  UPLOAD FAIL ${name} -> ${e.message}`);
        continue;
      }
    } else {
      console.log(`  cached ${name} -> ${iconUrl}`);
    }

    const cat = byId.get(categoryId);
    if (!cat) { console.error(`  category ${categoryId} not found for ${name}`); continue; }

    const payload = {
      categoryId: Number(categoryId),
      categoryName: cat.categoryName || name,
      icon: iconUrl,
      sortOrder: cat.sortOrder ?? 0,
      status: cat.status ?? 1,
    };
    try {
      const { data } = await jsonFetch('/admin/pinball/shop/category/save', payload);
      if (data.code === 200) {
        console.log(`  OK ${name} icon set`);
      } else {
        console.error(`  SAVE FAIL ${name} -> ${JSON.stringify(data).slice(0, 200)}`);
      }
    } catch (e) {
      console.error(`  SAVE ERR ${name} -> ${e.message}`);
    }
  }

  console.log('DONE');
})();
