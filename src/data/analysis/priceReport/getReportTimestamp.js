const getReportTime = () => {
  const reportTimestamp = new Date()
    .toLocaleString('en-GB', {
      timeZone: 'Europe/Paris',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    .replace(/\//g, '-')
    .replace(/,/g, ':')
  const reportDate = new Date()
    .toLocaleString('en-GB', {
      timeZone: 'Europe/Paris',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '-')
    .replace(/,/g, ':')

  return { reportTimestamp, reportDate }
}
export default getReportTime
