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
import { ethers } from 'ethers'
import { useMainStore } from '../stores/useMainStore'
import { createSmartAccount, createSessionKey } from '../utils/functor'

const store = useMainStore()
const wallet = store.account // Connected wallet address from Pinia store

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

  isLoading.value = true

  if (!wallet) {
    alert('Please connect your wallet to create a loan offer or request.')
    isLoading.value = false
    return
  }

  try {
    // Prepare payload for backend
    const formattedAddress = ethers.getAddress(wallet)
    const payload = {
      type: loanType.value,
      amount: Number(amount.value),
      rate: Number(rate.value),
      duration: Number(duration.value),
      loanToken: loanToken.value,
      collateralToken: collateralToken.value,
      collateralAmount: Number(collateralAmount.value),
      wallet: formattedAddress, // Use the connected wallet address
    }

    console.log('Submitting loan payload:', payload)

    // Send payload to backend and get contract code
    const response = await axios.post('http://localhost:5001/api/loans', payload)
    console.log(response.data)

    // Extract contract code from backend response and the nested response structure
    const contractCode = response.data.contractCode

    // Remove Markdown formatting markers (` ```solidity ` and ` ``` `)
    // const cleanedContractCode = rawContractCode.replace(/```solidity|```/g, '')

    // Log the cleaned Solidity contract code
    // console.log('Contract code received:', cleanedContractCode)

    // Compile and deploy the contract using ethers.js
    if (!window.ethereum) {
      alert('Please install MetaMask or another wallet plugin!')
      return
    }

    // Request access to the wallet
    await window.ethereum.request({ method: 'eth_requestAccounts' })

    // Use BrowserProvider to interact with the injected wallet
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    // Get the wallet address
    const walletAddress = await signer.getAddress()

    // Get the chainId from the provider
    // const chainId = await provider.getNetwork().then((network) => network.chainId)

    // Get the nonce for the signer
    // const nonce = await provider.getTransactionCount(walletAddress)

    // Compile and deploy the contract
    const gasLimit = ethers.toBigInt(5000000)
    const gasPrice = ethers.parseUnits('10', 'gwei') // Optional: Set gas price
    console.log('ABI:', contractCode.abi)
    console.log('Bytecode:', contractCode.bytecode)
    console.log('GasLimit:', gasLimit)
    console.log('GasPrice:', gasPrice)
    console.log('Signer Address:', walletAddress)

    // const feeData = await provider.getFeeData()
    // const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas
    // const maxFeePerGas = feeData.maxFeePerGas

    // Replace these with your actual values
    // const loanTokenAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT
    // const collateralTokenAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' // WBTC

    // const factory = new ethers.ContractFactory(contractCode.abi, contractCode.bytecode, signer)
    // const contract = await factory.deploy({
    //   gasLimit: gasLimit,
    //   gasPrice: gasPrice,
    //   maxPriorityFeePerGas: maxPriorityFeePerGas,
    //   maxFeePerGas: maxFeePerGas,
    //   chainId: chainId,
    //   nonce: nonce,
    // })
    // await contract.waitForDeployment()

    // console.log(`Contract deployed at address: ${contract.target}`)

    // Attach deployed contract address to the loan offer
    // alert(`Contract deployed successfully at address: ${contract.target}`)
    // const FUNCTOR_API_KEY = import.meta.env.VITE_FUNCTOR_API_KEY!
    // console.log('FUNCTOR_API_KEY:', FUNCTOR_API_KEY)

    const allowedAddresses = ['0x5FbDB2315678afecb367f032d93F642f64180aa3']
    const smartAccount = (await createSmartAccount(walletAddress, allowedAddresses)) as {
      result: { sessionKey: string }
    }
    alert(`Contract deployed successfully at address ${smartAccount}`)
    const sessionKey = await createSessionKey(smartAccount.result.sessionKey)
    alert(`Session keys created successfully at address ${sessionKey}`)
  } catch (error) {
    console.error('Error submitting loan or deploying contract:', error)
    alert('An error occurred. Please try again.')
  } finally {
    isLoading.value = false
  }
}
</script>

<style>
/* Existing styles */
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
