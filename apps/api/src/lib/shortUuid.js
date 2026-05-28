import { nanoid } from 'nanoid'

const DEFAULT_LENGTH = 8

export function shortUuid(length = DEFAULT_LENGTH) {
  return nanoid(length)
}
