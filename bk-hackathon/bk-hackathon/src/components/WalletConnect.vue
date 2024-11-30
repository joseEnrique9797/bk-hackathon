<template>
  <div class="wallet-connect">
    <button v-if="!account" @click="connectWallet" class="connect-btn">Connect Wallet</button>
    <div v-else class="connected">
      <p>
        Connected: <span>{{ account }}</span>
      </p>
      <button @click="disconnectWallet" class="disconnect-btn">Disconnect</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMainStore } from '../stores/useMainStore'

// Extend the Window interface to include the ethereum property
interface EthereumProvider {
  isMetaMask?: boolean
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

const store = useMainStore()
const account = ref<string | null>(store.account)

// Function to connect wallet
const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[]
      const connectedAccount = accounts[0]
      store.setAccount(connectedAccount) // Update the Pinia store
      account.value = connectedAccount
      localStorage.setItem('walletAddress', connectedAccount) // Save to localStorage
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  } else {
    alert('Please install MetaMask!')
  }
}

// Function to disconnect wallet
const disconnectWallet = () => {
  store.setAccount(null) // Clear the Pinia store
  account.value = null // Clear the local account state
  localStorage.removeItem('walletAddress') // Remove from localStorage
}

// Initialize wallet state from localStorage
const initializeWallet = () => {
  const savedWalletAddress = localStorage.getItem('walletAddress')
  if (savedWalletAddress) {
    store.setAccount(savedWalletAddress) // Update the Pinia store
    account.value = savedWalletAddress // Update the local account state
  }
}

// Call initializeWallet on component mount
onMounted(() => {
  initializeWallet()
})
</script>

<style scoped>
.wallet-connect {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.connect-btn,
.disconnect-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.connect-btn {
  background-color: #007bff;
  color: white;
}

.connect-btn:hover {
  background-color: #0056b3;
}

.disconnect-btn {
  background-color: #ff4d4f;
  color: white;
}

.disconnect-btn:hover {
  background-color: #d9363e;
}

.connected p {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.connected span {
  font-weight: bold;
  color: #007bff;
  word-break: break-word;
}
</style>
