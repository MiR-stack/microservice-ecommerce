import { Express, Request, Response } from "express";
import { services } from "./config.json";
import axios from "axios";

const createHandler = (url: string, path: string, method: string) => {
  return async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (id) {
        path = path.replace(":id", id);
      }

      const { data } = await axios[method](`${url}${path}`, {
        ...req.body,
      });

      res.send(data);
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        return res.status(err.response?.status || 500).json(err.response?.data);
      }
      res.status(500).json({ msg: "internal server error" });
    }
  };
};

const configRoutes = (app: Express) => {
  Object.entries(services).forEach(([name, service]) => {
    service.routes.forEach((route) => {
      route.methods.forEach((method) => {
        const handler = createHandler(service.url, route.path, method);
        app[method](`/api/v1${route.path}`, handler);
      });
    });
  });
};

export default configRoutes;
