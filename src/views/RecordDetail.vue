<template>
  <div class="record-detail-page">
    <NavBar />

    <!-- 全屏背景图 -->
    <div class="page-background">
      <img src="../../image/wallhaven-7jp8qy.jpg" alt="背景图" class="bg-image" />
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
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

import API_BASE_URL from '@/config/api'

const API_BASE = API_BASE_URL

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
    NavBar
  },
  data() {
    return {
      record: {},
      loading: true,
      error: null,
      hasLiked: false,
      previewImage: null
    }
  },
  computed: {
    formattedContent() {
      if (!this.record.content) return ''
      return marked(this.record.content)
    }
  },
  mounted() {
    this.loadRecord()
    this.checkLiked()
  },
  methods: {
    async loadRecord() {
      this.loading = true
      this.error = null
      const id = this.$route.params.id

      try {
        const response = await fetch(`${API_BASE}/api/record/${id}`, {
          credentials: 'include'
        })
        const result = await response.json()

        if (result.code === 200) {
          this.record = result.data
        } else {
          this.error = result.message || '加载失败'
        }
      } catch (err) {
        console.error('加载记录失败:', err)
        this.error = '网络错误，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    async checkLiked() {
      const id = this.$route.params.id
      try {
        const response = await fetch(`${API_BASE}/api/record/${id}/liked`, {
          credentials: 'include'
        })
        const result = await response.json()
        if (result.code === 200) {
          this.hasLiked = result.data
        }
      } catch (err) {
        console.error('检查点赞状态失败:', err)
      }
    },
    async toggleLike() {
      const id = this.$route.params.id
      try {
        const response = await fetch(`${API_BASE}/api/record/${id}/like`, {
          method: 'POST',
          credentials: 'include'
        })
        const result = await response.json()
        if (result.code === 200) {
          this.hasLiked = result.data.liked
          this.record.likes = result.data.likes
        }
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
</style>
