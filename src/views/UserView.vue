<template>
  <div>
    <van-nav-bar title="用户管理" />

    <div class="page-scroll">
      <div class="gradient-header">
        <div class="title">用户管理</div>
        <div class="subtitle">总计 {{ total }} 名用户</div>
      </div>

      <div class="search-row">
        <van-search v-model="params.nickName" placeholder="搜索昵称..." shape="round" background="#f5f6fa" @search="onSearch" />
      </div>
      <div class="search-row" style="padding-top:0">
        <van-search v-model="params.phoneNumber" placeholder="搜索手机号..." shape="round" background="#f5f6fa" @search="onSearch" />
      </div>
      <div class="filter-row">
        <div class="filter-chip" @click="showFilterLevel = true">
          <span>{{ filterLevelLabel }}</span>
          <van-icon name="arrow-down" size="12" />
        </div>
        <div class="filter-chip" @click="showFilterStatus = true">
          <span>{{ filterStatusLabel }}</span>
          <van-icon name="arrow-down" size="12" />
        </div>
      </div>

      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
          <van-cell-group inset v-for="u in users" :key="u.userId" style="margin-top:8px">
            <van-cell center @click="openDetail(u)">
              <template #icon>
                <div class="user-avatar">
                  <img v-if="u.avatar" :src="u.avatar" class="avatar-img" />
                  <span v-else>{{ (u.nickName || u.userName || '?')[0] }}</span>
                </div>
              </template>
              <template #title>
                <span class="user-name">{{ u.nickName || u.userName || '-' }}</span>
              </template>
              <template #label>
                <div class="user-phone"><van-icon name="phone-o" size="11" /> {{ u.phoneNumber || '-' }}</div>
                <div class="user-info-row">
                  <van-tag size="small" type="primary" plain>{{ u.levelName || 'Lv.' + (u.levelValue || 0) }}</van-tag>
                  <span class="user-meta">弹珠: {{ u.marbleAmount ?? 0 }}</span>
                  <span class="user-meta gray">{{ u.createTime || '' }}</span>
                </div>
              </template>
              <template #right-icon>
                <van-switch v-model="u.status" :active-value="1" :inactive-value="0" size="20px" @change="toggleStatus(u)" @click.stop />
              </template>
            </van-cell>
          </van-cell-group>
          <van-empty v-if="!users.length && !loading" description="暂无用户数据" style="padding-top:40px" />
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 筛选弹窗 -->
    <van-popup v-model:show="showFilterLevel" round position="bottom">
      <van-picker :columns="levelOpts" show-toolbar title="筛选等级" @confirm="onFilterLevelConfirm" @cancel="showFilterLevel = false" />
    </van-popup>
    <van-popup v-model:show="showFilterStatus" round position="bottom">
      <van-picker :columns="statusOpts" show-toolbar title="筛选状态" @confirm="onFilterStatusConfirm" @cancel="showFilterStatus = false" />
    </van-popup>

    <!-- 用户详情弹窗 -->
    <van-popup v-model:show="showDetail" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar title="用户详情" right-text="关闭" @click-right="showDetail = false" />
        <div class="detail-section" v-if="detail">
          <div class="detail-avatar-wrap">
            <div class="detail-avatar">
              <img v-if="detail.avatar" :src="detail.avatar" />
              <span v-else>{{ (detail.nickName || detail.userName || '?')[0] }}</span>
            </div>
          </div>
          <van-cell-group inset>
            <van-cell title="用户ID" :value="detail.userId" />
            <van-cell title="用户账号" :value="detail.userName || '-'" />
            <van-cell title="昵称" :value="detail.nickName || '-'" />
            <van-cell title="手机号" :value="detail.phoneNumber || '-'" />
            <van-cell title="性别">
              <template #value>
                <van-tag size="small" :type="detail.gender === 1 ? 'primary' : detail.gender === 2 ? 'danger' : 'default'">
                  {{ detail.gender === 1 ? '男' : detail.gender === 2 ? '女' : '未知' }}
                </van-tag>
              </template>
            </van-cell>
            <van-cell title="生日" :value="detail.birthday || '-'" />
            <van-cell title="会员等级" :value="detail.levelName || '-'" />
            <van-cell title="弹珠余额" :value="String(detail.marbleAmount ?? 0)" />
            <van-cell title="会员积分" :value="String(detail.memberPointAmount ?? 0)" />
            <van-cell title="积分卡余额" :value="String(detail.pointCardAmount ?? 0)" />
            <van-cell title="充值总金额" :value="'¥' + (detail.totalRechargeAmount ?? 0)" />
            <van-cell title="注册时间" :value="detail.createTime || '-'" />
            <van-cell title="最近登录" :value="detail.loginDate || '-'" />
            <van-cell title="状态">
              <template #value>
                <van-tag size="small" :type="detail.status === 1 ? 'success' : 'danger'">
                  {{ detail.status === 1 ? '正常' : '停用' }}
                </van-tag>
              </template>
            </van-cell>
          </van-cell-group>

          <div class="detail-actions">
            <van-button plain icon="edit" size="small" style="flex:1" @click="openEditDialog">编辑资料</van-button>
            <van-button plain icon="gem-o" size="small" style="flex:1" type="primary" @click="openGrant('marble')">发放弹珠</van-button>
            <van-button plain icon="points" size="small" style="flex:1" type="primary" @click="openGrant('memberPoint')">发放积分</van-button>
            <van-button plain icon="coupon-o" size="small" style="flex:1" type="primary" @click="openGrant('pointCard')">发积分卡</van-button>
            <van-button plain icon="delete-o" size="small" color="#EF4444" style="flex:1" @click="removeUser(detail.userId)">删除</van-button>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 编辑资料弹窗 -->
    <van-popup v-model:show="showEdit" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar title="编辑资料" right-text="关闭" @click-right="showEdit = false" />
        <van-form @submit="saveProfile" style="padding:0 4px">
          <van-cell-group inset>
            <van-field v-model="editForm.nickName" label="昵称" placeholder="请输入" />
            <van-field v-model="editForm.birthday" label="生日" placeholder="如 2024-01-01" />
            <van-field name="gender" label="性别">
              <template #input>
                <van-radio-group direction="horizontal" v-model="editForm.gender">
                  <van-radio :name="1">男</van-radio>
                  <van-radio :name="2">女</van-radio>
                  <van-radio :name="3">未知</van-radio>
                </van-radio-group>
              </template>
            </van-field>
          </van-cell-group>
          <div style="padding:16px">
            <van-button type="primary" native-type="submit" block :loading="editLoading">保存</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 发放弹窗 -->
    <van-popup v-model:show="showGrant" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar :title="grantTitle" right-text="关闭" @click-right="showGrant = false" />
        <van-form @submit="doGrant" style="padding:0 4px">
          <van-cell-group inset>
            <van-field v-model="grantForm.amount" type="number" label="数量" placeholder="请输入" :rules="[{ required: true, message: '请填写数量' }]" />
            <van-field v-model="grantForm.remark" label="备注" placeholder="请输入" />
          </van-cell-group>
          <div style="padding:16px">
            <van-button type="primary" native-type="submit" block :loading="grantLoading">确认发放</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, computed } from 'vue'
import { showConfirmDialog, showToast } from 'vant'

// --- 查询参数 ---
const params = ref({
  current: 1,
  pageSize: 20,
  nickName: '',
  phoneNumber: '',
  levelValue: undefined,
  status: undefined,
  sortField: [],
})

const levelOpts = [
  { text: '全部等级', value: undefined },
  { text: 'Lv.1', value: 1 },
  { text: 'Lv.2', value: 2 },
  { text: 'Lv.3', value: 3 },
  { text: 'Lv.4', value: 4 },
  { text: 'Lv.5', value: 5 },
]

const statusOpts = [
  { text: '全部状态', value: undefined },
  { text: '正常', value: 1 },
  { text: '停用', value: 0 },
]

const showFilterLevel = ref(false)
const showFilterStatus = ref(false)

const filterLevelLabel = computed(() => {
  const found = levelOpts.find(o => o.value === params.value.levelValue)
  return found ? `等级: ${found.text}` : '等级: 全部'
})

const filterStatusLabel = computed(() => {
  const found = statusOpts.find(o => o.value === params.value.status)
  return found ? `状态: ${found.text}` : '状态: 全部'
})

// --- 用户列表 ---
const users = ref([])
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const total = ref(0)

onMounted(() => {
  onLoad()
})

const getUserList = async (isRefresh) => {
  if (isRefresh) {
    params.value.current = 1
    users.value = []
    finished.value = false
    total.value = 0
  }
  try {
    loading.value = true
    const payload = { ...params.value }
    Object.keys(payload).forEach(k => {
      if (payload[k] === undefined || payload[k] === '') delete payload[k]
    })
    const res = await api.post('/admin/pinball/user/page', payload)
    if (res.code === 200) {
      const list = res.data?.data || []
      total.value = res.data?.total || 0
      if (isRefresh) {
        users.value = list
      } else {
        users.value = [...users.value, ...list]
      }
      if (users.value.length >= total.value) finished.value = true
      params.value.current++
    } else {
      showToast(res.message)
    }
  } catch (e) {
    if (!isRefresh) showToast('系统错误')
  }
}

function onRefresh() {
  getUserList(true).finally(() => { refreshing.value = false })
}

function onLoad() {
  getUserList(false).finally(() => { loading.value = false })
}

function onSearch() {
  onRefresh()
}

function onFilterLevelConfirm({ selectedOptions }) {
  params.value.levelValue = selectedOptions[0].value
  showFilterLevel.value = false
  onSearch()
}

function onFilterStatusConfirm({ selectedOptions }) {
  params.value.status = selectedOptions[0].value
  showFilterStatus.value = false
  onSearch()
}

const toggleStatus = async (item) => {
  try {
    const res = await api.post('/admin/pinball/user/status', {
      userId: item.userId,
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

// --- 用户详情 ---
const showDetail = ref(false)
const detail = ref(null)

const openDetail = async (user) => {
  showDetail.value = true
  try {
    const res = await api.post('/admin/pinball/user/detail', { userId: user.userId })
    if (res.code === 200) {
      detail.value = res.data
    } else {
      showToast(res.message)
    }
  } catch (e) {
    showToast('系统错误')
  }
}

// --- 编辑资料 ---
const showEdit = ref(false)
const editLoading = ref(false)
const editForm = reactive({
  userId: '',
  nickName: '',
  birthday: '',
  gender: 3,
})

function openEditDialog() {
  editForm.userId = detail.value.userId
  editForm.nickName = detail.value.nickName || ''
  editForm.birthday = detail.value.birthday || ''
  editForm.gender = detail.value.gender ?? 3
  showEdit.value = true
}

const saveProfile = async () => {
  try {
    editLoading.value = true
    const res = await api.post('/admin/pinball/user/update', editForm)
    editLoading.value = false
    if (res.code === 200) {
      showEdit.value = false
      showToast('保存成功')
    } else {
      showToast(res.message)
    }
  } catch (e) {
    editLoading.value = false
    showToast('系统错误')
  }
}

// --- 发放 ---
const showGrant = ref(false)
const grantType = ref('')
const grantLoading = ref(false)
const grantForm = reactive({ amount: '', remark: '' })

const grantTitle = computed(() => {
  if (grantType.value === 'marble') return '发放弹珠'
  if (grantType.value === 'memberPoint') return '发放会员积分'
  if (grantType.value === 'pointCard') return '发放积分卡'
  return '发放'
})

const grantApiMap = {
  marble: '/admin/pinball/user/grantMarble',
  memberPoint: '/admin/pinball/user/grantMemberPoint',
  pointCard: '/admin/pinball/user/grantPointCard',
}

function openGrant(type) {
  grantType.value = type
  grantForm.amount = ''
  grantForm.remark = ''
  showGrant.value = true
}

const doGrant = async () => {
  try {
    grantLoading.value = true
    const res = await api.post(grantApiMap[grantType.value], {
      userId: detail.value.userId,
      amount: Number(grantForm.amount),
      remark: grantForm.remark,
    })
    grantLoading.value = false
    if (res.code === 200) {
      showGrant.value = false
      showToast('发放成功')
    } else {
      showToast(res.message)
    }
  } catch (e) {
    grantLoading.value = false
    showToast('系统错误')
  }
}

// --- 删除 ---
const deleteUser = async (userId) => {
  try {
    const res = await api.post('/admin/pinball/user/delete', { userId })
    if (res.code === 200) {
      showDetail.value = false
      onRefresh()
    } else {
      showToast(res.message)
    }
  } catch (e) {
    showToast('系统错误')
  }
}

function removeUser(userId) {
  showConfirmDialog({ message: '确认删除该用户吗' })
    .then(() => deleteUser(userId))
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

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
  background: #6366f1;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #111;
}

.user-phone {
  font-size: 12px;
  color: #999;
  margin: 3px 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  
}

.user-meta {
  font-size: 12px;
  color: #666;
}
.user-meta.gray {
  color: #bbb;
}

.detail-section {
  padding-bottom: 16px;
}

.detail-avatar-wrap {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.detail-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  background: #6366f1;
  overflow: hidden;
}

.detail-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;
}

.popup-wrap {
  overflow-y: auto;
  max-height: 90vh;
}

.van-tag {
  white-space: nowrap;
}
</style>
