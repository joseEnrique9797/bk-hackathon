import { defineStore } from 'pinia'
import type { Loan } from '../types/loan'

export const useMainStore = defineStore('main', {
  state: () => ({
    account: null as string | null,
    loanOffers: [] as Array<Loan>,
    loanRequests: [] as Array<Loan>,
    // matches: [] as Array<{ id: number; matchDetail: string }>,
    matches: [] as { offer: Loan; request: Loan }[],
  }),
  actions: {
    setAccount(account: string | null) {
      this.account = account
    },
    setLoanOffers(offers: Array<Loan>) {
      this.loanOffers = offers
    },
    setLoanRequests(requests: Array<Loan>) {
      this.loanRequests = requests
    },
    setMatches(matches: { offer: Loan; request: Loan }[]) {
      this.matches = matches
    },
  },
})
