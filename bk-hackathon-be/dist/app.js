"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const loans_1 = __importDefault(require("./routes/loans"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middleware/errorHandler");
const env_1 = require("./config/env");
const app = (0, express_1.default)();
// Enable CORS for all origins or specify allowed origins
app.use((0, cors_1.default)({ origin: 'http://localhost:5173' }));
app.use(express_1.default.json());
app.use('/api', loans_1.default);
app.use(errorHandler_1.errorHandler);
app.listen(env_1.config.port, () => {
    console.log(`Server is running on http://localhost:${env_1.config.port}`);
});
