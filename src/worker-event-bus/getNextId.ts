import {threadId} from 'node:worker_threads'

const idPrefix = process.pid + '_' + threadId + '_'
let nextId = 1

export function getNextId() {
  return idPrefix + nextId++
}
