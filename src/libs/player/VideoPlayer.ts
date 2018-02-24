import { IPlayer } from "../../api/PlayerInterface";

export class VideoPlayer {

    private player: IPlayer;

    public setPlayer(player: IPlayer)
    {
        this.player = player;
    }

    public play(file)
    {
        this.player.play();
    }
}
