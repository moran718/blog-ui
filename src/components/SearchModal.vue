<template>
  <div class="search-modal-overlay" v-if="visible" @click.self="close">
    <div class="search-modal">
      <!-- 搜索框 -->
      <div class="search-header">
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input ref="searchInput" v-model="keyword" type="text" placeholder="搜索文章、随笔、音乐..." @input="handleSearch"
            @keyup.enter="handleSearch" @keyup.esc="close" />
          <button class="close-btn" @click="close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <!-- 分类标签 -->
        <div class="search-tabs">
          <span v-for="tab in tabs" :key="tab.value" :class="['tab-item', { active: activeTab === tab.value }]"
            @click="switchTab(tab.value)">
            {{ tab.label }}
          </span>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div class="search-results" v-if="keyword">
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <span>搜索中...</span>
        </div>

        <div v-else-if="hasResults">
          <!-- 文章结果 -->
          <div class="result-section" v-if="results.records && results.records.length > 0">
            <div class="section-title">
              <span class="icon">📄</span>
              文章 ({{ results.records.length }})
            </div>
            <div class="result-item record-item" v-for="item in results.records" :key="'record-' + item.id"
              @click="goToRecord(item.id)">
              <div class="item-cover" v-if="item.cover">
                <img :src="getResourceUrl(item.cover)" :alt="item.title" />
              </div>
              <div class="item-info">
                <div class="item-title" v-html="highlight(item.title)"></div>
                <div class="item-desc" v-html="highlight(item.summary)"></div>
                <div class="item-meta">
                  <span>{{ item.date }}</span>
                  <span>👁 {{ item.views }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 随笔结果 -->
          <div class="result-section" v-if="results.essays && results.essays.length > 0">
            <div class="section-title">
              <span class="icon">✏️</span>
              随笔 ({{ results.essays.length }})
            </div>
            <div class="result-item essay-item" v-for="item in results.essays" :key="'essay-' + item.id"
              @click="goToEssay">
              <div class="user-avatar" v-if="item.userAvatar">
                <img :src="getResourceUrl(item.userAvatar)" :alt="item.userName" />
              </div>
              <div class="item-info">
                <div class="item-user">{{ item.userName }}</div>
                <div class="item-content" v-html="highlight(item.content)"></div>
                <div class="item-meta">{{ item.date }}</div>
              </div>
            </div>
          </div>

          <!-- 音乐结果 -->
          <div class="result-section" v-if="results.musics && results.musics.length > 0">
            <div class="section-title">
              <span class="icon">🎵</span>
              音乐 ({{ results.musics.length }})
            </div>
            <div class="result-item music-item" v-for="item in results.musics" :key="'music-' + item.id"
              @click="goToMusic">
              <div class="music-cover" v-if="item.cover">
                <img :src="getResourceUrl(item.cover)" :alt="item.name" />
              </div>
              <div class="item-info">
                <div class="item-title" v-html="highlight(item.name)"></div>
                <div class="item-desc">
                  <span v-html="highlight(item.artist)"></span>
                  <span v-if="item.album"> - {{ item.album }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-results">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
            <path d="M8 8l6 6M14 8l-6 6"></path>
          </svg>
          <p>未找到相关内容</p>
        </div>
      </div>

      <!-- 搜索提示 -->
      <div class="search-tips" v-else>
        <div class="tips-icon">🔍</div>
        <p>输入关键词搜索全站内容</p>
        <div class="hot-keywords" v-if="hotKeywords.length > 0">
          <span class="tips-label">热门搜索：</span>
          <span class="keyword-tag" v-for="kw in hotKeywords" :key="kw" @click="searchKeyword(kw)">
            {{ kw }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { http, getResourceUrl } from '@/utils/request'

export default {
  name: 'SearchModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      keyword: '',
      activeTab: 'all',
      loading: false,
      results: {
        records: [],
        essays: [],
        musics: []
      },
      tabs: [
        { label: '全部', value: 'all' },
        { label: '文章', value: 'record' },
        { label: '随笔', value: 'essay' },
        { label: '音乐', value: 'music' }
      ],
      hotKeywords: ['Vue', 'Spring Boot', 'JavaScript', 'MySQL'],
      searchTimer: null
    }
  },
  computed: {
    hasResults() {
      return (
        (this.results.records && this.results.records.length > 0) ||
        (this.results.essays && this.results.essays.length > 0) ||
        (this.results.musics && this.results.musics.length > 0)
      )
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.searchInput && this.$refs.searchInput.focus()
        })
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  methods: {
    getResourceUrl,
    close() {
      this.$emit('close')
      this.keyword = ''
      this.results = { records: [], essays: [], musics: [] }
    },
    switchTab(tab) {
      this.activeTab = tab
      if (this.keyword) {
        this.doSearch()
      }
    },
    handleSearch() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      this.searchTimer = setTimeout(() => {
        this.doSearch()
      }, 300)
    },
    async doSearch() {
      if (!this.keyword.trim()) {
        this.results = { records: [], essays: [], musics: [] }
        return
      }
      this.loading = true
      try {
        const res = await http.get('/api/search', {
          keyword: this.keyword,
          type: this.activeTab,
          limit: 5
        })
        this.results = res.data || { records: [], essays: [], musics: [] }
      } catch (error) {
        console.error('搜索失败:', error)
      } finally {
        this.loading = false
      }
    },
    searchKeyword(kw) {
      this.keyword = kw
      this.doSearch()
    },
    highlight(text) {
      if (!text || !this.keyword) return text
      const regex = new RegExp(`(${this.keyword})`, 'gi')
      return text.replace(regex, '<mark>$1</mark>')
    },
    goToRecord(id) {
      this.close()
      this.$router.push(`/record/${id}`)
    },
    goToEssay() {
      this.close()
      this.$router.push('/essay')
    },
    goToMusic() {
      this.close()
      this.$router.push('/music')
    }
  }
}
</script>

<style scoped>
.search-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  justify-content: center;
  padding-top: 10vh;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.search-modal {
  width: 90%;
  max-width: 650px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.search-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 12px;
  padding: 12px 16px;
  gap: 12px;
}

.search-icon {
  width: 22px;
  height: 22px;
  stroke: #999;
  flex-shrink: 0;
}

.search-input-wrapper input {
  flex: 1;
  border: none;
  background: none;
  font-size: 16px;
  outline: none;
  color: #333;
}

.search-input-wrapper input::placeholder {
  color: #999;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn svg {
  width: 20px;
  height: 20px;
  stroke: #999;
  transition: stroke 0.2s;
}

.close-btn:hover svg {
  stroke: #333;
}

.search-tabs {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.tab-item {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  background: #f0f0f0;
}

.tab-item:hover {
  background: #e0e0e0;
}

.tab-item.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #999;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.result-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.section-title .icon {
  font-size: 16px;
}

.result-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 8px;
}

.result-item:hover {
  background: #f5f5f5;
}

.item-cover,
.music-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.music-cover {
  border-radius: 50%;
}

.item-cover img,
.music-cover img,
.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-desc,
.item-content {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-user {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.item-meta {
  font-size: 12px;
  color: #999;
  margin-top: 6px;
  display: flex;
  gap: 12px;
}

.result-item :deep(mark) {
  background: #fff3cd;
  color: #e67e22;
  padding: 0 2px;
  border-radius: 2px;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 20px;
  color: #999;
}

.no-results svg {
  width: 64px;
  height: 64px;
  stroke: #ccc;
  margin-bottom: 16px;
}

.no-results p {
  font-size: 15px;
}

.search-tips {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 20px;
  color: #666;
}

.tips-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.search-tips p {
  font-size: 15px;
  margin-bottom: 20px;
}

.hot-keywords {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.tips-label {
  font-size: 13px;
  color: #999;
}

.keyword-tag {
  padding: 4px 12px;
  background: #f0f0f0;
  border-radius: 15px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.keyword-tag:hover {
  background: #667eea;
  color: #fff;
}
</style>

<style>
/* 暗黑主题 */
.dark-theme .search-modal {
  background: #1e1e2e;
}

.dark-theme .search-input-wrapper {
  background: rgba(255, 255, 255, 0.1);
}

.dark-theme .search-input-wrapper input {
  color: #eee;
}

.dark-theme .search-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .tab-item {
  background: rgba(255, 255, 255, 0.1);
  color: #aaa;
}

.dark-theme .tab-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

.dark-theme .section-title {
  color: #eee;
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .result-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.dark-theme .item-title,
.dark-theme .item-user {
  color: #eee;
}

.dark-theme .item-desc,
.dark-theme .item-content {
  color: #aaa;
}

.dark-theme .keyword-tag {
  background: rgba(255, 255, 255, 0.1);
  color: #aaa;
}
</style>
