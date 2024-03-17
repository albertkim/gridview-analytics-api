import 'module-alias/register'
import { parseCleanPDF } from '@/utilities/PDFUtilitiesV2'

(async () => {

  // PDF Url
  const url = 'https://pub-burnaby.escribemeetings.com/filestream.ashx?DocumentId=74269'

  const parsedPDF = await parseCleanPDF(url, {

  })

})()
