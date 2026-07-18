<template>
  <div>
    <van-nav-bar title="商品管理">
      <template #right>
        <van-button type="primary" plain size="small" icon="plus" @click="openAdd">新增</van-button>
      </template>
    </van-nav-bar>

    <div class="page-scroll">
      <!-- 搜索 + 筛选 -->
      <div class="search-row">
        <van-search v-model="params.productName" placeholder="搜索商品..." shape="round" background="#f5f6fa" @search="onSearch" />
      </div>
      <div class="filter-row">
        <div class="filter-chip" @click="showFilterCat = true">
          <span>{{ filterCatLabel }}</span>
          <van-icon name="arrow-down" size="12" />
        </div>
        <div class="filter-chip" @click="showFilterStatus = true">
          <span>{{ filterStatusLabel }}</span>
          <van-icon name="arrow-down" size="12" />
        </div>
      </div>

      <!-- 商品列表 -->
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div style="margin-top:8px">
          <div class="product-card" v-for="item in products" :key="item.productId">
            <van-swipe-cell>
              <div class="product-content">
                <div class="product-img-wrap">
                  <img v-if="item.mainImage" :src="item.mainImage" class="product-img" />
                  <van-icon v-else name="photo-o" size="32" color="#ccc" />
                </div>
                <div class="product-info">
                  <div class="product-name">{{ item.productName }}</div>
                  <div class="product-meta">
                    <van-tag size="small" type="primary" plain>{{ getCategoryName(item.categoryId) }}</van-tag>
                    <span class="meta-text" v-if="item.memberOnly === 1">
                      <van-icon name="vip-card-o" size="12" /> 会员专属
                    </span>
                  </div>
                  <div class="product-price" v-if="item.minSkuPrice !== undefined">
                    <span class="price-val">{{ item.minSkuPrice }}</span>
                    <span class="price-unit">{{ item.minSkuPointType === 0 ? '积分卡' : '会员积分' }}</span>
                  </div>
                </div>
                <div class="product-status">
                  <van-switch v-model="item.status" :active-value="1" :inactive-value="0" size="20px" @change="toggleStatus(item)" />
                </div>
              </div>
              <template #right>
                <van-button square type="danger" text="删除" @click="removeProduct(item.productId)" style="height:100%" />
              </template>
            </van-swipe-cell>
            <div class="product-actions">
              <van-button plain icon="edit" size="small" @click="openEdit(item)">编辑</van-button>
              <van-button plain icon="orders-o" size="small" @click="openSku(item)">规格管理</van-button>
            </div>
          </div>
          <van-empty v-if="!products.length && !loading" description="暂无商品数据" style="padding-top:40px" />
        </div>
      </van-list>
    </div>

    <!-- 新增/编辑商品弹窗 -->
    <van-popup v-model:show="showModal" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar :title="form.productId ? '编辑商品' : '添加商品'" right-text="关闭" @click-right="showModal = false" />
        <van-form @submit="save" style="padding:0 4px">
          <van-cell-group inset>
            <van-field
              v-model="form.productName"
              label="商品名称"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写商品名称' }]"
            />
            <van-field
              v-model="selectedCategory"
              is-link
              label="商品分类"
              placeholder="请选择"
              :readonly="true"
              :rules="[{ required: true, message: '请选择分类' }]"
              @click="showCatPicker = true"
            />
            <van-field
              v-model="form.description"
              label="商品简介"
              placeholder="请输入"
              type="textarea"
              rows="2"
              autosize
            />
            <div class="upload-field">
              <span class="upload-label">商品主图</span>
              <van-uploader
                v-model="mainImageList"
                :max-count="1"
                :after-read="onMainImageRead"
                :preview-full-image="false"
              />
            </div>
            <div class="upload-field">
              <span class="upload-label">商品图片</span>
              <van-uploader
                v-model="imagesList"
                :max-count="6"
                :after-read="onImagesRead"
                :preview-full-image="false"
              />
            </div>
            <van-field name="memberOnly" label="会员专属">
              <template #input>
                <van-radio-group direction="horizontal" v-model="form.memberOnly">
                  <van-radio :name="0">否</van-radio>
                  <van-radio :name="1">是</van-radio>
                </van-radio-group>
              </template>
            </van-field>
            <van-field
              v-model="form.sortOrder"
              type="number"
              label="排序序号"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写排序序号' }]"
            />
            <van-field name="status" label="状态">
              <template #input>
                <van-radio-group direction="horizontal" v-model="form.status">
                  <van-radio :name="1">上架</van-radio>
                  <van-radio :name="0">下架</van-radio>
                </van-radio-group>
              </template>
            </van-field>
            <van-field
              v-model="form.detailHtml"
              label="商品详情"
              placeholder="富文本HTML（选填）"
              type="textarea"
              rows="4"
              autosize
            />
          </van-cell-group>
          <div style="padding:16px">
            <van-button type="primary" native-type="submit" block :loading="submitLoading">
              {{ form.productId ? '保存修改' : '添加商品' }}
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 分类选择器（表单用） -->
    <van-popup v-model:show="showCatPicker" round position="bottom">
      <van-picker
        :columns="categoryColumns"
        :columns-field-names="{ text: 'categoryName', value: 'categoryId' }"
        show-toolbar
        title="选择分类"
        @confirm="onCatConfirm"
        @cancel="showCatPicker = false"
      />
    </van-popup>

    <!-- 分类筛选弹窗 -->
    <van-popup v-model:show="showFilterCat" round position="bottom">
      <van-picker
        :columns="categoryOpts"
        show-toolbar
        title="筛选分类"
        @confirm="onFilterCatConfirm"
        @cancel="showFilterCat = false"
      />
    </van-popup>

    <!-- 状态筛选弹窗 -->
    <van-popup v-model:show="showFilterStatus" round position="bottom">
      <van-picker
        :columns="statusOpts"
        show-toolbar
        title="筛选状态"
        @confirm="onFilterStatusConfirm"
        @cancel="showFilterStatus = false"
      />
    </van-popup>

    <!-- SKU 规格管理弹窗 -->
    <van-popup v-model:show="showSkuModal" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar title="规格管理" right-text="关闭" @click-right="showSkuModal = false" />
        <div style="padding:0 16px 8px">
          <div class="sku-product-name">{{ skuProductName }}</div>
          <van-button type="primary" size="small" icon="plus" @click="openSkuAdd">新增规格</van-button>
        </div>
        <div class="sku-list" v-if="skus.length">
          <div class="sku-card" v-for="item in skus" :key="item.skuId">
            <div class="sku-header">
              <div class="sku-img-wrap" v-if="item.image">
                <img :src="item.image" class="sku-img" />
              </div>
              <div class="sku-info">
                <div class="sku-name">{{ item.skuName }}</div>
                <div class="sku-meta">
                  <span>{{ item.pointType === 0 ? '积分卡' : '会员积分' }} × {{ item.price }}</span>
                  <span>库存: {{ item.stock }}</span>
                </div>
              </div>
              <van-switch v-model="item.status" :active-value="1" :inactive-value="0" size="18px" @change="toggleSkuStatus(item)" />
            </div>
            <div class="sku-actions">
              <van-button plain icon="edit" size="small" style="flex:1" @click="openSkuEdit(item)">编辑</van-button>
              <van-button plain icon="delete-o" size="small" color="#EF4444" style="flex:1" @click="removeSku(item.skuId)">删除</van-button>
            </div>
          </div>
        </div>
        <van-empty v-else description="暂无规格" style="padding-top:20px" />
      </div>
    </van-popup>

    <!-- SKU 新增/编辑弹窗 -->
    <van-popup v-model:show="showSkuForm" round position="bottom" :style="{ maxHeight: '85%' }">
      <div class="popup-wrap">
        <van-nav-bar :title="skuForm.skuId ? '编辑规格' : '新增规格'" right-text="关闭" @click-right="showSkuForm = false" />
        <van-form @submit="saveSku" style="padding:0 4px">
          <van-cell-group inset>
            <van-field
              v-model="skuForm.skuName"
              label="规格名称"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写规格名称' }]"
            />
            <van-field
              v-model="skuForm.skuAttrs"
              label="规格属性"
              placeholder='JSON格式，如 [{"key":"颜色","value":"红色"}]'
              type="textarea"
              rows="2"
            />
            <van-field name="pointType" label="支付方式">
              <template #input>
                <van-radio-group direction="horizontal" v-model="skuForm.pointType">
                  <van-radio :name="0">积分卡</van-radio>
                  <van-radio :name="1">会员积分</van-radio>
                </van-radio-group>
              </template>
            </van-field>
            <van-field
              v-model="skuForm.price"
              type="number"
              label="兑换积分"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写所需积分' }]"
            />
            <van-field
              v-model="skuForm.stock"
              type="number"
              label="库存数量"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写库存数量' }]"
            />
            <div class="upload-field">
              <span class="upload-label">规格配图</span>
              <van-uploader
                v-model="skuImageList"
                :max-count="1"
                :after-read="onSkuImageRead"
                :preview-full-image="false"
              />
            </div>
            <van-field name="status" label="状态">
              <template #input>
                <van-radio-group direction="horizontal" v-model="skuForm.status">
                  <van-radio :name="1">启用</van-radio>
                  <van-radio :name="0">禁用</van-radio>
                </van-radio-group>
              </template>
            </van-field>
          </van-cell-group>
          <div style="padding:16px">
            <van-button type="primary" native-type="submit" block :loading="skuSubmitLoading">
              {{ skuForm.skuId ? '保存修改' : '添加规格' }}
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, computed } from 'vue'
import { showConfirmDialog, showToast, showLoadingToast } from 'vant'
import { onUploadRead } from '../utils/upload'

// --- 查询参数 ---
const params = ref({
  current: 1,
  pageSize: 20,
  categoryId: undefined,
  productName: '',
  status: undefined,
  sortField: [{ asc: true, column: '' }],
})

const statusOpts = [
  { text: '全部状态', value: undefined },
  { text: '上架', value: 1 },
  { text: '下架', value: 0 },
]

// --- 分类 ---
const categories = ref([])
const categoryOpts = ref([{ text: '全部分类', value: undefined }])
const categoryColumns = ref([])
const showCatPicker = ref(false)
const selectedCategory = ref('')
const showFilterCat = ref(false)
const showFilterStatus = ref(false)

const filterCatLabel = computed(() => {
  const found = categoryOpts.value.find(o => o.value === params.value.categoryId)
  return found ? `分类: ${found.text}` : '分类: 全部'
})
const filterStatusLabel = computed(() => {
  const found = statusOpts.find(o => o.value === params.value.status)
  return found ? `状态: ${found.text}` : '状态: 全部'
})

// --- 商品列表 ---
const products = ref([])
const loading = ref(false)
const finished = ref(false)
const total = ref(0)

// --- 商品表单 ---
const showModal = ref(false)
const submitLoading = ref(false)
const mainImageList = ref([])
const imagesList = ref([])

const form = reactive({
  productId: '',
  productName: '',
  categoryId: '',
  description: '',
  mainImage: '',
  images: '[]',
  memberOnly: 0,
  sortOrder: '',
  status: 1,
  detailHtml: '',
})

// --- SKU ---
const showSkuModal = ref(false)
const showSkuForm = ref(false)
const skus = ref([])
const skuProductName = ref('')
const skuProductId = ref('')
const skuSubmitLoading = ref(false)
const skuImageList = ref([])

const skuForm = reactive({
  skuId: '',
  productId: '',
  skuName: '',
  skuAttrs: '',
  pointType: 0,
  price: '',
  stock: '',
  image: '',
  status: 1,
})

// --- 初始化 ---
onMounted(() => {
  getCategories()
  // onLoad()
})

// 获取分类列表（用于筛选和选择器）
const getCategories = async () => {
  try {
    const res = await api.post('/admin/pinball/shop/category/list', { status: 1 })
    if (res.code === 200) {
      categories.value = res.data || []
      categoryColumns.value = res.data || []
      categoryOpts.value = [
        { text: '全部分类', value: undefined },
        ...categories.value.map(c => ({ text: c.categoryName, value: c.categoryId })),
      ]
    }
  } catch (e) { /* ignore */ }
}

function getCategoryName(categoryId) {
  const found = categories.value.find(c => c.categoryId === categoryId)
  return found ? found.categoryName : '-'
}

// --- 商品列表 ---
const getProducts = async (isRefresh) => {
  if (isRefresh) {
    params.value.current = 1
    products.value = []
    finished.value = false
    total.value = 0
  }
  try {
    const payload = { ...params.value }
    Object.keys(payload).forEach(k => {
      if (payload[k] === undefined || payload[k] === '') delete payload[k]
    })
    payload.sortField = (payload.sortField || []).filter(s => s.column)
    const res = await api.post('/admin/pinball/shop/product/page', payload)
    if (res.code === 200) {
      const list = res.data?.data || []
      total.value = res.data?.total || 0
      if (isRefresh) {
        products.value = list
      } else {
        products.value = [...products.value, ...list]
      }
      if (products.value.length >= total.value) {
        finished.value = true
      }
      params.value.current++
    } else {
      showToast(res.message)
    }
  } catch (e) {
    if (!isRefresh) showToast('系统错误')
  }
}

function onRefresh() {
  getProducts(true)
}

function onLoad() {
  getProducts(false).finally(() => {
    loading.value = false
  })
}

function onSearch() {
  onRefresh()
}

// 切换商品状态
const toggleStatus = async (item) => {
  try {
    const res = await api.post('/admin/pinball/shop/product/save', {
      productId: item.productId,
      productName: item.productName,
      categoryId: item.categoryId,
      description: item.description,
      mainImage: item.mainImage,
      images: item.images,
      memberOnly: item.memberOnly,
      sortOrder: item.sortOrder,
      status: item.status,
      detailHtml: item.detailHtml || '',
    })
    if (res.code !== 200) {
      item.status = item.status === 1 ? 0 : 1
      showToast(res.message)
    }
  } catch (e) {
    item.status = item.status === 1 ? 0 : 1
    showToast('系统错误')
  }
}

// --- 商品新增/编辑 ---
const createOrUpdate = async () => {
  try {
    submitLoading.value = true
    const res = await api.post('/admin/pinball/shop/product/save', form)
    submitLoading.value = false
    if (res.code === 200) {
      showModal.value = false
      onRefresh()
    } else {
      showToast(res.message)
    }
  } catch (e) {
    submitLoading.value = false
    showToast('系统错误')
  }
}

const deleteProduct = async (productId) => {
  try {
    const res = await api.post('/admin/pinball/shop/product/delete', { productId })
    if (res.code === 200) {
      onRefresh()
    } else {
      showToast(res.message)
    }
  } catch (e) {
    showToast('系统错误')
  }
}

function openAdd() {
  form.productId = ''
  form.productName = ''
  form.categoryId = ''
  form.description = ''
  form.mainImage = ''
  form.images = '[]'
  form.memberOnly = 0
  form.sortOrder = ''
  form.status = 1
  form.detailHtml = ''
  selectedCategory.value = ''
  mainImageList.value = []
  imagesList.value = []
  showModal.value = true
}

function openEdit(item) {
  form.productId = item.productId
  form.productName = item.productName
  form.categoryId = item.categoryId
  form.description = item.description || ''
  form.mainImage = item.mainImage || ''
  form.images = item.images || '[]'
  form.memberOnly = item.memberOnly ?? 0
  form.sortOrder = item.sortOrder ?? ''
  form.status = item.status
  form.detailHtml = item.detailHtml || ''
  selectedCategory.value = getCategoryName(item.categoryId)
  mainImageList.value = item.mainImage ? [{ url: item.mainImage }] : []
  const urls = parseImagesToList(item.images)
  imagesList.value = urls.map(u => ({ url: u }))
  showModal.value = true
}

function parseImagesToList(imagesJson) {
  try {
    return JSON.parse(imagesJson || '[]')
  } catch { return [] }
}

async function onMainImageRead(file) {
  const url = await onUploadRead(file)
  if (url) form.mainImage = url
}

async function onImagesRead(file) {
  const url = await onUploadRead(file)
  if (url) file.url = url
}

function save() {
  form.images = JSON.stringify(imagesList.value.map(f => f.url).filter(Boolean))
  createOrUpdate()
}

function removeProduct(productId) {
  showConfirmDialog({ message: '确认删除该商品吗' })
    .then(() => deleteProduct(productId))
    .catch(() => {})
}

function onCatConfirm({ selectedOptions }) {
  selectedCategory.value = selectedOptions[0].categoryName
  form.categoryId = selectedOptions[0].categoryId
  showCatPicker.value = false
}

function onFilterCatConfirm({ selectedOptions }) {
  params.value.categoryId = selectedOptions[0].value
  showFilterCat.value = false
  onSearch()
}

function onFilterStatusConfirm({ selectedOptions }) {
  params.value.status = selectedOptions[0].value
  showFilterStatus.value = false
  onSearch()
}

// --- SKU 管理 ---
function openSku(item) {
  skuProductId.value = item.productId
  skuProductName.value = item.productName
  showSkuModal.value = true
  getSkus()
}

const getSkus = async () => {
  const loading = showLoadingToast({ message: '加载中', forbidClick: true, duration: 0 })
  try {
    const res = await api.post('/admin/pinball/shop/product/sku/list', { productId: skuProductId.value })
    loading.close()
    if (res.code === 200) {
      skus.value = res.data || []
    } else {
      showToast(res.message)
    }
  } catch (e) {
    loading.close()
    showToast('系统错误')
  }
}

const toggleSkuStatus = async (item) => {
  try {
    const res = await api.post('/admin/pinball/shop/product/sku/save', {
      skuId: item.skuId,
      productId: item.productId,
      skuName: item.skuName,
      image: item.image || '',
      pointType: item.pointType,
      price: item.price,
      skuAttrs: item.skuAttrs || '',
      stock: item.stock,
      status: item.status,
    })
    if (res.code !== 200) {
      item.status = item.status === 1 ? 0 : 1
      showToast(res.message)
    }
  } catch (e) {
    item.status = item.status === 1 ? 0 : 1
    showToast('系统错误')
  }
}

const saveSkuFn = async () => {
  try {
    skuSubmitLoading.value = true
    skuForm.productId = skuProductId.value
    const res = await api.post('/admin/pinball/shop/product/sku/save', skuForm)
    skuSubmitLoading.value = false
    if (res.code === 200) {
      showSkuForm.value = false
      getSkus()
    } else {
      showToast(res.message)
    }
  } catch (e) {
    skuSubmitLoading.value = false
    showToast('系统错误')
  }
}

const deleteSku = async (skuId) => {
  try {
    const res = await api.post('/admin/pinball/shop/product/sku/delete', { skuId })
    if (res.code === 200) {
      getSkus()
    } else {
      showToast(res.message)
    }
  } catch (e) {
    showToast('系统错误')
  }
}

function openSkuAdd() {
  skuForm.skuId = ''
  skuForm.skuName = ''
  skuForm.skuAttrs = ''
  skuForm.pointType = 0
  skuForm.price = ''
  skuForm.stock = ''
  skuForm.image = ''
  skuForm.status = 1
  skuImageList.value = []
  showSkuForm.value = true
}

function openSkuEdit(item) {
  skuForm.skuId = item.skuId
  skuForm.productId = item.productId
  skuForm.skuName = item.skuName
  skuForm.skuAttrs = item.skuAttrs || ''
  skuForm.pointType = item.pointType ?? 0
  skuForm.price = item.price
  skuForm.stock = item.stock
  skuForm.image = item.image || ''
  skuForm.status = item.status
  skuImageList.value = item.image ? [{ url: item.image }] : []
  showSkuForm.value = true
}

async function onSkuImageRead(file) {
  const url = await onUploadRead(file)
  if (url) skuForm.image = url
}

function saveSku() {
  saveSkuFn()
}

function removeSku(skuId) {
  showConfirmDialog({ message: '确认删除该规格吗' })
    .then(() => deleteSku(skuId))
    .catch(() => {})
}
</script>

<style scoped>
.search-row {
  display: flex;
  align-items: center;
  padding: 8px 16px 0;
  gap: 8px;
  background: #f5f6fa;
}
.search-row .van-search {
  flex: 1;
  padding: 0;
}

.filter-row {
  background: #f5f6fa;
  padding: 8px 16px;
  display: flex;
  gap: 10px;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: #fff;
  border-radius: 20px;
  font-size: 13px;
  color: #323233;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.product-card {
  background: #fff;
  border-radius: 16px;
  margin: 8px 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  overflow: hidden;
}

.product-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.product-img-wrap {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: #f5f6fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: #111;
  margin-bottom: 4px;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.meta-text {
  font-size: 11px;
  color: #7C3AED;
  display: flex;
  align-items: center;
  gap: 2px;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-val {
  font-size: 16px;
  font-weight: 700;
  color: #EF4444;
}

.price-unit {
  font-size: 11px;
  color: #999;
}

.product-status {
  flex-shrink: 0;
}

.product-actions {
  display: flex;
  gap: 8px;
  padding: 0 12px 12px;
}

/* SKU */
.sku-product-name {
  font-size: 14px;
  font-weight: 600;
  color: #111;
  margin-bottom: 8px;
}

.sku-list {
  padding: 0 12px;
}

.sku-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
}

.sku-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sku-img-wrap {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #e5e7eb;
  overflow: hidden;
  flex-shrink: 0;
}

.sku-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sku-info {
  flex: 1;
  min-width: 0;
}

.sku-name {
  font-size: 14px;
  font-weight: 500;
  color: #111;
  margin-bottom: 2px;
}

.sku-meta {
  font-size: 11px;
  color: #999;
  display: flex;
  gap: 8px;
}

.sku-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

/* Form */
.upload-field {
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  padding: 10px 16px;
  background: #fff;
}

.upload-label {
  font-size: 14px;
  color: #323233;
}

.popup-wrap {
  overflow-y: auto;
  max-height: 90vh;
}
</style>
