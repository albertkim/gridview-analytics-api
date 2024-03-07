import OpenAI from 'openai'

const chatGPTAPIKey = process.env.CHAT_GPT_API_KEY!

const openai = new OpenAI({
	apiKey: chatGPTAPIKey
})

// Return in text format, not JSON
export async function chatGPTTextQuery(query: string, gptVersion?: '3.5' | '4'): Promise<string | null> {

	// Only log if using GPT 4 - otherwise too verbose
	if (gptVersion === '4') {
		console.log(`Sending text query to ChatGPT ${gptVersion || '3.5'}`)
	}

	const gptVersionMapping = {
		'3.5': 'gpt-3.5-turbo',
		'4': 'gpt-4-turbo-preview'
	}

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

}
