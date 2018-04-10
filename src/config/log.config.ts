import * as path from "path";
import { ILogConfig } from "rh-utils";

export const logConfig: ILogConfig = {
    LogModule: {
        paths: {
            debug: path.resolve(process.cwd(), "./logs/debug.log"),
            error: path.resolve(process.cwd(), "./logs/error.log"),
        }
    }
};
