<template>
  <div>
    <van-nav-bar title="会员等级">
      <template #right>
        <van-button type="primary" plain size="small" icon="plus" @click="openAdd">新增等级</van-button>
      </template>
    </van-nav-bar>

    <div class="page-scroll">
      <div class="gradient-header">
        <div class="title">会员等级</div>
        <div class="subtitle">管理会员等级规则与全局策略</div>
      </div>

      <van-tabs v-model:active="tabActive" sticky>
        <van-tab title="等级规则">
          <div class="section" style="margin-bottom:16px">
            <div class="level-card" v-for="lv in levelList" :key="lv.levelId" :style="{ borderTop: `3px solid ${levelColor(lv.levelValue)}` }">
              <div class="lv-header">
                <div class="lv-icon" :style="{ background: levelIconBg(lv.levelValue) }">
                  <van-icon name="medal-o" :color="levelColor(lv.levelValue)" size="20" />
                </div>
                <div>
                  <div class="lv-name">{{ lv.levelName }}</div>
                  <div class="lv-sub">Level {{ lv.levelValue }}</div>
                </div>
                <van-switch v-model="lv.status" :active-value="1" :inactive-value="0" size="20px" @change="toggleStatus(lv)" />
              </div>

              <div class="lv-upgrade">
                <van-icon name="upgrade" color="#10B981" size="13" />
                <span class="upgrade-label">晋升条件</span>
                <span class="upgrade-val">累计充值 ¥{{ lv.upgradeAmount }}</span>
              </div>

              <van-divider style="margin:10px 0" />

              <div class="perk-title">专属权益</div>
              <van-cell-group :border="false">
                <van-cell center title="金币加成" icon="gold-coin-o" :value="`+${lv.goldBonusRate}%`" value-class="perk-val" :style="{'--van-cell-icon-color': '#F59E0B'}" />
                <van-cell center title="购物折扣" icon="discount" :value="`${lv.shoppingDiscountRate}% OFF`" value-class="perk-val" :style="{'--van-cell-icon-color': '#10B981'}" />
                <van-cell center title="客服支持" icon="service-o" :value="serviceLevelMap[lv.serviceLevel] || '-'" value-class="perk-val-gray" />
              </van-cell-group>

              <div class="lv-actions">
                <van-button plain icon="edit" size="small" style="flex:1" @click="openEdit(lv)">编辑</van-button>
                <van-button plain icon="delete-o" size="small" color="#EF4444" style="flex:1" @click="removeLevel(lv.levelId)">删除</van-button>
              </div>
            </div>
            <van-empty v-if="!levelList.length" description="暂无等级规则" style="padding-top:40px" />
          </div>
        </van-tab>

        <van-tab title="全局策略">
          <div class="section" style="margin-bottom:16px">
            <div class="strategy-card">
              <div class="strategy-header">等级策略配置</div>
              <van-cell-group inset>
                <van-field name="strategyType" label="等级策略">
                  <template #input>
                    <van-radio-group direction="horizontal" v-model="strategyForm.strategyType">
                      <van-radio :name="1">只升不降</van-radio>
                      <van-radio :name="2">有降有升</van-radio>
                    </van-radio-group>
                  </template>
                </van-field>
                <van-field v-model="strategyForm.rewardValidityDays" type="number" label="奖励有效期(天)" placeholder="0=永久" />
                <van-field v-model="strategyForm.remark" label="备注" placeholder="请输入" />
                <template v-if="strategyForm.strategyType === 2">
                  <van-field v-model="strategyForm.downgradeDays" type="number" label="降级观察天数" placeholder="请输入" />
                  <van-field v-model="strategyForm.downgradeMinRechargeAmount" type="number" label="最低充值金额(元)" placeholder="低于此值降1级" />
                </template>
              </van-cell-group>
              <div style="padding:16px">
                <van-button type="primary" block :loading="strategyLoading" @click="saveStrategy">保存策略</van-button>
              </div>
            </div>

            <div class="strategy-card" style="margin-top:16px">
              <div class="strategy-header">手动指定用户等级</div>
              <van-cell-group inset>
                <van-field v-model="assignForm.userId" label="用户ID" placeholder="请输入用户ID" />
                <van-field name="levelValue" label="目标等级">
                  <template #input>
                    <van-radio-group direction="horizontal" v-model="assignForm.levelValue">
                      <van-radio v-for="lv in levelList" :key="lv.levelId" :name="lv.levelValue">{{ lv.levelName }}</van-radio>
                    </van-radio-group>
                  </template>
                </van-field>
              </van-cell-group>
              <div style="padding:16px">
                <van-button type="primary" block :loading="assignLoading" @click="assignLevel">确认指定</van-button>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 新增/编辑等级弹窗 -->
    <van-popup v-model:show="showModal" round position="bottom" :style="{ maxHeight: '90%' }">
      <div class="popup-wrap">
        <van-nav-bar :title="form.levelId ? '编辑等级' : '新增等级'" right-text="关闭" @click-right="showModal = false" />
        <van-form @submit="save" style="padding:0 4px">
          <van-cell-group inset>
            <van-field v-model="form.levelName" label="等级名称" placeholder="请输入" :rules="[{ required: true, message: '请填写等级名称' }]" />
            <van-field v-model="form.levelValue" type="number" label="等级值" placeholder="从1开始" :rules="[{ required: true, message: '请填写等级值' }]" />
            <van-field v-model="form.upgradeAmount" type="number" label="晋升所需充值(元)" placeholder="请输入" :rules="[{ required: true, message: '请填写晋升金额' }]" />
            <van-field v-model="form.goldBonusRate" type="number" label="金币加成(%)" placeholder="请输入" />
            <van-field v-model="form.shoppingDiscountRate" type="number" label="购物折扣(%)" placeholder="请输入" />
            <van-field name="serviceLevel" label="客服支持">
              <template #input>
                <van-radio-group direction="horizontal" v-model="form.serviceLevel">
                  <van-radio :name="1">标准</van-radio>
                  <van-radio :name="2">优先</van-radio>
                  <van-radio :name="3">专属</van-radio>
                  <van-radio :name="4">VIP专属</van-radio>
                  <van-radio :name="5">首席</van-radio>
                </van-radio-group>
              </template>
            </van-field>
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
              {{ form.levelId ? '保存修改' : '新增等级' }}
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { showConfirmDialog, showToast } from 'vant'

const tabActive = ref(0)

const levelList = ref([])

const serviceLevelMap = { 1: '标准客服', 2: '优先客服', 3: '专属客服', 4: 'VIP专属客服', 5: '首席客服' }

const levelColors = ['', '#94A3B8', '#F59E0B', '#2563EB', '#7C3AED', '#EF4444']
const levelIconBgs = ['', '#f3f4f6', '#FEF3C7', '#EFF6FF', '#F3E8FF', '#FEE2E2']

function levelColor(val) { return levelColors[val] || '#94A3B8' }
function levelIconBg(val) { return levelIconBgs[val] || '#f3f4f6' }

// --- 等级规则 ---
const showModal = ref(false)
const submitLoading = ref(false)

const form = reactive({
  levelId: '',
  levelName: '',
  levelValue: '',
  upgradeAmount: '',
  goldBonusRate: '',
  shoppingDiscountRate: '',
  serviceLevel: 1,
  status: 1,
})

// --- 策略配置 ---
const strategyForm = reactive({
  strategyType: 1,
  rewardValidityDays: '',
  downgradeDays: '',
  downgradeMinRechargeAmount: '',
  remark: '',
})
const strategyLoading = ref(false)

// --- 手动指定 ---
const assignForm = reactive({
  userId: '',
  levelValue: 1,
})
const assignLoading = ref(false)

onMounted(() => {
  loadLevelList()
  loadStrategy()
})

// --- 等级列表 ---
const loadLevelList = async () => {
  try {
    const res = await api.post('/admin/pinball/level/config/list')
    if (res.code === 200) {
      levelList.value = res.data || []
    } else {
      showToast(res.message)
    }
  } catch (e) {
    showToast('系统错误')
  }
}

const toggleStatus = async (item) => {
  try {
    const res = await api.post('/admin/pinball/level/config/update', {
      levelId: item.levelId,
      levelName: item.levelName,
      levelValue: item.levelValue,
      upgradeAmount: item.upgradeAmount,
      goldBonusRate: item.goldBonusRate ?? 0,
      shoppingDiscountRate: item.shoppingDiscountRate ?? 0,
      serviceLevel: item.serviceLevel ?? 1,
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
    const url = form.levelId ? '/admin/pinball/level/config/update' : '/admin/pinball/level/config/add'
    const res = await api.post(url, form)
    submitLoading.value = false
    if (res.code === 200) {
      showModal.value = false
      loadLevelList()
    } else {
      showToast(res.message)
    }
  } catch (e) {
    submitLoading.value = false
    showToast('系统错误')
  }
}

const deleteLevel = async (levelId) => {
  try {
    const res = await api.post('/admin/pinball/level/config/delete', { levelId })
    if (res.code === 200) {
      loadLevelList()
    } else {
      showToast(res.message)
    }
  } catch (e) {
    showToast('系统错误')
  }
}

function openAdd() {
  form.levelId = ''
  form.levelName = ''
  form.levelValue = ''
  form.upgradeAmount = ''
  form.goldBonusRate = ''
  form.shoppingDiscountRate = ''
  form.serviceLevel = 1
  form.status = 1
  showModal.value = true
}

function openEdit(item) {
  form.levelId = item.levelId
  form.levelName = item.levelName
  form.levelValue = item.levelValue
  form.upgradeAmount = item.upgradeAmount ?? ''
  form.goldBonusRate = item.goldBonusRate ?? ''
  form.shoppingDiscountRate = item.shoppingDiscountRate ?? ''
  form.serviceLevel = item.serviceLevel ?? 1
  form.status = item.status
  showModal.value = true
}

function save() {
  createOrUpdate()
}

function removeLevel(levelId) {
  showConfirmDialog({ message: '确认删除该等级规则吗' })
    .then(() => deleteLevel(levelId))
    .catch(() => {})
}

// --- 策略配置 ---
const loadStrategy = async () => {
  try {
    const res = await api.post('/admin/pinball/level/strategy/getConfig')
    if (res.code === 200 && res.data) {
      strategyForm.strategyType = res.data.strategyType ?? 1
      strategyForm.rewardValidityDays = res.data.rewardValidityDays ?? ''
      strategyForm.downgradeDays = res.data.downgradeDays ?? ''
      strategyForm.downgradeMinRechargeAmount = res.data.downgradeMinRechargeAmount ?? ''
      strategyForm.remark = res.data.remark || ''
    }
  } catch (e) {
    // silent
  }
}

const saveStrategy = async () => {
  try {
    strategyLoading.value = true
    const res = await api.post('/admin/pinball/level/strategy/saveConfig', strategyForm)
    strategyLoading.value = false
    if (res.code === 200) {
      showToast('保存成功')
    } else {
      showToast(res.message)
    }
  } catch (e) {
    strategyLoading.value = false
    showToast('系统错误')
  }
}

// --- 手动指定 ---
const assignLevel = async () => {
  if (!assignForm.userId) {
    showToast('请输入用户ID')
    return
  }
  try {
    assignLoading.value = true
    const res = await api.post('/admin/pinball/level/user/assign', assignForm)
    assignLoading.value = false
    if (res.code === 200) {
      showToast('指定成功')
      assignForm.userId = ''
    } else {
      showToast(res.message)
    }
  } catch (e) {
    assignLoading.value = false
    showToast('系统错误')
  }
}
</script>

<style scoped>
.level-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  margin-top: 12px;
}

.lv-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.lv-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lv-name {
  font-size: 16px;
  font-weight: 700;
  color: #111;
}

.lv-sub {
  font-size: 12px;
  color: #999;
}

.lv-upgrade {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f9fafb;
  border-radius: 8px;
  padding: 8px 12px;
}

.upgrade-label {
  font-size: 12px;
  color: #10B981;
  font-weight: 500;
}

.upgrade-val {
  font-size: 13px;
  color: #333;
  margin-left: 4px;
}

.perk-title {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.perk-val {
  font-weight: 600;
  color: #2563EB;
}

.perk-val-gray {
  color: #999;
}

.lv-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.strategy-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}

.strategy-header {
  font-size: 16px;
  font-weight: 600;
  color: #111;
  margin-bottom: 12px;
}

.popup-wrap {
  overflow-y: auto;
  max-height: 90vh;
}
</style>
