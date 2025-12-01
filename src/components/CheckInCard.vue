<template>
  <div class="checkin-card" v-if="isLoggedIn">
    <div class="card-header">
      <span class="title">✨ 每日签到</span>
      <span class="month-days">本月已签 {{ checkInStatus.monthCheckInDays }} 天</span>
    </div>

    <div class="card-body">
      <!-- 等级信息 -->
      <div class="level-info">
        <div class="level-badge" :style="{ background: levelGradient }">
          <span class="level-icon">{{ checkInStatus.currentLevelIcon || '🌱' }}</span>
          <span>Lv.{{ checkInStatus.currentLevel }}</span>
        </div>
        <div class="level-name">{{ checkInStatus.currentLevelName || '初来乍到' }}</div>
      </div>
      <div class="exp-info">
        <div class="exp-bar">
          <div class="exp-progress" :style="{ width: expPercent + '%' }"></div>
        </div>
        <div class="exp-text">
          <span v-if="checkInStatus.currentLevel < 5">{{ checkInStatus.currentExp }} / {{ checkInStatus.nextLevelExp
            }}</span>
          <span v-else>已满级 ✨</span>
        </div>
      </div>

      <!-- 连续签到 -->
      <div class="continuous-info">
        <span class="continuous-days">🔥 连续签到 {{ checkInStatus.continuousDays }} 天</span>
      </div>

      <!-- 签到按钮 -->
      <button class="checkin-btn" :class="{ checked: checkInStatus.checkedIn, loading: loading }"
        :disabled="checkInStatus.checkedIn || loading" @click="doCheckIn">
        <span v-if="loading">签到中...</span>
        <span v-else-if="checkInStatus.checkedIn">已签到 +{{ checkInStatus.todayExp }}经验</span>
        <span v-else>签到 +{{ checkInStatus.nextExp }}经验</span>
      </button>

      <!-- 提示信息 -->
      <div class="tips" v-if="!checkInStatus.checkedIn">
        <span>连续签到经验递增，最高50经验/天</span>
      </div>
    </div>

    <!-- 签到成功动画 -->
    <div class="success-animation" v-if="showSuccess">
      <span class="success-text">+{{ lastExpGained }} 经验</span>
    </div>
  </div>
</template>

<script>
import { http } from '@/utils/request'

export default {
  name: 'CheckInCard',
  data() {
    return {
      isLoggedIn: false,
      loading: false,
      showSuccess: false,
      lastExpGained: 0,
      checkInStatus: {
        checkedIn: false,
        continuousDays: 0,
        todayExp: 0,
        nextExp: 10,
        currentExp: 0,
        currentLevel: 1,
        currentLevelName: '初来乍到',
        currentLevelIcon: '🌱',
        currentLevelColor: '#9e9e9e',
        nextLevelExp: 100,
        monthCheckInDays: 0
      }
    }
  },
  computed: {
    expPercent() {
      if (this.checkInStatus.currentLevel >= 5) return 100
      if (this.checkInStatus.nextLevelExp === 0) return 100
      // 计算当前等级区间的进度
      const levelExps = [0, 100, 300, 600, 1000]
      const currentLevelStart = levelExps[this.checkInStatus.currentLevel - 1]
      const nextLevelStart = this.checkInStatus.nextLevelExp
      const progress = this.checkInStatus.currentExp - currentLevelStart
      const total = nextLevelStart - currentLevelStart
      return Math.min(100, Math.floor((progress / total) * 100))
    },
    levelGradient() {
      const color = this.checkInStatus.currentLevelColor || '#9e9e9e'
      return `linear-gradient(135deg, ${color} 0%, ${this.adjustColor(color, -20)} 100%)`
    }
  },
  mounted() {
    this.checkLoginStatus()
  },
  methods: {
    checkLoginStatus() {
      const user = localStorage.getItem('user')
      this.isLoggedIn = !!user
      if (this.isLoggedIn) {
        this.fetchCheckInStatus()
      }
    },
    async fetchCheckInStatus() {
      try {
        const res = await http.get('/api/checkin/status')
        if (res.data) {
          this.checkInStatus = res.data
        }
      } catch (error) {
        console.error('获取签到状态失败:', error)
      }
    },
    async doCheckIn() {
      if (this.loading || this.checkInStatus.checkedIn) return

      this.loading = true
      try {
        const res = await http.post('/api/checkin/do')
        if (res.data) {
          this.lastExpGained = res.data.todayExp
          this.checkInStatus = res.data

          // 显示成功动画
          this.showSuccess = true
          setTimeout(() => {
            this.showSuccess = false
          }, 2000)
        }
      } catch (error) {
        console.error('签到失败:', error)
        alert(error.message || '签到失败')
      } finally {
        this.loading = false
      }
    },
    // 调整颜色明暗度
    adjustColor(color, amount) {
      const hex = color.replace('#', '')
      const num = parseInt(hex, 16)
      const r = Math.min(255, Math.max(0, (num >> 16) + amount))
      const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
      const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
      return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
    }
  }
}
</script>

<style scoped>
.checkin-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  position: relative;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .title {
  color: #fff;
  font-weight: 600;
  font-size: 16px;
}

.card-header .month-days {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

.card-body {
  padding: 20px;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.level-badge {
  color: #fff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.level-icon {
  font-size: 16px;
}

.level-name {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.exp-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.exp-bar {
  flex: 1;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.exp-progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.exp-text {
  font-size: 12px;
  color: #888;
  min-width: 70px;
  text-align: right;
}

.continuous-info {
  text-align: center;
  margin-bottom: 15px;
}

.continuous-days {
  color: #ff6b6b;
  font-size: 14px;
  font-weight: 500;
}

.checkin-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.checkin-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.checkin-btn:disabled {
  cursor: not-allowed;
}

.checkin-btn.checked {
  background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
}

.checkin-btn.loading {
  opacity: 0.7;
}

.tips {
  text-align: center;
  margin-top: 12px;
  font-size: 12px;
  color: #999;
}

/* 签到成功动画 */
.success-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: floatUp 2s ease-out forwards;
  pointer-events: none;
}

.success-text {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  text-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.5);
  }

  50% {
    opacity: 1;
    transform: translate(-50%, -80%) scale(1.2);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -120%) scale(1);
  }
}
</style>

<style>
/* 黑暗主题适配 - 非 scoped */
.dark-theme .checkin-card {
  background: rgba(30, 30, 50, 0.95);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dark-theme .checkin-card .card-body {
  background: transparent;
}

.dark-theme .checkin-card .level-name {
  color: #aaa;
}

.dark-theme .checkin-card .exp-bar {
  background: rgba(60, 60, 80, 0.8);
}

.dark-theme .checkin-card .exp-text {
  color: #aaa;
}

.dark-theme .checkin-card .continuous-days {
  color: #ff8a8a;
}

.dark-theme .checkin-card .tips {
  color: #888;
}

.dark-theme .checkin-card .success-text {
  color: #a8b4ff;
  text-shadow: 0 2px 10px rgba(102, 126, 234, 0.5);
}
</style>
