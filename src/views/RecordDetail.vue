<template>
  <div class="record-detail-page">
    <!-- 导航栏 -->
    <NavBar />

    <!-- 全屏背景图 -->
    <div class="page-background">
      <img :src="bgImage" alt="背景图" class="bg-image" @error="handleBgError" />
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">⏳</div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">😢</div>
      <p>{{ error }}</p>
      <button class="back-btn" @click="goBack">返回列表</button>
    </div>

    <!-- 文章内容 -->
    <div v-else class="content-wrapper">
      <!-- 文章目录侧边栏 -->
      <aside class="toc-sidebar" :class="{ 'toc-visible': tocVisible }">
        <div class="toc-header">
          <span class="toc-icon">📑</span>
          <span class="toc-title">文章目录</span>
          <button class="toc-fab" @click="tocVisible = !tocVisible">
            {{ tocVisible ? '✕' : '☰' }}
          </button>
        </div>
        <nav class="toc-nav" v-show="tocVisible">
          <ul class="toc-list">
            <li v-for="(item, index) in tocList" :key="index" class="toc-item" :class="{
              'toc-active': activeHeading === item.id,
              [`toc-level-${item.level}`]: true
            }" @click="scrollToHeading(item.id)">
              <span class="toc-dot"></span>
              <span class="toc-text">{{ item.text }}</span>
            </li>
          </ul>
          <div v-if="tocList.length === 0" class="toc-empty">
            暂无目录
          </div>
        </nav>
        <!-- 阅读进度 -->
        <div class="reading-progress" v-show="tocVisible">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ height: readingProgress + '%' }"></div>
          </div>
          <span class="progress-text">{{ Math.round(readingProgress) }}%</span>
        </div>
      </aside>

      <article class="article-container">
        <!-- 文章头部 -->
        <header class="article-header">
          <div class="category-path">
            <span class="category-link" @click="goToCategory(record.category)">{{ record.parentCategoryName }}</span>
            <span class="separator">/</span>
            <span class="category-link" @click="goToSubCategory(record.category, record.subCategory)">{{
              record.categoryName }}</span>
          </div>
          <h1 class="article-title">{{ record.title }}</h1>
          <div class="article-meta">
            <span class="author">
              <i class="meta-icon">👤</i>
              {{ record.userName || '匿名用户' }}
            </span>
            <span class="date">
              <i class="meta-icon">📅</i>
              {{ record.date }}
            </span>
            <span class="views">
              <i class="meta-icon">👁️</i>
              {{ record.views }} 阅读
            </span>
            <span class="likes">
              <i class="meta-icon">❤️</i>
              {{ record.likes }} 点赞
            </span>
          </div>
          <!-- 标签 -->
          <div v-if="record.tags && record.tags.length" class="article-tags">
            <span v-for="tag in record.tags" :key="tag" class="tag" @click="goToTag(tag)">
              #{{ tag }}
            </span>
          </div>
          <!-- AI 总结按钮和展示区域 -->
          <div class="ai-summary-section">
            <button class="ai-summary-btn" @click="generateAiSummary" :disabled="aiLoading">
              <span class="btn-icon">🤖</span>
              <span class="btn-text">{{ aiLoading ? 'AI 总结中...' : 'AI总结' }}</span>
            </button>
            <div class="ai-summary-box" v-if="showAiSummary">
              <div class="ai-summary-header">
                <span class="ai-icon">🤖</span>
                <span class="ai-title">AI 智能总结</span>
                <button class="close-btn" @click="showAiSummary = false">×</button>
              </div>
              <div class="ai-summary-content">
                <p class="streaming-text">{{ aiSummary }}<span class="cursor" v-if="aiLoading">|</span></p>
              </div>
            </div>
          </div>
        </header>

        <!-- 封面图 -->
        <!-- <div v-if="record.cover" class="article-cover">
          <img :src="record.cover" :alt="record.title" />
        </div> -->

        <!-- 文章正文 -->
        <div class="article-content" v-html="formattedContent" @click="handleContentClick"></div>

        <!-- 文章底部 -->
        <footer class="article-footer">
          <div class="action-bar">
            <button class="action-btn like-btn" :class="{ liked: hasLiked }" @click="toggleLike">
              <span class="icon">{{ hasLiked ? '❤️' : '🤍' }}</span>
              <span class="text">{{ hasLiked ? '已点赞' : '点赞' }}</span>
              <span class="count">({{ record.likes }})</span>
            </button>
            <button class="action-btn back-btn" @click="goBack">
              <span class="icon">📚</span>
              <span class="text">返回列表</span>
            </button>
          </div>
        </footer>
      </article>
    </div>

    <!-- 页脚 -->
    <Footer minimal />

    <!-- 图片预览弹窗 -->
    <div class="image-preview-overlay" v-if="previewImage" @click="closePreview">
      <div class="preview-container">
        <img :src="previewImage" alt="预览图片" class="preview-image" @click.stop />
        <button class="close-preview-btn" @click="closePreview">×</button>
        <div class="preview-hint">点击空白处关闭</div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

import { http, getResourceUrl } from '@/utils/request'
import { getRandomBg, getFallbackBg } from '@/utils/randomBg'

// 配置 marked
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (e) {
        console.error(e)
      }
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

export default {
  name: 'RecordDetail',
  components: {
    NavBar,
    Footer
  },
  data() {
    return {
      record: {},
      loading: true,
      error: null,
      hasLiked: false,
      previewImage: null,
      // 目录相关
      tocList: [],
      tocVisible: true,
      activeHeading: null,
      readingProgress: 0,
      bgImage: '',
      // AI 总结相关
      aiSummary: '',
      aiLoading: false,
      showAiSummary: false
    }
  },
  computed: {
    formattedContent() {
      if (!this.record.content) return ''
      // 将相对路径的图片转换为完整 URL
      let content = this.record.content
      // 匹配 Markdown 图片语法 ![alt](/uploads/...)
      content = content.replace(/!\[([^\]]*)\]\((\/uploads\/[^)]+)\)/g, (_, alt, path) => {
        return `![${alt}](${getResourceUrl(path)})`
      })
      return marked(content)
    }
  },
  mounted() {
    this.bgImage = getRandomBg('record-detail')
    this.loadRecord()
    this.checkLiked()
    window.addEventListener('scroll', this.handleScroll, { passive: true })
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    async loadRecord() {
      this.loading = true
      this.error = null
      const id = this.$route.params.id

      try {
        const res = await http.get(`/api/record/${id}`)
        this.record = res.data
        this.$nextTick(() => {
          this.generateToc()
        })
      } catch (err) {
        console.error('加载记录失败:', err)
        this.error = err.message || '加载失败'
      } finally {
        this.loading = false
      }
    },
    async checkLiked() {
      const id = this.$route.params.id
      try {
        const res = await http.get(`/api/record/${id}/liked`)
        this.hasLiked = res.data
      } catch (err) {
        console.error('检查点赞状态失败:', err)
      }
    },
    async toggleLike() {
      const id = this.$route.params.id
      try {
        const res = await http.post(`/api/record/${id}/like`)
        this.hasLiked = res.data.liked
        this.record.likes = res.data.likes
      } catch (err) {
        console.error('点赞失败:', err)
      }
    },
    goBack() {
      this.$router.push('/record')
    },
    goToCategory(category) {
      this.$router.push({ path: '/record', query: { category } })
    },
    goToSubCategory(category, subCategory) {
      this.$router.push({ path: '/record', query: { category, subCategory } })
    },
    goToTag(tag) {
      this.$router.push({ path: '/record', query: { tag } })
    },
    // 处理内容区域点击（用于图片预览）
    handleContentClick(e) {
      if (e.target.tagName === 'IMG') {
        this.previewImage = e.target.src
      }
    },
    // 关闭图片预览
    closePreview() {
      this.previewImage = null
    },
    // 生成目录
    generateToc() {
      this.$nextTick(() => {
        const contentEl = document.querySelector('.article-content')
        if (!contentEl) return

        const headings = contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6')
        const tocItems = []

        headings.forEach((heading, index) => {
          // 为每个标题添加 id
          const id = `heading-${index}`
          heading.id = id

          tocItems.push({
            id,
            text: heading.textContent,
            level: parseInt(heading.tagName.charAt(1))
          })
        })

        this.tocList = tocItems
      })
    },
    // 滚动到指定标题
    scrollToHeading(id) {
      const element = document.getElementById(id)
      if (element) {
        const offset = 80 // 导航栏高度
        const top = element.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top, behavior: 'smooth' })
      }
    },
    // 处理滚动事件
    handleScroll() {
      // 更新阅读进度
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      this.readingProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0

      // 更新当前激活的标题
      const headings = document.querySelectorAll('.article-content h1, .article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6')
      let currentHeading = null

      headings.forEach(heading => {
        const rect = heading.getBoundingClientRect()
        if (rect.top <= 100) {
          currentHeading = heading.id
        }
      })

      this.activeHeading = currentHeading
    },
    handleBgError() {
      this.bgImage = getFallbackBg(this.bgImage, 'record-detail')
    },
    // AI 总结流式输出
    async generateAiSummary() {
      const id = this.$route.params.id
      this.aiSummary = ''
      this.showAiSummary = true
      this.aiLoading = true

      try {
        const baseUrl = process.env.VUE_APP_API_URL || 'http://localhost:9999'
        const response = await fetch(`${baseUrl}/api/ai/summary/${id}`)
        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const text = decoder.decode(value, { stream: true })
          this.aiSummary += text
        }
      } catch (error) {
        console.error('AI 总结生成失败:', error)
        this.aiSummary = '抱歉，AI 总结生成失败，请稍后重试。'
      } finally {
        this.aiLoading = false
      }
    }
  }
}
</script>

<style scoped>
.record-detail-page {
  min-height: 100vh;
  position: relative;
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

/* 加载状态 */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding-top: 80px;
}

.loading-spinner {
  font-size: 60px;
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

.error-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.loading-container p,
.error-container p {
  color: #fff;
  font-size: 18px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* ========== 文章目录侧边栏 ========== */
.toc-sidebar {
  position: fixed;
  right: 20px;
  top: 100px;
  width: 260px;
  max-height: calc(100vh - 140px);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 100;
  transition: all 0.3s ease;
  overflow: hidden;
}

.toc-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.toc-icon {
  font-size: 18px;
  margin-right: 8px;
}

.toc-title {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.toc-nav {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px 0;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.toc-item:hover {
  background: rgba(102, 126, 234, 0.1);
}

.toc-item.toc-active {
  background: rgba(102, 126, 234, 0.15);
}

.toc-item.toc-active .toc-dot {
  background: linear-gradient(135deg, #667eea, #764ba2);
  transform: scale(1.3);
  box-shadow: 0 0 8px rgba(102, 126, 234, 0.5);
}

.toc-item.toc-active .toc-text {
  color: #667eea;
  font-weight: 600;
}

.toc-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
  margin-right: 12px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.toc-text {
  font-size: 14px;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
}

/* 目录层级缩进 */
.toc-level-1 {
  padding-left: 20px;
}

.toc-level-2 {
  padding-left: 32px;
}

.toc-level-3 {
  padding-left: 44px;
}

.toc-level-4 {
  padding-left: 56px;
}

.toc-level-5 {
  padding-left: 68px;
}

.toc-level-6 {
  padding-left: 80px;
}

.toc-level-1 .toc-text {
  font-weight: 600;
}

.toc-level-2 .toc-text {
  font-weight: 500;
}

.toc-empty {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* 阅读进度 */
.reading-progress {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(0, 0, 0, 0.02);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
  margin-right: 12px;
}

.progress-fill {
  width: 100%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: height 0.1s ease;
}

.progress-text {
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
  min-width: 40px;
  text-align: right;
}

/* 目录切换按钮 */
.toc-fab {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.toc-fab:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* 暗黑主题 */
.dark-theme .toc-sidebar {
  background: rgba(30, 30, 50, 0.95);
}

.dark-theme .toc-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .toc-item:hover {
  background: rgba(102, 126, 234, 0.2);
}

.dark-theme .toc-text {
  color: #bbb;
}

.dark-theme .toc-item.toc-active .toc-text {
  color: #a78bfa;
}

.dark-theme .reading-progress {
  border-top-color: rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.dark-theme .progress-bar {
  background: #333;
}

/* 响应式 - 小屏幕调整侧边栏 */
@media (max-width: 1400px) {
  .toc-sidebar {
    width: 220px;
    right: 10px;
  }
}

@media (max-width: 1200px) {
  .toc-sidebar {
    width: 200px;
    right: 5px;
    top: 80px;
  }
}

@media (max-width: 1000px) {
  .toc-sidebar {
    display: none;
  }

  .toc-sidebar.toc-visible {
    display: block;
    position: fixed;
    right: 10px;
    top: 80px;
    width: 260px;
    max-height: 70vh;
  }
}

/* 内容区域 */
.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 100px 20px 40px;
}

.article-container {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* 文章头部 */
.article-header {
  padding: 40px 40px 30px;
  border-bottom: 1px solid #f0f0f0;
}

.category-path {
  margin-bottom: 15px;
  font-size: 14px;
}

.category-link {
  color: #ff6b9d;
  cursor: pointer;
  transition: color 0.3s;
}

.category-link:hover {
  color: #ff4785;
  text-decoration: underline;
}

.separator {
  margin: 0 8px;
  color: #ccc;
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  color: #888;
  font-size: 14px;
  margin-bottom: 15px;
}

.meta-icon {
  margin-right: 5px;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.article-tags .tag {
  background: linear-gradient(135deg, #ff6b9d, #c44569);
  color: #fff;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

/* AI 总结区域（顶部） */
.ai-summary-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #eee;
}

.ai-summary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.ai-summary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.ai-summary-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.btn-icon {
  font-size: 18px;
}

.article-tags .tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.4);
}

/* 封面图 */
.article-cover {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 文章正文 - Markdown 样式 */
.article-content {
  padding: 40px;
  font-size: 16px;
  line-height: 1.8;
  color: #444;
}

/* 段落 */
.article-content :deep(p) {
  margin-bottom: 1.2em;
}

/* 标题 */
.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4),
.article-content :deep(h5),
.article-content :deep(h6) {
  color: #333;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  line-height: 1.4;
}

.article-content :deep(h1) {
  font-size: 1.8em;
  border-bottom: 2px solid #ff6b9d;
  padding-bottom: 0.3em;
}

.article-content :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
}

.article-content :deep(h3) {
  font-size: 1.3em;
}

/* 强调 */
.article-content :deep(strong) {
  color: #333;
  font-weight: 600;
}

.article-content :deep(em) {
  color: #666;
  font-style: italic;
}

/* 链接 */
.article-content :deep(a) {
  color: #ff6b9d;
  text-decoration: none;
  border-bottom: 1px dashed #ff6b9d;
  transition: all 0.3s;
}

.article-content :deep(a:hover) {
  color: #c44569;
  border-bottom-style: solid;
}

/* 代码块 */
.article-content :deep(pre) {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  overflow-x: auto;
  margin: 1.5em 0;
  border: 1px solid #e9ecef;
}

.article-content :deep(pre code) {
  background: none;
  padding: 0;
  font-size: 14px;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  line-height: 1.6;
}

/* 行内代码 */
.article-content :deep(code) {
  background: linear-gradient(135deg, #fff0f5, #ffe4ec);
  color: #c44569;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
}

/* 引用 */
.article-content :deep(blockquote) {
  margin: 1.5em 0;
  padding: 15px 20px;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5f5 100%);
  border-left: 4px solid #ff6b9d;
  border-radius: 0 10px 10px 0;
  color: #666;
  font-style: italic;
}

.article-content :deep(blockquote p) {
  margin: 0;
}

/* 列表 */
.article-content :deep(ul),
.article-content :deep(ol) {
  margin: 1em 0;
  padding-left: 2em;
}

.article-content :deep(li) {
  margin: 0.5em 0;
}

.article-content :deep(ul li::marker) {
  color: #ff6b9d;
}

.article-content :deep(ol li::marker) {
  color: #ff6b9d;
  font-weight: 600;
}

/* 图片容器 */
.article-content :deep(img) {
  max-width: 50%;
  height: auto;
  border-radius: 12px;
  margin: 1.5em auto;
  display: block;
  cursor: zoom-in;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  /* 精美边框 */
  border: 2px solid transparent;
  background: linear-gradient(#fff, #fff) padding-box,
    linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #a18cd1 100%) border-box;
  /* 阴影效果 */
  box-shadow:
    0 6px 24px rgba(255, 107, 157, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.06);
}

.article-content :deep(img:hover) {
  transform: translateY(-5px) scale(1.02);
  box-shadow:
    0 20px 60px rgba(255, 107, 157, 0.3),
    0 8px 20px rgba(0, 0, 0, 0.12);
}

/* 图片标题样式 (如果有 alt 文字) */
.article-content :deep(p:has(img)) {
  text-align: center;
}

.article-content :deep(p > img + br + em),
.article-content :deep(p > img ~ em) {
  display: block;
  text-align: center;
  color: #888;
  font-size: 13px;
  margin-top: -1em;
  font-style: normal;
}

/* 表格 */
.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.article-content :deep(th),
.article-content :deep(td) {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.article-content :deep(th) {
  background: linear-gradient(135deg, #ff6b9d, #c44569);
  color: #fff;
  font-weight: 600;
}

.article-content :deep(tr:nth-child(even)) {
  background: #fafafa;
}

.article-content :deep(tr:hover) {
  background: #fff0f5;
}

/* 分割线 */
.article-content :deep(hr) {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ff6b9d, transparent);
  margin: 2em 0;
}

/* 任务列表 */
.article-content :deep(input[type="checkbox"]) {
  margin-right: 8px;
  accent-color: #ff6b9d;
}

/* 文章底部 */
.article-footer {
  padding: 30px 40px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.action-bar {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 30px;
  border: none;
  border-radius: 25px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.like-btn {
  background: linear-gradient(135deg, #ff6b9d, #c44569);
  color: #fff;
}

.like-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 157, 0.4);
}

.like-btn.liked {
  background: linear-gradient(135deg, #ff4785, #c44569);
}

.back-btn {
  background: #f5f5f5;
  color: #666;
}

.back-btn:hover {
  background: #eee;
  transform: translateY(-2px);
}

/* 响应式 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 80px 15px 30px;
  }

  .article-header,
  .article-content,
  .article-footer {
    padding: 25px 20px;
  }

  .article-title {
    font-size: 24px;
  }

  .article-meta {
    gap: 12px;
    font-size: 13px;
  }

  .action-bar {
    flex-direction: column;
  }

  .action-btn {
    justify-content: center;
  }
}

/* ========== 图片预览弹窗 ========== */
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
  cursor: zoom-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.preview-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-image {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: zoomIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: default;
}

@keyframes zoomIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.close-preview-btn {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.close-preview-btn:hover {
  background: rgba(255, 107, 157, 0.8);
  border-color: #ff6b9d;
  transform: rotate(90deg);
}

.preview-hint {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  margin-top: 20px;
  text-align: center;
}

/* 移动端预览适配 */
@media (max-width: 768px) {
  .close-preview-btn {
    top: 10px;
    right: 10px;
  }

  .preview-image {
    max-width: 95vw;
    border-radius: 8px;
  }
}

/* 响应式布局 - 手机 */
@media (max-width: 576px) {
  .content-wrapper {
    padding: 70px 10px 20px;
  }

  .article-card {
    border-radius: 12px;
  }

  .article-header,
  .article-content,
  .article-footer {
    padding: 15px;
  }

  .article-title {
    font-size: 20px;
    line-height: 1.4;
  }

  .article-meta {
    gap: 8px;
    font-size: 12px;
    flex-wrap: wrap;
  }

  .article-content {
    font-size: 15px;
    line-height: 1.8;
  }

  .article-content :deep(img) {
    max-width: 100%;
    margin: 1em auto;
  }

  .article-content :deep(pre) {
    padding: 12px;
    font-size: 12px;
    border-radius: 8px;
  }

  .article-content :deep(code) {
    font-size: 13px;
  }

  .article-content :deep(h1) {
    font-size: 22px;
  }

  .article-content :deep(h2) {
    font-size: 20px;
  }

  .article-content :deep(h3) {
    font-size: 18px;
  }

  .article-content :deep(blockquote) {
    padding: 10px 15px;
    margin: 15px 0;
  }

  .action-btn {
    padding: 10px 15px;
    font-size: 13px;
  }

  .action-btn svg {
    width: 18px;
    height: 18px;
  }

  .tag-list {
    gap: 6px;
  }

  .tag-item {
    padding: 4px 10px;
    font-size: 12px;
  }
}

/* 响应式布局 - 超小屏幕 */
@media (max-width: 375px) {
  .content-wrapper {
    padding: 65px 8px 15px;
  }

  .article-header,
  .article-content,
  .article-footer {
    padding: 12px;
  }

  .article-title {
    font-size: 18px;
  }

  .article-content {
    font-size: 14px;
  }
}

/* AI 总结按钮 */
.ai-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: #fff !important;
}

.ai-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.ai-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

/* AI 总结展示区域 */
.ai-summary-box {
  margin-top: 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 12px;
  overflow: hidden;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-summary-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.ai-icon {
  font-size: 20px;
  margin-right: 8px;
}

.ai-title {
  flex: 1;
  font-weight: 600;
  font-size: 15px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.ai-summary-content {
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
}

.streaming-text {
  font-size: 15px;
  line-height: 1.8;
  color: #444;
  margin: 0;
  white-space: pre-wrap;
}

.cursor {
  display: inline-block;
  animation: blink 0.8s infinite;
  color: #667eea;
  font-weight: bold;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}
</style>
