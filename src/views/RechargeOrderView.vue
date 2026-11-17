<template>
  <div>
    <van-nav-bar title="充值订单" />

    <div class="page-scroll order-scroll">
      <div class="gradient-header">
        <div class="title">充值订单</div>
        <div class="subtitle">查询充值记录及资金流水</div>
      </div>

      <div class="search-row">
        <van-search
          v-model.trim="orderId"
          placeholder="搜索订单号"
          shape="round"
          background="#f5f6fa"
          @search="searchOrders"
          @clear="searchOrders"
        />
        <van-button size="small" type="primary" @click="searchOrders">查询</van-button>
        <van-button size="small" icon="filter-o" @click="openFilters">筛选</van-button>
      </div>

      <van-pull-refresh v-model="refreshing" @refresh="reloadOrders()">
        <van-list
          v-model:loading="loading"
          v-model:error="listError"
          :finished="finished"
          :finished-text="orders.length ? '没有更多了' : ''"
          error-text="加载失败，点击重试"
          @load="loadOrders"
        >
          <div class="section">
            <button
              v-for="item in orders"
              :key="item.orderId"
              type="button"
              class="order-card"
              @click="openDetail(item.orderId)"
            >
              <div class="card-header">
                <span class="card-no">{{ item.orderId }}</span>
                <van-tag size="small" :type="orderStatuses[item.orderStatus]?.type">
                  {{ orderStatuses[item.orderStatus]?.text || '-' }}
                </van-tag>
              </div>
              <div class="card-row">
                <span>充值用户</span>
                <span>{{ item.nickName || item.userName || item.userId || '-' }}</span>
              </div>
              <div class="card-row">
                <span>支付金额</span>
                <span class="card-amount">{{ formatAmount(item.payAmount, '元') }}</span>
              </div>
              <div class="card-row">
                <span>支付渠道</span>
                <span>{{ payChannels[item.payChannel] || item.payChannel || '-' }}</span>
              </div>
              <div class="card-row">
                <span>创建时间</span>
                <span>{{ item.createTime || '-' }}</span>
              </div>
            </button>
            <van-empty v-if="finished && !orders.length" description="暂无充值订单" />
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <van-popup v-model:show="showFilters" round position="bottom">
      <div class="popup-wrap">
        <van-nav-bar title="筛选充值订单" right-text="关闭" @click-right="showFilters = false" />
        <van-form @submit="applyFilters">
          <van-cell-group inset>
            <van-field v-model.trim="filters.userId" type="digit" label="用户ID" placeholder="请输入用户ID" />
            <van-field v-model.trim="filters.userName" label="用户账号" placeholder="请输入用户账号" />
            <van-field v-model.trim="filters.phoneNumber" type="tel" label="手机号" placeholder="请输入手机号" />
            <van-field label="订单状态">
              <template #input>
                <van-radio-group v-model="filters.orderStatus" direction="horizontal" class="filter-options">
                  <van-radio name="">全部</van-radio>
                  <van-radio v-for="(status, index) in orderStatuses" :key="index" :name="index">{{ status.text }}</van-radio>
                </van-radio-group>
              </template>
            </van-field>
            <van-field label="支付渠道">
              <template #input>
                <van-radio-group v-model="filters.payChannel" direction="horizontal" class="filter-options">
                  <van-radio name="">全部</van-radio>
                  <van-radio v-for="(label, channel) in payChannels" :key="channel" :name="channel">{{ label }}</van-radio>
                </van-radio-group>
              </template>
            </van-field>
            <van-cell title="创建日期起" is-link :value="filters.startDate || '请选择'" @click="openDatePicker('startDate')" />
            <van-cell title="创建日期止" is-link :value="filters.endDate || '请选择'" @click="openDatePicker('endDate')" />
          </van-cell-group>
          <div class="filter-actions section">
            <van-button block @click="Object.assign(filters, emptyFilters)">重置</van-button>
            <van-button block type="primary" native-type="submit">查询</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-popup v-model:show="showDatePicker" round position="bottom">
      <van-date-picker
        v-model="selectedDate"
        :title="dateField === 'startDate' ? '选择开始日期' : '选择结束日期'"
        @confirm="confirmDate"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showDetail" round position="bottom">
      <div class="popup-wrap">
        <van-nav-bar title="充值订单详情" right-text="关闭" @click-right="showDetail = false" />
        <van-loading v-if="detailLoading" class="section" />
        <template v-else-if="detail">
          <van-cell-group inset>
            <van-cell title="订单号" :value="detail.orderId || '-'" />
            <van-cell title="订单状态">
              <template #value>
                <van-tag size="small" :type="orderStatuses[detail.orderStatus]?.type">
                  {{ orderStatuses[detail.orderStatus]?.text || '-' }}
                </van-tag>
              </template>
            </van-cell>
            <van-cell title="用户ID" :value="detail.userId ?? '-'" />
            <van-cell title="用户账号" :value="detail.userName || '-'" />
            <van-cell title="用户昵称" :value="detail.nickName || '-'" />
            <van-cell title="手机号" :value="detail.phoneNumber || '-'" />
            <van-cell title="套餐ID" :value="detail.packageId ?? '-'" />
            <van-cell title="支付金额" :value="formatAmount(detail.payAmount, '元')" />
            <van-cell title="充值弹珠" :value="formatAmount(detail.marbleAmount, '个')" />
            <van-cell title="赠送弹珠" :value="formatAmount(detail.giftMarbleAmount, '个')" />
            <van-cell title="赠送积分卡" :value="formatAmount(detail.giftPointCardAmount, '张')" />
            <van-cell title="赠送会员积分" :value="formatAmount(detail.giftMemberPointAmount, '积分')" />
            <van-cell title="支付渠道" :value="payChannels[detail.payChannel] || detail.payChannel || '-'" />
            <van-cell title="第三方交易流水号" :value="detail.channelTradeNo || '-'" />
            <van-cell title="创建时间" :value="detail.createTime || '-'" />
            <van-cell title="支付时间" :value="detail.payTime || '-'" />
            <van-cell title="过期时间" :value="detail.expireTime || '-'" />
            <van-cell v-if="detail.remark" title="备注" :value="detail.remark" />
          </van-cell-group>

          <h3 class="section flow-title">资金流水</h3>
          <van-cell-group
            v-for="flow in detail.flows"
            :key="`${flow.accountType}-${flow.logId}`"
            :title="accountTypes[flow.accountType] || flow.accountType || '账户流水'"
            inset
          >
            <van-cell title="流水ID" :value="flow.logId ?? '-'" />
            <van-cell title="所属用户ID" :value="flow.userId ?? '-'" />
            <van-cell title="用户账号" :value="flow.userName || '-'" />
            <van-cell title="用户昵称" :value="flow.nickName || '-'" />
            <van-cell title="关联订单号" :value="flow.bizId || '-'" />
            <van-cell title="变更事件" :value="flow.changeCode || '-'" />
            <van-cell title="变更类型" :value="flow.changeType ?? '-'" />
            <van-cell title="变更数额" :value="formatAmount(flow.changeAmount, flow.unit)" />
            <van-cell title="变更前余额" :value="formatAmount(flow.beforeAmount, flow.unit)" />
            <van-cell title="变更后余额" :value="formatAmount(flow.afterAmount, flow.unit)" />
            <van-cell v-if="flow.commissionRate != null" title="返佣比例" :value="`${flow.commissionRate}%`" />
            <van-cell v-if="flow.activityId != null" title="返佣活动ID" :value="flow.activityId" />
            <van-cell v-if="flow.invitationRecordId != null" title="邀请记录ID" :value="flow.invitationRecordId" />
            <van-cell title="创建时间" :value="flow.createTime || '-'" />
            <van-cell v-if="flow.remark" title="备注" :value="flow.remark" />
          </van-cell-group>
          <van-empty v-if="!detail.flows?.length" description="暂无资金流水" />
        </template>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { showToast } from 'vant'

const orderStatuses = [
  { text: '待支付', type: 'warning' },
  { text: '支付成功', type: 'success' },
  { text: '支付失败', type: 'danger' },
  { text: '已关闭', type: 'default' },
]
const payChannels = { ALIPAY: '支付宝', WECHAT: '微信支付' }
const accountTypes = { MARBLE: '弹珠', POINT_CARD: '积分卡', MEMBER_POINT: '会员积分', WITHDRAW: '提现金额' }

const orderId = ref('')
const emptyFilters = { userId: '', userName: '', phoneNumber: '', orderStatus: '', payChannel: '', startDate: '', endDate: '' }
const filters = reactive({ ...emptyFilters })
const showFilters = ref(false)
const showDatePicker = ref(false)
const dateField = ref('')
const selectedDate = ref([])
let appliedFilters = { ...emptyFilters }
let query = {}

const PAGE_SIZE = 20
const orders = ref([])
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const listError = ref(false)
let current = 1

const showDetail = ref(false)
const detailLoading = ref(false)
const detail = ref(null)

function formatAmount(value, unit) {
  if (value == null) return '-'
  return unit ? `${value} ${unit}` : String(value)
}

function openFilters() {
  Object.assign(filters, appliedFilters)
  showFilters.value = true
}

function openDatePicker(field) {
  dateField.value = field
  selectedDate.value = filters[field] ? filters[field].split('-') : []
  showDatePicker.value = true
}

function confirmDate({ selectedValues }) {
  filters[dateField.value] = selectedValues.join('-')
  showDatePicker.value = false
}

function applyFilters() {
  if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
    showToast('开始日期不能晚于结束日期')
    return
  }
  appliedFilters = { ...filters }
  showFilters.value = false
  searchOrders()
}

function searchOrders() {
  const { startDate, endDate, userId, ...fields } = appliedFilters
  const numericUserId = Number(userId)
  reloadOrders({
    ...fields,
    orderId: orderId.value.trim(),
    userId: userId && Number.isSafeInteger(numericUserId) ? numericUserId : userId,
    startTime: startDate ? `${startDate} 00:00:00` : '',
    endTime: endDate ? `${endDate} 23:59:59` : '',
  })
}

function reloadOrders(nextQuery = query) {
  query = { ...nextQuery }
  current = 1
  orders.value = []
  finished.value = false
  listError.value = false
  loadOrders()
}

async function loadOrders() {
  const requestQuery = query
  const payload = { ...requestQuery, current, pageSize: PAGE_SIZE }
  Object.keys(payload).forEach(key => {
    if (payload[key] === '') delete payload[key]
  })
  loading.value = true
  try {
    const res = await api.post('/admin/pinball/recharge/order/page', payload)
    if (requestQuery !== query) return
    if (res.code !== 200) {
      listError.value = true
      showToast(res.message || '充值订单加载失败')
      return
    }
    const rows = res.data?.data || []
    orders.value = [...orders.value, ...rows]
    finished.value = !rows.length || orders.value.length >= res.data.total
    current++
  } catch {
    if (requestQuery === query) listError.value = true
  } finally {
    if (requestQuery === query) {
      loading.value = false
      refreshing.value = false
    }
  }
}

async function openDetail(orderId) {
  if (detailLoading.value) return
  showDetail.value = true
  detail.value = null
  detailLoading.value = true
  try {
    const res = await api.post('/admin/pinball/recharge/order/detail', { orderId })
    if (res.code === 200 && res.data) {
      detail.value = res.data
    } else {
      showDetail.value = false
      showToast(res.message || '订单详情加载失败')
    }
  } catch {
    showDetail.value = false
    showToast('订单详情加载失败')
  } finally {
    detailLoading.value = false
  }
}
</script>

<style scoped>
.order-scroll {
  height: calc(100dvh - var(--van-nav-bar-height));
}

.search-row,
.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-row {
  padding: 8px 16px 0;
}

.search-row .van-search {
  flex: 1;
  min-width: 0;
  padding: 0;
}

.filter-options {
  gap: 8px 0;
}

.order-card {
  width: 100%;
  padding: 14px;
  margin-bottom: 10px;
  background: #fff;
  border: 0;
  border-radius: 14px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.card-header,
.card-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}

.card-header {
  margin-bottom: 8px;
}

.card-no,
.card-row span:last-child,
.popup-wrap :deep(.van-cell__value) {
  overflow-wrap: anywhere;
}

.card-no {
  color: #7C3AED;
  font-size: 14px;
  font-weight: 600;
}

.card-header .van-tag,
.card-row span:first-child {
  flex-shrink: 0;
}

.card-row {
  color: #666;
  font-size: 13px;
  line-height: 1.8;
}

.card-amount {
  color: #EF4444;
  font-weight: 600;
}

.popup-wrap {
  max-height: 90vh;
  overflow-y: auto;
}

.flow-title {
  font-size: 16px;
}
</style>
