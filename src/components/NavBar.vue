<template>
  <div>
    <nav class="navbar" :class="{ 'navbar-hidden': isNavHidden }">
      <div class="nav-container">
        <!-- 左侧留空 -->
        <div class="nav-left"></div>

        <!-- 中间导航菜单靠右 -->
        <ul class="nav-list">
          <li class="nav-item" :class="{ active: activeIndex === 0 }" @click="goTo('/', 0)">
            <a href="#">
              <span class="nav-icon">🏠</span>
              首页
            </a>
          </li>
          <li class="nav-item" :class="{ active: activeIndex === 1 }" @click="handleEssayClick">
            <a href="javascript:void(0)">
              <span class="nav-icon">✏️</span>
              随笔
            </a>
          </li>
          <li class="nav-item" :class="{ active: activeIndex === 2 }" @click="handleRecordClick">
            <a href="javascript:void(0)">
              <span class="nav-icon">📅</span>
              记录
            </a>
          </li>
          <li class="nav-item" :class="{ active: activeIndex === 3 }" @click="handleMessageClick">
            <a href="javascript:void(0)">
              <span class="nav-icon">💬</span>
              留言
            </a>
          </li>
        </ul>

        <!-- 右侧登录按钮/用户头像 -->
        <div class="user-section">
          <div v-if="isLoggedIn" class="user-avatar-wrapper">
            <div class="user-avatar" @click="handleUserClick">
              <img :src="userAvatar" alt="用户头像" />
            </div>
            <!-- 下拉菜单 -->
            <div class="user-dropdown">
              <div class="dropdown-item" @click="goToProfile">个人中心</div>
              <div class="dropdown-item" @click="handleLogout">退出登录</div>
            </div>
          </div>
          <button v-else class="login-btn" @click="goToLogin">
            登录
          </button>
        </div>
      </div>
    </nav>

    <!-- 回到顶部小火箭（随笔页面不显示） -->
    <div class="rocket-btn" v-show="isNavHidden && $route.path !== '/essay'" @click="scrollToTop">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z">
        </path>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
      </svg>
    </div>

    <!-- 设置齿轮按钮 -->
    <div class="settings-wrapper">
      <div class="settings-btn">
        <svg class="gear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
          </path>
        </svg>
      </div>
      <!-- 展开菜单 -->
      <div class="settings-menu">
        <div class="menu-item" @click="toggleTheme">
          <!-- 月亮图标（白色主题时显示，点击切换到黑色） -->
          <svg v-if="!isDarkTheme" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <!-- 太阳图标（黑色主题时显示，点击切换到白色） -->
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </div>
        <div class="menu-item" :class="{ 'menu-item-active': isSnowActive }" @click="toggleSnowflake">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="2" x2="12" y2="22"></line>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            <line x1="19.07" y1="4.93" x2="4.93" y2="19.07"></line>
          </svg>
        </div>
      </div>
    </div>

    <!-- 雪花容器 -->
    <div class="snowflakes" v-show="isSnowActive" aria-hidden="true">
      <div class="snowflake">❅</div>
      <div class="snowflake">❆</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">❆</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">❆</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">❆</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">❆</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">❆</div>
    </div>
  </div>
</template>

<script>
import API_BASE_URL from '@/config/api'

export default {
  name: 'NavBar',
  data() {
    return {
      activeIndex: 0,
      isLoggedIn: false,
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      isNavHidden: false,
      isSnowActive: false,
      isDarkTheme: false
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll, { passive: true })
    // 初始检查一次
    this.handleScroll()
    // 检查登录状态
    this.checkLoginStatus()
    // 根据当前路由设置激活状态
    this.updateActiveIndex()
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  watch: {
    '$route.path'() {
      // 路由变化时重新检查
      this.$nextTick(() => {
        this.handleScroll()
        this.checkLoginStatus()
        this.updateActiveIndex()
      })
    }
  },
  methods: {
    handleScroll() {
      const path = this.$route.path

      // 首页：通过 section-header 检测
      if (path === '/') {
        const sectionHeader = document.getElementById('section-header')
        if (!sectionHeader) {
          this.isNavHidden = false
          return
        }
        const headerRect = sectionHeader.getBoundingClientRect()
        this.isNavHidden = headerRect.top <= 60
        return
      }

      // 随笔页：当内容展示时隐藏导航栏
      if (path === '/essay') {
        const essayHeader = document.getElementById('essay-content-header')
        // 检测 essay-content-header 是否存在且可见（v-show 控制）
        if (essayHeader && essayHeader.offsetParent !== null) {
          this.isNavHidden = true
        } else {
          this.isNavHidden = false
        }
        return
      }

      // 其他页面不隐藏导航栏
      this.isNavHidden = false
    },
    setActive(index) {
      this.activeIndex = index
    },
    goTo(path, index) {
      this.activeIndex = index
      if (this.$route.path !== path) {
        this.$router.push(path)
      }
    },
    goToLogin() {
      if (this.$route.path !== '/login') {
        this.$router.push('/login')
      }
    },
    handleUserClick() {
      // 点击头像可以跳转到个人中心
    },
    goToProfile() {
      if (this.$route.path !== '/profile') {
        this.$router.push('/profile')
      }
    },
    goToEssay() {
      if (this.$route.path !== '/essay') {
        this.$router.push('/essay')
      }
    },
    handleEssayClick() {
      this.setActive(1)
      this.goToEssay()
    },
    goToMessage() {
      if (this.$route.path !== '/message') {
        this.$router.push('/message')
      }
    },
    handleMessageClick() {
      this.setActive(3)
      this.goToMessage()
    },
    handleRecordClick() {
      this.setActive(2)
      if (this.$route.path !== '/record') {
        this.$router.push('/record')
      }
    },
    async checkLoginStatus() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/info`, {
          method: 'GET',
          credentials: 'include'  // 携带 Cookie
        })
        const result = await response.json()

        if (result.code === 200 && result.data) {
          this.isLoggedIn = true
          this.userAvatar = result.data.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
          // 更新 localStorage
          localStorage.setItem('user', JSON.stringify(result.data))
        } else {
          this.isLoggedIn = false
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('检查登录状态失败：', error)
        this.isLoggedIn = false
      }
    },
    async handleLogout() {
      try {
        await fetch(`${API_BASE_URL}/api/user/logout`, {
          method: 'POST',
          credentials: 'include'
        })
      } catch (error) {
        console.error('登出请求失败：', error)
      }

      this.isLoggedIn = false
      localStorage.removeItem('user')
      // 如果在需要登录的页面，跳转到首页
      if (this.$route.path !== '/') {
        this.$router.push('/')
      }
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    },
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme
      if (this.isDarkTheme) {
        document.documentElement.classList.add('dark-theme')
      } else {
        document.documentElement.classList.remove('dark-theme')
      }
    },
    toggleSnowflake() {
      this.isSnowActive = !this.isSnowActive
    },
    updateActiveIndex() {
      // 根据当前路由设置激活的导航项
      const path = this.$route.path
      const routeIndexMap = {
        '/': 0,
        '/essay': 1,
        '/record': 2,
        '/message': 3,
      }
      if (path in routeIndexMap) {
        this.activeIndex = routeIndexMap[path]
      }
    }
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: transparent;
  transition: background-color 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
}

.navbar-hidden {
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
}

.navbar:hover {
  background-color: rgba(50, 50, 50, 0.7);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 10px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  flex: 1;
}

.nav-list {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin: 0 10px;
  padding: 12px 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active a {
  color: #42b983;
}

.nav-item a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
}

.nav-icon {
  font-size: 18px;
  margin-right: 6px;
  transition: transform 0.3s ease;
}

.nav-item:hover .nav-icon {
  transform: scale(1.2);
}

.nav-item:hover a {
  color: #42b983;
}

/* 用户区域 */
.user-section {
  margin-left: 30px;
}

/* 登录按钮 - 圆形粉红色 */
.login-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ff69b4;
  border: none;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(255, 105, 180, 0.4);
}

.login-btn:hover {
  background-color: #ff85c1;
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.6);
}

/* 用户头像容器 */
.user-avatar-wrapper {
  position: relative;
}

/* 用户头像 - 圆形 */
.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #ff69b4;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.6);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 用户下拉菜单 */
.user-dropdown {
  position: absolute;
  top: 60px;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  min-width: 120px;
  overflow: hidden;
}

.user-avatar-wrapper:hover .user-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  padding: 12px 20px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, #ff69b4, #ff8c94);
  color: #fff;
}

/* 回到顶部小火箭 */
.rocket-btn {
  position: fixed;
  bottom: 100px;
  right: 40px;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #ff69b4, #ff8c94);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.4);
  transition: all 0.3s ease;
  z-index: 999;
  animation: rocketFloat 2s ease-in-out infinite;
}

.rocket-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(255, 105, 180, 0.6);
}

.rocket-btn svg {
  width: 24px;
  height: 24px;
  color: white;
  transform: rotate(-45deg);
}

@keyframes rocketFloat {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

.rocket-btn:hover {
  animation: none;
  transform: translateY(-5px);
}

/* 设置齿轮按钮 */
.settings-wrapper {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 999;
}

.settings-btn {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.settings-btn:hover {
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.gear-icon {
  width: 24px;
  height: 24px;
  color: white;
  animation: gearSpin 4s linear infinite;
}

@keyframes gearSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 展开菜单 */
.settings-menu {
  position: absolute;
  right: 60px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.settings-wrapper:hover .settings-menu {
  opacity: 1;
  visibility: visible;
  right: 65px;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: linear-gradient(135deg, #ff69b4, #ff8c94);
  transform: scale(1.1);
}

.menu-item:hover svg {
  stroke: white;
}

.menu-item svg {
  width: 20px;
  height: 20px;
  stroke: #666;
  transition: stroke 0.3s ease;
}

/* 激活状态 */
.menu-item-active {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.menu-item-active svg {
  stroke: white;
}

/* 雪花特效 */
.snowflakes {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.snowflake {
  position: fixed;
  top: -10%;
  color: #fff;
  font-size: 1em;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
  animation: snowfall linear infinite;
  z-index: 9999;
}

.snowflake:nth-child(1) {
  left: 5%;
  font-size: 1.2em;
  animation-duration: 10s;
  animation-delay: 0s;
}

.snowflake:nth-child(2) {
  left: 15%;
  font-size: 0.8em;
  animation-duration: 12s;
  animation-delay: 1s;
}

.snowflake:nth-child(3) {
  left: 25%;
  font-size: 1.5em;
  animation-duration: 8s;
  animation-delay: 2s;
}

.snowflake:nth-child(4) {
  left: 35%;
  font-size: 1em;
  animation-duration: 14s;
  animation-delay: 0.5s;
}

.snowflake:nth-child(5) {
  left: 45%;
  font-size: 1.3em;
  animation-duration: 9s;
  animation-delay: 3s;
}

.snowflake:nth-child(6) {
  left: 55%;
  font-size: 0.9em;
  animation-duration: 11s;
  animation-delay: 1.5s;
}

.snowflake:nth-child(7) {
  left: 65%;
  font-size: 1.4em;
  animation-duration: 13s;
  animation-delay: 2.5s;
}

.snowflake:nth-child(8) {
  left: 75%;
  font-size: 1.1em;
  animation-duration: 10s;
  animation-delay: 0.8s;
}

.snowflake:nth-child(9) {
  left: 85%;
  font-size: 0.7em;
  animation-duration: 15s;
  animation-delay: 3.5s;
}

.snowflake:nth-child(10) {
  left: 92%;
  font-size: 1.6em;
  animation-duration: 7s;
  animation-delay: 1.2s;
}

.snowflake:nth-child(11) {
  left: 10%;
  font-size: 1em;
  animation-duration: 11s;
  animation-delay: 4s;
}

.snowflake:nth-child(12) {
  left: 50%;
  font-size: 1.2em;
  animation-duration: 9s;
  animation-delay: 2.2s;
}

@keyframes snowfall {
  0% {
    top: -10%;
    transform: translateX(0) rotate(0deg);
    opacity: 1;
  }

  100% {
    top: 100%;
    transform: translateX(100px) rotate(360deg);
    opacity: 0.3;
  }
}
</style>
