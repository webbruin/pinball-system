<template>
  <div>
    <van-nav-bar title="邀请好友">
      <template #right>
        <van-button type="primary" plain size="small" icon="plus" @click="openAdd">新增</van-button>
      </template>
    </van-nav-bar>

    <div class="page-scroll">
      <div class="gradient-header">
        <div class="title">邀请好友</div>
        <div class="subtitle">管理拉新邀请活动</div>
      </div>

      <!-- 搜索 + 筛选 -->
      <div class="search-row">
        <van-search v-model="params.activityName" placeholder="搜索活动名称..." shape="round" background="#f5f6fa" @search="onSearch" />
      </div>
      <div class="filter-row">
        <div class="filter-chip" @click="showFilterEnable = true">
          <span>{{ filterEnableLabel }}</span>
          <van-icon name="arrow-down" size="12" />
        </div>
      </div>

      <!-- 活动列表 -->
      <van-list
        v-model:loading="loading"
        :finished="finished"
        @load="onLoad"
      >
        <div class="section" style="margin-bottom:16px">
          <div class="activity-card" v-for="item in activities" :key="item.activityId">
            <div class="activity-header">
              <div class="activity-name">{{ item.activityName }}</div>
              <van-switch v-model="item.enableFlag" :active-value="1" :inactive-value="0" size="20px" @change="toggleStatus(item)" />
            </div>
            <div class="activity-desc" v-if="item.description">{{ item.description }}</div>
            <div class="activity-time">
              <van-icon name="clock-o" size="12" />
              <span>{{ item.startTime || '-' }} ~ {{ item.endTime || '-' }}</span>
            </div>
            <div class="reward-row">
              <span class="reward-item" v-if="item.rewardMarble">
                <van-icon name="gem-o" size="12" /> 弹珠×{{ item.rewardMarble }}
              </span>
              <span class="reward-item" v-if="item.rewardMemberPoint">
                <van-icon name="points" size="12" /> 会员积分×{{ item.rewardMemberPoint }}
              </span>
              <span class="reward-item" v-if="item.rewardPointCard">
                <van-icon name="coupon-o" size="12" /> 积分卡×{{ item.rewardPointCard }}
              </span>
              <span class="reward-item" v-if="item.rewardWithdrawAmount">
                <van-icon name="gold-coin-o" size="12" /> 提现¥{{ item.rewardWithdrawAmount }}
              </span>
            </div>
            <div class="activity-extra">
              <span class="extra-tag" v-if="item.inviteLimit > 0">邀请上限: {{ item.inviteLimit }}人</span>
              <span class="extra-tag" v-if="item.inviteLimit === 0">邀请人数不限</span>
              <span class="extra-tag" v-if="item.realNameRequired === 1">需实名</span>
              <span class="extra-tag" v-if="item.rechargeRequired === 1">需充值</span>
            </div>
            <div class="activity-actions">
              <van-button plain icon="edit" size="small" style="flex:1" @click="openEdit(item)">编辑</van-button>
              <van-button plain icon="records-o" size="small" style="flex:1" type="primary" @click="openRecords(item)">记录</van-button>
              <van-button plain icon="delete-o" size="small" color="#EF4444" style="flex:1" @click="removeActivity(item.activityId)">删除</van-button>
            </div>
          </div>
          <van-empty v-if="!activities.length && !loading" description="暂无活动数据" style="padding-top:40px" />
        </div>
      </van-list>
    </div>

    <!-- 新增/编辑弹窗 -->
    <van-popup v-model:show="showModal" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar :title="form.activityId ? '编辑活动' : '新增活动'" right-text="关闭" @click-right="showModal = false" />
        <van-form @submit="save" style="padding:0 4px">
          <van-cell-group inset>
            <van-field
              v-model="form.activityName"
              label="活动名称"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写活动名称' }]"
            />
            <van-field
              v-model="form.description"
              label="活动说明"
              placeholder="请输入"
              type="textarea"
              rows="2"
              autosize
            />
            <van-field
              v-model="startTimeDisplay"
              is-link
              readonly
              label="开始时间"
              placeholder="请选择"
              @click="showStartTimePicker = true"
            />
            <van-field
              v-model="endTimeDisplay"
              is-link
              readonly
              label="结束时间"
              placeholder="请选择"
              @click="showEndTimePicker = true"
            />
            <van-field
              v-model="form.rewardMarble"
              type="number"
              label="奖励弹珠"
              placeholder="请输入"
            />
            <van-field
              v-model="form.rewardMemberPoint"
              type="number"
              label="奖励会员积分"
              placeholder="请输入"
            />
            <van-field
              v-model="form.rewardPointCard"
              type="number"
              label="奖励积分卡"
              placeholder="请输入"
            />
            <van-field
              v-model="form.rewardWithdrawAmount"
              type="number"
              label="提现金额"
              placeholder="仅记录，不发放"
            />
            <van-field
              v-model="form.inviteLimit"
              type="number"
              label="邀请上限"
              placeholder="0表示不限"
            />
            <van-field name="enableFlag" label="启用状态">
              <template #input>
                <van-radio-group direction="horizontal" v-model="form.enableFlag">
                  <van-radio :name="1">启用</van-radio>
                  <van-radio :name="0">禁用</van-radio>
                </van-radio-group>
              </template>
            </van-field>
            <van-field name="realNameRequired" label="要求实名">
              <template #input>
                <van-radio-group direction="horizontal" v-model="form.realNameRequired">
                  <van-radio :name="0">否</van-radio>
                  <van-radio :name="1">是</van-radio>
                </van-radio-group>
              </template>
            </van-field>
            <van-field name="rechargeRequired" label="要求充值">
              <template #input>
                <van-radio-group direction="horizontal" v-model="form.rechargeRequired">
                  <van-radio :name="0">否</van-radio>
                  <van-radio :name="1">是</van-radio>
                </van-radio-group>
              </template>
            </van-field>
          </van-cell-group>
          <div style="padding:16px">
            <van-button type="primary" native-type="submit" block :loading="submitLoading">
              {{ form.activityId ? '保存修改' : '新增活动' }}
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 开始时间选择器 -->
    <van-popup v-model:show="showStartTimePicker" round position="bottom">
      <van-date-picker
        v-model="startTimeValue"
        title="选择开始时间"
        :min-date="minDate"
        @confirm="onStartTimeConfirm"
        @cancel="showStartTimePicker = false"
      />
    </van-popup>

    <!-- 结束时间选择器 -->
    <van-popup v-model:show="showEndTimePicker" round position="bottom">
      <van-date-picker
        v-model="endTimeValue"
        title="选择结束时间"
        :min-date="minDate"
        @confirm="onEndTimeConfirm"
        @cancel="showEndTimePicker = false"
      />
    </van-popup>

    <!-- 启用状态筛选弹窗 -->
    <van-popup v-model:show="showFilterEnable" round position="bottom">
      <van-picker
        :columns="enableOpts"
        show-toolbar
        title="筛选状态"
        @confirm="onFilterEnableConfirm"
        @cancel="showFilterEnable = false"
      />
    </van-popup>

    <!-- 邀请记录弹窗 -->
    <van-popup v-model:show="showRecords" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar title="邀请记录" right-text="关闭" @click-right="showRecords = false" />
        <div class="record-filters">
          <van-field v-model="recordParams.inviterUserId" label="邀请人ID" placeholder="请输入" />
          <van-field v-model="recordParams.inviteePhone" label="被邀请人手机" placeholder="请输入" />
          <div class="filter-chip" @click="showFilterRecordStatus = true" style="margin:8px 16px">
            <span>{{ recordStatusLabel }}</span>
            <van-icon name="arrow-down" size="12" />
          </div>
        </div>
        <van-list
          v-model:loading="recordLoading"
          :finished="recordFinished"
          finished-text="没有更多了"
          @load="onRecordLoad"
        >
          <div class="record-card" v-for="item in records" :key="item.recordId">
            <div class="record-row">
              <span class="record-label">邀请人</span>
              <span>{{ item.inviterNickName || '-' }} (ID: {{ item.inviterUserId }})</span>
            </div>
            <div class="record-row">
              <span class="record-label">被邀请人</span>
              <span>{{ item.inviteePhone || '-' }} (ID: {{ item.inviteeUserId || '-' }})</span>
            </div>
            <div class="record-row">
              <span class="record-label">邀请码</span>
              <span>{{ item.invitationCode || '-' }}</span>
            </div>
            <div class="record-row">
              <span class="record-label">邀请时间</span>
              <span>{{ item.inviteTime || '-' }}</span>
            </div>
            <div class="record-row">
              <span class="record-label">实名进度</span>
              <van-tag size="small" :type="item.realNameStatus === 1 ? 'success' : 'default'">
                {{ item.realNameStatus === 1 ? '已完成' : '未完成' }}
              </van-tag>
              <span v-if="item.realNameTime" class="record-time">{{ item.realNameTime }}</span>
            </div>
            <div class="record-row">
              <span class="record-label">充值进度</span>
              <van-tag size="small" :type="item.rechargeStatus === 1 ? 'success' : 'default'">
                {{ item.rechargeStatus === 1 ? '已完成' : '未完成' }}
              </van-tag>
              <span v-if="item.rechargeTime" class="record-time">{{ item.rechargeTime }}</span>
            </div>
            <div class="record-row">
              <span class="record-label">奖励发放</span>
              <van-tag size="small" :type="item.rewardStatus === 1 ? 'success' : 'warning'">
                {{ item.rewardStatus === 1 ? '已发放' : '未发放' }}
              </van-tag>
              <span v-if="item.rewardTime" class="record-time">{{ item.rewardTime }}</span>
            </div>
            <div class="record-status-tag">
              <van-tag :type="recordStatusType(item.recordStatus)" size="small">
                {{ recordStatusMap[item.recordStatus] || '-' }}
              </van-tag>
            </div>
          </div>
          <van-empty v-if="!records.length && !recordLoading" description="暂无记录" style="padding-top:20px" />
        </van-list>
      </div>
    </van-popup>

    <!-- 记录状态筛选弹窗 -->
    <van-popup v-model:show="showFilterRecordStatus" round position="bottom">
      <van-picker
        :columns="recordStatusOpts"
        show-toolbar
        title="筛选状态"
        @confirm="onFilterRecordStatusConfirm"
        @cancel="showFilterRecordStatus = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, computed } from 'vue'
import { showConfirmDialog, showToast, showLoadingToast } from 'vant'

// --- 查询参数 ---
const params = ref({
  current: 1,
  pageSize: 20,
  activityName: '',
  enableFlag: undefined,
  sortField: [],
})

const enableOpts = [
  { text: '全部状态', value: undefined },
  { text: '启用', value: 1 },
  { text: '禁用', value: 0 },
]

const showFilterEnable = ref(false)

const filterEnableLabel = computed(() => {
  const found = enableOpts.find(o => o.value === params.value.enableFlag)
  return found ? `状态: ${found.text}` : '状态: 全部'
})

// --- 活动列表 ---
const activities = ref([])
const loading = ref(false)
const finished = ref(false)
const total = ref(0)

// --- 活动表单 ---
const showModal = ref(false)
const submitLoading = ref(false)
const showStartTimePicker = ref(false)
const showEndTimePicker = ref(false)
const startTimeValue = ref([])
const endTimeValue = ref([])
const minDate = ref(new Date(2020, 0, 1))

const startTimeDisplay = computed(() => form.startTime || '')
const endTimeDisplay = computed(() => form.endTime || '')

function onStartTimeConfirm({ selectedValues }) {
  startTimeValue.value = selectedValues
  form.startTime = startTimeValue.value.join('-') + ' 00:00:00'
  showStartTimePicker.value = false
}

function onEndTimeConfirm({ selectedValues }) {
  endTimeValue.value = selectedValues
  form.endTime = endTimeValue.value.join('-') + ' 00:00:00'
  showEndTimePicker.value = false
}

const form = reactive({
  activityId: '',
  activityName: '',
  description: '',
  enableFlag: 0,
  endTime: '',
  inviteLimit: 0,
  realNameRequired: 0,
  rechargeRequired: 0,
  rewardMarble: 0,
  rewardMemberPoint: 0,
  rewardPointCard: 0,
  rewardWithdrawAmount: '',
  startTime: '',
})

// --- 邀请记录 ---
const showRecords = ref(false)
const records = ref([])
const recordLoading = ref(false)
const recordFinished = ref(false)
const currentActivityId = ref('')
const showFilterRecordStatus = ref(false)

const recordParams = reactive({
  current: 1,
  pageSize: 20,
  activityId: '',
  inviterUserId: '',
  inviteePhone: '',
  recordStatus: undefined,
  sortField: [],
})

const recordStatusOpts = [
  { text: '全部状态', value: undefined },
  { text: '进行中', value: 1 },
  { text: '成功', value: 2 },
  { text: '失败', value: 3 },
]

const recordStatusMap = { 1: '进行中', 2: '成功', 3: '失败' }

function recordStatusType(status) {
  return status === 2 ? 'success' : status === 3 ? 'danger' : 'warning'
}

const recordStatusLabel = computed(() => {
  const found = recordStatusOpts.find(o => o.value === recordParams.recordStatus)
  return found ? `状态: ${found.text}` : '状态: 全部'
})

// --- 初始化 ---
onMounted(() => {
  onLoad()
})

// --- 活动列表 ---
const getActivities = async (isRefresh) => {
  if (isRefresh) {
    params.value.current = 1
    activities.value = []
    finished.value = false
    total.value = 0
  }
  try {
    loading.value = true
    const payload = { ...params.value }
    Object.keys(payload).forEach(k => {
      if (payload[k] === undefined || payload[k] === '') delete payload[k]
    })
    const res = await api.post('/admin/pinball/invitation/activity/page', payload)
    if (res.code === 200) {
      const list = res.data?.data || []
      total.value = res.data?.total || 0
      if (isRefresh) {
        activities.value = list
      } else {
        activities.value = [...activities.value, ...list]
      }
      if (activities.value.length >= total.value) {
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
  getActivities(true)
}

async function onLoad() {
  getActivities(false).finally(() => {
    loading.value = false
  })
}

function onSearch() {
  onRefresh()
}

// 切换启用状态
const toggleStatus = async (item) => {
  try {
    const res = await api.post('/admin/pinball/invitation/activity/save', {
      activityId: item.activityId,
      activityName: item.activityName,
      description: item.description || '',
      enableFlag: item.enableFlag,
      endTime: item.endTime || '',
      inviteLimit: item.inviteLimit ?? 0,
      realNameRequired: item.realNameRequired ?? 0,
      rechargeRequired: item.rechargeRequired ?? 0,
      rewardMarble: item.rewardMarble ?? 0,
      rewardMemberPoint: item.rewardMemberPoint ?? 0,
      rewardPointCard: item.rewardPointCard ?? 0,
      rewardWithdrawAmount: item.rewardWithdrawAmount ?? 0,
      startTime: item.startTime || '',
    })
    if (res.code !== 200) {
      item.enableFlag = item.enableFlag === 1 ? 0 : 1
      showToast(res.message)
    }
  } catch (e) {
    item.enableFlag = item.enableFlag === 1 ? 0 : 1
    showToast('系统错误')
  }
}

// --- 活动新增/编辑 ---
const createOrUpdate = async () => {
  try {
    submitLoading.value = true
    const res = await api.post('/admin/pinball/invitation/activity/save', form)
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

const deleteActivity = async (activityId) => {
  try {
    const res = await api.post('/admin/pinball/invitation/activity/delete', { activityId })
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
  form.activityId = ''
  form.activityName = ''
  form.description = ''
  form.enableFlag = 0
  form.endTime = ''
  form.inviteLimit = 0
  form.realNameRequired = 0
  form.rechargeRequired = 0
  form.rewardMarble = 0
  form.rewardMemberPoint = 0
  form.rewardPointCard = 0
  form.rewardWithdrawAmount = ''
  form.startTime = ''
  showModal.value = true
}

function openEdit(item) {
  form.activityId = item.activityId
  form.activityName = item.activityName
  form.description = item.description || ''
  form.enableFlag = item.enableFlag
  form.endTime = item.endTime || ''
  form.inviteLimit = item.inviteLimit ?? 0
  form.realNameRequired = item.realNameRequired ?? 0
  form.rechargeRequired = item.rechargeRequired ?? 0
  form.rewardMarble = item.rewardMarble ?? 0
  form.rewardMemberPoint = item.rewardMemberPoint ?? 0
  form.rewardPointCard = item.rewardPointCard ?? 0
  form.rewardWithdrawAmount = item.rewardWithdrawAmount ?? 0
  form.startTime = item.startTime || ''
  showModal.value = true
}

function save() {
  createOrUpdate()
}

function removeActivity(activityId) {
  showConfirmDialog({ message: '确认删除该活动吗' })
    .then(() => deleteActivity(activityId))
    .catch(() => {})
}

function onFilterEnableConfirm({ selectedOptions }) {
  params.value.enableFlag = selectedOptions[0].value
  showFilterEnable.value = false
  onSearch()
}

// --- 邀请记录 ---
function openRecords(item) {
  currentActivityId.value = item.activityId
  recordParams.activityId = item.activityId
  recordParams.current = 1
  recordParams.inviterUserId = ''
  recordParams.inviteePhone = ''
  recordParams.recordStatus = undefined
  records.value = []
  recordFinished.value = false
  showRecords.value = true
  loadRecords(true)
}

const loadRecords = async (isRefresh) => {
  if (isRefresh) {
    recordParams.current = 1
    records.value = []
    recordFinished.value = false
  }
  try {
    recordLoading.value = true
    const payload = { ...recordParams }
    Object.keys(payload).forEach(k => {
      if (payload[k] === undefined || payload[k] === '') delete payload[k]
    })
    const res = await api.post('/admin/pinball/invitation/record/page', payload)
    if (res.code === 200) {
      const list = res.data?.data || []
      if (isRefresh) {
        records.value = list
      } else {
        records.value = [...records.value, ...list]
      }
      const totalRecords = res.data?.total || 0
      if (records.value.length >= totalRecords) {
        recordFinished.value = true
      }
      recordParams.current++
    } else {
      showToast(res.message)
    }
  } catch (e) {
    showToast('系统错误')
  }
}

function onRecordLoad() {
  loadRecords(false).finally(() => {
    recordLoading.value = false
  })
}

function onRecordFilter() {
  loadRecords(true).finally(() => {
    recordLoading.value = false
  })
}

function onFilterRecordStatusConfirm({ selectedOptions }) {
  recordParams.recordStatus = selectedOptions[0].value
  showFilterRecordStatus.value = false
  onRecordFilter()
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

.activity-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  margin-top: 12px;
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.activity-name {
  font-size: 16px;
  font-weight: 600;
  color: #111;
  flex: 1;
  min-width: 0;
  margin-right: 12px;
}

.activity-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.activity-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.reward-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #7C3AED;
  background: #f5f3ff;
  padding: 3px 8px;
  border-radius: 10px;
}

.activity-extra {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.extra-tag {
  font-size: 11px;
  color: #666;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 8px;
}

.activity-actions {
  display: flex;
  gap: 8px;
}

/* 记录弹窗 */
.record-filters {
  background: #f5f6fa;
  padding-bottom: 8px;
}

.record-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin: 8px 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  position: relative;
}

.record-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #323233;
  margin-bottom: 4px;
}

.record-label {
  color: #999;
  width: 64px;
  flex-shrink: 0;
}

.record-time {
  font-size: 11px;
  color: #999;
  margin-left: 4px;
}

.record-status-tag {
  position: absolute;
  top: 12px;
  right: 12px;
}

.popup-wrap {
  overflow-y: auto;
  max-height: 90vh;
}
</style>
