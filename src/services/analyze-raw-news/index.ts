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
      reportContents = await parseCleanPDF(firstReportUrl, { maxPages: 4 })
    } catch (error) {
      throw createHttpError(500, `Error parsing PDF for report contents`)
    }

  }

  let newTitle: string | null = null
  let newContents: string | null = null

  try {
    newContents = await chatGPTTextQuery(`
      You are a news article summarizing the provided document, crafted for mostly city policy and real estate professionals. Replace the original document by providing an immediate and direct overview of the key points. Below is an example of the format I would like to see in the response, but you can use your own words and structure as long as it is clear and concise. Here is the example format:

      <p>2-3 complete sentence sentence introduction and summary.</p>
      <ul>
        <li><b>Bullet point header </b>Bullet point contents</li>
        <li><b>Bullet point header </b>Bullet point contents</li>
      </ul>
      
      Do not include a title. Keep the number of bullet points between 3-5 if possible. You can have nested bullet points if useful. Do not mention "this article", "document", or "summary" or anything that refers to yourself a third-person. You are the summary. Clearly indicate the current stage of any legislative item, including relevant dates. No yapping, exclude fluffy language, and be specific with items, dates, dollar values, address, names, etc.
      
      Return in HTML format using only p ul li and b tags. Only bold list items, do not bold anything at the start.

      Here are the contents:

      ${(reportContents ? reportContents : rawContents).slice(0, 6000)}
    `)
    if (!newContents) {
      throw createHttpError(500, `Error getting contents`)
    }
  } catch (error) {
    console.error(error)
    throw createHttpError(500, `Error parsing PDF for report contents`)
  }

  try {
    newTitle = await chatGPTTextQuery(`
      Given the following document, provide an appropriate news title for the following contents:

      ${newContents}
    `)
    if (!newTitle) {
      throw createHttpError(500, `Error getting title`)
    }
  } catch (error) {
    console.error(error)
    throw createHttpError(500, `Error parsing PDF for report contents`)
  }

  return {
    date: rawNews.date,
    city: rawNews.city,
    metroCity: rawNews.metroCity,
    meetingType: rawNews.meetingType,
    title: newTitle.replace('"', ''),
    contents: newContents,
    minuteUrl: rawNews.minutesUrl,
    reportUrls: rawNews.reportUrls
  }

}
