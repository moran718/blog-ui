<template>
  <div class="global-player" :class="{ collapsed: isCollapsed, hidden: !isVisible }" v-show="hasSongs">
    <!-- 收起状态下的展开按钮 -->
    <div class="expand-btn" v-if="isCollapsed" @click="toggleCollapse">
      <span class="music-icon">🎵</span>
      <div class="mini-wave" v-if="isPlaying">
        <span></span><span></span><span></span>
      </div>
    </div>

    <!-- 播放器主体 -->
    <div class="player-body" v-show="!isCollapsed">
      <!-- 收起按钮 -->
      <div class="collapse-btn" @click="toggleCollapse">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </div>

      <!-- 封面 -->
      <div class="cover" :class="{ rotating: isPlaying }">
        <img :src="currentSong ? currentSong.cover : defaultCover" :alt="currentSong ? currentSong.name : ''" />
      </div>

      <!-- 歌曲信息 -->
      <div class="song-info">
        <p class="song-name">{{ currentSong ? currentSong.name : '未播放' }}</p>
        <p class="artist">{{ currentSong ? currentSong.artist : '--' }}</p>
      </div>

      <!-- 进度条 -->
      <div class="progress-wrapper">
        <div class="progress-bar" @click="seekTo">
          <div class="progress" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="time-info">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="controls">
        <button class="ctrl-btn" @click="prevSong">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>
        <button class="ctrl-btn play" @click="togglePlay">
          <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>
        <button class="ctrl-btn" @click="nextSong">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 音频元素 -->
    <audio ref="audioPlayer" :src="currentSong ? currentSong.url : ''" @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata" @ended="onEnded"></audio>
  </div>
</template>

<script>
import { musicBus, playerState, getCurrentSong, toggleCollapse as toggleCollapseState } from '@/utils/musicPlayer'

export default {
  name: 'GlobalMusicPlayer',
  data() {
    return {
      defaultCover: 'https://via.placeholder.com/60?text=🎵'
    }
  },
  computed: {
    currentSong() {
      return getCurrentSong()
    },
    hasSongs() {
      return playerState.songs && playerState.songs.length > 0
    },
    isPlaying() {
      return playerState.isPlaying
    },
    isVisible() {
      return playerState.isVisible
    },
    isCollapsed() {
      return playerState.isCollapsed
    },
    currentTime() {
      return playerState.currentTime
    },
    duration() {
      return playerState.duration
    },
    progressPercent() {
      return this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0
    }
  },
  mounted() {
    // 监听播放事件
    musicBus.$on('play', this.handlePlay)
    musicBus.$on('toggle-play', this.handleTogglePlay)
  },
  beforeDestroy() {
    musicBus.$off('play', this.handlePlay)
    musicBus.$off('toggle-play', this.handleTogglePlay)
  },
  methods: {
    handlePlay() {
      this.$nextTick(() => {
        if (this.$refs.audioPlayer) {
          this.$refs.audioPlayer.play().catch(() => { })
        }
      })
    },
    handleTogglePlay() {
      if (this.$refs.audioPlayer) {
        if (playerState.isPlaying) {
          this.$refs.audioPlayer.play().catch(() => { })
        } else {
          this.$refs.audioPlayer.pause()
        }
      }
    },
    togglePlay() {
      playerState.isPlaying = !playerState.isPlaying
      this.handleTogglePlay()
    },
    prevSong() {
      const newIndex = (playerState.currentIndex - 1 + playerState.songs.length) % playerState.songs.length
      playerState.currentIndex = newIndex
      playerState.isPlaying = true
      this.$nextTick(() => {
        if (this.$refs.audioPlayer) {
          this.$refs.audioPlayer.play().catch(() => { })
        }
      })
    },
    nextSong() {
      const newIndex = (playerState.currentIndex + 1) % playerState.songs.length
      playerState.currentIndex = newIndex
      playerState.isPlaying = true
      this.$nextTick(() => {
        if (this.$refs.audioPlayer) {
          this.$refs.audioPlayer.play().catch(() => { })
        }
      })
    },
    onTimeUpdate() {
      if (this.$refs.audioPlayer) {
        playerState.currentTime = this.$refs.audioPlayer.currentTime
      }
    },
    onLoadedMetadata() {
      if (this.$refs.audioPlayer) {
        playerState.duration = this.$refs.audioPlayer.duration
      }
    },
    onEnded() {
      this.nextSong()
    },
    seekTo(event) {
      if (!this.$refs.audioPlayer) return
      const rect = event.currentTarget.getBoundingClientRect()
      const percent = (event.clientX - rect.left) / rect.width
      this.$refs.audioPlayer.currentTime = percent * this.duration
    },
    toggleCollapse() {
      toggleCollapseState()
    },
    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '0:00'
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.global-player {
  position: fixed;
  left: 20px;
  bottom: 20px;
  z-index: 9999;
  transition: all 0.3s ease;
}

.global-player.hidden {
  display: none;
}

.global-player.collapsed {
  left: 0;
}

/* 展开按钮 */
.expand-btn {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 25px 25px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.expand-btn:hover {
  width: 60px;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.music-icon {
  font-size: 20px;
}

.mini-wave {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 15px;
  margin-left: 5px;
}

.mini-wave span {
  width: 3px;
  background: #fff;
  border-radius: 2px;
  animation: miniWave 0.8s ease-in-out infinite;
}

.mini-wave span:nth-child(1) {
  animation-delay: 0s;
  height: 8px;
}

.mini-wave span:nth-child(2) {
  animation-delay: 0.2s;
  height: 12px;
}

.mini-wave span:nth-child(3) {
  animation-delay: 0.4s;
  height: 6px;
}

@keyframes miniWave {

  0%,
  100% {
    transform: scaleY(0.5);
  }

  50% {
    transform: scaleY(1);
  }
}

/* 播放器主体 */
.player-body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 200px;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
}

/* 收起按钮 */
.collapse-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s;
}

.collapse-btn:hover {
  color: #fff;
  transform: translateX(-2px);
}

.collapse-btn svg {
  width: 18px;
  height: 18px;
}

/* 封面 */
.cover {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  margin-top: 10px;
}

.cover.rotating {
  animation: spin 8s linear infinite;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 歌曲信息 */
.song-info {
  text-align: center;
  color: #fff;
  width: 100%;
}

.song-name {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 4px 0 0;
}

/* 进度条 */
.progress-wrapper {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #fff;
  border-radius: 2px;
  transition: width 0.1s;
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
}

/* 控制按钮 */
.controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ctrl-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.ctrl-btn svg {
  width: 18px;
  height: 18px;
}

.ctrl-btn.play {
  width: 44px;
  height: 44px;
  background: #fff;
  color: #667eea;
}

.ctrl-btn.play svg {
  width: 22px;
  height: 22px;
}
</style>
