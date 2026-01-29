<template>
  <div class="board-container">
    <canvas 
      ref="canvas" 
      :width="width" 
      :height="height" 
      @click="handleClick"
      @mousemove="handleHover"
      @mouseleave="hoverPos = null"
    ></canvas>
  </div>
</template>

<script>
export default {
  name: 'ChessBoard',
  props: {
    boardData: {
      type: Array,
      required: true
    },
    size: {
      type: Number,
      default: 450
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      ctx: null,
      gridSize: 0,
      padding: 20,
      hoverPos: null,
      lastMove: null // {x, y}
    }
  },
  computed: {
    width() { return this.size },
    height() { return this.size }
  },
  watch: {
    boardData: {
      deep: true,
      handler() {
        this.draw()
      }
    }
  },
  mounted() {
    this.initCanvas()
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.canvas
      this.ctx = canvas.getContext('2d')
      this.gridSize = (this.size - this.padding * 2) / 14
      this.draw()
    },

    draw() {
      if (!this.ctx) return
      
      // 清空画布
      this.ctx.clearRect(0, 0, this.width, this.height)
      
      // 绘制背景 (木纹色)
      this.ctx.fillStyle = '#DEB887'
      this.ctx.fillRect(0, 0, this.width, this.height)
      
      // 绘制网格
      this.ctx.beginPath()
      this.ctx.strokeStyle = '#000'
      this.ctx.lineWidth = 1
      
      for (let i = 0; i < 15; i++) {
        // 横线
        this.ctx.moveTo(this.padding, this.padding + i * this.gridSize)
        this.ctx.lineTo(this.size - this.padding, this.padding + i * this.gridSize)
        // 竖线
        this.ctx.moveTo(this.padding + i * this.gridSize, this.padding)
        this.ctx.lineTo(this.padding + i * this.gridSize, this.size - this.padding)
      }
      this.ctx.stroke()
      
      // 绘制天元和星位
      const stars = [[3,3], [3,11], [11,3], [11,11], [7,7]]
      this.ctx.fillStyle = '#000'
      for (const p of stars) {
        this.ctx.beginPath()
        const cx = this.padding + p[0] * this.gridSize
        const cy = this.padding + p[1] * this.gridSize
        this.ctx.arc(cx, cy, 3, 0, 2 * Math.PI)
        this.ctx.fill()
      }

      // 绘制棋子
      for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
          if (this.boardData[y][x] !== 0) {
            this.drawPiece(x, y, this.boardData[y][x])
          }
        }
      }

      // 绘制预选框 (Hover)
      if (this.hoverPos && !this.disabled) {
        this.drawHover(this.hoverPos.x, this.hoverPos.y)
      }
      
      // 绘制最新落子标记
      if (this.lastMove) {
        this.drawLastMoveMarker(this.lastMove.x, this.lastMove.y)
      }
    },

    drawPiece(x, y, role) {
      const cx = this.padding + x * this.gridSize
      const cy = this.padding + y * this.gridSize
      const r = this.gridSize * 0.4
      
      this.ctx.beginPath()
      this.ctx.arc(cx, cy, r, 0, 2 * Math.PI)
      
      // 棋子渐变立体感
      const grad = this.ctx.createRadialGradient(cx - r/3, cy - r/3, r/5, cx, cy, r)
      if (role === 1) { // 黑棋
        grad.addColorStop(0, '#666')
        grad.addColorStop(1, '#000')
      } else { // 白棋
        grad.addColorStop(0, '#fff')
        grad.addColorStop(1, '#ddd')
      }
      
      this.ctx.fillStyle = grad
      this.ctx.fill()
      
      // 棋子阴影
      this.ctx.shadowColor = 'rgba(0,0,0,0.5)'
      this.ctx.shadowBlur = 3
      this.ctx.shadowOffsetX = 2
      this.ctx.shadowOffsetY = 2
      this.ctx.fill()
      this.ctx.shadowColor = 'transparent' // 重置阴影
    },

    drawHover(x, y) {
      if (this.boardData[y][x] !== 0) return
      
      const cx = this.padding + x * this.gridSize
      const cy = this.padding + y * this.gridSize
      
      this.ctx.beginPath()
      this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
      this.ctx.lineWidth = 2
      
      // 画一个小方框
      const s = this.gridSize * 0.4
      this.ctx.strokeRect(cx - s, cy - s, s * 2, s * 2)
    },
    
    drawLastMoveMarker(x, y) {
      const cx = this.padding + x * this.gridSize
      const cy = this.padding + y * this.gridSize
      
      this.ctx.beginPath()
      this.ctx.fillStyle = 'red'
      // 画一个小红点
      this.ctx.arc(cx, cy, 3, 0, 2 * Math.PI)
      this.ctx.fill()
    },

    handleClick(e) {
      if (this.disabled) return
      
      const rect = this.$refs.canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const gridX = Math.round((x - this.padding) / this.gridSize)
      const gridY = Math.round((y - this.padding) / this.gridSize)
      
      if (gridX >= 0 && gridX < 15 && gridY >= 0 && gridY < 15) {
        if (this.boardData[gridY][gridX] === 0) {
          this.$emit('move', { x: gridX, y: gridY })
        }
      }
    },
    
    handleHover(e) {
      if (this.disabled) {
        this.hoverPos = null
        this.draw()
        return
      }
      
      const rect = this.$refs.canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const gridX = Math.round((x - this.padding) / this.gridSize)
      const gridY = Math.round((y - this.padding) / this.gridSize)
      
      if (gridX >= 0 && gridX < 15 && gridY >= 0 && gridY < 15) {
        if (this.hoverPos?.x !== gridX || this.hoverPos?.y !== gridY) {
          this.hoverPos = { x: gridX, y: gridY }
          this.draw()
        }
      } else {
        this.hoverPos = null
        this.draw()
      }
    },
    
    setLastMove(pos) {
      this.lastMove = pos
      this.draw()
    }
  }
}
</script>

<style scoped>
.board-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0cb9c;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
canvas {
  cursor: pointer;
}
</style>
