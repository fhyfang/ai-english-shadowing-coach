import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface LessonData {
  article: string;
  pronunciationGuide: string;
  inDepthExplanation: string;
}

export async function generateLesson(scenario: string): Promise<LessonData> {
  const prompt = `
You are an expert English teacher. The user wants to practice English for the following scenario: "${scenario}".
Please generate a short, natural English article or dialogue (around 50-100 words) using high-frequency vocabulary suitable for this scenario.

Also, provide two detailed explanations. Write these explanations as if you are an English teacher speaking directly to the student in a podcast or audio lesson. Keep the tone encouraging, conversational, and easy to listen to. Keep each explanation concise (under 150 words) so it can be easily converted to audio. Use English for the explanations so the user can practice listening, but you can include brief Chinese translations for difficult concepts if absolutely necessary.
1. Pronunciation Guide: Explain the pronunciation points of this specific text, focusing on linking words, stress, loss of plosion, and rhythm.
2. In-depth Explanation: Act as a teacher and explain the grammar, vocabulary, phrases, and sentence structure of the generated text.

Return the result in JSON format with the following structure:
{
  "article": "The generated English text",
  "pronunciationGuide": "Markdown string of the spoken pronunciation guide",
  "inDepthExplanation": "Markdown string of the spoken in-depth explanation"
}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          article: { type: Type.STRING },
          pronunciationGuide: { type: Type.STRING },
          inDepthExplanation: { type: Type.STRING },
        },
        required: ['article', 'pronunciationGuide', 'inDepthExplanation'],
      },
    },
  });

  const resultText = response.text;
  if (!resultText) {
    throw new Error('Failed to generate lesson');
  }

  return JSON.parse(resultText);
}

function pcmToWav(pcmData: Int16Array, sampleRate: number): Blob {
  const numChannels = 1;
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = pcmData.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < pcmData.length; i++, offset += 2) {
    view.setInt16(offset, pcmData[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export async function generateTTS(text: string): Promise<string> {
  // Strip markdown characters that might confuse TTS
  const cleanText = text.replace(/[*_#`]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text: `Read clearly and naturally: ${cleanText}` }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Aoede' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error('Failed to generate audio');
  }

  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const wavBlob = pcmToWav(int16Array, 24000);
  return URL.createObjectURL(wavBlob);
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  issues: {
    wordOrPhrase: string;
    issue: string;
    correction: string;
  }[];
}

export interface WordExplanation {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  chineseMeaning: string;
  commonPhrases: string[];
  fixedStructures: string[];
}

export async function explainWord(word: string, contextSentence: string): Promise<WordExplanation> {
  const prompt = `
You are an expert English teacher. The user wants to know the detailed explanation of the word or phrase "${word}" in the context of the sentence: "${contextSentence}".
Please provide the pronunciation (IPA), part of speech, Chinese meaning, common phrases (常用短句), and fixed sentence structures (固定句式).

Return the result in JSON format with the following structure:
{
  "word": "The word itself",
  "pronunciation": "IPA pronunciation",
  "partOfSpeech": "Part of speech (e.g., noun, verb, adjective)",
  "chineseMeaning": "Chinese meaning",
  "commonPhrases": ["Phrase 1", "Phrase 2"],
  "fixedStructures": ["Structure 1", "Structure 2"]
}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          pronunciation: { type: Type.STRING },
          partOfSpeech: { type: Type.STRING },
          chineseMeaning: { type: Type.STRING },
          commonPhrases: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          fixedStructures: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['word', 'pronunciation', 'partOfSpeech', 'chineseMeaning', 'commonPhrases', 'fixedStructures'],
      },
    },
  });

  const resultText = response.text;
  if (!resultText) {
    throw new Error('Failed to explain word');
  }

  return JSON.parse(resultText);
}

export async function evaluatePronunciation(text: string, audioBase64: string, mimeType: string): Promise<EvaluationResult> {
  const prompt = `
You are an expert English pronunciation coach. The user is practicing "shadowing" to achieve a native-like accent.
The target text they are trying to read is:
"${text}"

Listen to the user's audio recording. Evaluate their pronunciation, intonation, stress, and rhythm.
Provide a detailed evaluation in JSON format with the following structure:
{
  "score": number, // Overall score out of 100
  "feedback": string, // General feedback and encouragement
  "issues": [
    {
      "wordOrPhrase": string, // The specific word or phrase that was mispronounced
      "issue": string, // Description of the problem (e.g., "Pronounced 'th' as 'd'", "Wrong stress on second syllable")
      "correction": string // Actionable advice on how to fix it (e.g., "Place your tongue between your teeth and blow air")
    }
  ]
}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: audioBase64,
              mimeType: mimeType,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: 'Overall score out of 100' },
          feedback: { type: Type.STRING, description: 'General feedback and encouragement' },
          issues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                wordOrPhrase: { type: Type.STRING },
                issue: { type: Type.STRING },
                correction: { type: Type.STRING },
              },
              required: ['wordOrPhrase', 'issue', 'correction'],
            },
          },
        },
        required: ['score', 'feedback', 'issues'],
      },
    },
  });

  const resultText = response.text;
  if (!resultText) {
    throw new Error('Failed to evaluate pronunciation');
  }

  return JSON.parse(resultText);
}
