const getIsUntradeableLog = (isUntradeable) => {
  if (!isUntradeable && typeof isUntradeable !== 'boolean') {
    return '[❓ N/A ❓]'
  }
  return isUntradeable === 'true' ? '[🔴 UT 🔴]' : '[🟢 TR 🟢]'
}

export default getIsUntradeableLog
