<template>
  <div>
    <van-nav-bar title="分类管理">
      <template #right>
        <van-button type="primary" plain size="small" icon="plus" @click="openAdd">新增</van-button>
      </template>
    </van-nav-bar>

    <div class="page-scroll">
      <div class="gradient-header">
        <div class="title">商品分类</div>
        <div class="subtitle">管理商品分类</div>
      </div>

      <div class="section" style="margin-bottom:16px">
        <div class="category-card" v-for="item in categories" :key="item.categoryId">
          <div class="category-header">
            <div class="category-icon-wrap" :style="{ background: iconBg(item) }">
              <img v-if="item.icon" :src="item.icon" class="category-icon-img" />
              <van-icon v-else name="shop-o" size="20" color="#fff" />
            </div>
            <div class="category-info">
              <div class="category-name">{{ item.categoryName }}</div>
              <div class="category-meta">
                <span class="meta-text">排序: {{ item.sortOrder }}</span>
              </div>
            </div>
            <van-switch v-model="item.status" :active-value="1" :inactive-value="0" size="20px" @change="toggleStatus(item)" />
          </div>
          <van-divider style="margin:8px 0" />
          <div class="category-actions">
            <van-button plain icon="edit" size="small" style="flex:1" @click="openEdit(item)">编辑</van-button>
            <van-button plain icon="delete-o" size="small" color="#EF4444" style="flex:1" @click="removeCategory(item.categoryId)">删除</van-button>
          </div>
        </div>
        <van-empty v-if="!categories.length" description="暂无分类数据" style="padding-top:40px" />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <van-popup v-model:show="showModal" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar :title="form.categoryId ? '编辑分类' : '添加新分类'" right-text="关闭" @click-right="showModal = false" />
        <van-form @submit="save" style="padding:0 4px">
          <van-cell-group inset>
            <van-field
              v-model="form.categoryName"
              label="分类名称"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写分类名称' }]"
            />
            <div class="upload-field">
              <span class="upload-label">分类图标</span>
              <van-uploader
                v-model="iconFileList"
                :max-count="1"
                :after-read="onIconRead"
                :preview-full-image="false"
              />
            </div>
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
                  <van-radio :name="1">启用</van-radio>
                  <van-radio :name="0">禁用</van-radio>
                </van-radio-group>
              </template>
            </van-field>
          </van-cell-group>
          <div style="padding:16px">
            <van-button type="primary" native-type="submit" block :loading="submitLoading">
              {{ form.categoryId ? '保存修改' : '添加分类' }}
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { showConfirmDialog, showToast, showLoadingToast } from 'vant'
import { onUploadRead } from '../utils/upload'

const categories = ref([])
const showModal = ref(false)
const submitLoading = ref(false)
const iconFileList = ref([])

const form = reactive({
  categoryId: '',
  categoryName: '',
  icon: '',
  sortOrder: '',
  status: 1,
})

const iconColors = ['#6366f1', '#8B5CF6', '#7C3AED', '#2563EB', '#10B981', '#F59E0B', '#EF4444']

function iconBg(item) {
  return iconColors[item.categoryId % iconColors.length]
}

onMounted(() => {
  getCategoryList()
})

async function onIconRead(file) {
  const url = await onUploadRead(file)
  if (url) form.icon = url
}

// 获取分类列表
const getCategoryList = async () => {
  const loading = showLoadingToast({
    message: '加载中',
    forbidClick: true,
    duration: 0,
  })
  try {
    const res = await api.post('/admin/pinball/shop/category/list', {})
    loading.close()
    if (res.code === 200) {
      categories.value = res.data || []
    } else {
      showToast(res.message)
    }
  } catch (e) {
    loading.close()
    showToast('系统错误')
  }
}

// 切换启用状态
const toggleStatus = async (item) => {
  try {
    const res = await api.post('/admin/pinball/shop/category/save', {
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      icon: item.icon,
      sortOrder: item.sortOrder,
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

// 新增/编辑
const createOrUpdate = async () => {
  try {
    submitLoading.value = true
    const res = await api.post('/admin/pinball/shop/category/save', form)
    submitLoading.value = false
    if (res.code === 200) {
      showModal.value = false
      getCategoryList()
    } else {
      showToast(res.message)
    }
  } catch (e) {
    submitLoading.value = false
    showToast('系统错误')
  }
}

// 删除分类
const deleteCategory = async (categoryId) => {
  try {
    const res = await api.post('/admin/pinball/shop/category/delete', { categoryId })
    if (res.code === 200) {
      getCategoryList()
    } else {
      showToast(res.message)
    }
  } catch (e) {
    showToast('系统错误')
  }
}

function openAdd() {
  form.categoryId = ''
  form.categoryName = ''
  form.icon = ''
  form.sortOrder = ''
  form.status = 1
  iconFileList.value = []
  showModal.value = true
}

function openEdit(item) {
  form.categoryId = item.categoryId
  form.categoryName = item.categoryName
  form.icon = item.icon || ''
  form.sortOrder = item.sortOrder
  form.status = item.status
  iconFileList.value = item.icon ? [{ url: item.icon }] : []
  showModal.value = true
}

function save() {
  createOrUpdate()
}

function removeCategory(categoryId) {
  showConfirmDialog({ message: '确认删除吗' })
    .then(() => deleteCategory(categoryId))
    .catch(() => {})
}
</script>

<style scoped>
.category-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  margin-top: 12px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.category-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: #111;
  margin-bottom: 4px;
}

.category-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-text {
  font-size: 12px;
  color: #999;
}

.category-actions {
  display: flex;
  gap: 10px;
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
