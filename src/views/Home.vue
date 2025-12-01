<template>
  <div class="home">
    <!-- 导航栏 -->
    <NavBar />

    <!-- 首页背景图区域 -->
    <div class="hero-section" id="hero-section">
      <!-- 背景图片占位 -->
      <div class="hero-background">
        <img :src="bgImage" alt="背景图" class="hero-image" @load="handleBgLoad" @error="handleBgError" />
      </div>
      <!-- 中间内容 -->
      <div class="hero-content">
        <h1 class="hero-title">拾 光</h1>
        <div class="hero-subtitle-box">
          <span class="typing-text">{{ displayText }}<span class="cursor"></span></span>
        </div>
      </div>
      <!-- 向下滚动按钮 -->
      <div class="scroll-down-btn" @click="scrollToContent">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </div>
      <!-- 动态海浪分割线 -->
      <div class="wave-container">
        <svg class="wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path class="wave-path wave-1" fill="#ffffff" fill-opacity="0.3"
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
          </path>
          <path class="wave-path wave-2" fill="#ffffff" fill-opacity="0.5"
            d="M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,208C672,235,768,277,864,277.3C960,277,1056,235,1152,208C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
          </path>
          <path class="wave-path wave-3" fill="#ffffff"
            d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,234.7C672,256,768,288,864,282.7C960,277,1056,235,1152,213.3C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
          </path>
        </svg>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content" ref="mainContent">
      <div class="content-wrapper">
        <!-- 左侧边栏 -->
        <aside class="sidebar">
          <UserCard />
          <CheckInCard />
          <HotArticles :articles="hotArticles" />
        </aside>

        <!-- 右侧文章列表 -->
        <div class="content-container">
          <div class="section-header" id="section-header">
            <span class="section-icon">📋</span>
            <h2>最新</h2>
            <router-link to="/record" class="more-link">MORE ›</router-link>
          </div>
          <div class="article-list">
            <div class="article-card" v-for="article in articles" :key="article.id" @click="goToArticle(article.id)">
              <div class="article-image">
                <img :src="article.image" :alt="article.title" />
              </div>
              <div class="article-info">
                <h3>{{ article.title }}</h3>
                <p>{{ article.summary }}</p>
                <div class="article-meta">
                  <span class="date">{{ article.date }}</span>
                  <span class="views">👁 {{ article.views }}</span>
                  <LikeButton :count="article.likes || 0" :liked="article.isLiked || false"
                    @like.stop="handleLike(article, $event)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script>
import { getRandomBg, getFallbackBg } from '@/utils/randomBg'
import { hideLoading } from '@/utils/pageLoader'
import { http, getResourceUrl } from '@/utils/request'
import NavBar from '@/components/NavBar.vue'
import LikeButton from '@/components/LikeButton.vue'
import HotArticles from '@/components/HotArticles.vue'
import UserCard from '@/components/UserCard.vue'
import CheckInCard from '@/components/CheckInCard.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'HomePage',
  components: {
    NavBar,
    LikeButton,
    HotArticles,
    UserCard,
    CheckInCard,
    Footer
  },
  data() {
    return {
      fullText: '时光不语，却回答了所有问题！',
      displayText: '',
      currentIndex: 0,
      typingSpeed: 200,
      deleteSpeed: 100,
      isDeleting: false,
      bgImage: '',
      articles: [],
      hotArticles: []
    }
  },
  mounted() {
    this.bgImage = getRandomBg('home')
    this.startTyping()
    this.loadArticles()
    // 设置超时保护，防止图片加载失败导致加载动画一直显示
    this.loadingTimeout = setTimeout(() => {
      hideLoading()
    }, 8000)
  },
  beforeDestroy() {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout)
    }
  },
  methods: {
    scrollToContent() {
      this.$refs.mainContent.scrollIntoView({ behavior: 'smooth' })
    },
    startTyping() {
      if (!this.isDeleting) {
        if (this.currentIndex < this.fullText.length) {
          this.displayText += this.fullText[this.currentIndex]
          this.currentIndex++
          setTimeout(this.startTyping, this.typingSpeed)
        } else {
          setTimeout(() => {
            this.isDeleting = true
            this.startTyping()
          }, 2000)
        }
      } else {
        if (this.displayText.length > 0) {
          this.displayText = this.displayText.slice(0, -1)
          setTimeout(this.startTyping, this.deleteSpeed)
        } else {
          this.isDeleting = false
          this.currentIndex = 0
          setTimeout(this.startTyping, 1000)
        }
      }
    },
    handleBgLoad() {
      // 清除超时
      if (this.loadingTimeout) {
        clearTimeout(this.loadingTimeout)
      }
      // 背景图加载完成，隐藏加载动画
      hideLoading()
    },
    handleBgError() {
      // 清除超时
      if (this.loadingTimeout) {
        clearTimeout(this.loadingTimeout)
      }
      this.bgImage = getFallbackBg(this.bgImage, 'home')
      // 即使加载失败也隐藏加载动画
      hideLoading()
    },
    handleLike(article, { liked, count }) {
      article.isLiked = liked
      article.likes = count
      // 这里可以调用 API 保存点赞状态
      console.log(`文章 ${article.id} 点赞状态: ${liked}, 数量: ${count}`)
    },
    goToArticle(id) {
      this.$router.push(`/record/${id}`)
    },
    async loadArticles() {
      try {
        // 并行请求最新文章和热门文章
        const [latestRes, hotRes] = await Promise.all([
          http.get('/api/record/latest', { params: { limit: 9 } }),
          http.get('/api/record/hot', { params: { limit: 5 } })
        ])
        if (latestRes.data) {
          this.articles = latestRes.data.map(article => ({
            id: article.id,
            title: article.title,
            summary: article.summary,
            image: getResourceUrl(article.cover),
            date: article.date,
            views: article.views,
            likes: article.likes,
            isLiked: false
          }))
        }
        if (hotRes.data) {
          this.hotArticles = hotRes.data.map(article => ({
            id: article.id,
            title: article.title,
            views: article.views,
            likes: article.likes,
            cover: getResourceUrl(article.cover)
          }))
        }
      } catch (error) {
        console.error('加载文章失败:', error)
      }
    }
  }
}
</script>

<style scoped>
/* 首页容器 - 使用 flex 布局确保页脚贴底 */
.home {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 首页背景区域 */
.hero-section {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #fff;
  text-align: center;
}

.hero-title {
  font-size: 72px;
  font-weight: 700;
  margin-bottom: 30px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
}

.hero-subtitle-box {
  background-color: rgba(50, 50, 50, 0.7);
  padding: 12px 40px;
  border-radius: 25px;
  font-size: 18px;
  letter-spacing: 2px;
  min-width: 280px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.typing-text {
  display: inline-flex;
  align-items: center;
}

.cursor {
  display: inline-block;
  margin-left: 4px;
  width: 3px;
  height: 1.2em;
  background: linear-gradient(180deg, #ff6b6b, #feca57, #48dbfb);
  background-size: 100% 300%;
  animation: blink 0.8s step-end infinite, cursorGradient 2s ease infinite;
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(255, 107, 107, 0.6);
}

@keyframes blink {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}

@keyframes cursorGradient {

  0%,
  100% {
    background-position: 0% 0%;
  }

  50% {
    background-position: 0% 100%;
  }
}

/* 向下滚动按钮 */
.scroll-down-btn {
  position: absolute;
  bottom: 150px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
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

/* 海浪动画 */
.wave-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150px;
  z-index: 15;
  overflow: hidden;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
}

.wave-path {
  transform-origin: center bottom;
}

.wave-1 {
  animation: wave-animation 8s linear infinite;
}

.wave-2 {
  animation: wave-animation 6s linear infinite reverse;
}

.wave-3 {
  animation: wave-animation 4s linear infinite;
}

@keyframes wave-animation {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

/* 主要内容区域 */
.main-content {
  position: relative;
  padding: 60px 20px 20px;
  background-color: #fff;
  z-index: 10;
  flex: 1;
}

.content-wrapper {
  display: flex;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.content-container {
  flex: 1;
  min-width: 0;
}

.sidebar {
  width: 320px;
  flex-shrink: 0;
}

@media (max-width: 1100px) {
  .content-wrapper {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.section-icon {
  font-size: 24px;
  margin-right: 10px;
}

.section-header h2 {
  font-size: 24px;
  color: #333;
  flex: 1;
}

.more-link {
  color: #f39c12;
  text-decoration: none;
  font-weight: 500;
}

.more-link:hover {
  text-decoration: underline;
}

/* 文章列表 */
.article-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
}

.article-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.article-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

.article-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-card:hover .article-image img {
  transform: scale(1.05);
}

.article-info {
  padding: 20px;
}

.article-info h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

.article-info p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 12px;
  color: #999;
}

.article-meta .views {
  color: #ff69b4;
}

.article-meta .like-button-wrapper {
  margin-left: auto;
}

.article-meta .like-button-wrapper :deep(.like-btn) {
  padding: 4px 10px;
  font-size: 12px;
}

.article-meta .like-button-wrapper :deep(.heart-icon) {
  width: 14px;
  height: 14px;
}

.article-meta .like-button-wrapper :deep(.like-count) {
  font-size: 12px;
}

/* 响应式 - 平板 */
@media (max-width: 992px) {
  .article-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .hero-title {
    font-size: 56px;
  }

  .hero-subtitle {
    font-size: 18px;
  }

  .section-header h2 {
    font-size: 20px;
  }
}

/* 响应式 - 手机 */
@media (max-width: 576px) {
  .article-list {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-subtitle {
    font-size: 14px;
    padding: 0 20px;
  }

  .content-wrapper {
    padding: 20px 15px;
  }

  .section-header {
    margin-bottom: 20px;
    padding-bottom: 10px;
  }

  .section-header h2 {
    font-size: 18px;
  }

  .section-icon {
    font-size: 20px;
  }

  .article-image {
    height: 160px;
  }

  .article-info {
    padding: 15px;
  }

  .article-info h3 {
    font-size: 16px;
  }

  .article-info p {
    font-size: 13px;
    margin-bottom: 10px;
  }

  .article-meta {
    gap: 10px;
    font-size: 11px;
  }

  .sidebar {
    padding: 15px;
  }
}

/* 响应式 - 超小屏幕 */
@media (max-width: 375px) {
  .hero-title {
    font-size: 28px;
  }

  .hero-subtitle {
    font-size: 12px;
  }

  .content-wrapper {
    padding: 15px 10px;
  }
}
</style>
