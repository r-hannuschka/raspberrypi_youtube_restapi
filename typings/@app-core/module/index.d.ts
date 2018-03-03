declare module '@app-core/module' {

    import { ISocketController, Socket } from "@app-libs/socket";
    import { Request, Response, Router } from "express";

    interface RouterInterface {
        path: string;

        action: string;
    }

    interface ControllerInterface
    {
        execute( req: Request, res: Response);
    }

    abstract class Module {

        public abstract getName(): string;

        constructor(router: Router);

        public getRouter(): Router;

        protected bootstrap();

        protected processRequest(req: Request, res: Response);

        protected registerController(route: string, controller: ControllerInterface);

        protected registerEvent(event: string, handler: () => {});

        protected registerSocketController(channel: string, controller: ISocketController);
    }
}