<template>
  <div class="profile-page">
    <!-- 导航栏 -->
    <NavBar />

    <!-- 背景图片 -->
    <div class="profile-background">
      <img src="/image/wallhaven-9oo2k1.jpg" alt="背景图" class="bg-image" />
    </div>

    <!-- 个人中心卡片 -->
    <div class="profile-container">
      <div class="profile-card">
        <!-- 头像 -->
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="triggerFileInput">
            <img :src="userInfo.avatar || defaultAvatar" alt="用户头像" class="user-avatar" />
            <div class="avatar-overlay">
              <span>更换头像</span>
            </div>
          </div>
          <input type="file" ref="fileInput" accept="image/*" style="display: none" @change="handleFileChange" />
        </div>

        <!-- 表单 -->
        <form class="profile-form" @submit.prevent="handleSubmit">
          <div class="form-row">
            <label>用户名：</label>
            <div class="form-value">
              <input type="text" v-model="userInfo.username" class="form-input" @blur="checkUsername" />
              <span v-if="usernameError" class="error-tip">{{ usernameError }}</span>
              <span v-if="usernameOk" class="success-tip">✓ 用户名可用</span>
            </div>
          </div>

          <div class="form-row">
            <label>邮箱：</label>
            <div class="form-value">
              <span class="email-text">{{ userInfo.email }}</span>
              <button type="button" class="modify-btn" @click="showEmailModal = true">修改</button>
            </div>
          </div>

          <div class="form-row">
            <label>密码：</label>
            <div class="form-value">
              <span class="email-text">******</span>
              <button type="button" class="modify-btn" @click="showPasswordModal = true">修改</button>
            </div>
          </div>

          <div class="form-row">
            <label>性别：</label>
            <div class="form-value gender-options">

              <label class="radio-label">
                <input type="radio" v-model="userInfo.gender" :value="1" />
                <span>男</span>
              </label>
              <label class="radio-label female">
                <input type="radio" v-model="userInfo.gender" :value="2" />
                <span>女</span>
              </label>
            </div>
          </div>

          <div class="form-row">
            <label>简介：</label>
            <div class="form-value">
              <textarea v-model="userInfo.bio" class="form-textarea" maxlength="60" placeholder="介绍一下自己吧..."></textarea>
              <span class="char-count">{{ userInfo.bio ? userInfo.bio.length : 0 }}/60</span>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn">提交</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 修改邮箱弹窗 -->
    <div class="modal-overlay" v-if="showEmailModal" @click.self="showEmailModal = false">
      <div class="modal-content">
        <h3>修改邮箱</h3>
        <div class="modal-form">
          <div class="modal-row">
            <label>新邮箱：</label>
            <input type="email" v-model="newEmail" placeholder="请输入新邮箱" />
          </div>
          <div class="modal-row">
            <label>验证码：</label>
            <div class="code-wrapper">
              <input type="text" v-model="emailCode" placeholder="请输入验证码" />
              <button type="button" class="send-btn" :disabled="countdown > 0" @click="sendEmailCode">
                {{ countdown > 0 ? `${countdown}s` : '发送' }}
              </button>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showEmailModal = false">取消</button>
          <button class="confirm-btn" @click="confirmEmailChange">确认</button>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <div class="modal-overlay" v-if="showPasswordModal" @click.self="showPasswordModal = false">
      <div class="modal-content">
        <h3>修改密码</h3>
        <div class="modal-form">
          <div class="modal-row">
            <label>旧密码：</label>
            <input type="password" v-model="passwordForm.oldPassword" placeholder="请输入当前密码" />
          </div>
          <div class="modal-row">
            <label>新密码：</label>
            <input type="password" v-model="passwordForm.newPassword" placeholder="请输入新密码（至少6位）" />
          </div>
          <div class="modal-row">
            <label>确认密码：</label>
            <input type="password" v-model="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
          </div>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closePasswordModal">取消</button>
          <button class="confirm-btn" :disabled="passwordLoading" @click="confirmPasswordChange">
            {{ passwordLoading ? '修改中...' : '确认' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import { http } from '@/utils/request'

export default {
  name: 'ProfilePage',
  components: {
    NavBar
  },
  data() {
    return {
      defaultAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      userInfo: {
        id: null,
        username: '',
        email: '',
        gender: 0,
        avatar: '',
        bio: ''
      },
      originalUsername: '', // 保存原始用户名
      usernameError: '',
      usernameOk: false,
      showEmailModal: false,
      newEmail: '',
      emailCode: '',
      countdown: 0,
      timer: null,
      // 修改密码相关
      showPasswordModal: false,
      passwordLoading: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  mounted() {
    this.loadUserInfo()
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    async loadUserInfo() {
      try {
        const res = await http.get('/api/user/info')
        if (res.data) {
          this.userInfo = {
            id: res.data.id,
            username: res.data.username,
            email: res.data.email,
            gender: res.data.gender || 0,
            avatar: res.data.avatar || this.defaultAvatar,
            bio: res.data.bio || ''
          }
          this.originalUsername = res.data.username
        }
      } catch (error) {
        console.error('获取用户信息失败：', error)
        alert('请先登录')
        this.$router.push('/login')
      }
    },
    async checkUsername() {
      if (!this.userInfo.username || this.userInfo.username === this.originalUsername) {
        this.usernameError = ''
        this.usernameOk = false
        return true
      }

      try {
        const res = await http.get('/api/user/checkUsername', { username: this.userInfo.username })
        if (res.data === true) {
          this.usernameError = '该用户名已被使用'
          this.usernameOk = false
          return false
        } else {
          this.usernameError = ''
          this.usernameOk = true
          return true
        }
      } catch (error) {
        console.error('检查用户名失败：', error)
        this.usernameError = '检查失败，请重试'
        this.usernameOk = false
        return false
      }
    },
    async handleSubmit() {
      if (this.userInfo.username !== this.originalUsername) {
        const isValid = await this.checkUsername()
        if (!isValid) {
          return
        }
      }

      try {
        const res = await http.post('/api/user/update', {
          username: this.userInfo.username,
          gender: this.userInfo.gender,
          bio: this.userInfo.bio
        })
        alert('保存成功')
        this.originalUsername = this.userInfo.username
        this.usernameOk = false
        localStorage.setItem('user', JSON.stringify(res.data))
      } catch (error) {
        console.error('保存失败：', error)
        alert(error.message || '保存失败')
      }
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    async handleFileChange(event) {
      const file = event.target.files[0]
      if (!file) return

      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }

      // 验证文件大小（最大 2MB）
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过 2MB')
        return
      }

      try {
        const res = await http.upload('/api/user/uploadAvatar', file)
        this.userInfo.avatar = res.data
      } catch (error) {
        console.error('上传失败：', error)
        alert(error.message || '上传失败')
      }

      event.target.value = ''
    },
    async sendEmailCode() {
      if (!this.newEmail) {
        alert('请输入新邮箱')
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.newEmail)) {
        alert('请输入正确的邮箱格式')
        return
      }

      try {
        await http.post(`/api/user/sendCode?email=${encodeURIComponent(this.newEmail)}`)
        alert('验证码已发送')
        this.countdown = 60
        this.timer = setInterval(() => {
          this.countdown--
          if (this.countdown <= 0) {
            clearInterval(this.timer)
            this.timer = null
          }
        }, 1000)
      } catch (error) {
        alert(error.message || '发送失败')
      }
    },
    async confirmEmailChange() {
      if (!this.newEmail || !this.emailCode) {
        alert('请填写完整信息')
        return
      }

      try {
        await http.post('/api/user/updateEmail', {
          email: this.newEmail,
          code: this.emailCode
        })
        alert('邮箱修改成功')
        this.userInfo.email = this.newEmail
        this.showEmailModal = false
        this.newEmail = ''
        this.emailCode = ''
      } catch (error) {
        alert(error.message || '修改失败')
      }
    },
    // 修改密码相关方法
    closePasswordModal() {
      this.showPasswordModal = false
      this.passwordForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    },
    async confirmPasswordChange() {
      const { oldPassword, newPassword, confirmPassword } = this.passwordForm

      if (!oldPassword || !newPassword || !confirmPassword) {
        alert('请填写完整信息')
        return
      }
      if (newPassword.length < 6) {
        alert('新密码长度不能少于6位')
        return
      }
      if (newPassword !== confirmPassword) {
        alert('两次输入的新密码不一致')
        return
      }

      this.passwordLoading = true
      try {
        await http.post('/api/user/changePassword', {
          oldPassword,
          newPassword
        })
        alert('密码修改成功')
        this.closePasswordModal()
      } catch (error) {
        alert(error.message || '修改失败')
      } finally {
        this.passwordLoading = false
      }
    }
  }
}
</script>

<style scoped>
.profile-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-background {
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

.profile-container {
  position: relative;
  z-index: 10;
  padding: 20px;
  padding-top: 80px;
}

.profile-card {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  padding: 40px 60px;
  width: 500px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* 头像区域 */
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay span {
  color: #fff;
  font-size: 12px;
}

/* 表单 */
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-row {
  display: flex;
  align-items: flex-start;
}

.form-row label {
  width: 80px;
  text-align: right;
  color: #666;
  font-size: 14px;
  line-height: 36px;
  flex-shrink: 0;
}

.form-value {
  flex: 1;
  position: relative;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.8);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #7c5cff;
}

.error-tip {
  display: block;
  color: #ff4757;
  font-size: 12px;
  margin-top: 5px;
}

.success-tip {
  display: block;
  color: #2ed573;
  font-size: 12px;
  margin-top: 5px;
}

.email-text {
  font-size: 14px;
  color: #333;
  line-height: 36px;
}

.modify-btn {
  margin-left: 10px;
  padding: 4px 12px;
  background: #ff69b4;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.modify-btn:hover {
  background: #ff85c1;
}

/* 性别选项 */
.gender-options {
  display: flex;
  align-items: center;
  gap: 20px;
  line-height: 36px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.radio-label input[type="radio"] {
  accent-color: #7c5cff;
}

.radio-label.female span {
  color: #ff69b4;
}

/* 简介 */
.form-textarea {
  width: 100%;
  height: 60px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: none;
  background: rgba(255, 255, 255, 0.8);
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: #7c5cff;
}

.char-count {
  position: absolute;
  right: 10px;
  bottom: 5px;
  font-size: 12px;
  color: #999;
}

/* 提交按钮 */
.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.submit-btn {
  padding: 10px 40px;
  background: #7c5cff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: #6a4de0;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(124, 92, 255, 0.4);
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  width: 400px;
  max-width: 90vw;
}

.modal-content h3 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.modal-row {
  display: flex;
  align-items: center;
}

.modal-row label {
  width: 70px;
  font-size: 14px;
  color: #666;
}

.modal-row input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.code-wrapper {
  flex: 1;
  display: flex;
  gap: 10px;
}

.code-wrapper input {
  flex: 1;
}

.send-btn {
  padding: 10px 15px;
  background: #7c5cff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 25px;
}

.cancel-btn {
  padding: 10px 30px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.confirm-btn {
  padding: 10px 30px;
  background: #7c5cff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.confirm-btn:hover {
  background: #6a4de0;
}
</style>
