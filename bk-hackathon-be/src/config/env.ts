import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  brianApiKey: process.env.BRIAN_API_KEY || '',
};
