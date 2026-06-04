<template>
  <div>
    <van-nav-bar title="房间类型">
      <template #right>
        <van-button type="primary" plain size="small" icon="plus" @click="openAdd">添加</van-button>
      </template>
    </van-nav-bar>

    <div class="page-scroll">
      <div class="gradient-header">
        <div class="title">房间类型</div>
        <div class="subtitle">等级配置与准入管理</div>
      </div>

      <div class="section" style="margin-bottom:16px">
        <div class="room-card" v-for="item, index in roomTypes" :key="index">
          <van-cell title="房间类型名称" :value="item.roomTypeName" />
          <van-cell title="出珠比例" :value="item.ballOutRatio" />
          <van-cell title="投珠上限" :value="item.maxMarble" />
          <van-cell title="投珠下限" :value="item.minMarble" />
          <van-cell title="几珠一卡" :value="item.marblePerCard" />
          <van-cell title="积分卡上限" :value="item.cardLimit" />
          <van-cell title="模式" :value="getModeName(item.mode)" />
          <!-- 操作按钮 -->
          <div class="room-actions">
            <van-button plain icon="edit"     size="small" style="flex:1" @click="openEdit(item)">编辑</van-button>
            <van-button plain icon="delete-o" size="small" color="#EF4444" style="flex:1" @click="deleteRoom(item.roomTypeId)">删除</van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <van-popup v-model:show="showFormdateModal" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar :title="form.roomTypeId ? '编辑房间' : '添加新类型'" right-text="关闭" @click-right="showFormdateModal = false" />
        <van-form @submit="save" style="padding:0 4px">
          <van-cell-group inset>
            <van-field
              v-model="form.roomTypeName"
              label="房间类型名称"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写房间类型名称' }]"
            />
             <van-field
              v-model="form.ballOutRatio"
              type="number"
              label="出珠比例"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写出珠比例' }]"
            />
            <van-field
              v-model="form.maxMarble"
              type="number"
              label="投珠上限"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写投珠上限' }]"
            />
            <van-field
              v-model="form.minMarble"
              type="number"
              label="投珠下限"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写投珠下限' }]"
            />
            <van-field
              v-model="form.marblePerCard"
              type="number"
              label="几珠一卡"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写几珠一卡' }]"
            />
            <van-field
              v-model="form.cardLimit"
              type="number"
              label="积分卡上限"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写积分卡上限' }]"
            />
            <van-field
              v-model="selectedMode"
              is-link
              label="模式"
              placeholder="请选择"
              :readonly="true"
              :rules="[{ required: true, message: '请选择模式' }]"
              @click="showModePicker = true"
            />
          </van-cell-group>
          <div style="padding:16px">
            <van-button type="primary" native-type="submit" block loading-text="提交中" :loading="submitLoading">{{ form.roomTypeId ? '保存修改' : '添加类型' }}</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-popup v-model:show="showModePicker" round position="bottom">
      <van-picker :columns="modeList" show-toolbar title="选择模式" @confirm="clickMode" @cancel="showModePicker = false" />
    </van-popup>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, reactive } from 'vue'
import { showConfirmDialog, showToast, showLoadingToast } from 'vant';

const params = ref({
  current: 1,
  pageSize: 20,
  roomTypeName: '', // 房间类型名称（模糊查询）
  sortField: [
    {
      "asc": true,
      "column": ""
    }
  ]
})
// 提交表单
const showFormdateModal = ref(false)
const form = reactive({
  roomTypeId: '',
  roomTypeName: '',
  ballOutRatio: '',
  maxMarble: '',
  minMarble: '',
  marblePerCard: '',
  cardLimit: '',
  mode: '',
})
const submitLoading = ref(false)
// 模式
const showModePicker = ref(false)
const selectedMode = ref('')
const modeList = ref([
  { text: '出卡不出珠', value: 1 },
  { text: '既出卡又出珠', value: 2 },
])

const roomTypes = ref([])

onMounted(() => {
  getRoomType(true)
})

onBeforeUnmount(() => {

})

// 房间类型-分页列表
const getRoomType = async (init) => {
  if (init) {
    params.value.current = 1
    roomTypes.value = []
  }
  const loading = showLoadingToast({
    message: '加载中',
    forbidClick: true,
    duration: 0
  });
  try {
    const res = await api.post('/admin/pinball/room/pageRoomType', params.value)
    loading.close()
    if (res.code === 200) {
      const list = res.data.data || []
      roomTypes.value = [...roomTypes.value, ...list]
      params.value.current++
    } else {
      showToast(res.message)
    }
  } catch (e) {
    loading.close()
    showToast('系统错误')
  }
}

// 房间类型-创建
const createRoomType = async () => {
  try {
    submitLoading.value = true
    const res = await api.post('/admin/pinball/room/createRoomType', form)
    submitLoading.value = false
    if (res.code === 200) {
      showFormdateModal.value = false
      getRoomType(true)
    } else {
      showToast(res.message)
    }
  } catch (e) {
    submitLoading.value = false
    showToast('系统错误')
  }
}

// 房间类型-修改
const updateRoomType = async () => {
  try {
    submitLoading.value = true
    const res = await api.post('/admin/pinball/room/updateRoomType', form)
    submitLoading.value = false
    if (res.code === 200) {
      showFormdateModal.value = false
      getRoomType(true)
    } else {
      showToast(res.message)
    }
  } catch (e) {
    submitLoading.value = false
    showToast('系统错误')
  }
}

// 房间类型-删除
const deleteRoomType = async (roomTypeId) => {
  try {
    const res = await api.post('/admin/pinball/room/deleteRoomType', { roomTypeId })
    if (res.code === 200) {
      showFormdateModal.value = false
    } else {
      showToast(res.message)
    }
  } catch (e) {
    showToast('系统错误')
  }
}

function openAdd() {
  form.roomTypeId = ''
  form.roomTypeName = ''
  form.ballOutRatio = ''
  form.maxMarble = ''
  form.minMarble = ''
  form.marblePerCard = ''
  form.cardLimit = ''
  form.mode = ''
  selectedMode.value = ''
  showFormdateModal.value = true
}

function openEdit(item = {}) {
  form.roomTypeId = item.roomTypeId
  form.roomTypeName = item.roomTypeName
  form.ballOutRatio = item.ballOutRatio
  form.maxMarble = item.maxMarble
  form.minMarble = item.minMarble
  form.marblePerCard = item.marblePerCard
  form.cardLimit = item.cardLimit
  form.mode = item.mode
  selectedMode.value = getModeName(item.mode)
  showFormdateModal.value = true
}

function save() {
  if (form.roomTypeId) {
    updateRoomType()
  } else {
    createRoomType()
  }
}

function deleteRoom(roomTypeId) {
  showConfirmDialog({
    message: '确认删除吗',
  })
    .then(() => {
      deleteRoomType(roomTypeId)
    })
    .catch(() => {});
}

function clickMode({ selectedOptions }) {
  selectedMode.value = selectedOptions[0].text
  form.mode = selectedOptions[0].value
  showModePicker.value = false
}

function getModeName(mode) {
  return modeList.value.find(n => n.value === mode).text
}
</script>

<style scoped>
.room-card {
  background: #fff; border-radius: 16px; padding: 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05); margin-top: 12px;
}

.room-top { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
.room-icon {
  width: 48px; height: 48px; background: #EFF6FF; border-radius: 14px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.room-name { font-size: 16px; font-weight: 700; color: #111; }
.room-desc { font-size: 12px; color: #999; margin-top: 3px; }

.room-meta-grid { margin: 0 -4px 8px; }
.meta-row  { display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
.meta-label { font-size: 12px; color: #999; }
.meta-val   { font-size: 14px; font-weight: 600; color: #111; }

.room-stats { margin: 0 -16px; }
.room-actions { display: flex; gap: 10px; margin-top: 12px; }
.popup-wrap   { overflow-y: auto; max-height: 90vh; }
</style>
