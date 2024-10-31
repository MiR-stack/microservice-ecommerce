"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const utils_1 = __importDefault(require("./utils"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json(), (0, morgan_1.default)("dev"), (0, cors_1.default)(), (0, helmet_1.default)());
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    handler: (_req, res) => {
        res.status(429).json({ msg: "too manay request. please try again later" });
    },
});
// Apply the rate limiting middleware to all requests.
app.use("api", limiter);
// helth check
app.use("/helth", (_req, res) => {
    res.status(200).json({ msg: "ok" });
});
// routes
(0, utils_1.default)(app);
// 404 error handle
app.use("*", (_req, res) => {
    res.status(404).json({ msg: "data not found" });
});
// global error handle
app.use((error, _req, res, _next) => {
    console.error(error.stack);
    res.status(500).json({ msg: "internal server error" });
});
// runnig server
const port = process.env.PORT || 8081;
const service = process.env.SERVICE || "api-gatway";
app.listen(port, () => {
    console.log(`${service} Running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map