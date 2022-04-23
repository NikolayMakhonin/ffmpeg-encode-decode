import expect from 'expect'

type ExpectExt = typeof expect & {
  or: (...args: any[]) => any
}

expect.extend({
  or(received, ...expecteds: any[]) {
    function message() {
      return `expected ${expecteds
        .map(expected => this.utils.printExpected(expected))
        .join(' | ')}, but received ${this.utils.printReceived(received)}`
    }

    for (let i = 0, len = expecteds.length; i < len; i++) {
      const expected = expecteds[i]
      if (
        (expected
          && typeof expected.asymmetricMatch === 'function'
          && expected.asymmetricMatch(received))
        || received === expected
      ) {
        return {
          pass: true,
          message,
        }
      }
    }

    return {
      pass: false,
      message,
    }
  },
})

export default expect as ExpectExt
