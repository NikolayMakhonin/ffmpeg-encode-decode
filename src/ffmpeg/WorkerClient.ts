import {Worker} from 'worker_threads'

export class WorkerClient {
  worker: Worker
  private readonly _responseFilter: (response: any, err: Error, requestId: number) => boolean
  private readonly _getResponseValue: (response: any) => any
  private readonly _createRequest: (value: any, requestId: number) => any

  private _error: Error
  private _exitCode: number

  constructor({
    worker,
    responseFilter,
    getResponseValue,
    createRequest,
  }: {
    worker: Worker
    responseFilter: (response: any, err: Error, requestId: number) => boolean
    getResponseValue: (response: any) => any
    createRequest: (value: any, requestId: number) => any
  }) {
    this.worker = worker
    this._responseFilter = responseFilter
    this._getResponseValue = getResponseValue
    this._createRequest = createRequest
    this.worker.on('error', (err) => {
      this._error = err
    })
    this.worker.on('exit', (code) => {
      this._exitCode = code
    })
  }

  private _nextRequestId = 1
  request<TResult>(message: any, onExit?: (code: number) => TResult): Promise<TResult> {
    if (this._error) {
      throw this._error
    }
    if (this._exitCode != null) {
      throw new Error(`Worker exited: exit code is ${this._exitCode}`)
    }

    const requestId = this._nextRequestId++
    const promise = new Promise<TResult>((resolve, reject) => {
      this.worker.on('message', (value) => {
        if (value && this._responseFilter(value, null, requestId)) {
          try {
            resolve(this._getResponseValue(value))
          } catch (err) {
            reject(err)
          }
        }
      })
      this.worker.on('error', (err) => {
        reject(err)
      })
      this.worker.on('exit', (code) => {
        try {
          if (!onExit) {
            reject(new Error(`exit code is ${code}`))
          } else {
            resolve(onExit(code))
          }
        } catch (err) {
          reject(err)
        }
      })
    })

    this.worker.postMessage(this._createRequest(message, requestId))

    return promise
  }
}
