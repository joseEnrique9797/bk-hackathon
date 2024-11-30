import { Router } from 'express';
import { createLoan, getLoans, matchLoans } from '../controllers/loanController';

const router = Router();

router.post('/loans', createLoan);
router.get('/loans', getLoans);
router.get('/matches', matchLoans);

export default router;
