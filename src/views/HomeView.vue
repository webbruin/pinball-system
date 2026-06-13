<template>
  <div>
    <van-nav-bar title="数据中心" />

    <div class="page-scroll">
      <div class="gradient-header">
        <div class="title">数据中心</div>
        <div class="subtitle">实时业务监控</div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid section">
        <div class="stat-card">
          <div class="stat-top">
            <div class="stat-icon" style="background:#EFF6FF">
              <van-icon name="gold-coin-o" color="#2563EB" size="20" />
            </div>
          </div>
          <div class="stat-label">GMV</div>
          <div class="stat-value">¥{{ formatNumber(overview.gmv) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-top">
            <div class="stat-icon" style="background:#F3E8FF">
              <van-icon name="friends-o" color="#7C3AED" size="20" />
            </div>
          </div>
          <div class="stat-label">用户数</div>
          <div class="stat-value">{{ formatNumber(overview.userCount) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-top">
            <div class="stat-icon" style="background:#FFF7ED">
              <van-icon name="vip-card-o" color="#F97316" size="20" />
            </div>
          </div>
          <div class="stat-label">会员数</div>
          <div class="stat-value">{{ formatNumber(overview.memberCount) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-top">
            <div class="stat-icon" style="background:#FEF2F2">
              <van-icon name="shopping-cart-o" color="#EF4444" size="20" />
            </div>
          </div>
          <div class="stat-label">订单总量</div>
          <div class="stat-value">{{ formatNumber(overview.orderCount) }}</div>
        </div>
      </div>

      <!-- 图表卡片 -->
      <div class="chart-card section" style="margin-bottom:16px">
        <div class="chart-header">
          <div class="chart-legend">
            <span class="dot blue"></span><span>浏览量</span>
            <span class="dot teal"></span><span>访客数</span>
            <span class="dot purple"></span><span>新增</span>
          </div>
          <van-tag type="primary" plain>趋势</van-tag>
        </div>
        <v-chart class="chart" :option="chartOption" autoresize />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { use } from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const overview = reactive({
  gmv: 0,
  userCount: 0,
  memberCount: 0,
  orderCount: 0,
})

function formatNumber(val) {
  if (val === undefined || val === null) return '0'
  return Number(val).toLocaleString()
}

onMounted(() => {
  loadOverview()
})

const loadOverview = async () => {
  try {
    const res = await api.post('/admin/pinball/statistics/homeOverview')
    if (res.code === 200 && res.data) {
      overview.gmv = res.data.gmv ?? 0
      overview.userCount = res.data.userCount ?? 0
      overview.memberCount = res.data.memberCount ?? 0
      overview.orderCount = res.data.orderCount ?? 0
    }
  } catch (e) {
    // silent
  }
}

const xDates = ['2/10','2/11','2/12','2/13','2/14','2/15','2/16','2/17','2/18']
const barValues = [10, 13, 5, 22, 18, 17, 19, 17, 20]
const line1V = [14, 13, 15, 15, 16, 17, 16, 17, 16]
const line2V = [8, 10, 9, 10, 11, 14, 13, 14, 15]

const chartOption = {
  tooltip: { trigger: 'axis' },
  legend: { show: false },
  grid: { left: 0, right: 0, top: 10, bottom: 0, containLabel: true },
  xAxis: {
    type: 'category',
    data: xDates,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#ccc', fontSize: 10 },
  },
  yAxis: {
    type: 'value',
    max: 25,
    splitLine: { lineStyle: { color: '#f3f4f6' } },
    axisLabel: { show: false },
  },
  series: [
    {
      name: '浏览量',
      type: 'bar',
      data: barValues,
      barWidth: 14,
      itemStyle: {
        color: '#6366f1',
        borderRadius: [2, 2, 0, 0],
        opacity: 0.75,
      },
    },
    {
      name: '访客数',
      type: 'line',
      data: line1V,
      smooth: false,
      lineStyle: { color: '#2563EB', width: 2 },
      symbol: 'none',
    },
    {
      name: '新增',
      type: 'line',
      data: line2V,
      smooth: false,
      lineStyle: { color: '#10B981', width: 2 },
      symbol: 'none',
      areaStyle: { color: 'rgba(16, 185, 129, 0.1)' },
    },
  ],
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #111;
}

.chart-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.dot.blue { background: #2563EB; }
.dot.teal { background: #10B981; }
.dot.purple { background: #6366f1; }

.chart {
  height: 180px;
}
</style>
