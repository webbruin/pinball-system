<template>
  <div>
    <van-nav-bar title="MQTT日志" />

    <div class="page-scroll">
      <div class="gradient-header">
        <div class="title">MQTT消息日志</div>
        <div class="subtitle">总计 {{ total }} 条记录</div>
      </div>

      <!-- 筛选 -->
      <div class="search-row">
        <van-search v-model="params.deviceId" placeholder="搜索设备ID..." shape="round" background="#f5f6fa" @search="onSearch" />
      </div>
      <div class="search-row" style="padding-top:0">
        <van-search v-model="params.cmd" placeholder="搜索指令码..." shape="round" background="#f5f6fa" @search="onSearch" />
      </div>
      <div class="filter-row">
        <div class="filter-chip" @click="showFilterDirection = true">
          <span>{{ filterDirectionLabel }}</span>
          <van-icon name="arrow-down" size="12" />
        </div>
        <div class="filter-chip" @click="showFilterStatus = true">
          <span>{{ filterStatusLabel }}</span>
          <van-icon name="arrow-down" size="12" />
        </div>
      </div>

      <!-- 时间范围 -->
      <div class="filter-row">
        <van-field v-model="beginTimeDisplay" readonly label="起" placeholder="请选择" style="flex:1;padding:0" @click="showBeginTime = true" label-width="20px" />
        <van-field v-model="endTimeDisplay" readonly label="止" placeholder="请选择" style="flex:1;padding:0" @click="showEndTime = true" label-width="20px" />
        <van-button type="primary" size="small" @click="onSearch" style="flex-shrink:0">查询</van-button>
      </div>

      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <div class="section" style="margin-bottom:16px">
          <div class="log-card" v-for="item in logs" :key="item.logId" @click="openDetail(item)">
            <div class="log-header">
              <span class="log-cmd">{{ item.cmd || '-' }}</span>
              <van-tag size="small" :type="item.status === 0 ? 'success' : 'danger'">
                {{ item.status === 0 ? '成功' : '失败' }}
              </van-tag>
            </div>
            <div class="log-meta">
              <span class="meta-item">设备: {{ item.deviceId || '-' }}</span>
              <span class="meta-item">{{ item.topic || '-' }}</span>
            </div>
            <div class="log-footer">
              <van-tag size="small" :type="item.direction === 0 ? 'primary' : 'warning'" plain>
                {{ item.direction === 0 ? '下行发送' : '上行接收' }}
              </van-tag>
              <span class="log-time">{{ item.createTime || '-' }}</span>
            </div>
          </div>
          <van-empty v-if="!logs.length && !loading" description="暂无日志数据" style="padding-top:40px" />
        </div>
      </van-list>
    </div>

    <!-- 详情弹窗 -->
    <van-popup v-model:show="showDetail" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar title="消息详情" right-text="关闭" @click-right="showDetail = false" />
        <van-cell-group inset v-if="detail">
          <van-cell title="日志ID" :value="detail.logId" />
          <van-cell title="设备ID" :value="detail.deviceId || '-'" />
          <van-cell title="指令码" :value="detail.cmd || '-'" />
          <van-cell title="MQTT主题" :value="detail.topic || '-'" label-class="cell-label" />
          <van-cell title="方向">
            <template #value>
              <van-tag size="small" :type="detail.direction === 0 ? 'primary' : 'warning'">
                {{ detail.direction === 0 ? '下行发送' : '上行接收' }}
              </van-tag>
            </template>
          </van-cell>
          <van-cell title="状态">
            <template #value>
              <van-tag size="small" :type="detail.status === 0 ? 'success' : 'danger'">
                {{ detail.status === 0 ? '成功' : '失败' }}
              </van-tag>
            </template>
          </van-cell>
          <van-cell title="错误信息" :value="detail.errorMsg || '-'" />
          <van-cell title="创建时间" :value="detail.createTime || '-'" />
        </van-cell-group>
        <div class="payload-section" v-if="detail.payload">
          <div class="payload-title">完整报文</div>
          <pre class="payload-content">{{ formatJson(detail.payload) }}</pre>
        </div>
      </div>
    </van-popup>

    <!-- 筛选弹窗 -->
    <van-popup v-model:show="showFilterDirection" round position="bottom">
      <van-picker :columns="directionOpts" show-toolbar title="筛选方向" @confirm="onFilterDirectionConfirm" @cancel="showFilterDirection = false" />
    </van-popup>
    <van-popup v-model:show="showFilterStatus" round position="bottom">
      <van-picker :columns="logStatusOpts" show-toolbar title="筛选状态" @confirm="onFilterStatusConfirm" @cancel="showFilterStatus = false" />
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showBeginTime" round position="bottom">
      <van-date-picker v-model="beginTimeValue" title="选择开始时间" @confirm="onBeginTimeConfirm" @cancel="showBeginTime = false" />
    </van-popup>
    <van-popup v-model:show="showEndTime" round position="bottom">
      <van-date-picker v-model="endTimeValue" title="选择结束时间" @confirm="onEndTimeConfirm" @cancel="showEndTime = false" />
    </van-popup>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'

const params = ref({
  current: 1,
  pageSize: 20,
  deviceId: '',
  cmd: '',
  direction: undefined,
  status: undefined,
  beginTime: '',
  endTime: '',
  sortField: [],
})

const directionOpts = [
  { text: '全部方向', value: undefined },
  { text: '下行发送', value: 0 },
  { text: '上行接收', value: 1 },
]

const logStatusOpts = [
  { text: '全部状态', value: undefined },
  { text: '成功', value: 0 },
  { text: '失败', value: 1 },
]

const showFilterDirection = ref(false)
const showFilterStatus = ref(false)

const showBeginTime = ref(false)
const showEndTime = ref(false)
const beginTimeValue = ref([])
const endTimeValue = ref([])

const beginTimeDisplay = computed(() => params.value.beginTime || '')
const endTimeDisplay = computed(() => params.value.endTime || '')

function onBeginTimeConfirm({ selectedValues }) {
  beginTimeValue.value = selectedValues
  params.value.beginTime = selectedValues.join('-')
  showBeginTime.value = false
}

function onEndTimeConfirm({ selectedValues }) {
  endTimeValue.value = selectedValues
  params.value.endTime = selectedValues.join('-')
  showEndTime.value = false
}

const filterDirectionLabel = computed(() => {
  const found = directionOpts.find(o => o.value === params.value.direction)
  return found ? `方向: ${found.text}` : '方向: 全部'
})

const filterStatusLabel = computed(() => {
  const found = logStatusOpts.find(o => o.value === params.value.status)
  return found ? `状态: ${found.text}` : '状态: 全部'
})

const logs = ref([])
const loading = ref(false)
const finished = ref(false)
const total = ref(0)

const showDetail = ref(false)
const detail = ref(null)

onMounted(() => {
  onLoad()
})

const getList = async (isRefresh) => {
  if (isRefresh) {
    params.value.current = 1
    logs.value = []
    finished.value = false
    total.value = 0
  }
  try {
    loading.value = true
    const payload = { ...params.value }
    Object.keys(payload).forEach(k => {
      if (payload[k] === undefined || payload[k] === '') delete payload[k]
    })
    const res = await api.post('/admin/pinball/mqttLog/page', payload)
    if (res.code === 200) {
      const list = res.data?.data || []
      total.value = res.data?.total || 0
      if (isRefresh) {
        logs.value = list
      } else {
        logs.value = [...logs.value, ...list]
      }
      if (logs.value.length >= total.value) finished.value = true
      params.value.current++
    }
  } catch (e) {
    // silent
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

function onFilterDirectionConfirm({ selectedOptions }) {
  params.value.direction = selectedOptions[0].value
  showFilterDirection.value = false
  onSearch()
}

function onFilterStatusConfirm({ selectedOptions }) {
  params.value.status = selectedOptions[0].value
  showFilterStatus.value = false
  onSearch()
}

function openDetail(item) {
  detail.value = item
  showDetail.value = true
}

function formatJson(str) {
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
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

.log-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  margin-top: 10px;
  cursor: pointer;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.log-cmd {
  font-size: 15px;
  font-weight: 600;
  color: #111;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.log-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.meta-item {
  font-size: 12px;
  color: #666;
}

.log-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.log-time {
  font-size: 11px;
  color: #bbb;
}

.cell-label {
  word-break: break-all;
}

.payload-section {
  margin: 12px 16px;
}

.payload-title {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.payload-content {
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 10px;
  padding: 12px;
  font-size: 11px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}

.popup-wrap {
  overflow-y: auto;
  max-height: 90vh;
}
</style>
