<template>
  <div class="record-page">
    <!-- 全屏背景图 -->
    <div class="page-background">
      <img src="../../image/wallhaven-7jp8qy.jpg" alt="背景图" class="bg-image" />
    </div>

    <!-- 导航栏 -->
    <NavBar />

    <!-- 全屏欢迎区域 -->
    <div class="welcome-section" v-show="!showContent">
      <div class="welcome-content">
        <div class="welcome-title">
          <span class="title-icon">📅</span>
          <span>记录时光</span>
        </div>
        <p class="welcome-subtitle">记录每一个值得铭记的瞬间</p>
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
      <div class="page-header" id="record-content-header">
        <div class="header-title">
          <span class="title-icon">📅</span>
          <span>记录时光</span>
        </div>
        <p class="header-subtitle">记录每一个值得铭记的瞬间</p>
      </div>

      <!-- 主内容区 -->
      <div class="record-container">
        <!-- 左侧分类栏 -->
        <aside class="category-sidebar">
          <div class="sidebar-header">
            <span class="header-icon">📂</span>
            <span>分类目录</span>
          </div>
          <div class="category-list">
            <div v-for="category in categories" :key="category.key" class="category-item"
              :class="{ active: selectedCategory === category.key }" @click="selectCategory(category.key)">
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-count">{{ getCategoryCount(category.key) }}</span>
            </div>
          </div>

          <!-- 二级分类 -->
          <div v-if="subCategories.length > 0" class="sub-category-section">
            <div class="sidebar-header sub">
              <span class="header-icon">🏷️</span>
              <span>子分类</span>
            </div>
            <div class="sub-category-list">
              <div v-for="sub in subCategories" :key="sub.key" class="sub-category-tag"
                :class="{ active: selectedSubCategory === sub.key }" @click="selectSubCategory(sub.key)">
                {{ sub.name }}
              </div>
            </div>
          </div>

          <!-- 标签云 -->
          <div class="tag-cloud-section">
            <div class="sidebar-header">
              <span class="header-icon">🔖</span>
              <span>热门标签</span>
            </div>
            <div class="tag-cloud">
              <span v-for="tag in hotTags" :key="tag" class="tag-item" :class="{ active: selectedTag === tag }"
                @click="selectTag(tag)">
                # {{ tag }}
              </span>
            </div>
          </div>
        </aside>

        <!-- 右侧内容区 -->
        <main class="record-main">
          <!-- 内容头部 -->
          <div class="main-header">
            <div class="header-title">
              <span class="title-icon">{{ currentCategoryIcon }}</span>
              <h2>{{ currentCategoryName }}</h2>
              <span class="record-count">共 {{ totalRecords }} 篇</span>
            </div>
            <div class="header-actions">
              <div class="view-mode">
                <button class="mode-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
                <button class="mode-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
              </div>
              <select v-model="sortBy" class="sort-select">
                <option value="newest">最新发布</option>
                <option value="oldest">最早发布</option>
                <option value="views">最多浏览</option>
                <option value="likes">最多点赞</option>
              </select>
            </div>
          </div>

          <!-- 记录列表 -->
          <div class="record-list" :class="viewMode">
            <div v-for="record in records" :key="record.id" class="record-card" @click="viewRecord(record)">
              <!-- 封面图 -->
              <div v-if="record.cover" class="record-cover">
                <img :src="record.cover" :alt="record.title" />
                <div class="cover-overlay">
                  <span class="category-badge">{{ record.categoryName }}</span>
                </div>
              </div>
              <!-- 内容 -->
              <div class="record-content">
                <h3 class="record-title">{{ record.title }}</h3>
                <p class="record-summary">{{ record.summary }}</p>
                <div class="record-meta">
                  <span class="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {{ record.date }}
                  </span>
                  <span class="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    {{ record.views }}
                  </span>
                  <span class="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
                      </path>
                    </svg>
                    {{ record.likes }}
                  </span>
                </div>
                <div class="record-tags">
                  <span v-for="tag in record.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="!loading && records.length === 0" class="empty-state">
            <span class="empty-icon">📭</span>
            <p>暂无相关记录</p>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <span class="loading-icon">⏳</span>
            <p>加载中...</p>
          </div>

          <!-- 分页 -->
          <AppPagination v-if="totalPages > 1" :current-page="currentPage" :total-pages="totalPages"
            :has-next="currentPage < totalPages" :has-prev="currentPage > 1" @page-change="changePage" />
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import AppPagination from '@/components/Pagination.vue'

import API_BASE_URL from '@/config/api'

const API_BASE = API_BASE_URL

export default {
  name: 'RecordPage',
  components: {
    NavBar,
    AppPagination
  },
  data() {
    return {
      showContent: false,
      selectedCategory: 'all',
      selectedSubCategory: null,
      selectedTag: null,
      viewMode: 'list',
      sortBy: 'newest',
      currentPage: 1,
      pageSize: 6,
      totalRecords: 0,
      loading: false,
      categories: [],
      subCategoryMap: {},
      hotTags: [],
      records: []
    }
  },
  computed: {
    subCategories() {
      if (this.selectedCategory === 'all') return []
      return this.subCategoryMap[this.selectedCategory] || []
    },
    currentCategoryIcon() {
      const category = this.categories.find(c => c.key === this.selectedCategory)
      return category ? category.icon : '📚'
    },
    currentCategoryName() {
      if (this.selectedSubCategory) {
        const sub = this.subCategories.find(s => s.key === this.selectedSubCategory)
        return sub ? sub.name : ''
      }
      const category = this.categories.find(c => c.key === this.selectedCategory)
      return category ? category.name : '全部'
    },
    totalPages() {
      return Math.ceil(this.totalRecords / this.pageSize)
    }
  },
  mounted() {
    this.setupScrollListener()
    this.loadInitialData()
  },
  beforeDestroy() {
    window.removeEventListener('wheel', this.handleWheel)
  },
  watch: {
    '$route.query.category': {
      immediate: true,
      handler(category) {
        if (category && this.categories.some(c => c.key === category)) {
          this.selectedCategory = category
        } else {
          this.selectedCategory = 'all'
        }
        this.selectedSubCategory = null
        this.selectedTag = null
        this.currentPage = 1
        this.loadRecords()
      }
    },
    sortBy() {
      this.currentPage = 1
      this.loadRecords()
    }
  },
  methods: {
    // 初始化加载数据
    async loadInitialData() {
      await Promise.all([
        this.loadCategories(),
        this.loadSubCategories(),
        this.loadHotTags(),
        this.loadRecords()
      ])
    },
    // 加载分类
    async loadCategories() {
      try {
        const response = await fetch(`${API_BASE}/api/record/categories`, {
          credentials: 'include'
        })
        const result = await response.json()
        if (result.code === 200) {
          this.categories = result.data
        }
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    },
    // 加载子分类
    async loadSubCategories() {
      try {
        const response = await fetch(`${API_BASE}/api/record/subcategories`, {
          credentials: 'include'
        })
        const result = await response.json()
        if (result.code === 200) {
          this.subCategoryMap = result.data
        }
      } catch (error) {
        console.error('加载子分类失败:', error)
      }
    },
    // 加载热门标签
    async loadHotTags() {
      try {
        const response = await fetch(`${API_BASE}/api/record/hot-tags?limit=10`, {
          credentials: 'include'
        })
        const result = await response.json()
        if (result.code === 200) {
          this.hotTags = result.data
        }
      } catch (error) {
        console.error('加载热门标签失败:', error)
      }
    },
    // 加载记录列表
    async loadRecords() {
      this.loading = true
      try {
        const params = new URLSearchParams()
        params.append('page', this.currentPage)
        params.append('pageSize', this.pageSize)
        params.append('sortBy', this.sortBy)
        if (this.selectedCategory && this.selectedCategory !== 'all') {
          params.append('category', this.selectedCategory)
        }
        if (this.selectedSubCategory) {
          params.append('subCategory', this.selectedSubCategory)
        }
        if (this.selectedTag) {
          params.append('tag', this.selectedTag)
        }
        const response = await fetch(`${API_BASE}/api/record/list?${params.toString()}`, {
          credentials: 'include'
        })
        const result = await response.json()
        if (result.code === 200) {
          this.records = result.data.list
          this.totalRecords = result.data.total
        }
      } catch (error) {
        console.error('加载记录失败:', error)
      } finally {
        this.loading = false
      }
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
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      })
    },
    scrollToWelcome() {
      this.showContent = false
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
      this.$nextTick(() => {
        window.dispatchEvent(new Event('scroll'))
      })
    },
    getCategoryCount(categoryKey) {
      const category = this.categories.find(c => c.key === categoryKey)
      return category ? category.count : 0
    },
    selectCategory(categoryKey) {
      this.selectedCategory = categoryKey
      this.selectedSubCategory = null
      this.selectedTag = null
      this.currentPage = 1
      this.loadRecords()
      // 更新 URL
      if (categoryKey === 'all') {
        this.$router.push('/record').catch(() => { })
      } else {
        this.$router.push(`/record?category=${categoryKey}`).catch(() => { })
      }
    },
    selectSubCategory(subKey) {
      this.selectedSubCategory = this.selectedSubCategory === subKey ? null : subKey
      this.currentPage = 1
      this.loadRecords()
    },
    selectTag(tag) {
      this.selectedTag = this.selectedTag === tag ? null : tag
      this.currentPage = 1
      this.loadRecords()
    },
    changePage(page) {
      this.currentPage = page
      this.loadRecords()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    viewRecord(record) {
      this.$router.push(`/record/${record.id}`)
    }
  }
}
</script>

<style scoped>
.record-page {
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

.record-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
  display: flex;
  gap: 30px;
}

/* 左侧分类栏 */
.category-sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 30px;
  height: fit-content;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px 16px 0 0;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid rgba(238, 238, 238, 0.5);
}

.sidebar-header.sub {
  border-radius: 0;
  margin-top: 20px;
  border-radius: 16px 16px 0 0;
}

.header-icon {
  font-size: 20px;
}

.category-list {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 0 0 16px 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.category-item {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.category-item:hover {
  background: #f8f9fa;
}

.category-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-left-color: #667eea;
}

.category-icon {
  font-size: 18px;
  margin-right: 10px;
}

.category-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.category-item.active .category-name {
  color: #667eea;
  font-weight: 500;
}

.category-count {
  background: #eee;
  color: #666;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.category-item.active .category-count {
  background: #667eea;
  color: #fff;
}

/* 二级分类 */
.sub-category-section {
  margin-top: 20px;
}

.sub-category-list {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 0 0 16px 16px;
  padding: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.sub-category-tag {
  padding: 6px 14px;
  background: #f0f2f5;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sub-category-tag:hover {
  background: #e8e8e8;
}

.sub-category-tag.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

/* 标签云 */
.tag-cloud-section {
  margin-top: 20px;
}

.tag-cloud {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 0 0 16px 16px;
  padding: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.tag-item {
  padding: 4px 10px;
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-item:hover {
  border-color: #667eea;
  color: #667eea;
}

.tag-item.active {
  background: #667eea;
  border-color: #667eea;
  color: #fff;
}

/* 右侧内容区 */
.record-main {
  flex: 1;
  min-width: 0;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  padding: 20px 25px;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.main-header .header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.main-header .title-icon {
  font-size: 24px;
}

.main-header .header-title h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.record-count {
  font-size: 14px;
  color: #999;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.view-mode {
  display: flex;
  gap: 5px;
}

.mode-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f0f2f5;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.mode-btn svg {
  width: 18px;
  height: 18px;
  stroke: #666;
}

.mode-btn:hover {
  background: #e8e8e8;
}

.mode-btn.active {
  background: #667eea;
}

.mode-btn.active svg {
  stroke: #fff;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  background: #fff;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.sort-select:hover,
.sort-select:focus {
  border-color: #667eea;
}

/* 记录列表 - 列表模式 */
.record-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.record-list.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.record-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
}

.record-list.list .record-card {
  display: flex;
}

.record-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.record-cover {
  position: relative;
  overflow: hidden;
}

.record-list.list .record-cover {
  width: 280px;
  height: 180px;
  flex-shrink: 0;
}

.record-list.grid .record-cover {
  height: 180px;
}

.record-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.record-card:hover .record-cover img {
  transform: scale(1.1);
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.5));
  display: flex;
  align-items: flex-end;
  padding: 15px;
}

.category-badge {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.record-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.record-title {
  margin: 0 0 10px;
  font-size: 18px;
  color: #333;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.record-summary {
  margin: 0 0 15px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.record-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #999;
}

.meta-item svg {
  width: 14px;
  height: 14px;
}

.record-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.record-tags .tag {
  background: #f0f2f5;
  color: #666;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 60px;
  display: block;
  margin-bottom: 20px;
}

.empty-state p {
  color: #999;
  font-size: 16px;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.loading-icon {
  font-size: 60px;
  display: block;
  margin-bottom: 20px;
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

.loading-state p {
  color: #999;
  font-size: 16px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .record-list.grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .record-container {
    flex-direction: column;
  }

  .category-sidebar {
    width: 100%;
    position: relative;
    top: 0;
  }

  .record-list.list .record-card {
    flex-direction: column;
  }

  .record-list.list .record-cover {
    width: 100%;
    height: 200px;
  }
}
</style>
