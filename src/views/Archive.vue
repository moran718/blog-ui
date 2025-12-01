<template>
  <div class="archive-page" :class="{ 'dark-theme': isDarkTheme }">
    <!-- 全屏背景图 -->
    <div class="page-background">
      <img :src="bgImage" alt="背景图" class="bg-image" @load="handleBgLoad" @error="handleBgError" />
    </div>

    <!-- 导航栏 -->
    <NavBar />

    <!-- 全屏欢迎区域 -->
    <div class="welcome-section" v-show="!showContent">
      <div class="welcome-content">
        <div class="welcome-title">
          <span class="title-icon">📚</span>
          <span>时光归档</span>
        </div>
        <p class="welcome-subtitle">时光如水，岁月如歌</p>
      </div>
      <!-- 向下滚动按钮 -->
      <div class="scroll-down-btn" @click="scrollToContent">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-section" v-show="showContent">
      <!-- 页面标题 -->
      <div id="archive-content-header" class="page-header">
        <div class="header-title">
          <span class="title-icon">📚</span>
          <span>时光归档</span>
        </div>
        <p class="header-subtitle">时光如水，岁月如歌</p>
        <div class="stats-info">
          <span class="stat-item">📝 共 {{ totalCount }} 篇文章</span>
        </div>
        <!-- 博客运行时间 -->
        <div class="runtime-card">
          <div class="runtime-header">
            <span class="runtime-icon">⏱️</span>
            <span class="runtime-title">博客已运行</span>
          </div>
          <div class="runtime-counter">
            <div class="time-block">
              <div class="time-value">
                <span class="digit">{{ String(runDays).padStart(3, '0') }}</span>
              </div>
              <span class="time-label">天</span>
            </div>
            <div class="time-separator">:</div>
            <div class="time-block">
              <div class="time-value">
                <span class="digit">{{ String(runHours).padStart(2, '0') }}</span>
              </div>
              <span class="time-label">时</span>
            </div>
            <div class="time-separator">:</div>
            <div class="time-block">
              <div class="time-value">
                <span class="digit">{{ String(runMinutes).padStart(2, '0') }}</span>
              </div>
              <span class="time-label">分</span>
            </div>
            <div class="time-separator animate-blink">:</div>
            <div class="time-block">
              <div class="time-value seconds">
                <span class="digit">{{ String(runSeconds).padStart(2, '0') }}</span>
              </div>
              <span class="time-label">秒</span>
            </div>
          </div>
          <div class="runtime-decoration">
            <span class="sparkle">✨</span>
            <span class="sparkle">✨</span>
            <span class="sparkle">✨</span>
          </div>
        </div>
      </div>

      <!-- 时间线容器 -->
      <div class="archive-container">
        <div class="timeline">
          <!-- 年份区块 -->
          <div v-for="yearData in archiveData" :key="yearData.year" class="year-block">
            <!-- 年份标题 -->
            <div class="year-header" @click="toggleYear(yearData.year)">
              <div class="year-dot"></div>
              <div class="year-content">
                <span class="year-text">{{ yearData.year }}</span>
                <span class="year-count">{{ yearData.count }} 篇</span>
                <span class="year-toggle" :class="{ expanded: expandedYears.includes(yearData.year) }">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </div>
            </div>

            <!-- 月份列表 -->
            <transition name="slide">
              <div class="months-container" v-show="expandedYears.includes(yearData.year)">
                <div v-for="monthData in yearData.months" :key="monthData.month" class="month-block">
                  <!-- 月份标题 -->
                  <div class="month-header">
                    <div class="month-dot"></div>
                    <span class="month-text">{{ monthData.month }}月</span>
                    <span class="month-count">{{ monthData.count }} 篇</span>
                  </div>

                  <!-- 文章列表 -->
                  <div class="articles-list">
                    <div v-for="article in monthData.records" :key="article.id" class="article-item"
                      @click="goToArticle(article.id)">
                      <div class="article-date">{{ article.date }}</div>
                      <div class="article-info">
                        <h3 class="article-title">{{ article.title }}</h3>
                        <div class="article-meta">
                          <span v-if="article.categoryName" class="category-tag">{{ article.categoryName }}</span>
                          <span class="meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            {{ article.views }}
                          </span>
                          <span class="meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path
                                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
                              </path>
                            </svg>
                            {{ article.likes }}
                          </span>
                        </div>
                      </div>
                      <div class="article-arrow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <!-- 空状态 -->
          <div v-if="!loading && archiveData.length === 0" class="empty-state">
            <span class="empty-icon">📭</span>
            <p>暂无文章</p>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <span class="loading-icon">⏳</span>
            <p>加载中...</p>
          </div>
        </div>
      </div>

      <!-- 页脚 -->
      <Footer minimal />
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import { http } from '@/utils/request'
import { getRandomBg, getFallbackBg } from '@/utils/randomBg'
import { hideLoading } from '@/utils/pageLoader'

export default {
  name: 'ArchivePage',
  components: {
    NavBar,
    Footer
  },
  data() {
    return {
      isDarkTheme: false,
      showContent: false,
      loading: false,
      archiveData: [],
      expandedYears: [],
      bgImage: '',
      // 博客运行时间
      blogStartTime: new Date('2025-11-26 00:00:00'), // 博客创建时间，可以修改为实际日期
      runDays: 0,
      runHours: 0,
      runMinutes: 0,
      runSeconds: 0,
      runtimeTimer: null
    }
  },
  computed: {
    totalCount() {
      return this.archiveData.reduce((sum, year) => sum + year.count, 0)
    }
  },
  mounted() {
    this.bgImage = getRandomBg('archive')
    this.checkTheme()
    this.setupScrollListener()
    this.loadArchiveData()
    // 启动运行时间计时器
    this.updateRuntime()
    this.runtimeTimer = setInterval(() => {
      this.updateRuntime()
    }, 1000)
    // 监听主题变化
    this.themeObserver = new MutationObserver(() => {
      this.checkTheme()
    })
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    // 超时保护
    this.loadingTimeout = setTimeout(() => {
      hideLoading()
    }, 8000)
  },
  beforeDestroy() {
    window.removeEventListener('wheel', this.handleWheel)
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout)
    }
    if (this.themeObserver) {
      this.themeObserver.disconnect()
    }
    if (this.runtimeTimer) {
      clearInterval(this.runtimeTimer)
    }
  },
  methods: {
    checkTheme() {
      this.isDarkTheme = document.documentElement.classList.contains('dark-theme')
    },
    updateRuntime() {
      const now = new Date()
      const diff = now - this.blogStartTime

      // 计算天、时、分、秒
      this.runDays = Math.floor(diff / (1000 * 60 * 60 * 24))
      this.runHours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      this.runMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      this.runSeconds = Math.floor((diff % (1000 * 60)) / 1000)
    },
    async loadArchiveData() {
      this.loading = true
      try {
        const res = await http.get('/api/record/archive')
        this.archiveData = res.data || []
        // 默认展开第一年
        if (this.archiveData.length > 0) {
          this.expandedYears = [this.archiveData[0].year]
        }
      } catch (error) {
        console.error('加载归档数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    toggleYear(year) {
      const index = this.expandedYears.indexOf(year)
      if (index > -1) {
        this.expandedYears.splice(index, 1)
      } else {
        this.expandedYears.push(year)
      }
    },
    goToArticle(id) {
      this.$router.push(`/record/${id}`)
    },
    setupScrollListener() {
      window.addEventListener('wheel', this.handleWheel)
    },
    handleWheel(event) {
      if (!this.showContent && event.deltaY > 0) {
        this.scrollToContent()
      }
      if (this.showContent && event.deltaY < 0 && window.scrollY <= 0) {
        this.scrollToWelcome()
      }
    },
    scrollToContent() {
      this.showContent = true
      this.$nextTick(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        // 触发 scroll 事件，让 NavBar 检测并隐藏
        window.dispatchEvent(new Event('scroll'))
      })
    },
    scrollToWelcome() {
      this.showContent = false
      window.scrollTo({ top: 0, behavior: 'smooth' })
      // 触发 scroll 事件，让 NavBar 检测并显示
      this.$nextTick(() => {
        window.dispatchEvent(new Event('scroll'))
      })
    },
    handleBgLoad() {
      if (this.loadingTimeout) {
        clearTimeout(this.loadingTimeout)
      }
      hideLoading()
    },
    handleBgError() {
      if (this.loadingTimeout) {
        clearTimeout(this.loadingTimeout)
      }
      this.bgImage = getFallbackBg(this.bgImage, 'archive')
      hideLoading()
    }
  }
}
</script>

<style scoped>
.archive-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* 全屏背景图 */
.page-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
}

.page-background .bg-image {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
}

/* 全屏欢迎区域 */
.welcome-section {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.welcome-content {
  text-align: center;
  color: #fff;
}

.welcome-title {
  font-size: 48px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  animation: fadeInDown 1s ease;
}

.welcome-title .title-icon {
  font-size: 52px;
}

.welcome-subtitle {
  margin-top: 20px;
  font-size: 20px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  animation: fadeInUp 1s ease 0.3s both;
}

/* 向下滚动按钮 */
.scroll-down-btn {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: bounce 2s infinite;
}

.scroll-down-btn:hover {
  background-color: #fff;
  transform: translateX(-50%) scale(1.1);
}

.scroll-down-btn svg {
  width: 24px;
  height: 24px;
  color: #42b983;
  stroke: #42b983;
}

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateX(-50%) translateY(0);
  }

  40% {
    transform: translateX(-50%) translateY(-10px);
  }

  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 内容区域 */
.content-section {
  position: relative;
  animation: fadeIn 0.5s ease;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 归档容器需要flex-grow来填充空间 */
.content-section .archive-container {
  flex: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* 页面标题 */
.page-header {
  text-align: center;
  padding: 120px 20px 40px;
  color: #fff;
}

.page-header .header-title {
  font-size: 36px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.page-header .title-icon {
  font-size: 42px;
}

.page-header .header-subtitle {
  font-size: 16px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  margin: 0 0 20px;
}

.stats-info {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
}

/* 博客运行时间卡片 */
.runtime-card {
  margin-top: 30px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
  backdrop-filter: blur(15px);
  padding: 25px 40px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  animation: cardFloat 3s ease-in-out infinite;
}

.runtime-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg,
      transparent 40%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 60%);
  animation: shimmer 3s infinite;
}

@keyframes cardFloat {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }

  100% {
    transform: translateX(100%) rotate(45deg);
  }
}

.runtime-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.runtime-icon {
  font-size: 28px;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

.runtime-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  background: linear-gradient(90deg, #fff, #f0f0f0, #fff);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: textShine 3s linear infinite;
}

@keyframes textShine {
  0% {
    background-position: 0% center;
  }

  100% {
    background-position: 200% center;
  }
}

.runtime-counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.time-value {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 70px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
}

.time-value::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
}

.time-value .digit {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(102, 126, 234, 0.5);
  letter-spacing: 2px;
}

.time-value.seconds .digit {
  color: #ffd700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(255, 215, 0, 0.5);
  animation: secondsPulse 1s ease-in-out infinite;
}

@keyframes secondsPulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.time-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  letter-spacing: 1px;
}

.time-separator {
  font-size: 28px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 2px;
  align-self: flex-start;
  margin-top: 12px;
}

.animate-blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.runtime-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.sparkle {
  position: absolute;
  font-size: 16px;
  opacity: 0;
  animation: sparkle 2s ease-in-out infinite;
}

.sparkle:nth-child(1) {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.sparkle:nth-child(2) {
  top: 30%;
  right: 15%;
  animation-delay: 0.7s;
}

.sparkle:nth-child(3) {
  bottom: 25%;
  left: 20%;
  animation-delay: 1.4s;
}

@keyframes sparkle {

  0%,
  100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }

  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
}

/* 归档容器 */
.archive-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
  min-height: calc(100vh - 350px);
}

/* 时间线 */
.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #667eea, #764ba2);
  border-radius: 3px;
}

/* 年份区块 */
.year-block {
  margin-bottom: 30px;
}

.year-header {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.year-header:hover .year-content {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.year-dot {
  position: absolute;
  left: -26px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
  z-index: 1;
}

.year-content {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 15px 25px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  width: 320px;
}

.year-text {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.year-count {
  font-size: 14px;
  color: #999;
  background: #f0f2f5;
  padding: 4px 12px;
  border-radius: 12px;
}

.year-toggle {
  margin-left: auto;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.year-toggle svg {
  width: 20px;
  height: 20px;
  stroke: #999;
}

.year-toggle.expanded {
  transform: rotate(180deg);
}

/* 月份容器 */
.months-container {
  margin-left: 20px;
  padding-top: 15px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

/* 月份区块 */
.month-block {
  margin-bottom: 20px;
}

.month-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}

.month-dot {
  position: absolute;
  left: -34px;
  width: 12px;
  height: 12px;
  background: #fff;
  border: 3px solid #667eea;
  border-radius: 50%;
  z-index: 1;
}

.month-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.month-count {
  font-size: 12px;
  color: #999;
}

/* 文章列表 */
.articles-list {
  margin-left: 10px;
}

.article-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 15px 20px;
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.article-item:hover {
  transform: translateX(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
}

.article-date {
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
  min-width: 50px;
}

.article-info {
  flex: 1;
  min-width: 0;
}

.article-title {
  margin: 0 0 8px;
  font-size: 16px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.category-tag {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  color: #667eea;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.meta-item svg {
  width: 14px;
  height: 14px;
}

.article-arrow {
  color: #ccc;
  transition: all 0.3s ease;
}

.article-arrow svg {
  width: 20px;
  height: 20px;
}

.article-item:hover .article-arrow {
  color: #667eea;
  transform: translateX(5px);
}

/* 空状态 & 加载状态 */
.empty-state,
.loading-state {
  text-align: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
}

.empty-icon,
.loading-icon {
  font-size: 60px;
  display: block;
  margin-bottom: 20px;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .archive-container {
    padding: 20px 15px;
  }

  .timeline {
    padding-left: 25px;
  }

  .year-content {
    padding: 12px 18px;
  }

  .year-text {
    font-size: 22px;
  }

  .article-item {
    padding: 12px 15px;
    flex-wrap: wrap;
  }

  .article-date {
    min-width: 45px;
  }

  .runtime-card {
    padding: 20px 15px;
    margin-top: 20px;
  }

  .runtime-counter {
    gap: 4px;
    flex-wrap: wrap;
  }

  .time-value {
    padding: 8px 10px;
    min-width: 55px;
  }

  .time-value .digit {
    font-size: 22px;
  }

  .time-separator {
    font-size: 20px;
    margin-top: 8px;
  }

  .time-label {
    font-size: 11px;
  }
}

/* 暗黑主题 */
.dark-theme .year-content {
  background: rgba(30, 30, 50, 0.9);
}

.dark-theme .year-count {
  background: rgba(60, 60, 80, 0.8);
  color: #bbb;
}

.dark-theme .month-text {
  color: #eee;
}

.dark-theme .article-item {
  background: rgba(30, 30, 50, 0.85);
}

.dark-theme .article-title {
  color: #eee;
}

.dark-theme .empty-state,
.dark-theme .loading-state {
  background: rgba(30, 30, 50, 0.85);
}

.dark-theme .runtime-card {
  background: linear-gradient(135deg, rgba(60, 60, 100, 0.5), rgba(80, 50, 100, 0.5));
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .time-value {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-color: rgba(255, 255, 255, 0.2);
}

/* 响应式布局 - 超小屏幕 */
@media (max-width: 375px) {
  .archive-container {
    padding: 15px 10px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-subtitle {
    font-size: 12px;
  }

  .timeline {
    padding-left: 20px;
  }

  .year-content {
    padding: 10px 14px;
  }

  .year-text {
    font-size: 18px;
  }

  .year-count {
    font-size: 11px;
    padding: 3px 8px;
  }

  .article-item {
    padding: 10px 12px;
  }

  .article-date {
    font-size: 12px;
    min-width: 40px;
  }

  .article-title {
    font-size: 13px;
  }

  .article-meta span {
    font-size: 11px;
  }

  .runtime-card {
    padding: 15px 10px;
  }

  .runtime-title {
    font-size: 16px;
  }

  .runtime-counter {
    gap: 3px;
  }

  .time-value {
    padding: 6px 8px;
    min-width: 48px;
  }

  .time-value .digit {
    font-size: 18px;
  }

  .time-separator {
    font-size: 16px;
    margin: 0 2px;
  }

  .time-label {
    font-size: 10px;
  }
}
</style>
