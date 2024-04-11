import { NewsRepository } from '@/repositories/NewsRepository'

export async function generateSitemapXML(): Promise<string> {

  const news = await NewsRepository.getNews({
    offset: 0,
    limit: 1000
  })

  const newsUrls = news.data.map(n => {
    return `
      <url>
        <loc>https://gridviewanalytics.com/news/id/${n.id}</loc>
        <lastmod>${n.date}</lastmod>
      </url>
    `
  })

  const sitemap = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://gridviewanalytics.com</loc>
      </url>
      <url>
        <loc>https://gridviewanalytics.com/about</loc>
      </url>
      <url>
        <loc>https://gridviewanalytics.com/premium</loc>
      </url>
      <url>
        <loc>https://gridviewanalytics.com/rezonings/map</loc>
      </url>
      <url>
        <loc>https://gridviewanalytics.com/development-permits/map</loc>
      </url>
      <url>
        <loc>https://gridviewanalytics.com/news/metro_vancouver</loc>
      </url>
      <url>
        <loc>https://gridviewanalytics.com/news/metro_vancouver/city/BC%20(province)</loc>
      </url>
      <url>
        <loc>https://gridviewanalytics.com/news/metro_vancouver/city/Vancouver</loc>
      </url>
      <url>
        <loc>https://gridviewanalytics.com/news/metro_vancouver/city/Richmond</loc>
      </url>
      <url>
        <loc>https://gridviewanalytics.com/news/metro_vancouver/city/Burnaby</loc>
      </url>
      <url>
        <loc>https://gridviewanalytics.com/news/metro_vancouver/city/Surrey</loc>
      </url>
      ${newsUrls.join('')}
    </urlset>
  `

  return sitemap

}
