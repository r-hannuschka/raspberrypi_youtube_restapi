import { IChannel, IEndpoint } from "@app-libs/socket";

export interface ISocketController extends IEndpoint
{
    setChannel( channel: IChannel ): void;
}
