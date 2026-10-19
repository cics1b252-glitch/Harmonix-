import React, { useState, useRef, useEffect } from 'react';
import { Score, Track, INSTRUMENT_FAMILIES, InstrumentFamily } from '../../types/music';
import {
  FileScan, Upload, Image as ImageIcon, Sparkles, CheckCircle2,
  AlertCircle, Play, Pause, Square, RotateCcw, Volume2, Download,
  Sliders, Wand2, Music2, Layers, Headphones, Radio, PlayCircle, Disc
} from 'lucide-react';
import { globalAudioEngine } from '../../audio/AudioEngine';
import { soundFontEngine, AVAILABLE_INSTRUMENT_SAMPLES } from '../../audio/SoundFontEngine';
import { TEARS_IN_HEAVEN_SCORE } from '../../data/tearsInHeavenScore';

interface ScoreToAudioSectionProps {
  score: Score;
  isPlaying: boolean;
  currentBeat: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (beat: number) => void;
  onScoreLoaded: (score: Score) => void;
  onUpdateScore: (newScore: Score) => void;
  onExportMasterWav: () => void;
}

export const ScoreToAudioSection: React.FC<ScoreToAudioSectionProps> = ({
  score,
  isPlaying,
  currentBeat,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onScoreLoaded,
  onUpdateScore,
  onExportMasterWav,
}) => {
  const [sheetImageFile, setSheetImageFile] = useState<File | null>(null);
  const [sheetImageUrl, setSheetImageUrl] = useState<string | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Instrument Samples State
  const [useSamples, setUseSamples] = useState<boolean>(globalAudioEngine.useSoundFontSamples);
  const [auditioningKey, setAuditioningKey] = useState<string | null>(null);
  const [loadingAllSamples, setLoadingAllSamples] = useState<boolean>(false);
  const [loadedSampleKeys, setLoadedSampleKeys] = useState<Set<string>>(new Set(soundFontEngine.loadedSoundfonts));

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    soundFontEngine.onSampleLoadProgress = (instrument, percent) => {
      if (percent >= 100) {
        setLoadedSampleKeys(prev => new Set([...prev, instrument]));
      }
    };
  }, []);

  // Audition / test note playback
  const handleAudition = (family: InstrumentFamily, sfKey: string) => {
    setAuditioningKey(sfKey);
    soundFontEngine.previewNote(family, 60, sfKey);
    setTimeout(() => {
      setAuditioningKey(null);
    }, 1200);
  };

  // Toggle real samples vs procedural
  const handleToggleSamples = () => {
    const nextVal = !useSamples;
    globalAudioEngine.useSoundFontSamples = nextVal;
    setUseSamples(nextVal);
  };

  // Assign chosen instrument sample to family track
  const handleSelectSample = (family: InstrumentFamily, sample: { id: string; name: string; soundfontKey: string }) => {
    const updatedTracks = score.tracks.map(t => {
      if (t.family === family) {
        return {
          ...t,
          subInstrument: sample.name,
          soundfontKey: sample.soundfontKey,
        };
      }
      return t;
    });
    onUpdateScore({ ...score, tracks: updatedTracks });
    handleAudition(family, sample.soundfontKey);
  };

  // Pre-load all open-source instrument soundfonts
  const handleLoadAllSamples = async () => {
    setLoadingAllSamples(true);
    try {
      globalAudioEngine.init();
      // Pre-load each family's primary soundfont
      const families: InstrumentFamily[] = ['strings', 'keys', 'percussion', 'woodwinds', 'brass', 'choir'];
      for (const fam of families) {
        const samples = AVAILABLE_INSTRUMENT_SAMPLES[fam];
        if (samples && samples[0]) {
          await soundFontEngine.loadInstrument(samples[0].soundfontKey, (window.AudioContext ? new AudioContext() : null) as any);
        }
      }
      setLoadedSampleKeys(new Set(soundFontEngine.loadedSoundfonts));
    } catch (_) {
      // fallback handles it automatically
    } finally {
      setLoadingAllSamples(false);
    }
  };

  // Handle Sheet Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSheetImageFile(file);
      setSheetImageUrl(URL.createObjectURL(file));
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Run Optical Music Recognition (OMR)
  const handleOcrSheetMusic = async () => {
    if (!sheetImageFile) {
      setErrorMessage('Por favor envie uma foto ou imagem de partitura.');
      return;
    }

    setIsProcessingOcr(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setOcrStatus('Carregando imagem em alta resolução...');

    try {
      const base64Data = await fileToBase64(sheetImageFile);
      setOcrStatus('Analisando pautas, claves, armaduras e figuras musicais com Visão Computacional...');

      const response = await fetch('/api/ocr-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: base64Data,
          mimeType: sheetImageFile.type || 'image/png',
          fileName: sheetImageFile.name,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Falha ao ler partitura da imagem.');
      }

      setOcrStatus('Mapeando notas para síntese sonora e separando famílias...');
      const data = await response.json();

      if (data.score) {
        onScoreLoaded(data.score);
        setSuccessMessage(`Partitura lida com sucesso! ${data.score.totalMeasures} compassos detectados e prontos para reprodução.`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Erro ao processar imagem de partitura.');
    } finally {
      setIsProcessingOcr(false);
    }
  };

  // Transpose All Tracks (+1 or -1 semitone)
  const handleTranspose = (semitones: number) => {
    const updatedTracks = score.tracks.map(track => ({
      ...track,
      notes: track.notes.map(note => {
        if (track.family === 'percussion' || note.isRest) return note;
        const newMidi = Math.max(24, Math.min(108, note.midiNote + semitones));
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const stepNames: ('C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B')[] = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'];
        const oct = Math.floor(newMidi / 12) - 1;
        const semitone = newMidi % 12;
        const newPitch = `${noteNames[semitone]}${oct}`;

        return {
          ...note,
          midiNote: newMidi,
          pitch: newPitch,
          step: stepNames[semitone],
          alter: noteNames[semitone].includes('#') ? 1 : 0,
          octave: oct,
        };
      }),
    }));

    onUpdateScore({ ...score, tracks: updatedTracks });
  };

  // Change Tempo BPM
  const handleBpmChange = (newBpm: number) => {
    const clamped = Math.max(40, Math.min(240, newBpm));
    onUpdateScore({ ...score, bpm: clamped });
    if (isPlaying) {
      onStop();
      setTimeout(() => onPlay(), 50);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-[#101424] to-emerald-950/30 rounded-2xl border border-blue-500/20 p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-3">
              <FileScan className="w-3.5 h-3.5" />
              Caminho Inverso • Ler Partitura & Sintetizar Áudio
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Leia Qualquer Partitura e Transforme em Áudio Estúdio
            </h2>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl">
              Envie uma foto de partitura (física ou digital) para leitura óptica imediata por inteligência artificial, ou toque a partitura atual com os instrumentos orquestrais modelados acusticamente.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExportMasterWav}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Áudio .WAV Master</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two columns: Left = Sheet OCR intake, Right = Master DAW Transport & Audio Synthesizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: OMR Reader */}
        <div className="bg-[#0f121d] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-400" />
              Leitor Óptico de Partituras (Foto / Scan)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Envie a foto de uma partitura impressa ou PDF screenshot para transcrição e síntese automática.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                sheetImageFile
                  ? 'border-blue-500/50 bg-blue-500/5'
                  : 'border-slate-700 hover:border-slate-500 bg-[#121624]/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {sheetImageUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={sheetImageUrl}
                    alt="Partitura enviada"
                    className="max-h-36 rounded-lg object-contain border border-slate-700 shadow"
                  />
                  <p className="text-xs text-white font-medium flex items-center gap-1.5 mt-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {sheetImageFile?.name}
                  </p>
                  <span className="text-[11px] text-slate-400">Clique para substituir imagem</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-200">
                    Selecione uma imagem de partitura
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP de manuscritos ou impressos</p>
                </div>
              )}
            </div>

            {/* Quick-load uploaded Tears in Heaven sheet & TAB */}
            <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-[#161a29] to-indigo-950/40 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/image_5246844e.png"
                  alt="Tears in Heaven"
                  className="w-12 h-12 object-cover rounded-lg border border-amber-500/40 shrink-0 shadow"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Tears in Heaven</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase border border-amber-500/30">
                      Cifra & Tablatura
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Eric Clapton • Violão Fingerstyle Nylon, Cifras e Letra
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onScoreLoaded(TEARS_IN_HEAVEN_SCORE);
                  setSuccessMessage('Partitura, Cifra e Tablatura de "Tears in Heaven" carregada com sucesso! Violão fingerstyle pronto para tocar.');
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-all active:scale-95 shrink-0"
              >
                Carregar Imagem Enviada
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {isProcessingOcr && (
              <div className="mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin shrink-0" />
                <span>{ocrStatus}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleOcrSheetMusic}
            disabled={isProcessingOcr || !sheetImageFile}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isProcessingOcr || !sheetImageFile
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-[0.99]'
            }`}
          >
            <FileScan className="w-4 h-4" />
            <span>Ler Partitura & Transformar em Áudio</span>
          </button>
        </div>

        {/* Right: Master DAW Synthesizer Transport Controls */}
        <div className="bg-[#0f121d] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  Painel Central de Síntese Sonora
                </h3>
                <p className="text-xs text-slate-400">
                  Controle andamento, transposição e toque a partitura em tempo real.
                </p>
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-slate-300 font-mono">
                  {isPlaying ? 'Reproduzindo' : 'Pausado'}
                </span>
              </div>
            </div>

            {/* Transport Big Buttons */}
            <div className="flex items-center gap-3 p-4 bg-[#141824] rounded-xl border border-slate-800 justify-center">
              <button
                onClick={onStop}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all"
                title="Parar e voltar ao início"
              >
                <Square className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSeek(0)}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all"
                title="Reiniciar início"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Play / Pause Main */}
              <button
                onClick={isPlaying ? onPause : onPlay}
                className="px-6 py-3.5 bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isPlaying ? 'Pausar' : 'Tocar Partitura'}</span>
              </button>
            </div>

            {/* Time / Measure / BPM Info */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-[#141824] p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Andamento</span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <button
                    onClick={() => handleBpmChange(score.bpm - 5)}
                    className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-white text-base">{score.bpm}</span>
                  <button
                    onClick={() => handleBpmChange(score.bpm + 5)}
                    className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                  >
                    +
                  </button>
                </div>
                <span className="text-[10px] text-slate-400">BPM</span>
              </div>

              <div className="bg-[#141824] p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Transposição</span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <button
                    onClick={() => handleTranspose(-1)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                    title="Baixar 1 semitom"
                  >
                    -1b
                  </button>
                  <span className="font-mono font-bold text-violet-300 text-xs truncate">
                    {score.keySignature.split(' ')[0]}
                  </span>
                  <button
                    onClick={() => handleTranspose(1)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                    title="Subir 1 semitom"
                  >
                    +1#
                  </button>
                </div>
                <span className="text-[10px] text-slate-400">Tom Geral</span>
              </div>

              <div className="bg-[#141824] p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Compasso</span>
                <span className="font-mono font-bold text-sky-400 text-base mt-1 block">
                  {Math.floor(currentBeat / score.timeSignature.beats) + 1}
                  <span className="text-slate-500 text-xs font-normal"> / {score.totalMeasures}</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  Batida {(currentBeat % score.timeSignature.beats + 1).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Notice with Toggle */}
          <div className="bg-emerald-950/20 border border-emerald-500/20 p-3.5 rounded-xl text-xs text-emerald-300/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                Motor Acústico: <strong>{useSamples ? 'Samples Reais de Instrumentos (FluidR3 Open-Source)' : 'Síntese Procedural'}</strong>
              </span>
            </div>
            <button
              onClick={handleToggleSamples}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                useSamples
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {useSamples ? '✓ Usando Samples Reais' : 'Ativar Samples Reais'}
            </button>
          </div>
        </div>
      </div>

      {/* Acoustic Instrument Sample Soundbank & Reconstruction Studio */}
      <div className="bg-[#0f121d] rounded-2xl border border-slate-800 p-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Disc className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Banco de Samples de Instrumentos para Reconstrução Sonora
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider font-semibold">
                  Open-Source SOTA
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Selecione o timbre acústico exato de cada família. Ao reproduzir ou exportar para .WAV Master, a partitura é reconstruída com estas amostras de alta resolução.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadAllSamples}
              disabled={loadingAllSamples}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loadingAllSamples ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  <span>Carregando SoundFonts...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Carregar Todos os Samples</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 6 Instrument Family Sample Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(['strings', 'keys', 'percussion', 'woodwinds', 'brass', 'choir'] as InstrumentFamily[]).map(fam => {
            const meta = INSTRUMENT_FAMILIES[fam];
            const samples = AVAILABLE_INSTRUMENT_SAMPLES[fam] || [];
            const track = score.tracks.find(t => t.family === fam);
            const currentSub = track?.subInstrument || samples[0]?.name || meta.namePt;
            const currentKey = track?.soundfontKey || samples[0]?.soundfontKey;

            return (
              <div
                key={fam}
                className="bg-[#141824] border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.color }} />
                      <span className="text-sm font-bold text-white">{meta.namePt}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {track ? `${track.notes.length} notas na pauta` : 'Inativo'}
                    </span>
                  </div>

                  {/* Instrument variation selector */}
                  <div className="flex flex-col gap-1.5 mt-3">
                    <label className="text-[11px] text-slate-400">Timbre Acústico Selecionado:</label>
                    <div className="flex flex-col gap-1">
                      {samples.map(sample => {
                        const isSelected = currentSub === sample.name || currentKey === sample.soundfontKey;
                        const isAuditioning = auditioningKey === sample.soundfontKey;

                        return (
                          <div
                            key={sample.id}
                            className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-sky-950/40 border-sky-500/60 text-white font-medium shadow-sm'
                                : 'bg-[#10131d] border-slate-800/80 text-slate-300 hover:border-slate-700'
                            }`}
                            onClick={() => handleSelectSample(fam, sample)}
                          >
                            <span className="truncate pr-2">{sample.name}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAudition(fam, sample.soundfontKey);
                                }}
                                className={`p-1.5 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition-all ${
                                  isAuditioning ? 'text-emerald-400 bg-emerald-500/20 animate-pulse' : ''
                                }`}
                                title="Ouvir amostra acústica deste instrumento"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-sky-400" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Sample Pronto
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAudition(fam, currentKey || samples[0]?.soundfontKey)}
                    className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
                  >
                    <span>Testar Nota C4</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
