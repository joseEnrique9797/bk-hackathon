import { Request, Response, NextFunction } from 'express';
import { Loan } from '../models/loan';
import { deployLoanContract } from '../services/brianKnowsService';
import dummyLoans from '../data/dummyLoans.json';
import solc from 'solc';

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
    
        loans.push(loan);  
    
        if (type === 'offer') {
            const prompt = `
            Create a loan contract where ${amount} of the ERC20 token ${loanToken} is loaned at ${rate}% interest for ${duration} days. 
            The collateral is ${collateralAmount} of the ERC20 token ${collateralToken}. 
            The offerer's address is ${wallet}. 
            The version of Solidity to use is pragma solidity ^0.8.0
            Include the "// SPDX-License-Identifier: MIT" comment at the top of the contract.
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
            
            const contractCode: any = await deployLoanContract(prompt);
            console.log('Contract code:', contractCode);
            let cleanedContractCode = contractCode.result.contract.replace(/^```solidity\s*/, '').replace(/```$/, '').trim();
            // console.log("First 11 characters:", cleanedContractCode.substring(0, 11));
            // cleanedContractCode = cleanedContractCode.substring(11, cleanedContractCode.length - 3).trim();
            console.log(cleanedContractCode);               // Trim any remaining whitespace
          
            
            const compiledContract = compileSolidity(cleanedContractCode);
            res.status(201).json({ loan, contractCode: compiledContract });
        } else {
            res.status(201).json(loan);
        }
    } catch (error) {
      next(error); // Pass error to the error handler
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

const compileSolidity = (solidityCode: string) => {
  solidityCode = solidityCode.replace(/@openzeppelin\/contracts\/utils\/ReentrancyGuard\.sol/g, '@openzeppelin/contracts/security/ReentrancyGuard.sol');
  console.log('Compiling Solidity code:', solidityCode);
  const fs = require('fs');
  const path = require('path');

  // Read OpenZeppelin dependencies
  const ierc20 = fs.readFileSync(
    './node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol',
    'utf8'
  );
  const safeERC20 = require('fs').readFileSync(
    './node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol',
    'utf8'
  );
  const ierc20Permit = fs.readFileSync(
    path.resolve('./node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol'),
    'utf8'
  );
  const reentrancyGuard = fs.readFileSync(
    path.resolve('./node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol'),
    'utf8'
  );
  const address = require('fs').readFileSync(
    './node_modules/@openzeppelin/contracts/utils/Address.sol',
    'utf8'
  );
  const context = require('fs').readFileSync(
    './node_modules/@openzeppelin/contracts/utils/Context.sol',
    'utf8'
  );
  const ownable = require('fs').readFileSync(
    './node_modules/@openzeppelin/contracts/access/Ownable.sol',
    'utf8'
  );

  // solidityCode = `
  // // SPDX-License-Identifier: MIT
  // pragma solidity ^0.8.0;
  // contract HelloWorld {
  //   string public message = "Hello, World!";
  // }`;
  console.log('Compiling Solidity code:', solidityCode);
  const input = {
    language: 'Solidity',
    sources: {
      'Contract.sol': { content: solidityCode },
      '@openzeppelin/contracts/token/ERC20/IERC20.sol': { content: ierc20 },
      '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol': { content: safeERC20 },
      '@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol': { content: ierc20Permit },
      '@openzeppelin/contracts/security/ReentrancyGuard.sol': { content: reentrancyGuard },
      '@openzeppelin/contracts/utils/Address.sol': { content: address },
      '@openzeppelin/contracts/utils/Context.sol': { content: context },
      '@openzeppelin/contracts/access/Ownable.sol': { content: ownable },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    console.error('Compiler errors:', output.errors);
    throw new Error('Compilation failed:\n' + output.errors.map((e: any) => e.formattedMessage).join('\n'));
  }

  const contractName = Object.keys(output.contracts['Contract.sol'])[0];
  const abi = output.contracts['Contract.sol'][contractName].abi;
  const bytecode = output.contracts['Contract.sol'][contractName].evm.bytecode.object;

  return { abi, bytecode };
};