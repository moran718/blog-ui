<template>
  <div>
    <nav class="navbar" :class="{ 'navbar-hidden': isNavHidden }">
      <div class="nav-container">
        <!-- 左侧 Logo -->
        <div class="nav-left" @click="goTo('/', 0)">
          <img src="/image/logoko.png" alt="Logo" class="nav-logo" />
          <span class="nav-title">拾光</span>
        </div>

        <!-- 移动端汉堡菜单按钮 -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu" :class="{ active: mobileMenuOpen }">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>

        <!-- 中间导航菜单靠右 -->
        <ul class="nav-list" :class="{ 'mobile-open': mobileMenuOpen }">
          <li class="nav-item" :class="{ active: activeIndex === 0 }" @click="goTo('/', 0); closeMobileMenu()"
            @mouseenter="preloadPage('home')">
            <a href="javascript:void(0)">
              <span class="nav-icon">🏠</span>
              首页
            </a>
          </li>
          <li class="nav-item" :class="{ active: activeIndex === 1 }" @click="handleEssayClick(); closeMobileMenu()"
            @mouseenter="preloadPage('essay')">
            <a href="javascript:void(0)">
              <span class="nav-icon">✏️</span>
              随笔
            </a>
          </li>
          <li class="nav-item" :class="{ active: activeIndex === 2 }" @click="handleRecordClick(); closeMobileMenu()"
            @mouseenter="preloadPage('record')">
            <a href="javascript:void(0)">
              <span class="nav-icon">📅</span>
              记录
            </a>
          </li>
          <li class="nav-item" :class="{ active: activeIndex === 3 }" @click="handleMessageClick(); closeMobileMenu()"
            @mouseenter="preloadPage('message')">
            <a href="javascript:void(0)">
              <span class="nav-icon">💬</span>
              留言
            </a>
          </li>
          <li class="nav-item" :class="{ active: activeIndex === 4 }" @click="handleMusicClick(); closeMobileMenu()"
            @mouseenter="preloadPage('music')">
            <a href="javascript:void(0)">
              <span class="nav-icon">🎵</span>
              音乐
            </a>
          </li>
          <li class="nav-item" :class="{ active: activeIndex === 5 }" @click="handleArchiveClick(); closeMobileMenu()"
            @mouseenter="preloadPage('archive')">
            <a href="javascript:void(0)">
              <span class="nav-icon">📚</span>
              归档
            </a>
          </li>
        </ul>

        <!-- 右侧搜索和登录按钮/用户头像 -->
        <div class="user-section">
          <!-- 搜索按钮 -->
          <button class="search-btn" @click="openSearch" title="搜索">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>

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

    <!-- 搜索弹窗 -->
    <SearchModal :visible="showSearch" @close="closeSearch" />

    <!-- 回到顶部小火箭（随笔、记录、留言、音乐、归档页面不显示，它们有自己的返回按钮） -->
    <div class="rocket-btn"
      v-show="isNavHidden && !['/essay', '/record', '/message', '/music', '/archive'].includes($route.path)"
      @click="scrollToTop">
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
import { http, getResourceUrl } from '@/utils/request'
import { preloadBg } from '@/utils/randomBg'
import SearchModal from './SearchModal.vue'

export default {
  name: 'NavBar',
  components: {
    SearchModal
  },
  data() {
    return {
      activeIndex: 0,
      isLoggedIn: false,
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      isNavHidden: false,
      isSnowActive: false,
      isDarkTheme: false,
      showSearch: false,
      preloadedPages: {}, // 记录已预加载的页面
      mobileMenuOpen: false // 移动端菜单状态
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
    '$route.path': {
      immediate: true,
      handler(newPath) {
        // 路由变化时立即更新激活状态
        this.updateActiveIndex()

        // 判断是否是详情页（需要动态显示导航栏）
        const detailPages = ['/record/']
        const isDetailPage = detailPages.some(p => newPath.startsWith(p))

        if (isDetailPage) {
          // 详情页：先隐藏，延迟后显示（避免与列表页导航栏重叠）
          this.isNavHidden = true
          setTimeout(() => {
            this.isNavHidden = false
          }, 300)
        } else {
          // 其他页面通过 nextTick 检测
          this.$nextTick(() => {
            this.handleScroll()
          })
        }

        this.checkLoginStatus()
      }
    }
  },
  methods: {
    // 预加载页面背景图
    preloadPage(pageName) {
      // 避免重复预加载
      if (this.preloadedPages[pageName]) return

      // 标记为已预加载
      this.preloadedPages[pageName] = true

      // 预加载背景图
      preloadBg(pageName)

      // 显示预加载提示（可选，调试用）
      console.log(`🚀 预加载: ${pageName} 页面资源`)
    },
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

      // 记录页：当内容展示时隐藏导航栏
      if (path === '/record') {
        const recordHeader = document.getElementById('record-content-header')
        if (recordHeader && recordHeader.offsetParent !== null) {
          this.isNavHidden = true
        } else {
          this.isNavHidden = false
        }
        return
      }

      // 留言页：当内容展示时隐藏导航栏
      if (path === '/message') {
        const messageHeader = document.getElementById('message-content-header')
        if (messageHeader && messageHeader.offsetParent !== null) {
          this.isNavHidden = true
        } else {
          this.isNavHidden = false
        }
        return
      }

      // 音乐页：当内容展示时隐藏导航栏
      if (path === '/music') {
        const musicHeader = document.getElementById('music-content-header')
        if (musicHeader && musicHeader.offsetParent !== null) {
          this.isNavHidden = true
        } else {
          this.isNavHidden = false
        }
        return
      }

      // 归档页：当内容展示时隐藏导航栏
      if (path === '/archive') {
        const archiveHeader = document.getElementById('archive-content-header')
        if (archiveHeader && archiveHeader.offsetParent !== null) {
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
    handleMusicClick() {
      this.setActive(4)
      if (this.$route.path !== '/music') {
        this.$router.push('/music')
      }
    },
    handleArchiveClick() {
      this.setActive(5)
      if (this.$route.path !== '/archive') {
        this.$router.push('/archive')
      }
    },
    async checkLoginStatus() {
      try {
        const res = await http.get('/api/user/info')
        if (res.data) {
          this.isLoggedIn = true
          // 处理头像路径
          let avatar = res.data.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
          if (avatar && !avatar.startsWith('http://') && !avatar.startsWith('https://')) {
            avatar = getResourceUrl(avatar)
          }
          this.userAvatar = avatar
          localStorage.setItem('user', JSON.stringify(res.data))
        } else {
          this.isLoggedIn = false
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('检查登录状态失败：', error)
        this.isLoggedIn = false
        localStorage.removeItem('user')
      }
    },
    async handleLogout() {
      try {
        await http.post('/api/user/logout')
      } catch (error) {
        console.error('登出请求失败：', error)
      }

      this.isLoggedIn = false
      localStorage.removeItem('user')
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
        '/music': 4,
        '/archive': 5,
      }
      if (path in routeIndexMap) {
        this.activeIndex = routeIndexMap[path]
      } else if (path.startsWith('/record/')) {
        // 文章详情页面，显示"记录"为活动状态
        this.activeIndex = 2
      }
    },
    openSearch() {
      this.showSearch = true
    },
    closeSearch() {
      this.showSearch = false
    },
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false
    }
  },
  created() {
    // 监听键盘快捷键 Ctrl+K 或 Cmd+K 打开搜索
    const handleKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        this.openSearch()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('keydown', handleKeydown)
    })
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
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.nav-left:hover {
  opacity: 0.8;
}

.nav-logo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 2px;
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
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 搜索按钮 */
.search-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.search-btn svg {
  width: 20px;
  height: 20px;
  stroke: #fff;
  transition: stroke 0.3s ease;
}

.search-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.1);
}

.search-btn:hover svg {
  stroke: #42b983;
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

/* 移动端汉堡菜单按钮 */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  z-index: 1001;
}

.hamburger-line {
  width: 24px;
  height: 3px;
  background: #fff;
  border-radius: 2px;
  transition: all 0.3s ease;
  margin: 2px 0;
}

.mobile-menu-btn.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-btn.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* 响应式布局 - 平板 */
@media (max-width: 992px) {
  .nav-container {
    padding: 10px 20px;
  }

  .nav-item {
    margin: 0 5px;
    padding: 10px 12px;
  }

  .nav-item a {
    font-size: 14px;
  }

  .user-section {
    margin-left: 15px;
  }

  .login-btn,
  .user-avatar {
    width: 42px;
    height: 42px;
    font-size: 12px;
  }

  .search-btn {
    width: 36px;
    height: 36px;
  }

  .rocket-btn,
  .settings-btn {
    width: 44px;
    height: 44px;
  }

  .rocket-btn {
    right: 20px;
    bottom: 90px;
  }

  .settings-wrapper {
    right: 20px;
    bottom: 35px;
  }
}

/* 响应式布局 - 手机 */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }

  .nav-left {
    display: flex;
    flex: 0;
  }

  .nav-logo {
    width: 28px;
    height: 28px;
  }

  .nav-title {
    font-size: 16px;
  }

  .nav-list {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(30, 30, 40, 0.98);
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1000;
  }

  .nav-list.mobile-open {
    transform: translateX(0);
  }

  .nav-item {
    margin: 5px 0;
    padding: 15px 30px;
  }

  .nav-item a {
    font-size: 18px;
  }

  .nav-icon {
    font-size: 22px;
    margin-right: 10px;
  }

  .user-section {
    margin-left: auto;
    gap: 10px;
  }

  .login-btn,
  .user-avatar {
    width: 38px;
    height: 38px;
    font-size: 11px;
  }

  .search-btn {
    width: 34px;
    height: 34px;
  }

  .search-btn svg {
    width: 18px;
    height: 18px;
  }

  .user-dropdown {
    right: -10px;
  }

  .rocket-btn {
    width: 44px;
    height: 44px;
    right: 15px;
    bottom: 80px;
  }

  .rocket-btn svg {
    width: 20px;
    height: 20px;
  }

  .settings-wrapper {
    right: 15px;
    bottom: 25px;
  }

  .settings-btn {
    width: 44px;
    height: 44px;
  }

  .gear-icon {
    width: 20px;
    height: 20px;
  }

  .settings-menu {
    right: 55px;
  }

  .settings-wrapper:hover .settings-menu {
    right: 55px;
  }

  .menu-item {
    width: 36px;
    height: 36px;
  }

  .menu-item svg {
    width: 18px;
    height: 18px;
  }
}
</style>
