import { Mistral } from '@mistralai/mistralai';

let client;

function getClient() {
  if (!client) {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY is not set in environment variables.');
    }
    client = new Mistral({ apiKey });
  }
  return client;
}

export async function chatCompletion(systemPrompt, userPrompt) {
  const mistral = getClient();
  const response = await mistral.chat.complete({
    model: 'mistral-medium-latest',
    temperature: 0,
    responseFormat: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const text = response.choices[0].message.content;
  return JSON.parse(text);
}
