<template>
  <div class="login-page">
    <!-- 背景图片 -->
    <div class="login-background">
      <img :src="bgImage" alt="背景图" class="bg-image" @error="handleBgError" />
    </div>

    <!-- 登录框 -->
    <div class="login-container">
      <div class="login-modal">
        <div class="modal-header">
          <h2>欢迎登录</h2>
          <p>登录后享受更多功能</p>
        </div>

        <!-- 登录方式切换 -->
        <div class="login-tabs">
          <button type="button" class="tab-btn" :class="{ active: loginType === 'password' }"
            @click="loginType = 'password'">
            密码登录
          </button>
          <button type="button" class="tab-btn" :class="{ active: loginType === 'code' }" @click="loginType = 'code'">
            免密登录
          </button>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">邮箱</label>
            <input type="email" id="email" v-model="loginForm.email" placeholder="请输入邮箱" required />
          </div>

          <!-- 密码登录 -->
          <div class="form-group" v-if="loginType === 'password'">
            <label for="password">密码</label>
            <input type="password" id="password" v-model="loginForm.password" placeholder="请输入密码" required />
          </div>

          <!-- 验证码登录 -->
          <div class="form-group" v-if="loginType === 'code'">
            <label for="code">验证码</label>
            <div class="code-input-wrapper">
              <input type="text" id="code" v-model="loginForm.code" placeholder="请输入验证码" required />
              <button type="button" class="send-code-btn" :disabled="countdown > 0" @click="sendCode">
                {{ countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
              </button>
            </div>
          </div>

          <div class="form-options" v-if="loginType === 'password'">
            <label class="remember-me">
              <input type="checkbox" v-model="loginForm.rememberMe" />
              <span>记住我</span>
            </label>
            <a href="#" class="forgot-password" @click.prevent="showForgotPassword = true">忘记密码？</a>
          </div>

          <button type="submit" class="submit-btn">登录</button>
          <div class="register-link">
            还没有账号？<a href="#" @click.prevent="goToRegister">立即注册</a>
          </div>
        </form>
      </div>
    </div>

    <!-- 忘记密码弹窗 -->
    <div class="forgot-modal-overlay" v-if="showForgotPassword" @click.self="closeForgotModal">
      <div class="forgot-modal">
        <div class="forgot-header">
          <h3>重置密码</h3>
          <button class="close-btn" @click="closeForgotModal">&times;</button>
        </div>
        <form class="forgot-form" @submit.prevent="handleResetPassword">
          <div class="form-group">
            <label for="forgot-email">邮箱</label>
            <input type="email" id="forgot-email" v-model="forgotForm.email" placeholder="请输入注册时的邮箱" required />
          </div>
          <div class="form-group">
            <label for="forgot-code">验证码</label>
            <div class="code-input-wrapper">
              <input type="text" id="forgot-code" v-model="forgotForm.code" placeholder="请输入验证码" required />
              <button type="button" class="send-code-btn" :disabled="forgotCountdown > 0" @click="sendForgotCode">
                {{ forgotCountdown > 0 ? `${forgotCountdown}s后重发` : '发送验证码' }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label for="new-password">新密码</label>
            <input type="password" id="new-password" v-model="forgotForm.newPassword" placeholder="请输入新密码（至少6位）"
              required />
          </div>
          <div class="form-group">
            <label for="confirm-password">确认密码</label>
            <input type="password" id="confirm-password" v-model="forgotForm.confirmPassword" placeholder="请再次输入新密码"
              required />
          </div>
          <button type="submit" class="submit-btn" :disabled="resetLoading">
            {{ resetLoading ? '重置中...' : '重置密码' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { http } from '@/utils/request'
import { getRandomBg, getFallbackBg } from '@/utils/randomBg'

export default {
  name: 'LoginPage',
  data() {
    return {
      loginType: 'password', // 'password' 或 'code'
      countdown: 0,
      timer: null,
      loginForm: {
        email: '',
        password: '',
        code: '',
        rememberMe: false
      },
      // 忘记密码相关
      showForgotPassword: false,
      forgotCountdown: 0,
      forgotTimer: null,
      resetLoading: false,
      forgotForm: {
        email: '',
        code: '',
        newPassword: '',
        confirmPassword: ''
      },
      bgImage: ''
    }
  },
  mounted() {
    this.bgImage = getRandomBg('login')
  },
  beforeDestroy() {
    // 清除定时器
    if (this.timer) {
      clearInterval(this.timer)
    }
    if (this.forgotTimer) {
      clearInterval(this.forgotTimer)
    }
  },
  methods: {
    async handleLogin() {
      const requestData = {
        email: this.loginForm.email,
        loginType: this.loginType
      }

      if (this.loginType === 'password') {
        requestData.password = this.loginForm.password
      } else {
        requestData.code = this.loginForm.code
      }

      try {
        const res = await http.post('/api/user/login', requestData)
        // 存储 token 和用户信息
        if (res.data.token) {
          localStorage.setItem('token', res.data.token)
        }
        localStorage.setItem('user', JSON.stringify(res.data.user))
        this.$router.push('/')
      } catch (error) {
        console.error('登录失败：', error)
        alert(error.message || '登录失败，请检查网络')
      }
    },
    async sendCode() {
      if (!this.loginForm.email) {
        alert('请先输入邮箱')
        return
      }
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.loginForm.email)) {
        alert('请输入正确的邮箱格式')
        return
      }

      try {
        await http.post(`/api/user/sendCode?email=${encodeURIComponent(this.loginForm.email)}`)
        alert('验证码已发送到您的邮箱')
        this.countdown = 60
        this.timer = setInterval(() => {
          this.countdown--
          if (this.countdown <= 0) {
            clearInterval(this.timer)
            this.timer = null
          }
        }, 1000)
      } catch (error) {
        console.error('发送验证码失败：', error)
        alert(error.message || '发送验证码失败')
      }
    },
    goToRegister() {
      this.$router.push('/register')
    },
    // 忘记密码相关方法
    closeForgotModal() {
      this.showForgotPassword = false
      this.forgotForm = {
        email: '',
        code: '',
        newPassword: '',
        confirmPassword: ''
      }
    },
    async sendForgotCode() {
      if (!this.forgotForm.email) {
        alert('请先输入邮箱')
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.forgotForm.email)) {
        alert('请输入正确的邮箱格式')
        return
      }

      try {
        await http.post(`/api/user/sendCode?email=${encodeURIComponent(this.forgotForm.email)}`)
        alert('验证码已发送到您的邮箱')
        this.forgotCountdown = 60
        this.forgotTimer = setInterval(() => {
          this.forgotCountdown--
          if (this.forgotCountdown <= 0) {
            clearInterval(this.forgotTimer)
            this.forgotTimer = null
          }
        }, 1000)
      } catch (error) {
        console.error('发送验证码失败：', error)
        alert(error.message || '发送验证码失败')
      }
    },
    async handleResetPassword() {
      // 验证表单
      if (!this.forgotForm.email || !this.forgotForm.code || !this.forgotForm.newPassword || !this.forgotForm.confirmPassword) {
        alert('请填写完整信息')
        return
      }
      if (this.forgotForm.newPassword.length < 6) {
        alert('密码长度不能少于6位')
        return
      }
      if (this.forgotForm.newPassword !== this.forgotForm.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }

      this.resetLoading = true
      try {
        await http.post('/api/user/resetPassword', {
          email: this.forgotForm.email,
          code: this.forgotForm.code,
          newPassword: this.forgotForm.newPassword
        })
        alert('密码重置成功，请使用新密码登录')
        this.closeForgotModal()
        // 自动填充邮箱到登录表单
        this.loginForm.email = this.forgotForm.email
        this.loginType = 'password'
      } catch (error) {
        console.error('重置密码失败：', error)
        alert(error.message || '重置密码失败')
      } finally {
        this.resetLoading = false
      }
    },
    handleBgError() {
      this.bgImage = getFallbackBg(this.bgImage, 'login')
    }
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-container {
  position: relative;
  z-index: 10;
  padding: 20px;
  padding-top: 80px;
}

.login-modal {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 40px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  text-align: center;
  margin-bottom: 30px;
}

.modal-header h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
}

.modal-header p {
  font-size: 14px;
  color: #999;
}

/* 登录方式切换标签 */
.login-tabs {
  display: flex;
  margin-bottom: 25px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 10px 20px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #fff;
  color: #ff69b4;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-btn:hover:not(.active) {
  color: #ff69b4;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #ff69b4;
  box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.1);
}

/* 验证码输入框 */
.code-input-wrapper {
  display: flex;
  gap: 10px;
}

.code-input-wrapper input {
  flex: 1;
}

.send-code-btn {
  padding: 14px 16px;
  background: linear-gradient(135deg, #ff69b4, #ff85c1);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.send-code-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff85c1, #ff69b4);
}

.send-code-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.remember-me {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.remember-me input {
  margin-right: 6px;
  accent-color: #ff69b4;
}

.forgot-password {
  font-size: 14px;
  color: #ff69b4;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #ff69b4, #ff85c1);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #ff85c1, #ff69b4);
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 105, 180, 0.4);
}

.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.register-link a {
  color: #ff69b4;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

/* 忘记密码弹窗 */
.forgot-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.forgot-modal {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.forgot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.forgot-header h3 {
  font-size: 20px;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #ff69b4;
}

.forgot-form .form-group {
  margin-bottom: 18px;
}

.forgot-form .submit-btn {
  margin-top: 10px;
}

.forgot-form .submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>
