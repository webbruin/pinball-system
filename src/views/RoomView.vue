<template>
  <div>
    <van-nav-bar title="房间管理">
      <template #right>
        <van-button type="primary" plain size="small" icon="plus" @click="openAdd">添加</van-button>
      </template>
    </van-nav-bar>

    <div class="page-scroll">
      <div class="gradient-header">
        <div class="title">房间管理</div>
        <div class="subtitle">配置房间</div>
      </div>

      <div class="section" style="margin-bottom:16px">
        <van-row :gutter="[12, 20]">
          <van-col span="12" v-for="item, index in rooms" :key="index">
            <van-image
              width="100%"
              radius="12px"
              src="https://mobile.bingobangai.com/20260602/shop/20fbef43-ba62-4dc5-8df8-6f21152fea1b.png"
            />
            <div class="module" style="padding: 20px 12px 16px 12px;">
              <van-space direction="vertical" size="12px" style="margin-bottom: 10px;">
                <div class="info">
                  <span class="name">房间{{ index + 1 }}</span>
                  <span class="label" :style="{'color': item.useStatus <= 1 ? '#52C41A' : '#ccc'}">{{ roomUseStatusEnum[item.useStatus] }}</span>
                </div>
                <div class="info">
                  <span class="name">房间ID</span>
                  <span class="label">{{ item.tencentRoomId }}</span>
                </div>
                <div class="info">
                  <span class="name">房间名称</span>
                  <span class="label">{{ item.roomName }}</span>
                </div>
                <div class="info">
                  <span class="name">房间类型</span>
                  <span class="label">{{ item.roomTypeName }}</span>
                </div>
                <!-- <div class="info">
                  <span class="name">调试状态</span>
                  <span class="label">{{ onlineStatusEnum[item.onlineStatus] }}</span>
                </div> -->
                <div class="info">
                  <span class="name">开启/关闭</span>
                   <van-switch v-model="item.onlineStatus" :active-value="1" :inactive-value="0" size="18px" @change="switchRoomOnline(item)" />
                </div>
              </van-space>
              <van-row :gutter="[10]">
                <van-col span="12">
                  <van-button plain size="small" icon="edit" block @click="openEdit(item)">编辑</van-button>
                </van-col>
                <van-col span="12">
                  <van-button type="danger" plain size="small" icon="delete-o" block @click="deleteRoom(item.id)">删除</van-button>
                </van-col>
              </van-row>
            </div>
          </van-col>
        </van-row>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <van-popup v-model:show="showFormdateModal" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar :title="form.roomId ? '编辑房间' : '添加新房间'" right-text="关闭" @click-right="showFormdateModal = false" />
        <van-form @submit="save" style="padding:0 4px">
          <van-cell-group inset>
            <van-field
              v-model="form.roomName"
              label="房间名称"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写房间名称' }]"
            />
            <van-field
              v-model="form.description"
              label="房间描述"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写房间描述' }]"
            />
            <van-field
              v-model="form.tencentRoomId"
              label="房间ID"
              placeholder="请输入"
              :rules="[{ required: true, message: '请填写房间Id' }]"
            />
            <van-field
              v-model="selectedRoomType"
              is-link
              label="房间类型"
              placeholder="请输入"
              :readonly="true"
              :rules="[{ required: true, message: '请填写房间类型' }]"
              @click="showRoomTypePicker = true"
            />
            <van-field
              v-model="form.sort"
              type="number"
              label="推荐页序号"
              placeholder="请选择"
              :rules="[{ required: true, message: '请选择推荐页序号' }]"
            />
            <van-field name="debugMode" label="调试模式">
              <template #input>
                <van-radio-group
                  direction="horizontal"
                  v-model="form.debugMode"
                  :rules="[{ required: true, message: '请选择是否开启调试' }]"
                >
                  <van-radio :name="0">关闭</van-radio>
                  <van-radio :name="1">开启</van-radio>
                </van-radio-group>
              </template>
            </van-field>
          </van-cell-group>
          <div style="padding:16px">
            <van-button type="primary" native-type="submit" block loading-text="提交中" :loading="submitLoading">{{ form.roomId ? '保存修改' : '添加房间' }}</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-popup v-model:show="showRoomTypePicker" round position="bottom">
      <van-picker
        :columns="roomTypes"
        :columns-field-names="{
          text: 'roomTypeName',
          value: 'roomTypeId'
        }"
        show-toolbar
        title="选择房间状态"
        @confirm="clickRoomType"
        @cancel="showRoomTypePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, reactive } from 'vue'
import { showConfirmDialog, showToast, showLoadingToast } from 'vant';

// 房间使用状态枚举：0-空闲，1-使用中，10-故障，11-下线
const roomUseStatusEnum = {
  0: '空闲',
  1: '使用中',
  10: '故障',
  11: '下线',
  12: '调试中',
}

const onlineStatusEnum = {
  0: '关闭',
  1: '开启',
}

const params = ref({
  current: 1,
  pageSize: 20,
  onlineStatus: '', // 上线状态：0-关闭，1-开启（不传则查全部）
  roomName: '', // 房间名称（模糊查询）
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
  roomId: '',
  roomName: '',
  description: '',
  tencentRoomId: '',
  roomTypeId: '',
  sort: '',
  debugMode: 0
})
// 房间状态
const showRoomTypePicker = ref(false)
const selectedRoomType = ref('')
const roomTypes = ref([])
const rooms = ref([])
const submitLoading = ref(false)

onMounted(() => {
  getRoomType()
  getPageRoom(true)
})

onBeforeUnmount(() => {

})

// 房间类型-分页列表
const getRoomType = async () => {
  try {
    const res = await api.post('/admin/pinball/room/pageRoomType', {
      current: 1,
      pageSize: 100,
    })
    if (res.code === 200) {
      roomTypes.value = res.data.data || []
    } else {
      showToast(res.message)
    }
  } catch (e) {
    showToast('系统错误')
  }
}

// 房间-分页列表
const getPageRoom = async (init) => {
  if (init) {
    params.value.current = 1
    rooms.value = []
  }
  const loading = showLoadingToast({
    message: '加载中',
    forbidClick: true,
    duration: 0
  });
  try {
    const res = await api.post('/admin/pinball/room/pageRoom', params.value)
    loading.close()
    if (res.code === 200) {
      const list = res.data.data || []
      rooms.value = [...rooms.value, ...list]
      params.value.current++
    } else {
      showToast(res.message)
    }
  } catch (e) {
    loading.close()
    showToast('系统错误')
  }
}

// 房间-创建
const createRoom = async () => {
  try {
    submitLoading.value = true
    const res = await api.post('/admin/pinball/room/createRoom', form)
    submitLoading.value = false
    if (res.code === 200) {
      showFormdateModal.value = false
      getPageRoom(true)
    } else {
      showToast(res.message)
    }
  } catch (e) {
    submitLoading.value = false
    showToast('系统错误')
  }
}

// 房间类型-修改
const updateRoom = async () => {
  try {
    submitLoading.value = true
    const res = await api.post('/admin/pinball/room/updateRoom', form)
    submitLoading.value = false
    if (res.code === 200) {
      showFormdateModal.value = false
      getPageRoom(true)
    } else {
      showToast(res.message)
    }
  } catch (e) {
    submitLoading.value = false
    showToast('系统错误')
  }
}

// 房间类型-删除
const roomDelete = async (roomId) => {
  try {
    const res = await api.post('/admin/pinball/room/deleteRoom', { roomId })
    if (res.code === 200) {
      showFormdateModal.value = false
      getPageRoom(true)
    } else {
      showToast(res.message)
    }
  } catch (e) {
    showToast('系统错误')
  }
}

// 房间-关闭/开启
const switchRoomOnline = async (item) => {
  try {
    const res = await api.post('/admin/pinball/room/switchRoomOnline', { roomId: item.id, onlineStatus: item.onlineStatus })
    if (res.code === 200) {
      // ...
    } else {
      showToast(res.message)
      item.onlineStatus = item.onlineStatus === 1 ? 0 : 1
    }
  } catch (e) {
    showToast('系统错误')
    item.onlineStatus = item.onlineStatus === 1 ? 0 : 1
  }
}

function openAdd() {
  form.roomId = ''
  form.roomName = ''
  form.description = ''
  form.tencentRoomId = ''
  form.roomTypeId = ''
  form.sort = ''
  form.debugMode = 0
  selectedRoomType.value = ''
  showFormdateModal.value = true
}

function openEdit(item = {}) {
  form.roomId = item.id
  form.roomName = item.roomName
  form.description = item.description
  form.tencentRoomId = item.tencentRoomId
  form.roomTypeId = item.roomTypeId
  form.sort = item.sort
  form.debugMode = item.debugMode
  selectedRoomType.value = getTypeName(item.roomTypeId)
  showFormdateModal.value = true
}

function save() {
  if (form.roomId) {
    updateRoom()
  } else {
    createRoom()
  }
}

function deleteRoom(id) {
  showConfirmDialog({
    message: '确认删除吗',
  })
    .then(() => {
      roomDelete(id)
    })
    .catch(() => {});
}

function clickRoomType({ selectedOptions }) {
  selectedRoomType.value = selectedOptions[0].roomTypeName
  form.roomTypeId = selectedOptions[0].roomTypeId
  showRoomTypePicker.value = false
}

function getTypeName(typeId) {
  return roomTypes.value.find(n => n.roomTypeId === typeId).roomTypeName
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
.section .van-space {
  width: 100%;
}
.section .van-space .info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
