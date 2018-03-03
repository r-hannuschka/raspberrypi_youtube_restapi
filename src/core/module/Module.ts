import { Request, Response, Router } from "express";
import { ControllerInterface } from "./api";
import { PubSub } from "rh-utils";
import { ISocketController, Socket } from "@app-libs/socket";

export abstract class Module {
    /**
     * @private
     * @type {Router}
     * @memberof AbstractModule
     */
    protected router: Router;

    /**
     *
     * @private
     * @type {Map<string, ControllerInterface>}
     * @memberof AbstractModule
     */
    private controllerMap: Map<string, ControllerInterface>;

    /**
     * Creates an instance of AbstractModule.
     *
     * @param {Router} router
     * @memberof AbstractModule
     */
    constructor(router: Router) {
        this.router = router;
        this.controllerMap = new Map();
        this.bootstrap();
    }

    /**
     *
     * @abstract
     * @returns {string}
     * @memberof AbstractModule
     */
    public abstract getName(): string;

    /**
     * @returns {Router}
     * @memberof AbstractController
     */
    public getRouter(): Router {
        return this.router;
    }

    protected registerController(route: string, controller: ControllerInterface) {
        if (!this.controllerMap.has(route)) {
            this.controllerMap.set(route, controller);
        }
    }

    /**
     * register to publish subscribe to get notified on events
     *
     * @protected
     * @param {string} event 
     * @param {any} handler 
     * @memberof AbstractModule
     */
    protected registerEvent(event: string, handler) {
        PubSub.subscribe(event, handler.execute.bind(handler));
    }

    /**
     * register socket controller to socket manager and open new channel
     *
     * @param {String} channel
     * @param {ISocketController} controller
     */
    protected registerSocketController(channel: string, controller: ISocketController) {
        try {
            const socket = Socket.getInstance();
            const socketChannel = socket.createChannel(channel);
            socketChannel.setEndpoint(controller);
            controller.setChannel(socketChannel);
        } catch ( error ) {
            console.dir( Socket );
        }
    }

    /**
     *
     * @private
     * @memberof AbstractModule
     */
    protected bootstrap() {
        this.configureRouter();
    }


    /**
     * 
     * 
     * @protected
     * @param {Request} req 
     * @param {Response} res 
     * @memberof Module
     */
    protected processRequest(req: Request, res: Response) {

        const action: string = req.params.action;
        const controller: string = req.params.controller;

        const controllerAction = controller ? `${controller}/${action}` : `index/${action}`;

        if (!this.controllerMap.has(controllerAction)) {
            throw new Error("Controller not found");
        }

        const ctrl: ControllerInterface =
            this.controllerMap.get(controllerAction);

        ctrl.execute(req, res);
    }

    /**
     * apply routes to router
     *
     * @private
     * @memberof AbstractController
     */
    private configureRouter() {
        const baseRoute = `/api/${this.getName()}`;

        // index controller
        this.router.use(`${baseRoute}/:action`, (req: Request, res: Response) => {
            this.processRequest(req, res);
        });

        this.router.use(`${baseRoute}/:controller/:action?`, (req: Request, res: Response) => {
            this.processRequest(req, res);
        });
    }
}
