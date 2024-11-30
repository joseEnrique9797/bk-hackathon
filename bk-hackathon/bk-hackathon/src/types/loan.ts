export interface Loan {
  id: string // Unique identifier for the loan
  type: 'offer' | 'request' // Loan type: offer or request
  wallet: string // Wallet address of the user
  amount: number // Loaned amount
  rate: number // Interest rate in percentage
  duration: number // Loan duration in days
  loanToken: string // ERC20 token used as the loaned asset
  collateralToken: string // ERC20 token used as collateral
  collateralAmount: number // Amount of the collateral token
  status: 'active' | 'matched' | 'closed' // Loan status
}
