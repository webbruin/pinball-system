<template>
  <div>
    <van-nav-bar title="Banner广告">
      <template #right>
        <van-button type="primary" plain size="small" icon="plus" @click="openAdd">添加</van-button>
      </template>
    </van-nav-bar>

    <div class="page-scroll">
      <div class="gradient-header">
        <div class="title">Banner广告</div>
        <div class="subtitle">管理首页广告与商城广告</div>
      </div>

      <van-tabs v-model:active="bannerType" sticky offset-top="46" @change="onSearch">
        <van-tab title="全部" :name="undefined" />
        <van-tab title="首页广告" :name="1" />
        <van-tab title="商城广告" :name="2" />
      </van-tabs>

      <div class="section" style="margin-bottom:16px">
        <div class="banner-card" v-for="(item, idx) in banners" :key="item.id">
          <div class="banner-img-wrap">
            <img v-if="item.imgUrl" :src="item.imgUrl" class="banner-img" />
            <van-icon v-else name="photo-o" size="36" color="#ccc" />
            <div class="banner-overlay">
              <van-tag size="small" :type="item.bannerType === 1 ? 'primary' : 'warning'">
                {{ item.bannerType === 1 ? '首页广告' : '商城广告' }}
              </van-tag>
              <van-switch v-model="item.status" :active-value="1" :inactive-value="0" size="18px" @change="toggleStatus(item)" />
            </div>
          </div>
          <div class="banner-info">
            <div class="banner-title">{{ item.title }}</div>
            <div class="banner-meta">
              <span class="meta-item">排序: {{ item.sort }}</span>
              <span class="meta-item" v-if="item.expireTime">截止: {{ item.expireTime }}</span>
              <span class="meta-item" v-else>永久有效</span>
            </div>
            <div class="banner-jump" v-if="item.jumpUrl">
              <van-icon name="link-o" size="12" />
              <span>{{ item.jumpUrl }}</span>
            </div>
          </div>
          <div class="banner-actions">
            <van-icon name="arrow-up" size="18" color="#999" @click="moveUp(idx)" />
            <van-icon name="arrow-down" size="18" color="#999" @click="moveDown(idx)" />
            <van-button plain icon="edit" size="small" style="flex:1" @click="openEdit(item)">编辑</van-button>
            <van-button plain icon="delete-o" size="small" color="#EF4444" style="flex:1" @click="removeBanner(item.id)">删除</van-button>
          </div>
        </div>
        <van-empty v-if="!banners.length" description="暂无Banner数据" style="padding-top:40px" />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <van-popup v-model:show="showModal" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar :title="form.id ? '编辑Banner' : '添加Banner'" right-text="关闭" @click-right="showModal = false" />
        <van-form @submit="save" style="padding:0 4px">
          <van-cell-group inset>
            <van-field
              v-model="form.title"
              label="标题"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写标题' }]"
            />
            <van-field name="bannerType" label="Banner类型">
              <template #input>
                <van-radio-group direction="horizontal" v-model="form.bannerType">
                  <van-radio :name="1">首页广告</van-radio>
                  <van-radio :name="2">商城广告</van-radio>
                </van-radio-group>
              </template>
            </van-field>
            <van-field
              v-model="form.jumpUrl"
              label="跳转链接"
              placeholder="请输入"
            />
            <van-field
              v-model="form.sort"
              type="number"
              label="排序号"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写排序号' }]"
            />
            <van-field
              v-model="expireTimeDisplay"
              is-link
              readonly
              label="过期时间"
              placeholder="留空表示永久有效"
              @click="showExpireTime = true"
            />
            <div class="upload-field">
              <span class="upload-label">Banner图片</span>
              <van-uploader
                v-model="imgFileList"
                :max-count="1"
                :after-read="onImgRead"
                :preview-full-image="false"
              />
            </div>
          </van-cell-group>
          <div style="padding:16px">
            <van-button type="primary" native-type="submit" block :loading="submitLoading">
              {{ form.id ? '保存修改' : '添加Banner' }}
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 过期时间选择器 -->
    <van-popup v-model:show="showExpireTime" round position="bottom">
      <van-date-picker v-model="expireTimeValue" title="选择过期时间" @confirm="onExpireTimeConfirm" @cancel="showExpireTime = false" />
    </van-popup>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, computed } from 'vue'
import { showConfirmDialog, showToast, showLoadingToast } from 'vant'
import { onUploadRead } from '../utils/upload'

const bannerType = ref(undefined)
const banners = ref([])
const showModal = ref(false)
const submitLoading = ref(false)
const imgFileList = ref([])
const showExpireTime = ref(false)
const expireTimeValue = ref([])
const expireTimeDisplay = computed(() => form.expireTime || '')

function onExpireTimeConfirm({ selectedValues }) {
  expireTimeValue.value = selectedValues
  form.expireTime = selectedValues.join('-') + ' 23:59:59'
  showExpireTime.value = false
}
const form = reactive({
  id: '',
  title: '',
  bannerType: 1,
  jumpUrl: '',
  sort: '',
  expireTime: '',
  imgUrl: '',
})

onMounted(() => {
  getBanners()
})

// 获取Banner列表
const getBanners = async () => {
  const loading = showLoadingToast({ message: '加载中', forbidClick: true, duration: 0 })
  try {
    const payload = {}
    if (bannerType.value) payload.bannerType = bannerType.value
    const res = await api.post('/admin/pinball/banner/listBanner', payload)
    loading.close()
    if (res.code === 200) {
      banners.value = res.data || []
    } else {
      showToast(res.message)
    }
  } catch (e) {
    loading.close()
    showToast('系统错误')
  }
}

function onSearch() {
  getBanners()
}

// 切换启用状态
const toggleStatus = async (item) => {
  try {
    const res = await api.post('/admin/pinball/banner/updateBanner', {
      id: item.id,
      title: item.title,
      bannerType: item.bannerType,
      imgUrl: item.imgUrl || '',
      jumpUrl: item.jumpUrl || '',
      sort: item.sort,
      expireTime: item.expireTime || '',
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

// 移动排序
const moveUp = async (idx) => {
  if (idx <= 0) return
  const a = banners.value[idx]
  const b = banners.value[idx - 1]
  ;[banners.value[idx - 1], banners.value[idx]] = [a, b]
  await updateSortBatch(a, b)
  getBanners()
}

const moveDown = async (idx) => {
  if (idx >= banners.value.length - 1) return
  const a = banners.value[idx]
  const b = banners.value[idx + 1]
  ;[banners.value[idx + 1], banners.value[idx]] = [a, b]
  await updateSortBatch(a, b)
  getBanners()
}

const updateSortBatch = async (a, b) => {
  try {
    await api.post('/admin/pinball/banner/updateBannerSort', { id: a.id, sort: b.sort })
    await api.post('/admin/pinball/banner/updateBannerSort', { id: b.id, sort: a.sort })
  } catch (e) { /* ignore */ }
}

// 新增/编辑
const createOrUpdate = async () => {
  try {
    submitLoading.value = true
    const url = form.id ? '/admin/pinball/banner/updateBanner' : '/admin/pinball/banner/addBanner'
    const res = await api.post(url, form)
    submitLoading.value = false
    if (res.code === 200) {
      showModal.value = false
      getBanners()
    } else {
      showToast(res.message)
    }
  } catch (e) {
    submitLoading.value = false
    showToast('系统错误')
  }
}

// 删除Banner
const deleteBanner = async (id) => {
  try {
    const res = await api.post('/admin/pinball/banner/deleteBanner', { id })
    if (res.code === 200) {
      getBanners()
    } else {
      showToast(res.message)
    }
  } catch (e) {
    showToast('系统错误')
  }
}

function openAdd() {
  form.id = ''
  form.title = ''
  form.bannerType = 1
  form.jumpUrl = ''
  form.sort = ''
  form.expireTime = ''
  form.imgUrl = ''
  imgFileList.value = []
  showModal.value = true
}

function openEdit(item) {
  form.id = item.id
  form.title = item.title
  form.bannerType = item.bannerType
  form.jumpUrl = item.jumpUrl || ''
  form.sort = item.sort
  form.expireTime = item.expireTime || ''
  form.imgUrl = item.imgUrl || ''
  imgFileList.value = item.imgUrl ? [{ url: item.imgUrl }] : []
  showModal.value = true
}

async function onImgRead(file) {
  const url = await onUploadRead(file)
  if (url) form.imgUrl = url
}

function save() {
  createOrUpdate()
}

function removeBanner(id) {
  showConfirmDialog({ message: '确认删除该Banner吗' })
    .then(() => deleteBanner(id))
    .catch(() => {})
}
</script>

<style scoped>
.banner-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  margin-top: 12px;
}

.banner-img-wrap {
  position: relative;
  height: 140px;
  background: #f5f6fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  top: 8px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 12px;
}

.banner-info {
  padding: 12px;
}

.banner-title {
  font-size: 15px;
  font-weight: 600;
  color: #111;
  margin-bottom: 6px;
}

.banner-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
}

.meta-item {
  font-size: 12px;
  color: #999;
}

.banner-jump {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #7C3AED;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px 12px;
}

.upload-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
