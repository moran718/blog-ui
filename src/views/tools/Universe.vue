<template>
  <div class="universe-page">
    <div class="stars"></div>
    <div class="twinkling"></div>
    
    <div class="cosmos-container">
      <h1 class="cosmos-title">平行宇宙观测站</h1>
      <p class="subtitle">输入一个"如果"，观测另一种人生...</p>

      <div class="input-section" v-if="!story">
        <div class="input-wrapper">
          <span class="prefix">如果...</span>
          <input type="text" v-model="scenario" placeholder="我回到高三..." class="cosmos-input" @keyup.enter="startSimulation">
        </div>
        
        <button class="cosmos-btn" @click="startSimulation" :disabled="loading">
          {{ loading ? '观测中...' : '开启传送门' }}
        </button>
      </div>

      <div class="story-container" v-if="story">
        <div class="story-content">
          <p class="story-text" v-html="displayedStory"></p>
        </div>
        
        <div class="action-buttons">
          <button class="cosmos-btn small" @click="reset">观测其他宇宙</button>
          <button class="cosmos-btn small outline" @click="$router.push('/')">返回现实</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { http } from '@/utils/request'

export default {
  name: 'ParallelUniverse',
  data() {
    return {
      scenario: '',
      loading: false,
      story: '',
      displayedStory: '',
      typingTimer: null
    }
  },
  methods: {
    async startSimulation() {
      if (!this.scenario) return
      this.loading = true
      
      try {
        const fullScenario = this.scenario.startsWith('如果') ? this.scenario : '如果' + this.scenario
        
        const res = await http.post('/api/ai/universe', { scenario: fullScenario }, { timeout: 60000 })
        
        if (res.data) {
          this.story = res.data
        } else {
          // Fallback Mock
          this.story = "观测站信号微弱... (请检查后端连接)<br><br>在那个宇宙，你成为了一名甚至不需要写代码的超级AI架构师..."
        }
        
        this.startTyping()
      } catch (error) {
        alert('传送门开启失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    startTyping() {
      let index = 0
      this.displayedStory = ''
      // Simple HTML tag handling might be needed if story has formatting, 
      // but for now assuming plain text with <br> from backend or converted.
      // We'll just type char by char.
      
      clearInterval(this.typingTimer)
      this.typingTimer = setInterval(() => {
        if (index < this.story.length) {
          this.displayedStory += this.story[index]
          index++
        } else {
          clearInterval(this.typingTimer)
        }
      }, 30) // Fast typing
    },
    reset() {
      this.story = ''
      this.scenario = ''
      this.displayedStory = ''
      clearInterval(this.typingTimer)
    }
  },
  beforeDestroy() {
    clearInterval(this.typingTimer)
  }
}
</script>

<style scoped>
.universe-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: #000;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #fff;
  padding-top: 60px; /* Navbar space */
}

/* Stars Background Animation */
.stars, .twinkling {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.stars {
  background: #000 url('http://www.script-tutorials.com/demos/360/images/stars.png') repeat top center;
  z-index: 0;
}

.twinkling {
  background: transparent url('http://www.script-tutorials.com/demos/360/images/twinkling.png') repeat top center;
  z-index: 1;
  animation: move-twink-back 200s linear infinite;
}

@keyframes move-twink-back {
  from {background-position:0 0;}
  to {background-position:-10000px 5000px;}
}

.cosmos-container {
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
  max-width: 800px;
  padding: 40px;
  background: rgba(10, 10, 30, 0.6);
  backdrop-filter: blur(5px);
  border-radius: 20px;
  border: 1px solid rgba(100, 100, 255, 0.2);
  box-shadow: 0 0 50px rgba(0, 0, 50, 0.5);
}

.cosmos-title {
  font-size: 3rem;
  margin-bottom: 10px;
  background: linear-gradient(to right, #a18cd1 0%, #fbc2eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
}

.subtitle {
  color: #ccc;
  font-size: 1.2rem;
  margin-bottom: 50px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  padding: 5px 20px;
  margin-bottom: 30px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.input-wrapper:focus-within {
  border-color: #a18cd1;
  box-shadow: 0 0 15px rgba(161, 140, 209, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.prefix {
  font-size: 1.2rem;
  font-weight: bold;
  color: #fbc2eb;
  margin-right: 10px;
  white-space: nowrap;
}

.cosmos-input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  width: 100%;
  padding: 10px 0;
  outline: none;
}

.cosmos-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50px;
  padding: 15px 40px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 5px 15px rgba(118, 75, 162, 0.4);
}

.cosmos-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(118, 75, 162, 0.6);
}

.cosmos-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.story-container {
  text-align: left;
  animation: fadeIn 1s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.story-content {
  background: rgba(0, 0, 0, 0.3);
  padding: 30px;
  border-radius: 10px;
  min-height: 200px;
  margin-bottom: 30px;
  border-left: 4px solid #a18cd1;
}

.story-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #eee;
  white-space: pre-wrap; /* Preserve newlines */
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.cosmos-btn.small {
  padding: 10px 25px;
  font-size: 1rem;
}

.cosmos-btn.outline {
  background: transparent;
  border: 2px solid #fff;
}

.cosmos-btn.outline:hover {
  background: #fff;
  color: #333;
}

@media (max-width: 600px) {
  .cosmos-title { font-size: 2rem; }
  .cosmos-container { padding: 20px; }
}
</style>
