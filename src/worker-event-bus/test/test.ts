import {TestFunc} from './contracts'
import {func1, func2, func3} from './main'
import {AbortController} from '../../abort-controller/AbortController'
import {WorkerData} from '../common/contracts'

function createArray(...values: number[]): Float32Array {
  const array = new Float32Array(values)
  return array
}

function parseArray(array: Float32Array): number[] {
  return Array.from(array.values())
}

export async function test({
  funcName,
  async,
  error,
  abort,
  assert: _assert,
}: {
  funcName: string,
  async: boolean,
  error: boolean,
  abort: false | 'error' | 'stop',
  assert: boolean,
}) {
  type TValues = number[]
  const values: TValues = [10, 20, 30]
  let func: TestFunc
  let checkResult: {
    callbacks: TValues[],
    result?: TValues,
    errorMessage?: string,
  }
  
  let errorMessage = error ? 'func1'
    : abort === 'error' ? 'abort'
      : void 0
  
  switch (funcName) {
    case 'func1':
      func = func1
      if (_assert) {
        checkResult = {
          callbacks: error || abort && async ? [[11, 20, 30]] : [[11, 20, 30], [12, 20, 30]],
          result   : error || abort && async ? void 0 : [12, 20, 30],
          errorMessage,
        }
      }
      break
    case 'func2':
      func = func2
      if (_assert) {
        checkResult = {
          callbacks: async
            ? (error || abort ? [[11, 21, 30]] : [[11, 21, 30], [12, 22, 30]])
            : (error ? [[10, 21, 30]] : [[10, 21, 30], [10, 22, 30]]),
          result: error || abort && async ? void 0
            : (async ? [12, 22, 30] : [10, 22, 30]),
          errorMessage,
        }
      }
      break
    case 'func3':
      func = func3
      if (_assert) {
        checkResult = {
          callbacks: async
            ? (error || abort ? [[11, 20, 31]] : [[11, 20, 31], [12, 20, 32]])
            : (error ? [[10, 20, 31]] : [[10, 20, 31], [10, 20, 32]]),
          result: error || abort && async ? void 0
            : (async ? [12, 20, 32] : [10, 20, 32]),
          errorMessage,
        }
      }
      break
    default:
      throw new Error('Unknown func name: ' + funcName)
  }

  const value = createArray(...values)
  if (_assert) {
    assert.strictEqual(value.length, values.length)
  }
  const callbacks: TValues[] = []
  let result: WorkerData<Float32Array>
  errorMessage = void 0

  const abortController = new AbortController()
  const promise = func(
    {
      data        : {value, async, error},
      transferList: [value.buffer],
    },
    abortController.signal,
    (data) => {
      if (_assert) {
        assert.strictEqual(data.transferList.length, 1)
        assert.strictEqual(data.transferList[0], data.data.buffer)
      }
      callbacks.push(parseArray(data.data))
    },
  )

  if (_assert) {
    assert.strictEqual(value.length, 0)
  }

  if (abort === 'error') {
    abortController.abort('abort')
  } else if (abort === 'stop') {
    abortController.abort()
  }

  try {
    result = await promise
  } catch (err) {
    errorMessage = err.message
  }

  if (_assert) {
    assert.strictEqual(result.transferList, result.data.buffer)
    assert.strictEqual(result.transferList.length, 1)
    assert.deepStrictEqual({
      callbacks,
      result: parseArray(result.data),
      errorMessage,
    }, checkResult)
  }
}
