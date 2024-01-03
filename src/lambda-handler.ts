import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { App } from './App'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const response = await handleRequest(event)

  return {
    statusCode: response.statusCode || 200,
    headers: response.headers || {},
    body: response.body || ''
  }
}

function handleRequest(event: APIGatewayProxyEvent): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = eventToHttpRequest(event)
    const res = createHttpResponse()

    App(req, res, (error) => {
      if (error) {
        reject(error)
      } else {
        const response = {
          statusCode: res.statusCode || 200,
          headers: res.getHeaders(),
          body: res.body || ''
        }
        resolve(response)
      }
    })
  })
}

function eventToHttpRequest(event: APIGatewayProxyEvent): any {
  return {
    method: event.httpMethod || 'GET',
    url: event.path || '/',
    headers: event.headers || {},
    body: event.body || ''
  }
}

function createHttpResponse(): any {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    getHeaders: function () {
      return this.headers
    },
    write: function (data: any) {
      this.body += data
    }
  }
}
