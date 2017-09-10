import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";

import errorHandler = require("errorhandler");

import { YoutubeModule } from "./module";

/**
 * The server.
 *
 * @class Server
 */
export class Server {

  public app: express.Application;

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

  /**
   * Configure application
   *
   * @class Server
   * @method config
   */
  public config() {
    this.app.use(express.static(path.join(__dirname, "public")));

    // use logger middleware
    this.app.use(logger("dev"));

    // use json from parser middlware
    this.app.use(bodyParser.json());

    // use query string parser middlware
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));

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

  /**
   * load module routes
   */
  private initializeModules() {

    this.app.use(YoutubeModule.getInstance().getRouter());
  }
}
