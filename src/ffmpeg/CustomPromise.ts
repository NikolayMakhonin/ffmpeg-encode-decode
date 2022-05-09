export class CustomPromise<TResult = void> {
    readonly promise: Promise<TResult>
    readonly resolve: (result?: TResult) => void
    readonly reject: (error?: any) => void

    constructor() {
        let resolve: (result: TResult) => void
        let reject: (error: any) => void
        this.promise = new Promise<TResult>((_resolve, _reject) => {
            resolve = _resolve
            reject = _reject
        })
        this.resolve = resolve
        this.reject = reject
    }
}
