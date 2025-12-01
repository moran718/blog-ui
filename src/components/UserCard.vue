<template>
  <div class="user-card">
    <!-- 背景装饰 -->
    <div class="card-bg"></div>

    <!-- 用户信息 -->
    <div class="user-info">
      <!-- 头像 -->
      <div class="avatar-wrapper">
        <img :src="user.avatar" :alt="user.nickname" class="avatar" />
        <span class="online-status" :class="{ online: user.online }"></span>
      </div>

      <!-- 基本信息 -->
      <div class="user-meta">
        <h3 class="nickname">
          {{ user.nickname }}
          <span class="gender-icon" :class="genderClass">{{ genderIcon }}</span>
        </h3>
        <p class="bio">{{ user.bio || '这个人很懒，什么都没写~' }}</p>
      </div>

      <!-- 统计数据 -->
      <div class="user-stats">
        <div class="stat-item">
          <span class="stat-value">{{ user.articles || 0 }}</span>
          <span class="stat-label">文章</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ user.categories || 0 }}</span>
          <span class="stat-label">分类</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ formatViews(user.views) }}</span>
          <span class="stat-label">访问量</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { http } from '@/utils/request'

export default {
  name: 'UserCard',
  data() {
    return {
      loading: true,
      user: {
        avatar: '',
        nickname: '',
        gender: 'unknown',
        bio: '',
        online: true,
        articles: 0,
        categories: 0,
        views: 0
      }
    }
  },
  computed: {
    genderIcon() {
      const icons = {
        male: '♂',
        female: '♀',
        unknown: ''
      }
      return icons[this.user.gender] || ''
    },
    genderClass() {
      return `gender-${this.user.gender}`
    }
  },
  mounted() {
    this.fetchAdminInfo()
    this.fetchAdminStats()
  },
  methods: {
    async fetchAdminInfo() {
      try {
        const res = await http.get('/api/user/admin')
        if (res.data) {
          const admin = res.data
          this.user = {
            ...this.user,
            avatar: admin.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
            nickname: admin.username,
            gender: admin.gender === 1 ? 'male' : admin.gender === 2 ? 'female' : 'unknown',
            bio: admin.bio || '这个人很懒，什么都没写~',
            online: true
          }
        }
      } catch (error) {
        console.error('获取管理员信息失败:', error)
      } finally {
        this.loading = false
      }
    },
    async fetchAdminStats() {
      try {
        const res = await http.get('/api/user/admin/stats')
        if (res.data) {
          this.user.articles = res.data.articles || 0
          this.user.categories = res.data.categories || 0
          this.user.views = res.data.views || 0
        }
      } catch (error) {
        console.error('获取统计信息失败:', error)
      }
    },
    formatViews(views) {
      if (views >= 10000) {
        return (views / 10000).toFixed(1) + 'w'
      } else if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'k'
      }
      return views
    }
  }
}
</script>

<style scoped>
.user-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

/* 背景装饰 */
.card-bg {
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.card-bg::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.95), transparent);
}

/* 用户信息区 */
.user-info {
  padding: 0 20px 20px;
  text-align: center;
  margin-top: -40px;
  position: relative;
  z-index: 1;
}

/* 头像 */
.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  object-fit: cover;
  background: #f0f0f0;
}

.online-status {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ccc;
  border: 3px solid #fff;
}

.online-status.online {
  background: #52c41a;
  box-shadow: 0 0 8px rgba(82, 196, 26, 0.6);
}

/* 基本信息 */
.user-meta {
  margin-top: 12px;
}

.nickname {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.gender-icon {
  font-size: 14px;
}

.gender-male {
  color: #1890ff;
}

.gender-female {
  color: #eb2f96;
}

.bio {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.5;
  padding: 0 10px;
}

/* 统计数据 */
.user-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 18px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
</style>

<style>
/* 暗黑主题 - 非 scoped */
.dark-theme .user-card {
  background: rgba(30, 30, 40, 0.95);
}

.dark-theme .card-bg::after {
  background: linear-gradient(to top, rgba(30, 30, 40, 0.95), transparent);
}

.dark-theme .avatar {
  border-color: #2a2a3a;
}

.dark-theme .nickname {
  color: #eee;
}

.dark-theme .bio {
  color: #aaa;
}

.dark-theme .stat-value {
  color: #eee;
}

.dark-theme .stat-label {
  color: #888;
}

.dark-theme .user-stats {
  border-top-color: #3a3a4a;
}

.dark-theme .online-status {
  border-color: #2a2a3a;
}
</style>
