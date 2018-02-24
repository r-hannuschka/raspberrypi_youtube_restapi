import { isObject } from "util";
import { config } from "../etc/config";

export class AppConfig
{
    public static get(path): any {
        const route = path.split(".");
        let value = null;
        let item  = route.splice(0, 1);
        let configData = Object.assign({}, config);

        while ( item ) {

            if ( configData.hasOwnProperty(item) ) {

                value = configData[item];

                if ( isObject(value) ) {
                    configData = value;
                }

                item = route.length ? route.splice(0, 1) : null;
                continue;
            }
            break;
        }
        return value;
    }
}
