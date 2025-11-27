<template>
  <div class="profile-page">
    <!-- 背景图片 -->
    <div class="profile-background">
      <img src="../../image/wallhaven-9oo2k1.jpg" alt="背景图" class="bg-image" />
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
  </div>
</template>

<script>
import API_BASE_URL from '@/config/api'

export default {
  name: 'ProfilePage',
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
      timer: null
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
        const response = await fetch(`${API_BASE_URL}/api/user/info`, {
          method: 'GET',
          credentials: 'include'
        })
        const result = await response.json()

        if (result.code === 200 && result.data) {
          this.userInfo = {
            id: result.data.id,
            username: result.data.username,
            email: result.data.email,
            gender: result.data.gender || 0,
            avatar: result.data.avatar || this.defaultAvatar,
            bio: result.data.bio || ''
          }
          this.originalUsername = result.data.username // 保存原始用户名
        } else {
          alert('请先登录')
          this.$router.push('/login')
        }
      } catch (error) {
        console.error('获取用户信息失败：', error)
        alert('获取用户信息失败')
        this.$router.push('/login')
      }
    },
    async checkUsername() {
      // 如果用户名没变或为空，不检查
      if (!this.userInfo.username || this.userInfo.username === this.originalUsername) {
        this.usernameError = ''
        this.usernameOk = false
        return true
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/user/checkUsername?username=${encodeURIComponent(this.userInfo.username)}`, {
          method: 'GET',
          credentials: 'include'
        })
        const result = await response.json()

        if (result.data === true) {
          // 用户名已存在
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
      // 先检查用户名
      if (this.userInfo.username !== this.originalUsername) {
        const isValid = await this.checkUsername()
        if (!isValid) {
          return
        }
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/user/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            username: this.userInfo.username,
            gender: this.userInfo.gender,
            bio: this.userInfo.bio
          })
        })
        const result = await response.json()

        if (result.code === 200) {
          alert('保存成功')
          this.originalUsername = this.userInfo.username // 更新原始用户名
          this.usernameOk = false
          // 更新本地存储
          localStorage.setItem('user', JSON.stringify(result.data))
        } else {
          alert(result.message || '保存失败')
        }
      } catch (error) {
        console.error('保存失败：', error)
        alert('保存失败，请检查网络')
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

      // 创建 FormData
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch(`${API_BASE_URL}/api/user/uploadAvatar`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        })
        const result = await response.json()

        if (result.code === 200) {
          this.userInfo.avatar = result.data
        } else {
          alert(result.message || '上传失败')
        }
      } catch (error) {
        console.error('上传失败：', error)
        alert('上传失败，请检查网络')
      }

      // 清空 input，允许再次选择同一文件
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
        const response = await fetch(`${API_BASE_URL}/api/user/sendCode?email=${encodeURIComponent(this.newEmail)}`, {
          method: 'POST',
          credentials: 'include'
        })
        const result = await response.json()

        if (result.code === 200) {
          alert('验证码已发送')
          this.countdown = 60
          this.timer = setInterval(() => {
            this.countdown--
            if (this.countdown <= 0) {
              clearInterval(this.timer)
              this.timer = null
            }
          }, 1000)
        } else {
          alert(result.message || '发送失败')
        }
      } catch (error) {
        alert('发送失败，请检查网络')
      }
    },
    async confirmEmailChange() {
      if (!this.newEmail || !this.emailCode) {
        alert('请填写完整信息')
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/user/updateEmail`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            email: this.newEmail,
            code: this.emailCode
          })
        })
        const result = await response.json()

        if (result.code === 200) {
          alert('邮箱修改成功')
          this.userInfo.email = this.newEmail
          this.showEmailModal = false
          this.newEmail = ''
          this.emailCode = ''
        } else {
          alert(result.message || '修改失败')
        }
      } catch (error) {
        alert('修改失败，请检查网络')
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
