import { Page } from 'puppeteer'
import { IRawNews } from '@/models/News'

export async function getMeetingDetail(page: Page, url: string, date: string): Promise<IRawNews> {

  await page.goto(url)
  await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.3.1.slim.min.js'})

  const results = await page.evaluate(async () => {

    const meetingType = $('table tr:nth-child(3) td:nth-child(2)').text().trim()
    const title = $('table tr:nth-child(4) td').text().trim()
    const contents = $('table tr:nth-child(5) td').text().trim()

    return {
      title: title,
      resolutionId: null,
      meetingType: meetingType,
      contents: contents,
      reportUrls: []
    }

  })

  // Populate with additional useful data
  // Puppeteer page.evaluate cannot access variables outside of it
  return {
    city: 'BC (province)',
    metroCity: null as any, // TODO: Figure out how to handle this for provinces/states
    ...results,
    date: date,
    url: url,
    minutesUrl: url
  }

}
