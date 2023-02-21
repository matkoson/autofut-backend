export const getErrorLocation = (): {
  line: number
  stack: Error['stack']
} => {
  try {
    throw new Error()
  } catch (err) {
    const { stack } = err as Error
    if (!stack) {
      return {
        line: -1,
        stack: 'No stack trace available',
      }
    }

    const regex = /\d+/
    const match = regex.exec(stack.split('\n')[2])
    if (match) {
      return { line: parseInt(match[0], 10), stack }
    }
  }
  /* fallback value if line number cannot be determined */
  return { line: -1, stack: 'No stack trace available' }
}
