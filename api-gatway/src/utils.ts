import { Express, Request, Response } from "express";
import { services } from "./config.json";
import axios from "axios";
import middlewares from "./middlewares";

const createHandler = (url: string, path: string, method: string) => {
  return async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (id) {
        path = path.replace(":id", id);
      }

      console.log("before axios call");
      const { data } = await axios[method](
        `${url}${path}`,
        {
          ...req.body,
        },
        {
          Headers: {
            ...req.headers,
          },
        }
      );
      console.log("after axios call");

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
  Object.entries(services).forEach(([_name, service]) => {
    service.routes.forEach((route) => {
      route.methods.forEach((method) => {
        const handler = createHandler(service.url, route.path, method);

        // add middlewares
        const Middlewares =
          route.middlewares?.map((middleware) => {
            return middlewares[middleware];
          }) || [];

        app[method](`/api/v1${route.path}`, ...Middlewares, handler);
      });
    });
  });
};

export default configRoutes;
