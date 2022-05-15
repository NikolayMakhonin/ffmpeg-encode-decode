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
    let timeMin
    for (let i = 0; i < 10000; i++) {
      const time0 = rdtsc()
      await test({
        funcName: 'func1',
        values  : [1, 2, 3],
        async   : false,
        error   : false,
        assert  : false,
      })
      const time = rdtsc() - time0
      if (i === 0 || time < timeMin) {
        timeMin = time
      }
    }
    console.log(timeMin)
  })

  it('func2', async function () {
    let timeMin
    for (let i = 0; i < 10000; i++) {
      const time0 = rdtsc()
      await test({
        funcName: 'func2',
        values  : [1, 2, 3],
        async   : false,
        error   : false,
        assert  : false,
      })
      const time = rdtsc() - time0
      if (i === 0 || time < timeMin) {
        timeMin = time
      }
    }
    console.log(timeMin)
  })

  it('func2 error', async function () {
    let timeMin
    for (let i = 0; i < 10000; i++) {
      const time0 = rdtsc()
      await test({
        funcName: 'func2',
        values  : [1, 2, 3],
        async   : false,
        error   : true,
        assert  : false,
      })
      const time = rdtsc() - time0
      if (i === 0 || time < timeMin) {
        timeMin = time
      }
    }
    console.log(timeMin)
  })

  it('func2 async', async function () {
    let timeMin
    for (let i = 0; i < 10000; i++) {
      const time0 = rdtsc()
      await test({
        funcName: 'func2',
        values  : [1, 2, 3],
        async   : true,
        error   : false,
        assert  : false,
      })
      const time = rdtsc() - time0
      if (i === 0 || time < timeMin) {
        timeMin = time
      }
    }
    console.log(timeMin)
  })

  xit('stress', async function () {
    const time0: bigint = rdtsc()
    const promises: Promise<void>[] = []
    const count = 1000
    for (let i = 0; i < count; i++) {
      promises.push(test({
        funcName: 'func1',
        values  : [1, 2, 3],
        async   : false,
        error   : false,
        assert  : true,
      }))
    }
    await Promise.all(promises)

    console.log((rdtsc() - time0) / BigInt(count))
  })
})
