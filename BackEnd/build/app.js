"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("dotenv").config();
// @ts-ignore
const express_1 = __importDefault(require("express"));
exports.app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_1 = require("./src/middleware/error");
const user_route_1 = __importDefault(require("./src/routes/user.route"));
const course_route_1 = __importDefault(require("./src/routes/course.route"));
const order_route_1 = __importDefault(require("./src/routes/order.route"));
const notifications_route_1 = __importDefault(require("./src/routes/notifications.route"));
const analytics_route_1 = __importDefault(require("./src/routes/analytics.route"));
const layout_route_1 = __importDefault(require("./src/routes/layout.route"));
exports.app.use(express_1.default.json({ limit: "50mb" }));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use((0, cors_1.default)({
    origin: process.env.ORIGIN,
}));
// Routes
exports.app.use("/api/v1", user_route_1.default, course_route_1.default, order_route_1.default, notifications_route_1.default, analytics_route_1.default, layout_route_1.default);
exports.app.get("/test", (req, res, next) => {
    res.status(200).json({
        succcess: true,
        messages: "API is working",
    });
});
exports.app.all("*", (req, res, next) => {
    const err = new Error(`Router ${req.originalUrl} is not found`);
    err.statusCode = 404;
    next(err);
});
exports.app.use(error_1.ErrorMiddleware);
