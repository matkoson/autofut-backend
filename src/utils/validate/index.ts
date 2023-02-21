/* eslint-disable func-style*/
export function createValidationError(message: string): Error {
  const error = new Error(message)
  error.name = 'ValidationError'
  return error
}

export function validateArrayOfType<T>(
  value: unknown,
  field: string,
  type: string
): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw createValidationError(
      `${field}: expected array but got ${typeof value}: ${value}`
    )
  }

  for (const item of value) {
    if (typeof item !== type) {
      throw createValidationError(
        `${field}: expected array of ${type} but got ${typeof item}: ${item}`
      )
    }
  }
}

export function validateString(
  value: unknown,
  field: string
): asserts value is string {
  if (typeof value !== 'string') {
    throw createValidationError(
      `${field}: expected string but got ${typeof value}: ${value}`
    )
  }
}
