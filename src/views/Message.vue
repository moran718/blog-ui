<template>
  <div class="message-page">
    <!-- 弹幕欢迎区域 -->
    <div class="danmaku-welcome" v-show="!showMessageList">
      <!-- 全屏背景图 -->
      <div class="page-background">
        <img src="../../image/wallhaven-mlldj8.jpg" alt="背景图" class="bg-image" />
      </div>

      <!-- 导航栏 -->
      <NavBar />

      <!-- 弹幕容器 -->
      <div class="danmaku-container" ref="danmakuContainer">
        <div v-for="danmaku in danmakuList" :key="danmaku.id" class="danmaku-item" :style="danmaku.style"
          :class="{ 'danmaku-liked': danmaku.liked }" @mouseenter="pauseDanmaku(danmaku)"
          @mouseleave="resumeDanmaku(danmaku)" @click="toggleLike(danmaku)">
          <img :src="danmaku.avatar" alt="头像" class="danmaku-avatar" />
          <span class="danmaku-text">{{ danmaku.content }}</span>
          <span class="danmaku-like">
            <span class="like-icon">{{ danmaku.liked ? '❤️' : '🤍' }}</span>
            <span class="like-count">{{ danmaku.likes }}</span>
          </span>
        </div>
      </div>

      <!-- 中间输入区域 -->
      <div class="input-section">
        <div class="input-title">弹幕</div>
        <div class="input-wrapper">
          <input type="text" v-model="inputContent" class="danmaku-input" placeholder="留下点什么吧~"
            @keyup.enter="sendDanmaku" maxlength="50" />
          <button class="send-btn" @click="sendDanmaku">发射</button>
        </div>
      </div>

      <!-- 向下滑动提示 -->
      <div class="scroll-hint" @click="scrollToMessageList">
        <span class="hint-text">向下滑动查看留言</span>
        <span class="hint-arrow">↓</span>
      </div>
    </div>

    <!-- 留言列表区域 -->
    <div class="message-list-section" v-show="showMessageList">
      <!-- 背景 -->
      <div class="message-list-bg">
        <img src="../../image/wallhaven-mlldj8.jpg" alt="背景图" class="bg-image" />
      </div>

      <!-- 小火箭 -->
      <div class="rocket-btn" @click="scrollToDanmaku">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
          <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z">
          </path>
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
        </svg>
      </div>

      <!-- 留言内容区 -->
      <div class="message-content-wrapper">
        <!-- 留言输入框 -->
        <div class="message-box">
          <div class="message-header">
            <span class="message-title">📝 留言</span>
          </div>
          <div class="message-input-area decorated-input-area">
            <textarea v-model="messageText" class="message-textarea decorated-textarea" placeholder="写下点什么..."
              rows="4"></textarea>
            <!-- 已上传图片预览 -->
            <div class="uploaded-images" v-if="uploadedImages.length">
              <div class="uploaded-image-item" v-for="(img, index) in uploadedImages" :key="index">
                <img :src="img" alt="上传图片" />
                <span class="remove-image" @click="removeImage(index)">×</span>
              </div>
            </div>
          </div>
          <div class="message-toolbar">
            <div class="toolbar-left">
              <span class="toolbar-btn emoji-btn" @click="toggleEmojiPicker">😊</span>
              <span class="toolbar-btn image-btn" @click="triggerImageUpload">🖼️</span>
              <input type="file" ref="imageInput" accept="image/*" style="display: none" @change="handleImageUpload" />
            </div>
            <button class="submit-btn" @click="submitMessage">提交</button>
          </div>
          <!-- 表情选择器 -->
          <div class="emoji-picker" v-if="showEmojiPicker">
            <span class="emoji-item" v-for="emoji in emojis" :key="emoji" @click="insertEmoji(emoji)">{{ emoji }}</span>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comments-section">
          <div class="comments-header">
            <span>Comments</span>
            <span class="comments-divider">|</span>
            <span>{{ totalMessages }}条留言</span>
          </div>
          <div class="comments-list">
            <div class="comment-item" v-for="msg in messageList" :key="msg.id">
              <img :src="msg.user.avatar" alt="头像" class="comment-avatar" />
              <div class="comment-body">
                <div class="comment-user">
                  <span class="user-name">{{ msg.user.name }}</span>
                  <span class="user-level" :style="{ background: getLevelColor(msg.user.level) }">
                    LV{{ msg.user.level }}
                  </span>
                  <span class="user-title" v-if="msg.user.title"
                    :style="{ borderColor: getTitleColor(msg.user.title) }">
                    {{ msg.user.title }}
                  </span>
                </div>
                <div class="comment-date">{{ msg.date }}</div>
                <div class="comment-content">{{ msg.content }}</div>
                <!-- 图片显示 -->
                <div class="comment-images" v-if="msg.images && msg.images.length">
                  <img v-for="(img, idx) in msg.images" :key="idx" :src="img" class="comment-image" />
                </div>
              </div>
              <button class="reply-btn" @click="openReplyBox(msg.id)">回复</button>

              <!-- 回复输入框 -->
              <div class="reply-input-box" v-if="showReplyBox[msg.id]">
                <div class="reply-input-header">
                  <span>回复 @{{ msg.user.name }}</span>
                  <span class="close-reply" @click="closeReplyBox(msg.id)">×</span>
                </div>
                <div class="decorated-input-area small">
                  <textarea v-model="replyContent[msg.id]" class="reply-textarea decorated-textarea small"
                    placeholder="写下你的回复..." rows="3"></textarea>
                </div>
                <div class="reply-toolbar">
                  <div class="toolbar-left">
                    <span class="toolbar-btn emoji-btn" @click="toggleReplyEmoji(msg.id)">😊</span>
                  </div>
                  <button class="submit-reply-btn" @click="submitReply(msg.id)">发送</button>
                </div>
                <div class="emoji-picker reply-emoji-picker" v-if="showReplyEmoji[msg.id]">
                  <span class="emoji-item" v-for="emoji in emojis" :key="emoji"
                    @click="insertReplyEmoji(msg.id, emoji)">{{ emoji }}</span>
                </div>
              </div>

              <!-- 回复列表 -->
              <div class="reply-list" v-if="msg.replies && msg.replies.length">
                <div class="reply-item" v-for="reply in msg.replies" :key="reply.id">
                  <img :src="reply.user.avatar" alt="头像" class="reply-avatar" />
                  <div class="reply-body">
                    <div class="reply-user">
                      <span class="user-name">{{ reply.user.name }}</span>
                      <span class="user-level" :style="{ background: getLevelColor(reply.user.level) }">
                        LV{{ reply.user.level }}
                      </span>
                    </div>
                    <div class="reply-date">{{ reply.date }}</div>
                    <div class="reply-content">
                      <span class="reply-to" v-if="reply.replyTo">@{{ reply.replyTo }} </span>
                      {{ reply.content }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页组件 -->
          <AppPagination :current-page="currentPage" :total-pages="totalPages" :has-next="hasNext" :has-prev="hasPrev"
            @page-change="changePage" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import AppPagination from '@/components/Pagination.vue'
import API_BASE_URL from '@/config/api'

export default {
  name: 'MessagePage',
  components: {
    NavBar,
    AppPagination
  },
  data() {
    return {
      // 用户信息
      currentUser: null,
      // 弹幕相关
      inputContent: '',
      danmakuList: [],
      danmakuId: 0,
      colors: [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
        '#dfe6e9', '#fd79a8', '#a29bfe', '#6c5ce7', '#00b894',
        '#e17055', '#74b9ff', '#ff7675', '#55efc4', '#81ecec'
      ],
      mockMessages: [],
      // 页面切换
      showMessageList: false,
      // 留言相关
      messageText: '',
      uploadedImages: [],
      showEmojiPicker: false,
      messageList: [],
      showReplyBox: {},
      showReplyEmoji: {},
      replyContent: {},
      // 分页相关
      currentPage: 1,
      pageSize: 5,
      totalMessages: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
      emojis: [
        '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
        '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗',
        '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥',
        '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜',
        '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '🙁',
        '👍', '👎', '👏', '🙌', '❤️', '🧡', '💛', '💚', '💙', '💜'
      ]
    }
  },
  mounted() {
    this.loadUserInfo()
    this.loadMessages()
    this.loadMessageList()
    this.setupScrollListener()
  },
  beforeDestroy() {
    // 清除所有弹幕的动画
    this.danmakuList.forEach(d => {
      if (d.timer) clearTimeout(d.timer)
    })
    window.removeEventListener('wheel', this.handleWheel)
  },
  methods: {
    async loadUserInfo() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/info`, {
          credentials: 'include'
        })
        const result = await response.json()
        if (result.code === 200 && result.data) {
          this.currentUser = result.data
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },
    async loadMessages() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/message/list`, {
          credentials: 'include'
        })
        const result = await response.json()
        if (result.code === 200 && result.data) {
          this.mockMessages = result.data
          // 初始化弹幕
          this.initDanmaku()
        }
      } catch (error) {
        console.error('加载弹幕失败:', error)
      }
    },
    initDanmaku() {
      // 逐个添加弹幕，形成错落效果
      this.mockMessages.forEach((msg, index) => {
        setTimeout(() => {
          this.addDanmaku(msg.content, msg.avatar, msg.likes || 0, msg.id)
        }, index * 500)
      })
    },
    getRandomColor() {
      return this.colors[Math.floor(Math.random() * this.colors.length)]
    },
    getRandomTop() {
      // 随机高度，避开中间输入框区域 (40%-60%)
      const zones = [
        { min: 5, max: 35 },   // 上部区域
        { min: 65, max: 90 }   // 下部区域
      ]
      const zone = zones[Math.floor(Math.random() * zones.length)]
      return zone.min + Math.random() * (zone.max - zone.min)
    },
    addDanmaku(content, avatar, likes = 0, msgId = null) {
      const id = this.danmakuId++
      const duration = 15 + Math.random() * 10 // 15-25秒
      const top = this.getRandomTop()
      const color = this.getRandomColor()

      const danmaku = {
        id,
        msgId: msgId || id, // 原始消息ID，用于点赞
        content,
        avatar: avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + id,
        style: {
          top: top + '%',
          backgroundColor: color,
          animationDuration: duration + 's'
        },
        paused: false,
        duration,
        timer: null,
        likes: likes,
        liked: false
      }

      this.danmakuList.push(danmaku)

      // 动画结束后移除并重新添加
      danmaku.timer = setTimeout(() => {
        const currentLikes = danmaku.likes
        const currentLiked = danmaku.liked
        this.removeDanmaku(id)
        // 重新添加这条弹幕，保留点赞状态
        setTimeout(() => {
          this.addDanmakuWithState(content, avatar, currentLikes, msgId, currentLiked)
        }, Math.random() * 5000)
      }, duration * 1000)
    },
    addDanmakuWithState(content, avatar, likes, msgId, liked) {
      const id = this.danmakuId++
      const duration = 15 + Math.random() * 10
      const top = this.getRandomTop()
      const color = this.getRandomColor()

      const danmaku = {
        id,
        msgId: msgId || id,
        content,
        avatar: avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + id,
        style: {
          top: top + '%',
          backgroundColor: color,
          animationDuration: duration + 's'
        },
        paused: false,
        duration,
        timer: null,
        likes: likes,
        liked: liked
      }

      this.danmakuList.push(danmaku)

      danmaku.timer = setTimeout(() => {
        const currentLikes = danmaku.likes
        const currentLiked = danmaku.liked
        this.removeDanmaku(id)
        setTimeout(() => {
          this.addDanmakuWithState(content, avatar, currentLikes, msgId, currentLiked)
        }, Math.random() * 5000)
      }, duration * 1000)
    },
    removeDanmaku(id) {
      const index = this.danmakuList.findIndex(d => d.id === id)
      if (index > -1) {
        if (this.danmakuList[index].timer) {
          clearTimeout(this.danmakuList[index].timer)
        }
        this.danmakuList.splice(index, 1)
      }
    },
    pauseDanmaku(danmaku) {
      danmaku.paused = true
      this.$set(danmaku.style, 'animationPlayState', 'paused')
    },
    resumeDanmaku(danmaku) {
      danmaku.paused = false
      this.$set(danmaku.style, 'animationPlayState', 'running')
    },
    toggleLike(danmaku) {
      if (danmaku.liked) {
        danmaku.liked = false
        danmaku.likes--
      } else {
        danmaku.liked = true
        danmaku.likes++
      }
      // 可选：发送点赞请求到服务器
      // this.sendLikeToServer(danmaku.msgId, danmaku.liked)
    },
    async sendDanmaku() {
      if (!this.inputContent.trim()) return

      // 检查是否登录
      if (!this.currentUser) {
        alert('请先登录后再发送弹幕')
        return
      }

      const content = this.inputContent.trim()
      this.inputContent = ''

      // 使用当前用户头像
      const avatar = this.currentUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + this.currentUser.id

      // 立即在页面上显示弹幕
      this.addDanmaku(content, avatar, 0)

      // 发送到服务器
      try {
        await fetch(`${API_BASE_URL}/api/message/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ content })
        })
      } catch (error) {
        console.error('发送弹幕失败:', error)
      }
    },
    // 页面切换相关
    setupScrollListener() {
      window.addEventListener('wheel', this.handleWheel, { passive: false })
    },
    handleWheel(e) {
      if (!this.showMessageList && e.deltaY > 0) {
        // 在弹幕页面向下滚动
        e.preventDefault()
        this.scrollToMessageList()
      } else if (this.showMessageList && e.deltaY < 0 && window.scrollY <= 0) {
        // 在留言页面顶部向上滚动
        e.preventDefault()
        this.scrollToDanmaku()
      }
    },
    scrollToMessageList() {
      this.showMessageList = true
      this.$nextTick(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    },
    scrollToDanmaku() {
      this.showMessageList = false
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    // 留言列表相关
    async loadMessageList(page = 1) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/message/comments/page?page=${page}&pageSize=${this.pageSize}`, {
          credentials: 'include'
        })
        const result = await response.json()
        if (result.code === 200 && result.data) {
          this.messageList = result.data.list
          this.currentPage = result.data.page
          this.totalPages = result.data.totalPages
          this.totalMessages = result.data.total
          this.hasNext = result.data.hasNext
          this.hasPrev = result.data.hasPrev
        }
      } catch (error) {
        console.error('加载留言列表失败:', error)
      }
    },
    // 切换页码
    changePage(page) {
      if (page < 1 || page > this.totalPages || page === this.currentPage) return
      this.loadMessageList(page)
      // 滚动到评论区顶部
      this.$nextTick(() => {
        const commentsSection = document.querySelector('.comments-section')
        if (commentsSection) {
          commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    },
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker
    },
    insertEmoji(emoji) {
      this.messageText += emoji
    },
    triggerImageUpload() {
      this.$refs.imageInput.click()
    },
    async handleImageUpload(e) {
      const file = e.target.files[0]
      if (!file) return

      // 上传图片到服务器
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch(`${API_BASE_URL}/api/essay/uploadImage`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        })
        const result = await response.json()
        if (result.code === 200 && result.data) {
          this.uploadedImages.push(result.data)
        } else if (result.code === 401) {
          alert('请先登录')
        } else {
          alert('图片上传失败')
        }
      } catch (error) {
        console.error('上传图片失败:', error)
        alert('图片上传失败')
      }
      // 清空input，允许重复选择同一文件
      e.target.value = ''
    },
    removeImage(index) {
      this.uploadedImages.splice(index, 1)
    },
    async submitMessage() {
      if (!this.messageText.trim() && !this.uploadedImages.length) {
        alert('请输入留言内容或上传图片')
        return
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/message/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            content: this.messageText,
            images: this.uploadedImages
          })
        })
        const result = await response.json()
        if (result.code === 200) {
          // 提交成功后刷新第一页
          this.loadMessageList(1)
          this.messageText = ''
          this.uploadedImages = []
          this.showEmojiPicker = false
        } else if (result.code === 401) {
          alert('请先登录')
        }
      } catch (error) {
        console.error('提交留言失败:', error)
        this.messageText = ''
        this.uploadedImages = []
        this.showEmojiPicker = false
      }
    },
    openReplyBox(msgId) {
      this.$set(this.showReplyBox, msgId, true)
    },
    closeReplyBox(msgId) {
      this.$set(this.showReplyBox, msgId, false)
      this.$set(this.replyContent, msgId, '')
    },
    toggleReplyEmoji(msgId) {
      this.$set(this.showReplyEmoji, msgId, !this.showReplyEmoji[msgId])
    },
    insertReplyEmoji(msgId, emoji) {
      const current = this.replyContent[msgId] || ''
      this.$set(this.replyContent, msgId, current + emoji)
    },
    async submitReply(msgId) {
      const content = this.replyContent[msgId]
      if (!content || !content.trim()) {
        alert('请输入回复内容')
        return
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/message/reply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            messageId: msgId,
            content: content
          })
        })
        const result = await response.json()
        if (result.code === 200) {
          const msg = this.messageList.find(m => m.id === msgId)
          if (msg) {
            if (!msg.replies) msg.replies = []
            msg.replies.push(result.data)
          }
          this.closeReplyBox(msgId)
        }
      } catch (error) {
        console.error('回复失败:', error)
        // 模拟回复成功
        const msg = this.messageList.find(m => m.id === msgId)
        if (msg) {
          if (!msg.replies) msg.replies = []
          msg.replies.push({
            id: Date.now(),
            user: { name: '游客', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest', level: 1 },
            date: new Date().toISOString().split('T')[0],
            content: content
          })
        }
        this.closeReplyBox(msgId)
      }
    },
    getLevelColor(level) {
      const colors = ['#95a5a6', '#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6']
      return colors[Math.min(level, colors.length - 1)]
    },
    getTitleColor(title) {
      const titleColors = {
        '真仙': '#e74c3c',
        '炼虚': '#9b59b6',
        '化神': '#3498db',
        '元婴': '#2ecc71'
      }
      return titleColors[title] || '#95a5a6'
    }
  }
}
</script>

<style scoped>
.message-page {
  width: 100vw;
  min-height: 100vh;
  position: relative;
}

/* 弹幕欢迎区域 */
.danmaku-welcome {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 全屏背景 */
.page-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}

.page-background .bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 弹幕容器 */
.danmaku-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
  overflow: hidden;
}

/* 向下滑动提示 */
.scroll-hint {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  animation: hintBounce 2s ease-in-out infinite;
}

.hint-text {
  color: #fff;
  font-size: 14px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  margin-bottom: 5px;
}

.hint-arrow {
  color: #fff;
  font-size: 24px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

@keyframes hintBounce {

  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }

  50% {
    transform: translateX(-50%) translateY(10px);
  }
}

/* 弹幕项 */
.danmaku-item {
  position: absolute;
  right: -300px;
  display: flex;
  align-items: center;
  padding: 6px 15px 6px 6px;
  border-radius: 25px;
  white-space: nowrap;
  pointer-events: auto;
  cursor: pointer;
  animation: danmakuMove linear forwards;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.danmaku-item:hover {
  transform: scale(1.05);
  z-index: 100;
}

.danmaku-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-right: 8px;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.danmaku-text {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.danmaku-like {
  display: flex;
  align-items: center;
  margin-left: 10px;
  padding-left: 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}

.like-icon {
  font-size: 14px;
  transition: transform 0.2s ease;
}

.danmaku-item:hover .like-icon {
  transform: scale(1.2);
}

.like-count {
  color: #fff;
  font-size: 12px;
  margin-left: 4px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.danmaku-liked {
  box-shadow: 0 2px 15px rgba(255, 105, 180, 0.5);
}

@keyframes danmakuMove {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(calc(-100vw - 300px));
  }
}

/* 中间输入区域 */
.input-section {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-title {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 15px;
  letter-spacing: 8px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 8px 8px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.danmaku-input {
  width: 300px;
  border: none;
  outline: none;
  font-size: 15px;
  background: transparent;
  color: #333;
}

.danmaku-input::placeholder {
  color: #999;
}

.send-btn {
  padding: 10px 25px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.5);
}

/* 留言列表区域 */
.message-list-section {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

.message-list-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}

.message-list-bg .bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(5px);
}

/* 小火箭 */
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
  animation: none;
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

.message-content-wrapper {
  position: relative;
  z-index: 10;
  max-width: 800px;
  margin: 0 auto;
  padding: 80px 20px 40px;
}

/* 留言输入框 */
.message-box {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.message-header {
  margin-bottom: 15px;
}

.message-title {
  font-size: 18px;
  font-weight: bold;
  color: #ff9800;
}

.message-input-area {
  margin-bottom: 15px;
}

.message-textarea {
  width: 100%;
  font-family: inherit;
}

.uploaded-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.uploaded-image-item {
  position: relative;
  width: 80px;
  height: 80px;
}

.uploaded-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background: #ff4444;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
}

.message-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  gap: 10px;
}

.toolbar-btn {
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.toolbar-btn:hover {
  transform: scale(1.2);
}

.submit-btn {
  padding: 8px 25px;
  background: linear-gradient(135deg, #ff9800, #ff5722);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);
}

.emoji-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 15px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.emoji-item {
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background 0.2s;
}

.emoji-item:hover {
  background: #eee;
}

/* 评论区域 */
.comments-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.comments-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.comments-divider {
  color: #ddd;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 10px;
  position: relative;
  flex-wrap: wrap;
}

.comment-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  min-width: 200px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 5px;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.user-level {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: #fff;
}

.user-title {
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 4px;
  font-size: 11px;
}

.comment-date {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.comment-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.comment-image {
  max-width: 150px;
  max-height: 150px;
  border-radius: 8px;
  cursor: pointer;
}

.reply-btn {
  position: absolute;
  right: 15px;
  top: 15px;
  background: linear-gradient(135deg, #ff9800, #ff5722);
  color: #fff;
  border: none;
  padding: 5px 15px;
  border-radius: 5px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.reply-btn:hover {
  transform: scale(1.05);
}

/* 回复输入框 */
.reply-input-box {
  width: 100%;
  margin-top: 15px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
}

.reply-input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
  color: #666;
}

.close-reply {
  cursor: pointer;
  font-size: 18px;
  color: #999;
}

.reply-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 6px;
  font-size: 13px;
  resize: none;
  outline: none;
  font-family: inherit;
}

.reply-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.submit-reply-btn {
  padding: 6px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 12px;
  cursor: pointer;
}

.reply-emoji-picker {
  margin-top: 10px;
}

/* 回复列表 */
.reply-list {
  width: 100%;
  margin-top: 15px;
  margin-left: 57px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reply-item {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
}

.reply-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.reply-body {
  flex: 1;
}

.reply-user {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.reply-date {
  font-size: 11px;
  color: #999;
  margin-bottom: 5px;
}

.reply-content {
  font-size: 13px;
  line-height: 1.5;
  color: #333;
}

.reply-to {
  color: #667eea;
  font-weight: 500;
}
</style>
