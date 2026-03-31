👉 **[Try the Live Demo Here! 在线体验请点击这里](https://ais-pre-xpqzywc5zjh64n2wgrekbz-122397365735.us-west1.run.app)** 👈



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
*   **Markdown Rendering**: React Markdown
*   **AI & Backend Services**: Google Gemini API (`gemini-3-flash-preview` for generation/evaluation, `gemini-2.5-flash-preview-tts` for audio)

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn
*   A Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone clone https://github.com/fhyfang/ai-english-shadowing-coach.git
    cd AI-
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add your Gemini API key:
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

5.  Open your browser and navigate to `http://localhost:3000`.

## 📝 Usage

1.  Enter a scenario in the "Scenario Setup" text area.
2.  Click "Generate Lesson".
3.  Listen to the generated audio and read along. Use the "Play 5 Times" button for shadowing practice.
4.  Highlight words you don't understand for instant explanations.
5.  Read the Pronunciation Guide and listen to the teacher's explanation.
6.  Click "Start Recording" and read the article out loud. Click "Stop Recording" when finished.
7.  Click "Evaluate My Pronunciation" to get your score and specific feedback.
8.  Listen to the specific corrections provided in the evaluation results by clicking the audio icon next to them.

## 📄 License

This project is licensed under the MIT License.
