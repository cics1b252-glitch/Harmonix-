import React, { useState } from 'react';
import { Score, Track, INSTRUMENT_FAMILIES, InstrumentFamily } from '../../types/music';
import { globalAudioEngine } from '../../audio/AudioEngine';
import { generateMidiBlob, generateMusicXml } from '../../utils/musicExporters';
import {
  Download, FileAudio, FileMusic, Printer, CheckCircle2,
  Layers, Sparkles, RefreshCw, Disc, Share2
} from 'lucide-react';

interface ExportStudioSectionProps {
  score: Score;
  onExportMasterWav: () => void;
  onExportStemWav: (track: Track) => void;
}

export const ExportStudioSection: React.FC<ExportStudioSectionProps> = ({
  score,
  onExportMasterWav,
  onExportStemWav,
}) => {
  const [isExportingMaster, setIsExportingMaster] = useState(false);
  const [exportingStemId, setExportingStemId] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Trigger Master WAV export
  const handleExportMaster = async () => {
    setIsExportingMaster(true);
    setExportNotice('Renderizando áudio estúdio em 44.1 kHz com samples reais de instrumentos...');
    try {
      const buffer = await globalAudioEngine.renderScoreToAudioBuffer(score);
      const wavBlob = globalAudioEngine.audioBufferToWav(buffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${score.title.toLowerCase().replace(/\s+/g, '_')}_master_44khz.wav`;
      a.click();
      URL.revokeObjectURL(url);
      setExportNotice('Áudio Master .WAV exportado com sucesso em alta fidelidade!');
    } catch (err) {
      console.error(err);
      setExportNotice('Erro ao renderizar áudio master.');
    } finally {
      setIsExportingMaster(false);
    }
  };

  // Trigger Single Stem export
  const handleExportStem = async (track: Track) => {
    setExportingStemId(track.id);
    setExportNotice(`Renderizando stem isolado: ${track.name}...`);
    try {
      const buffer = await globalAudioEngine.renderScoreToAudioBuffer(score, track.id);
      const wavBlob = globalAudioEngine.audioBufferToWav(buffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${score.title.toLowerCase().replace(/\s+/g, '_')}_stem_${track.family}.wav`;
      a.click();
      URL.revokeObjectURL(url);
      setExportNotice(`Stem de ${track.name} exportado com sucesso!`);
    } catch (err) {
      console.error(err);
      setExportNotice('Erro ao exportar stem.');
    } finally {
      setExportingStemId(null);
    }
  };

  // Export All Stems in sequence
  const handleExportAllStems = async () => {
    setExportNotice('Renderizando todos os stems isoladamente...');
    for (const track of score.tracks) {
      setExportingStemId(track.id);
      const buffer = await globalAudioEngine.renderScoreToAudioBuffer(score, track.id);
      const wavBlob = globalAudioEngine.audioBufferToWav(buffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${score.title.toLowerCase().replace(/\s+/g, '_')}_stem_${track.family}.wav`;
      a.click();
      URL.revokeObjectURL(url);
      await new Promise(r => setTimeout(r, 400));
    }
    setExportingStemId(null);
    setExportNotice('Todos os stems foram exportados com sucesso!');
  };

  // Export MIDI file
  const handleExportMidi = () => {
    try {
      const midiBlob = generateMidiBlob(score);
      const url = URL.createObjectURL(midiBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${score.title.toLowerCase().replace(/\s+/g, '_')}_multitrack.mid`;
      a.click();
      URL.revokeObjectURL(url);
      setExportNotice('Arquivo MIDI multi-pistas baixado com sucesso!');
    } catch (err) {
      console.error(err);
      setExportNotice('Erro ao gerar arquivo MIDI.');
    }
  };

  // Export MusicXML file
  const handleExportMusicXml = () => {
    try {
      const xmlString = generateMusicXml(score);
      const blob = new Blob([xmlString], { type: 'application/vnd.recordare.musicxml+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${score.title.toLowerCase().replace(/\s+/g, '_')}.musicxml`;
      a.click();
      URL.revokeObjectURL(url);
      setExportNotice('Partitura MusicXML exportada com sucesso para MuseScore / Sibelius!');
    } catch (err) {
      console.error(err);
      setExportNotice('Erro ao gerar MusicXML.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-[#0f121d] rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
            <Download className="w-3.5 h-3.5" />
            Central de Exportação de Alta Fidelidade
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Exportar Áudio Master, Stems e Partituras
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gere arquivos de áudio sem perdas (WAV 44.1kHz) da mixagem completa ou de cada instrumento isolado, além de MIDI e MusicXML.
          </p>
        </div>

        {exportNotice && (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}
      </div>

      {/* Main Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Master Audio WAV */}
        <div className="bg-[#141824] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <FileAudio className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Áudio Completo (.WAV)</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold mt-1 inline-block">
              44.1 kHz • 16-bit PCM
            </span>
            <p className="text-xs text-slate-400 mt-2">
              Mixagem orquestral com samples reais de instrumentos acústicos (FluidR3 GM Open-Source), reverberação de concerto e compressão dinâmica.
            </p>
          </div>

          <button
            onClick={handleExportMaster}
            disabled={isExportingMaster}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
          >
            {isExportingMaster ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Renderizando...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Baixar WAV Master</span>
              </>
            )}
          </button>
        </div>

        {/* Card 2: MIDI File */}
        <div className="bg-[#141824] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Disc className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Arquivo MIDI Multi-Pista (.MID)</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold mt-1 inline-block">
              Formato 1 Standard
            </span>
            <p className="text-xs text-slate-400 mt-2">
              Importe em qualquer DAW (Logic, Ableton, FL Studio, Reaper) com faixas separadas por instrumento e canal de percussão 10.
            </p>
          </div>

          <button
            onClick={handleExportMidi}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Arquivo MIDI</span>
          </button>
        </div>

        {/* Card 3: MusicXML */}
        <div className="bg-[#141824] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div>
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
              <FileMusic className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Partitura MusicXML (.xml)</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold mt-1 inline-block">
              MusicXML 4.0 Partwise
            </span>
            <p className="text-xs text-slate-400 mt-2">
              Compatível com MuseScore, Sibelius, Finale e Dorico com todas as pautas, claves, compassos e notas.
            </p>
          </div>

          <button
            onClick={handleExportMusicXml}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar MusicXML</span>
          </button>
        </div>

        {/* Card 4: Imprimir / PDF */}
        <div className="bg-[#141824] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Impressão & PDF Vetorial</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold mt-1 inline-block">
              Gravura Musical Nítida
            </span>
            <p className="text-xs text-slate-400 mt-2">
              Diagramação para papel A4 / Carta com pautas em preto e branco e título para músicos e regentes.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Individual Stems Section */}
      <div className="bg-[#0f121d] rounded-2xl border border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              Stems de Áudio Individuais (WAV Separado por Família)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Baixe as faixas de áudio isoladas para carregar na sua DAW ou usar como playback instrumental.
            </p>
          </div>

          <button
            onClick={handleExportAllStems}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border border-slate-700 shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-violet-400" />
            <span>Baixar Todos os 6 Stems Separados</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {score.tracks.map(track => {
            const meta = INSTRUMENT_FAMILIES[track.family];
            const isProcessingThis = exportingStemId === track.id;

            return (
              <div
                key={track.id}
                className="bg-[#141824] p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                    <span className="text-xs font-bold text-white truncate">{meta.namePt}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mb-1">
                    {track.subInstrument}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {track.notes.length} notas
                  </span>
                </div>

                <button
                  onClick={() => handleExportStem(track)}
                  disabled={isProcessingThis}
                  className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  {isProcessingThis ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-violet-400" />
                  ) : (
                    <Download className="w-3 h-3 text-slate-400" />
                  )}
                  <span>Stem .WAV</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
