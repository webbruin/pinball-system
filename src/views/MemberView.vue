<template>
  <div>
    <van-nav-bar title="会员体系" />

    <div class="page-scroll">
      <div class="gradient-header">
        <div class="title">会员体系</div>
        <div class="subtitle">五档会员差异化权益配置</div>
      </div>

      <!-- 分布统计 -->
      <van-cell-group inset title="会员分布统计">
        <div class="dist-list">
          <div class="dist-item" v-for="d in distribution" :key="d.level">
            <span class="dist-dot" :style="{ background: d.color }"></span>
            <span class="dist-level">{{ d.level }}</span>
            <div class="dist-bar-wrap">
              <div class="dist-bar" :style="{ width: d.pct + '%', background: d.color }"></div>
            </div>
            <span class="dist-meta">{{ d.count }} 人</span>
            <span class="dist-meta gray">{{ d.pct }}%</span>
          </div>
        </div>
      </van-cell-group>

      <!-- 等级卡片 -->
      <div class="section" style="margin-bottom:16px">
        <div class="level-card" v-for="lv in levels" :key="lv.name" :style="{ borderTop: `3px solid ${lv.color}` }">
          <!-- 标题行 -->
          <div class="lv-header">
            <div class="lv-icon" :style="{ background: lv.iconBg }">
              <van-icon name="medal-o" :color="lv.color" size="20" />
            </div>
            <div>
              <div class="lv-name">{{ lv.name }}</div>
              <div class="lv-sub">{{ lv.sub }}</div>
            </div>
            <van-icon name="edit" color="#ccc" size="18" style="margin-left:auto;cursor:pointer" />
          </div>

          <!-- 晋升条件 -->
          <div class="lv-upgrade">
            <van-icon name="upgrade" color="#10B981" size="13" />
            <span class="upgrade-label">晋升条件</span>
            <span class="upgrade-val">累计消费 {{ lv.upgrade }}</span>
          </div>

          <van-divider style="margin:10px 0" />

          <div class="perk-title">专属权益</div>
          <van-cell-group :border="false">
            <van-cell center title="金币加成" icon="gold-coin-o" :value="lv.coinBonus" :value-class="`perk-val`" :style="{'--van-cell-icon-color': '#F59E0B'}" />
            <van-cell center title="购物折扣" icon="discount"    :value="lv.discount"  :value-class="`perk-val`" :style="{'--van-cell-icon-color': '#10B981'}" />
            <van-cell center title="客服支持" icon="service-o"   :value="lv.service"   value-class="perk-val-gray" />
          </van-cell-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const distribution = [
  { level: '白银', count: 120, pct: 41.4, color: '#94A3B8' },
  { level: '黄金', count: 85,  pct: 29.3, color: '#F59E0B' },
  { level: '钻石', count: 45,  pct: 15.5, color: '#2563EB' },
  { level: '荣耀', count: 28,  pct: 9.7,  color: '#7C3AED' },
  { level: '王者', count: 12,  pct: 4.1,  color: '#EF4444' },
]

const levels = [
  { name: '白银', sub: 'Level 1', upgrade: '¥0',      coinBonus: '+0%',  discount: '0% OFF',  service: '标准客服',   color: '#94A3B8', iconBg: '#f3f4f6' },
  { name: '黄金', sub: 'Level 2', upgrade: '¥1,000',  coinBonus: '+10%', discount: '5% OFF',  service: '优先客服',   color: '#F59E0B', iconBg: '#FEF3C7' },
  { name: '钻石', sub: 'Level 3', upgrade: '¥5,000',  coinBonus: '+20%', discount: '10% OFF', service: '专属客服',   color: '#2563EB', iconBg: '#EFF6FF' },
  { name: '荣耀', sub: 'Level 4', upgrade: '¥10,000', coinBonus: '+30%', discount: '15% OFF', service: 'VIP专属客服', color: '#7C3AED', iconBg: '#F3E8FF' },
  { name: '王者', sub: 'Level 5', upgrade: '¥50,000', coinBonus: '+50%', discount: '20% OFF', service: '首席客服',   color: '#EF4444', iconBg: '#FEE2E2' },
]
</script>

<style scoped>
.dist-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.dist-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.dist-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dist-level { width: 28px; color: #333; font-weight: 500; }
.dist-bar-wrap { flex: 1; height: 6px; background: #f3f4f6; border-radius: 3px; overflow: hidden; }
.dist-bar  { height: 100%; border-radius: 3px; }
.dist-meta { color: #666; min-width: 40px; text-align: right; font-size: 12px; }
.dist-meta.gray { color: #999; }

.level-card {
  background: #fff; border-radius: 16px; padding: 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05); margin-top: 12px;
}

.lv-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.lv-icon   { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.lv-name   { font-size: 16px; font-weight: 700; color: #111; }
.lv-sub    { font-size: 12px; color: #999; }

.lv-upgrade {
  display: flex; align-items: center; gap: 6px;
  background: #f9fafb; border-radius: 8px; padding: 8px 12px;
}
.upgrade-label { font-size: 12px; color: #10B981; font-weight: 500; }
.upgrade-val   { font-size: 13px; color: #333; margin-left: 4px; }
.perk-title    { font-size: 12px; color: #999; margin-bottom: 4px; }

:deep(.perk-val)      { font-weight: 600; color: #2563EB; }
:deep(.perk-val-gray) { color: #999; }
</style>
