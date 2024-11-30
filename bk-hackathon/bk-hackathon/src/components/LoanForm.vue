<template>
  <div class="loan-form">
    <h2>Create Loan Offer/Request</h2>
    <!-- Check if wallet is connected -->
    <div v-if="!wallet">
      <p>Please connect your wallet to create a loan offer or request.</p>
    </div>
    <form v-else @submit.prevent="submitLoan">
      <!-- Loan Type -->
      <label for="type">Type:</label>
      <select v-model="loanType" required>
        <option value="offer">Offer</option>
        <option value="request">Request</option>
      </select>

      <!-- Loan Details -->
      <label for="amount">Amount (Loaned):</label>
      <input type="number" v-model="amount" required placeholder="Enter loan amount" />

      <label for="rate">Interest Rate (%):</label>
      <input type="number" v-model="rate" required placeholder="Enter interest rate" />

      <label for="duration">Duration (days):</label>
      <input type="number" v-model="duration" required placeholder="Enter loan duration" />

      <!-- Loan Token -->
      <label for="loanToken">Loan Token (ERC20):</label>
      <input type="text" v-model="loanToken" required placeholder="Enter loan token (e.g., USDT)" />

      <!-- Collateral Details -->
      <label for="collateralToken">Collateral Token (ERC20):</label>
      <input
        type="text"
        v-model="collateralToken"
        required
        placeholder="Enter collateral token (e.g., DAI)"
      />

      <label for="collateralAmount">Collateral Amount:</label>
      <input
        type="number"
        v-model="collateralAmount"
        required
        placeholder="Enter collateral amount"
      />

      <!-- Submit Button with Spinner -->
      <button type="submit" :disabled="isLoading || !isFormValid">
        <span v-if="isLoading" class="spinner"></span>
        <span v-else>Submit</span>
      </button>

      <!-- Validation Error Message -->
      <p v-if="!isFormValid" class="error">Please fill in all fields before submitting.</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { useMainStore } from '../stores/useMainStore'

const store = useMainStore()
const wallet = store.account

// Form fields
const loanType = ref('offer')
const amount = ref('')
const rate = ref('')
const duration = ref('')
const loanToken = ref('')
const collateralToken = ref('')
const collateralAmount = ref('')
const isLoading = ref(false)

// Computed property to validate form
const isFormValid = computed(() => {
  return (
    wallet &&
    loanType.value &&
    amount.value &&
    rate.value &&
    duration.value &&
    loanToken.value &&
    collateralToken.value &&
    collateralAmount.value
  )
})

const submitLoan = async () => {
  if (!isFormValid.value) {
    alert('Please fill in all fields before submitting.')
    return
  }

  const payload = {
    type: loanType.value,
    amount: Number(amount.value),
    rate: Number(rate.value),
    duration: Number(duration.value),
    loanToken: loanToken.value,
    collateralToken: collateralToken.value,
    collateralAmount: Number(collateralAmount.value),
    wallet: wallet, // Use the connected wallet address
  }

  console.log('Submitting loan:', payload)

  isLoading.value = true // Show spinner

  try {
    await axios.post('http://localhost:5001/api/loans', payload)
    alert('Loan submitted successfully!')
    // Reset form after successful submission
    amount.value = ''
    rate.value = ''
    duration.value = ''
    loanToken.value = ''
    collateralToken.value = ''
    collateralAmount.value = ''
  } catch (error) {
    console.error('Error submitting loan:', error)
  } finally {
    isLoading.value = false // Hide spinner
  }
}
</script>

<style>
/* Add your existing or new styles here */
.loan-form {
  max-width: 400px;
  margin: 0 auto;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loan-form h2 {
  text-align: center;
}

.loan-form label {
  display: block;
  margin-top: 10px;
}

.loan-form input,
.loan-form select,
.loan-form button {
  width: 100%;
  margin-top: 5px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.loan-form button {
  background-color: #007bff;
  color: white;
  font-size: 16px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loan-form button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loan-form .spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top: 2px solid #007bff;
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

.loan-form .error {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}
</style>
