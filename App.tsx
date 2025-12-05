import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateSpeech } from './services/ttsService';
import { decodeBase64, decodeAudioData, createWavBlob } from './utils/audio';
import { VoiceName, AudioState, DEFAULT_TEXT } from './types';
import { VoiceSelector } from './components/VoiceSelector';
import { WaveformVisualizer } from './components/WaveformVisualizer';
import { Play, Pause, RefreshCw, Sparkles, Volume2, Download } from 'lucide-react';

const App: React.FC = () => {
  const [text, setText] = useState<string>(DEFAULT_TEXT);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Charon);
  const [audioState, setAudioState] = useState<AudioState>({
    isGenerating: false,
    isPlaying: false,
    audioBuffer: null,
    audioBlob: null,
    error: null,
  });

  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);

  // Initialize Audio Context on user interaction (if needed)
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
    }
    return audioContextRef.current;
  };

  const handleGenerate = async () => {
    setAudioState(prev => ({ ...prev, isGenerating: true, error: null, isPlaying: false }));
    // Stop any currently playing audio
    stopAudio();

    try {
      const base64Audio = await generateSpeech(text, selectedVoice);
      const rawBytes = decodeBase64(base64Audio);
      const ctx = getAudioContext();
      
      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const audioBuffer = decodeAudioData(rawBytes, ctx, 24000, 1);
      const wavBlob = createWavBlob(rawBytes, 24000);
      
      setAudioState(prev => ({
        ...prev,
        isGenerating: false,
        audioBuffer: audioBuffer,
        audioBlob: wavBlob,
      }));
      
      // Auto-play after generation
      playAudio(audioBuffer);

    } catch (err: any) {
      setAudioState(prev => ({
        ...prev,
        isGenerating: false,
        error: err.message || "Failed to generate speech",
      }));
    }
  };

  const playAudio = useCallback((buffer: AudioBuffer) => {
    const ctx = getAudioContext();
    
    // Stop any existing source
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) { /* ignore */ }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    source.onended = () => {
      setAudioState(prev => ({ ...prev, isPlaying: false }));
      pausedAtRef.current = 0;
    };

    // Handle resume logic if needed, for now simplistic restart
    source.start(0, pausedAtRef.current);
    startTimeRef.current = ctx.currentTime - pausedAtRef.current;
    
    sourceNodeRef.current = source;
    setAudioState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const pauseAudio = () => {
    const ctx = getAudioContext();
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
      pausedAtRef.current = ctx.currentTime - startTimeRef.current;
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const resumeAudio = () => {
    if (audioState.audioBuffer) {
      playAudio(audioState.audioBuffer);
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) { /* ignore */ }
      sourceNodeRef.current = null;
    }
    pausedAtRef.current = 0;
    setAudioState(prev => ({ ...prev, isPlaying: false }));
  };

  const handleDownload = () => {
    if (!audioState.audioBlob) return;
    
    const url = URL.createObjectURL(audioState.audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arplanet-voice-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <Sparkles className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <h1 className="text-3xl font-serif-tc font-bold text-stone-800 tracking-tight">
            簡易語音生成
          </h1>
          <p className="mt-3 text-lg text-stone-600 max-w-xl mx-auto font-serif-tc">
            請注意：語調並非台灣腔調
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100">
          
          {/* Controls Section */}
          <div className="bg-stone-50/50 p-6 border-b border-stone-100 space-y-6">
            <VoiceSelector 
              selectedVoice={selectedVoice} 
              onChange={setSelectedVoice}
              disabled={audioState.isGenerating}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={handleGenerate}
                  disabled={audioState.isGenerating}
                  className={`
                    flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all w-full sm:w-auto
                    ${audioState.isGenerating 
                      ? 'bg-stone-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600'
                    }
                  `}
                >
                  {audioState.isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Speech
                    </>
                  )}
                </button>
              </div>

              {/* Playback & Download Controls */}
              {audioState.audioBuffer && (
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm">
                  {audioState.isPlaying ? (
                    <button onClick={pauseAudio} className="p-2 text-stone-700 hover:text-amber-600 transition-colors">
                      <Pause className="w-6 h-6 fill-current" />
                    </button>
                  ) : (
                    <button onClick={resumeAudio} className="p-2 text-stone-700 hover:text-amber-600 transition-colors">
                      <Play className="w-6 h-6 fill-current" />
                    </button>
                  )}
                  
                  <div className="h-8 w-px bg-stone-200 mx-1"></div>
                  
                  <WaveformVisualizer isPlaying={audioState.isPlaying} />
                  
                  <div className="h-8 w-px bg-stone-200 mx-1"></div>
                  
                  <button 
                    onClick={handleDownload}
                    className="p-2 text-stone-700 hover:text-amber-600 transition-colors"
                    title="Download Audio (WAV)"
                  >
                    <Download className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
            
            {audioState.error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                {audioState.error}
              </div>
            )}
          </div>

          {/* Text Input Area */}
          <div className="p-6 md:p-8">
            <label className="block text-sm font-medium text-stone-500 mb-2 uppercase tracking-wide">
              Script Content
            </label>
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-80 p-6 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-lg leading-relaxed resize-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-serif-tc shadow-inner outline-none"
                placeholder="Enter text to convert to speech..."
              />
              <div className="absolute bottom-4 right-4 text-xs text-stone-400 font-mono">
                {text.length} chars
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-stone-400 text-sm">
          <p>Powered by Google Gemini 2.5 Flash TTS</p>
        </div>
      </div>
    </div>
  );
};

export default App;