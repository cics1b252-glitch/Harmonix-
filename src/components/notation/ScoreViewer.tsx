import React, { useState, useRef } from 'react';
import { Score, Track, Note, InstrumentFamily, INSTRUMENT_FAMILIES, ScoreChord } from '../../types/music';
import { globalAudioEngine } from '../../audio/AudioEngine';
import { soundFontEngine } from '../../audio/SoundFontEngine';
import { ChordDiagram } from './ChordDiagram';
import {
  ZoomIn, ZoomOut, Printer, Eye, Music2, Edit3, Trash2, Plus,
  Volume2, Sliders, Layers, FileText, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';

interface ScoreViewerProps {
  score: Score;
  currentBeat: number;
  activeNoteIds: Set<string>;
  onSeekBeat: (beat: number) => void;
  onUpdateScore: (newScore: Score) => void;
}

// Staff line coordinates helper (5 lines: line 0 is top, line 4 is bottom)
const TREBLE_PITCH_Y_STEPS: Record<string, number> = {
  'G5': -1, 'F5': 0, 'E5': 1, 'D5': 2, 'C5': 3, 'B4': 4, 'A4': 5, 'G4': 6, 'F4': 7, 'E4': 8, 'D4': 9, 'C4': 10, 'B3': 11, 'A3': 12
};

const BASS_PITCH_Y_STEPS: Record<string, number> = {
  'E4': -2, 'D4': -1, 'C4': 0, 'B3': 1, 'A3': 2, 'G3': 3, 'F3': 4, 'E3': 5, 'D3': 6, 'C3': 7, 'B2': 8, 'A2': 9, 'G2': 10, 'F2': 11, 'E2': 12
};

// Standard guitar tuning helper (string 1=E4: 64, 2=B3: 59, 3=G3: 55, 4=D3: 50, 5=A2: 45, 6=E2: 40)
function getGuitarTabForNote(note: Note): { string: number; fret: number } {
  if (note.tab) return note.tab;
  const midi = note.midiNote || 60;
  const openStrings = [64, 59, 55, 50, 45, 40]; // strings 1 to 6
  for (let s = 0; s < 6; s++) {
    const diff = midi - openStrings[s];
    if (diff >= 0 && diff <= 17) {
      return { string: s + 1, fret: diff };
    }
  }
  return { string: 5, fret: Math.max(0, Math.min(12, midi - 45)) };
}

export const ScoreViewer: React.FC<ScoreViewerProps> = ({
  score,
  currentBeat,
  activeNoteIds,
  onSeekBeat,
  onUpdateScore,
}) => {
  const [zoom, setZoom] = useState(1.0);
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<InstrumentFamily | 'all'>('all');
  const [notationMode, setNotationMode] = useState<'complete' | 'standard' | 'tablature' | 'chords'>('complete');
  const [showChordDiagrams, setShowChordDiagrams] = useState<boolean>(true);
  const [selectedNote, setSelectedNote] = useState<{ trackId: string; note: Note } | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Visible tracks based on filter
  const visibleTracks = selectedFamilyFilter === 'all'
    ? score.tracks
    : score.tracks.filter(t => t.family === selectedFamilyFilter);

  // Geometry dimensions
  const STAFF_LINE_SPACING = 10;
  const STAFF_HEIGHT = 4 * STAFF_LINE_SPACING; // 40px
  const TAB_LINE_SPACING = 9;
  const TAB_HEIGHT = 5 * TAB_LINE_SPACING; // 45px
  const HEADER_WIDTH = 185;
  const BEAT_WIDTH = 68 * zoom;
  const MEASURE_BEATS = score.timeSignature.beats;
  const MEASURE_WIDTH = MEASURE_BEATS * BEAT_WIDTH;
  const CHORD_TOP_HEIGHT = (score.hasChords || score.chords?.length) ? 32 : 12;

  // Compute vertical offset per track based on notation mode
  const getTrackHeight = (track: Track) => {
    const isGuitar = track.hasTablature || track.family === 'strings';
    if (notationMode === 'complete' && isGuitar) {
      return STAFF_HEIGHT + TAB_HEIGHT + 65; // both notation + TAB + lyrics
    }
    if (notationMode === 'tablature' && isGuitar) {
      return TAB_HEIGHT + 45;
    }
    return STAFF_HEIGHT + 55;
  };

  let cumulativeY = 45 + CHORD_TOP_HEIGHT;
  const trackPositions: { track: Track; staffY: number; tabY?: number; height: number }[] = visibleTracks.map(track => {
    const isGuitar = track.hasTablature || track.family === 'strings';
    const height = getTrackHeight(track);
    const staffY = cumulativeY;
    let tabY: number | undefined;

    if (notationMode === 'complete' && isGuitar) {
      tabY = staffY + STAFF_HEIGHT + 24;
    } else if (notationMode === 'tablature' && isGuitar) {
      tabY = staffY;
    }

    cumulativeY += height;
    return { track, staffY, tabY, height };
  });

  const TOTAL_SCORE_WIDTH = HEADER_WIDTH + (score.totalMeasures * MEASURE_WIDTH) + 80;
  const TOTAL_SCORE_HEIGHT = cumulativeY + 50;

  // Calculate current playhead X position
  const playheadX = HEADER_WIDTH + (currentBeat * BEAT_WIDTH);

  // Handle Note Click
  const handleNoteClick = (track: Track, note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNote({ trackId: track.id, note });
    // Preview sound via soundfont / audio engine
    soundFontEngine.previewNote(track.family, note.midiNote, track.soundfontKey);
  };

  // Handle Click on Measure / Staff to seek
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left);
    if (clickX > HEADER_WIDTH) {
      const beatClicked = Math.max(0, (clickX - HEADER_WIDTH) / BEAT_WIDTH);
      onSeekBeat(beatClicked);
    }
  };

  // Quick Pitch Shift (+ / - semitone)
  const handlePitchChange = (semitones: number) => {
    if (!selectedNote) return;
    const { trackId, note } = selectedNote;

    const newMidi = Math.max(24, Math.min(108, note.midiNote + semitones));
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const stepNames: ('C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B')[] = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'];
    const oct = Math.floor(newMidi / 12) - 1;
    const semitone = newMidi % 12;
    const newPitch = `${noteNames[semitone]}${oct}`;

    const updatedTracks = score.tracks.map(t => {
      if (t.id !== trackId) return t;
      return {
        ...t,
        notes: t.notes.map(n => n.id === note.id ? {
          ...n,
          midiNote: newMidi,
          pitch: newPitch,
          step: stepNames[semitone],
          alter: noteNames[semitone].includes('#') ? 1 : 0,
          octave: oct,
          tab: n.tab ? { string: n.tab.string, fret: Math.max(0, n.tab.fret + semitones) } : undefined,
        } : n)
      };
    });

    onUpdateScore({ ...score, tracks: updatedTracks });
    setSelectedNote(prev => prev ? {
      ...prev,
      note: {
        ...prev.note,
        midiNote: newMidi,
        pitch: newPitch,
        step: stepNames[semitone],
        alter: noteNames[semitone].includes('#') ? 1 : 0,
        octave: oct,
        tab: prev.note.tab ? { string: prev.note.tab.string, fret: Math.max(0, prev.note.tab.fret + semitones) } : undefined,
      }
    } : null);

    soundFontEngine.previewNote(tFamily(trackId), newMidi);
  };

  const tFamily = (trackId: string): InstrumentFamily => {
    const t = score.tracks.find(tr => tr.id === trackId);
    return t ? t.family : 'keys';
  };

  // Delete selected note
  const handleDeleteNote = () => {
    if (!selectedNote) return;
    const { trackId, note } = selectedNote;
    const updatedTracks = score.tracks.map(t => {
      if (t.id !== trackId) return t;
      return {
        ...t,
        notes: t.notes.filter(n => n.id !== note.id)
      };
    });
    onUpdateScore({ ...score, tracks: updatedTracks });
    setSelectedNote(null);
  };

  // Unique list of chords present in this score
  const uniqueScoreChords: ScoreChord[] = React.useMemo(() => {
    const list: ScoreChord[] = [];
    const seen = new Set<string>();
    (score.chords || []).forEach(c => {
      if (!seen.has(c.chord)) {
        seen.add(c.chord);
        list.push(c);
      }
    });
    // Check notes with chordSymbol
    score.tracks.forEach(t => {
      t.notes.forEach(n => {
        if (n.chordSymbol && !seen.has(n.chordSymbol)) {
          seen.add(n.chordSymbol);
          list.push({ beat: n.startTime, chord: n.chordSymbol });
        }
      });
    });
    return list;
  }, [score]);

  return (
    <div className={`flex flex-col h-full ${printMode ? 'printable-score bg-white text-black p-4' : 'bg-[#0f121d] rounded-2xl border border-slate-800'}`}>
      {/* Top Toolbar */}
      <div className={`p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 ${printMode ? 'no-print' : ''}`}>
        {/* Title and metadata */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Music2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {score.title}
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
                {score.keySignature}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                {score.bpm} BPM
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {score.timeSignature.beats}/{score.timeSignature.beatType}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {score.composer} • {score.totalMeasures} Compassos • {score.tracks.length} Pistas Separadas
            </p>
          </div>
        </div>

        {/* View Mode Selector: Completo | Partitura | Tablatura | Cifras */}
        <div className="flex items-center bg-[#131722] p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setNotationMode('complete')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              notationMode === 'complete'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Exibir Partitura Tradicional + Tablatura de Violão + Cifras simultâneas"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Completo (Partitura + TAB + Cifra)</span>
          </button>

          <button
            onClick={() => setNotationMode('tablature')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              notationMode === 'tablature'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Exibir Tablatura de 6 cordas (e B G D A E) com números de trastes"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tablatura (TAB)</span>
          </button>

          <button
            onClick={() => setNotationMode('standard')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              notationMode === 'standard'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Exibir Pautas de 5 linhas clássicas"
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>Partitura Padrão</span>
          </button>
        </div>

        {/* Family Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#141824] p-1 rounded-xl border border-slate-800 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedFamilyFilter('all')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              selectedFamilyFilter === 'all'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Grade Completa
          </button>
          {(['strings', 'keys', 'percussion', 'woodwinds', 'brass', 'choir'] as InstrumentFamily[]).map(fam => {
            const meta = INSTRUMENT_FAMILIES[fam];
            const isSelected = selectedFamilyFilter === fam;
            return (
              <button
                key={fam}
                onClick={() => setSelectedFamilyFilter(fam)}
                className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                  isSelected ? 'text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                style={{
                  backgroundColor: isSelected ? meta.color : 'transparent',
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                {meta.namePt}
              </button>
            );
          })}
        </div>

        {/* Controls: Zoom, Print */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#141824] border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setZoom(prev => Math.max(0.7, prev - 0.1))}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              title="Reduzir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 text-slate-400 font-mono">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setPrintMode(!printMode);
              if (!printMode) {
                setTimeout(() => window.print(), 200);
              }
            }}
            className="p-2 text-slate-300 hover:text-white bg-[#141824] hover:bg-slate-800 border border-slate-800 rounded-lg text-xs flex items-center gap-1.5 transition-all"
            title="Imprimir ou Salvar PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Chord Diagrams & Cifras Showcase Drawer */}
      {uniqueScoreChords.length > 0 && (
        <div className={`px-4 py-2.5 bg-[#0b0e17] border-b border-slate-800/80 ${printMode ? 'no-print' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Dicionário de Acordes & Cifras da Música (Fingerstyle / Violão)
              </span>
            </div>
            <button
              onClick={() => setShowChordDiagrams(!showChordDiagrams)}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <span>{showChordDiagrams ? 'Ocultar Diagramas' : 'Exibir Diagramas de Braço'}</span>
              {showChordDiagrams ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showChordDiagrams && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1">
              {uniqueScoreChords.map(c => (
                <div
                  key={c.chord}
                  className="cursor-pointer"
                  onClick={() => soundFontEngine.previewNote('strings', 45, 'acoustic_guitar_nylon')}
                  title={`Acorde ${c.chord} - Clique para ouvir`}
                >
                  <ChordDiagram chord={c.chord} diagram={c.diagram} fret={c.fret || 1} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactive Note Edit Floating Bar */}
      {selectedNote && !printMode && (
        <div className="px-4 py-2 bg-gradient-to-r from-violet-950/60 to-indigo-950/60 border-b border-violet-500/30 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-violet-400" />
              Nota Selecionada: <span className="font-mono text-violet-300 font-bold">{selectedNote.note.pitch}</span>
              {selectedNote.note.tab && (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  Corda {selectedNote.note.tab.string} • Traste {selectedNote.note.tab.fret}
                </span>
              )}
              {selectedNote.note.chordSymbol && (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
                  Acorde: {selectedNote.note.chordSymbol}
                </span>
              )}
            </span>
            <span className="text-slate-400">
              Batida: {selectedNote.note.startTime.toFixed(2)} • Duração: {selectedNote.note.duration}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePitchChange(-1)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-mono"
              title="Baixar 1 semitom"
            >
              -1 Semitom
            </button>
            <button
              onClick={() => handlePitchChange(1)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-mono"
              title="Subir 1 semitom"
            >
              +1 Semitom
            </button>
            <button
              onClick={handleDeleteNote}
              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded ml-2"
              title="Excluir Nota"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSelectedNote(null)}
              className="text-slate-400 hover:text-white ml-2"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Main SVG Vector Sheet Music Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-6 bg-[#0c0e14] relative cursor-pointer"
        style={{
          backgroundColor: printMode ? '#ffffff' : '#0c0e14',
        }}
      >
        <svg
          width={TOTAL_SCORE_WIDTH}
          height={TOTAL_SCORE_HEIGHT}
          className="select-none"
          onClick={handleSvgClick}
        >
          <defs>
            <filter id="note-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Render Measure Numbers and Chord Names along the top */}
          {Array.from({ length: score.totalMeasures }).map((_, mIdx) => {
            const measureX = HEADER_WIDTH + (mIdx * MEASURE_WIDTH);
            return (
              <g key={`measure-num-${mIdx}`}>
                <text
                  x={measureX + 6}
                  y={22}
                  fill={printMode ? '#666666' : '#64748b'}
                  fontSize={11}
                  fontFamily="JetBrains Mono"
                  fontWeight="600"
                >
                  {mIdx + 1}
                </text>
              </g>
            );
          })}

          {/* Render Chord Symbols across the timeline */}
          {(score.chords || []).map((ch, chIdx) => {
            const chordX = HEADER_WIDTH + (ch.beat * BEAT_WIDTH) + 38;
            return (
              <g key={`top-chord-${chIdx}`}>
                <rect
                  x={chordX - 4}
                  y={28}
                  width={ch.chord.length * 8 + 8}
                  height={18}
                  rx={4}
                  fill={printMode ? 'none' : 'rgba(245, 158, 11, 0.12)'}
                  stroke={printMode ? 'none' : 'rgba(245, 158, 11, 0.3)'}
                  strokeWidth={0.8}
                />
                <text
                  x={chordX}
                  y={41}
                  fill={printMode ? '#000000' : '#fbbf24'}
                  fontSize={12}
                  fontFamily="Plus Jakarta Sans"
                  fontWeight="800"
                >
                  {ch.chord}
                </text>
              </g>
            );
          })}

          {/* Render Each Instrument Track */}
          {trackPositions.map(({ track, staffY, tabY, height }) => {
            const familyMeta = INSTRUMENT_FAMILIES[track.family];
            const isBass = track.clef === 'bass';
            const isPercussion = track.family === 'percussion';
            const isGuitar = track.hasTablature || track.family === 'strings';
            const renderStandard = notationMode !== 'tablature';
            const renderTab = (notationMode === 'tablature' || notationMode === 'complete') && isGuitar && tabY !== undefined;

            return (
              <g key={track.id} className="transition-opacity">
                {/* Track Header Label */}
                <g transform={`translate(10, ${staffY + 15})`}>
                  <rect
                    x={0}
                    y={-14}
                    width={HEADER_WIDTH - 20}
                    height={height - 25}
                    rx={6}
                    fill={printMode ? 'none' : familyMeta.bgLight}
                    stroke={printMode ? '#000000' : familyMeta.borderLight}
                    strokeWidth={1}
                  />
                  <circle cx={14} cy={5} r={4} fill={familyMeta.color} />
                  <text
                    x={26}
                    y={2}
                    fill={printMode ? '#000000' : '#ffffff'}
                    fontSize={12}
                    fontWeight="700"
                    fontFamily="Plus Jakarta Sans"
                  >
                    {track.name}
                  </text>
                  <text
                    x={26}
                    y={16}
                    fill={printMode ? '#444444' : '#94a3b8'}
                    fontSize={9.5}
                    fontFamily="Plus Jakarta Sans"
                  >
                    {track.subInstrument}
                  </text>
                </g>

                {/* 1. STANDARD 5-LINE STAFF */}
                {renderStandard && (
                  <g>
                    {/* 5 Staff Lines */}
                    {Array.from({ length: 5 }).map((_, lineIdx) => {
                      const lineY = staffY + (lineIdx * STAFF_LINE_SPACING);
                      return (
                        <line
                          key={`line-${track.id}-${lineIdx}`}
                          x1={HEADER_WIDTH - 15}
                          y1={lineY}
                          x2={HEADER_WIDTH + (score.totalMeasures * MEASURE_WIDTH)}
                          y2={lineY}
                          stroke={printMode ? '#000000' : '#334155'}
                          strokeWidth={1.2}
                        />
                      );
                    })}

                    {/* Clef Sign */}
                    <g transform={`translate(${HEADER_WIDTH - 8}, ${staffY + 28})`}>
                      {isPercussion ? (
                        <g>
                          <rect x={2} y={-22} width={3} height={28} fill={printMode ? '#000' : '#94a3b8'} />
                          <rect x={8} y={-22} width={3} height={28} fill={printMode ? '#000' : '#94a3b8'} />
                        </g>
                      ) : isBass ? (
                        <text
                          x={0}
                          y={-6}
                          fill={printMode ? '#000000' : '#cbd5e1'}
                          fontSize={32}
                          fontFamily="serif"
                          fontWeight="bold"
                        >
                          𝄢
                        </text>
                      ) : (
                        <text
                          x={-4}
                          y={6}
                          fill={printMode ? '#000000' : '#cbd5e1'}
                          fontSize={42}
                          fontFamily="serif"
                          fontWeight="bold"
                        >
                          𝄞
                        </text>
                      )}
                    </g>

                    {/* Time Signature */}
                    <g transform={`translate(${HEADER_WIDTH + 20}, ${staffY})`}>
                      <text
                        x={0}
                        y={18}
                        fill={printMode ? '#000000' : '#e2e8f0'}
                        fontSize={17}
                        fontFamily="JetBrains Mono"
                        fontWeight="800"
                      >
                        {score.timeSignature.beats}
                      </text>
                      <text
                        x={0}
                        y={36}
                        fill={printMode ? '#000000' : '#e2e8f0'}
                        fontSize={17}
                        fontFamily="JetBrains Mono"
                        fontWeight="800"
                      >
                        {score.timeSignature.beatType}
                      </text>
                    </g>

                    {/* Vertical Measure Barlines */}
                    {Array.from({ length: score.totalMeasures + 1 }).map((_, mIdx) => {
                      const barX = HEADER_WIDTH + (mIdx * MEASURE_WIDTH);
                      const isEnd = mIdx === score.totalMeasures;
                      return (
                        <g key={`bar-${track.id}-${mIdx}`}>
                          <line
                            x1={barX}
                            y1={staffY}
                            x2={barX}
                            y2={staffY + STAFF_HEIGHT}
                            stroke={printMode ? '#000000' : '#475569'}
                            strokeWidth={isEnd ? 3 : 1.5}
                          />
                        </g>
                      );
                    })}

                    {/* Standard Notes */}
                    {track.notes.map(note => {
                      const noteX = HEADER_WIDTH + (note.startTime * BEAT_WIDTH) + 40;
                      const isActive = activeNoteIds.has(note.id);
                      const isSelected = selectedNote?.note.id === note.id;

                      let stepIndex = 4;
                      if (isPercussion) {
                        const p = note.pitch.toLowerCase();
                        if (p.includes('kick')) stepIndex = 8;
                        else if (p.includes('snare')) stepIndex = 4;
                        else if (p.includes('hihat') || p.includes('crash')) stepIndex = 0;
                        else stepIndex = 6;
                      } else if (isBass) {
                        stepIndex = BASS_PITCH_Y_STEPS[note.pitch] ?? 4;
                      } else {
                        stepIndex = TREBLE_PITCH_Y_STEPS[note.pitch] ?? 4;
                      }

                      const noteY = staffY + (stepIndex * (STAFF_LINE_SPACING / 2));
                      const stemUp = stepIndex >= 4;
                      const isWhole = note.duration >= 4;
                      const isHalf = note.duration >= 2 && note.duration < 4;
                      const isEighth = note.duration <= 0.5;

                      const needsLedgerBottom = stepIndex >= 10;
                      const needsLedgerTop = stepIndex <= -2;

                      return (
                        <g
                          key={`std-${note.id}`}
                          className="cursor-pointer group"
                          onClick={(e) => handleNoteClick(track, note, e)}
                        >
                          {needsLedgerBottom && (
                            <line
                              x1={noteX - 10}
                              y1={staffY + STAFF_HEIGHT + STAFF_LINE_SPACING}
                              x2={noteX + 18}
                              y2={staffY + STAFF_HEIGHT + STAFF_LINE_SPACING}
                              stroke={printMode ? '#000' : '#64748b'}
                              strokeWidth={1.5}
                            />
                          )}
                          {needsLedgerTop && (
                            <line
                              x1={noteX - 10}
                              y1={staffY - STAFF_LINE_SPACING}
                              x2={noteX + 18}
                              y2={staffY - STAFF_LINE_SPACING}
                              stroke={printMode ? '#000' : '#64748b'}
                              strokeWidth={1.5}
                            />
                          )}

                          {(isActive || isSelected) && (
                            <ellipse
                              cx={noteX + 5}
                              cy={noteY}
                              rx={14}
                              ry={10}
                              fill={isActive ? 'rgba(56, 189, 248, 0.4)' : 'rgba(245, 158, 11, 0.4)'}
                              filter="url(#note-glow)"
                            />
                          )}

                          <g transform={`rotate(-22 ${noteX + 5} ${noteY})`}>
                            <ellipse
                              cx={noteX + 5}
                              cy={noteY}
                              rx={6.5}
                              ry={4.8}
                              fill={
                                isActive
                                  ? '#38bdf8'
                                  : isSelected
                                  ? '#f59e0b'
                                  : printMode
                                  ? '#000000'
                                  : isWhole || isHalf
                                  ? 'transparent'
                                  : familyMeta.color
                              }
                              stroke={
                                isActive
                                  ? '#38bdf8'
                                  : isSelected
                                  ? '#f59e0b'
                                  : printMode
                                  ? '#000000'
                                  : familyMeta.color
                              }
                              strokeWidth={isWhole || isHalf ? 2.5 : 1}
                            />
                          </g>

                          {note.alter === 1 && (
                            <text
                              x={noteX - 8}
                              y={noteY + 4}
                              fill={printMode ? '#000' : '#cbd5e1'}
                              fontSize={13}
                              fontWeight="bold"
                              fontFamily="serif"
                            >
                              ♯
                            </text>
                          )}

                          {!isWhole && (
                            <line
                              x1={stemUp ? noteX + 10.5 : noteX}
                              y1={noteY}
                              x2={stemUp ? noteX + 10.5 : noteX}
                              y2={stemUp ? noteY - 28 : noteY + 28}
                              stroke={isActive ? '#38bdf8' : isSelected ? '#f59e0b' : printMode ? '#000' : '#e2e8f0'}
                              strokeWidth={1.8}
                            />
                          )}

                          {isEighth && !isWhole && (
                            <path
                              d={
                                stemUp
                                  ? `M ${noteX + 10.5} ${noteY - 28} Q ${noteX + 18} ${noteY - 20} ${noteX + 15} ${noteY - 14}`
                                  : `M ${noteX} ${noteY + 28} Q ${noteX + 8} ${noteY + 20} ${noteX + 6} ${noteY + 14}`
                              }
                              fill="none"
                              stroke={printMode ? '#000000' : '#e2e8f0'}
                              strokeWidth={2}
                              strokeLinecap="round"
                            />
                          )}

                          {/* Syllable Lyric (below note) */}
                          {note.lyric && (
                            <text
                              x={noteX + 5}
                              y={staffY + STAFF_HEIGHT + 18}
                              textAnchor="middle"
                              fill={printMode ? '#000000' : '#f472b6'}
                              fontSize={11.5}
                              fontStyle="italic"
                              fontFamily="Plus Jakarta Sans"
                              fontWeight="700"
                            >
                              {note.lyric}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* 2. TABLATURA DE 6 CORDAS (TAB) */}
                {renderTab && (
                  <g>
                    {/* TAB Label Glyphs on the left */}
                    <g transform={`translate(${HEADER_WIDTH - 12}, ${tabY + 14})`}>
                      <text x={0} y={0} fill="#f59e0b" fontSize={14} fontWeight="900" fontFamily="sans-serif">T</text>
                      <text x={0} y={14} fill="#f59e0b" fontSize={14} fontWeight="900" fontFamily="sans-serif">A</text>
                      <text x={0} y={28} fill="#f59e0b" fontSize={14} fontWeight="900" fontFamily="sans-serif">B</text>
                    </g>

                    {/* 6 Tablature String Lines */}
                    {Array.from({ length: 6 }).map((_, sIdx) => {
                      const lineY = tabY + (sIdx * TAB_LINE_SPACING);
                      const stringNames = ['e', 'B', 'G', 'D', 'A', 'E'];
                      return (
                        <g key={`tab-str-${track.id}-${sIdx}`}>
                          <text
                            x={HEADER_WIDTH - 24}
                            y={lineY + 3}
                            fill="#64748b"
                            fontSize={9}
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {stringNames[sIdx]}
                          </text>
                          <line
                            x1={HEADER_WIDTH - 15}
                            y1={lineY}
                            x2={HEADER_WIDTH + (score.totalMeasures * MEASURE_WIDTH)}
                            y2={lineY}
                            stroke={printMode ? '#333333' : '#334155'}
                            strokeWidth={1}
                          />
                        </g>
                      );
                    })}

                    {/* TAB Measure Barlines */}
                    {Array.from({ length: score.totalMeasures + 1 }).map((_, mIdx) => {
                      const barX = HEADER_WIDTH + (mIdx * MEASURE_WIDTH);
                      const isEnd = mIdx === score.totalMeasures;
                      return (
                        <line
                          key={`tab-bar-${track.id}-${mIdx}`}
                          x1={barX}
                          y1={tabY}
                          x2={barX}
                          y2={tabY + TAB_HEIGHT}
                          stroke={printMode ? '#000000' : '#475569'}
                          strokeWidth={isEnd ? 3 : 1.2}
                        />
                      );
                    })}

                    {/* TAB Fret Numbers */}
                    {track.notes.map(note => {
                      const noteX = HEADER_WIDTH + (note.startTime * BEAT_WIDTH) + 40;
                      const tabInfo = getGuitarTabForNote(note);
                      const stringIndex = Math.max(1, Math.min(6, tabInfo.string)) - 1;
                      const fretY = tabY + (stringIndex * TAB_LINE_SPACING);
                      const isActive = activeNoteIds.has(note.id);
                      const isSelected = selectedNote?.note.id === note.id;

                      return (
                        <g
                          key={`tab-note-${note.id}`}
                          className="cursor-pointer group"
                          onClick={(e) => handleNoteClick(track, note, e)}
                        >
                          {/* Fret background cover rectangle */}
                          <rect
                            x={noteX - 4}
                            y={fretY - 6}
                            width={16}
                            height={12}
                            rx={3}
                            fill={
                              isActive
                                ? '#38bdf8'
                                : isSelected
                                ? '#f59e0b'
                                : printMode
                                ? '#ffffff'
                                : '#0c0e14'
                            }
                            stroke={
                              isActive
                                ? '#38bdf8'
                                : isSelected
                                ? '#f59e0b'
                                : printMode
                                ? '#000'
                                : '#475569'
                            }
                            strokeWidth={0.8}
                          />
                          {/* Fret Number Text */}
                          <text
                            x={noteX + 4}
                            y={fretY + 3.5}
                            textAnchor="middle"
                            fill={
                              isActive || isSelected
                                ? '#090b10'
                                : printMode
                                ? '#000000'
                                : '#f8fafc'
                            }
                            fontSize={10.5}
                            fontWeight="900"
                            fontFamily="JetBrains Mono, monospace"
                          >
                            {tabInfo.fret}
                          </text>

                          {/* Chord symbol directly above first note of chord */}
                          {note.chordSymbol && (
                            <text
                              x={noteX + 4}
                              y={tabY - 8}
                              textAnchor="middle"
                              fill="#fbbf24"
                              fontSize={11}
                              fontWeight="800"
                              fontFamily="Plus Jakarta Sans"
                            >
                              {note.chordSymbol}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                )}
              </g>
            );
          })}

          {/* Synchronized Playhead Line */}
          {!printMode && (
            <g>
              <line
                x1={playheadX}
                y1={20}
                x2={playheadX}
                y2={TOTAL_SCORE_HEIGHT - 10}
                stroke="#38bdf8"
                strokeWidth={2.5}
                strokeDasharray="4 2"
                className="transition-all duration-75"
              />
              <polygon
                points={`${playheadX - 6},15 ${playheadX + 6},15 ${playheadX},24`}
                fill="#38bdf8"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Footer Instructions */}
      <div className={`px-4 py-2 bg-[#101420] border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 ${printMode ? 'no-print' : ''}`}>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            Tablatura de 6 Cordas sincronizada em tempo real com cifras e partitura.
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
            Clique em qualquer traste ou compasso para ouvir e transpor.
          </span>
        </div>
        <div>
          Compasso Atual: <span className="font-mono text-white font-bold">{Math.floor(currentBeat / score.timeSignature.beats) + 1}</span> / {score.totalMeasures}
        </div>
      </div>
    </div>
  );
};
