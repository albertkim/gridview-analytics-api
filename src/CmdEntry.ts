import 'module-alias/register'
import 'dotenv/config'
import 'source-map-support/register'
import chalk from 'chalk'
import moment from 'moment'
import { main as rawNewsMain } from '@/services/raw-news'
import { main as rezoneMain } from '@/services/rezonings'
import { main as permitMain } from '@/services/development-permits'
import { RecordsRepository } from './repositories/RecordsRepository'

/**
 * In order to run the raw news scraper, rezoning analyzer, or development permit analyzer, you will need to run commands in the terminal.
 * This file is the entry point for those commands.
 * 
 * Command list:
 * yarn run news YYYY-MM-DD YYYY-MM-DD "city1" "city2" "city3" ...
 * yarn run rezone YYYY-MM-DD YYYY-MM-DD "city1" "city2" "city3" ...
 * yarn run permit YYYY-MM-DD YYYY-MM-DD"city1" "city2" "city3" ...
 * 
 * Note: Start date is include, end date is exclusive
 * Note: YYYY-MM-DD cam also be replaced with "now" (no double quotes) to indicate the current date
 */

async function commandLineEntry() {

  const args = process.argv.slice(2)

  console.log(args)

  // Identify which command is being called (news, rezone, or permit)
  const command = args[0] as 'news' | 'rezone' | 'permit' | 'check-in'

  if (command === 'check-in') {
    const recordsRepository = new RecordsRepository('final')
    recordsRepository.finalCheckIn()
    console.log(chalk.green('Check-in completed successfully'))
    process.exit(0)
  }

  // First argument should be start date in YYYY-MM-DD format
  const startDate: string | undefined = args[1]
  if (!startDate) {
    console.error('Invalid start date - please provide a start date in the format YYYY-MM-DD as the first parameter')
    process.exit(1)
  }

  console.log(chalk.yellow(`Start date: ${startDate}`))

  // Second argument should be end date in YYYY-MM-DD format or the word "now"
  let endDate: string | undefined = args[2]
  if (!endDate) {
    console.error('Invalid end date - please provide an end date in the format YYYY-MM-DD or the word "now" as the second parameter')
    process.exit(1)
  }

  if (endDate === 'now') {
    endDate = moment().format('YYYY-MM-DD')
  }

  console.log(chalk.yellow(`End date: ${endDate}`))

  // 3rd value onwards is list of case-sensitive cities to analyze (ex. "Los Angeles", "Vancouver") - TODO: Make not case sensitive
  let cities: string[] = args.slice(3).map(city => city.replace('"', '').trim())

  if (cities.length === 0) {
    console.error('Invalid cities argument - please provide a list of cities to analyze or "all" as the fourth parameter')
    process.exit(1)
  }

  console.log(chalk.yellow(`Cities: ${cities.join(', ')}`))

  switch (command) {
    case 'news':
      await rawNewsMain({ startDate, endDate, cities })
      break
    case 'rezone':
      await rezoneMain({ startDate, endDate, cities })
      break
    case 'permit':
      await permitMain({ startDate, endDate, cities })
      break
    default:
      console.error('Invalid command - please provide a valid command: news, rezone, or permit')
      process.exit(1)
  }

  console.log(chalk.green('Command completed successfully'))
  process.exit(0)

}

commandLineEntry()
