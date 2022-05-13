import {func1, func2, func3} from './main'
import {TestFunc} from './contracts'
import {createTestVariants} from '../../test/createTestVariants'

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
  }: {
    func: TestFunc,
    values: number[],
    async: boolean,
    error: boolean,
  }) {
    const checkResult = values.slice()
    switch (func.name) {
      case 'func1':
        checkResult[0]++
        break
      case 'func2':
        checkResult[1]++
        if (async) {
          checkResult[0]++
        }
        break
      case 'func3':
        checkResult[2]++
        if (async) {
          checkResult[0]++
        }
        break
      default:
        throw new Error('Unknown func name: ' + func.name)
    }

    try {
      const value = createArray(...values)
      assert.strictEqual(value.length, values.length)
      const result = await func([value, async, error], [value.buffer])
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

  const testVariants = createTestVariants(test)

  it('simple', async function () {
    await testVariants({
      func  : [func1, func2, func3],
      values: [[1, 2, 3]],
      async : [false, true],
      error : [false, true],
    })
  })

  it('stress', async function () {
    await testVariants({
      func  : [func1, func2, func3],
      values: [[1, 2, 3]],
      async : [false, true],
      error : [false, true],
    })
  })
})
