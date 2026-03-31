import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Mic, Loader2, RefreshCw, CheckCircle2, AlertCircle, BookOpen, Sparkles, GraduationCap, Volume2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { generateTTS, evaluatePronunciation, EvaluationResult, generateLesson, LessonData, explainWord, WordExplanation } from './services/gemini';

export default function App() {
  const [scenario, setScenario] = useState('');
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  
  const [aiAudioUrl, setAiAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  const [pronunciationAudioUrl, setPronunciationAudioUrl] = useState<string | null>(null);
  const [isGeneratingPronunciation, setIsGeneratingPronunciation] = useState(false);
  
  const [explanationAudioUrl, setExplanationAudioUrl] = useState<string | null>(null);
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [userAudioBlob, setUserAudioBlob] = useState<Blob | null>(null);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  
  const [issueAudioUrls, setIssueAudioUrls] = useState<Record<number, string>>({});
  const [loadingIssueAudio, setLoadingIssueAudio] = useState<number | null>(null);
  
  const [playCount, setPlayCount] = useState(0);
  const [isPlaying5Times, setIsPlaying5Times] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleApiError = (error: any, defaultMessage: string) => {
    console.error(defaultMessage, error);
    const errorMessage = error?.message || String(error);
    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      alert('You have exceeded your Gemini API quota. Please check your plan and billing details at https://ai.google.dev/gemini-api/docs/rate-limits.');
    } else {
      alert(defaultMessage);
    }
  };

  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordExplanation, setWordExplanation] = useState<WordExplanation | null>(null);
  const [isExplainingWord, setIsExplainingWord] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number; pointerOffset: number } | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.word-popover') && !target.closest('.article-text')) {
        setPopoverPosition(null);
        setSelectedWord(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTextSelection = async () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const text = selection.toString().trim();
    if (!text || text.split(/\s+/).length > 5) {
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const left = rect.left + window.scrollX + rect.width / 2;
    const popoverWidth = 320; // w-80 is 20rem = 320px
    const padding = 16;
    let adjustedLeft = left;
    
    if (left - popoverWidth / 2 < padding) {
      adjustedLeft = popoverWidth / 2 + padding;
    } else if (left + popoverWidth / 2 > window.innerWidth - padding) {
      adjustedLeft = window.innerWidth - popoverWidth / 2 - padding;
    }

    const pointerOffset = left - adjustedLeft;

    setPopoverPosition({
      top: rect.bottom + window.scrollY,
      left: adjustedLeft,
      pointerOffset,
    });
    setSelectedWord(text);
    setWordExplanation(null);
    setIsExplainingWord(true);

    try {
      const fullText = lesson?.article || '';
      const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
      const contextSentence = sentences.find(s => s.includes(text)) || fullText;

      const explanation = await explainWord(text, contextSentence);
      setWordExplanation(explanation);
    } catch (error) {
      handleApiError(error, 'Failed to explain word. Please try again.');
    } finally {
      setIsExplainingWord(false);
    }
  };

  const handleGenerateLesson = async () => {
    if (!scenario.trim()) return;
    setIsGeneratingLesson(true);
    setLesson(null);
    setAiAudioUrl(null);
    setPronunciationAudioUrl(null);
    setExplanationAudioUrl(null);
    setEvaluation(null);
    setUserAudioUrl(null);
    setUserAudioBlob(null);
    setIssueAudioUrls({});
    try {
      const newLesson = await generateLesson(scenario);
      setLesson(newLesson);
      
      // Automatically generate audio
      setIsGeneratingAudio(true);
      const url = await generateTTS(newLesson.article);
      setAiAudioUrl(url);
      setPlayCount(0);
      setIsPlaying5Times(false);
    } catch (error) {
      handleApiError(error, 'Failed to generate lesson. Please try again.');
    } finally {
      setIsGeneratingLesson(false);
      setIsGeneratingAudio(false);
    }
  };

  const handleGeneratePronunciationAudio = async () => {
    if (!lesson?.pronunciationGuide) return;
    setIsGeneratingPronunciation(true);
    try {
      const url = await generateTTS(lesson.pronunciationGuide);
      setPronunciationAudioUrl(url);
    } catch (error) {
      handleApiError(error, 'Failed to generate audio. Please try again.');
    } finally {
      setIsGeneratingPronunciation(false);
    }
  };

  const handleGenerateExplanationAudio = async () => {
    if (!lesson?.inDepthExplanation) return;
    setIsGeneratingExplanation(true);
    try {
      const url = await generateTTS(lesson.inDepthExplanation);
      setExplanationAudioUrl(url);
    } catch (error) {
      handleApiError(error, 'Failed to generate audio. Please try again.');
    } finally {
      setIsGeneratingExplanation(false);
    }
  };

  const play5Times = () => {
    if (!audioRef.current || !aiAudioUrl) return;
    setIsPlaying5Times(true);
    setPlayCount(0);
    audioRef.current.play();
  };

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const handleEnded = () => {
      if (isPlaying5Times) {
        setPlayCount((prev) => {
          const nextCount = prev + 1;
          if (nextCount < 5) {
            setTimeout(() => {
              audioEl.play().catch(console.error);
            }, 1000); // 1 second pause between reads
            return nextCount;
          } else {
            setIsPlaying5Times(false);
            return nextCount;
          }
        });
      }
    };

    audioEl.addEventListener('ended', handleEnded);
    return () => audioEl.removeEventListener('ended', handleEnded);
  }, [isPlaying5Times]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        setUserAudioBlob(audioBlob);
        setUserAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setEvaluation(null); // Clear previous evaluation
      setIssueAudioUrls({});
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please ensure permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleEvaluate = async () => {
    if (!userAudioBlob || !lesson?.article) return;
    
    setIsEvaluating(true);
    setIssueAudioUrls({});
    try {
      const reader = new FileReader();
      reader.readAsDataURL(userAudioBlob);
      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          const base64Audio = base64data.split(',')[1];
          
          const result = await evaluatePronunciation(lesson.article, base64Audio, userAudioBlob.type);
          setEvaluation(result);
        } catch (error) {
          handleApiError(error, 'Failed to evaluate pronunciation. Please try again.');
        } finally {
          setIsEvaluating(false);
        }
      };
    } catch (error) {
      handleApiError(error, 'Failed to read audio file. Please try again.');
      setIsEvaluating(false);
    }
  };

  const handlePlayIssueAudio = async (issue: any, index: number) => {
    if (issueAudioUrls[index]) {
      const audio = new Audio(issueAudioUrls[index]);
      audio.play();
      return;
    }

    setLoadingIssueAudio(index);
    try {
      const textToRead = `Listen closely: ${issue.wordOrPhrase}. ${issue.correction}`;
      const url = await generateTTS(textToRead);
      setIssueAudioUrls(prev => ({ ...prev, [index]: url }));
      const audio = new Audio(url);
      audio.play();
    } catch (error) {
      handleApiError(error, 'Failed to generate audio for this correction.');
    } finally {
      setLoadingIssueAudio(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <header className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Daily Dictation & Shadowing</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Step 1: Input Scenario */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
            Scenario Setup
          </h2>
          <textarea
            className="w-full h-24 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            placeholder="e.g., Ordering food in a fancy restaurant, or A business meeting about Q3 goals..."
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleGenerateLesson}
              disabled={!scenario.trim() || isGeneratingLesson}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingLesson ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Lesson
            </button>
          </div>
        </section>

        {/* Step 2: AI Reading */}
        {lesson && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              Today's Article & Audio
            </h2>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 mb-6">
              <p 
                className="text-lg text-slate-800 leading-relaxed font-medium article-text"
                onMouseUp={handleTextSelection}
              >
                {lesson.article}
              </p>
            </div>
            
            {isGeneratingAudio ? (
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating AI Voice...</span>
              </div>
            ) : aiAudioUrl ? (
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <audio ref={audioRef} src={aiAudioUrl} controls className="w-full sm:w-auto flex-1" />
                <button
                  onClick={play5Times}
                  disabled={isPlaying5Times}
                  className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  <RefreshCw className={`w-4 h-4 ${isPlaying5Times ? 'animate-spin' : ''}`} />
                  {isPlaying5Times ? `Playing (${playCount + 1}/5)...` : 'Play 5 Times'}
                </button>
              </div>
            ) : null}
          </section>
        )}

        {/* Step 3: Pronunciation Guide */}
        {lesson && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                Pronunciation Guide
              </h2>
              {!pronunciationAudioUrl ? (
                <button
                  onClick={handleGeneratePronunciationAudio}
                  disabled={isGeneratingPronunciation}
                  className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isGeneratingPronunciation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                  Listen to Teacher
                </button>
              ) : (
                <audio src={pronunciationAudioUrl} controls autoPlay className="h-10 w-full sm:w-auto" />
              )}
            </div>
            <div className="prose prose-slate max-w-none bg-blue-50/50 p-6 rounded-xl border border-blue-100">
              <div className="markdown-body">
                <Markdown>{lesson.pronunciationGuide}</Markdown>
              </div>
            </div>
          </section>
        )}

        {/* Step 4: User Recording */}
        {aiAudioUrl && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
              Your Turn
            </h2>
            
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className="w-16 h-16 bg-red-100 group-hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors">
                    <Mic className="w-8 h-8" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-slate-900">Click to Start Recording</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors animate-pulse">
                    <Square className="w-6 h-6 fill-current" />
                  </div>
                  <span className="font-medium text-red-600">Recording... Click to Stop</span>
                </button>
              )}
            </div>

            {userAudioUrl && !isRecording && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-sm font-medium text-slate-600">Your Recording:</span>
                  <audio src={userAudioUrl} controls className="flex-1 h-10" />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleEvaluate}
                    disabled={isEvaluating}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 shadow-sm shadow-blue-200"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing Pronunciation...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Evaluate My Pronunciation
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Step 5: Evaluation Results */}
        {evaluation && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">5</span>
              Evaluation Results
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Overall Score</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-black text-slate-900 tracking-tighter">{evaluation.score}</span>
                  <span className="text-xl text-slate-500 font-medium">/100</span>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center">
                <p className="text-slate-700 text-lg leading-relaxed">{evaluation.feedback}</p>
              </div>
            </div>

            {evaluation.issues.length > 0 ? (
              <div>
                <h3 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Areas for Improvement
                </h3>
                <div className="space-y-4">
                  {evaluation.issues.map((issue, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold border border-red-100 whitespace-nowrap self-start">
                          "{issue.wordOrPhrase}"
                        </div>
                        <div className="space-y-2 flex-1">
                          <p className="text-slate-800 font-medium">{issue.issue}</p>
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <p className="text-blue-800 text-sm"><span className="font-semibold">Correction:</span> {issue.correction}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handlePlayIssueAudio(issue, index)}
                          disabled={loadingIssueAudio === index}
                          className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors disabled:opacity-50"
                          title="Listen to correction"
                        >
                          {loadingIssueAudio === index ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Volume2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-800 mb-1">Perfect Pronunciation!</h3>
                <p className="text-green-600">We couldn't find any major issues with your pronunciation. Keep up the great work!</p>
              </div>
            )}
          </section>
        )}

        {/* Step 6: In-depth Explanation */}
        {evaluation && lesson && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">6</span>
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Teacher's In-depth Explanation
              </h2>
              {!explanationAudioUrl ? (
                <button
                  onClick={handleGenerateExplanationAudio}
                  disabled={isGeneratingExplanation}
                  className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isGeneratingExplanation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                  Listen to Teacher
                </button>
              ) : (
                <audio src={explanationAudioUrl} controls autoPlay className="h-10 w-full sm:w-auto" />
              )}
            </div>
            <div className="prose prose-slate max-w-none bg-indigo-50/30 p-6 rounded-xl border border-indigo-100">
              <div className="markdown-body">
                <Markdown>{lesson.inDepthExplanation}</Markdown>
              </div>
            </div>
          </section>
        )}

        {/* Word Explanation Popover */}
        {popoverPosition && selectedWord && (
          <div 
            className="absolute z-50 word-popover bg-white rounded-xl shadow-xl border border-slate-200 p-5 w-80 transform -translate-x-1/2 mt-2 animate-in fade-in zoom-in-95 duration-200"
            style={{ 
              top: popoverPosition.top, 
              left: popoverPosition.left 
            }}
          >
            <div 
              className="absolute -top-2 w-4 h-4 bg-white border-t border-l border-slate-200"
              style={{ 
                left: `calc(50% + ${popoverPosition.pointerOffset}px)`, 
                transform: 'translateX(-50%) rotate(45deg)' 
              }}
            ></div>
            
            <div className="relative">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedWord}</h3>
              
              {isExplainingWord ? (
                <div className="flex items-center gap-3 text-slate-500 py-6 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="text-sm font-medium">Looking up dictionary...</span>
                </div>
              ) : wordExplanation ? (
                <div className="space-y-4 text-sm">
                  <div className="flex flex-wrap items-center gap-2 text-slate-600">
                    <span className="font-mono bg-slate-100 px-2 py-1 rounded-md text-xs font-medium text-slate-700">/{wordExplanation.pronunciation}/</span>
                    <span className="italic text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs">{wordExplanation.partOfSpeech}</span>
                  </div>
                  
                  <p className="text-slate-800 font-medium text-base leading-relaxed">{wordExplanation.chineseMeaning}</p>
                  
                  {wordExplanation.commonPhrases && wordExplanation.commonPhrases.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <h4 className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Common Phrases
                      </h4>
                      <ul className="space-y-1.5 text-slate-600">
                        {wordExplanation.commonPhrases.map((phrase, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>{phrase}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {wordExplanation.fixedStructures && wordExplanation.fixedStructures.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <h4 className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wider flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-blue-500" />
                        Fixed Structures
                      </h4>
                      <ul className="space-y-1.5 text-slate-600">
                        {wordExplanation.fixedStructures.map((structure, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>{structure}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-500 text-sm py-4 text-center font-medium">Failed to load explanation.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
