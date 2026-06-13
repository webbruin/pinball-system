import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Main from '../views/Main.vue'
import HomeView from '../views/HomeView.vue'
import ProductView from '../views/ProductView.vue'
import AdvertView from '../views/AdvertView.vue'
import UserView from '../views/UserView.vue'
import MemberView from '../views/MemberView.vue'
import RoomTypeView from '../views/RoomTypeView.vue'
import RoomView from '../views/RoomView.vue'
import CategoryView from '../views/CategoryView.vue'
import SignInView from '../views/SignInView.vue'
import BannerView from '../views/BannerView.vue'
import InvitationView from '../views/InvitationView.vue'
import RechargeView from '../views/RechargeView.vue'
import MqttLogView from '../views/MqttLogView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name:' login', component: Login },
    {
      path: '/',
      name: 'main',
      component: Main,
      children: [
        { path: '/', name: 'home', component: HomeView },
        { path: '/product', name: 'product', component: ProductView },
        { path: '/advert', name: 'advert', component: AdvertView },
        { path: '/user', name: 'user', component: UserView },
        { path: '/member', name: 'member', component: MemberView },
        { path: '/room-type', name: 'room-type', component: RoomTypeView },
        { path: '/room', name: 'room', component: RoomView },
        { path: '/category', name: 'category', component: CategoryView },
        { path: '/sign-in', name: 'sign-in', component: SignInView },
        { path: '/banner', name: 'banner', component: BannerView },
        { path: '/invitation', name: 'invitation', component: InvitationView },
        { path: '/recharge', name: 'recharge', component: RechargeView },
        { path: '/mqtt-log', name: 'mqtt-log', component: MqttLogView },
      ]
    },
    // { path: '/', redirect: '/home' },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ]
})

export default router
