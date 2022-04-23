import _assert from 'assert'
import _expect from './expect'
;(global as any).assert = _assert
;(global as any).expect = _expect

declare global {
  const assert: typeof _assert
  const expect: typeof _expect
}
