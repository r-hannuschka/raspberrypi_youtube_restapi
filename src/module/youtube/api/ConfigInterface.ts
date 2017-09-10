export interface ConfigInterface
{
    api: {
        host: string,
        key: string,
        basePath: string,
        action: {
            list: string,
            search: string
        }
    }
}
