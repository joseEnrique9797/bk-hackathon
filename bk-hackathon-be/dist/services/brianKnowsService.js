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
exports.deployLoanContract = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const BASE_URL = 'https://api.brianknows.org';
const deployLoanContract = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `${BASE_URL}/api/v0/agent/smart-contract`;
    const headers = {
        'x-brian-api-key': env_1.config.brianApiKey,
        'Content-Type': 'application/json',
    };
    const body = {
        prompt,
        compile: true,
        messages: [{ sender: 'user', content: '' }],
    };
    try {
        const response = yield axios_1.default.post(url, body, { headers });
        return response.data.result.contract;
    }
    catch (error) {
        console.error('Error deploying smart contract:', error);
        throw new Error('Failed to deploy smart contract.');
    }
});
exports.deployLoanContract = deployLoanContract;
