<template>
  <div>
    <van-nav-bar title="运营广告">
      <template #right>
        <van-button type="primary" size="small" icon="plus" @click="showAdd = true">添加</van-button>
      </template>
    </van-nav-bar>

    <div class="page-scroll">
      <div class="gradient-header">
        <div class="title">运营广告</div>
        <div class="subtitle">管理首页轮播图</div>
      </div>

      <van-tabs v-model:active="activeTab" sticky offset-top="46">
        <van-tab title="轮播广告">
          <div class="section" style="margin-bottom:16px">
            <div class="banner-item" v-for="(item, idx) in banners" :key="item.id">
              <!-- 图片区 -->
              <div class="banner-img-wrap">
                <img :src="item.img" class="banner-img" />
                <div class="banner-overlay">
                  <div>
                    <p class="banner-title">{{ item.title }}</p>
                    <p class="banner-path">{{ item.path }}</p>
                  </div>
                  <van-switch v-model="item.enabled" size="22px" />
                </div>
              </div>
              <!-- 操作行 -->
              <div class="banner-meta">
                <span class="meta-order">排序: 第 {{ idx + 1 }} 位</span>
                <van-tag :type="item.enabled ? 'success' : 'default'">{{ item.enabled ? '已启用' : '已禁用' }}</van-tag>
                <div class="banner-ops">
                  <van-icon name="arrow-up"   size="16" color="#999" @click="moveUp(idx)" />
                  <van-icon name="arrow-down" size="16" color="#999" @click="moveDown(idx)" />
                  <van-icon name="delete-o"   size="16" color="#EF4444" @click="banners.splice(idx, 1)" />
                </div>
              </div>
            </div>
          </div>
        </van-tab>
        <van-tab title="拉新活动">
          <van-empty description="暂无活动" style="padding-top:40px" />
        </van-tab>
      </van-tabs>
    </div>

    <!-- 新增弹窗 -->
    <van-popup v-model:show="showAdd" round position="bottom" :style="{ maxHeight: '80%' }">
      <div class="popup-wrap">
        <van-nav-bar title="添加轮播图" right-text="关闭" @click-right="showAdd = false" />
        <van-form @submit="submitAdd" style="padding:0 4px">
          <van-cell-group inset>
            <van-field v-model="form.title" label="标题" placeholder="请输入标题" :rules="[{required:true}]" />
            <van-field v-model="form.path"  label="跳转路径" placeholder="/path/to/page" />
          </van-cell-group>
          <div style="padding:16px">
            <van-uploader :after-read="onUpload" style="margin-bottom:12px" />
            <van-button type="primary" native-type="submit" block round>添加</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const activeTab = ref(0)
const showAdd   = ref(false)
const form      = reactive({ title: '', path: '' })

const banners = ref([
  { id: 1, title: '新春特惠活动', path: '/promotions/spring', enabled: true,  img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=70' },
  { id: 2, title: '会员升级福利', path: '/membership',        enabled: true,  img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70' },
  { id: 3, title: '游戏大赛开启', path: '/game/contest',      enabled: false, img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=70' },
])

function moveUp(i)   { if (i > 0) { [banners.value[i-1], banners.value[i]] = [banners.value[i], banners.value[i-1]] } }
function moveDown(i) { if (i < banners.value.length-1) { [banners.value[i], banners.value[i+1]] = [banners.value[i+1], banners.value[i]] } }
function onUpload(file) { console.log('upload', file) }
function submitAdd() {
  banners.value.push({ id: Date.now(), title: form.title, path: form.path, enabled: true, img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=70' })
  showAdd.value = false
  Object.assign(form, { title: '', path: '' })
}
</script>

<style scoped>
.banner-item {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  margin-top: 12px;
}

.banner-img-wrap { position: relative; height: 160px; }
.banner-img { width: 100%; height: 100%; object-fit: cover; }

.banner-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%);
  display: flex; align-items: flex-end; justify-content: space-between; padding: 14px;
}

.banner-title { color: #fff; font-size: 15px; font-weight: 600; }
.banner-path  { color: rgba(255,255,255,0.7); font-size: 11px; margin-top: 2px; }

.banner-meta {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; font-size: 13px;
}

.meta-order { color: #666; }
.banner-ops { margin-left: auto; display: flex; gap: 14px; cursor: pointer; }
.popup-wrap { overflow-y: auto; max-height: 80vh; }
</style>
