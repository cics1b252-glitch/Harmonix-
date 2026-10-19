import React, { useState, useEffect, useRef } from 'react';
import { Score, Track, INSTRUMENT_FAMILIES } from './types/music';
import { PRESET_SCORES } from './data/presetScores';
import { globalAudioEngine } from './audio/AudioEngine';
import { ScoreViewer } from './components/notation/ScoreViewer';
import { StudioMixer } from './components/mixer/StudioMixer';
import { AudioToScoreSection } from './components/audio/AudioToScoreSection';
import { ScoreToAudioSection } from './components/score2audio/ScoreToAudioSection';
import { ExportStudioSection } from './components/export/ExportStudioSection';
import { ScoreAuditPanel } from './components/audit/ScoreAuditPanel';
import {
  Music, FileScan, Download, Sliders, Play, Pause,
  Square, RotateCcw, Volume2, Sparkles, Wand2, Disc, Layers, ShieldCheck
} from 'lucide-react';

export default function App() {
  // Active Navigation Tab: 'audio-to-score' | 'score-to-audio' | 'export-studio'
  const [activeTab, setActiveTab] = useState<'audio-to-score' | 'score-to-audio' | 'export-studio'>('audio-to-score');

  // Active Musical Score State
  const [score, setScore] = useState<Score>(PRESET_SCORES[0]);

  // Audio Playback Engine States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentMeasure, setCurrentMeasure] = useState(1);
  const [activeNoteIds, setActiveNoteIds] = useState<Set<string>>(new Set());
  const [masterVolume, setMasterVolume] = useState(0.85);

  // Hook audio engine callbacks
  useEffect(() => {
    globalAudioEngine.onPlayheadUpdate = (beat, measure, playingNotes) => {
      setCurrentBeat(beat);
      setCurrentMeasure(measure);
      setActiveNoteIds(playingNotes);
    };

    globalAudioEngine.onPlaybackStateChange = (playing) => {
      setIsPlaying(playing);
      if (!playing) {
        setActiveNoteIds(new Set());
      }
    };

    return () => {
      globalAudioEngine.stop();
    };
  }, []);

  // Playback Control Handlers
  const handlePlay = (startFromBeat?: number) => {
    const beatToStart = startFromBeat !== undefined ? startFromBeat : currentBeat;
    globalAudioEngine.play(score, beatToStart);
  };

  const handlePause = () => {
    globalAudioEngine.pause();
  };

  const handleStop = () => {
    globalAudioEngine.stop();
    setCurrentBeat(0);
    setCurrentMeasure(1);
    setActiveNoteIds(new Set());
  };

  const handleSeek = (beat: number) => {
    const clampedBeat = Math.max(0, Math.min(score.totalMeasures * score.timeSignature.beats, beat));
    setCurrentBeat(clampedBeat);
    setCurrentMeasure(Math.floor(clampedBeat / score.timeSignature.beats) + 1);
    if (isPlaying) {
      globalAudioEngine.play(score, clampedBeat);
    }
  };

  // Update track mixer properties
  const handleUpdateTrack = (trackId: string, updates: Partial<Track>) => {
    setScore(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => t.id === trackId ? { ...t, ...updates } : t),
    }));
  };

  // Load new score (from audio separation or sheet OCR)
  const handleScoreLoaded = (newScore: Score) => {
    handleStop();
    setScore(newScore);
    setCurrentBeat(0);
    setCurrentMeasure(1);
  };

  // Clear score / Reset sample from system
  const handleClearScore = () => {
    handleStop();
    const blankScore: Score = {
      id: `blank-${Date.now()}`,
      title: 'Pauta Limpa (Sem Amostra)',
      composer: 'Harmonix Studio',
      bpm: 120,
      keySignature: 'Dó Maior (C Major)',
      timeSignature: { beats: 4, beatType: 4 },
      totalMeasures: 8,
      sourceType: 'composed',
      createdAt: new Date().toISOString(),
      tracks: (['strings', 'keys', 'percussion', 'woodwinds', 'brass', 'choir'] as const).map(fam => {
        const meta = INSTRUMENT_FAMILIES[fam];
        return {
          id: `track-${fam}-clean`,
          name: meta.namePt,
          family: fam,
          subInstrument: meta.instrumentsPt[0],
          clef: meta.defaultClef,
          color: meta.color,
          iconName: 'music',
          volume: 0.85,
          pan: 0,
          reverbSend: 0.4,
          muted: false,
          solo: false,
          notes: [],
        };
      }),
    };
    setScore(blankScore);
  };

  // Restore preset sample
  const handleRestorePreset = () => {
    handleStop();
    setScore(PRESET_SCORES[0]);
    setCurrentBeat(0);
    setCurrentMeasure(1);
  };

  // Export Master WAV handler
  const handleExportMasterWav = async () => {
    try {
      const buffer = await globalAudioEngine.renderScoreToAudioBuffer(score);
      const wavBlob = globalAudioEngine.audioBufferToWav(buffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${score.title.toLowerCase().replace(/\s+/g, '_')}_master_44khz.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao exportar WAV Master:', err);
    }
  };

  // Export Single Stem WAV handler
  const handleExportStemWav = async (track: Track) => {
    try {
      const buffer = await globalAudioEngine.renderScoreToAudioBuffer(score, track.id);
      const wavBlob = globalAudioEngine.audioBufferToWav(buffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${score.title.toLowerCase().replace(/\s+/g, '_')}_stem_${track.family}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao exportar stem:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col selection:bg-violet-500 selection:text-white">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0c0e14]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-400 p-0.5 shadow-lg shadow-violet-500/20">
              <div className="w-full h-full bg-[#0c0e14] rounded-[10px] flex items-center justify-center">
                <Music className="w-5 h-5 text-violet-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Harmonix Studio
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase tracking-wider">
                  Bidirecional
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Áudio para Partitura ↔ Partitura para Áudio • 6 Grupos
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-[#131722] p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('audio-to-score')}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'audio-to-score'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Áudio ➔ Partitura</span>
            </button>

            <button
              onClick={() => setActiveTab('score-to-audio')}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'score-to-audio'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileScan className="w-3.5 h-3.5" />
              <span>Partitura ➔ Áudio</span>
            </button>

            <button
              onClick={() => setActiveTab('export-studio')}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'export-studio'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar WAV & Stems</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Active Tab Panel */}
        {activeTab === 'audio-to-score' && (
          <AudioToScoreSection
            onScoreGenerated={handleScoreLoaded}
            onClearScore={handleClearScore}
            currentScore={score}
          />
        )}

        {activeTab === 'score-to-audio' && (
          <ScoreToAudioSection
            score={score}
            isPlaying={isPlaying}
            currentBeat={currentBeat}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            onSeek={handleSeek}
            onScoreLoaded={handleScoreLoaded}
            onUpdateScore={setScore}
            onExportMasterWav={handleExportMasterWav}
          />
        )}

        {activeTab === 'export-studio' && (
          <ExportStudioSection
            score={score}
            onExportMasterWav={handleExportMasterWav}
            onExportStemWav={handleExportStemWav}
          />
        )}

        {/* Global Active Score Status & Control Banner */}
        <section className="bg-[#0f121d] rounded-2xl border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                score.sourceType === 'preset'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : score.sourceType === 'audio_separated'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}
            >
              {score.sourceType === 'preset' ? 'Música de Amostra' : score.sourceType === 'audio_separated' ? 'Sua Música Transcrita' : 'Partitura no Sistema'}
            </span>
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                {score.title}
                {score.sourceFileName && (
                  <span className="text-xs text-slate-400 font-normal">
                    (Arquivo: {score.sourceFileName})
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400">
                {score.bpm} BPM • {score.keySignature} • {score.tracks.length} Pistas ativas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {score.sourceType === 'preset' ? (
              <button
                onClick={handleClearScore}
                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-xs font-medium transition-all"
                title="Remover amostra e deixar a tela pronta para o seu áudio"
              >
                Remover Amostra do Sistema
              </button>
            ) : (
              <button
                onClick={handleRestorePreset}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all"
                title="Carregar exemplo orquestral novamente"
              >
                Restaurar Amostra
              </button>
            )}

            <button
              onClick={handleClearScore}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all"
              title="Limpar todas as notas da partitura"
            >
              Pauta em Branco
            </button>
          </div>
        </section>

        {/* Global Interactive Vector Score Notation Viewer */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              Partitura Interativa Multi-Pistas (Cordas, Teclas, Percussão, Sopros, Metais, Coral)
            </h3>
            <span className="text-xs text-slate-400">
              Clique em qualquer nota para ouvir e editar o tom
            </span>
          </div>

          <ScoreViewer
            score={score}
            currentBeat={currentBeat}
            activeNoteIds={activeNoteIds}
            onSeekBeat={handleSeek}
            onUpdateScore={setScore}
          />
        </section>

        {/* Rigorous Music Fidelity Audit (> 70% mandatory) & Internet Assist Panel */}
        <section>
          <ScoreAuditPanel
            score={score}
            onRecalibrateScore={setScore}
          />
        </section>

        {/* Global Studio Mixer */}
        <section>
          <StudioMixer
            score={score}
            activeNoteIds={activeNoteIds}
            onUpdateTrack={handleUpdateTrack}
            onExportStemWav={handleExportStemWav}
          />
        </section>
      </main>

      {/* Sticky Bottom Mini DAW Transport Bar */}
      <footer className="sticky bottom-0 z-40 bg-[#0c0e14]/95 backdrop-blur-md border-t border-slate-800 p-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Current track playing metadata */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                {score.title}
              </p>
              <p className="text-[11px] text-slate-400">
                {score.bpm} BPM • {score.keySignature} • {score.tracks.length} Pistas
              </p>
            </div>
          </div>

          {/* Transport buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSeek(0)}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-all"
              title="Voltar ao início"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleStop}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-all"
              title="Parar"
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              onClick={isPlaying ? handlePause : () => handlePlay()}
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-600/20 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pausar' : 'Reproduzir Partitura'}</span>
            </button>
          </div>

          {/* Measure indicator & Quick Export */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Compasso</span>
              <span className="font-mono text-xs font-bold text-sky-400">
                {currentMeasure} <span className="text-slate-500">/ {score.totalMeasures}</span>
              </span>
            </div>

            <button
              onClick={handleExportMasterWav}
              className="px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Exportar arquivo WAV de alta qualidade"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar Master .WAV</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
