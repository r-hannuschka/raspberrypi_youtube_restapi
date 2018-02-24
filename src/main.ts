import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import { SocketIO } from "socket.io";
import { Socket } from "./libs/socket/Socket";

import errorHandler = require("errorhandler");

import { VideoModule, YoutubeModule } from "./module";

/**
 * The server.
 *
 * @class Server
 */
export class Server {

  public app: express.Application;

  public socketIO: SocketIO;

  private router: express.Router;

  /**
   * Bootstrap the application.
   *
   * @class Server
   * @method bootstrap
   * @static
   * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
   */
  public static bootstrap(): Server {
    return new Server();
  }

  /**
   * Constructor
   *
   * @class Server
   * @constructor
   */
  constructor() {
    // create expressjs application
    this.app = express();

    // configure application
    this.config();

    this.initializeModules();
  }

  public getApp(): Express.Application
  {
    return this.app;
  }

  public addSocketIO(socket)
  {
    const socketManager = Socket.getInstance();
    socketManager.setConnection(socket)
  }

  /**
   * Configure application
   *
   * @class Server
   * @method config
   */
  public config() {

    // this.app.use(express.static(path.join(__dirname, "public")));
    this.app.use("/media", express.static(path.join(__dirname, "../media")));

    // use logger middleware
    this.app.use(logger("dev"));

    // use json from parser middlware
    this.app.use(bodyParser.json());

    // use query string parser middlware
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));

    this.app.use( (req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
      res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      next();
    });

    this.app.use(cookieParser("YOUTUBE_REST_API"));

    // create router
    this.router = express.Router();
    this.app.use(this.router);

    // catch 404 and forward to error handler
    this.app.use((
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      err.status = 404;
      next(err);
    });

    this.app.use(errorHandler());
  }

  private initializeModules() {
    new YoutubeModule( this.router );
    new VideoModule( this.router );
  }
}
