import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useMainStore } from './stores/useMainStore'

import './styles.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

const store = useMainStore()

// Load wallet address from localStorage if it exists
const savedWalletAddress = localStorage.getItem('walletAddress')
if (savedWalletAddress) {
  store.setAccount(savedWalletAddress) // Set the wallet in the Pinia store
}
