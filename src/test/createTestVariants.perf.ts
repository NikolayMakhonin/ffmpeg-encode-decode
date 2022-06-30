import { calcPerformance } from 'rdtsc'
import {createTestVariantsSync} from './createTestVariants'

describe('test > testVariants perf', function () {
  this.timeout(300000)

  it('perf', function () {
    const testVariants = createTestVariantsSync(({a, b, c}: {a: number, b: string, c: boolean}) => {
      return a === 1 && b === '4' && c === false
    })

    const args = {
      a: [1, 2],
      b: ['3', '4'],
      c: [true, false],
    }

    const result = calcPerformance(
      10000,
      () => {

      },
      () => {
        testVariants(args)
      },
    )

    console.log('testVariants perf: ', result)
  })
})
