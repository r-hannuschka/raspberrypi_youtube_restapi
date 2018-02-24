import { IChannel } from ".";
import { IEndpoint } from "./EndpointInterface";

export interface ISocketController extends IEndpoint
{
    setChannel( channel: IChannel ): void;
}
