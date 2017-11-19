import { Request, Response, Router } from "express";
import { ControllerInterface } from "../api";
import { IEndpoint } from "../api/EndpointInterface";
import { SocketManager } from "../model/socket/SocketManager";
import { ISocketController } from "../api/socket/SocketControllerInterface";

export abstract class AbstractModule
{
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
    private controllerMap: Map<string, ControllerInterface> = new Map();

    /**
     * Creates an instance of AbstractModule.
     *
     * @param {Router} router
     * @memberof AbstractModule
     */
    constructor(router: Router) {
        this.router = router;
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

    protected registerController(route: string, controller: ControllerInterface)
    {
        if ( ! this.controllerMap.has(route) ) {
            this.controllerMap.set(route, controller);
        }
    }

    /**
     *
     * @param {String} channel
     * @param {ISocketController} controller
     */
    protected registerSocketController(channel: string, controller: ISocketController)
    {
        const socketManager = SocketManager.getInstance();
        const socketChannel = socketManager.createChannel(channel);
        socketChannel.setEndpoint( controller );
        controller.setChannel(socketChannel);
    }

    /**
     *
     * @private
     * @memberof AbstractModule
     */
    protected bootstrap()
    {
        this.configureRouter();
    }

    /**
     *
     * @private
     * @param {Request} req
     * @param {Response} res
     * @memberof AbstractController
     */
    protected processRequest( req: Request, res: Response ) {

        const action: string = req.params.action;
        const controller: string = req.params.controller;

        const controllerAction = `${controller}/${action}`;

        if ( ! this.controllerMap.has(controllerAction) ) {
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
        this.router.use( `${baseRoute}/:controller/:action?`, (req: Request, res: Response) => {
            this.processRequest(req, res);
        });
    }
}
