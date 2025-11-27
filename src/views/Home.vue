<template>
  <div class="home">
    <!-- 首页背景图区域 -->
    <div class="hero-section" id="hero-section">
      <!-- 背景图片占位 -->
      <div class="hero-background">
        <img src="../../image/wallhaven-7jp8qy.jpg" alt="背景图" class="hero-image" />
      </div>
      <!-- 中间内容 -->
      <div class="hero-content">
        <h1 class="hero-title">看见</h1>
        <div class="hero-subtitle-box">
          <span class="typing-text">{{ displayText }}<span class="cursor">|</span></span>
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
      <div class="content-container">
        <div class="section-header" id="section-header">
          <span class="section-icon">📋</span>
          <h2>最新</h2>
          <a href="#" class="more-link">MORE ›</a>
        </div>
        <div class="article-list">
          <div class="article-card" v-for="article in articles" :key="article.id">
            <div class="article-image">
              <img :src="article.image" :alt="article.title" />
            </div>
            <div class="article-info">
              <h3>{{ article.title }}</h3>
              <p>{{ article.summary }}</p>
              <div class="article-meta">
                <span class="date">{{ article.date }}</span>
                <span class="views">👁 {{ article.views }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      fullText: '相信记录的力量！',
      displayText: '',
      currentIndex: 0,
      typingSpeed: 200,
      deleteSpeed: 100,
      isDeleting: false,
      articles: [
        { id: 1, title: 'Vue3 组合式 API 完全指南', summary: '深入了解 Vue3 的 Composition API，掌握 setup、ref、reactive 等核心概念...', image: 'https://picsum.photos/400/250?random=1', date: '2024-01-15', views: 1280 },
        { id: 2, title: 'Spring Boot 微服务架构实战', summary: '从零开始构建微服务架构，包含服务注册、配置中心、网关等核心组件...', image: 'https://picsum.photos/400/250?random=2', date: '2024-01-14', views: 956 },
        { id: 3, title: 'CSS Grid 布局详解', summary: '现代 CSS 布局方案，Grid 布局让复杂的页面布局变得简单高效...', image: 'https://picsum.photos/400/250?random=3', date: '2024-01-13', views: 823 },
        { id: 4, title: 'TypeScript 高级类型技巧', summary: '掌握 TypeScript 的泛型、条件类型、映射类型等高级特性...', image: 'https://picsum.photos/400/250?random=4', date: '2024-01-12', views: 1102 },
        { id: 5, title: 'MySQL 性能优化实践', summary: '数据库索引优化、SQL 调优、慢查询分析等实用技巧总结...', image: 'https://picsum.photos/400/250?random=5', date: '2024-01-11', views: 2045 },
        { id: 6, title: 'Docker 容器化部署指南', summary: '从 Docker 基础到 Docker Compose 多容器编排，一站式学习容器技术...', image: 'https://picsum.photos/400/250?random=6', date: '2024-01-10', views: 1567 },
        { id: 7, title: 'Redis 缓存策略与实战', summary: '缓存穿透、缓存击穿、缓存雪崩的解决方案，以及 Redis 集群搭建...', image: 'https://picsum.photos/400/250?random=7', date: '2024-01-09', views: 1890 },
        { id: 8, title: 'JavaScript 异步编程详解', summary: 'Promise、async/await、事件循环机制深度剖析...', image: 'https://picsum.photos/400/250?random=8', date: '2024-01-08', views: 1345 },
        { id: 9, title: 'Nginx 配置与负载均衡', summary: '反向代理、负载均衡、HTTPS 配置等 Nginx 核心功能详解...', image: 'https://picsum.photos/400/250?random=9', date: '2024-01-07', views: 987 }
      ]
    }
  },
  mounted() {
    this.startTyping()
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
    }
  }
}
</script>

<style scoped>
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
  margin-left: 2px;
  font-weight: 300;
  animation: blink 1s infinite;
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
  padding: 60px 20px;
  background-color: #fff;
  min-height: 100vh;
  z-index: 10;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
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
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.article-meta .views {
  color: #ff69b4;
}

/* 响应式 */
@media (max-width: 992px) {
  .article-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .article-list {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 48px;
  }
}
</style>
