<template>
  <div class="music-page" :class="{ 'dark-theme': isDarkTheme }">
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
          <span class="title-icon">🎵</span>
          <span>音乐空间</span>
        </div>
        <p class="welcome-subtitle">聆听旋律，感受生活</p>
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
      <div class="page-header" id="music-content-header">
        <div class="header-title">
          <span class="title-icon">🎵</span>
          <span>音乐空间</span>
        </div>
        <p class="header-subtitle">聆听旋律，感受生活</p>
      </div>

      <!-- 音乐内容区 -->
      <div class="music-container">
        <!-- 歌曲卡片网格 -->
        <div class="music-grid">
          <div class="music-card" v-for="(song, index) in songs" :key="song.id"
            :class="{ playing: currentIndex === index && isPlaying }" @click="handlePlaySong(index)">
            <div class="cover-wrapper">
              <img :src="song.cover" :alt="song.name" class="cover-img" />
              <!-- 播放状态遮罩 -->
              <div class="play-overlay" v-if="currentIndex === index && isPlaying">
                <div class="sound-wave">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
            <p class="music-name">{{ song.name }}</p>
          </div>
        </div>
      </div>

      <!-- 简约页脚 -->
      <Footer minimal />
    </div>
  </div>
</template>

<script>
import { getRandomBg, getFallbackBg } from '@/utils/randomBg'
import { hideLoading } from '@/utils/pageLoader'
import { playSong, playerState } from '@/utils/musicPlayer'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'MusicPage',
  components: {
    NavBar,
    Footer
  },
  data() {
    return {
      bgImage: '',
      isDarkTheme: false,
      showContent: false
    }
  },
  computed: {
    // 从全局状态获取歌曲列表
    songs() {
      return playerState.songs
    },
    // 从全局状态获取当前播放索引
    currentIndex() {
      return playerState.currentIndex
    },
    isPlaying() {
      return playerState.isPlaying
    }
  },
  mounted() {
    this.bgImage = getRandomBg('music')
    this.checkTheme()
    this.setupScrollListener()
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
  },
  methods: {
    checkTheme() {
      this.isDarkTheme = document.documentElement.classList.contains('dark-theme')
    },
    setupScrollListener() {
      window.addEventListener('wheel', this.handleWheel)
    },
    handleWheel(event) {
      // 向下滚动时显示内容
      if (!this.showContent && event.deltaY > 0) {
        this.scrollToContent()
      }
      // 在内容区域顶部向上滚动时返回背景图
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
      this.$nextTick(() => {
        // 触发 scroll 事件，让 NavBar 检测并显示
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
      this.bgImage = getFallbackBg(this.bgImage, 'music')
      hideLoading()
    },
    handlePlaySong(index) {
      // 使用全局播放器播放歌曲
      playSong(index)
    }
  }
}
</script>

<style scoped>
.music-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
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
  color: #667eea;
  stroke: #667eea;
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
  margin: 0;
}

/* 音乐内容区 */
.music-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 30px;
  flex: 1;
  box-sizing: border-box;
}

/* 音乐卡片网格 */
.music-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 30px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.music-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.cover-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.music-card:hover .cover-wrapper {
  animation: spin 3s linear infinite;
}

.music-card.playing .cover-wrapper {
  animation: spin 3s linear infinite;
  box-shadow: 0 0 25px rgba(102, 126, 234, 0.6);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sound-wave {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 30px;
}

.sound-wave span {
  width: 4px;
  background: #fff;
  border-radius: 2px;
  animation: wave 0.6s ease-in-out infinite;
}

.sound-wave span:nth-child(1) {
  height: 10px;
  animation-delay: 0s;
}

.sound-wave span:nth-child(2) {
  height: 20px;
  animation-delay: 0.1s;
}

.sound-wave span:nth-child(3) {
  height: 15px;
  animation-delay: 0.2s;
}

.sound-wave span:nth-child(4) {
  height: 25px;
  animation-delay: 0.3s;
}

@keyframes wave {

  0%,
  100% {
    transform: scaleY(1);
  }

  50% {
    transform: scaleY(0.5);
  }
}

.music-name {
  margin-top: 10px;
  font-size: 13px;
  color: #333;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

/* 响应式 - 平板 */
@media (max-width: 992px) {
  .music-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 25px;
  }
}

/* 响应式 - 手机 */
@media (max-width: 768px) {
  .welcome-title {
    font-size: 36px;
  }

  .welcome-title .title-icon {
    font-size: 40px;
  }

  .music-container {
    padding: 20px;
  }

  .music-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 20px;
    padding: 20px;
  }

  .cover-wrapper {
    width: 80px;
    height: 80px;
  }

  .music-name {
    font-size: 12px;
  }

  .page-header .header-title {
    font-size: 28px;
  }
}

/* 响应式 - 超小屏幕 */
@media (max-width: 375px) {
  .welcome-title {
    font-size: 28px;
  }

  .welcome-title .title-icon {
    font-size: 32px;
  }

  .music-container {
    padding: 15px;
  }

  .music-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 15px;
    padding: 15px;
  }

  .cover-wrapper {
    width: 65px;
    height: 65px;
  }

  .music-name {
    font-size: 11px;
  }

  .page-header .header-title {
    font-size: 22px;
  }
}
</style>

<style>
/* 暗黑主题 */
.dark-theme .music-page .music-grid {
  background: rgba(30, 30, 50, 0.85);
}

.dark-theme .music-page .music-name {
  color: #ddd;
  text-shadow: none;
}

.dark-theme .music-page .cover-wrapper {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}
</style>
