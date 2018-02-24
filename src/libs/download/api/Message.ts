export interface IMessage {
    state: string,
    data?: {
        loaded: number,
        total: number
    },
    error?: string,
    processId: string
};