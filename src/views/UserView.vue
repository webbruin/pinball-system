<template>
  <div>
    <van-nav-bar title="用户管理">
      <template #right>
        <van-button type="primary" size="small" icon="plus">新增</van-button>
      </template>
    </van-nav-bar>

    <div class="page-scroll">
      <div class="gradient-header">
        <div class="title">用户管理</div>
        <div class="subtitle">总计 {{ users.length }} 名用户</div>
      </div>

      <!-- 统计卡片 -->
      <van-grid :column-num="3" :border="false" class="section stats-grid-card">
        <van-grid-item>
          <div class="grid-stat-label">总用户</div>
          <div class="grid-stat-val">{{ users.length }}</div>
        </van-grid-item>
        <van-grid-item>
          <div class="grid-stat-label">活跃用户</div>
          <div class="grid-stat-val">{{ users.length }}</div>
        </van-grid-item>
        <van-grid-item>
          <div class="grid-stat-label">VIP用户</div>
          <div class="grid-stat-val">{{ vipCount }}</div>
        </van-grid-item>
      </van-grid>

      <!-- 搜索 -->
      <van-search v-model="keyword" placeholder="搜索用户名或手机号" shape="round" background="#f5f6fa" />

      <!-- 用户列表 -->
      <van-cell-group inset v-for="u in filteredUsers" :key="u.id" style="margin-top:8px">
        <van-cell center>
          <template #icon>
            <div class="user-avatar" :style="{ background: u.color }">{{ u.name[0] }}</div>
          </template>
          <template #title>
            <span class="user-name">{{ u.name }}</span>
          </template>
          <template #label>
            <div class="user-phone"><van-icon name="phone-o" size="11" /> {{ u.phone }}</div>
            <div class="user-level-row">
              <van-tag :color="levelColor(u.level).bg" :text-color="levelColor(u.level).text">{{ u.level }}</van-tag>
              <span class="user-meta">消费 ¥{{ u.consume }}</span>
              <span class="user-meta gray">{{ u.date }}</span>
            </div>
          </template>
          <template #right-icon>
            <div class="user-ops">
              <van-icon name="edit"     size="18" color="#999" style="cursor:pointer" />
              <van-icon name="delete-o" size="18" color="#EF4444" style="cursor:pointer" @click="removeUser(u.id)" />
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const keyword = ref('')

const users = ref([
  { id: 1, name: '张伟', phone: '15865751254', level: '钻石', consume: '8,900', date: '2024-01-15', color: '#6366f1' },
  { id: 2, name: '李娜', phone: '15865751254', level: '黄金', consume: '3,200', date: '2024-02-20', color: '#8B5CF6' },
  { id: 3, name: '王强', phone: '15865751254', level: '荣耀', consume: '15,600', date: '2023-11-08', color: '#7C3AED' },
  { id: 4, name: '刘芳', phone: '15865751254', level: '白银', consume: '450',   date: '2025-12-01', color: '#6366f1' },
  { id: 5, name: '陈明', phone: '15865751254', level: '黄金', consume: '2,100', date: '2024-03-10', color: '#8B5CF6' },
])

const levelMap = {
  '白银': { bg: '#f3f4f6', text: '#666' },
  '黄金': { bg: '#FEF3C7', text: '#D97706' },
  '钻石': { bg: '#EFF6FF', text: '#2563EB' },
  '荣耀': { bg: '#F3E8FF', text: '#7C3AED' },
  '王者': { bg: '#FEE2E2', text: '#DC2626' },
}

const vipCount = computed(() => users.value.filter(u => ['钻石','荣耀','王者'].includes(u.level)).length)

const filteredUsers = computed(() =>
  users.value.filter(u => u.name.includes(keyword.value) || u.phone.includes(keyword.value))
)

function levelColor(level) { return levelMap[level] || { bg: '#f3f4f6', text: '#666' } }
function removeUser(id)    { users.value = users.value.filter(u => u.id !== id) }
</script>

<style scoped>
.stats-grid-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  margin-top: 12px;
  overflow: hidden;
}

.grid-stat-label { font-size: 12px; color: #999; margin-bottom: 4px; }
.grid-stat-val   { font-size: 22px; font-weight: 700; color: #111; }

.user-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 17px; font-weight: 600; margin-right: 12px; flex-shrink: 0;
}

.user-name  { font-size: 15px; font-weight: 600; color: #111; }
.user-phone { font-size: 12px; color: #999; margin: 3px 0; display: flex; align-items: center; gap: 4px; }

.user-level-row { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.user-meta      { font-size: 12px; color: #666; }
.user-meta.gray { color: #bbb; }

.user-ops { display: flex; gap: 12px; align-items: center; }
</style>
