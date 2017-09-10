import { Request, Response } from "express";

export interface ControllerInterface
{
    /**
     *
     * @param {Request} req
     * @param {Response} res
     * @memberof ControllerInterface
     */
    execute( req: Request, res: Response);
}
