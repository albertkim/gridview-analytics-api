import { IRawNews } from '@/models/News'
import fs from 'fs'
import path from 'path'

const databaseFilePath = path.join(__dirname, '../../database/errors.json')

export const ErrorsRepository = {

  getErrors() {
    const errors = JSON.parse(fs.readFileSync(databaseFilePath, 'utf8')) as IRawNews[]
    return errors
  },

  addError(news: IRawNews) {
    const previousErrors = this.getErrors()
    const newData = [...previousErrors, news]
    fs.writeFileSync(
      databaseFilePath,
      JSON.stringify(newData, null, 2),
      'utf8'
    )
  }

}
