import { Page } from 'puppeteer'
import { parseSurreyMeetingMinutes } from './SurreyUtilities'
import { IRawNews } from '@/models/News'
import moment from 'moment'

interface IParams {
  page: Page
  url: string
  date: string
  meetingType: string
  allCorporateReports: {date: string, url: string, title: string, contents: string, tag: string}[]
  allPlanningReports: {date: string, url: string, title: string, contents: string, tag: string}[]
}

export async function getMeetingDetails({page, url, date, meetingType, allCorporateReports, allPlanningReports}: IParams) {

  const results: IRawNews[] = []

  const parsedMeetingItems = await parseSurreyMeetingMinutes(url)

  for (const item of parsedMeetingItems) {

    const matchingReports: {date: string, url: string, title: string, contents: string, tag: string}[] = []

    // Search all corporate reports from before the date, find the first match
    allCorporateReports
      .filter((r) => {
        return moment(r.date).isSameOrBefore(date)
      })
      .some((r) => {
        // Use regex to get the text up to the first colon from report.title
        const reportId = r.title.match(/^(.*?):/)?.[1] || null
        if (reportId && item.content.includes(reportId)) {
          matchingReports.push(r)
          return true
        }
        return false
      })

    // Search all planning reports regardless of date
    allPlanningReports
      .some((r) => {
        // Use regex to find planning report IDs in the format of XXXX-XXXX-XX where Xs are numbers
        const planningIds = r.title.match(/(\d{4}-\d{4}-\d{2})/g) || []
        if (planningIds.some((id) => item.content.includes(id))) {
          matchingReports.push(r)
          return true
        }
        return false
      })

    results.push({
      city: 'Surrey',
      metroCity: 'Metro Vancouver',
      url: url,
      date: date,
      meetingType: meetingType,
      minutesUrl: url,
      resolutionId: item.resolutionId,
      title: item.title,
      contents: item.content,
      reportUrls: matchingReports.map((r) => {
        return {
          title: r.title,
          url: r.url
        }
      })
    })

  }

  return results

}
