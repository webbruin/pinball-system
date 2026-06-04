<template>
  <div>
    <van-nav-bar title="签到奖励配置" />

    <div class="page-scroll">
      <div class="gradient-header">
        <div class="title">签到奖励配置</div>
        <div class="subtitle">设置每日签到奖励弹珠数量</div>
      </div>

      <div class="section" style="margin-bottom:16px">
        <div class="config-card" v-for="(item, idx) in configs" :key="item.dayIndex">
          <div class="config-header">
            <div class="day-badge" :style="{ background: badgeColors[idx] }">
              {{ dayLabel(item.dayIndex) }}
            </div>
            <div class="day-title">{{ dayTitle(item.dayIndex) }}</div>
          </div>
          <van-divider style="margin:8px 0" />
          <div class="config-body">
            <span class="reward-label">奖励弹珠</span>
            <div class="reward-input-wrap">
              <van-stepper
                v-model="item.rewardMarble"
                :min="0"
                :max="9999"
                integer
                theme="round"
              />
              <span class="reward-unit">个</span>
            </div>
          </div>
        </div>

        <div style="padding:0 4px; margin-top:16px">
          <van-button
            type="primary"
            block
            round
            :loading="saving"
            loading-text="保存中..."
            @click="saveConfigs"
          >
            保存配置
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { showToast, showLoadingToast } from 'vant'

const saving = ref(false)

const configs = reactive([
  { dayIndex: 1, rewardMarble: 0 },
  { dayIndex: 2, rewardMarble: 0 },
  { dayIndex: 3, rewardMarble: 0 },
  { dayIndex: 4, rewardMarble: 0 },
  { dayIndex: 5, rewardMarble: 0 },
  { dayIndex: 6, rewardMarble: 0 },
  { dayIndex: 7, rewardMarble: 0 },
  { dayIndex: 0, rewardMarble: 0 },
])

const badgeColors = ['#94A3B8', '#6366f1', '#8B5CF6', '#7C3AED', '#2563EB', '#10B981', '#F59E0B', '#EF4444']

function dayLabel(dayIndex) {
  return dayIndex === 0 ? '7+' : `D${dayIndex}`
}

function dayTitle(dayIndex) {
  if (dayIndex === 0) return '连续超过7天默认奖励'
  return `连续签到第 ${dayIndex} 天`
}

onMounted(() => {
  getConfig()
})

const getConfig = async () => {
  const loading = showLoadingToast({ message: '加载中', forbidClick: true, duration: 0 })
  try {
    const res = await api.post('/admin/pinball/signIn/getConfig', {})
    loading.close()
    if (res.code === 200) {
      const list = res.data || []
      list.forEach(item => {
        const found = configs.find(c => c.dayIndex === item.dayIndex)
        if (found) found.rewardMarble = item.rewardMarble || 0
      })
    } else {
      showToast(res.message)
    }
  } catch (e) {
    loading.close()
    showToast('系统错误')
  }
}

const saveConfigs = async () => {
  try {
    saving.value = true
    const res = await api.post('/admin/pinball/signIn/saveConfig', {
      configs: [...configs],
    })
    saving.value = false
    if (res.code === 200) {
      showToast('保存成功')
    } else {
      showToast(res.message)
    }
  } catch (e) {
    saving.value = false
    showToast('系统错误')
  }
}
</script>

<style scoped>
.config-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  margin-top: 12px;
}

.config-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.day-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.day-title {
  font-size: 15px;
  font-weight: 600;
  color: #111;
}

.config-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reward-label {
  font-size: 14px;
  color: #666;
}

.reward-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reward-unit {
  font-size: 13px;
  color: #999;
}
</style>
