"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_json_1 = require("./config.json");
const axios_1 = __importDefault(require("axios"));
const createHandler = (url, path, method) => {
    return async (req, res) => {
        try {
            const { id } = req.params;
            if (id) {
                path = path.replace(":id", id);
            }
            const { data } = await axios_1.default[method](`${url}${path}`, {
                ...req.body,
            });
            res.send(data);
        }
        catch (err) {
            if (err instanceof axios_1.default.AxiosError) {
                return res.status(err.response?.status || 500).json(err.response?.data);
            }
            res.status(500).json({ msg: "internal server error" });
        }
    };
};
const configRoutes = (app) => {
    Object.entries(config_json_1.services).forEach(([name, service]) => {
        service.routes.forEach((route) => {
            route.methods.forEach((method) => {
                const handler = createHandler(service.url, route.path, method);
                app[method](`/api/v1${route.path}`, handler);
            });
        });
    });
};
exports.default = configRoutes;
//# sourceMappingURL=utils.js.map