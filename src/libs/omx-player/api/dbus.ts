import { userInfo } from "os";

export const DBUS_PATH                       = "/org/mpris/MediaPlayer2";
export const DBUS_OMX_PLAYER_DESTINATION     = "org.mpris.MediaPlayer2.omxplayer";
export const DBUS_OMX_PLAYER_SESSION_ADDRESS = `/tmp/omxplayerdbus.${userInfo().username}`;

/*
 * omx player dbus interfaces
 * =============================================
 */
export const DBUS_OMX_PLAYER_INTERFACE_PLAYER = "org.mpris.MediaPlayer2.Player";

/*
 * omx player dbus player controls
 * =============================================
 */
export const DBUS_OMX_PLAYER_MEMBER_PAUSE  = "Pause";
export const DBUS_OMX_PLAYER_MEMBER_PLAY   = "Play";
export const DBUS_OMX_PLAYER_MEMBER_STOP   = "Stop";
export const DBUS_OMX_PLAYER_MEMBER_MUTE   = "Mute";
export const DBUS_OMX_PLAYER_MEMBER_UNMUTE = "Unmute";
