/* eslint-disable no-await-in-loop */
import {CustomPromise} from './CustomPromise'

export class Locker {
  promise: Promise<void>

  async lock<T>(func: () => T): Promise<T extends Promise<infer U> ? U : Promise<T>> {
    while (this.promise) {
      await this.promise
    }
    const promise = new CustomPromise<void>()
    this.promise = promise.promise

    try {
      return await func() as any
    } finally {
      this.promise = null
      promise.resolve()
    }
  }
}
