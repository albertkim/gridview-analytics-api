import chalk from 'chalk'
import { analyze as analyzeVancouver } from './cities/Vancouver'
import { analyze as analyzeRichmond } from './cities/Richmond'
import { analyze as analyzeBurnaby } from './cities/Burnaby'
import { analyze as analyzeSurrey } from './cities/Surrey'

// yarn run rezone

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
    console.log(chalk.bgWhite(`Analyzing rezonings for Vancouver`))
    await analyzeVancouver(params.startDate, params.endDate)
  }

  if (params.cities.includes('Richmond')) {
    console.log(chalk.bgWhite(`Analyzing rezonings for Richmond`))
    await analyzeRichmond(params.startDate, params.endDate)
  }

  if (params.cities.includes('Burnaby')) {
    console.log(chalk.bgWhite(`Analyzing rezonings for Burnaby`))
    await analyzeBurnaby(params.startDate, params.endDate)
  }

  if (params.cities.includes('Surrey')) {
    console.log(chalk.bgWhite(`Analyzing rezonings for Surrey`))
    await analyzeSurrey(params.startDate, params.endDate)
  }

}
