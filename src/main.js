import { createApp } from 'vue'
import Vant from 'vant'
import 'vant/lib/index.css'
import App from './App.vue'
import router from './router'
import './style.css'
import api from './api'

createApp(App).use(router).use(Vant).mount('#app')
window.api = api;
