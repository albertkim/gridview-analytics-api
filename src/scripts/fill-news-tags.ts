import 'module-alias/register'
import { NewsRepository } from '@/repositories/NewsRepository'
import { chatGPTJSONQuery } from '@/utilities/AIUtilities'

(async () => {

  const news = await NewsRepository.getNews({offset: 0, limit: null, city: null, important: null})

  for (const newsItem of news.data) {

    // Only will news items without tags
    if (newsItem.tags.length > 0) {
      continue
    }

    const tagsResult = await chatGPTJSONQuery(`
      <Document>
        ${newsItem.summary}
      </Document>

      Given the document above, return in the following JSON format:

      {
        "tags": ["tag1", "tag2"]
      }

      Tags: An array of tags, can be one of "transportation" (highways, roads, public transit), "development" (rezonings, development permits, construction of new structures), "finance" (budgets, etc.), "services" (police, fire, etc.), "community" (parks, events, etc., don't include with development), "infrastructure" (public utilities, not transportation-related), or "other" if none of the above. Try to only have 1 tag.
    `)

    if (tagsResult.tags.length === 0) {
      console.error(`No tags found for ${newsItem.id}`)
      continue
    }

    console.log(`Updating news "${newsItem.title}" with tags ${tagsResult.tags}`)
    newsItem.tags = tagsResult.tags

    await NewsRepository.updateNews(newsItem.id, newsItem)

  }

  process.exit()

})()
