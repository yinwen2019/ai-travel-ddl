import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { installAnalytics } from '@/services/analytics'
import './styles/main.css'
import './styles/worldView.css'
import './styles/cities.css'
import './styles/home.css'
import './styles/rankings.css'
import './styles/community.css'

const app = createApp(App)
app.use(router)
app.mount('#app')

const disposeAnalytics = installAnalytics()
if (import.meta.hot) import.meta.hot.dispose(disposeAnalytics)
