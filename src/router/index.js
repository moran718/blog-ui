import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Profile from '../views/Profile.vue'
import Essay from '../views/Essay.vue'
import Message from '../views/Message.vue'
import Record from '../views/Record.vue'
import RecordDetail from '../views/RecordDetail.vue'
import Music from '../views/Music.vue'
import Archive from '../views/Archive.vue'
import { showLoading } from '../utils/pageLoader'

Vue.use(VueRouter)

// 需要显示加载动画的页面（有背景图的页面）
const pagesWithLoading = ['/', '/essay', '/record', '/message', '/music', '/archive']

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/essay',
    name: 'Essay',
    component: Essay
  },
  {
    path: '/message',
    name: 'Message',
    component: Message
  },
  {
    path: '/record',
    name: 'Record',
    component: Record
  },
  {
    path: '/record/:id',
    name: 'RecordDetail',
    component: RecordDetail
  },
  {
    path: '/music',
    name: 'Music',
    component: Music
  },
  {
    path: '/archive',
    name: 'Archive',
    component: Archive
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 路由守卫 - 页面切换时显示加载动画
router.beforeEach((to, from, next) => {
  // 只有从其他页面进入需要加载动画的页面时才显示
  if (pagesWithLoading.includes(to.path) && from.path !== to.path) {
    showLoading()
  }
  next()
})

export default router

