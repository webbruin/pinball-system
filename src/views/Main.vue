<template>
  <div class="content">
    <router-view />

    <!-- 浮动菜单按钮 -->
    <div class="menu-btn" @click="showDrawer = true">
      <van-icon name="wap-nav" size="20" color="#fff" />
    </div>

    <!-- 侧边抽屉 -->
    <van-popup v-model:show="showDrawer" position="left" :style="{ width: '72%', maxWidth: '300px', height: '100%' }">
      <div class="drawer">
        <div class="drawer-header">
          <div class="drawer-title">弹珠潮玩后台</div>
          <div class="drawer-sub">管理控制台</div>
        </div>

        <div class="drawer-menu">
          <div
            v-for="item in tabs"
            :key="item.path"
            class="menu-item"
            :class="{ active: route.path === item.path }"
            @click="navigate(item.path)"
          >
            <van-icon :name="item.icon" size="18" />
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const showDrawer = ref(false)

const tabs = [
  { path: '/home',       icon: 'apps-o',           label: '首页' },
  { path: '/category',   icon: 'shop-o',           label: '分类管理' },
  { path: '/product',    icon: 'goods-collect-o',  label: '商品管理' },
  { path: '/recharge',   icon: 'gold-coin-o',      label: '充值套餐' },
  { path: '/member',     icon: 'vip-card-o',       label: '会员等级' },
  { path: '/user',       icon: 'friends-o',        label: '用户管理' },
  { path: '/sign-in',    icon: 'gift-o',           label: '签到奖励' },
  { path: '/banner',     icon: 'photo-o',          label: 'Banner广告' },
  { path: '/invitation', icon: 'friends-o',        label: '邀请好友' },
]

function navigate(path) {
  showDrawer.value = false
  router.push(path)
}
</script>

<style scoped>
.content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.menu-btn {
  position: fixed;
  bottom: 24px;
  right: 16px;
  z-index: 100;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563EB, #7C3AED);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  cursor: pointer;
}

.drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.drawer-header {
  padding: 24px 20px 20px;
  background: linear-gradient(160deg, #2563EB 0%, #7C3AED 100%);
  color: #fff;
}

.drawer-title {
  font-size: 20px;
  font-weight: 700;
}

.drawer-sub {
  font-size: 12px;
  opacity: 0.75;
  margin-top: 4px;
}

.drawer-menu {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  font-size: 15px;
  color: #323233;
  cursor: pointer;
  transition: background 0.15s;
}

.menu-item:active {
  background: #f5f6fa;
}

.menu-item.active {
  color: #2563EB;
  background: #EFF6FF;
  font-weight: 600;
}
</style>
