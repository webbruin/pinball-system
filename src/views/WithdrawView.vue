<template>
  <div>
    <van-nav-bar title="提现管理" />

    <div class="page-scroll">
      <div class="gradient-header">
        <div class="title">提现管理</div>
        <div class="subtitle">审核提现申请与管理转账</div>
      </div>

      <div class="search-row">
        <van-search v-model="params.withdrawNo" placeholder="搜索提现单号..." shape="round" background="#f5f6fa" @search="onSearch" />
      </div>
      <div class="search-row" style="padding-top:0">
        <van-search v-model="params.userId" placeholder="搜索用户ID..." shape="round" background="#f5f6fa" @search="onSearch" />
      </div>
      <div class="filter-row">
        <div class="filter-chip" @click="showStatusFilter = true">
          <span>{{ statusLabel }}</span>
          <van-icon name="arrow-down" size="12" />
        </div>
      </div>
      <div class="filter-row">
        <van-field v-model="startDisplay" readonly label="起" placeholder="请选择" style="flex:1;padding:0" @click="showStart = true" label-width="20px" />
        <van-field v-model="endDisplay" readonly label="止" placeholder="请选择" style="flex:1;padding:0" @click="showEnd = true" label-width="20px" />
        <van-button type="primary" size="small" @click="onSearch">查询</van-button>
      </div>

      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <div class="section" style="margin-bottom:16px">
          <div class="withdraw-card" v-for="item in list" :key="item.withdrawId" @click="openDetail(item)">
            <div class="card-header">
              <span class="card-no">{{ item.withdrawNo || '-' }}</span>
              <van-tag size="small" :type="statusType(item.withdrawStatus)">
                {{ statusMap[item.withdrawStatus] || '-' }}
              </van-tag>
            </div>
            <div class="card-body">
              <div class="card-row">
                <span class="card-label">用户ID</span>
                <span>{{ item.userId }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">申请金额</span>
                <span class="card-amount">{{ item.withdrawAmount ?? 0 }} 元</span>
              </div>
              <div class="card-row">
                <span class="card-label">手续费</span>
                <span>{{ item.feeAmount ?? 0 }} 元</span>
              </div>
              <div class="card-row">
                <span class="card-label">提现渠道</span>
                <span>{{ item.withdrawChannel || '-' }}</span>
              </div>
            </div>
            <div class="card-footer">
              <span class="card-time">{{ item.applyTime || '-' }}</span>
              <div class="card-actions">
                <van-button
                  v-if="item.withdrawStatus === 0"
                  type="primary"
                  size="small"
                  plain
                  @click.stop="openAudit(item)"
                >审核</van-button>
                <van-button
                  v-if="item.withdrawStatus === 1"
                  type="default"
                  size="small"
                  plain
                  @click.stop="queryTransfer(item)"
                >查转账</van-button>
                <van-button
                  v-if="item.withdrawStatus === 3"
                  type="warning"
                  size="small"
                  plain
                  @click.stop="retryTransfer(item)"
                >重试转账</van-button>
              </div>
            </div>
          </div>
          <van-empty v-if="!list.length && !loading" description="暂无提现记录" style="padding-top:40px" />
        </div>
      </van-list>
    </div>

    <!-- 详情弹窗 -->
    <van-popup v-model:show="showDetail" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar title="提现详情" right-text="关闭" @click-right="showDetail = false" />
        <van-cell-group inset v-if="detail">
          <van-cell title="提现单号" :value="detail.withdrawNo" />
          <van-cell title="用户ID" :value="detail.userId" />
          <van-cell title="状态">
            <template #value>
              <van-tag size="small" :type="statusType(detail.withdrawStatus)">
                {{ statusMap[detail.withdrawStatus] || '-' }}
              </van-tag>
            </template>
          </van-cell>
          <van-cell title="申请金额" :value="(detail.withdrawAmount ?? 0) + ' 元'" />
          <van-cell title="手续费" :value="(detail.feeAmount ?? 0) + ' 元'" />
          <van-cell title="实际转账" :value="(detail.actualAmount ?? 0) + ' 元'" />
          <van-cell title="提现渠道" :value="detail.withdrawChannel || '-'" />
          <van-cell title="申请时间" :value="detail.applyTime || '-'" />
          <van-cell title="审核人" :value="detail.auditUserName || '-'" />
          <van-cell title="审核时间" :value="detail.auditTime || '-'" />
          <van-cell title="转账时间" :value="detail.transferTime || '-'" />
          <van-cell title="完成时间" :value="detail.finishTime || '-'" />
          <van-cell title="失败原因" :value="detail.failReason || '-'" />
        </van-cell-group>

        <div class="detail-actions" v-if="detail">
          <van-button
            v-if="detail.withdrawStatus === 0"
            type="primary"
            block
            style="margin:0 16px 16px"
            @click="openAuditFromDetail"
          >审核</van-button>
          <van-button
            v-if="detail.withdrawStatus === 1"
            type="default"
            block
            style="margin:0 16px 16px"
            @click="queryTransferFromDetail"
          >查询支付宝转账状态</van-button>
          <van-button
            v-if="detail.withdrawStatus === 3"
            type="warning"
            block
            style="margin:0 16px 16px"
            @click="retryTransferFromDetail"
          >重试支付宝转账</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 审核弹窗 -->
    <van-popup v-model:show="showAudit" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar title="审核提现" right-text="关闭" @click-right="showAudit = false" />
        <van-form @submit="submitAudit" style="padding:0 4px">
          <van-cell-group inset>
            <van-field name="auditResult" label="审核结果">
              <template #input>
                <van-radio-group direction="horizontal" v-model="auditForm.auditResult">
                  <van-radio :name="1">通过</van-radio>
                  <van-radio :name="2">拒绝</van-radio>
                </van-radio-group>
              </template>
            </van-field>
            <van-field v-model="auditForm.auditRemark" label="审核备注" placeholder="请输入" type="textarea" rows="2" autosize />
          </van-cell-group>
          <div style="padding:16px">
            <van-button type="primary" native-type="submit" block :loading="auditLoading">确认提交</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 状态筛选弹窗 -->
    <van-popup v-model:show="showStatusFilter" round position="bottom">
      <van-picker :columns="statusOpts" show-toolbar title="提现状态" @confirm="onStatusConfirm" @cancel="showStatusFilter = false" />
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showStart" round position="bottom">
      <van-date-picker v-model="startValue" title="选择开始时间" @confirm="onStartConfirm" @cancel="showStart = false" />
    </van-popup>
    <van-popup v-model:show="showEnd" round position="bottom">
      <van-date-picker v-model="endValue" title="选择结束时间" @confirm="onEndConfirm" @cancel="showEnd = false" />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { showToast, showLoadingToast } from 'vant'

const statusMap = { 0: '待审核', 1: '转账中', 2: '提现成功', 3: '提现失败', 4: '审核拒绝', 5: '用户取消' }

function statusType(s) {
  if (s === 2) return 'success'
  if (s === 3 || s === 4) return 'danger'
  if (s === 1) return 'primary'
  return 'warning'
}

const statusOpts = [
  { text: '全部状态', value: undefined },
  { text: '待审核', value: 0 },
  { text: '转账中', value: 1 },
  { text: '提现成功', value: 2 },
  { text: '提现失败', value: 3 },
  { text: '审核拒绝', value: 4 },
  { text: '用户取消', value: 5 },
]

// --- 列表 ---
const params = ref({
  current: 1,
  pageSize: 20,
  withdrawNo: '',
  userId: '',
  withdrawStatus: undefined,
  applyTimeStart: '',
  applyTimeEnd: '',
  sortField: [],
})

const showStatusFilter = ref(false)

const showStart = ref(false)
const showEnd = ref(false)
const startValue = ref([])
const endValue = ref([])

const startDisplay = computed(() => params.value.applyTimeStart || '')
const endDisplay = computed(() => params.value.applyTimeEnd || '')

const statusLabel = computed(() => {
  const f = statusOpts.find(o => o.value === params.value.withdrawStatus)
  return f ? `状态: ${f.text}` : '状态: 全部'
})

function onStartConfirm({ selectedValues }) {
  startValue.value = selectedValues
  params.value.applyTimeStart = selectedValues.join('-')
  showStart.value = false
}

function onEndConfirm({ selectedValues }) {
  endValue.value = selectedValues
  params.value.applyTimeEnd = selectedValues.join('-')
  showEnd.value = false
}

const list = ref([])
const loading = ref(false)
const finished = ref(false)
let total = 0

// --- 详情 ---
const showDetail = ref(false)
const detail = ref(null)

// --- 审核 ---
const showAudit = ref(false)
const auditLoading = ref(false)
const auditForm = reactive({
  withdrawNo: '',
  auditResult: 1,
  auditRemark: '',
})

// --- 列表 API ---
const getList = async (isRefresh) => {
  if (isRefresh) {
    params.value.current = 1
    list.value = []
    finished.value = false
    total = 0
  }
  try {
    loading.value = true
    const payload = { ...params.value }
    Object.keys(payload).forEach(k => {
      if (payload[k] === undefined || payload[k] === '') delete payload[k]
    })
    const res = await api.post('/admin/pinball/withdraw/log/page', payload)
    if (res.code === 200) {
      const data = res.data?.data || []
      total = res.data?.total || 0
      if (isRefresh) list.value = data
      else list.value = [...list.value, ...data]
      if (list.value.length >= total) finished.value = true
      params.value.current++
    }
  } catch (e) { /* silent */ }
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

function onStatusConfirm({ selectedOptions }) {
  params.value.withdrawStatus = selectedOptions[0].value
  showStatusFilter.value = false
  onSearch()
}

// --- 详情 ---
const openDetail = async (item) => {
  showDetail.value = true
  detail.value = null
  const loadingToast = showLoadingToast({ message: '加载中', forbidClick: true, duration: 0 })
  try {
    const res = await api.post('/admin/pinball/withdraw/log/detail', { withdrawNo: item.withdrawNo })
    loadingToast.close()
    if (res.code === 200) {
      detail.value = res.data
    } else {
      showToast(res.message)
    }
  } catch (e) {
    loadingToast.close()
    showToast('系统错误')
  }
}

// --- 审核 ---
function openAudit(item) {
  auditForm.withdrawNo = item.withdrawNo
  auditForm.auditResult = 1
  auditForm.auditRemark = ''
  showAudit.value = true
}

function openAuditFromDetail() {
  auditForm.withdrawNo = detail.value.withdrawNo
  auditForm.auditResult = 1
  auditForm.auditRemark = ''
  showAudit.value = true
}

const submitAudit = async () => {
  try {
    auditLoading.value = true
    const res = await api.post('/admin/pinball/withdraw/audit', auditForm)
    auditLoading.value = false
    if (res.code === 200) {
      showAudit.value = false
      showToast('审核完成')
      onRefresh()
    } else {
      showToast(res.message)
    }
  } catch (e) {
    auditLoading.value = false
    showToast('系统错误')
  }
}

// --- 查询转账 ---
const queryTransfer = async (item) => {
  const loadingToast = showLoadingToast({ message: '查询中', forbidClick: true, duration: 0 })
  try {
    const res = await api.post('/admin/pinball/withdraw/queryTransfer', { withdrawNo: item.withdrawNo })
    loadingToast.close()
    if (res.code === 200) {
      showToast('查询成功')
      onRefresh()
    } else {
      showToast(res.message)
    }
  } catch (e) {
    loadingToast.close()
    showToast('系统错误')
  }
}

function queryTransferFromDetail() {
  queryTransfer({ withdrawNo: detail.value.withdrawNo })
}

// --- 重试转账 ---
const retryTransfer = async (item) => {
  const loadingToast = showLoadingToast({ message: '重试中', forbidClick: true, duration: 0 })
  try {
    const res = await api.post('/admin/pinball/withdraw/retryTransfer', { withdrawNo: item.withdrawNo })
    loadingToast.close()
    if (res.code === 200) {
      showToast('重试成功')
      onRefresh()
    } else {
      showToast(res.message)
    }
  } catch (e) {
    loadingToast.close()
    showToast('系统错误')
  }
}

function retryTransferFromDetail() {
  retryTransfer({ withdrawNo: detail.value.withdrawNo })
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
  align-items: center;
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

.withdraw-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  margin-top: 10px;
  cursor: pointer;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.card-no {
  font-size: 14px;
  font-weight: 600;
  color: #7C3AED;
}

.card-body {
  margin-bottom: 10px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}

.card-label {
  color: #999;
}

.card-amount {
  font-weight: 600;
  color: #EF4444;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-time {
  font-size: 11px;
  color: #ccc;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.popup-wrap {
  overflow-y: auto;
  max-height: 90vh;
}

.detail-actions {
  padding-top: 12px;
}
</style>
