import React from 'react';

interface ChordDiagramProps {
  chord: string;
  diagram?: string; // e.g. "x02220", "4x245x", "244222", "2x0232"
  fret?: number;
}

// Preset chord shapes for common chords (string 6 to 1: E A D G B e)
const PRESET_CHORDS: Record<string, string> = {
  'A': 'x02220',
  'E/G#': '4x245x',
  'F#m': '244222',
  'A/E': '002220',
  'D/F#': '2x0232',
  'E7sus4': '020230',
  'E7': '020100',
  'E': '022100',
  'C#/E#': '143121',
  'A7/E': '002020',
  'F#7': '242322',
  'Bm7': 'x24232',
  'D/E': '0x0232',
  'C': 'x32010',
  'G/B': 'x20033',
  'Am': 'x02210',
  'G': '320003',
  'Em': '022000',
  'D': 'xx0232',
  'Dm': 'xx0231',
  'F': '133211',
  'B7': 'x21202',
};

export const ChordDiagram: React.FC<ChordDiagramProps> = ({ chord, diagram, fret = 1 }) => {
  const shape = diagram || PRESET_CHORDS[chord] || 'x02220';
  const width = 64;
  const height = 78;
  const startX = 14;
  const startY = 22;
  const stringSpacing = 7;
  const fretSpacing = 9;

  // shape is 6 chars (string 6 to string 1)
  const stringPositions = shape.split('');

  return (
    <div className="flex flex-col items-center bg-[#131722] p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-all">
      <span className="text-[11px] font-extrabold text-amber-300 font-mono tracking-tight mb-0.5">
        {chord}
      </span>
      <svg width={width} height={height} className="overflow-visible">
        {/* Nut (thick top line if fret is 1) */}
        <line
          x1={startX}
          y1={startY}
          x2={startX + 5 * stringSpacing}
          y2={startY}
          stroke={fret === 1 ? '#e2e8f0' : '#64748b'}
          strokeWidth={fret === 1 ? 3 : 1.5}
        />

        {/* 4 Fret Lines */}
        {Array.from({ length: 4 }).map((_, fIdx) => (
          <line
            key={`fret-${fIdx}`}
            x1={startX}
            y1={startY + (fIdx + 1) * fretSpacing}
            x2={startX + 5 * stringSpacing}
            y2={startY + (fIdx + 1) * fretSpacing}
            stroke="#334155"
            strokeWidth={1}
          />
        ))}

        {/* 6 String Lines */}
        {Array.from({ length: 6 }).map((_, sIdx) => (
          <line
            key={`str-${sIdx}`}
            x1={startX + sIdx * stringSpacing}
            y1={startY}
            x2={startX + sIdx * stringSpacing}
            y2={startY + 4 * fretSpacing}
            stroke="#475569"
            strokeWidth={1}
          />
        ))}

        {/* Finger Dots and X / O marks */}
        {stringPositions.map((char, sIdx) => {
          const x = startX + sIdx * stringSpacing;
          if (char === 'x' || char === 'X') {
            return (
              <text
                key={`mark-${sIdx}`}
                x={x}
                y={startY - 4}
                textAnchor="middle"
                fontSize={9}
                fill="#ef4444"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                ✕
              </text>
            );
          }
          if (char === '0') {
            return (
              <circle
                key={`mark-${sIdx}`}
                cx={x}
                cy={startY - 6}
                r={2.5}
                fill="none"
                stroke="#38bdf8"
                strokeWidth={1.2}
              />
            );
          }
          const fretNum = parseInt(char, 10);
          if (!isNaN(fretNum) && fretNum > 0 && fretNum <= 5) {
            const y = startY + (fretNum - 0.5) * fretSpacing;
            return (
              <circle
                key={`dot-${sIdx}`}
                cx={x}
                cy={y}
                r={3}
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth={0.5}
              />
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
};
