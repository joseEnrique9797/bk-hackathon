<template>
  <div class="home-view">
    <!-- Recent Activity Ribbon -->
    <div class="activity-ribbon">
      <marquee behavior="scroll" direction="left">
        <span v-for="(loan, index) in recentLoans" :key="index" class="activity">
          {{ loan.type === 'offer' ? 'Offer' : 'Request' }}: {{ loan.amount }}
          {{ loan.loanToken }} at {{ loan.rate }}% for {{ loan.duration }} days | Collateral:
          {{ loan.collateralAmount }} {{ loan.collateralToken }}
        </span>
      </marquee>
    </div>

    <!-- Welcome Section -->
    <h1>CollateralLink</h1>
    <p>Effortlessly create and manage your loans.</p>

    <!-- Metrics Section -->
    <div class="metrics">
      <div class="metric">
        <h3>Total Offers Placed</h3>
        <p>{{ liveOffers }}</p>
      </div>
      <div class="metric">
        <h3>Total Requests Processed</h3>
        <p>{{ liveRequests }}</p>
      </div>
      <div class="metric">
        <h3>Assets Processed (USD)</h3>
        <p>${{ liveAssets.toFixed(2) }}</p>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="navigation-buttons">
      <router-link to="/dashboard">
        <button>Go to My Dashboard</button>
      </router-link>
      <router-link to="/loan-form">
        <button>Create an Offer / Request</button>
      </router-link>
    </div>

    <!-- All Loans Display -->
    <div class="all-loans">
      <h2>Recent Activity</h2>
      <div class="loan-columns">
        <!-- Offers Column -->
        <div class="loan-column">
          <h3>Offers</h3>
          <ul>
            <li v-for="offer in offers" :key="offer.id">
              <p><strong>Amount:</strong> {{ offer.amount }} {{ offer.loanToken }}</p>
              <p><strong>Rate:</strong> {{ offer.rate }}% for {{ offer.duration }} days</p>
              <p>
                <strong>Collateral:</strong> {{ offer.collateralAmount }}
                {{ offer.collateralToken }}
              </p>
            </li>
          </ul>
        </div>

        <!-- Requests Column -->
        <div class="loan-column">
          <h3>Requests</h3>
          <ul>
            <li v-for="request in requests" :key="request.id">
              <p><strong>Amount:</strong> {{ request.amount }} {{ request.loanToken }}</p>
              <p><strong>Rate:</strong> {{ request.rate }}% for {{ request.duration }} days</p>
              <p>
                <strong>Collateral:</strong> {{ request.collateralAmount }}
                {{ request.collateralToken }}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const recentLoans = ref([]) // Recent activity for the ribbon
const offers = ref([]) // Loan offers column
const requests = ref([]) // Loan requests column

// Live Metrics
const liveOffers = ref(0)
const liveRequests = ref(0)
const liveAssets = ref(0)

// Fetch loans from the backend
const fetchLoans = async () => {
  try {
    const response = await axios.get('http://localhost:5001/api/loans')
    const allLoans = response.data

    offers.value = allLoans.filter((loan) => loan.type === 'offer')
    requests.value = allLoans.filter((loan) => loan.type === 'request')

    // Update metrics
    liveOffers.value = offers.value.length
    liveRequests.value = requests.value.length
    liveAssets.value = allLoans.reduce((total, loan) => {
      const amountInUSD =
        loan.amount * (loan.loanToken === 'USDT' || loan.loanToken === 'USDC' ? 1 : 1000) // Example conversion
      return total + amountInUSD
    }, 0)

    // Set recent activity
    recentLoans.value = allLoans.slice(-10) // Show last 10 entries
  } catch (error) {
    console.error('Error fetching loans:', error)
  }
}

// Simulate live increment for offers, requests, and assets
const simulateLiveMetrics = () => {
  setInterval(() => {
    liveOffers.value += Math.floor(Math.random() * 2) // Increment randomly
    liveRequests.value += Math.floor(Math.random() * 2)
    liveAssets.value += Math.random() * 10 // Add a small amount to assets
  }, 2000) // Update every 2 seconds
}

// Fetch loans and start live simulation on mount
onMounted(() => {
  fetchLoans()
  simulateLiveMetrics()
})
</script>

<style scoped>
.home-view {
  text-align: center;
  margin-top: 20px;
  font-family: Arial, sans-serif;
}

.activity-ribbon {
  background-color: #007bff;
  color: white;
  padding: 10px;
  font-size: 14px;
  margin-bottom: 20px;
  overflow: hidden;
}

.activity {
  margin-right: 30px;
}

.metrics {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}

.metric {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  width: 150px;
}

.metric h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.metric p {
  margin: 0;
  font-size: 22px;
  font-weight: bold;
  color: #007bff;
}

.navigation-buttons {
  margin: 20px 0;
}

button {
  margin: 5px;
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
}

button:hover {
  background-color: #0056b3;
}

.all-loans {
  margin-top: 30px;
  text-align: left;
}

.loan-columns {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.loan-column {
  flex: 1;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.loan-column h3 {
  text-align: center;
  color: #007bff;
}

.loan-column ul {
  list-style: none;
  padding: 0;
}

.loan-column li {
  background-color: #fff;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
