"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loanController_1 = require("../controllers/loanController");
const router = (0, express_1.Router)();
router.post('/loans', loanController_1.createLoan);
router.get('/loans', loanController_1.getLoans);
router.get('/matches', loanController_1.matchLoans);
exports.default = router;
