import {WorkerFunctionClient} from '../function/contracts'

export type TestFuncArgs = { value: Float32Array, async: boolean, error: boolean }
export type TestFunc = WorkerFunctionClient<TestFuncArgs, Float32Array>
