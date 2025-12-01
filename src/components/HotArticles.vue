<template>
  <div class="hot-articles">
    <div class="hot-header">
      <span class="hot-icon">🔥</span>
      <h3>热门文章</h3>
    </div>
    <div class="hot-list">
      <div class="hot-item" v-for="(article, index) in topArticles" :key="article.id" @click="goToArticle(article.id)">
        <div class="hot-rank" :class="getRankClass(index)">
          {{ index + 1 }}
        </div>
        <div class="hot-content">
          <h4 class="hot-title">{{ article.title }}</h4>
          <div class="hot-meta">
            <span class="hot-views">
              <svg viewBox="0 0 24 24">
                <path
                  d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
              {{ formatViews(article.views) }}
            </span>
            <span class="hot-likes">
              <svg viewBox="0 0 24 24">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {{ formatViews(article.likes) }}
            </span>
          </div>
        </div>
        <div class="hot-cover" v-if="article.cover">
          <img :src="article.cover" :alt="article.title" />
        </div>
      </div>
    </div>

    <!-- 更多文章链接 -->
    <div class="hot-more" @click="goToRecords">
      查看更多 →
    </div>
  </div>
</template>

<script>
export default {
  name: 'HotArticles',
  props: {
    articles: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    topArticles() {
      // 后端已按浏览量排序，直接返回
      return this.articles.slice(0, 5)
    }
  },
  methods: {
    getRankClass(index) {
      if (index === 0) return 'rank-gold'
      if (index === 1) return 'rank-silver'
      if (index === 2) return 'rank-bronze'
      return ''
    },
    formatViews(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
      }
      return num
    },
    goToArticle(id) {
      this.$router.push(`/record/${id}`)
    },
    goToRecords() {
      this.$router.push('/record')
    }
  }
}
</script>

<style scoped>
.hot-articles {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.hot-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.hot-icon {
  font-size: 22px;
  animation: flame 0.5s ease-in-out infinite alternate;
}

@keyframes flame {
  from {
    transform: scale(1) rotate(-5deg);
  }

  to {
    transform: scale(1.1) rotate(5deg);
  }
}

.hot-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hot-item:hover {
  background: rgba(102, 126, 234, 0.08);
  transform: translateX(5px);
}

.hot-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #999;
  background: #f5f5f5;
  flex-shrink: 0;
}

.hot-rank.rank-gold {
  background: linear-gradient(135deg, #ffd700, #ffb700);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 183, 0, 0.4);
}

.hot-rank.rank-silver {
  background: linear-gradient(135deg, #c0c0c0, #a8a8a8);
  color: #fff;
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
}

.hot-rank.rank-bronze {
  background: linear-gradient(135deg, #cd7f32, #b87333);
  color: #fff;
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.4);
}

.hot-content {
  flex: 1;
  min-width: 0;
}

.hot-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
}

.hot-item:hover .hot-title {
  color: #667eea;
}

.hot-meta {
  display: flex;
  gap: 12px;
}

.hot-views,
.hot-likes {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.hot-views svg,
.hot-likes svg {
  width: 14px;
  height: 14px;
  fill: #bbb;
}

.hot-likes svg {
  fill: #ff6b6b;
}

.hot-cover {
  width: 60px;
  height: 45px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.hot-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.hot-item:hover .hot-cover img {
  transform: scale(1.1);
}

.hot-more {
  text-align: center;
  padding: 12px;
  margin-top: 12px;
  color: #667eea;
  font-size: 13px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
}

.hot-more:hover {
  background: rgba(102, 126, 234, 0.1);
}
</style>

<style>
/* 暗黑主题 - 非 scoped */
.dark-theme .hot-articles {
  background: rgba(30, 30, 50, 0.9);
  border-color: rgba(100, 100, 120, 0.3);
}

.dark-theme .hot-header {
  border-bottom-color: rgba(100, 100, 120, 0.3);
}

.dark-theme .hot-header h3 {
  color: #eee;
}

.dark-theme .hot-item:hover {
  background: rgba(102, 126, 234, 0.15);
}

.dark-theme .hot-rank {
  background: rgba(60, 60, 80, 0.8);
  color: #888;
}

.dark-theme .hot-title {
  color: #ddd;
}

.dark-theme .hot-views,
.dark-theme .hot-likes {
  color: #888;
}

.dark-theme .hot-views svg {
  fill: #888;
}

.dark-theme .hot-more {
  color: #a78bfa;
}

.dark-theme .hot-more:hover {
  background: rgba(167, 139, 250, 0.15);
}
</style>
