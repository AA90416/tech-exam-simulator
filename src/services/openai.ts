import type { Question } from '../types/exam';

interface GenerateQuestionsParams {
  apiKey: string;
  source: 'topic' | 'text' | 'url';
  content: string;
  questionCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const SYSTEM_PROMPT = `You are an expert exam question generator. Generate multiple choice questions based on the provided content.

Each question must have:
- A clear, unambiguous question text
- Exactly 4 answer options (A, B, C, D)
- One correct answer
- A brief explanation of why the correct answer is right

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "questions": [
    {
      "text": "Question text here?",
      "answers": [
        {"id": "a", "text": "First option"},
        {"id": "b", "text": "Second option"},
        {"id": "c", "text": "Third option"},
        {"id": "d", "text": "Fourth option"}
      ],
      "correctAnswerId": "b",
      "explanation": "Explanation of why B is correct",
      "category": "Topic category"
    }
  ]
}`;

function buildUserPrompt(params: GenerateQuestionsParams): string {
  const difficultyDescriptions = {
    beginner: 'basic concepts, definitions, and fundamental understanding',
    intermediate: 'practical application, common scenarios, and deeper understanding',
    advanced: 'complex scenarios, edge cases, best practices, and expert-level knowledge',
  };

  let prompt = `Generate ${params.questionCount} multiple choice questions at ${params.difficulty} level (${difficultyDescriptions[params.difficulty]}).\n\n`;

  switch (params.source) {
    case 'topic':
      prompt += `Topic: ${params.content}\n\nGenerate questions that test knowledge of this topic.`;
      break;
    case 'text':
      prompt += `Based on the following text, generate questions that test understanding of the content:\n\n${params.content}`;
      break;
    case 'url':
      prompt += `Based on the content from this URL: ${params.content}\n\nGenerate questions that test understanding of the page content.`;
      break;
  }

  return prompt;
}

export async function generateQuestions(params: GenerateQuestionsParams): Promise<Question[]> {
  const messages: OpenAIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(params) },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API request failed: ${response.status}`);
  }

  const data: OpenAIResponse = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No response from OpenAI');
  }

  // Parse the JSON response
  let parsed;
  try {
    // Remove any markdown code blocks if present
    const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleanedContent);
  } catch {
    throw new Error('Failed to parse response from OpenAI. Please try again.');
  }

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error('Invalid response format from OpenAI');
  }

  // Add unique IDs to questions
  const questions: Question[] = parsed.questions.map((q: Omit<Question, 'id'>, index: number) => ({
    ...q,
    id: `gen-${Date.now()}-${index}`,
  }));

  return questions;
}

export async function fetchUrlContent(url: string): Promise<string> {
  // Use a CORS proxy or serverless function in production
  // For now, we'll just pass the URL to OpenAI and let it use its knowledge
  // In a real app, you'd fetch the content server-side
  return url;
}
