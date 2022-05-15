import {func1, func2, func3} from './main'
import {TestFunc} from './contracts'
import {createTestVariantsAsync} from '../../test/createTestVariants'

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
    funcName,
    values,
    async,
    error,
  }: {
    funcName: string,
    values: number[],
    async: boolean,
    error: boolean,
  }) {
    let func: TestFunc
    const checkResult = values.slice()
    switch (funcName) {
      case 'func1':
        func = func1
        checkResult[0]++
        break
      case 'func2':
        func = func2
        checkResult[1]++
        if (async) {
          checkResult[0]++
        }
        break
      case 'func3':
        func = func3
        checkResult[2]++
        if (async) {
          checkResult[0]++
        }
        break
      default:
        throw new Error('Unknown func name: ' + funcName)
    }

    try {
      const value = createArray(...values)
      assert.strictEqual(value.length, values.length)
      const result = await func({
        data        : {value, async, error},
        transferList: [value.buffer],
      })
      assert.strictEqual(value.length, 0)
      assert.deepStrictEqual(parseArray(result.data), checkResult)
      assert.strictEqual(result.transferList.length, 1)
      assert.deepStrictEqual(parseArray(new Float32Array(result.transferList[0] as ArrayBuffer)), checkResult)
    } catch (err) {
      if (error) {
        if (async) {
          assert.strictEqual(err.message, 'func1')
        } else {
          assert.strictEqual(err.message, funcName)
        }
      } else {
        throw err
      }
    }
  }

  const testVariants = createTestVariantsAsync(function () {
    return Promise.race([
      test.apply(null, arguments),
      // new Promise((resolve, reject) => {
      //   setTimeout(() => {
      //     reject('Timeout')
      //   }, 5000)
      // }),
    ])
  })

  it('simple', async function () {
    await testVariants({
      // funcName: ['func1', 'func2', 'func3'],
      funcName: ['func1'], //, 'func2'],
      values  : [[1, 2, 3]],
      async   : [false, true],
      error   : [false, true],
    })
  })

  xit('stress', async function () {
    await testVariants({
      funcName: ['func1', 'func2', 'func3'],
      values  : [[1, 2, 3]],
      async   : [false, true],
      error   : [false, true],
    })
  })
})
