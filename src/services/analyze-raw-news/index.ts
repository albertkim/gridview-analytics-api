import { IRawNews } from '@/models/News'
import { chatGPTJSONQuery, chatGPTTextQuery } from '@/utilities/AIUtilities'
import { parseCleanPDF } from '@/utilities/PDFUtilitiesV2'
import createHttpError from 'http-errors'

interface IAnalyzedNews {
  date: string
  city: string
  metroCity: string | null
  meetingType: string
  title: string
  contents: string
  tags: string[]
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

  let newMetadata: {
    title: string
    tags: string[]
  } | null = null

  let newContents: string | null = null

  try {
    newContents = await chatGPTTextQuery(`
      The following is an article:

      <Article>
        ${(reportContents ? reportContents : rawContents).slice(0, 6000)}
      </Article>

      <Instructions>
        You are a news reporter. You are a summarizing the provided document, crafted for mostly city policy and real estate professionals, to be published on a news platform.
      </Instructions>

      <Format>
        Here are some example formats I want to see in the response, but you can change the structure as long as it is clear and concise:

        <p>2-3 complete sentences.</p>
        <b>A header</b>
        <ul>
          <li>Bullet point contents</li>
          <li>Bullet point contents</li>
        </ul>
        <b>A header</b>
        <ul>
          <li><b>Optional heading: </b>Bullet point contents</li>
          <li>Bullet point contents</li>
        </ul>
        
        Do not include a title. Keep the number of bullet points between 3-5 if possible. If a line is only a bolded header, do not put it in a ul/li and just have it as its own line. You can have nested bullet points. DO NOT mention "this article", "document", or "summary" or anything that refers to yourself a third-person. You are the summary. Clearly indicate the current stage of any legislative item, including relevant dates. No yapping, exclude fluffy language, and be specific with items, dates, dollar values, address, names, etc.
        
        Return in HTML format using only p ul li and b tags. Only bold list items, do not bold anything at the start.
      </Format>

    `)
    if (!newContents) {
      throw createHttpError(500, `Error getting contents`)
    }
  } catch (error) {
    console.error(error)
    throw createHttpError(500, `Error parsing PDF for report contents`)
  }

  try {
    newMetadata = await chatGPTJSONQuery(`
      <Document>
        ${newContents}
      </Document>

      <Instructions>
        Given the municipal document above, return in the following JSON format:

        {
          "title": "appropriate title here",
          "tags": ["tag1", "tag2", "tag3"]
        }

        Title: Exclude fluffy/political language. Do not include quotation marks in the title.
        Tags: An array of "transportation" (highways, roads, public transit), "development" (rezonings, development permits, construction of new structures), "finance" (budgets, etc.), "services" (police, fire, etc.), "community" (parks, events, etc.), or "other" if none of the above.
      </Instructions>
    `)

    if (!newMetadata) {
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
    title: newMetadata.title,
    contents: newContents,
    tags: newMetadata.tags,
    minuteUrl: rawNews.minutesUrl,
    reportUrls: rawNews.reportUrls
  }

}
