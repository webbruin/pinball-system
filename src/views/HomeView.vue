<template>
  <div>
    <van-nav-bar title="数据中心" />

    <div class="page-scroll">
      <!-- 渐变标题区 -->
      <div class="gradient-header">
        <div class="title">数据中心</div>
        <div class="subtitle">实时业务监控</div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid section">
        <div class="stat-card" v-for="s in stats" :key="s.label">
          <div class="stat-top">
            <div class="stat-icon" :style="{ background: s.iconBg }">
              <van-icon :name="s.icon" :color="s.iconColor" size="20" />
            </div>
            <span class="stat-trend" :class="s.trend > 0 ? 'up' : 'down'">
              <van-icon :name="s.trend > 0 ? 'upgrade' : 'downgrade'" size="12" />
              {{ Math.abs(s.trend) }}%
            </span>
          </div>
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value">{{ s.value }}</div>
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
          <van-tag type="primary" plain>3月</van-tag>
        </div>
        <v-chart class="chart" :option="chartOption" autoresize />
      </div>
    </div>
  </div>
</template>

<script setup>
import { use } from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const stats = [
  { label: '总销售额', value: '¥128.5万', trend: 12.5, icon: 'gold-coin-o',  iconBg: '#EFF6FF', iconColor: '#2563EB' },
  { label: '活跃用户', value: '8,547',    trend: 8.3,  icon: 'friends-o',    iconBg: '#F3E8FF', iconColor: '#7C3AED' },
  { label: '订单总量', value: '12.6K',    trend: 5.7,  icon: 'shopping-cart-o', iconBg: '#FFF7ED', iconColor: '#F97316' },
  { label: '转化率',   value: '3.24%',    trend: -2.1, icon: 'chart-trending-o', iconBg: '#FEF2F2', iconColor: '#EF4444' },
]

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
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

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
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}

.stat-trend { font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 2px; }
.stat-trend.up   { color: #10B981; }
.stat-trend.down { color: #EF4444; }
.stat-label { font-size: 12px; color: #999; margin-bottom: 4px; }
.stat-value { font-size: 20px; font-weight: 700; color: #111; }

.chart-card {
  background: #fff; border-radius: 16px; padding: 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}

.chart-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;
}

.chart-legend { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #666; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot.blue { background: #2563EB; }
.dot.teal { background: #10B981; }
.dot.purple { background: #6366f1; }

.chart { height: 180px; }
</style>
