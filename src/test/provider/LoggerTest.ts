import { expect } from "chai";
import * as FileSystem from "fs";
import * as LineReader from "readline";
import { Logger } from "../../libs/log/Log";

describe("LoggerTest", () => {

    let logger: Logger;

    before(() => {
        logger = Logger.getInstance();
    });

    describe("test errors", () => {

        it("should throw error if directory not exists", (done) => {
            logger.log(Logger.LOG_DEBUG, { error: "path not exists" }, "/var/noLogsForYou")
                .then(() => {
                    done("path should not exists");
                })
                .catch((error) => {
                    expect(error.message).has.string(`/var/noLogsForYou is not an directory`);
                    done();
                });
        });
    });

    describe("test logging", () => {

        let path = __dirname;

        after(() => {
            const p = path.split("/");
            for (let i = 0; i < 2; i++) {
                try {
                    FileSystem.rmdirSync(p.join("/"));
                    // tslint:disable-next-line:no-empty
                } catch (e) { }
                p.splice(-1);
            }
        });

        before(() => {
            ["tmp", "logs"].forEach((name, index) => {
                path = `${path}/${name}`;
                try {
                    FileSystem.mkdirSync(path);
                } catch (e) {
                    // not empty
                }
            });
        });

        it("should log into tmp/logs/error.log", (done) => {
            const error = {
                file: __filename,
                type: "test error"
            };

            logger.log(Logger.LOG_ERROR, JSON.stringify(error), `${path}`)
                .then(() => {

                    const file = FileSystem.statSync(`${path}/${Logger.LOG_ERROR}.log`);

                    const lineReader = LineReader.createInterface({
                        input: FileSystem.createReadStream(`${path}/${Logger.LOG_ERROR}.log`)
                    });

                    let written: boolean = false;

                    lineReader.on("line", (line: string) => {
                        if (line.match(JSON.stringify(error))) {
                            written = true;
                        }
                    });

                    lineReader.on("close", () => {
                        // tslint:disable-next-line:no-unused-expression
                        expect(file.isFile()).to.be.true;
                        // tslint:disable-next-line:no-unused-expression
                        expect(written).to.be.true;
                        // remove file now
                        FileSystem.unlinkSync(`${path}/${Logger.LOG_ERROR}.log`);
                        done();
                    });
                })
                .catch((err) => {
                    done(err.message);
                });
        });

        it("should log into tmp/logs/debug.log", (done) => {
            const debug = {
                file: __filename,
                type: "debug message"
            };

            logger.log(
                Logger.LOG_DEBUG,
                JSON.stringify(debug),
                `${path}`
            )
                .then(() => {
                    const file = FileSystem.statSync(`${path}/${Logger.LOG_DEBUG}.log`);
                    const lineReader = LineReader.createInterface({
                        input: FileSystem.createReadStream(`${path}/${Logger.LOG_DEBUG}.log`)
                    });

                    let written: boolean = false;

                    lineReader.on("line", (line: string) => {
                        if (line.match(JSON.stringify(debug))) {
                            written = true;
                        }
                    });

                    lineReader.on("close", () => {
                        // tslint:disable-next-line:no-unused-expression
                        expect(file.isFile()).to.be.true;
                        // tslint:disable-next-line:no-unused-expression
                        expect(written).to.be.true;
                        // remove file now
                        FileSystem.unlinkSync(`${path}/${Logger.LOG_DEBUG}.log`);
                        done();
                    });
                })
                .catch((err) => {
                    done(err.message);
                });
        });
    });
});
