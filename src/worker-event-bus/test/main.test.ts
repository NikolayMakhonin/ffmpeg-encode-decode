import {func1} from './main'
import {TestFunc} from './contracts'

describe('worker-event-bus', function () {
  this.timeout(60000)

  function createArray(...values: number[]): Float32Array {
    const array = new Float32Array(values)
    return array
  }

  function parseArray(array: Float32Array): number[] {
    return Array.from(array.values())
  }

  async function test({
    func,
    values,
    async,
    error,
    checkResult,
  }: {
    func: TestFunc,
    values: number[],
    async: boolean,
    error: boolean,
    checkResult: number[],
  }) {
    try {
      const value = createArray(...values)
      assert.strictEqual(value.length, values.length)
      const result = await func1([value, async, error], [value.buffer])
      assert.strictEqual(value.length, 0)
      assert.deepStrictEqual(parseArray(result), checkResult)
    } catch (err) {
      if (error) {
        if (async) {
          assert.strictEqual(err.message, 'func1')
        } else {
          assert.strictEqual(err.message, func.name)
        }
      }
      throw err
    }
  }

  it('func1', async function () {
    await test({
      func       : func1,
      values     : [1, 2, 3],
      async      : false,
      error      : false,
      checkResult: [2, 2, 3],
    })
  })
})
