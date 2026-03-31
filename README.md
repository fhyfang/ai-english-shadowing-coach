# Daily Dictation & Shadowing (AI 场景式英语跟读与发音私教)

![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC)
![Gemini API](https://img.shields.io/badge/Google_Gemini-API-orange)

An AI-powered English learning application that provides scenario-based dictation, shadowing practice, and pronunciation evaluation. Built with React, TypeScript, and the Google Gemini API.

## 🌟 Features

*   **🎯 Custom Scenario Generation (场景定制)**: Input any scenario (e.g., "Ordering food in a fancy restaurant"), and the AI will generate a natural, 50-100 word English article or dialogue using high-frequency vocabulary.
*   **🎧 Immersive Reading & Audio (原声听力)**: High-quality Text-to-Speech (TTS) using Gemini 2.5 Flash TTS. Includes a "Play 5 Times" feature specifically designed for shadowing practice to build muscle memory.
*   **📖 Contextual Word Explanation (划词精讲)**: Highlight any word or phrase (up to 5 words) in the article to get instant, context-aware explanations, including IPA pronunciation, part of speech, Chinese meaning, common phrases, and fixed structures.
*   **🗣️ Pronunciation Guide (发音指南)**: Get a customized pronunciation guide focusing on linking words, stress, loss of plosion, and rhythm for the generated text.
*   **🎙️ Shadowing Practice (跟读练习)**: Record your own voice reading the generated text directly in the browser.
*   **💯 AI Pronunciation Evaluation (多模态发音评估)**: Submit your recording for AI evaluation. Get an overall score out of 100, general feedback, and specific, actionable corrections for mispronounced words (with audio playback for the corrections).
*   **👩‍🏫 In-depth Explanation (深度讲解)**: Receive a detailed breakdown of the grammar, vocabulary, and sentence structure used in the article, acting as your personal AI English teacher.

## 🛠️ Tech Stack

*   **Frontend**: React 18, TypeScript, Vite
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **AI & Backend Services**: Google Gemini API

## 🚀 Getting Started

1. Clone the repository
2. Run `npm install`
3. Add your Gemini API key to a `.env` file (`VITE_GEMINI_API_KEY=your_key`)
4. Run `npm run dev`
