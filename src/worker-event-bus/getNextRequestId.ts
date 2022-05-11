import {threadId} from 'node:worker_threads'

const requestIdPrefix = process.pid + '_' + threadId + '_'
let nextRequestId = 1

export function getNextRequestId() {
  return requestIdPrefix + nextRequestId++
}
