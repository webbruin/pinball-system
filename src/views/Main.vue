<template>
  <div class="content">
    <router-view />
    <van-tabbar v-model="active" @change="onTabChange" fixed safe-area-inset-bottom>
      <van-tabbar-item v-for="item in tabs" :key="item.path" :icon="item.icon">
        {{ item.label }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tabs = [
  { path: '/home',    icon: 'apps-o',         label: '首页' },
  { path: '/category',    icon: 'shop-o',           label: '分类' },
  { path: '/product', icon: 'goods-collect-o',label: '商品' },
  // { path: '/advert',  icon: 'volume-o',       label: '广告' },
  // { path: '/user',    icon: 'friends-o',      label: '用户' },
  // { path: '/member',  icon: 'vip-card-o',     label: '会员' },
  { path: '/room-type',    icon: 'fire-o',           label: '类型' },
  { path: '/room',    icon: 'desktop-o',           label: '房间' },
  { path: '/sign-in',    icon: 'gift-o',           label: '签到' },
  { path: '/banner',    icon: 'photo-o',           label: '广告' },
  { path: '/invitation',    icon: 'friends-o',           label: '邀请' },
]

const active = ref(0)

watch(() => route.path, (path) => {
  const idx = tabs.findIndex(t => t.path === path)
  if (idx !== -1) { active.value = idx }
}, { immediate: true })

function onTabChange(idx) {
  router.push(tabs[idx].path)
}
</script>

<style scoped>
.content {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>