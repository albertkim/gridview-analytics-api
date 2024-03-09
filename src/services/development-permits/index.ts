import chalk from 'chalk'
import { analyze as analyzeVancouver } from './cities/Vancouver'
import { analyze as analyzeRichmond } from './cities/Richmond'
import { analyze as analyzeBurnaby } from './cities/Burnaby'
import { analyze as analyzeSurrey } from './cities/Surrey'

// yarn run development-permit

const availableCities: string[] = [
  'Vancouver',
  'Richmond',
  'Burnaby',
  'Surrey'
]

interface IParams {
  startDate: string
  endDate: string
  cities: string[]
}

export async function main(params: IParams) {

  if (params.cities.includes('Vancouver')) {
    console.log(chalk.bgWhite(`Analyzing development permits for Vancouver`))
    await analyzeVancouver({startDate: params.startDate, endDate: params.endDate})
  }

  if (params.cities.includes('Richmond')) {
    console.log(chalk.bgWhite(`Analyzing development permits for Richmond`))
    await analyzeRichmond({startDate: params.startDate, endDate: params.endDate})
  }

  if (params.cities.includes('Burnaby')) {
    console.log(chalk.bgWhite(`Analyzing development permits for Burnaby`))
    await analyzeBurnaby({startDate: params.startDate, endDate: params.endDate})
  }

  if (params.cities.includes('Surrey')) {
    console.log(chalk.bgWhite(`Analyzing development permits for Surrey`))
    await analyzeSurrey({startDate: params.startDate, endDate: params.endDate})
  }

  // Check in drafts with the command
  // But first make sure to check in the current code to GitHub so that you can see the changes and make debugging easier
  // yarn run check-in

}
