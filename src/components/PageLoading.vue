<template>
  <transition name="loading-fade">
    <div class="page-loading" v-if="show">
      <div class="loading-background"></div>
      <div class="loading-content">
        <!-- 动态圆环 -->
        <div class="loading-rings">
          <div class="ring ring-1"></div>
          <div class="ring ring-2"></div>
          <div class="ring ring-3"></div>
        </div>
        <!-- 中心图标 -->
        <div class="loading-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <!-- 加载文字 -->
        <div class="loading-text">
          <span v-for="(char, index) in loadingChars" :key="index" :style="{ animationDelay: index * 0.1 + 's' }">
            {{ char }}
          </span>
        </div>
        <!-- 进度条 -->
        <div class="loading-progress">
          <div class="progress-bar" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
      <!-- 装饰粒子 -->
      <div class="particles">
        <div class="particle" v-for="n in 20" :key="n" :style="getParticleStyle(n)"></div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'PageLoading',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      loadingChars: ['加', '载', '中', '.', '.', '.']
    }
  },
  methods: {
    getParticleStyle(n) {
      const angle = (n / 20) * 360
      const delay = Math.random() * 2
      const duration = 2 + Math.random() * 2
      const size = 4 + Math.random() * 6
      return {
        '--angle': angle + 'deg',
        '--delay': delay + 's',
        '--duration': duration + 's',
        '--size': size + 'px'
      }
    }
  }
}
</script>

<style scoped>
.page-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.loading-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.loading-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 80%, rgba(120, 0, 255, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 0, 150, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(0, 200, 255, 0.2) 0%, transparent 40%);
  animation: bgPulse 4s ease-in-out infinite;
}

@keyframes bgPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.loading-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

/* 动态圆环 */
.loading-rings {
  position: relative;
  width: 120px;
  height: 120px;
}

.ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  border: 2px solid transparent;
}

.ring-1 {
  width: 120px;
  height: 120px;
  margin: -60px 0 0 -60px;
  border-top-color: #00d4ff;
  border-right-color: #00d4ff;
  animation: spin 1.5s linear infinite;
}

.ring-2 {
  width: 90px;
  height: 90px;
  margin: -45px 0 0 -45px;
  border-top-color: #ff00d4;
  border-left-color: #ff00d4;
  animation: spin 1.2s linear infinite reverse;
}

.ring-3 {
  width: 60px;
  height: 60px;
  margin: -30px 0 0 -30px;
  border-top-color: #d4ff00;
  border-bottom-color: #d4ff00;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 中心图标 */
.loading-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  animation: iconPulse 1.5s ease-in-out infinite;
}

.loading-icon svg {
  width: 100%;
  height: 100%;
  color: #fff;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
}

@keyframes iconPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

/* 加载文字 */
.loading-text {
  display: flex;
  gap: 2px;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

.loading-text span {
  animation: textWave 1.2s ease-in-out infinite;
}

@keyframes textWave {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(-8px); opacity: 1; }
}

/* 进度条 */
.loading-progress {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #ff00d4, #d4ff00);
  background-size: 200% 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
  animation: progressGlow 2s linear infinite;
}

@keyframes progressGlow {
  0% { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}

/* 装饰粒子 */
.particles {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  margin: -150px 0 0 -150px;
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--size);
  height: var(--size);
  background: linear-gradient(135deg, #00d4ff, #ff00d4);
  border-radius: 50%;
  opacity: 0;
  animation: particleFloat var(--duration) var(--delay) ease-in-out infinite;
}

@keyframes particleFloat {
  0% {
    opacity: 0;
    transform: rotate(var(--angle)) translateX(0) scale(0);
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: rotate(var(--angle)) translateX(150px) scale(1);
  }
}

/* 过渡动画 */
.loading-fade-enter-active {
  transition: opacity 0.3s ease;
}

.loading-fade-leave-active {
  transition: opacity 0.5s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>

