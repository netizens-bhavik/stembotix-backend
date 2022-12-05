import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from "@config";
import DB from "@databases";
import { Routes } from "@interfaces/routes.interface";
import errorMiddleware from "@middlewares/error.middleware";
import { logger, stream } from "@utils/logger";
import BootFiles from "./boot";
import passport from "passport";
import path from "path";
class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public bootFiles = new BootFiles();

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || "development";
    this.port = PORT || 3000;
    this.app.set("view engine", "ejs");
    this.app.set("views", path.join(__dirname, "/view"));
    this.connectToDatabase();
    this.initializeSwagger();
    this.initializeMiddlewares();
    this.bootFiles.init();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private connectToDatabase() {
    DB.sequelize.sync({ force: false });
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(passport.initialize());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use("/api", route.router);
      this.app.use("/api", route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        openapi: "3.0.0",
        components: {},
        info: {
          title: "Stembotix API",
          version: "1.0.0",
          description:
            "Base URL: \n1. https://192.168.1.106:3000/api \n2. https://192.168.1.14:3000/api",
        },
      },
      apis: ["swagger.yaml"],
    };

    try {
      const specs = swaggerJSDoc(options);
      this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
    } catch (err) {
      console.log(err);
    }
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
