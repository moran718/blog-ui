import Vue from 'vue'
import { http, getResourceUrl } from './request'

// 音乐播放器事件总线
export const musicBus = new Vue()

// 播放器状态
export const playerState = Vue.observable({
  songs: [],  // 歌曲列表从后端获取
  currentIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isVisible: true,  // 播放器是否可见
  isCollapsed: true, // 默认收起状态
  isLoaded: false // 是否已加载歌曲列表
})

// 从后端加载歌曲列表
export async function loadMusicList() {
  if (playerState.isLoaded && playerState.songs.length > 0) {
    return // 已加载过则不重复请求
  }
  try {
    const res = await http.get('/api/music/list')
    if (res.data && res.data.length > 0) {
      // 处理相对路径，转换为完整URL
      playerState.songs = res.data.map(song => ({
        ...song,
        cover: getResourceUrl(song.cover),
        url: getResourceUrl(song.url)
      }))
      playerState.isLoaded = true
    }
  } catch (error) {
    console.error('加载音乐列表失败:', error)
  }
}

// 获取当前歌曲
export function getCurrentSong() {
  return playerState.songs[playerState.currentIndex] || null
}

// 设置歌曲列表
export function setSongs(songs) {
  playerState.songs = songs
}

// 播放指定歌曲
export function playSong(index) {
  playerState.currentIndex = index
  playerState.isPlaying = true
  playerState.isVisible = true
  playerState.isCollapsed = false
  musicBus.$emit('play', index)
}

// 切换播放/暂停
export function togglePlay() {
  playerState.isPlaying = !playerState.isPlaying
  musicBus.$emit('toggle-play')
}

// 上一首
export function prevSong() {
  const newIndex = (playerState.currentIndex - 1 + playerState.songs.length) % playerState.songs.length
  playerState.currentIndex = newIndex
  playerState.isPlaying = true
  musicBus.$emit('play', newIndex)
}

// 下一首
export function nextSong() {
  const newIndex = (playerState.currentIndex + 1) % playerState.songs.length
  playerState.currentIndex = newIndex
  playerState.isPlaying = true
  musicBus.$emit('play', newIndex)
}

// 更新播放进度
export function updateProgress(currentTime, duration) {
  playerState.currentTime = currentTime
  playerState.duration = duration
}

// 切换播放器显示/隐藏
export function toggleCollapse() {
  playerState.isCollapsed = !playerState.isCollapsed
}

// 显示播放器
export function showPlayer() {
  playerState.isVisible = true
  playerState.isCollapsed = false
}

