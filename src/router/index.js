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

Vue.use(VueRouter)

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
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

