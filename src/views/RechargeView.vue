<template>
  <div>
    <van-nav-bar title="充值套餐">
      <template #right>
        <van-button type="primary" plain size="small" icon="plus" @click="openAdd">新增</van-button>
      </template>
    </van-nav-bar>

    <div class="page-scroll">
      <div class="gradient-header">
        <div class="title">充值套餐</div>
        <div class="subtitle">管理弹珠充值套餐配置</div>
      </div>

      <div class="search-row">
        <van-search v-model="params.packageName" placeholder="搜索套餐名称..." shape="round" background="#f5f6fa" @search="onSearch" />
      </div>
      <div class="filter-row">
        <div class="filter-chip" @click="showFilterStatus = true">
          <span>{{ filterStatusLabel }}</span>
          <van-icon name="arrow-down" size="12" />
        </div>
      </div>

      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <div class="section" style="margin-bottom:16px">
          <div class="recharge-card" v-for="item in list" :key="item.packageId">
            <div class="recharge-header">
              <div class="recharge-name">{{ item.packageName }}</div>
              <van-switch v-model="item.status" :active-value="1" :inactive-value="0" size="20px" @change="toggleStatus(item)" />
            </div>
            <div class="recharge-price">¥{{ item.payAmount }}</div>
            <div class="recharge-detail">
              <span class="detail-item">弹珠 ×{{ item.marbleAmount }}</span>
              <span class="detail-item" v-if="item.giftMarbleAmount">赠送弹珠 +{{ item.giftMarbleAmount }}</span>
              <span class="detail-item" v-if="item.giftMemberPointAmount">赠送积分 +{{ item.giftMemberPointAmount }}</span>
              <span class="detail-item" v-if="item.giftPointCardAmount">赠送积分卡 +{{ item.giftPointCardAmount }}</span>
            </div>
            <div class="recharge-meta">
              <span class="meta-text" v-if="item.remark">{{ item.remark }}</span>
              <span class="meta-text gray">排序: {{ item.sortOrder }}</span>
              <span class="meta-text gray">{{ item.createTime }}</span>
            </div>
            <div class="recharge-actions">
              <van-button plain icon="edit" size="small" style="flex:1" @click="openEdit(item)">编辑</van-button>
              <van-button plain icon="delete-o" size="small" color="#EF4444" style="flex:1" @click="removeItem(item.packageId)">删除</van-button>
            </div>
          </div>
          <van-empty v-if="!list.length && !loading" description="暂无套餐数据" style="padding-top:40px" />
        </div>
      </van-list>
    </div>

    <!-- 新增/编辑弹窗 -->
    <van-popup v-model:show="showModal" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar :title="form.packageId ? '编辑套餐' : '新增套餐'" right-text="关闭" @click-right="showModal = false" />
        <van-form @submit="save" style="padding:0 4px">
          <van-cell-group inset>
            <van-field v-model="form.packageName" label="套餐名称" placeholder="请输入" :rules="[{ required: true, message: '请填写套餐名称' }]" />
            <van-field v-model="form.payAmount" type="number" label="支付金额(元)" placeholder="请输入" :rules="[{ required: true, message: '请填写支付金额' }]" />
            <van-field v-model="form.marbleAmount" type="number" label="充值弹珠" placeholder="请输入" :rules="[{ required: true, message: '请填写弹珠数量' }]" />
            <van-field v-model="form.giftMarbleAmount" type="number" label="赠送弹珠" placeholder="请输入" />
            <van-field v-model="form.giftMemberPointAmount" type="number" label="赠送会员积分" placeholder="请输入" />
            <van-field v-model="form.giftPointCardAmount" type="number" label="赠送积分卡" placeholder="请输入" />
            <van-field v-model="form.sortOrder" type="number" label="排序号" placeholder="越小越靠前" />
            <van-field v-model="form.remark" label="备注" placeholder="请输入" />
            <van-field name="status" label="状态">
              <template #input>
                <van-radio-group direction="horizontal" v-model="form.status">
                  <van-radio :name="1">启用</van-radio>
                  <van-radio :name="0">停用</van-radio>
                </van-radio-group>
              </template>
            </van-field>
          </van-cell-group>
          <div style="padding:16px">
            <van-button type="primary" native-type="submit" block :loading="submitLoading">
              {{ form.packageId ? '保存修改' : '新增套餐' }}
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 状态筛选弹窗 -->
    <van-popup v-model:show="showFilterStatus" round position="bottom">
      <van-picker :columns="statusOpts" show-toolbar title="筛选状态" @confirm="onFilterStatusConfirm" @cancel="showFilterStatus = false" />
    </van-popup>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, computed } from 'vue'
import { showConfirmDialog, showToast } from 'vant'

const params = ref({
  current: 1,
  pageSize: 20,
  packageName: '',
  status: undefined,
  sortField: [],
})

const statusOpts = [
  { text: '全部状态', value: undefined },
  { text: '启用', value: 1 },
  { text: '停用', value: 0 },
]

const showFilterStatus = ref(false)

const filterStatusLabel = computed(() => {
  const found = statusOpts.find(o => o.value === params.value.status)
  return found ? `状态: ${found.text}` : '状态: 全部'
})

const list = ref([])
const loading = ref(false)
const finished = ref(false)
const total = ref(0)

const showModal = ref(false)
const submitLoading = ref(false)

const form = reactive({
  packageId: '',
  packageName: '',
  payAmount: '',
  marbleAmount: '',
  giftMarbleAmount: '',
  giftMemberPointAmount: '',
  giftPointCardAmount: '',
  sortOrder: '',
  remark: '',
  status: 1,
})

onMounted(() => {
  onLoad()
})

const getList = async (isRefresh) => {
  if (isRefresh) {
    params.value.current = 1
    list.value = []
    finished.value = false
    total.value = 0
  }
  try {
    loading.value = true
    const payload = { ...params.value }
    Object.keys(payload).forEach(k => {
      if (payload[k] === undefined || payload[k] === '') delete payload[k]
    })
    const res = await api.post('/admin/pinball/recharge/page', payload)
    if (res.code === 200) {
      const items = res.data?.data || []
      total.value = res.data?.total || 0
      if (isRefresh) {
        list.value = items
      } else {
        list.value = [...list.value, ...items]
      }
      if (list.value.length >= total.value) finished.value = true
      params.value.current++
    } else {
      showToast(res.message)
    }
  } catch (e) {
    if (!isRefresh) showToast('系统错误')
  }
}

function onRefresh() {
  getList(true)
}

function onLoad() {
  getList(false).finally(() => { loading.value = false })
}

function onSearch() {
  onRefresh()
}

function onFilterStatusConfirm({ selectedOptions }) {
  params.value.status = selectedOptions[0].value
  showFilterStatus.value = false
  onSearch()
}

const toggleStatus = async (item) => {
  try {
    const res = await api.post('/admin/pinball/recharge/status', {
      packageId: item.packageId,
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

const createOrUpdate = async () => {
  try {
    submitLoading.value = true
    const url = form.packageId ? '/admin/pinball/recharge/update' : '/admin/pinball/recharge/add'
    const res = await api.post(url, form)
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

const deleteItem = async (packageId) => {
  try {
    const res = await api.post('/admin/pinball/recharge/delete', { packageId })
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
  form.packageId = ''
  form.packageName = ''
  form.payAmount = ''
  form.marbleAmount = ''
  form.giftMarbleAmount = ''
  form.giftMemberPointAmount = ''
  form.giftPointCardAmount = ''
  form.sortOrder = ''
  form.remark = ''
  form.status = 1
  showModal.value = true
}

function openEdit(item) {
  form.packageId = item.packageId
  form.packageName = item.packageName
  form.payAmount = item.payAmount ?? ''
  form.marbleAmount = item.marbleAmount ?? ''
  form.giftMarbleAmount = item.giftMarbleAmount ?? ''
  form.giftMemberPointAmount = item.giftMemberPointAmount ?? ''
  form.giftPointCardAmount = item.giftPointCardAmount ?? ''
  form.sortOrder = item.sortOrder ?? ''
  form.remark = item.remark || ''
  form.status = item.status
  showModal.value = true
}

function save() {
  createOrUpdate()
}

function removeItem(packageId) {
  showConfirmDialog({ message: '确认删除该套餐吗' })
    .then(() => deleteItem(packageId))
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

.recharge-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  margin-top: 12px;
}

.recharge-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.recharge-name {
  font-size: 16px;
  font-weight: 600;
  color: #111;
  flex: 1;
  min-width: 0;
  margin-right: 12px;
}

.recharge-price {
  font-size: 24px;
  font-weight: 700;
  color: #EF4444;
  margin-bottom: 8px;
}

.recharge-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.detail-item {
  font-size: 12px;
  color: #2563EB;
  background: #EFF6FF;
  padding: 3px 8px;
  border-radius: 10px;
}

.recharge-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.meta-text {
  font-size: 12px;
  color: #666;
}
.meta-text.gray {
  color: #bbb;
}

.recharge-actions {
  display: flex;
  gap: 8px;
}

.popup-wrap {
  overflow-y: auto;
  max-height: 90vh;
}
</style>
