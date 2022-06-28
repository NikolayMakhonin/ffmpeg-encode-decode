import {WorkerFunctionClient} from '../function/workerFunctionServer'

export type TestFuncArgs = { value: Float32Array, async: boolean, error: boolean }
export type TestFunc = WorkerFunctionClient<TestFuncArgs, Float32Array>
