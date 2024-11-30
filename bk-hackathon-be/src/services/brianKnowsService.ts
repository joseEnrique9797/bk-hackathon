import axios from 'axios';
import { config } from '../config/env';

const BASE_URL = 'https://api.brianknows.org';

export const deployLoanContract = async (prompt: string): Promise<string> => {
  const url = `${BASE_URL}/api/v0/agent/smart-contract`;
  const headers = {
    'x-brian-api-key': config.brianApiKey,
    'Content-Type': 'application/json',
  };

  const body = {
    prompt,
    compile: true,
    messages: [{ sender: 'user', content: '' }],
  };

  try {
    const response = await axios.post(url, body, { headers });
    return response.data.result.contract;
  } catch (error) {
    console.error('Error deploying smart contract:', error);
    throw new Error('Failed to deploy smart contract.');
  }
};
