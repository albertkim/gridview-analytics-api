import { IRawNews } from '@/models/News'
import { chatGPTTextQuery } from '@/utilities/AIUtilities'
import { parseCleanPDF } from '@/utilities/PDFUtilitiesV2'
import createHttpError from 'http-errors'

interface IAnalyzedNews {
  date: string
  city: string
  metroCity: string | null
  meetingType: string
  title: string
  contents: string
  minuteUrl: string | null
  reportUrls: { url: string, title: string }[]
}

export async function analyzeRawNews(rawNews: IRawNews): Promise<IAnalyzedNews> {

  const rawContents = rawNews.contents
  let reportContents: string | null = null

  if (rawNews.reportUrls.length > 0) {

    const firstReportUrl = rawNews.reportUrls[0].url

    try {
      reportContents = await parseCleanPDF(firstReportUrl, { maxPages: 5 })
    } catch (error) {
      throw createHttpError(500, `Error parsing PDF for report contents`)
    }

  }

  let newTitle: string | null = null
  let newContents: string | null = null

  try {
    newTitle = await chatGPTTextQuery(`
      Given the following document, provide an appropriate news title for the following contents:

      ${reportContents ? reportContents : rawContents}
    `)
    if (!newTitle) {
      throw createHttpError(500, `Error getting title`)
    }
  } catch (error) {
    throw createHttpError(500, `Error parsing PDF for report contents`)
  }

  try {
    newContents = await chatGPTTextQuery(`
      Given the following document, summarize the contents in the following structure for readers who follow municipal city planning news:

      Short summary in a multi-sentence format.

      Bullet points of key points. Include specifics such as dates, dollar values, addresses, names, etc.

      No yapping, exclude fluffy language, and keep it concise.

      Here are the contents:

      ${reportContents ? reportContents : rawContents}
    `)
    if (!newContents) {
      throw createHttpError(500, `Error getting contents`)
    }
  } catch (error) {
    throw createHttpError(500, `Error parsing PDF for report contents`)
  }

  return {
    date: rawNews.date,
    city: rawNews.city,
    metroCity: rawNews.metroCity,
    meetingType: rawNews.meetingType,
    title: newTitle,
    contents: newContents,
    minuteUrl: rawNews.minutesUrl,
    reportUrls: rawNews.reportUrls
  }

}
