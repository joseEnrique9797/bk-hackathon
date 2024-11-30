import express from 'express';
import loansRouter from './routes/loans';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config/env';

const app = express();

// Enable CORS for all origins or specify allowed origins
app.use(cors({ origin: 'http://localhost:5173' }));

app.use(express.json());
app.use('/api', loansRouter);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});
