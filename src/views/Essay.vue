<template>
  <div class="essay-page" :class="{ 'dark-theme': isDarkTheme }">
    <!-- 全屏背景图 -->
    <div class="page-background">
      <img :src="bgImage" alt="背景图" class="bg-image" @load="handleBgLoad" @error="handleBgError" />
    </div>

    <!-- 导航栏 -->
    <NavBar />

    <!-- 全屏欢迎区域 -->
    <div class="welcome-section" v-show="!showContent">
      <div class="welcome-content">
        <div class="welcome-title">
          <span class="title-icon">📝</span>
          <span>随笔随心</span>
        </div>
        <p class="welcome-subtitle">随心所悦，阅读改变生活</p>
      </div>
      <!-- 向下滚动按钮 -->
      <div class="scroll-down-btn" @click="scrollToContent">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-section" v-show="showContent" ref="contentSection">
      <!-- 页面标题 - 用于导航栏隐藏检测 -->
      <div class="page-header" id="essay-content-header">
        <div class="header-title">
          <span class="title-icon">📝</span>
          <span>随笔随心</span>
        </div>
        <p class="header-subtitle">随心所悦，阅读改变生活</p>
      </div>

      <!-- 随笔列表 -->
      <div class="essay-container">
        <!-- 加载状态 -->
        <div class="loading-box" v-if="loading">
          <span class="loading-icon">⏳</span>
          <span>加载中...</span>
        </div>
        <!-- 空状态 -->
        <div class="empty-box" v-else-if="essays.length === 0">
          <span class="empty-icon">📝</span>
          <span>暂无随笔，快来发布第一条吧~</span>
        </div>
        <div class="essay-list" v-else>
          <div class="essay-card" v-for="essay in essays" :key="essay.id">
            <!-- 用户信息 -->
            <div class="essay-user">
              <img :src="formatAvatar(essay.user.avatar)" alt="头像" class="user-avatar" />
              <div class="user-info">
                <span class="user-name">{{ essay.user.name }}</span>
                <span class="user-level"
                  :style="{ background: essay.user.levelColor || getLevelColor(essay.user.level) }">
                  <span class="level-icon">{{ essay.user.levelIcon || '' }}</span>
                  LV{{ essay.user.level }}
                </span>
                <span class="user-title" :style="{ borderColor: getTitleColor(essay.user.title) }">
                  {{ essay.user.title }}
                </span>
              </div>
            </div>

            <!-- 随笔内容 -->
            <div class="essay-content">
              <p class="essay-text">{{ essay.content }}</p>
              <div class="essay-images" v-if="essay.images && essay.images.length">
                <img v-for="(img, index) in essay.images" :key="index" :src="getResourceUrl(img)" alt="图片"
                  class="essay-image" @click="openPreview(getResourceUrl(img))" />
              </div>
              <div class="essay-videos" v-if="essay.videos && essay.videos.length">
                <video v-for="(video, index) in essay.videos" :key="index" :src="getResourceUrl(video)" controls
                  class="essay-video" preload="metadata"></video>
              </div>
            </div>

            <!-- 底部信息 -->
            <div class="essay-footer">
              <span class="essay-date">{{ essay.date }}</span>
              <div class="essay-actions">
                <span class="action-item comment-toggle" :class="{ active: expandedComments[essay.id] }"
                  @click="toggleComments(essay.id)">
                  <span class="action-count">{{ essay.comments }}</span>
                  <span class="action-icon">💬</span>
                </span>
                <span class="action-item message-toggle" :class="{ active: showMessageBox[essay.id] }"
                  @click="toggleMessageBox(essay.id)">
                  <span class="action-icon">📑</span>
                </span>
                <span class="action-item">
                  <span class="action-icon">🔗</span>
                </span>
              </div>
            </div>

            <!-- 留言输入框 -->
            <div class="message-box" v-if="showMessageBox[essay.id]">
              <div class="message-header">
                <span class="message-title">📝 留言</span>
              </div>
              <div class="message-input-area decorated-input-area">
                <textarea v-model="messageContent[essay.id]" class="message-textarea decorated-textarea"
                  placeholder="写下点什么..." rows="4"></textarea>
                <!-- 已上传图片预览 -->
                <div class="uploaded-images" v-if="uploadedImages[essay.id] && uploadedImages[essay.id].length">
                  <div class="uploaded-image-item" v-for="(img, index) in uploadedImages[essay.id]" :key="index">
                    <img :src="getResourceUrl(img)" alt="上传图片" />
                    <span class="remove-image" @click="removeImage(essay.id, index)">×</span>
                  </div>
                </div>
              </div>
              <div class="message-toolbar">
                <div class="toolbar-left">
                  <span class="toolbar-btn emoji-btn" @click="toggleEmojiPicker(essay.id)">😊</span>
                  <span class="toolbar-btn image-btn" @click="triggerImageUpload(essay.id)">🖼️</span>
                  <input type="file" :ref="'imageInput' + essay.id" accept="image/*" style="display: none"
                    @change="handleImageUpload($event, essay.id)" />
                </div>
                <button class="submit-btn" @click="submitMessage(essay.id)">提交</button>
              </div>
              <!-- 表情选择器 -->
              <div class="emoji-picker" v-if="showEmojiPicker[essay.id]">
                <span class="emoji-item" v-for="emoji in emojis" :key="emoji" @click="insertEmoji(essay.id, emoji)">{{
                  emoji }}</span>
              </div>
            </div>

            <!-- 评论区域 -->
            <div class="comments-section"
              v-if="expandedComments[essay.id] && (essay.commentList && essay.commentList.length || commentPagination[essay.id])">
              <div class="comments-header">
                <span>评论</span>
                <span class="comments-divider">|</span>
                <span>{{ commentPagination[essay.id] ? commentPagination[essay.id].total : essay.comments }}条留言</span>
              </div>
              <div class="comments-list">
                <div class="comment-item" v-for="comment in essay.commentList" :key="comment.id">
                  <img :src="formatAvatar(comment.user.avatar)" alt="头像" class="comment-avatar" />
                  <div class="comment-body">
                    <div class="comment-user">
                      <span class="user-name">{{ comment.user.name }}</span>
                      <span class="user-level"
                        :style="{ background: comment.user.levelColor || getLevelColor(comment.user.level) }">
                        <span class="level-icon">{{ comment.user.levelIcon || '' }}</span>
                        LV{{ comment.user.level }}
                      </span>
                      <span class="user-title" :style="{ borderColor: getTitleColor(comment.user.title) }">
                        {{ comment.user.title }}
                      </span>
                    </div>
                    <div class="comment-date">{{ comment.date }}</div>
                    <div class="comment-content">{{ comment.content }}</div>
                    <!-- 评论图片 -->
                    <div class="comment-images" v-if="comment.images && comment.images.length">
                      <img v-for="(img, idx) in comment.images" :key="idx" :src="getResourceUrl(img)" alt="评论图片" class="comment-image"
                        @click="openPreview(getResourceUrl(img))" />
                    </div>

                    <!-- 回复输入框 -->
                    <div class="reply-input-box" v-if="showReplyBox[essay.id + '-' + comment.id]">
                      <div class="reply-input-header">
                        <span>回复 @{{ comment.user.name }}</span>
                        <span class="close-reply" @click="closeReplyBox(essay.id, comment.id)">×</span>
                      </div>
                      <div class="decorated-input-area small">
                        <textarea v-model="replyContent[essay.id + '-' + comment.id]"
                          class="reply-textarea decorated-textarea small" placeholder="写下你的回复..." rows="3"></textarea>
                      </div>
                      <!-- 已上传图片预览 -->
                      <div class="uploaded-images reply-uploaded-images"
                        v-if="replyImages[essay.id + '-' + comment.id] && replyImages[essay.id + '-' + comment.id].length">
                        <div class="uploaded-image-item"
                          v-for="(img, index) in replyImages[essay.id + '-' + comment.id]" :key="index">
                          <img :src="getResourceUrl(img)" alt="上传图片" />
                          <span class="remove-image" @click="removeReplyImage(essay.id, comment.id, index)">×</span>
                        </div>
                      </div>
                      <div class="reply-input-toolbar">
                        <div class="toolbar-left">
                          <span class="toolbar-btn" @click="toggleReplyEmoji(essay.id, comment.id)">😊</span>
                          <span class="toolbar-btn" @click="triggerReplyImageUpload(essay.id, comment.id)">🖼️</span>
                          <input type="file" :ref="'replyImageInput' + essay.id + '-' + comment.id" accept="image/*"
                            style="display: none" @change="handleReplyImageUpload($event, essay.id, comment.id)" />
                        </div>
                        <button class="submit-reply-btn"
                          @click="submitReply(essay.id, comment.id, comment.user.name)">回复</button>
                      </div>
                      <div class="emoji-picker reply-emoji-picker" v-if="showReplyEmoji[essay.id + '-' + comment.id]">
                        <span class="emoji-item" v-for="emoji in emojis" :key="emoji"
                          @click="insertReplyEmoji(essay.id, comment.id, emoji)">{{ emoji }}</span>
                      </div>
                    </div>

                    <!-- 嵌套回复 -->
                    <div class="reply-list" v-if="comment.replies && comment.replies.length">
                      <div class="reply-item" v-for="reply in comment.replies" :key="reply.id">
                        <img :src="formatAvatar(reply.user.avatar)" alt="头像" class="reply-avatar" />
                        <div class="reply-body">
                          <div class="comment-user">
                            <span class="user-name">{{ reply.user.name }}</span>
                            <span class="user-level"
                              :style="{ background: reply.user.levelColor || getLevelColor(reply.user.level) }">
                              <span class="level-icon">{{ reply.user.levelIcon || '' }}</span>
                              LV{{ reply.user.level }}
                            </span>
                            <span class="user-title" :style="{ borderColor: getTitleColor(reply.user.title) }">
                              {{ reply.user.title }}
                            </span>
                          </div>
                          <div class="comment-date">{{ reply.date }}</div>
                          <div class="comment-content">
                            <span class="reply-to" v-if="reply.replyTo">@{{ reply.replyTo }} </span>
                            {{ reply.content }}
                          </div>
                          <!-- 回复图片 -->
                          <div class="reply-images" v-if="reply.images && reply.images.length">
                            <img v-for="(img, idx) in reply.images" :key="idx" :src="getResourceUrl(img)" alt="回复图片" class="reply-image"
                              @click="openPreview(getResourceUrl(img))" />
                          </div>

                          <!-- 三级回复输入框 -->
                          <div class="reply-input-box"
                            v-if="showReplyBox[essay.id + '-' + comment.id + '-' + reply.id]">
                            <div class="reply-input-header">
                              <span>回复 @{{ reply.user.name }}</span>
                              <span class="close-reply" @click="closeReplyBox(essay.id, comment.id, reply.id)">×</span>
                            </div>
                            <div class="decorated-input-area small">
                              <textarea v-model="replyContent[essay.id + '-' + comment.id + '-' + reply.id]"
                                class="reply-textarea decorated-textarea small" placeholder="写下你的回复..."
                                rows="2"></textarea>
                            </div>
                            <!-- 已上传图片预览 -->
                            <div class="uploaded-images reply-uploaded-images"
                              v-if="replyImages[essay.id + '-' + comment.id + '-' + reply.id] && replyImages[essay.id + '-' + comment.id + '-' + reply.id].length">
                              <div class="uploaded-image-item"
                                v-for="(img, index) in replyImages[essay.id + '-' + comment.id + '-' + reply.id]"
                                :key="index">
                                <img :src="getResourceUrl(img)" alt="上传图片" />
                                <span class="remove-image"
                                  @click="removeReplyImage(essay.id, comment.id, index, reply.id)">×</span>
                              </div>
                            </div>
                            <div class="reply-input-toolbar">
                              <div class="toolbar-left">
                                <span class="toolbar-btn"
                                  @click="toggleReplyEmoji(essay.id, comment.id, reply.id)">😊</span>
                                <span class="toolbar-btn"
                                  @click="triggerReplyImageUpload(essay.id, comment.id, reply.id)">🖼️</span>
                                <input type="file"
                                  :ref="'replyImageInput' + essay.id + '-' + comment.id + '-' + reply.id"
                                  accept="image/*" style="display: none"
                                  @change="handleReplyImageUpload($event, essay.id, comment.id, reply.id)" />
                              </div>
                              <button class="submit-reply-btn"
                                @click="submitReply(essay.id, comment.id, reply.user.name, reply.id)">回复</button>
                            </div>
                            <div class="emoji-picker reply-emoji-picker"
                              v-if="showReplyEmoji[essay.id + '-' + comment.id + '-' + reply.id]">
                              <span class="emoji-item" v-for="emoji in emojis" :key="emoji"
                                @click="insertReplyEmoji(essay.id, comment.id, emoji, reply.id)">{{ emoji }}</span>
                            </div>
                          </div>
                        </div>
                        <button class="reply-btn" @click="openReplyBox(essay.id, comment.id, reply.id)">回复</button>
                      </div>
                    </div>
                  </div>
                  <button class="reply-btn" @click="openReplyBox(essay.id, comment.id)">
                    <span v-if="comment.replies && comment.replies.length">{{ comment.replies.length }}</span>
                    回复
                  </button>
                </div>
              </div>

              <!-- 评论分页 -->
              <AppPagination v-if="commentPagination[essay.id]" :current-page="commentPagination[essay.id].currentPage"
                :total-pages="commentPagination[essay.id].totalPages" :has-next="commentPagination[essay.id].hasNext"
                :has-prev="commentPagination[essay.id].hasPrev"
                @page-change="(page) => changeCommentPage(essay.id, page)" />
            </div>
          </div>

          <!-- 随笔分页 -->
          <AppPagination :current-page="currentPage" :total-pages="totalPages" :has-next="hasNext" :has-prev="hasPrev"
            @page-change="changeEssayPage" />
        </div>
      </div>

      <!-- 页脚 -->
      <Footer minimal />
    </div>

    <!-- 图片预览弹窗 -->
    <div class="image-preview-overlay" v-if="previewImage" @click="closePreview">
      <button class="close-preview-btn" @click.stop="closePreview">×</button>
      <img :src="previewImage" alt="预览图片" class="preview-image" @click.stop />
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import AppPagination from '@/components/Pagination.vue'
import Footer from '@/components/Footer.vue'
import { http, getResourceUrl } from '@/utils/request'
import { getRandomBg, getFallbackBg } from '@/utils/randomBg'
import { hideLoading } from '@/utils/pageLoader'

export default {
  name: 'EssayPage',
  components: {
    NavBar,
    AppPagination,
    Footer
  },
  data() {
    return {
      isDarkTheme: false,
      showContent: false,
      expandedComments: {},
      showMessageBox: {},
      showEmojiPicker: {},
      messageContent: {},
      uploadedImages: {},
      showReplyBox: {},
      showReplyEmoji: {},
      replyContent: {},
      replyImages: {},
      bgImage: '',
      emojis: [
        '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
        '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗',
        '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥',
        '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜',
        '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '🙁',
        '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩',
        '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '🥴',
        '😠', '😡', '🤬', '👍', '👎', '👏', '🙌', '👐', '🤲', '🤝',
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💯', '✨'
      ],
      essays: [],
      loading: false,
      // 随笔分页相关
      currentPage: 1,
      pageSize: 5,
      totalEssays: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
      // 评论分页相关（按随笔ID存储）
      commentPagination: {}, // { essayId: { currentPage, totalPages, hasNext, hasPrev, total } }
      commentPageSize: 5,
      // 图片预览
      previewImage: null
    }
  },
  mounted() {
    this.bgImage = getRandomBg('essay')
    this.checkTheme()
    this.loadEssays()
    this.setupScrollListener()
    // 超时保护
    this.loadingTimeout = setTimeout(() => {
      hideLoading()
    }, 8000)
  },
  beforeDestroy() {
    window.removeEventListener('wheel', this.handleWheel)
    window.removeEventListener('scroll', this.handleScroll)
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout)
    }
  },
  methods: {
    getResourceUrl(path) {
      return getResourceUrl(path)
    },
    formatAvatar(avatar) {
      if (!avatar) {
        return 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
      }
      if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
        return avatar
      }
      return getResourceUrl(avatar)
    },
    checkTheme() {
      this.isDarkTheme = document.body.classList.contains('dark-theme')
    },
    setupScrollListener() {
      window.addEventListener('wheel', this.handleWheel)
      window.addEventListener('scroll', this.handleScroll)
    },
    handleWheel(event) {
      // 向下滚动时显示内容
      if (!this.showContent && event.deltaY > 0) {
        this.scrollToContent()
      }
      // 在内容区域顶部向上滚动时返回背景图
      if (this.showContent && event.deltaY < 0 && window.scrollY <= 0) {
        this.scrollToWelcome()
      }
    },
    handleScroll() {
      // 当内容展示且滚动到顶部时，准备可以返回背景图
      // 此方法配合 wheel 事件使用
    },
    scrollToContent() {
      this.showContent = true
      this.$nextTick(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      })
    },
    scrollToWelcome() {
      this.showContent = false
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
      // 触发 scroll 事件让 NavBar 重新检测导航栏状态
      this.$nextTick(() => {
        window.dispatchEvent(new Event('scroll'))
      })
    },
    async loadEssays(page = 1) {
      this.loading = true
      try {
        const res = await http.get('/api/essay/list', { page, size: this.pageSize })
        if (res.data) {
          this.essays = res.data.list || []
          this.currentPage = res.data.page
          this.totalPages = res.data.totalPages
          this.totalEssays = res.data.total
          this.hasNext = res.data.hasNext
          this.hasPrev = res.data.hasPrev
        }
      } catch (error) {
        console.error('加载随笔失败:', error)
      } finally {
        this.loading = false
      }
    },
    changeEssayPage(page) {
      if (page < 1 || page > this.totalPages || page === this.currentPage) return
      this.loadEssays(page)
      // 滚动到随笔列表顶部
      this.$nextTick(() => {
        const header = document.getElementById('essay-content-header')
        if (header) {
          header.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    },
    toggleComments(essayId) {
      const isExpanding = !this.expandedComments[essayId]
      this.$set(this.expandedComments, essayId, isExpanding)
      // 展开时加载评论
      if (isExpanding && !this.commentPagination[essayId]) {
        this.loadEssayComments(essayId, 1)
      }
    },
    async loadEssayComments(essayId, page = 1) {
      try {
        const res = await http.get(`/api/essay/${essayId}/comments`, { page, pageSize: this.commentPageSize })
        if (res.data) {
          const essay = this.essays.find(e => e.id === essayId)
          if (essay) {
            this.$set(essay, 'commentList', res.data.list || [])
          }
          this.$set(this.commentPagination, essayId, {
            currentPage: res.data.page,
            totalPages: res.data.totalPages,
            total: res.data.total,
            hasNext: res.data.hasNext,
            hasPrev: res.data.hasPrev
          })
        }
      } catch (error) {
        console.error('加载评论失败:', error)
      }
    },
    changeCommentPage(essayId, page) {
      const pagination = this.commentPagination[essayId]
      if (!pagination || page < 1 || page > pagination.totalPages || page === pagination.currentPage) return
      this.loadEssayComments(essayId, page)
    },
    toggleMessageBox(essayId) {
      this.$set(this.showMessageBox, essayId, !this.showMessageBox[essayId])
      // 关闭留言框时也关闭表情选择器
      if (!this.showMessageBox[essayId]) {
        this.$set(this.showEmojiPicker, essayId, false)
      }
    },
    toggleEmojiPicker(essayId) {
      this.$set(this.showEmojiPicker, essayId, !this.showEmojiPicker[essayId])
    },
    insertEmoji(essayId, emoji) {
      const current = this.messageContent[essayId] || ''
      this.$set(this.messageContent, essayId, current + emoji)
    },
    triggerImageUpload(essayId) {
      const input = this.$refs['imageInput' + essayId]
      if (input) {
        if (Array.isArray(input)) {
          input[0].click()
        } else {
          input.click()
        }
      }
    },
    async handleImageUpload(event, essayId) {
      const file = event.target.files[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过 2MB')
        return
      }

      try {
        const res = await http.upload('/api/essay/uploadImage', file)
        if (!this.uploadedImages[essayId]) {
          this.$set(this.uploadedImages, essayId, [])
        }
        this.uploadedImages[essayId].push(res.data)
      } catch (error) {
        console.error('图片上传失败:', error)
        alert(error.message || '图片上传失败')
      }

      event.target.value = ''
    },
    removeImage(essayId, index) {
      this.uploadedImages[essayId].splice(index, 1)
    },
    async submitMessage(essayId) {
      const content = this.messageContent[essayId]
      const images = this.uploadedImages[essayId] || []

      if (!content && images.length === 0) {
        alert('请输入留言内容或上传图片')
        return
      }

      try {
        const res = await http.post('/api/essay/comment', {
          essayId: essayId,
          parentId: 0,
          content: content,
          images: images
        })
        const essay = this.essays.find(e => e.id === essayId)
        if (essay) {
          if (!essay.commentList) {
            this.$set(essay, 'commentList', [])
          }
          essay.commentList.push(res.data)
          essay.comments = (essay.comments || 0) + 1
        }
        this.$set(this.messageContent, essayId, '')
        this.$set(this.uploadedImages, essayId, [])
        this.$set(this.showMessageBox, essayId, false)
        this.$set(this.showEmojiPicker, essayId, false)
        this.$set(this.expandedComments, essayId, true)
        
        // 3秒后自动刷新评论列表以获取AI回复
        setTimeout(() => {
          this.loadEssayComments(essayId, 1)
        }, 3000)
      } catch (error) {
        console.error('留言失败:', error)
        alert(error.message || '留言失败')
      }
    },
    // 回复相关方法
    openReplyBox(essayId, commentId, replyId = null) {
      // 先关闭所有回复框
      Object.keys(this.showReplyBox).forEach(key => {
        this.$set(this.showReplyBox, key, false)
        this.$set(this.showReplyEmoji, key, false)
      })
      // 打开当前回复框
      const key = replyId ? `${essayId}-${commentId}-${replyId}` : `${essayId}-${commentId}`
      this.$set(this.showReplyBox, key, true)
    },
    closeReplyBox(essayId, commentId, replyId = null) {
      const key = replyId ? `${essayId}-${commentId}-${replyId}` : `${essayId}-${commentId}`
      this.$set(this.showReplyBox, key, false)
      this.$set(this.showReplyEmoji, key, false)
      this.$set(this.replyContent, key, '')
    },
    toggleReplyEmoji(essayId, commentId, replyId = null) {
      const key = replyId ? `${essayId}-${commentId}-${replyId}` : `${essayId}-${commentId}`
      this.$set(this.showReplyEmoji, key, !this.showReplyEmoji[key])
    },
    insertReplyEmoji(essayId, commentId, emoji, replyId = null) {
      const key = replyId ? `${essayId}-${commentId}-${replyId}` : `${essayId}-${commentId}`
      const current = this.replyContent[key] || ''
      this.$set(this.replyContent, key, current + emoji)
    },
    triggerReplyImageUpload(essayId, commentId, replyId = null) {
      const key = replyId ? `${essayId}-${commentId}-${replyId}` : `${essayId}-${commentId}`
      const refName = 'replyImageInput' + key
      const input = this.$refs[refName]
      if (input) {
        if (Array.isArray(input)) {
          input[0].click()
        } else {
          input.click()
        }
      }
    },
    async handleReplyImageUpload(event, essayId, commentId, replyId = null) {
      const file = event.target.files[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过 2MB')
        return
      }

      const key = replyId ? `${essayId}-${commentId}-${replyId}` : `${essayId}-${commentId}`

      try {
        const res = await http.upload('/api/essay/uploadImage', file)
        if (!this.replyImages[key]) {
          this.$set(this.replyImages, key, [])
        }
        this.replyImages[key].push(res.data)
      } catch (error) {
        console.error('图片上传失败:', error)
        alert(error.message || '图片上传失败')
      }

      event.target.value = ''
    },
    removeReplyImage(essayId, commentId, index, replyId = null) {
      const key = replyId ? `${essayId}-${commentId}-${replyId}` : `${essayId}-${commentId}`
      this.replyImages[key].splice(index, 1)
    },
    async submitReply(essayId, commentId, replyToName, replyId = null) {
      const key = replyId ? `${essayId}-${commentId}-${replyId}` : `${essayId}-${commentId}`
      const content = this.replyContent[key]
      const images = this.replyImages[key] || []

      if ((!content || !content.trim()) && images.length === 0) {
        alert('请输入回复内容或上传图片')
        return
      }

      // 找到被回复用户的ID（三级回复需要）
      let replyToUserId = null
      if (replyId) {
        const essay = this.essays.find(e => e.id === essayId)
        if (essay) {
          const comment = essay.commentList.find(c => c.id === commentId)
          if (comment && comment.replies) {
            const reply = comment.replies.find(r => r.id === replyId)
            if (reply && reply.user) {
              replyToUserId = reply.user.id
            }
          }
        }
      }

      try {
        const res = await http.post('/api/essay/comment', {
          essayId: essayId,
          parentId: commentId,
          replyToUserId: replyToUserId,
          content: (content || '').trim(),
          images: images
        })
        const essay = this.essays.find(e => e.id === essayId)
        if (essay) {
          const comment = essay.commentList.find(c => c.id === commentId)
          if (comment) {
            if (!comment.replies) {
              this.$set(comment, 'replies', [])
            }
            const replyData = res.data
            const newReply = {
              id: replyData.id,
              user: replyData.user,
              content: replyData.content,
              images: replyData.images,
              date: replyData.date,
              replyTo: replyId ? replyToName : null
            }
            comment.replies.push(newReply)
            essay.comments = (essay.comments || 0) + 1
          }
        }
        this.$set(this.replyContent, key, '')
        this.$set(this.replyImages, key, [])
        this.$set(this.showReplyBox, key, false)
        this.$set(this.showReplyEmoji, key, false)
      } catch (error) {
        console.error('回复失败:', error)
        alert(error.message || '回复失败')
      }
    },
    getLevelColor(level) {
      const colors = {
        1: '#ff9800',
        2: '#4caf50',
        3: '#2196f3',
        4: '#9c27b0',
        5: '#f44336'
      }
      return colors[level] || '#999'
    },
    getTitleColor(title) {
      const colors = {
        '练气': '#999',
        '筑基': '#8bc34a',
        '金丹': '#4caf50',
        '元婴': '#00bcd4',
        '化神': '#2196f3',
        '渡劫': '#673ab7',
        '大乘': '#ff9800',
        '金仙': '#ff5722',
        '太乙玉仙': '#e91e63'
      }
      return colors[title] || '#999'
    },
    handleBgLoad() {
      if (this.loadingTimeout) {
        clearTimeout(this.loadingTimeout)
      }
      hideLoading()
    },
    handleBgError() {
      if (this.loadingTimeout) {
        clearTimeout(this.loadingTimeout)
      }
      this.bgImage = getFallbackBg(this.bgImage, 'essay')
      hideLoading()
    },
    openPreview(imgUrl) {
      this.previewImage = imgUrl
      document.body.style.overflow = 'hidden'
    },
    closePreview() {
      this.previewImage = null
      document.body.style.overflow = ''
    }
  }
}
</script>

<style scoped>
.essay-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* 全屏背景 */
.page-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
}

.page-background .bg-image {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
}

/* 全屏欢迎区域 */
.welcome-section {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.welcome-content {
  text-align: center;
  color: #fff;
}

.welcome-title {
  font-size: 48px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  animation: fadeInDown 1s ease;
}

.welcome-title .title-icon {
  font-size: 52px;
}

.welcome-subtitle {
  margin-top: 20px;
  font-size: 20px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  animation: fadeInUp 1s ease 0.3s both;
}

/* 向下滚动按钮 */
.scroll-down-btn {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: bounce 2s infinite;
}

.scroll-down-btn:hover {
  background-color: #fff;
  transform: translateX(-50%) scale(1.1);
}

.scroll-down-btn svg {
  width: 24px;
  height: 24px;
  color: #42b983;
}

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateX(-50%) translateY(0);
  }

  40% {
    transform: translateX(-50%) translateY(-10px);
  }

  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 内容区域 */
.content-section {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* 页面标题 */
.page-header {
  text-align: center;
  padding: 120px 20px 40px;
  color: #fff;
}

.header-title {
  font-size: 36px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title-icon {
  font-size: 40px;
}

.header-subtitle {
  margin-top: 10px;
  font-size: 18px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* 列表容器 */
.essay-container {
  max-width: 800px;
  margin: 0 auto 40px;
  padding: 0 20px;
  position: relative;
}

/* 加载状态 */
.loading-box,
.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  color: #666;
  font-size: 16px;
}

.dark-theme .loading-box,
.dark-theme .empty-box {
  background: rgba(30, 30, 48, 0.85);
  color: #aaa;
}

.loading-icon,
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.loading-icon {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 随笔卡片 */
.essay-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dark-theme .essay-card {
  background: rgba(45, 45, 68, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #eee;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 用户信息 */
.essay-user {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.user-name {
  font-weight: 600;
  font-size: 15px;
}

.user-level {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.user-level .level-icon {
  font-size: 11px;
}

.user-title {
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 4px;
  font-size: 12px;
  color: inherit;
}

/* 随笔内容 */
.essay-content {
  margin-bottom: 15px;
}

.essay-text {
  line-height: 1.8;
  white-space: pre-wrap;
  margin-bottom: 10px;
}

.essay-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.essay-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s;
}

.essay-image:hover {
  transform: scale(1.02);
}

.essay-videos {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}

.essay-video {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  background: #000;
}

/* 底部信息 */
.essay-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.dark-theme .essay-footer {
  border-top-color: #444;
}

.essay-date {
  color: #999;
  font-size: 14px;
}

.essay-actions {
  display: flex;
  gap: 15px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
}

.action-item:hover {
  color: #ff6b9d;
}

.comment-toggle {
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.comment-toggle.active,
.message-toggle.active {
  background: rgba(255, 107, 157, 0.15);
  color: #ff6b9d;
}

.message-toggle {
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.action-count {
  font-size: 14px;
}

.action-icon {
  font-size: 16px;
}

/* 评论区域 */
.comments-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.dark-theme .comments-section {
  border-top-color: #444;
}

.comments-header {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.dark-theme .comments-header {
  color: #aaa;
}

.comments-divider {
  margin: 0 8px;
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
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  position: relative;
}

.dark-theme .comment-item {
  background: #252538;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.comment-user .user-name {
  font-size: 14px;
}

.comment-user .user-level {
  font-size: 11px;
  padding: 1px 6px;
}

.comment-user .user-title {
  font-size: 11px;
  padding: 1px 6px;
}

.comment-date {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
}

.reply-btn {
  position: absolute;
  right: 12px;
  top: 12px;
  background: linear-gradient(135deg, #ff9800, #ff5722);
  color: #fff;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.reply-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.4);
}

/* 嵌套回复 */
.reply-list {
  margin-top: 12px;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reply-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: #fff;
  border-radius: 6px;
  position: relative;
}

.dark-theme .reply-item {
  background: #1e1e30;
}

.reply-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.reply-body {
  flex: 1;
}

.reply-item .reply-btn {
  top: 10px;
  right: 10px;
  padding: 3px 10px;
  font-size: 11px;
}

/* 留言输入框 */
.message-box {
  margin-top: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  border: 1px solid #eee;
}

.dark-theme .message-box {
  background: rgba(30, 30, 48, 0.9);
  border-color: #444;
}

.message-header {
  margin-bottom: 12px;
}

.message-title {
  font-size: 16px;
  font-weight: 600;
  color: #e67e22;
}

.message-input-area {
  margin-bottom: 12px;
}

.message-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  background: #fff;
  color: #333;
  box-sizing: border-box;
}

.dark-theme .message-textarea {
  background: #2d2d44;
  border-color: #555;
  color: #eee;
}

.message-textarea:focus {
  outline: none;
  border-color: #9b59b6;
}

.message-textarea::placeholder {
  color: #999;
}

/* 已上传图片预览 */
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
  border-radius: 6px;
}

.remove-image {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: #ff4757;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s;
}

.remove-image:hover {
  transform: scale(1.1);
}

/* 工具栏 */
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
  font-size: 22px;
  cursor: pointer;
  padding: 5px;
  border-radius: 6px;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.submit-btn {
  padding: 8px 24px;
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(155, 89, 182, 0.4);
}

/* 表情选择器 */
.emoji-picker {
  margin-top: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  max-height: 150px;
  overflow-y: auto;
}

.dark-theme .emoji-picker {
  background: #252538;
}

.emoji-item {
  font-size: 22px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.emoji-item:hover {
  background: rgba(155, 89, 182, 0.2);
  transform: scale(1.2);
}

/* 回复输入框 */
.reply-input-box {
  margin-top: 12px;
  padding: 12px;
  background: rgba(245, 245, 245, 0.95);
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.dark-theme .reply-input-box {
  background: rgba(30, 30, 48, 0.95);
  border-color: #444;
}

.reply-input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
  color: #666;
}

.dark-theme .reply-input-header {
  color: #aaa;
}

.close-reply {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  font-size: 16px;
  transition: all 0.2s;
}

.close-reply:hover {
  background: rgba(255, 0, 0, 0.1);
  color: #f44336;
}

.reply-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  resize: none;
  background: #fff;
  color: #333;
  box-sizing: border-box;
}

.dark-theme .reply-textarea {
  background: #2d2d44;
  border-color: #555;
  color: #eee;
}

.reply-textarea:focus {
  outline: none;
  border-color: #9b59b6;
}

.reply-textarea::placeholder {
  color: #999;
}

.reply-input-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.submit-reply-btn {
  padding: 6px 16px;
  background: linear-gradient(135deg, #ff9800, #ff5722);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-reply-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(255, 152, 0, 0.4);
}

.reply-emoji-picker {
  margin-top: 10px;
  max-height: 120px;
}

/* 回复目标标记 */
.reply-to {
  color: #9b59b6;
  font-weight: 500;
}

.dark-theme .reply-to {
  color: #bb86fc;
}

/* 评论图片和回复图片 */
.comment-images,
.reply-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.comment-image,
.reply-image {
  max-width: 150px;
  max-height: 150px;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s;
}

.comment-image:hover,
.reply-image:hover {
  transform: scale(1.05);
}

.reply-uploaded-images {
  margin-top: 8px;
}

.reply-uploaded-images .uploaded-image-item {
  width: 60px;
  height: 60px;
}

/* 响应式布局 - 平板 */
@media (max-width: 992px) {
  .essay-container {
    max-width: 100%;
    padding: 20px 30px;
  }

  .essay-card {
    padding: 20px;
  }

  .hero-title {
    font-size: 48px;
  }

  .hero-subtitle {
    font-size: 16px;
  }
}

/* 响应式布局 - 手机 */
@media (max-width: 768px) {
  .essay-container {
    padding: 15px;
  }

  .essay-card {
    padding: 15px;
    margin-bottom: 15px;
  }

  .essay-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .essay-avatar {
    width: 40px;
    height: 40px;
  }

  .essay-username {
    font-size: 14px;
  }

  .essay-text {
    font-size: 14px;
    line-height: 1.7;
  }

  .essay-image {
    max-height: 250px;
  }

  .essay-video {
    max-height: 300px;
  }

  .essay-footer {
    padding-top: 12px;
  }

  .essay-date {
    font-size: 12px;
  }

  .action-icon {
    font-size: 16px;
  }

  .action-count {
    font-size: 12px;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-subtitle {
    font-size: 14px;
    padding: 0 20px;
  }

  /* 评论区响应式 */
  .comment-item {
    padding: 12px 0;
  }

  .comment-avatar {
    width: 36px;
    height: 36px;
  }

  .comment-username {
    font-size: 13px;
  }

  .comment-text {
    font-size: 13px;
  }

  .message-box {
    padding: 12px;
  }

  .message-input {
    min-height: 60px;
    font-size: 14px;
  }

  /* 留言输入框图片上传 */
  .uploaded-image-item {
    width: 60px;
    height: 60px;
  }
}

/* 响应式布局 - 超小屏幕 */
@media (max-width: 375px) {
  .essay-container {
    padding: 10px;
  }

  .essay-card {
    padding: 12px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-subtitle {
    font-size: 12px;
  }

  .essay-images {
    gap: 6px;
  }

  .essay-image {
    max-height: 200px;
  }
}

/* ========== 图片预览弹窗 ========== */
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
  cursor: zoom-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.preview-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
  animation: zoomIn 0.3s ease;
  cursor: default;
}

@keyframes zoomIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.close-preview-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.close-preview-btn:hover {
  background: rgba(255, 107, 157, 0.8);
  transform: rotate(90deg);
}
</style>
