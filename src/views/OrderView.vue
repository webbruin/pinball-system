<template>
  <div>
    <van-nav-bar title="订单管理" />

    <div class="page-scroll">
      <div class="gradient-header">
        <div class="title">订单管理</div>
        <div class="subtitle">管理订单与退款审核</div>
      </div>

      <van-tabs v-model:active="tabActive" sticky @change="onTabChange">
        <van-tab title="订单列表">
          <div class="search-row">
            <van-search v-model="orderParams.orderId" placeholder="搜索订单号..." shape="round" background="#f5f6fa" @search="onOrderSearch" />
          </div>
          <div class="search-row" style="padding-top:0">
            <van-search v-model="orderParams.recipientPhone" placeholder="搜索收货人电话..." shape="round" background="#f5f6fa" @search="onOrderSearch" />
          </div>
          <div class="filter-row">
            <div class="filter-chip" @click="showOrderStatusFilter = true">
              <span>{{ orderStatusLabel }}</span>
              <van-icon name="arrow-down" size="12" />
            </div>
          </div>
          <div class="filter-row">
            <van-field v-model="orderStartDisplay" readonly label="起" placeholder="请选择" style="flex:1;padding:0" @click="showOrderStart = true" label-width="20px" />
            <van-field v-model="orderEndDisplay" readonly label="止" placeholder="请选择" style="flex:1;padding:0" @click="showOrderEnd = true" label-width="20px" />
            <van-button type="primary" size="small" @click="onOrderSearch">查询</van-button>
          </div>

          <van-pull-refresh v-model="orderRefreshing" @refresh="onOrderRefresh">
            <van-list v-model:loading="orderLoading" :finished="orderFinished" finished-text="没有更多了" @load="onOrderLoad">
              <div class="section" style="margin-bottom:16px">
                <div class="order-card" v-for="item in orders" :key="item.orderId" @click="openOrderDetail(item)">
                  <div class="order-header">
                    <span class="order-id">#{{ item.orderId }}</span>
                    <van-tag size="small" :type="orderStatusType(item.orderStatus)">
                      {{ orderStatusMap[item.orderStatus] || '-' }}
                    </van-tag>
                  </div>
                  <div class="order-body">
                    <img v-if="item.firstProductImage" :src="item.firstProductImage" class="order-thumb" />
                    <van-icon v-else name="shopping-cart-o" size="28" color="#ccc" class="order-thumb" />
                    <div class="order-info">
                      <div class="order-product-name">{{ item.firstProductName || '-' }}</div>
                      <div class="order-meta">
                        <span>数量: {{ item.totalQuantity ?? 0 }}</span>
                        <span>实付: {{ item.payAmount ?? 0 }} 积分卡</span>
                      </div>
                    </div>
                  </div>
                  <div class="order-footer">
                    <span class="order-time">{{ item.createTime || '-' }}</span>
                  </div>
                </div>
                <van-empty v-if="!orders.length && !orderLoading" description="暂无订单数据" style="padding-top:40px" />
              </div>
            </van-list>
          </van-pull-refresh>
        </van-tab>

        <van-tab title="退款申请">
          <div class="search-row">
            <van-search v-model="refundParams.orderId" placeholder="搜索订单号..." shape="round" background="#f5f6fa" @search="onRefundSearch" />
          </div>
          <div class="filter-row">
            <div class="filter-chip" @click="showRefundStatusFilter = true">
              <span>{{ refundStatusLabel }}</span>
              <van-icon name="arrow-down" size="12" />
            </div>
          </div>
          <div class="filter-row">
            <van-field v-model="refundStartDisplay" readonly label="起" placeholder="请选择" style="flex:1;padding:0" @click="showRefundStart = true" label-width="20px" />
            <van-field v-model="refundEndDisplay" readonly label="止" placeholder="请选择" style="flex:1;padding:0" @click="showRefundEnd = true" label-width="20px" />
            <van-button type="primary" size="small" @click="onRefundSearch">查询</van-button>
          </div>

          <van-pull-refresh v-model="refundRefreshing" @refresh="onRefundRefresh">
            <van-list v-model:loading="refundLoading" :finished="refundFinished" finished-text="没有更多了" @load="onRefundLoad">
              <div class="section" style="margin-bottom:16px">
                <div class="refund-card" v-for="item in refunds" :key="item.refundId">
                  <div class="refund-header">
                    <span class="refund-amount">退款: {{ item.refundAmount }} 积分卡</span>
                    <van-tag size="small" :type="refundStatusType(item.refundStatus)">
                      {{ refundStatusMap[item.refundStatus] || '-' }}
                    </van-tag>
                  </div>
                  <div class="refund-reason" v-if="item.refundReason">{{ item.refundReason }}</div>
                  <div class="refund-meta" v-if="item.auditRemark">审核备注: {{ item.auditRemark }}</div>
                  <div class="refund-footer">
                    <span class="refund-time">{{ item.refundTime || '-' }}</span>
                    <van-button
                      v-if="item.refundStatus === 0"
                      type="primary"
                      size="small"
                      plain
                      @click="openAudit(item)"
                    >审核</van-button>
                    <van-button
                      v-if="item.refundStatus === 1"
                      type="success"
                      size="small"
                      plain
                      @click="completeRefund(item)"
                    >完成退款</van-button>
                  </div>
                </div>
                <van-empty v-if="!refunds.length && !refundLoading" description="暂无退款申请" style="padding-top:40px" />
              </div>
            </van-list>
          </van-pull-refresh>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 订单详情弹窗 -->
    <van-popup v-model:show="showDetail" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar title="订单详情" right-text="关闭" @click-right="showDetail = false" />
        <van-cell-group inset v-if="orderDetail">
          <van-cell title="订单号" :value="orderDetail.orderId" />
          <van-cell title="状态">
            <template #value>
              <van-tag size="small" :type="orderStatusType(orderDetail.orderStatus)">
                {{ orderStatusMap[orderDetail.orderStatus] || '-' }}
              </van-tag>
            </template>
          </van-cell>
          <van-cell title="实付积分卡" :value="String(orderDetail.payAmount ?? 0)" />
          <van-cell title="总积分卡数" :value="String(orderDetail.totalAmount ?? 0)" />
          <van-cell title="创建时间" :value="orderDetail.createTime || '-'" />
          <van-cell title="支付时间" :value="orderDetail.payTime || '-'" />
          <van-cell title="收货人" :value="orderDetail.recipientName || '-'" />
          <van-cell title="收货电话" :value="orderDetail.recipientPhone || '-'" />
          <van-cell title="收货地址" :value="orderDetail.recipientAddress || '-'" />
          <van-cell title="用户备注" :value="orderDetail.remark || '-'" />
        </van-cell-group>

        <!-- 商品明细 -->
        <div class="detail-section" v-if="orderDetail?.items?.length">
          <div class="detail-title">商品明细</div>
          <div class="detail-item" v-for="(it, i) in orderDetail.items" :key="i">
            <img v-if="it.productImage" :src="it.productImage" class="detail-thumb" />
            <div class="detail-info">
              <div class="detail-name">{{ it.productName }}</div>
              <div class="detail-meta">{{ it.skuName || '-' }} ×{{ it.quantity }} | {{ it.pointType === 0 ? '积分卡' : '会员积分' }} | 单价 {{ it.price }}</div>
            </div>
          </div>
        </div>

        <!-- 物流信息 -->
        <div class="detail-section" v-if="orderDetail?.logistics">
          <div class="detail-title">物流信息</div>
          <van-cell-group inset>
            <van-cell title="快递公司" :value="orderDetail.logistics.logisticsCompany || '-'" />
            <van-cell title="物流单号" :value="orderDetail.logistics.logisticsNo || '-'" />
            <van-cell title="最新状态" :value="orderDetail.logistics.logisticsStatus || '-'" />
            <van-cell title="最后查询" :value="orderDetail.logistics.lastQueryTime || '-'" />
          </van-cell-group>
        </div>

        <!-- 退款信息 -->
        <div class="detail-section" v-if="orderDetail?.refund">
          <div class="detail-title">退款信息</div>
          <van-cell-group inset>
            <van-cell title="退款金额" :value="String(orderDetail.refund.refundAmount ?? 0) + ' 积分卡'" />
            <van-cell title="退款原因" :value="orderDetail.refund.refundReason || '-'" />
            <van-cell title="退款状态">
              <template #value>
                <van-tag size="small" :type="refundStatusType(orderDetail.refund.refundStatus)">
                  {{ refundStatusMap[orderDetail.refund.refundStatus] || '-' }}
                </van-tag>
              </template>
            </van-cell>
            <van-cell title="审核备注" :value="orderDetail.refund.auditRemark || '-'" />
            <van-cell title="完成时间" :value="orderDetail.refund.refundTime || '-'" />
          </van-cell-group>
        </div>

        <!-- 操作按钮 -->
        <div class="detail-actions" v-if="orderDetail">
          <van-button
            v-if="orderDetail.orderStatus === 1"
            type="primary"
            block
            style="margin:0 16px 16px"
            @click="openLogistics"
          >录入物流发货</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 录入物流弹窗 -->
    <van-popup v-model:show="showLogistics" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar title="录入物流" right-text="关闭" @click-right="showLogistics = false" />
        <van-form @submit="saveLogistics" style="padding:0 4px">
          <van-cell-group inset>
            <van-field v-model="logisticsForm.logisticsCompany" label="快递公司" placeholder="如 圆通快递" :rules="[{ required: true, message: '请填写' }]" />
            <van-field v-model="logisticsForm.logisticsCompanyCode" label="快递编码" placeholder="如 yuantong" />
            <van-field v-model="logisticsForm.logisticsNo" label="物流单号" placeholder="请输入" :rules="[{ required: true, message: '请填写' }]" />
          </van-cell-group>
          <div style="padding:16px">
            <van-button type="primary" native-type="submit" block :loading="logisticsLoading">确认发货</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 审核退款弹窗 -->
    <van-popup v-model:show="showAudit" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar title="审核退款" right-text="关闭" @click-right="showAudit = false" />
        <van-form @submit="submitAudit" style="padding:0 4px">
          <van-cell-group inset>
            <van-field name="approved" label="审核结果">
              <template #input>
                <van-radio-group direction="horizontal" v-model="auditForm.approved">
                  <van-radio :name="1">同意</van-radio>
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

    <!-- 筛选弹窗 -->
    <van-popup v-model:show="showOrderStatusFilter" round position="bottom">
      <van-picker :columns="orderStatusOpts" show-toolbar title="订单状态" @confirm="onOrderStatusConfirm" @cancel="showOrderStatusFilter = false" />
    </van-popup>
    <van-popup v-model:show="showRefundStatusFilter" round position="bottom">
      <van-picker :columns="refundStatusOpts" show-toolbar title="退款状态" @confirm="onRefundStatusConfirm" @cancel="showRefundStatusFilter = false" />
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showOrderStart" round position="bottom">
      <van-date-picker v-model="orderStartValue" title="选择开始时间" @confirm="onOrderStartConfirm" @cancel="showOrderStart = false" />
    </van-popup>
    <van-popup v-model:show="showOrderEnd" round position="bottom">
      <van-date-picker v-model="orderEndValue" title="选择结束时间" @confirm="onOrderEndConfirm" @cancel="showOrderEnd = false" />
    </van-popup>
    <van-popup v-model:show="showRefundStart" round position="bottom">
      <van-date-picker v-model="refundStartValue" title="选择开始时间" @confirm="onRefundStartConfirm" @cancel="showRefundStart = false" />
    </van-popup>
    <van-popup v-model:show="showRefundEnd" round position="bottom">
      <van-date-picker v-model="refundEndValue" title="选择结束时间" @confirm="onRefundEndConfirm" @cancel="showRefundEnd = false" />
    </van-popup>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, computed } from 'vue'
import { showToast, showLoadingToast } from 'vant'

const tabActive = ref(0)

const orderStatusMap = { 0: '待支付', 1: '已支付', 2: '已发货', 3: '已收货', 4: '退款中', 5: '已退款', 6: '已关闭' }
const refundStatusMap = { 0: '待审核', 1: '已同意', 2: '已拒绝', 3: '已完成' }

function orderStatusType(s) {
  if (s === 1 || s === 2) return 'primary'
  if (s === 3) return 'success'
  if (s === 0) return 'warning'
  if (s >= 4) return 'danger'
  return 'default'
}

function refundStatusType(s) {
  if (s === 1 || s === 3) return 'success'
  if (s === 2) return 'danger'
  return 'warning'
}

// --- 订单列表 ---
const orderParams = ref({
  current: 1,
  pageSize: 20,
  orderId: '',
  recipientPhone: '',
  orderStatus: undefined,
  createTimeStart: '',
  createTimeEnd: '',
  sortField: [],
})

const orderStatusOpts = [
  { text: '全部状态', value: undefined },
  { text: '待支付', value: 0 },
  { text: '已支付', value: 1 },
  { text: '已发货', value: 2 },
  { text: '已收货', value: 3 },
  { text: '退款中', value: 4 },
  { text: '已退款', value: 5 },
  { text: '已关闭', value: 6 },
]

const showOrderStatusFilter = ref(false)

const showOrderStart = ref(false)
const showOrderEnd = ref(false)
const orderStartValue = ref([])
const orderEndValue = ref([])

const orderStartDisplay = computed(() => orderParams.value.createTimeStart || '')
const orderEndDisplay = computed(() => orderParams.value.createTimeEnd || '')

function onOrderStartConfirm({ selectedValues }) {
  console.log(111, selectedValues.join('-'));
  orderStartValue.value = selectedValues
  orderParams.value.createTimeStart = selectedValues.join('-')
  showOrderStart.value = false
}

function onOrderEndConfirm({ selectedValues }) {
  orderEndValue.value = selectedValues
  orderParams.value.createTimeEnd = selectedValues.join('-')
  showOrderEnd.value = false
}

const orderStatusLabel = computed(() => {
  const f = orderStatusOpts.find(o => o.value === orderParams.value.orderStatus)
  return f ? `状态: ${f.text}` : '状态: 全部'
})

const orders = ref([])
const orderRefreshing = ref(false)
const orderLoading = ref(false)
const orderFinished = ref(false)
const orderTotal = ref(0)

// --- 退款列表 ---
const refundParams = ref({
  current: 1,
  pageSize: 20,
  orderId: '',
  refundStatus: undefined,
  createTimeStart: '',
  createTimeEnd: '',
  sortField: [],
})

const refundStatusOpts = [
  { text: '全部状态', value: undefined },
  { text: '待审核', value: 0 },
  { text: '已同意', value: 1 },
  { text: '已拒绝', value: 2 },
  { text: '已完成', value: 3 },
]

const showRefundStatusFilter = ref(false)

const showRefundStart = ref(false)
const showRefundEnd = ref(false)
const refundStartValue = ref([])
const refundEndValue = ref([])

const refundStartDisplay = computed(() => refundParams.value.createTimeStart || '')
const refundEndDisplay = computed(() => refundParams.value.createTimeEnd || '')

function onRefundStartConfirm({ selectedValues }) {
  refundStartValue.value = selectedValues
  refundParams.value.createTimeStart = selectedValues.join('-')
  showRefundStart.value = false
}

function onRefundEndConfirm({ selectedValues }) {
  refundEndValue.value = selectedValues
  refundParams.value.createTimeEnd = selectedValues.join('-')
  showRefundEnd.value = false
}

const refundStatusLabel = computed(() => {
  const f = refundStatusOpts.find(o => o.value === refundParams.value.refundStatus)
  return f ? `状态: ${f.text}` : '状态: 全部'
})

const refunds = ref([])
const refundRefreshing = ref(false)
const refundLoading = ref(false)
const refundFinished = ref(false)

// --- 订单详情 ---
const showDetail = ref(false)
const orderDetail = ref(null)

// --- 物流表单 ---
const showLogistics = ref(false)
const logisticsLoading = ref(false)
const logisticsForm = reactive({
  orderId: '',
  logisticsCompany: '',
  logisticsCompanyCode: '',
  logisticsNo: '',
})

// --- 审核表单 ---
const showAudit = ref(false)
const auditLoading = ref(false)
const auditForm = reactive({
  refundId: '',
  approved: 1,
  auditRemark: '',
})

onMounted(() => {
  onOrderLoad()
})

function onTabChange() {
  if (tabActive.value === 1 && !refunds.value.length) {
    onRefundLoad()
  }
}

// --- 订单列表 API ---
const getOrders = async (isRefresh) => {
  if (isRefresh) {
    orderParams.value.current = 1
    orders.value = []
    orderFinished.value = false
    orderTotal.value = 0
  }
  try {
    orderLoading.value = true
    const payload = { ...orderParams.value }
    Object.keys(payload).forEach(k => {
      if (payload[k] === undefined || payload[k] === '') delete payload[k]
    })
    const res = await api.post('/admin/pinball/shop/order/page', payload)
    if (res.code === 200) {
      const list = res.data?.data || []
      orderTotal.value = res.data?.total || 0
      if (isRefresh) orders.value = list
      else orders.value = [...orders.value, ...list]
      if (orders.value.length >= orderTotal.value) orderFinished.value = true
      orderParams.value.current++
    }
  } catch (e) { /* silent */ }
}

function onOrderRefresh() {
  getOrders(true).finally(() => { orderRefreshing.value = false })
}

function onOrderLoad() {
  getOrders(false).finally(() => { orderLoading.value = false })
}

function onOrderSearch() {
  onOrderRefresh()
}

function onOrderStatusConfirm({ selectedOptions }) {
  orderParams.value.orderStatus = selectedOptions[0].value
  showOrderStatusFilter.value = false
  onOrderSearch()
}

// --- 退款列表 API ---
const getRefunds = async (isRefresh) => {
  if (isRefresh) {
    refundParams.value.current = 1
    refunds.value = []
    refundFinished.value = false
  }
  try {
    refundLoading.value = true
    const payload = { ...refundParams.value }
    Object.keys(payload).forEach(k => {
      if (payload[k] === undefined || payload[k] === '') delete payload[k]
    })
    const res = await api.post('/admin/pinball/shop/refund/page', payload)
    if (res.code === 200) {
      const list = res.data?.data || []
      const totalRefund = res.data?.total || 0
      if (isRefresh) refunds.value = list
      else refunds.value = [...refunds.value, ...list]
      if (refunds.value.length >= totalRefund) refundFinished.value = true
      refundParams.value.current++
    }
  } catch (e) { /* silent */ }
}

function onRefundRefresh() {
  getRefunds(true).finally(() => { refundRefreshing.value = false })
}

function onRefundLoad() {
  getRefunds(false).finally(() => { refundLoading.value = false })
}

function onRefundSearch() {
  onRefundRefresh()
}

function onRefundStatusConfirm({ selectedOptions }) {
  refundParams.value.refundStatus = selectedOptions[0].value
  showRefundStatusFilter.value = false
  onRefundSearch()
}

// --- 订单详情 ---
const openOrderDetail = async (item) => {
  showDetail.value = true
  orderDetail.value = null
  const loading = showLoadingToast({ message: '加载中', forbidClick: true, duration: 0 })
  try {
    const res = await api.post('/admin/pinball/shop/order/detail', { orderId: item.orderId })
    loading.close()
    if (res.code === 200) {
      orderDetail.value = res.data
    } else {
      showToast(res.message)
    }
  } catch (e) {
    loading.close()
    showToast('系统错误')
  }
}

// --- 录入物流 ---
function openLogistics() {
  logisticsForm.orderId = orderDetail.value.orderId
  logisticsForm.logisticsCompany = ''
  logisticsForm.logisticsCompanyCode = ''
  logisticsForm.logisticsNo = ''
  showLogistics.value = true
}

const saveLogistics = async () => {
  try {
    logisticsLoading.value = true
    const res = await api.post('/admin/pinball/shop/logistics/save', logisticsForm)
    logisticsLoading.value = false
    if (res.code === 200) {
      showLogistics.value = false
      showToast('发货成功')
    } else {
      showToast(res.message)
    }
  } catch (e) {
    logisticsLoading.value = false
    showToast('系统错误')
  }
}

// --- 审核退款 ---
function openAudit(item) {
  auditForm.refundId = item.refundId
  auditForm.approved = 1
  auditForm.auditRemark = ''
  showAudit.value = true
}

const submitAudit = async () => {
  try {
    auditLoading.value = true
    const res = await api.post('/admin/pinball/shop/refund/audit', auditForm)
    auditLoading.value = false
    if (res.code === 200) {
      showAudit.value = false
      showToast('审核完成')
      onRefundRefresh()
    } else {
      showToast(res.message)
    }
  } catch (e) {
    auditLoading.value = false
    showToast('系统错误')
  }
}

const completeRefund = async (item) => {
  const loadingToast = showLoadingToast({ message: '处理中', forbidClick: true, duration: 0 })
  try {
    const res = await api.post('/admin/pinball/shop/refund/complete', { refundId: item.refundId })
    loadingToast.close()
    if (res.code === 200) {
      showToast('退款已完成')
      onRefundRefresh()
    } else {
      showToast(res.message)
    }
  } catch (e) {
    loadingToast.close()
    showToast('系统错误')
  }
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

.order-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  margin-top: 10px;
  cursor: pointer;
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.order-id {
  font-size: 14px;
  font-weight: 600;
  color: #7C3AED;
}

.order-body {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.order-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  background: #f5f6fa;
  flex-shrink: 0;
}

.order-info {
  flex: 1;
  min-width: 0;
}

.order-product-name {
  font-size: 14px;
  font-weight: 500;
  color: #111;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 12px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-time {
  font-size: 11px;
  color: #ccc;
}

/* 退款卡片 */
.refund-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  margin-top: 10px;
}

.refund-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.refund-amount {
  font-size: 15px;
  font-weight: 600;
  color: #EF4444;
}

.refund-reason {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.refund-meta {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.refund-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.refund-time {
  font-size: 11px;
  color: #ccc;
}

/* 详情弹窗 */
.detail-section {
  margin-top: 12px;
}

.detail-title {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  padding: 0 16px;
  margin-bottom: 8px;
}

.detail-item {
  display: flex;
  gap: 10px;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #f5f6fa;
}

.detail-thumb {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  background: #f5f6fa;
  flex-shrink: 0;
}

.detail-info {
  flex: 1;
  min-width: 0;
}

.detail-name {
  font-size: 14px;
  color: #111;
  margin-bottom: 2px;
}

.detail-meta {
  font-size: 11px;
  color: #999;
}

.detail-actions {
  padding-top: 12px;
}

.popup-wrap {
  overflow-y: auto;
  max-height: 90vh;
}
</style>
