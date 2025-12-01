/**
 * 页面加载管理器
 * 用于管理页面切换时的加载状态和背景图预加载
 */

import Vue from 'vue'

// 创建一个事件总线用于组件间通信
export const loadingBus = new Vue()

// 加载状态
const state = {
  isLoading: false,
  progress: 0,
  showTime: 0,  // 显示加载动画的时间戳
  minDisplayTime: 500  // 最小显示时间（毫秒）
}

// 定时器
let progressTimer = null
let hideTimer = null

/**
 * 预加载图片
 * @param {string} src - 图片地址
 * @returns {Promise} - 加载完成的 Promise
 */
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = src
  })
}

/**
 * 显示加载动画
 */
export function showLoading() {
  // 清除之前的隐藏定时器
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }

  state.isLoading = true
  state.progress = 0
  state.showTime = Date.now()
  loadingBus.$emit('loading-change', { isLoading: true, progress: 0 })

  // 模拟进度增长
  simulateProgress()
}

/**
 * 隐藏加载动画
 */
export function hideLoading() {
  // 如果没有在加载状态，直接返回
  if (!state.isLoading) return

  // 清除进度定时器
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }

  // 计算已经显示的时间
  const elapsed = Date.now() - state.showTime
  const remainingTime = Math.max(0, state.minDisplayTime - elapsed)

  // 先将进度设为 100%
  state.progress = 100
  loadingBus.$emit('loading-change', { isLoading: true, progress: 100 })

  // 确保至少显示 minDisplayTime 毫秒后再隐藏
  hideTimer = setTimeout(() => {
    state.isLoading = false
    state.progress = 0
    loadingBus.$emit('loading-change', { isLoading: false, progress: 0 })
    hideTimer = null
  }, remainingTime + 300) // 加 300ms 让进度条动画完成
}

/**
 * 更新进度
 * @param {number} progress - 进度值 0-100
 */
export function updateProgress(progress) {
  state.progress = Math.min(progress, 99)
  loadingBus.$emit('loading-change', { isLoading: state.isLoading, progress: state.progress })
}

/**
 * 模拟进度增长
 */
function simulateProgress() {
  if (progressTimer) clearInterval(progressTimer)

  progressTimer = setInterval(() => {
    if (state.progress < 90) {
      const increment = state.progress < 30 ? 8 : state.progress < 60 ? 4 : 2
      state.progress = Math.min(state.progress + increment, 90)
      loadingBus.$emit('loading-change', { isLoading: state.isLoading, progress: state.progress })
    } else {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }, 100)
}

/**
 * 获取当前状态
 */
export function getLoadingState() {
  return { ...state }
}

/**
 * 检查是否正在加载
 */
export function isCurrentlyLoading() {
  return state.isLoading
}

export default {
  loadingBus,
  preloadImage,
  showLoading,
  hideLoading,
  updateProgress,
  getLoadingState,
  isCurrentlyLoading
}

