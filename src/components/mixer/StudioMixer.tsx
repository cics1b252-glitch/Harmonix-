import React, { useState } from 'react';
import { Score, Track, INSTRUMENT_FAMILIES } from '../../types/music';
import { globalAudioEngine } from '../../audio/AudioEngine';
import { soundFontEngine, AVAILABLE_INSTRUMENT_SAMPLES } from '../../audio/SoundFontEngine';
import { Volume2, VolumeX, Sliders, Download, Layers, Headphones, Music2 } from 'lucide-react';

interface StudioMixerProps {
  score: Score;
  activeNoteIds: Set<string>;
  onUpdateTrack: (trackId: string, updates: Partial<Track>) => void;
  onExportStemWav: (track: Track) => void;
}

export const StudioMixer: React.FC<StudioMixerProps> = ({
  score,
  activeNoteIds,
  onUpdateTrack,
  onExportStemWav,
}) => {
  const [useSamples, setUseSamples] = useState(globalAudioEngine.useSoundFontSamples);
  const [auditioningTrackId, setAuditioningTrackId] = useState<string | null>(null);
  const hasAnySolo = score.tracks.some(t => t.solo);

  const handleToggleSamples = () => {
    const nextVal = !useSamples;
    globalAudioEngine.useSoundFontSamples = nextVal;
    setUseSamples(nextVal);
  };

  const handleAuditionTrackSample = (track: Track) => {
    setAuditioningTrackId(track.id);
    soundFontEngine.previewNote(track.family, 60, track.soundfontKey);
    setTimeout(() => {
      setAuditioningTrackId(null);
    }, 1200);
  };

  const handleSelectSampleVariation = (track: Track, sampleKey: string, sampleName: string) => {
    onUpdateTrack(track.id, {
      soundfontKey: sampleKey,
      subInstrument: sampleName,
    });
    soundFontEngine.previewNote(track.family, 60, sampleKey);
  };

  const handleVolumeChange = (track: Track, newVol: number) => {
    onUpdateTrack(track.id, { volume: newVol });
    globalAudioEngine.updateTrackMixer(track.id, newVol, track.pan, track.muted, track.solo, hasAnySolo);
  };

  const handlePanChange = (track: Track, newPan: number) => {
    onUpdateTrack(track.id, { pan: newPan });
    globalAudioEngine.updateTrackMixer(track.id, track.volume, newPan, track.muted, track.solo, hasAnySolo);
  };

  const handleMuteToggle = (track: Track) => {
    const newMuted = !track.muted;
    onUpdateTrack(track.id, { muted: newMuted });
    globalAudioEngine.updateTrackMixer(track.id, track.volume, track.pan, newMuted, track.solo, hasAnySolo);
  };

  const handleSoloToggle = (track: Track) => {
    const newSolo = !track.solo;
    onUpdateTrack(track.id, { solo: newSolo });
    const nextHasAnySolo = score.tracks.some(t => t.id === track.id ? newSolo : t.solo);
    score.tracks.forEach(t => {
      const isThisSolo = t.id === track.id ? newSolo : t.solo;
      globalAudioEngine.updateTrackMixer(t.id, t.volume, t.pan, t.muted, isThisSolo, nextHasAnySolo);
    });
  };

  return (
    <div className="bg-[#0f121d] rounded-2xl border border-slate-800 p-4 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Mesa de Mixagem dos Grupos
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                6 Famílias
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Ajuste volume, pan, escolha timbres de samples reais (FluidR3 GM) e exporte stems em WAV.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSamples}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              useSamples
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
            title="Alternar entre samples reais gravados e sintetizador"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>{useSamples ? '✓ Samples Reais Ativos' : 'Usar Síntese Procedural'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Track Faders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {score.tracks.map(track => {
          const meta = INSTRUMENT_FAMILIES[track.family];
          // Check if this track is currently sounding notes
          const isSounding = track.notes.some(n => activeNoteIds.has(n.id));

          return (
            <div
              key={track.id}
              className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all ${
                track.muted
                  ? 'bg-[#12141c]/50 border-slate-800/50 opacity-60'
                  : track.solo
                  ? 'bg-[#171b29] border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-[#141824] border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header: Family badge and name */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-xs font-bold text-white truncate" title={track.name}>
                    {meta.namePt}
                  </span>
                </div>

                {/* Sounding visual meter dot */}
                <span
                  className={`w-2 h-2 rounded-full transition-all duration-75 ${
                    isSounding && !track.muted && (!hasAnySolo || track.solo)
                      ? 'scale-125 shadow-lg shadow-sky-400'
                      : 'opacity-20'
                  }`}
                  style={{ backgroundColor: meta.color }}
                  title={isSounding ? 'Emitindo som agora' : 'Inativo'}
                />
              </div>

              {/* Sub-instrument label & variation selector */}
              <div className="flex items-center justify-between gap-1 mb-2.5">
                <select
                  value={track.soundfontKey || (AVAILABLE_INSTRUMENT_SAMPLES[track.family]?.[0]?.soundfontKey || '')}
                  onChange={(e) => {
                    const sample = AVAILABLE_INSTRUMENT_SAMPLES[track.family]?.find(s => s.soundfontKey === e.target.value);
                    if (sample) {
                      handleSelectSampleVariation(track, sample.soundfontKey, sample.name);
                    }
                  }}
                  className="bg-[#0e111a] border border-slate-700/80 rounded px-1.5 py-1 text-[10px] text-slate-300 w-full truncate focus:outline-none focus:border-sky-500"
                  title="Selecionar timbre de instrumento FluidR3 GM"
                >
                  {(AVAILABLE_INSTRUMENT_SAMPLES[track.family] || []).map(sample => (
                    <option key={sample.id} value={sample.soundfontKey}>
                      {sample.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleAuditionTrackSample(track)}
                  className={`p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors shrink-0 ${
                    auditioningTrackId === track.id ? 'text-emerald-400 bg-emerald-500/20 animate-pulse' : ''
                  }`}
                  title="Ouvir teste de amostra deste instrumento"
                >
                  <Volume2 className="w-3 h-3" />
                </button>
              </div>

              {/* Solo & Mute Buttons */}
              <div className="flex items-center gap-1.5 mb-3">
                <button
                  onClick={() => handleSoloToggle(track)}
                  className={`flex-1 py-1 rounded text-xs font-bold transition-all ${
                    track.solo
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                  title="Solo (ouvir apenas esta família de instrumentos)"
                >
                  S
                </button>
                <button
                  onClick={() => handleMuteToggle(track)}
                  className={`flex-1 py-1 rounded text-xs font-bold transition-all ${
                    track.muted
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                  title="Mute (silenciar esta família)"
                >
                  M
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex flex-col gap-1 mb-3">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Volume</span>
                  <span className="font-mono text-slate-300">
                    {track.muted ? 'Mudo' : `${Math.round(track.volume * 100)}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={track.volume}
                  onChange={(e) => handleVolumeChange(track, parseFloat(e.target.value))}
                  disabled={track.muted}
                  className="w-full accent-violet-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Pan Slider */}
              <div className="flex flex-col gap-1 mb-4">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Pan</span>
                  <span className="font-mono text-slate-300">
                    {track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.round(Math.abs(track.pan) * 100)}` : `R${Math.round(track.pan * 100)}`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={track.pan}
                  onChange={(e) => handlePanChange(track, parseFloat(e.target.value))}
                  className="w-full accent-blue-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Stem Export Button for this specific track */}
              <button
                onClick={() => onExportStemWav(track)}
                className="w-full py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition-colors border border-slate-700/50"
                title={`Exportar arquivo WAV isolado de ${track.name}`}
              >
                <Download className="w-3 h-3 text-slate-400" />
                <span>Stem .WAV</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
