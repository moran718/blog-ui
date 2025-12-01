<template>
  <div class="register-page">
    <!-- 背景图片 -->
    <div class="register-background">
      <img :src="bgImage" alt="背景图" class="bg-image" @error="handleBgError" />
    </div>

    <!-- 注册框 -->
    <div class="register-container">
      <div class="register-modal">
        <div class="modal-header">
          <h2>用户注册</h2>
          <p>创建账号，开始记录</p>
        </div>

        <form class="register-form" @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="username">用户名</label>
            <input type="text" id="username" v-model="registerForm.username" placeholder="请输入用户名" required />
          </div>

          <div class="form-group">
            <label for="email">邮箱</label>
            <input type="email" id="email" v-model="registerForm.email" placeholder="请输入邮箱" required />
          </div>

          <div class="form-group">
            <label for="password">登录密码</label>
            <input type="password" id="password" v-model="registerForm.password" placeholder="请输入登录密码" required />
          </div>

          <div class="form-group">
            <label for="code">验证码</label>
            <div class="code-input-wrapper">
              <input type="text" id="code" v-model="registerForm.code" placeholder="请输入验证码" required />
              <button type="button" class="send-code-btn" :disabled="countdown > 0" @click="sendCode">
                {{ countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
              </button>
            </div>
          </div>

          <button type="submit" class="submit-btn">立即注册</button>
          <div class="login-link">
            已有账号？<a href="#" @click.prevent="goToLogin">立即登录</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { http } from '@/utils/request'
import { getRandomBg, getFallbackBg } from '@/utils/randomBg'

export default {
  name: 'RegisterPage',
  data() {
    return {
      countdown: 0,
      timer: null,
      registerForm: {
        username: '',
        email: '',
        password: '',
        code: ''
      },
      bgImage: ''
    }
  },
  mounted() {
    this.bgImage = getRandomBg('register')
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    async handleRegister() {
      try {
        await http.post('/api/user/register', this.registerForm)
        alert('注册成功！')
        this.$router.push('/login')
      } catch (error) {
        console.error('注册失败：', error)
        alert(error.message || '注册失败')
      }
    },
    async sendCode() {
      if (!this.registerForm.email) {
        alert('请先输入邮箱')
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.registerForm.email)) {
        alert('请输入正确的邮箱格式')
        return
      }

      try {
        await http.post(`/api/user/sendCode?email=${encodeURIComponent(this.registerForm.email)}`)
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
    goToLogin() {
      this.$router.push('/login')
    },
    handleBgError() {
      this.bgImage = getFallbackBg(this.bgImage, 'register')
    }
  }
}
</script>

<style scoped>
.register-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.register-background {
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

.register-container {
  position: relative;
  z-index: 10;
  padding: 15px;
  padding-top: 80px;
}

.register-modal {

  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
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

.register-form {
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
  margin-top: 10px;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #ff85c1, #ff69b4);
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 105, 180, 0.4);
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #ff69b4;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
