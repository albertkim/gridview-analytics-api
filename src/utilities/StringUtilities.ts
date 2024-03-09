import moment from 'moment'

export function formatDateString(dateString: string) {
  const date = new Date(dateString)
  const momentDate = moment(date)
  return momentDate.utc().format('YYYY-MM-DD')
}

export function cleanString(content: string | null): string {
  if (!content) return ''
  const cleanedString = content
    .replace('\r\n', '\n') // Replace Windows newlines with Unix newlines
    .replace('\t', '') // Replace tabs with spaces
    .replace('\\t', ' ') // Replace escaped tabs with spaces
    .split('\n')
    .map(line => line.trim().replace(/\s+/g, ' ')) // Remove consecutive spaces
    .join('\n')
    .replace(/\n+/g, '\n') // Remove consecutive newlines
  return cleanedString
}
