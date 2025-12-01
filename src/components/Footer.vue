<template>
  <!-- 极简毛玻璃页脚 -->
  <footer v-if="minimal" class="minimal-footer">
    <div class="minimal-content">
      <span>© {{ currentYear }}</span>
      <span class="site-name">拾光博客</span>
      <span class="divider">·</span>
      <span>Powered by Vue.js</span>
      <span class="heart">❤️</span>
    </div>
  </footer>

  <!-- 完整页脚 -->
  <footer v-else class="site-footer">
    <div class="footer-content">
      <!-- 关于本站 -->
      <div class="footer-section">
        <h3 class="footer-title">
          <span class="title-icon">💝</span>
          关于本站
        </h3>
        <p class="about-text">
          记录生活的点滴，分享技术的心得。<br />
          愿你眼里有光，心中有爱。
        </p>
        <div class="social-links">
          <a href="https://github.com" target="_blank" class="social-link" title="GitHub">
            <svg viewBox="0 0 24 24">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <div class="social-link-wrapper" @click.stop>
            <span class="social-link" title="QQ" @click="toggleQrCode('qq')">
              <svg viewBox="0 0 24 24">
                <path
                  d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.281 1.025.114 0 .902-.484 1.748-2.072 0 0-.18 2.197 1.904 3.967 0 0-1.77.495-1.77 1.182 0 .686 4.078.43 6.29.43 2.213 0 6.29.256 6.29-.43 0-.687-1.77-1.182-1.77-1.182 2.085-1.77 1.905-3.967 1.905-3.967.845 1.588 1.634 2.072 1.746 2.072.111 0 .283-.36.283-1.025 0-2.514-2.166-6.954-2.166-6.954V9.325C18.29 3.364 14.268 2 12.003 2z" />
              </svg>
            </span>
            <div class="qr-popup" v-if="showQrCode === 'qq'" @click.stop>
              <img src="/image/QQ.jpg" alt="QQ二维码" />
              <span class="qr-close" @click="showQrCode = null">✕</span>
            </div>
          </div>
          <div class="social-link-wrapper" @click.stop>
            <span class="social-link" title="微信" @click="toggleQrCode('wx')">
              <svg viewBox="0 0 24 24">
                <path
                  d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
              </svg>
            </span>
            <div class="qr-popup" v-if="showQrCode === 'wx'" @click.stop>
              <img src="/image/wx.jpg" alt="微信二维码" />
              <span class="qr-close" @click="showQrCode = null">✕</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 网站统计 -->
      <div class="footer-section">
        <h3 class="footer-title">
          <span class="title-icon">📊</span>
          网站统计
        </h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ stats.articles }}</span>
            <span class="stat-label">文章数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalViews }}</span>
            <span class="stat-label">总访问</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.todayViews }}</span>
            <span class="stat-label">今日访客</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.runDays }}</span>
            <span class="stat-label">运行天数</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部版权信息 -->
    <div class="footer-bottom">
      <div class="copyright">
        <p>
          © {{ currentYear }} <span class="site-name">拾光博客</span> · All Rights Reserved
        </p>
        <p class="icp">
          <a href="https://beian.miit.gov.cn/" target="_blank">
            <img src="https://img.shields.io/badge/ICP-备案号-blue?style=flat-square" alt="ICP" />
          </a>
          <span class="divider">|</span>
          <span>Powered by Vue.js ❤️</span>
        </p>
      </div>
    </div>
  </footer>
</template>

<script>
import { http } from '@/utils/request'

export default {
  name: 'SiteFooter',
  props: {
    minimal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      stats: {
        articles: 0,
        totalViews: '0',
        todayViews: 0,
        runDays: 0
      },
      showQrCode: null,
      loading: false
    }
  },
  mounted() {
    document.addEventListener('click', this.closeQrCode)
    // 只有完整页脚才加载统计数据
    if (!this.minimal) {
      this.loadStats()
    }
  },
  beforeDestroy() {
    document.removeEventListener('click', this.closeQrCode)
  },
  methods: {
    async loadStats() {
      this.loading = true
      try {
        const res = await http.get('/api/dashboard/site-stats')
        if (res.data) {
          this.stats = {
            articles: res.data.articles || 0,
            totalViews: res.data.totalViews || '0',
            todayViews: res.data.todayViews || 0,
            runDays: res.data.runDays || 0
          }
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    toggleQrCode(type) {
      this.showQrCode = this.showQrCode === type ? null : type
    },
    closeQrCode() {
      this.showQrCode = null
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
/* ========== 极简毛玻璃页脚 ========== */
.minimal-footer {
  position: relative;
  margin-top: 0;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.minimal-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.minimal-content .site-name {
  color: #667eea;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.minimal-content .divider {
  color: rgba(255, 255, 255, 0.4);
}

.minimal-content .heart {
  animation: heartPulse 1.5s ease-in-out infinite;
}

@keyframes heartPulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }
}

/* ========== 完整页脚 ========== */
.site-footer {
  position: relative;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ccc;
  margin-top: 60px;
  overflow: hidden;
}

.footer-wave {
  position: absolute;
  top: -1px;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
}

.footer-wave svg {
  width: 100%;
  height: 60px;
}

.footer-wave path {
  fill: #fff;
}

:global(.dark-theme) .footer-wave path {
  fill: var(--bg-color, #1a1a2e);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 60px;
  /* padding: 50px 60px 40px; */
  padding-top: 20px;
  padding-bottom: 20px;
  max-width: 900px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 40px 30px 30px;
  }
}

.footer-section {
  text-align: center;
}

.footer-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.title-icon {
  font-size: 20px;
}

/* 关于本站 */
.about-text {
  font-size: 14px;
  line-height: 1.8;
  color: #aaa;
  margin-bottom: 20px;
}

.social-links {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.social-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.social-link svg {
  width: 20px;
  height: 20px;
  fill: #ccc;
  transition: fill 0.3s;
}

.social-link:hover {
  background: linear-gradient(135deg, #667eea, #764ba2);
  transform: translateY(-3px) scale(1.1);
}

.social-link:hover svg {
  fill: #fff;
}

/* 二维码弹窗 */
.social-link-wrapper {
  position: relative;
}

.social-link-wrapper .social-link {
  cursor: pointer;
}

.qr-popup {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 100;
  animation: qrFadeIn 0.2s ease;
}

.qr-popup::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #fff;
}

.qr-popup img {
  width: 100px;
  height: 100px;
  display: block;
  border-radius: 4px;
}

.qr-close {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background: #ff4757;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.qr-close:hover {
  transform: scale(1.1);
}

@keyframes qrFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 网站统计 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

/* 底部版权 */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 60px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 1200px;
  margin: 0 auto;
}

.copyright {
  text-align: center;
  flex: 1;
}

.copyright p {
  margin: 5px 0;
  font-size: 13px;
  color: #888;
}

.site-name {
  color: #667eea;
  font-weight: 600;
}

.icp {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.icp a {
  display: flex;
  align-items: center;
}

.icp img {
  height: 18px;
}

.divider {
  color: #555;
}

/* 响应式布局 - 手机 */
@media (max-width: 576px) {
  .footer-content {
    padding: 30px 20px 20px;
    gap: 30px;
  }

  .footer-title {
    font-size: 16px;
    margin-bottom: 15px;
  }

  .about-text {
    font-size: 13px;
  }

  .social-links {
    gap: 12px;
  }

  .social-link {
    width: 36px;
    height: 36px;
  }

  .social-link svg {
    width: 18px;
    height: 18px;
  }

  .stats-grid {
    gap: 15px;
  }

  .stat-value {
    font-size: 22px;
  }

  .stat-label {
    font-size: 11px;
  }

  .footer-bottom {
    padding: 15px 15px;
    flex-direction: column;
    gap: 8px;
    font-size: 12px;
  }

  .minimal-footer {
    padding: 15px 10px;
    font-size: 12px;
    flex-direction: column;
    gap: 8px;
  }
}
</style>
