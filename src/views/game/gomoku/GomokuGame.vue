<template>
  <div class="gomoku-game">
    <div class="game-card">
      <!-- 顶部标题栏 -->
      <div class="game-header">
        <button class="back-btn" @click="goHome">
          <i class="el-icon-arrow-left"></i> 返回博客
        </button>
        <h1>五子棋对战</h1>
        <p>{{ mode === 'pve' ? '经典人机博弈' : '多人在线对战' }} - {{ difficultyLabel }}</p>
      </div>

      <div class="game-content">
        <!-- 大厅区域 (Lobby) -->
        <div class="board-section lobby-container" v-if="mode === 'pvp' && pvpStatus === 'lobby'">
           <div class="lobby-header">
             <h2>对战大厅</h2>
             <div class="header-actions">
                 <span v-if="!isConnected" class="status-tag offline" @click="initWebSocket">🔴 未连接 (点击重连)</span>
                 <span v-else class="status-tag online">🟢 在线</span>
                 <button class="icon-btn" @click="refreshRooms" title="刷新"><i class="el-icon-refresh"></i></button>
             </div>
           </div>
           
           <div class="create-room-box">
             <input v-model="newRoomName" placeholder="输入房间名..." class="room-input" @keyup.enter="createRoom">
             <button class="create-btn" @click="createRoom">创建房间</button>
           </div>

           <div class="room-list-box">
             <div v-if="roomList.length === 0" class="no-room">暂无房间，快来创建一个吧！</div>
             <div v-else class="room-item" v-for="room in roomList" :key="room.id">
               <div class="room-info">
                 <span class="room-name">{{ room.name }}</span>
                 <span class="room-status" :class="room.status">
                    {{ room.status === 'playing' ? '对战中' : '等待中' }}
                    ({{ room.players }}/2)
                 </span>
               </div>
               <button class="join-btn" 
                 :disabled="room.status === 'playing' || room.players >= 2"
                 @click="joinRoom(room.id)">
                 {{ room.status === 'playing' ? '观战' : '加入' }}
               </button>
             </div>
           </div>
        </div>

        <!-- 棋盘区域 (Board) -->
        <div class="board-section" v-else>
          <div class="board-container">
            <chess-board 
              ref="boardRef"
              :board-data="board" 
              :disabled="gameStatus !== 'playing' || (mode === 'pve' && currentPlayer === 2) || (mode === 'pvp' && currentPlayer !== myRole)"
              @move="handlePlayerMove"
            />
            <!-- PvP 等待遮罩 -->
            <div class="waiting-overlay" v-if="mode === 'pvp' && pvpStatus === 'waiting'">
                <div class="spinner"></div>
                <p>等待对手加入...</p>
                <p class="room-id">房间号: {{ roomId }}</p>
            </div>
          </div>
          <div class="game-message-bar">
            {{ getStatusText() }}
          </div>
        </div>

        <!-- 右侧：控制面板 -->
        <div class="info-section">
          <!-- 游戏信息卡片 -->
          <div class="info-card">
            <h3 class="card-title">
              <i class="el-icon-info"></i> 游戏信息
            </h3>
            <div class="info-row">
              <span class="label">当前回合</span>
              <div class="value-group">
                <div class="piece-indicator" :class="{ 'black': currentPlayer === 1, 'white': currentPlayer === 2 }"></div>
                <span>{{ currentPlayer === 1 ? '黑棋' : '白棋' }}</span>
              </div>
            </div>
            <div class="info-row">
              <span class="label">步数统计</span>
              <span class="value-text">{{ history.length }}</span>
            </div>
            <div class="info-row" v-if="resultMessage">
               <span class="result-text">{{ resultMessage }}</span>
            </div>
          </div>

          <!-- 设置卡片 -->
          <div class="info-card">
            <h3 class="card-title">
              <i class="el-icon-setting"></i> 游戏设置
            </h3>

            <!-- 模式切换 -->
            <div class="setting-row">
              <span class="label">模式选择</span>
              <div class="mode-switch">
                <button :class="{ active: mode === 'pve' }" @click="switchMode('pve')">单人</button>
                <button :class="{ active: mode === 'pvp' }" @click="switchMode('pvp')">联网</button>
              </div>
            </div>
            
            <div class="setting-row" v-if="mode === 'pve'">
              <span class="label">AI 难度</span>
              <div class="difficulty-selector">
                <div 
                  class="diff-btn" 
                  :class="{ active: aiLevel === 'easy', disabled: gameStatus === 'playing' }"
                  @click="changeLevel('easy')"
                >简单</div>
                <div 
                  class="diff-btn" 
                  :class="{ active: aiLevel === 'medium', disabled: gameStatus === 'playing' }"
                  @click="changeLevel('medium')"
                >普通</div>
                <div 
                  class="diff-btn" 
                  :class="{ active: aiLevel === 'hard', disabled: gameStatus === 'playing' }"
                  @click="changeLevel('hard')"
                >困难</div>
              </div>
            </div>

            <button class="action-btn restart-btn" @click="toggleGame" :disabled="aiThinking" v-if="mode === 'pve'">
              <i class="el-icon-refresh"></i>
              {{ gameStatus === 'playing' ? '结束本局' : '开始新游戏' }}
            </button>
            <button class="action-btn restart-btn" @click="refreshRooms" v-if="mode === 'pvp' && pvpStatus === 'lobby'">
              刷新列表
            </button>
            <button class="action-btn exit-btn" @click="exitRoom" v-if="mode === 'pvp' && (pvpStatus === 'waiting' || pvpStatus === 'playing')">
              退出房间
            </button>
          </div>

          <!-- 规则说明 -->
          <div class="info-card rule-card">
            <h3 class="card-title">
              <i class="el-icon-reading"></i> 规则说明
            </h3>
            <ul class="rule-list">
              <li>黑棋先行，轮流落子</li>
              <li>横竖斜任意方向连成五子获胜</li>
              <li>难度越高，AI 计算越深</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="card-footer">
        © 2026 Blog Gomoku Game
      </div>
    </div>
  </div>
</template>

<script>
import ChessBoard from './ChessBoard.vue'
import GomokuAI from './GomokuAI'

export default {
  name: 'GomokuGame',
  components: {
    ChessBoard
  },
  data() {
    return {
      board: [],
      gameStatus: 'waiting',
      currentPlayer: 1, // 1=Black, 2=White
      mode: 'pve', // pve, pvp
      aiLevel: 'easy',
      aiThinking: false,
      resultMessage: '',
      history: [],
      aiEngine: null,
      
      // PvP Data
      socket: null,
      isConnected: false,
      pvpStatus: 'lobby', // lobby, waiting, playing
      roomList: [],
      roomId: '',
      newRoomName: '',
      myRole: 0, // 1=Black, 2=White
      opponentName: '等待加入...'
    }
  },
  computed: {
    difficultyLabel() {
      if (this.mode === 'pvp') return '在线对战'
      const map = {
        'easy': '简单',
        'medium': '普通',
        'hard': '困难'
      }
      return map[this.aiLevel] || '简单'
    }
  },
  created() {
    this.initBoard()
    this.aiEngine = new GomokuAI()
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.close()
    }
  },
  methods: {
    initBoard() {
      const b = []
      for (let i = 0; i < 15; i++) {
        const row = []
        for (let j = 0; j < 15; j++) {
          row.push(0)
        }
        b.push(row)
      }
      this.board = b
      this.history = []
    },

    // --- WebSocket Logic ---
    initWebSocket() {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.sendMessage({ type: 'LIST_ROOMS' })
          return
      }
      
      // 动态判断 WebSocket 地址
      // 优先使用环境变量中的 API 地址，确保连接到正确的后端
      const apiUrl = process.env.VUE_APP_API_URL || ''
      let wsUrl = ''
      
      if (apiUrl) {
        // 如果配置了 API URL，从中提取 WebSocket 地址
        wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws/game'
      } else {
        // 本地开发或未配置时，使用当前页面地址
        let protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
        let host = window.location.host
        
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            host = 'localhost:9999'
        }
        
        wsUrl = `${protocol}${host}/ws/game`
      }
      console.log('Connecting to WebSocket:', wsUrl)
      
      this.socket = new WebSocket(wsUrl)
      
      this.socket.onopen = () => {
        this.isConnected = true
        console.log('已连接到服务器')
        this.sendMessage({ type: 'LIST_ROOMS' })
      }
      
      this.socket.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        this.handleMessage(msg)
      }
      
      this.socket.onclose = () => {
        this.isConnected = false
        // this.mode = 'pve' // Don't auto switch
        console.warn('服务器连接断开')
      }
      
      this.socket.onerror = (e) => {
        console.error('WebSocket Error:', e)
        this.isConnected = false
        alert('连接服务器失败，请检查后端服务是否启动')
      }
    },

    sendMessage(data) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(data))
      }
    },

    handleMessage(msg) {
      switch (msg.type) {
        case 'ROOM_LIST':
          this.roomList = msg.rooms
          break
        case 'ROOM_CREATED':
          this.roomId = msg.roomId
          this.pvpStatus = 'waiting'
          this.myRole = 1 // Creator is Black
          this.$message.success('房间创建成功，等待对手...')
          break
        case 'WAITING':
          this.roomId = msg.roomId
          this.pvpStatus = 'waiting'
          this.myRole = 2 // Joiner is White usually, but wait for GAME_START to confirm
          break
        case 'GAME_START':
          this.myRole = msg.role
          this.pvpStatus = 'playing'
          this.gameStatus = 'playing'
          this.currentPlayer = 1
          this.initBoard()
          this.$message.success(msg.role === 1 ? '游戏开始！你执黑先行' : '游戏开始！你执白后手')
          break
        case 'MOVE':
          this.makeMove(msg.x, msg.y, msg.role)
          this.checkWin(msg.x, msg.y, msg.role) // Sync win check
          this.currentPlayer = 3 - msg.role
          break
        case 'GAME_OVER':
          this.endGame(msg.winner, true)
          break
        case 'ERROR':
          this.$message.error(msg.message)
          break
        case 'OPPONENT_LEFT':
          this.$message.info('对手已离开，等待新对手加入...')
          this.pvpStatus = 'waiting'
          this.initBoard()
          // Reset role if needed? usually keep role.
          break
      }
    },

    createRoom() {
      if (!this.newRoomName) return this.$message.warning('请输入房间名')
      this.sendMessage({ type: 'CREATE_ROOM', name: this.newRoomName })
    },

    joinRoom(id) {
      this.sendMessage({ type: 'JOIN_ROOM', roomId: id })
    },
    
    exitRoom() {
        this.sendMessage({ type: 'LEAVE_ROOM' })
        this.pvpStatus = 'lobby'
        this.initBoard()
        this.roomId = ''
    },
    
    refreshRooms() {
        this.sendMessage({ type: 'LIST_ROOMS' })
    },

    switchMode(m) {
        this.mode = m
        if (m === 'pvp') {
            this.initWebSocket()
            this.gameStatus = 'waiting'
            this.pvpStatus = 'lobby'
            this.exitRoom() // Ensure left previous room if any
        } else {
             if (this.socket) {
                 this.exitRoom()
                 this.socket.close()
             }
             this.initBoard()
        }
    },

    toggleGame() {
      if (this.mode === 'pvp') {
          this.exitRoom()
          return
      }
      
      if (this.gameStatus === 'playing') {
        this.gameStatus = 'waiting'
        this.initBoard()
        this.aiThinking = false
        this.resultMessage = ''
        this.$message.info('游戏已重置')
      } else {
        this.initBoard()
        this.gameStatus = 'playing'
        this.currentPlayer = 1
        this.resultMessage = ''
        this.aiEngine.setLevel(this.aiLevel)
        this.$message.success('游戏开始！')
      }
    },

    getStatusText() {
        if (this.mode === 'pvp') {
            if (this.pvpStatus === 'waiting') return '等待对手加入...'
            if (this.pvpStatus === 'lobby') return '请选择房间'
        }
        if (this.gameStatus === 'waiting') return '准备开始'
        if (this.gameStatus === 'ended') return this.resultMessage
        if (this.aiThinking) return 'AI 正在思考...'
        
        if (this.mode === 'pvp') {
             return this.currentPlayer === this.myRole ? '轮到你了' : '对方思考中...'
        }
        return this.currentPlayer === 1 ? '轮到黑棋 (你)' : '轮到白棋'
    },

    handlePlayerMove(pos) {
      if (this.gameStatus !== 'playing') return
      
      // PvP Check
      if (this.mode === 'pvp') {
          if (this.currentPlayer !== this.myRole) {
              this.$message.warning('现在不是你的回合')
              return
          }
      }
      
      this.makeMove(pos.x, pos.y, this.currentPlayer)
      
      if (this.mode === 'pvp') {
          this.sendMessage({ type: 'MOVE', x: pos.x, y: pos.y })
          // Local win check is redundant if server sends GAME_OVER, but good for UI response
      }

      if (this.checkWin(pos.x, pos.y, this.currentPlayer)) {
        this.endGame(this.currentPlayer)
        return
      }

      this.currentPlayer = 3 - this.currentPlayer

      if (this.mode === 'pve' && this.currentPlayer === 2) {
        this.aiThinking = true
        setTimeout(() => {
            this.makeAiMove()
        }, 500)
      }
    },

    makeAiMove() {
      try {
        const move = this.aiEngine.getBestMove(this.board, 2)
        if (move) {
          this.makeMove(move.x, move.y, 2)
          if (this.checkWin(move.x, move.y, 2)) {
            this.endGame(2)
          } else {
            this.currentPlayer = 1
          }
        } else {
             this.endGame(0) 
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.aiThinking = false
      }
    },

    makeMove(x, y, role) {
      const newRow = [...this.board[y]]
      newRow[x] = role
      this.$set(this.board, y, newRow)
      this.history.push({ x, y, role })
      this.$nextTick(() => {
          this.$refs.boardRef.setLastMove({ x, y })
      })
    },

    endGame(winner) {
      this.gameStatus = 'ended'
      if (winner === 0) {
          this.resultMessage = '平局！'
          this.$message.warning('平局！')
      } else {
          let text = ''
          if (this.mode === 'pve') {
              text = winner === 1 ? '黑棋获胜！🎉' : '白棋获胜！🤖'
              if (winner === 1) this.$message.success('恭喜你赢了！')
              else this.$message.error('很遗憾，你输了！')
          } else {
              if (winner === this.myRole) {
                  text = '你赢了！🎉'
                  this.$message.success('恭喜你赢了！')
              } else {
                  text = '对方赢了！'
                  this.$message.error('很遗憾，你输了！')
              }
          }
          this.resultMessage = text
      }
    },

    checkWin(x, y, role) {
      const dirs = [[1,0], [0,1], [1,1], [1,-1]]
      for (const dir of dirs) {
        let count = 1
        for (let i = 1; i < 5; i++) {
            if (!this.checkPos(x + dir[0]*i, y + dir[1]*i, role)) break
            count++
        }
        for (let i = 1; i < 5; i++) {
            if (!this.checkPos(x - dir[0]*i, y - dir[1]*i, role)) break
            count++
        }
        if (count >= 5) return true
      }
      return false
    },
    
    checkPos(x, y, role) {
        return x >= 0 && x < 15 && y >= 0 && y < 15 && this.board[y][x] === role
    },

    goHome() {
        if (this.socket) {
            this.socket.close()
        }
        this.$router.push('/')
    },

    changeLevel(level) {
      if (this.gameStatus === 'playing') return
      this.aiLevel = level
    }
  }
}
</script>

<style scoped>
/* 配色变量 */
.gomoku-game { 
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f3f4f6;
  font-family: 'Inter', system-ui, sans-serif;
  padding: 20px;
}

.game-card {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
}

.game-header {
  background: #8B5A2B;
  padding: 24px;
  text-align: center;
  color: white;
  position: relative; /* For back button */
}

.game-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
}

.game-header p {
  margin: 8px 0 0;
  color: #D2B48C;
  font-size: 14px;
}

.back-btn {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.2s;
  z-index: 10;
}

.back-btn:hover {
  background: rgba(0,0,0,0.4);
  border-color: rgba(255,255,255,0.6);
}

.game-content {
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 24px;
}

@media (min-width: 768px) {
  .game-content {
    flex-direction: row;
  }
}

.board-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.board-container {
  background: #DEB887;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.game-message-bar {
  margin-top: 16px;
  padding: 12px 24px;
  background: rgba(210, 180, 140, 0.2);
  border-radius: 8px;
  font-weight: 600;
  color: #5c3a1e;
  width: 100%;
  text-align: center;
}

.info-section {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.card-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title i {
  color: #8B5A2B;
}

.info-row, .setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.setting-row {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.control-box {
  width: 100%;
}

.label {
  color: #4b5563;
  font-size: 14px;
}

.value-group {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.piece-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 2px 2px rgba(0,0,0,0.2);
}

.piece-indicator.black {
  background: #000;
  background: radial-gradient(circle at 30% 30%, #555, #000);
}
.piece-indicator.white {
  background: #fff;
  background: radial-gradient(circle at 30% 30%, #fff, #ddd);
  border: 1px solid #ccc;
}

.value-text {
  font-family: monospace;
  font-size: 16px;
  font-weight: 600;
}

.result-text {
  color: #ef4444;
  font-weight: bold;
}

.action-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
}

.restart-btn {
  background: #8B5A2B;
  color: white;
  margin-top: 10px;
}

.restart-btn:hover:not(:disabled) {
  background: #704822;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 90, 43, 0.3);
}

.restart-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rule-list {
  padding-left: 20px;
  margin: 0;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.6;
}

.card-footer {
  background: #f9fafb;
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
  border-top: 1px solid #e5e7eb;
}

/* 自定义难度选择器样式 */
.difficulty-selector {
  display: flex;
  background: #e5e7eb;
  padding: 4px;
  border-radius: 8px;
  width: 100%;
}

.diff-btn {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  user-select: none;
}

.diff-btn:hover:not(.active):not(.disabled) {
  background: rgba(255,255,255,0.5);
  color: #374151;
}

.diff-btn.active {
  background: #8B5A2B;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.diff-btn.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Mode Switch */
.mode-switch {
  display: flex;
  background: #e5e7eb;
  padding: 4px;
  border-radius: 8px;
  width: 100%;
}
.mode-switch button {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}
.mode-switch button.active {
  background: #8B5A2B;
  color: white;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Lobby Styles */
.lobby-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 400px;
}
/* Lobby Styles */
.lobby-container {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 450px;
  align-items: center; /* 整体居中 */
}

.lobby-header {
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 15px;
}

.lobby-header h2 { 
  margin: 0; 
  font-size: 24px; 
  color: #374151; 
  font-weight: 700;
}

.create-room-box {
  display: flex;
  gap: 12px;
  width: 100%;
  max-width: 500px;
  margin: 10px 0;
  justify-content: center;
}

.room-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
  font-size: 15px;
  transition: border-color 0.2s;
}

.room-input:focus {
  border-color: #8B5A2B;
}

.create-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.create-btn:hover { 
  background: #059669; 
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
}

.room-list-box {
  flex: 1;
  width: 100%;
  max-width: 600px;
  overflow-y: auto;
  /* border: 1px solid #f3f4f6; Removed border for cleaner look */
  border-radius: 12px;
  padding: 4px; /* Space for shadows */
}

.room-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
}

.room-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.06);
  border-color: #e5e7eb;
}

.room-info { 
  display: flex; 
  flex-direction: column; 
  gap: 4px;
}

.room-name { 
  font-size: 16px; 
  font-weight: 700; 
  color: #1f2937;
}

.room-status { 
  font-size: 13px; 
  display: flex;
  align-items: center;
  gap: 6px;
}

.room-status::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.room-status.waiting { color: #10b981; }
.room-status.waiting::before { background: #10b981; }

.room-status.playing { color: #f59e0b; }
.room-status.playing::before { background: #f59e0b; }

.join-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.join-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.join-btn:disabled { 
  background: #e5e7eb; 
  color: #9ca3af;
  cursor: not-allowed; 
  box-shadow: none;
}

.icon-btn { 
  background: #f3f4f6; 
  border: none; 
  cursor: pointer; 
  color: #6b7280; 
  font-size: 16px;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s;
}
.icon-btn:hover { background: #e5e7eb; color: #374151; }

/* Waiting Overlay */
.waiting-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 8px;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #8B5A2B;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}
.room-id {
  font-family: monospace;
  background: #eee;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 8px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.exit-btn {
  background: #ef4444;
  color: white;
  margin-top: 10px;
}
.exit-btn:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}
</style>

