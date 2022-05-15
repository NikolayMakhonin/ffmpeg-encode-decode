import { rdtsc } from 'rdtsc'
import {test} from './test'
import {createTestVariantsAsync} from '../../test/createTestVariants'

describe('worker-event-bus', function () {
  this.timeout(60000)

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

  it('func1', async function () {
    const time0 = rdtsc()
    await test({
      funcName: 'func1',
      values  : [1, 2, 3],
      async   : false,
      error   : false,
      assert  : true,
    })
    console.log(rdtsc() - time0)
  })

  it('stress', async function () {
    const promises: (Promise<number>|number)[] = []
    for (let i = 0; i < 1000; i++) {
      promises.push(testVariants({
        funcName: ['func1'],
        values  : [[1, 2, 3]],
        async   : [false, true],
        error   : [false, true],
      }))
    }
    console.log('variants: ' + (await Promise.all(promises)).reduce((a, o) => a + o, 0))
  })
})
