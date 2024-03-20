import dotenv from 'dotenv'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import chalk from 'chalk'
import { ImageAnnotatorClient } from '@google-cloud/vision'
import createHttpError from 'http-errors'

dotenv.config()

const gptVersionMapping = {
	'3.5': 'gpt-3.5-turbo',
	'4': 'gpt-4-turbo-preview'
}

const anthropicVersionMapping = {
	'Claude Haiku': 'claude-3-haiku-20240307',
	'Claude Sonnet': 'claude-3-sonnet-20240229',
}

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

// Send a text query to ChatGPT 3.5 turbo and get data back in JSON format
// Make sure that the query includes the word 'JSON'
// Defaults to 3.5, specify 4 if you want to use 4
export async function chatGPTJSONQuery(query: string, llm?: 'Claude Haiku' | 'Claude Sonnet' | '3.5' | '4'): Promise<any | null> {

	// Default to GPT 3.5 if not specified
	llm = llm || '3.5'

	if ((llm === '3.5' || llm === '4') && !openai) {
		throw createHttpError(500, 'ChatGPT API key not found')
	}

	if ((llm === 'Claude Haiku' || 'Claude Sonnet') && !anthropic) {
		throw createHttpError(500, 'Anthropic API key not found')
	}

	// Only log if using GPT 4 - otherwise too verbose
	if (llm === '4') {
		console.log(`Sending JSON query to ChatGPT ${llm || '3.5'}`)
	}


	try {

		if (llm === '3.5' || llm === '4') {
			const response = await openai!.chat.completions.create({
				model: gptVersionMapping[llm],
				messages:[
					{
						'role': 'user',
						'content': query
					}
				],
				response_format: {
					type: 'json_object'
				},
				temperature: 0
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
		}

		if (llm === 'Claude Haiku' || llm === 'Claude Sonnet') {
			const response = await anthropic.messages.create({
				model: anthropicVersionMapping[llm],
				max_tokens: 3000,
				temperature: 0,
				system: 'You are an expert in city land use, planning, real estate, and development. Reply only JSON format, no other text.',
				messages: [
					{
						role: 'user',
						content: [
							{
								type: 'text',
								text: query
							}
						]
					}
				]
			})
			if (!response) {
				return null
			}
			const textContent = response.content[0].text
			const jsonContent = JSON.parse(textContent)
			return jsonContent
		
		}

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
export async function chatGPTTextQuery(query: string, llm?: 'Claude Haiku' | 'Claude Sonnet' | '3.5' | '4'): Promise<string | null> {

	// Default to GPT 3.5 if not specified
	llm = llm || '3.5'

	if ((llm === '3.5' || llm === '4') && !openai) {
		throw createHttpError(500, 'ChatGPT API key not found')
	}

	if ((llm === 'Claude Haiku' || llm === 'Claude Sonnet') && !anthropic) {
		throw createHttpError(500, 'Anthropic API key not found')
	}

	// Only log if using GPT 4 - otherwise too verbose
	if (llm === '4') {
		console.log(`Sending text query to ChatGPT ${llm || '3.5'}`)
	}

	try {

		// If 3.5 or 4, use OpenAI
		if (llm === '3.5' || llm === '4') {
			const response = await openai!.chat.completions.create({
				model: gptVersionMapping[llm],
				messages:[
					{
						'role': 'user',
						'content': query
					}
				],
				temperature: 0
			})
			if (!response) {
				return null
			}
			const content = response.choices[0].message.content
			return content
		}

		// If Claude Haiku, use Anthropic
		if (llm === 'Claude Haiku') {
			const response = await anthropic.messages.create({
				model: 'claude-3-haiku-20240307',
				max_tokens: 3000,
				temperature: 0,
				system: 'You are an expert in city land use, planning, real estate, and development.',
				messages: [
					{
						role: 'user',
						content: [
							{
								type: 'text',
								text: query
							}
						]
					}
				]
			})
			if (!response) {
				return null
			}
			const content = response.content[0].text
			return content
		}

		// If for some reason none of the conditionals are hit, return null
		return null

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
