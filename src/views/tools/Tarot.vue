<template>
  <div class="tarot-page">
    <div class="cyber-container">
      <h1 class="neon-title" data-text="CYBER TAROT">CYBER TAROT</h1>
      <p class="subtitle">链接潜意识与数字命运的接口</p>

      <div class="interaction-area" v-if="!result">
        <div class="input-group">
          <input type="text" v-model="question" placeholder="输入心中的疑惑 (或留空)..." class="cyber-input" @keyup.enter="drawCard">
        </div>
        <button class="cyber-btn" @click="drawCard" :disabled="loading">
          <span class="btn-text">{{ loading ? '正在链接命运...' : '抽取命运卡牌' }}</span>
          <span class="btn-glitch"></span>
        </button>
      </div>

      <div class="result-area" v-if="result">
        <div class="card-display" :class="{ 'fade-in': showCard }">
          <div class="card-inner">
            <div class="card-front">
              <div class="card-image-placeholder">
                <span class="card-icon">🔮</span>
              </div>
              <h2 class="card-name">{{ result.card }}</h2>
              <p class="card-position">{{ result.position }}</p>
            </div>
          </div>
        </div>
        
        <div class="interpretation-box">
          <h3 class="interp-title">/// 系统解析 ///</h3>
          <div class="interp-content" ref="interpContent">{{ displayedText }}<span class="cursor"></span></div>
        </div>

        <div class="action-buttons">
          <button class="cyber-btn small" @click="reset">再次占卜</button>
          <button class="cyber-btn small outline" @click="$router.push('/')">返回博客</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { http } from '@/utils/request'

export default {
  name: 'CyberTarot',
  data() {
    return {
      question: '',
      loading: false,
      result: null,
      showCard: false,
      displayedText: '',
      fullText: ''
    }
  },
  methods: {
    async drawCard() {
      if (this.loading) return
      this.loading = true
      
      try {
        // 调用后端 API
        const res = await http.post('/api/ai/tarot', { question: this.question }, { timeout: 60000 })
        
        // 模拟或者真实数据
        // Backend return: { card: "The Fool", position: "Upright", interpretation: "..." }
        // 如果后端还没好，先 Mock 一下测试 UI
        if (res.data) {
             this.result = res.data
        } else {
             // Fallback Mock (Dev mode)
             this.result = {
               card: 'The Fool (愚者)',
               position: '正位',
               interpretation: '一切的开始，无限的可能性。在赛博空间中，这代表着初始化的进程，未知的变量。你正站在悬崖边缘，准备跳入数据的海洋。不要害怕未知的 Bug，它们是进化的契机。'
             }
        }
        
        this.startReveal()
      } catch (error) {
        alert('命运链接中断: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    startReveal() {
      this.showCard = true
      this.fullText = this.result.interpretation
      this.displayedText = ''
      this.typeWriter()
    },
    typeWriter() {
      if (this.displayedText.length < this.fullText.length) {
        this.displayedText += this.fullText.charAt(this.displayedText.length)
        setTimeout(this.typeWriter, 50)
      }
    },
    reset() {
      this.result = null
      this.question = ''
      this.displayedText = ''
      this.showCard = false
    }
  }
}
</script>

<style scoped>
.tarot-page {
  min-height: 100vh;
  background-color: #050505;
  background-image: 
    radial-gradient(circle at 50% 50%, #111 0%, #000 100%),
    linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 0, 255, 0.05) 1px, transparent 1px);
  background-size: 100% 100%, 40px 40px, 40px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', monospace;
  color: #0ff;
  padding-top: 60px;
}

.cyber-container {
  text-align: center;
  width: 100%;
  max-width: 800px;
  padding: 20px;
}

.neon-title {
  font-size: 4rem;
  color: #fff;
  text-shadow: 
    0 0 5px #fff,
    0 0 10px #0ff,
    0 0 20px #0ff,
    0 0 40px #0ff;
  margin-bottom: 10px;
  letter-spacing: 5px;
}

.subtitle {
  color: #888;
  margin-bottom: 50px;
  letter-spacing: 2px;
}

.input-group {
  margin-bottom: 30px;
}

.cyber-input {
  background: transparent;
  border: 1px solid #0ff;
  color: #0ff;
  padding: 15px 20px;
  font-size: 1.2rem;
  width: 100%;
  max-width: 500px;
  outline: none;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
  transition: all 0.3s;
}

.cyber-input:focus {
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  background: rgba(0, 255, 255, 0.1);
}

.cyber-btn {
  background: transparent;
  border: 2px solid #f0f;
  color: #f0f;
  padding: 15px 40px;
  font-size: 1.2rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: bold;
}

.cyber-btn:hover {
  background: #f0f;
  color: #000;
  box-shadow: 0 0 20px #f0f;
}

.cyber-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.cyber-btn.small {
  padding: 10px 20px;
  font-size: 1rem;
  border-color: #0ff;
  color: #0ff;
}

.cyber-btn.small:hover {
  background: #0ff;
  color: #000;
  box-shadow: 0 0 20px #0ff;
}

.cyber-btn.outline {
  border-color: #fff;
  color: #fff;
}

.cyber-btn.outline:hover {
  background: #fff;
  color: #000;
  box-shadow: 0 0 20px #fff;
}

.card-display {
  margin: 0 auto 30px;
  width: 200px;
  height: 350px;
  perspective: 1000px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 1s ease;
}

.card-display.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.card-inner {
  width: 100%;
  height: 100%;
  border: 2px solid #0ff;
  background: rgba(0, 20, 20, 0.8);
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.card-icon {
  font-size: 80px;
  margin-bottom: 20px;
  display: block;
}

.card-name {
  color: #f0f;
  font-size: 1.5rem;
  margin: 10px 0;
  text-shadow: 0 0 5px #f0f;
}

.card-position {
  color: #888;
  font-size: 1rem;
}

.interpretation-box {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #333;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  text-align: left;
  border-left: 3px solid #0ff;
}

.interp-title {
  color: #0ff;
  margin-top: 0;
  font-size: 1rem;
  margin-bottom: 15px;
  opacity: 0.7;
}

.interp-content {
  line-height: 1.6;
  font-size: 1.1rem;
  color: #eee;
}

.cursor {
  display: inline-block;
  width: 10px;
  height: 1rem;
  background: #0ff;
  margin-left: 5px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@media (max-width: 600px) {
  .neon-title { font-size: 2.5rem; }
  .card-display { width: 160px; height: 280px; }
}
</style>
