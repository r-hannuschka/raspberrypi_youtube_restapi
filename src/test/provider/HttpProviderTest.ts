import { expect } from "chai";
import * as nock from "nock";
import * as sinon from "sinon";
import { ResponseInterface } from "../../api";
import { HttpProvider } from "../../provider/HttpProvider";
import { PostRequest, Response } from "../mockup";

describe("testing http provider", () => {

    let httpProvider: HttpProvider = null;
    let server;

    beforeEach(() => {
        server = nock("http://post.local.de:8080");
        httpProvider = new HttpProvider();
        sinon.stub(httpProvider, "getResponse")
            .returns(new Response());
    });

    describe("HttpProvider::send should allways return ResponseInterface", () => {

        let request: PostRequest;

        beforeEach(() => {
            request = new PostRequest();
        })

        /**
         * test 200 response
         */
        it("should not fail on default response", async () => {
            server.post(
                `/${request.getBasePath()}/${request.getPath()}`,
                request.getBody()
            ).reply(200, {
                body: {
                    users: [
                        {
                            id: 1,
                            name: "Testuser 1"
                        },
                        {
                            id: 2,
                            name: "Testuser 2"
                        }
                    ]
                }
            });

            const postRequest: HttpProvider = httpProvider;
            const postRespone: ResponseInterface = await postRequest.send(request);

            expect(postRespone).to.be.instanceof(Response);
        });

        /**
         * test 404 response
         */
        it("404 response should not fail", async () => {

            server.post(
                `/${request.getBasePath()}/${request.getPath()}`,
                request.getBody()
            ).reply(404, {
                foo: "bar"
            });

            const postRequest: HttpProvider = httpProvider;
            const postRespone: ResponseInterface = await postRequest.send(request);
            expect(postRespone).to.be.instanceof(Response);
        });

        /**
         * test json body sends wrong data
         */
        it("should not fail on json parse error", async () => {

            server.post(
                `/${request.getBasePath()}/${request.getPath()}`,
                request.getBody()
            ).reply(200, "[1, ,2 ,3 4, 5]");

            const postRequest: HttpProvider = httpProvider;
            const postRespone: ResponseInterface = await postRequest.send(request);
            expect(postRespone).to.be.instanceof(Response);
        });
    })
});
