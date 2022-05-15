import {TestFunc} from './contracts'
import {func1, func2, func3} from './main'

function createArray(...values: number[]): Float32Array {
  const array = new Float32Array(values)
  return array
}

function parseArray(array: Float32Array): number[] {
  return Array.from(array.values())
}

export async function test({
  funcName,
  values,
  async,
  error,
  assert: _assert,
}: {
  funcName: string,
  values: number[],
  async: boolean,
  error: boolean,
  assert: boolean,
}) {
  let func: TestFunc
  const checkResult = _assert ? values.slice() : null
  switch (funcName) {
    case 'func1':
      func = func1
      if (_assert) {
        checkResult[0]++
      }
      break
    case 'func2':
      func = func2
      if (_assert) {
        checkResult[1]++
        if (async) {
          checkResult[0]++
        }
      }
      break
    case 'func3':
      func = func3
      if (_assert) {
        checkResult[2]++
        if (async) {
          checkResult[0]++
        }
      }
      break
    default:
      throw new Error('Unknown func name: ' + funcName)
  }

  try {
    const value = createArray(...values)
    if (_assert) {
      assert.strictEqual(value.length, values.length)
    }
    const result = await func({
      data        : {value, async, error},
      transferList: [value.buffer],
    })
    if (_assert) {
      assert.strictEqual(value.length, 0)
      assert.deepStrictEqual(parseArray(result.data), checkResult)
      assert.strictEqual(result.transferList.length, 1)
      assert.deepStrictEqual(parseArray(new Float32Array(result.transferList[0] as ArrayBuffer)), checkResult)
    }
  } catch (err) {
    if (error) {
      if (_assert) {
        if (async) {
          assert.strictEqual(err.message, 'func1')
        } else {
          assert.strictEqual(err.message, funcName)
        }
      }
    } else {
      throw err
    }
  }
}
