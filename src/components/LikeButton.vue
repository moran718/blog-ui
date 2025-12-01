<template>
  <div class="like-button-wrapper" ref="wrapper">
    <button class="like-btn" :class="{ liked: isLiked, animating: isAnimating }" @click="handleLike">
      <!-- 光环效果 -->
      <div class="ring" :class="{ active: isAnimating && isLiked }"></div>

      <svg class="heart-icon" viewBox="0 0 24 24" :class="{ beat: isAnimating && isLiked }">
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      <span class="like-count">{{ displayCount }}</span>
    </button>

    <!-- 烟花画布 -->
    <canvas class="firework-canvas" ref="canvas"></canvas>
  </div>
</template>

<script>
export default {
  name: 'LikeButton',
  props: {
    count: {
      type: Number,
      default: 0
    },
    liked: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLiked: this.liked,
      isAnimating: false,
      localCount: this.count,
      particles: [],
      animationId: null
    }
  },
  computed: {
    displayCount() {
      if (this.localCount >= 10000) {
        return (this.localCount / 10000).toFixed(1) + 'w'
      } else if (this.localCount >= 1000) {
        return (this.localCount / 1000).toFixed(1) + 'k'
      }
      return this.localCount
    }
  },
  watch: {
    count(val) {
      this.localCount = val
    },
    liked(val) {
      this.isLiked = val
    }
  },
  mounted() {
    this.initCanvas()
  },
  beforeDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.canvas
      if (!canvas) return
      canvas.width = 200
      canvas.height = 200
    },

    handleLike() {
      if (this.isAnimating) return

      this.isAnimating = true

      if (!this.isLiked) {
        this.isLiked = true
        this.localCount++
        this.launchFirework()
      } else {
        this.isLiked = false
        this.localCount--
      }

      this.$emit('like', { liked: this.isLiked, count: this.localCount })

      setTimeout(() => {
        this.isAnimating = false
      }, 1000)
    },

    launchFirework() {
      const canvas = this.$refs.canvas
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // 烟花颜色组合
      const colorSets = [
        ['#ff6b6b', '#ff8e53', '#feca57', '#ff9ff3'],
        ['#48dbfb', '#0abde3', '#10ac84', '#1dd1a1'],
        ['#ff9ff3', '#f368e0', '#ff6b6b', '#ee5a24'],
        ['#feca57', '#ff9f43', '#ff6b6b', '#ee5a24']
      ]
      const colors = colorSets[Math.floor(Math.random() * colorSets.length)]

      this.particles = []

      // 创建主爆炸粒子
      const particleCount = 30
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.5
        const velocity = 3 + Math.random() * 4
        const size = 2 + Math.random() * 3

        this.particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size: size,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: 0.015 + Math.random() * 0.01,
          gravity: 0.05,
          trail: []
        })
      }

      // 创建闪光粒子
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2
        const velocity = 1 + Math.random() * 2

        this.particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size: 1 + Math.random() * 2,
          color: '#fff',
          alpha: 1,
          decay: 0.03 + Math.random() * 0.02,
          gravity: 0.02,
          trail: [],
          sparkle: true
        })
      }

      this.animate(ctx, canvas)
    },

    animate(ctx, canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let hasAlive = false

      this.particles.forEach(p => {
        if (p.alpha <= 0) return
        hasAlive = true

        // 保存尾迹
        if (p.trail.length < 5) {
          p.trail.push({ x: p.x, y: p.y, alpha: p.alpha })
        } else {
          p.trail.shift()
          p.trail.push({ x: p.x, y: p.y, alpha: p.alpha })
        }

        // 绘制尾迹
        p.trail.forEach((t, i) => {
          const trailAlpha = (i / p.trail.length) * t.alpha * 0.5
          ctx.beginPath()
          ctx.arc(t.x, t.y, p.size * (i / p.trail.length), 0, Math.PI * 2)
          ctx.fillStyle = this.setAlpha(p.color, trailAlpha)
          ctx.fill()
        })

        // 绘制粒子
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)

        if (p.sparkle) {
          // 闪烁效果
          const flicker = 0.5 + Math.random() * 0.5
          ctx.fillStyle = this.setAlpha(p.color, p.alpha * flicker)
        } else {
          ctx.fillStyle = this.setAlpha(p.color, p.alpha)
        }
        ctx.fill()

        // 发光效果
        ctx.shadowBlur = 10
        ctx.shadowColor = p.color
        ctx.fill()
        ctx.shadowBlur = 0

        // 更新物理
        p.x += p.vx
        p.y += p.vy
        p.vy += p.gravity
        p.vx *= 0.98
        p.alpha -= p.decay
        p.size *= 0.99
      })

      if (hasAlive) {
        this.animationId = requestAnimationFrame(() => this.animate(ctx, canvas))
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    },

    setAlpha(color, alpha) {
      // 将颜色转换为 rgba
      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16)
        const g = parseInt(color.slice(3, 5), 16)
        const b = parseInt(color.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      }
      return color
    }
  }
}
</script>

<style scoped>
.like-button-wrapper {
  position: relative;
  display: inline-block;
}

.like-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  overflow: visible;
}

.like-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.like-btn.liked {
  background: linear-gradient(135deg, #ffe0e0, #ffcdd2);
}

/* 光环效果 */
.ring {
  position: absolute;
  top: 50%;
  left: 25px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  border: 2px solid #ff6b6b;
  opacity: 0;
  pointer-events: none;
}

.ring.active {
  animation: ringExpand 0.6s ease-out;
}

@keyframes ringExpand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }

  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
}

.heart-icon {
  width: 20px;
  height: 20px;
  fill: #999;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.like-btn.liked .heart-icon {
  fill: #ff6b6b;
}

.heart-icon.beat {
  animation: heartBeat 0.6s cubic-bezier(0.17, 0.89, 0.32, 1.49);
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }

  15% {
    transform: scale(1.35);
  }

  30% {
    transform: scale(0.9);
  }

  45% {
    transform: scale(1.2);
  }

  60% {
    transform: scale(0.95);
  }

  75% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

.like-count {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  min-width: 20px;
  position: relative;
  z-index: 1;
}

.like-btn.liked .like-count {
  color: #ff6b6b;
}

/* 烟花画布 */
.firework-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 10;
}
</style>

<style>
/* 暗黑主题 */
.dark-theme .like-btn {
  background: linear-gradient(135deg, #2a2a40, #3a3a55);
}

.dark-theme .like-btn.liked {
  background: linear-gradient(135deg, #4a2a3a, #5a3a4a);
}

.dark-theme .heart-icon {
  fill: #888;
}

.dark-theme .like-count {
  color: #aaa;
}

.dark-theme .like-btn.liked .like-count {
  color: #ff8a8a;
}

.dark-theme .ring {
  border-color: #ff8a8a;
}
</style>
