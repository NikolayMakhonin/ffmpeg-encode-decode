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

  it('simple', async function () {
    console.log('variants: ' + await testVariants({
      funcName: ['func2', 'func1', 'func3'],
      async   : [false, true],
      error   : [false, true],
      abort   : ['error', false, 'stop'], // 'stop'
      assert  : [true],
    }))
  })

  xit('stress', async function () {
    const promises: (Promise<number>|number)[] = []
    for (let i = 0; i < 1000; i++) {
      promises.push(testVariants({
        funcName: ['func1', 'func2', 'func3'],
        async   : [false, true],
        error   : [false, true],
        abort   : [false, 'error', 'stop'], // 'stop'
        assert  : [true],
      }))
    }
    console.log('variants: ' + (await Promise.all(promises)).reduce((a, o) => a + o, 0))
  })
})
