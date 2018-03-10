import { IFileData } from "rh-download";
import { Config } from "rh-utils";

const config = Config.getInstance();
const image: IFileData = {
    fileName: config.get("data.youtube.defaultImage.file"),
    loaded: 0,
    name: "youtube video default image",
    path: config.get("data.youtube.defaultImage.path"),
    size: 0
}

export default image;
