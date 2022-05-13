import {parentPort, TransferListItem, workerData} from 'worker_threads'
import {FFmpegTransformArgs} from '../../ffmpeg/contracts'
import {WorkerEmitEvent, WorkerSubscribeEvent} from '../contracts'

function funcSync(array: Float32Array) {
  array[0]++
  return [array, array]
}

function funcAsync(array: Float32Array) {
  array[0]++
  return [array, array]
}

const methods: {
  [key in string]: TWorkerFunction
} = {
  funcSync,
  funcAsync,
}

parentPort.on('message', async (event: WorkerEmitEvent<TMethodRequest>) => {
  try {
    const func = methods[event.data.method]
    if (!func) {
      throw new Error('Unknown method: ' + event.data.method)
    }
    const [result, transferList] = (await func.apply(null, event.data.args)) || []
    parentPort.postMessage({
      data : result,
      error: void 0,
      transferList,
      route: event.route,
    } as WorkerSubscribeEvent, transferList)
  } catch (err) {
    parentPort.postMessage({
      data        : void 0,
      error       : err,
      transferList: void 0,
      route       : event.route,
    })
  }
})
