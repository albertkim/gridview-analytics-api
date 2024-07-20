import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import { scrape as scrapeBC } from './cities/BC'
import { scrape as scrapeVancouver } from './cities/Vancouver'
import { scrape as scrapeRichmond } from './cities/Richmond'
import { scrape as scrapeBurnaby } from './cities/Burnaby'
import { scrape as scrapeSurrey } from './cities/Surrey'
import { RawNewsRepository } from '@/repositories/RawNewsRepository'

const concurrency = 5                  // Max number of browser tabs to open

const availableCities: string[] = [
  'BC (province)',
  'Vancouver',
  'Richmond',
  'Burnaby',
  'Surrey'
]

const shouldUpdateDatabase = true      // If true, update database, otherwise just print a local file in this directory

interface IParams {
  startDate: string
  endDate: string
  cities: string[]
}

const headless = true

export async function main(params: IParams) {

  if (shouldUpdateDatabase) console.log(chalk.red(`NOTE: The scraper will update the database. Make sure this is what you want.`))
  else console.log(chalk.yellow(`NOTE: The scraper will not update the database.`))
  console.log(`Concurrency: ${concurrency}`)

  if (params.cities.includes('all')) {
    params.cities = availableCities
  }

  if (params.cities.includes('BC')) {
    console.log(chalk.bgWhite(`Scraping: BC (province)`))
    const data = await scrapeBC({
      startDate: params.startDate,
      endDate: params.endDate,
      headless: headless,
      concurrency: concurrency
    })
    if (shouldUpdateDatabase) RawNewsRepository.upsertNews(data)
    else fs.writeFileSync(path.join(__dirname, 'bc (province).json'), JSON.stringify(data, null, 2))
  }

  if (params.cities.includes('Vancouver')) {
    console.log(chalk.bgWhite(`Scraping: Vancouver`))
    const data = await scrapeVancouver({
      startDate: params.startDate,
      endDate: params.endDate,
      headless: headless,
      concurrency: concurrency
    })
    if (shouldUpdateDatabase) RawNewsRepository.upsertNews(data)
    else fs.writeFileSync(path.join(__dirname, 'vancouver.json'), JSON.stringify(data, null, 2))
  }

  if (params.cities.includes('Richmond')) {
    console.log(chalk.bgWhite(`Scraping: Richmond`))
    const data = await scrapeRichmond({
      startDate: params.startDate,
      endDate: params.endDate,
      headless: headless,
      concurrency: concurrency
    })
    if (shouldUpdateDatabase) RawNewsRepository.upsertNews(data)
    else fs.writeFileSync(path.join(__dirname, 'richmond.json'), JSON.stringify(data, null, 2))
  }

  // Burnaby code may require running in multiple date ranges because of rate limiting
  if (params.cities.includes('Burnaby')) {
    console.log(chalk.bgWhite(`Scraping: Burnaby`))
    const data = await scrapeBurnaby({
      startDate: params.startDate,
      endDate: params.endDate,
      headless: headless,
      concurrency: concurrency
    })
    if (shouldUpdateDatabase) RawNewsRepository.upsertNews(data)
    else fs.writeFileSync(path.join(__dirname, 'burnaby.json'), JSON.stringify(data, null, 2))
  }

  if (params.cities.includes('Surrey')) {
    const data = await scrapeSurrey({
      startDate: params.startDate,
      endDate: params.endDate,
      headless: headless,
      concurrency: concurrency
    })
    if (shouldUpdateDatabase) RawNewsRepository.upsertNews(data)
    else fs.writeFileSync(path.join(__dirname, 'surrey.json'), JSON.stringify(data, null, 2))
  }

}
