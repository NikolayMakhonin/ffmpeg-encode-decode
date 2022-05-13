export function delay(milliseconds: number, abortSignal?: AbortSignal) {
    return new Promise<void>(resolve => {
        if (abortSignal && abortSignal.aborted) {
            resolve()
            return
        }

        const timer = setTimeout(resolve, milliseconds)

        if (abortSignal) {
            abortSignal.addEventListener('abort', () => {
                clearTimeout(timer)
                resolve()
            })
        }
    })
}
