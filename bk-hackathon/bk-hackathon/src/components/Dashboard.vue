<template>
  <div class="dashboard">
    <h2>Dashboard</h2>

    <!-- Offers and Requests Columns -->
    <div class="columns">
      <!-- Loan Offers -->
      <div class="column">
        <h3>Your Offers</h3>
        <div v-if="isLoadingOffers" class="spinner"></div>
        <ul v-else-if="loanOffers.length > 0">
          <li v-for="offer in loanOffers" :key="offer.id">
            <p><strong>Amount:</strong> {{ offer.amount }} {{ offer.loanToken }}</p>
            <p><strong>Rate:</strong> {{ offer.rate }}%</p>
            <p><strong>Duration:</strong> {{ offer.duration }} days</p>
            <p>
              <strong>Collateral:</strong> {{ offer.collateralAmount }} {{ offer.collateralToken }}
            </p>
          </li>
        </ul>
        <p v-else>No offers available.</p>
      </div>

      <!-- Loan Requests -->
      <div class="column">
        <h3>Your Requests</h3>
        <div v-if="isLoadingRequests" class="spinner"></div>
        <ul v-else-if="loanRequests.length > 0">
          <li v-for="request in loanRequests" :key="request.id">
            <p><strong>Amount:</strong> {{ request.amount }} {{ request.loanToken }}</p>
            <p><strong>Rate:</strong> {{ request.rate }}%</p>
            <p><strong>Duration:</strong> {{ request.duration }} days</p>
            <p>
              <strong>Collateral:</strong> {{ request.collateralAmount }}
              {{ request.collateralToken }}
            </p>
          </li>
        </ul>
        <p v-else>No requests available.</p>
      </div>
    </div>

    <!-- Matches Section -->
    <div class="matches">
      <h3>Matches</h3>
      <div v-if="isLoadingMatches" class="spinner"></div>
      <ul v-else-if="matches.length > 0">
        <li v-for="match in matches" :key="match.offer.id">
          <p>
            <strong>Offer:</strong> {{ match.offer.amount }} {{ match.offer.loanToken }} at
            {{ match.offer.rate }}%
          </p>
          <p>
            <strong>Request:</strong> {{ match.request.amount }} {{ match.request.loanToken }} by
            {{ match.request.wallet }}
          </p>
        </li>
      </ul>
      <p v-else>No matches available.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Loan } from '../types/loan' // Import the Loan type
import { useMainStore } from '../stores/useMainStore'
import axios from 'axios'

const store = useMainStore()

// Reactive properties
const loanOffers = ref<Loan[]>([]) // Typed with Loan[]
const loanRequests = ref<Loan[]>([]) // Typed with Loan[]
const matches = ref<{ offer: Loan; request: Loan }[]>([]) // Matches have both offer and request typed

// Loading states
const isLoadingOffers = ref(false)
const isLoadingRequests = ref(false)
const isLoadingMatches = ref(false)

// Fetch Offers
const fetchOffers = async () => {
  isLoadingOffers.value = true
  try {
    const response = await axios.get('http://localhost:5001/api/loans')
    loanOffers.value = response.data.filter(
      (loan: Loan) =>
        loan.type === 'offer' &&
        store.account &&
        loan.wallet.toLowerCase() === store.account.toLowerCase(),
    )
    store.loanOffers = loanOffers.value // Sync with store
  } catch (error) {
    console.error('Error fetching loan offers:', error)
  } finally {
    isLoadingOffers.value = false
  }
}

// Fetch Requests
const fetchRequests = async () => {
  isLoadingRequests.value = true
  try {
    const response = await axios.get('http://localhost:5001/api/loans')
    loanRequests.value = response.data.filter(
      (loan: Loan) => loan.type === 'request' && loan.wallet === store.account,
    )
    store.loanRequests = loanRequests.value // Sync with store
  } catch (error) {
    console.error('Error fetching loan requests:', error)
  } finally {
    isLoadingRequests.value = false
  }
}

// Fetch Matches
const fetchMatches = async () => {
  isLoadingMatches.value = true

  try {
    const response = await axios.get('http://localhost:5001/api/matches')
    matches.value = response.data.filter((match: { offer: Loan; request: Loan }) => {
      const isOfferMatch =
        store.account && match.offer.wallet.toLowerCase() === store.account.toLowerCase()
      const isRequestMatch =
        store.account && match.request.wallet.toLowerCase() === store.account.toLowerCase()

      return isOfferMatch || isRequestMatch // Include matches where the user is involved
    })
    store.matches = matches.value // Sync with store
  } catch (error) {
    console.error('Error fetching matches:', error)
  } finally {
    isLoadingMatches.value = false
  }
}

// Fetch all data on mount
onMounted(() => {
  fetchOffers()
  fetchRequests()
  fetchMatches()
})
</script>

<style scoped>
.dashboard {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard h2 {
  text-align: center;
  margin-bottom: 20px;
}

.columns {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.column {
  width: 48%;
  background: #ffffff;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.matches {
  margin-top: 30px;
  background: #ffffff;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.matches h3 {
  margin-bottom: 15px;
}

.spinner {
  margin: 20px auto;
  width: 24px;
  height: 24px;
  border: 3px solid #ddd;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
