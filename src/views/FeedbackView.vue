<template>
  <div>
    <van-nav-bar title="用户反馈" />

    <div class="page-scroll">
      <div class="gradient-header">
        <div class="title">用户反馈</div>
        <div class="subtitle">查看与回复用户反馈</div>
      </div>

      <div class="search-row">
        <van-search v-model="params.feedbackType" placeholder="搜索问题类型..." shape="round" background="#f5f6fa" @search="onSearch" />
      </div>
      <div class="filter-row">
        <van-field v-model="startDisplay" readonly label="起" placeholder="请选择" style="flex:1;padding:0" @click="showStart = true" label-width="20px" />
        <van-field v-model="endDisplay" readonly label="止" placeholder="请选择" style="flex:1;padding:0" @click="showEnd = true" label-width="20px" />
        <van-button type="primary" size="small" @click="onSearch">查询</van-button>
      </div>

      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <div class="section" style="margin-bottom:16px">
          <div class="feedback-card" v-for="item in list" :key="item.feedbackId" @click="openDetail(item)">
            <div class="fb-header">
              <img v-if="item.avatar" :src="item.avatar" class="fb-avatar" />
              <van-icon v-else name="manager-o" size="20" color="#ccc" class="fb-avatar" />
              <div class="fb-user">
                <div class="fb-nick">{{ item.nickName || '匿名用户' }}</div>
                <div class="fb-meta">用户ID: {{ item.userId || '-' }}</div>
              </div>
              <van-tag size="small" type="primary" plain>{{ item.feedbackType || '未分类' }}</van-tag>
            </div>
            <div class="fb-content">{{ item.content || '-' }}</div>
            <div class="fb-images" v-if="imageList(item.images).length">
              <img v-for="(img, i) in imageList(item.images)" :key="i" :src="img" class="fb-img" />
            </div>
            <div class="fb-footer">
              <span class="fb-time">{{ item.createTime || '-' }}</span>
              <span class="fb-reply-status" :class="{ replied: item.replyContent }">
                {{ item.replyContent ? '已回复' : '待回复' }}
              </span>
            </div>
          </div>
          <van-empty v-if="!list.length && !loading" description="暂无反馈数据" style="padding-top:40px" />
        </div>
      </van-list>
    </div>

    <!-- 详情弹窗 -->
    <van-popup v-model:show="showDetail" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar title="反馈详情" right-text="关闭" @click-right="showDetail = false" />
        <van-cell-group inset v-if="detail">
          <van-cell title="用户昵称" :value="detail.nickName || '-'" />
          <van-cell title="用户ID" :value="detail.userId || '-'" />
          <van-cell title="问题类型" :value="detail.feedbackType || '-'" />
          <van-cell title="关联订单" :value="detail.orderId || '-'" />
          <van-cell title="创建时间" :value="detail.createTime || '-'" />
          <van-cell title="反馈内容" :value="detail.content || '-'" />
          <van-cell v-if="detail.replyContent" title="回复内容" :value="detail.replyContent" />
          <van-cell v-if="detail.replyUserName" title="回复人" :value="detail.replyUserName" />
          <van-cell v-if="detail.replyTime" title="回复时间" :value="detail.replyTime" />
        </van-cell-group>

        <div class="detail-images" v-if="detail && imageList(detail.images).length">
          <div class="detail-title">反馈图片</div>
          <div class="detail-img-list">
            <img v-for="(img, i) in imageList(detail.images)" :key="i" :src="img" class="detail-img" @click="previewImage(detail.images, i)" />
          </div>
        </div>

        <div class="detail-actions" v-if="detail">
          <van-button type="primary" block style="margin:0 16px 16px" @click="openReply">回复</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 回复弹窗 -->
    <van-popup v-model:show="showReply" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar title="填写回复" right-text="关闭" @click-right="showReply = false" />
        <van-form @submit="submitReply" style="padding:0 4px">
          <van-cell-group inset>
            <van-field v-model="replyForm.replyContent" label="回复内容" placeholder="请输入回复内容" type="textarea" rows="4" autosize :rules="[{ required: true, message: '请填写回复内容' }]" />
          </van-cell-group>
          <div style="padding:16px">
            <van-button type="primary" native-type="submit" block :loading="replyLoading">提交回复</van-button>
          </div>
        </van-form>
      </div>
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
import { showToast, showLoadingToast, showImagePreview } from 'vant'

const params = ref({
  current: 1,
  pageSize: 20,
  feedbackType: '',
  createTimeStart: '',
  createTimeEnd: '',
  sortField: [],
})

const showStart = ref(false)
const showEnd = ref(false)
const startValue = ref([])
const endValue = ref([])

const startDisplay = computed(() => params.value.createTimeStart || '')
const endDisplay = computed(() => params.value.createTimeEnd || '')

function onStartConfirm({ selectedValues }) {
  startValue.value = selectedValues
  params.value.createTimeStart = selectedValues.join('-')
  showStart.value = false
}

function onEndConfirm({ selectedValues }) {
  endValue.value = selectedValues
  params.value.createTimeEnd = selectedValues.join('-')
  showEnd.value = false
}

const list = ref([])
const loading = ref(false)
const finished = ref(false)
let total = 0

// 图片字段可能是 JSON 数组字符串，解析为数组
function imageList(images) {
  if (!images) return []
  if (Array.isArray(images)) return images
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

function previewImage(images, index = 0) {
  showImagePreview({
    images: imageList(images),
    startPosition: index,
  })
}

const showDetail = ref(false)
const detail = ref(null)

const showReply = ref(false)
const replyLoading = ref(false)
const replyForm = reactive({
  feedbackId: '',
  replyContent: '',
})

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
    const res = await api.post('/admin/pinball/feedback/page', payload)
    if (res.code === 200) {
      const data = res.data?.data || []
      total = res.data?.total || 0
      if (isRefresh) list.value = data
      else list.value = [...list.value, ...data]
      if (list.value.length >= total) finished.value = true
      params.value.current++
    } else {
      showToast(res.message)
    }
  } catch (e) { /* silent */ }
}

function onLoad() {
  getList(false).finally(() => { loading.value = false })
}

function onSearch() {
  params.value.current = 1
  list.value = []
  finished.value = false
  total = 0
  getList(true)
}

const openDetail = async (item) => {
  showDetail.value = true
  detail.value = item
  // detail.value = null
  // const loadingToast = showLoadingToast({ message: '加载中', forbidClick: true, duration: 0 })
  // try {
  //   const res = await api.post('/admin/pinball/feedback/detail', { feedbackId: item.feedbackId })
  //   loadingToast.close()
  //   if (res.code === 200) {
  //     detail.value = res.data
  //   } else {
  //     showToast(res.message)
  //   }
  // } catch (e) {
  //   loadingToast.close()
  //   showToast('系统错误')
  // }
}

function openReply() {
  replyForm.feedbackId = detail.value.feedbackId
  replyForm.replyContent = ''
  showReply.value = true
}

const submitReply = async () => {
  try {
    replyLoading.value = true
    const res = await api.post('/admin/pinball/feedback/reply', replyForm)
    replyLoading.value = false
    if (res.code === 200) {
      showReply.value = false
      showToast('回复成功')
      showDetail.value = false
      onSearch()
    } else {
      showToast(res.message)
    }
  } catch (e) {
    replyLoading.value = false
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

.feedback-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  margin-top: 10px;
  cursor: pointer;
}

.fb-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.fb-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: #f5f6fa;
  flex-shrink: 0;
}

.fb-user {
  flex: 1;
  min-width: 0;
}

.fb-nick {
  font-size: 14px;
  font-weight: 600;
  color: #111;
}

.fb-meta {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.fb-content {
  font-size: 13px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 10px;
  word-break: break-all;
}

.fb-images {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.fb-img {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  object-fit: cover;
  background: #f5f6fa;
}

.fb-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fb-time {
  font-size: 11px;
  color: #ccc;
}

.fb-reply-status {
  font-size: 12px;
  color: #fa8c16;
}
.fb-reply-status.replied {
  color: #52C41A;
}

.popup-wrap {
  overflow-y: auto;
  max-height: 90vh;
}

.detail-images {
  margin-top: 12px;
}

.detail-title {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  padding: 0 16px;
  margin-bottom: 8px;
}

.detail-img-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px;
}

.detail-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  background: #f5f6fa;
}

.detail-actions {
  padding-top: 12px;
}
</style>
