/**
 * OMX Player API
 * https://github.com/popcornmix/omxplayer
 *
 */
import { IVideoFile } from "@app-core/video";
import { ChildProcess, spawn } from "child_process";
import * as dbus from "dbus-native";
import * as fs from "fs";
import { Observable } from "rh-utils";
import * as OmxApi from "./api/actions";
import * as OmxDbus from "./api/dbus";

export class OmxPlayer extends Observable<any>
{
    private dbusConnection;

    private omxPlayer: ChildProcess;

    private active: boolean = false;

    private videoQueue: IVideoFile[];

    private options: Map<string, string>

    private static instance: OmxPlayer = new OmxPlayer();

    /**
     * current playing video file
     *
     * @private
     * @type {IVideoFile}
     * @memberof OmxPlayer
     */
    private video: IVideoFile;

    public constructor()
    {
        super();

        if ( OmxPlayer.instance ) {
            throw new Error("could not create instance, use OmxPlayer.getInstance() instead");
        }

        this.options = new Map();
        this.videoQueue = [];

        return this;
    }

    /**
     * returns instance of omx player lib
     *
     * @static
     * @returns
     * @memberof OmxPlayer
     */
    public static getInstance()
    {
        return OmxPlayer.instance;
    }

    /**
     * pass options
     * like OmxPlayer.setOption('--display', 'hdmi')
     *
     * @param optionValues
     */
    public addOption(optionName: string, optionValue: string = "")
    {
        this.options.set(optionName, optionValue)
    }

    /**
     * return current video is playing
     *
     * @returns {IVideoFile}
     * @memberof OmxPlayer
     */
    public getCurrentPlayingVideo(): IVideoFile
    {
        return this.video;
    }

    /**
     * return current video queue
     *
     * @returns {IVideoFile[]}
     * @memberof OmxPlayer
     */
    public getVideoQueue(): IVideoFile[]
    {
        return this.videoQueue;
    }

    public isActive(): boolean
    {
        return this.active;
    }

    /**
     * mute player
     *
     * @returns Promise<boolean>
     * @memberof OmxPlayer
     */
    public mute()
    {
        return this.sendDbusCommand(
            OmxDbus.DBUS_OMX_PLAYER_INTERFACE_PLAYER,
            OmxDbus.DBUS_OMX_PLAYER_MEMBER_MUTE
        );
    }

    /**
     * pause player
     *
     * @returns Promise<boolean>
     * @memberof OmxPlayer
     */
    public pause()
    {
        return this.sendDbusCommand(
            OmxDbus.DBUS_OMX_PLAYER_INTERFACE_PLAYER,
            OmxDbus.DBUS_OMX_PLAYER_MEMBER_PAUSE
        );
    }

    /**
     * starts new video
     *
     * @private
     * @param {string} video
     * @memberof OmxPlayer
     */
    public play(video: IVideoFile)
    {
        if ( this.active ) {
            this.videoQueue.push(video);
            this.publish(
                {
                    action: OmxApi.OMX_PLAYER_ACTION_ADD_VIDEO_TO_QUEUE,
                    video
                },
                OmxApi.PUBSUB_TOPIC
            );
            return;
        }

        this.active = true;

        const videoPath = video.getPath() + "/" + video.getFile();
        this.video = video;

        this.publish(
            {
                action: OmxApi.OMX_PLAYER_ACTION_PLAY_VIDEO,
                video
            },
            OmxApi.PUBSUB_TOPIC
        );

        this.createOmxProcess(videoPath);
        this.createDBusConnection();
    }

    /**
     * stop video
     *
     * @returns Promise<boolean>
     * @memberof OmxPlayer
     */
    public stop(clearQueue = true)
    {
        if ( clearQueue ) {
            this.videoQueue = [];
        }

        return this.sendDbusCommand(
            OmxDbus.DBUS_OMX_PLAYER_INTERFACE_PLAYER,
            OmxDbus.DBUS_OMX_PLAYER_MEMBER_STOP
        );
    }

    /**
     * stop video and get a new one
     *
     * @memberof OmxPlayer
     */
    public skipVideo()
    {
        if ( this.videoQueue.length ) {
            this.stop(false);
        }
    }

    /**
     * unmute player
     *
     * @returns Promise<boolean>
     * @memberof OmxPlayer
     */
    public async unmute()
    {
        return this.sendDbusCommand(
            OmxDbus.DBUS_OMX_PLAYER_INTERFACE_PLAYER,
            OmxDbus.DBUS_OMX_PLAYER_MEMBER_UNMUTE
        );
    }

    /**
     * resume video playback
     *
     * @returns Promise<boolean>
     * @memberof OmxPlayer
     */
    public unpause()
    {
        return this.sendDbusCommand(
            OmxDbus.DBUS_OMX_PLAYER_INTERFACE_PLAYER,
            OmxDbus.DBUS_OMX_PLAYER_MEMBER_PLAY
        );
    }

    /**
     * create dbus connection
     *
     * @private
     * @memberof OmxPlayer
     */
    private createDBusConnection()
    {
        if ( ! this.dbusConnection ) {
            const dbusOptions = {
                busAddress: fs.readFileSync(OmxDbus.DBUS_OMX_PLAYER_SESSION_ADDRESS, "utf8" ).trim()
            };
            this.dbusConnection = dbus.sessionBus(dbusOptions);
        }
    }

    /**
     * create new omxplayer process
     *
     * @private
     * @param {string} file
     * @memberof OmxPlayer
     */
    private createOmxProcess(file: string)
    {
        const options: string[] = [
            "--dbus_name", OmxDbus.DBUS_OMX_PLAYER_DESTINATION,
            "--blank"
        ];

        this.options.forEach( (value: string, key: string) => {
            options.push(key);
            if ( value.replace(/(^\s*|\s*$)/, "").length ) {
                options.push(value);
            };
        });

        const process: ChildProcess = spawn(
            "omxplayer",
            [
                ...options,
                file
            ],
            {
                stdio: "pipe"
            }
        );

        process.on("error", (err) => this.onOmxPlayerError());
        process.on("close", () => this.onOmxPlayerClose());

        process.stderr.on("data", (data) => {
            console.log ( data.toString() );
        });

        this.omxPlayer = process;
    }

    /**
     * handle omx player close event
     *
     * @private
     * @memberof OmxPlayer
     */
    private onOmxPlayerClose()
    {
        const nextVideo = this.videoQueue.shift();

        this.omxPlayer.removeAllListeners();

        this.publish(
            {
                action: OmxApi.OMX_PLAYER_ACTION_CLOSE,
                video: this.video
            },
            OmxApi.PUBSUB_TOPIC
        );

        this.active         = false;
        this.video          = null;
        this.omxPlayer      = null;
        this.dbusConnection = null;

        if ( nextVideo ) {
            this.play(nextVideo);
        }
    }

    /**
     * handle omxplayer error event
     *
     * @private
     * @memberof OmxPlayer
     */
    private onOmxPlayerError()
    {
        console.log ( arguments );
    }

    /**
     * send command via dbus interface to running omxplayer instance
     *
     * @private
     * @param {string} dbusInterface
     * @param {string} member
     * @returns {Promise<any>}
     * @memberof OmxPlayer
     */
    private sendDbusCommand(dbusInterface: string, member: string): Promise<any>
    {
        if ( ! this.active ) {
            return Promise.reject("omx player not running");
        }

        return new Promise( (resolve, reject) => {

            if ( ! this.dbusConnection ) {
                reject("no dbus connection");
            }

            this.dbusConnection.invoke(
                {
                    destination: OmxDbus.DBUS_OMX_PLAYER_DESTINATION,
                    interface: dbusInterface,
                    member,
                    path: OmxDbus.DBUS_PATH
                },
                (err) => {
                    if ( err ) {
                        console.log(err);
                    }
                    resolve(true);
                }
            );
        })
    }
}
