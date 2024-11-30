<template>
  <div id="app">
    <!-- Header with Navigation -->
    <header>
      <div class="header-container">
        <h1>CollateralLink</h1>
        <nav>
          <router-link to="/">Home</router-link>
          <router-link to="/dashboard">Dashboard</router-link>
          <router-link to="/loan-form">Create Offer/Request</router-link>
        </nav>
      </div>
      <!-- Wallet Connect -->
      <div class="wallet-connect-container">
        <WalletConnect />
      </div>
    </header>

    <!-- Render the current route's component -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import WalletConnect from './components/WalletConnect.vue'
</script>

<style>
@import './styles.css';

/* Header Styles */
header {
  background-color: #007bff;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

header h1 {
  margin: 0;
  font-size: 24px;
}

header nav {
  display: flex;
  gap: 15px;
  margin-top: 5px;
}

header nav a {
  color: white;
  text-decoration: none;
  font-size: 18px;
}

header nav a:hover {
  text-decoration: underline;
}

/* Wallet Connect Container Styles */
.wallet-connect-container {
  margin-left: auto;
  display: flex;
  align-items: center;
}
</style>
