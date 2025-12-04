<template>
  <div id="app" @click="handleClick">
    <!-- 页面滚动进度条 -->
    <div class="scroll-progress-bar" :style="{ width: scrollProgress + '%' }"></div>
    <!-- 页面加载动画 -->
    <PageLoading :show="isLoading" :progress="loadingProgress" />
    <router-view />
    <!-- 全局音乐播放器 -->
    <GlobalMusicPlayer />
  </div>
</template>

<script>
import PageLoading from './components/PageLoading.vue'
import GlobalMusicPlayer from './components/GlobalMusicPlayer.vue'
import { loadingBus } from './utils/pageLoader'
import { http } from './utils/request'
import { loadMusicList } from './utils/musicPlayer'

export default {
  name: 'App',
  components: {
    PageLoading,
    GlobalMusicPlayer
  },
  data() {
    return {
      isLoading: false,
      loadingProgress: 0,
      scrollProgress: 0,
      // 社会主义核心价值观
      coreValues: [
        '富强', '民主', '文明', '和谐',
        '自由', '平等', '公正', '法治',
        '爱国', '敬业', '诚信', '友善'
      ],
      // 彩色数组
      colors: [
        '#ff6b6b', '#ffa502', '#2ed573', '#1e90ff',
        '#ff6348', '#7bed9f', '#70a1ff', '#5352ed',
        '#ff4757', '#2f3542', '#ff7f50', '#a55eea',
        '#00d2d3', '#ff9ff3', '#54a0ff', '#5f27cd'
      ],
      currentIndex: 0
    }
  },
  mounted() {
    // 监听加载状态变化
    loadingBus.$on('loading-change', ({ isLoading, progress }) => {
      this.isLoading = isLoading
      this.loadingProgress = progress
    })
    // 监听滚动事件更新进度条
    window.addEventListener('scroll', this.updateScrollProgress)
    // 记录网站访问
    this.recordSiteVisit()
    // 加载音乐列表
    loadMusicList()
  },
  beforeDestroy() {
    loadingBus.$off('loading-change')
    window.removeEventListener('scroll', this.updateScrollProgress)
  },
  methods: {
    updateScrollProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      this.scrollProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
    },
    handleClick(event) {
      // 创建文字元素
      const text = document.createElement('span')
      text.className = 'click-text-effect'
      text.textContent = this.coreValues[this.currentIndex]

      // 随机颜色
      const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)]
      text.style.color = randomColor
      text.style.left = event.clientX + 'px'
      text.style.top = event.clientY + 'px'

      document.body.appendChild(text)

      // 循环显示下一个词
      this.currentIndex = (this.currentIndex + 1) % this.coreValues.length

      // 动画结束后移除元素
      setTimeout(() => {
        if (text.parentNode) {
          text.parentNode.removeChild(text)
        }
      }, 1500)
    },
    recordSiteVisit() {
      // 使用 sessionStorage 避免同一会话重复记录
      if (!sessionStorage.getItem('visited')) {
        http.post('/api/user/visit').then(() => {
          sessionStorage.setItem('visited', '1')
        }).catch(() => {
          // 忽略错误
        })
      }
      // 记录详细浏览信息（每次访问都记录）
      http.post('/api/browse/record').catch(() => {
        // 忽略错误
      })
    }
  }
}
</script>

<style>
/* 引入霞鹜文楷字体 */
@import url('https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.1.0/style.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  /* 动漫风格鼠标指针 */
  cursor: url('./assets/cursors/cursor.cur'), auto !important;
}

/* 确保所有可点击元素也使用自定义光标 */
a,
button,
input,
select,
textarea,
label,
[role="button"],
.clickable,
[onclick],
li[class*="nav"],
.nav-item,
.menu-item,
.dropdown-item,
.login-btn,
.user-avatar,
.rocket-btn,
.settings-btn {
  cursor: url('./assets/cursors/cursor.cur'), auto !important;
}

html {
  scroll-behavior: smooth;
}

body {
  min-height: 100%;
  overflow-x: hidden;
}

/* 登录/注册页面禁止滚动 */
body:has(.login-page),
body:has(.register-page) {
  overflow: hidden;
}

#app {
  font-family: 'LXGW WenKai', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 黑色主题 */
html.dark-theme {
  --bg-color: #1a1a2e;
  --text-color: #eee;
  --card-bg: #16213e;
  --card-shadow: rgba(0, 0, 0, 0.3);
}

html.dark-theme body {
  background-color: var(--bg-color);
  color: var(--text-color);
}

html.dark-theme #app {
  background-color: var(--bg-color);
  color: var(--text-color);
}

html.dark-theme .main-content {
  background-color: var(--bg-color);
}

html.dark-theme .content-container {
  background-color: var(--bg-color);
}

html.dark-theme .section-header h2 {
  color: var(--text-color);
}

html.dark-theme .article-card {
  background-color: var(--card-bg);
  box-shadow: 0 4px 15px var(--card-shadow);
}

html.dark-theme .article-info h3 {
  color: var(--text-color);
}

html.dark-theme .article-info p {
  color: #aaa;
}

html.dark-theme .article-meta .date {
  color: #888;
}

/* ========== 全局统一滚动条样式 ========== */
/* Webkit浏览器（Chrome, Safari, Edge）滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #ff9a9e 0%, #fecfef 50%, #a18cd1 100%);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #ff6b9d 0%, #c44569 100%);
}

/* Firefox 滚动条 */
* {
  scrollbar-width: thin;
  scrollbar-color: #fecfef transparent;
}

/* 暗黑主题滚动条 */
html.dark-theme ::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

html.dark-theme ::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #5a67d8 0%, #6b46c1 100%);
}

html.dark-theme * {
  scrollbar-color: #667eea transparent;
}

/* ========== 点击文字特效 ========== */
.click-text-effect {
  position: fixed;
  font-family: 'LXGW WenKai', 'Microsoft YaHei', serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  pointer-events: none;
  user-select: none;
  z-index: 99999;
  animation: clickTextFloat 1.5s ease-out forwards;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

@keyframes clickTextFloat {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  100% {
    opacity: 0;
    transform: translateY(-80px) scale(1.2);
  }
}

/* ========== 看板娘样式调整 ========== */
#waifu {
  position: fixed !important;
  left: 0 !important;
  bottom: 0 !important;
  z-index: 99998 !important;
}

/* 隐藏后的显示按钮 - 更明显 */
#waifu-toggle {
  position: fixed !important;
  left: 20px !important;
  bottom: 20px !important;
  z-index: 99999 !important;
  background: linear-gradient(135deg, #ff69b4, #ff8c94) !important;
  color: #fff !important;
  padding: 10px 15px !important;
  border-radius: 20px !important;
  font-size: 14px !important;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.4) !important;
  animation: togglePulse 2s ease-in-out infinite !important;
}

#waifu-toggle:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 6px 20px rgba(255, 105, 180, 0.6) !important;
}

@keyframes togglePulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

#waifu-tool {
  color: #ff69b4 !important;
}

#waifu-tool span:hover {
  color: #ff85c1 !important;
}

/* ========== 全局装饰输入框样式 ========== */
/* 输入框容器 - 带装饰图 */
.decorated-input-area {
  position: relative;
  margin-bottom: 15px;
}

.decorated-input-area::before {
  content: '';
  position: absolute;
  right: 10px;
  bottom: 5px;
  width: 100px;
  height: 100px;
  background-image: url('./assets/lm.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: right bottom;
  opacity: 0.7;
  pointer-events: none;
  z-index: 1;
  border-radius: 8px;
}

/* 装饰输入框样式 */
.decorated-textarea {
  width: 100%;
  padding: 15px;
  padding-right: 120px;
  border: 2px solid #ffe4b5;
  border-radius: 12px;
  font-size: 14px;
  resize: none;
  outline: none;
  font-family: inherit;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5f5 50%, #f0f8ff 100%);
  min-height: 100px;
  color: #333;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.decorated-textarea::placeholder {
  color: #999;
}

.decorated-textarea:focus {
  border-color: #ff9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.15);
  background: linear-gradient(135deg, #fffdf5 0%, #fff8f8 50%, #f5faff 100%);
}

/* 小尺寸装饰输入框（用于回复） */
.decorated-input-area.small::before {
  width: 70px;
  height: 70px;
  right: 8px;
  bottom: 3px;
}

.decorated-textarea.small {
  padding: 12px;
  padding-right: 90px;
  min-height: 80px;
  font-size: 13px;
  border-radius: 10px;
}

/* 暗黑主题适配 */
.dark-theme .decorated-textarea {
  background: linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%);
  border-color: #555;
  color: #eee;
}

.dark-theme .decorated-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.dark-theme .decorated-input-area::before {
  opacity: 0.5;
}

/* ========== 页面滚动进度条 ========== */
.scroll-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #5f27cd);
  background-size: 300% 100%;
  animation: progressGradient 3s linear infinite;
  z-index: 99999;
  transition: width 0.1s ease-out;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
}

@keyframes progressGradient {
  0% {
    background-position: 0% 50%;
  }

  100% {
    background-position: 300% 50%;
  }
}

/* ========== 毛玻璃卡片悬浮效果 ========== */
.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.glass-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.dark-theme .glass-card {
  background: rgba(30, 30, 50, 0.85);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dark-theme .glass-card:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

/* ========== 渐变边框动画输入框 ========== */
.gradient-border-input {
  position: relative;
  border-radius: 12px;
  padding: 2px;
  background: linear-gradient(135deg, #667eea, #764ba2, #ff6b6b, #feca57);
  background-size: 300% 300%;
  animation: gradientBorderIdle 8s ease infinite;
}

.gradient-border-input:focus-within {
  animation: gradientBorderActive 2s ease infinite;
}

.gradient-border-input input,
.gradient-border-input textarea {
  width: 100%;
  border: none;
  border-radius: 10px;
  outline: none;
  background: #fff;
}

.dark-theme .gradient-border-input input,
.dark-theme .gradient-border-input textarea {
  background: #1a1a2e;
  color: #eee;
}

@keyframes gradientBorderIdle {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

@keyframes gradientBorderActive {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* ========== 图片懒加载骨架屏 ========== */
.skeleton-image {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s infinite;
}

.dark-theme .skeleton-image {
  background: linear-gradient(90deg, #2a2a40 25%, #3a3a55 50%, #2a2a40 75%);
  background-size: 200% 100%;
}

@keyframes skeletonShimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* ========== 点击涟漪效果 ========== */
.ripple-effect {
  position: relative;
  overflow: hidden;
}

.ripple-effect::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, transparent 10.01%);
  background-repeat: no-repeat;
  background-position: 50%;
  transform: scale(10, 10);
  opacity: 0;
  transition: transform 0.5s, opacity 0.5s;
}

.ripple-effect:active::after {
  transform: scale(0, 0);
  opacity: 1;
  transition: 0s;
}
</style>
