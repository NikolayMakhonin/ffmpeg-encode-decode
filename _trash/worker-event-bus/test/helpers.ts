import {WorkerData} from '../common/contracts'

export function createTestFuncResult(data: Float32Array): WorkerData<Float32Array> {
  return {
    data        : data,
    transferList: [data.buffer],
  }
}
