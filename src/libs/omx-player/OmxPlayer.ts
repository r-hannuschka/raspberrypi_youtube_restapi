/**
 * OMX Player API
 * https://github.com/popcornmix/omxplayer
 *
 */
import { ChildProcess, spawn } from "child_process";
import * as dbus from "dbus-native";
import * as fs from "fs";
import * as OmxDbus from "./api/dbus";

export class OmxPlayer
{
    private dbusConnection;

    private omxPlayer: ChildProcess;

    private isActive: boolean = false;

    private videoQueue: string[];

    private options: Map<string, string>

    public constructor()
    {
        this.options = new Map();
        this.videoQueue = [];
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
    public play(video: string)
    {
        if ( this.isActive ) {
            this.videoQueue.push(video);
            return;
        }

        this.createOmxProcess(video);
        this.createDBusConnection();
        this.isActive = true;
    }

    /**
     * stop video
     *
     * @returns Promise<boolean>
     * @memberof OmxPlayer
     */
    public stop()
    {
        return this.sendDbusCommand(
            OmxDbus.DBUS_OMX_PLAYER_INTERFACE_PLAYER,
            OmxDbus.DBUS_OMX_PLAYER_MEMBER_STOP
        );
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
            "--dbus_name", OmxDbus.DBUS_OMX_PLAYER_DESTINATION
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

        this.isActive = false;
        this.omxPlayer = null;
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
        if ( ! this.isActive ) {
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
