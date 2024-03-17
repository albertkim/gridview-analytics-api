import dotenv from 'dotenv'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import chalk from 'chalk'
import { ImageAnnotatorClient } from '@google-cloud/vision'
import createHttpError from 'http-errors'

dotenv.config()

const chatGPTAPIKey = process.env.CHAT_GPT_API_KEY

let openai: OpenAI | undefined

if (chatGPTAPIKey) {
	openai = new OpenAI({
		apiKey: chatGPTAPIKey
	})
}

const anthropicAPIKey = process.env.ANTHROPIC_API_KEY

let anthropic: Anthropic

if (anthropicAPIKey) {
	anthropic = new Anthropic({
		apiKey: anthropicAPIKey
	})
}

// Uses the GOOGLE_APPLICATION_CREDENTIALS environment variable implicitly
const googleVisionClient = new ImageAnnotatorClient()

interface BaseRezoningQueryParams {
	introduction?: string
  applicationId?: string
	status?: string
}

// Send a text query to ChatGPT 3.5 turbo and get data back in JSON format
// Make sure that the query includes the word 'JSON'
// Defaults to 3.5, specify 4 if you want to use 4
export async function chatGPTJSONQuery(query: string, gptVersion?: '3.5' | '4'): Promise<any | null> {

	if (!openai) {
		throw createHttpError(500, 'ChatGPT API key not found')
	}

	// Only log if using GPT 4 - otherwise too verbose
	if (gptVersion === '4') {
		console.log(`Sending JSON query to ChatGPT ${gptVersion || '3.5'}`)
	}

	const gptVersionMapping = {
		'3.5': 'gpt-3.5-turbo-0125',
		'4': 'gpt-4-0125-preview'
	}

	try {

		const response = await openai.chat.completions.create({
			model: gptVersionMapping[gptVersion || '3.5'],
			messages:[
				{
					'role': 'user',
					'content': query
				}
			],
			response_format: {
				type: 'json_object'
			},
			temperature: 0.2
		})

		if (!response) {
			return null
		}

		const content = JSON.parse(response.choices[0].message.content!)

		if (content.error) {
			console.log(chalk.yellow(JSON.stringify(content, null, 2)))
			return null
		}

		return content

	} catch (error: any) {
		if (error.response && error.response.data) {
			console.error(chalk.red(error.response.data))
		} else {
			console.error(chalk.red(error))
		}
		return null
	}
}

// Return in text format, not JSON
export async function chatGPTTextQuery(query: string, gptVersion?: '3.5' | '4'): Promise<string | null> {

	if (!openai) {
		throw createHttpError(500, 'ChatGPT API key not found')
	}

	// Only log if using GPT 4 - otherwise too verbose
	if (gptVersion === '4') {
		console.log(`Sending text query to ChatGPT ${gptVersion || '3.5'}`)
	}

	const gptVersionMapping = {
		'3.5': 'gpt-3.5-turbo',
		'4': 'gpt-4-turbo-preview'
	}

	try {

		const response = await openai.chat.completions.create({
			model: gptVersionMapping[gptVersion || '3.5'],
			messages:[
				{
					'role': 'user',
					'content': query
				}
			],
			temperature: 0.2
		})

		if (!response) {
			return null
		}

		const content = response.choices[0].message.content
		return content

	} catch (error: any) {
		if (error.response && error.response.data) {
			console.error(chalk.red(error.response.data))
		} else {
			console.error(chalk.red(error))
		}
		return null
	}
}

export async function imageTextQuery(query: string, fileData: string, gptVersion?: '3.5' | '4') {

	try {

		const [result] = await googleVisionClient.textDetection({
			image: {
				content: fileData
			}
		})

		console.log(`Google Cloud Vision data returned`)

		const detections = result.textAnnotations
		if (!detections) {
			return null
		}

		const textArray = detections.map(text => text.description).join(' ').replace(/\n/g, ' ').trim()

		const gptResponse = await chatGPTTextQuery(`
			${query}
			${textArray}
		`, gptVersion)

		return gptResponse

	} catch (error: any) {
		if (error.response && error.response.data) {
			console.error(error.response.data)
			throw new Error()
		} else {
			console.error(error)
			throw new Error()
		}
	}

}
