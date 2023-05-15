import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import {
  NODE_ENV,
  PORT,
  LOG_FORMAT,
  ORIGIN,
  CREDENTIALS,
  REDIS_HOST,
  REDIS_PORT,
} from '@config';
import DB from '@databases';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import BootFiles from './boot';
import passport from 'passport';
import path from 'path';
import http, { Server } from 'http';
import https, { Server as SecureServer } from 'https';
import { readFileSync } from 'fs';
import socketServer from './socket';
import redis from 'redis';
import connectRedis from 'connect-redis';
import session from 'express-session';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public bootFiles = new BootFiles();
  public socket: any;
  public httpServer: Server;
  public httpsServer: SecureServer;
  private credentials: { key: string; cert: string } = { key: '', cert: '' };

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, '/view'));
    this.connectToDatabase();
    this.initializeRedis();
    this.initializeSwagger();
    this.initializeMiddlewares();
    this.bootFiles.init();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
    this.httpServer = http.createServer(this.app);
    this.httpsServer = https.createServer(this.getCredentials(), this.app);
  }

  public getCredentials() {
    this.credentials.key = readFileSync(
      path.join(__dirname, '/cert/key.pem'),
      'utf8'
    );
    this.credentials.cert = readFileSync(
      path.join(__dirname, '/cert/cert.pem'),
      'utf8'
    );
    return this.credentials;
  }

  public listen() {
    this.httpServer = this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} ========`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
    this.socket = socketServer(this.httpServer);
    this.app.set('socket', this.socket);
  }

  public getServer() {
    return this.app;
  }

  private connectToDatabase() {
    DB.sequelize.sync({ force: false }).catch((err) => {
      return err;
    });
  }

  // private initializeRedis() {
  //   const RedisStore = new connectRedis(session);
  //   const redisClient = redis.createClient({
  //     DB_HOST: REDIS_HOST,
  //     DB_PORT: REDIS_PORT,
  //   });

  //   this.app.use(
  //     session({
  //       store: new RedisStore({ client: redisClient }),
  //       secret: 'your-secret',
  //       resave: false,
  //       saveUninitialized: false,
  //     })
  //   );
  // }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(passport.initialize());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use('/api', route.router);
      this.app.use(
        '/media',
        express.static(path.join(__dirname, '/public' || '/public/assets'))
      );
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        openapi: '3.0.0',
        components: {},
        info: {
          title: 'Stembotix API',
          version: '1.0.0',
          description:
            'Base URL: \n1. https://192.168.1.18:106:3000/api \n2. https://192.168.1.14:3000/api \n3. https://192.168.1.19:3000/api \n4. https://192.168.1.151:3000/api',
        },
      },
      apis: ['swagger.yaml'],
    };

    try {
      const specs = swaggerJSDoc(options);
      this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
    } catch (err) {
      return err;
    }
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
