import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/main.css'
import './styles/worldView.css'
import './styles/cities.css'
import './styles/home.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
