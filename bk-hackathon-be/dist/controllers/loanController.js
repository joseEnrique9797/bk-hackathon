"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchLoans = exports.getLoans = exports.createLoan = void 0;
const brianKnowsService_1 = require("../services/brianKnowsService");
const dummyLoans_json_1 = __importDefault(require("../data/dummyLoans.json"));
const solc_1 = __importDefault(require("solc"));
// Preload dummy loans data
const offers = dummyLoans_json_1.default.offers.map(loan => (Object.assign(Object.assign({}, loan), { type: loan.type, status: loan.status })));
const requests = dummyLoans_json_1.default.requests.map(loan => (Object.assign(Object.assign({}, loan), { type: loan.type, status: loan.status })));
const loans = [...offers, ...requests];
const createLoan = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, wallet, amount, rate, duration, loanToken, collateralToken, collateralAmount } = req.body;
        if (!wallet || !loanToken || !collateralToken || amount <= 0 || collateralAmount <= 0) {
            res.status(400).json({ error: 'Invalid loan or collateral details' });
            return;
        }
        const loan = {
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
            const contractCode = yield (0, brianKnowsService_1.deployLoanContract)(prompt);
            console.log('Contract code:', contractCode);
            let cleanedContractCode = contractCode.result.contract.replace(/^```solidity\s*/, '').replace(/```$/, '').trim();
            // console.log("First 11 characters:", cleanedContractCode.substring(0, 11));
            // cleanedContractCode = cleanedContractCode.substring(11, cleanedContractCode.length - 3).trim();
            console.log(cleanedContractCode); // Trim any remaining whitespace
            const compiledContract = compileSolidity(cleanedContractCode);
            res.status(201).json({ loan, contractCode: compiledContract });
        }
        else {
            res.status(201).json(loan);
        }
    }
    catch (error) {
        next(error); // Pass error to the error handler
    }
});
exports.createLoan = createLoan;
const getLoans = (req, res) => {
    res.status(200).json(loans);
};
exports.getLoans = getLoans;
const matchLoans = (req, res) => {
    const offers = loans.filter((loan) => loan.type === 'offer' && loan.status === 'active');
    const requests = loans.filter((loan) => loan.type === 'request' && loan.status === 'active');
    const matches = [];
    // Perform matching logic
    offers.forEach((offer) => {
        const match = requests.find((request) => request.amount === offer.amount &&
            request.rate <= offer.rate &&
            request.duration <= offer.duration &&
            request.loanToken === offer.loanToken &&
            request.collateralToken === offer.collateralToken &&
            request.collateralAmount === offer.collateralAmount);
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
exports.matchLoans = matchLoans;
const compileSolidity = (solidityCode) => {
    solidityCode = solidityCode.replace(/@openzeppelin\/contracts\/utils\/ReentrancyGuard\.sol/g, '@openzeppelin/contracts/security/ReentrancyGuard.sol');
    console.log('Compiling Solidity code:', solidityCode);
    const fs = require('fs');
    const path = require('path');
    // Read OpenZeppelin dependencies
    const ierc20 = fs.readFileSync('./node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol', 'utf8');
    const safeERC20 = require('fs').readFileSync('./node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol', 'utf8');
    const ierc20Permit = fs.readFileSync(path.resolve('./node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol'), 'utf8');
    const reentrancyGuard = fs.readFileSync(path.resolve('./node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol'), 'utf8');
    const address = require('fs').readFileSync('./node_modules/@openzeppelin/contracts/utils/Address.sol', 'utf8');
    const context = require('fs').readFileSync('./node_modules/@openzeppelin/contracts/utils/Context.sol', 'utf8');
    const ownable = require('fs').readFileSync('./node_modules/@openzeppelin/contracts/access/Ownable.sol', 'utf8');
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
    const output = JSON.parse(solc_1.default.compile(JSON.stringify(input)));
    if (output.errors) {
        console.error('Compiler errors:', output.errors);
        throw new Error('Compilation failed:\n' + output.errors.map((e) => e.formattedMessage).join('\n'));
    }
    const contractName = Object.keys(output.contracts['Contract.sol'])[0];
    const abi = output.contracts['Contract.sol'][contractName].abi;
    const bytecode = output.contracts['Contract.sol'][contractName].evm.bytecode.object;
    return { abi, bytecode };
};
