// import {TransferListItem, Worker} from 'worker_threads'
//
// export class WorkerClient {
//   worker: EventTarget
//   private readonly _responseFilter: (response: any, requestId: number) => boolean
//   private readonly _getResponseValue: (response: any) => any
//   private readonly _createRequest: (value: any, requestId: number) => any
//
//   private _error: Error
//   private _exitCode: number
//
//   constructor({
//     worker,
//     responseFilter,
//     getResponseValue,
//     createRequest,
//   }: {
//     worker: Worker
//     responseFilter: (response: any, requestId: number) => boolean
//     getResponseValue: (response: any) => any
//     createRequest: (value: any, requestId: number) => any
//   }) {
//     this.worker = worker
//     this._responseFilter = responseFilter
//     this._getResponseValue = getResponseValue
//     this._createRequest = createRequest
//   }
//
//   private subscribe() {
//     const onError = () => {
//       this._error = err
//     }
//     const onExit = () => {
//       this._exitCode = code
//     }
//     this.worker.addEventListener('messageerror', (event: MessageEvent) => {
//       this._error = new Error(event.
//     })
//     this.worker.addEventListener('close', (event) => {
//       this._closed = true
//     })
//   }
//
//   private _nextRequestId = 1
//   request<TResult>(
//     value?: any,
//     transferList?: ReadonlyArray<TransferListItem>,
//     onExit?: (code: number) => TResult,
//   ): Promise<TResult> {
//     if (this._error) {
//       throw this._error
//     }
//     if (this._exitCode != null) {
//       throw new Error(`Worker exited: exit code is ${this._exitCode}`)
//     }
//
//     const requestId = this._nextRequestId++
//     const promise = new Promise<TResult>((resolve, reject) => {
//       const _this = this
//       const worker = this.worker
//
//       function subscribe() {
//         worker.on('message', onMessage)
//         worker.on('error', onError)
//         worker.on('exit', _onExit)
//       }
//
//       function unsubscribe() {
//         worker.off('message', onMessage)
//         worker.off('error', onError)
//         worker.off('exit', _onExit)
//       }
//
//       function _resolve(result) {
//         unsubscribe()
//         resolve(result)
//       }
//
//       function _reject(err) {
//         unsubscribe()
//         reject(err)
//       }
//
//       function onMessage(message) {
//         if (message && _this._responseFilter(message, requestId)) {
//           try {
//             _resolve(_this._getResponseValue(message))
//           } catch (err) {
//             _reject(err)
//           }
//         }
//       }
//
//       function onError(err) {
//         _reject(err)
//       }
//
//       function _onExit(code) {
//         try {
//           if (!onExit) {
//             _reject(new Error(`exit code is ${code}`))
//           } else {
//             _resolve(onExit(code))
//           }
//         } catch (err) {
//           _reject(err)
//         }
//       }
//
//       subscribe()
//     })
//
//     this.worker.postMessage(this._createRequest(value, requestId), transferList)
//
//     return promise
//   }
// }
