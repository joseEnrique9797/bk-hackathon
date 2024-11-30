import { Request, Response, NextFunction } from 'express';
import { Loan } from '../models/loan';
import { deployLoanContract } from '../services/brianKnowsService';
import dummyLoans from '../data/dummyLoans.json';

// Preload dummy loans data
const offers: Loan[] = dummyLoans.offers.map(loan => ({ ...loan, type: loan.type as 'offer' | 'request', status: loan.status as 'active' | 'matched' | 'closed' }));
const requests: Loan[] = dummyLoans.requests.map(loan => ({ ...loan, type: loan.type as 'offer' | 'request', status: loan.status as 'active' | 'matched' | 'closed' }));
const loans: Loan[] = [...offers, ...requests];

export const createLoan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, wallet, amount, rate, duration, loanToken, collateralToken, collateralAmount } = req.body;

    if (!wallet || !loanToken || !collateralToken || amount <= 0 || collateralAmount <= 0) {
      res.status(400).json({ error: 'Invalid loan or collateral details' });
      return;
    }

    const loan: Loan = {
      id: `${Date.now()}`,
      type,
      wallet,
      amount,
      rate,
      duration,
      loanToken,
      collateralToken,
      collateralAmount,
      status: 'active',
    };

    if (type === 'offer') {
      const prompt = `
        Create a loan contract where ${amount} of the ERC20 token ${loanToken} is loaned at ${rate}% interest for ${duration} days. 
        The collateral is ${collateralAmount} of the ERC20 token ${collateralToken}. 
        The offerer's address is ${wallet}. 

        The contract must include:
        1. A function for a requester (borrower) to accept the loan, providing their wallet address and depositing the required collateral.
        2. A function to transfer the loan amount to the requester upon acceptance.
        3. State variables to track:
        - Loan terms (amount, rate, duration, loan token, collateral token, collateral amount).
        - The lender's and borrower's addresses.
        - The loan status (e.g., active, filled, repaid, defaulted).
        4. A function for the lender to claim collateral if the borrower fails to repay within the loan duration.
        5. A function for the borrower to repay the loan, which includes:
        - Principal amount.
        - Interest calculated based on the loan terms.
        - Release of the collateral back to the borrower upon successful repayment.
        6. Events for loan creation, acceptance, repayment, and collateral seizure for transparency.
      `;

      // Use the deployLoanContract service to deploy the contract
      const contractAddress = await deployLoanContract(prompt);

      if (contractAddress) {
        console.log('Contract deployed:', contractAddress);
        // loan.contractAddress = contractAddress; // Attach contract address to the offer
      } else {
        res.status(500).json({ error: 'Failed to deploy contract' });
        return;
      }
    }

    loans.push(loan);
    res.status(201).json(loan);
  } catch (error) {
    next(error);
  }
};


export const getLoans = (req: Request, res: Response) => {
  res.status(200).json(loans);
};

export const matchLoans = (req: Request, res: Response) => {
  const offers = loans.filter((loan) => loan.type === 'offer' && loan.status === 'active');
  const requests = loans.filter((loan) => loan.type === 'request' && loan.status === 'active');

  const matches: { offer: Loan; request: Loan }[] = [];

  // Perform matching logic
  offers.forEach((offer) => {
    const match = requests.find(
      (request) =>
        request.amount === offer.amount &&
        request.rate <= offer.rate &&
        request.duration <= offer.duration &&
        request.loanToken === offer.loanToken &&
        request.collateralToken === offer.collateralToken &&
        request.collateralAmount === offer.collateralAmount
    );

    if (match) {
      offer.status = 'matched';
      match.status = 'matched';
      matches.push({ offer, request: match });
    }
  });

  // Include already matched loans
  const alreadyMatched = loans.filter((loan) => loan.status === 'matched');

  alreadyMatched.forEach((matchedLoan) => {
    const offer = loans.find((loan) => loan.id === matchedLoan.id && loan.type === 'offer');
    const request = loans.find((loan) => loan.id === matchedLoan.id && loan.type === 'request');

    if (offer && request) {
      matches.push({ offer, request });
    }
  });

  res.status(200).json(matches);
};

