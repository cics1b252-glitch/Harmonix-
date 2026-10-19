import { Score, Note, Track, InstrumentFamily } from '../types/music';

// General MIDI Program Numbers for Instrument Families
const GM_PROGRAMS: Record<InstrumentFamily, number> = {
  strings: 48,    // String Ensemble 1 (Cordas)
  keys: 0,        // Acoustic Grand Piano (Teclas)
  percussion: 0,  // Standard Kit on Channel 10
  woodwinds: 73,  // Flute (Sopros)
  brass: 56,      // Trumpet (Metais)
  choir: 52,      // Choir Aahs (Coral)
};

// ==========================================
// 1. STANDARD MIDI FILE GENERATOR (.mid)
// ==========================================
export function generateMidiBlob(score: Score): Blob {
  const ticksPerBeat = 480;
  const tracksBytes: Uint8Array[] = [];

  // Track 0: Tempo and Time Signature
  const tempoTrackEvents: number[] = [];
  // Delta time 0
  tempoTrackEvents.push(0x00);
  // Time Signature: FF 58 04 nn dd cc bb (e.g. 4/4)
  const numBeats = score.timeSignature.beats;
  const denomPower = Math.round(Math.log2(score.timeSignature.beatType));
  tempoTrackEvents.push(0xff, 0x58, 0x04, numBeats, denomPower, 24, 8);

  // Set Tempo: FF 51 03 tt tt tt (microseconds per quarter note)
  const microsecondsPerBeat = Math.round(60000000 / score.bpm);
  tempoTrackEvents.push(0x00); // delta time
  tempoTrackEvents.push(
    0xff, 0x51, 0x03,
    (microsecondsPerBeat >> 16) & 0xff,
    (microsecondsPerBeat >> 8) & 0xff,
    microsecondsPerBeat & 0xff
  );

  // End of track: FF 2F 00
  tempoTrackEvents.push(0x00, 0xff, 0x2f, 0x00);
  tracksBytes.push(createTrackChunk(new Uint8Array(tempoTrackEvents)));

  // Tracks 1..N: Instrument tracks
  score.tracks.forEach((track, trackIndex) => {
    const isPercussion = track.family === 'percussion';
    const channel = isPercussion ? 9 : (trackIndex % 9); // Channel 10 (0-indexed 9) is standard MIDI percussion

    const events: { tick: number; type: 'on' | 'off' | 'meta'; data: number[] }[] = [];

    // Track Name Meta Event
    const nameBytes = new TextEncoder().encode(`${track.name} (${track.subInstrument})`);
    events.push({
      tick: 0,
      type: 'meta',
      data: [0xff, 0x03, nameBytes.length, ...Array.from(nameBytes)]
    });

    // Program Change (Instrument)
    if (!isPercussion) {
      const prog = GM_PROGRAMS[track.family] ?? 0;
      events.push({
        tick: 0,
        type: 'meta',
        data: [0xc0 | channel, prog]
      });
    }

    // Convert notes to NoteOn and NoteOff events
    track.notes.forEach(note => {
      if (note.isRest) return;
      const startTick = Math.round(note.startTime * ticksPerBeat);
      const durationTicks = Math.max(20, Math.round(note.duration * ticksPerBeat));
      const endTick = startTick + durationTicks;
      const midiPitch = Math.min(127, Math.max(0, note.midiNote || 60));
      const vel = Math.min(127, Math.max(1, note.velocity || 90));

      // Note On: 9x pitch vel
      events.push({
        tick: startTick,
        type: 'on',
        data: [0x90 | channel, midiPitch, vel]
      });

      // Note Off: 8x pitch 0
      events.push({
        tick: endTick,
        type: 'off',
        data: [0x80 | channel, midiPitch, 0]
      });
    });

    // Sort events by tick (stable sort so NoteOff comes before NoteOn if simultaneous)
    events.sort((a, b) => {
      if (a.tick !== b.tick) return a.tick - b.tick;
      if (a.type === 'off') return -1;
      if (b.type === 'off') return 1;
      return 0;
    });

    // Convert to delta-time events
    const trackBytes: number[] = [];
    let lastTick = 0;

    events.forEach(event => {
      const delta = event.tick - lastTick;
      lastTick = event.tick;
      writeVarLen(trackBytes, delta);
      trackBytes.push(...event.data);
    });

    // End of track: FF 2F 00
    writeVarLen(trackBytes, 0);
    trackBytes.push(0xff, 0x2f, 0x00);

    tracksBytes.push(createTrackChunk(new Uint8Array(trackBytes)));
  });

  // Assemble full MIDI file
  // Header chunk: "MThd" + len(6) + format(1) + numTracks + ticksPerBeat
  const numTracks = tracksBytes.length;
  const header = new Uint8Array(14);
  const view = new DataView(header.buffer);
  header.set([0x4d, 0x54, 0x68, 0x64], 0); // "MThd"
  view.setUint32(4, 6, false); // Length = 6
  view.setUint16(8, 1, false); // Format = 1 (multitrack synchronous)
  view.setUint16(10, numTracks, false);
  view.setUint16(12, ticksPerBeat, false);

  const totalLength = 14 + tracksBytes.reduce((sum, chunk) => sum + chunk.length, 0);
  const fullMidi = new Uint8Array(totalLength);
  fullMidi.set(header, 0);

  let offset = 14;
  tracksBytes.forEach(chunk => {
    fullMidi.set(chunk, offset);
    offset += chunk.length;
  });

  return new Blob([fullMidi], { type: 'audio/midi' });
}

function createTrackChunk(trackData: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(8 + trackData.length);
  chunk.set([0x4d, 0x54, 0x72, 0x6b], 0); // "MTrk"
  const view = new DataView(chunk.buffer);
  view.setUint32(4, trackData.length, false);
  chunk.set(trackData, 8);
  return chunk;
}

function writeVarLen(bytes: number[], value: number) {
  let buffer = value & 0x7f;
  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= 0x80;
    buffer += (value & 0x7f);
  }
  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) buffer >>= 8;
    else break;
  }
}

// ==========================================
// 2. STANDARD MUSICXML GENERATOR (.musicxml)
// ==========================================
export function generateMusicXml(score: Score): string {
  const beats = score.timeSignature.beats;
  const beatType = score.timeSignature.beatType;
  const divisions = 4; // 4 divisions per quarter beat (allows 16th notes cleanly)

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work>
    <work-title>${escapeXml(score.title)}</work-title>
  </work>
  <identification>
    <creator type="composer">${escapeXml(score.composer)}</creator>
    <encoding>
      <software>Harmonix Studio Audio-Score Engine</software>
      <encoding-date>${new Date().toISOString().split('T')[0]}</encoding-date>
    </encoding>
  </identification>
  <part-list>
`;

  score.tracks.forEach((track, idx) => {
    xml += `    <score-part id="P${idx + 1}">
      <part-name>${escapeXml(track.name)}</part-name>
      <part-abbreviation>${escapeXml(track.subInstrument)}</part-abbreviation>
      <score-instrument id="P${idx + 1}-I1">
        <instrument-name>${escapeXml(track.name)}</instrument-name>
      </score-instrument>
    </score-part>\n`;
  });

  xml += `  </part-list>\n`;

  // Render Parts
  score.tracks.forEach((track, idx) => {
    xml += `  <part id="P${idx + 1}">\n`;

    // Group notes by measure (4 beats per measure if 4/4)
    for (let m = 0; m < score.totalMeasures; m++) {
      const measureNum = m + 1;
      const measureStartBeat = m * beats;
      const measureEndBeat = (m + 1) * beats;

      xml += `    <measure number="${measureNum}">\n`;

      // In Measure 1, add attributes
      if (measureNum === 1) {
        xml += `      <attributes>
        <divisions>${divisions}</divisions>
        <key>
          <fifths>1</fifths>
        </key>
        <time>
          <beats>${beats}</beats>
          <beat-type>${beatType}</beat-type>
        </time>
        <clef>
          <sign>${track.clef === 'bass' ? 'F' : track.clef === 'percussion' ? 'percussion' : 'G'}</sign>
          <line>${track.clef === 'bass' ? '4' : '2'}</line>
        </clef>
      </attributes>
      <direction placement="above">
        <direction-type>
          <metronome>
            <beat-unit>quarter</beat-unit>
            <per-minute>${score.bpm}</per-minute>
          </metronome>
        </direction-type>
        <sound tempo="${score.bpm}"/>
      </direction>\n`;
      }

      // Find notes in this measure
      const measureNotes = track.notes.filter(
        n => n.startTime >= measureStartBeat && n.startTime < measureEndBeat
      );

      if (measureNotes.length === 0) {
        // Whole rest for this measure
        xml += `      <note>
        <rest measure="yes"/>
        <duration>${beats * divisions}</duration>
      </note>\n`;
      } else {
        measureNotes.forEach(note => {
          const durationVal = Math.max(1, Math.round(note.duration * divisions));
          const noteType = getNoteTypeName(note.duration);

          xml += `      <note>\n`;
          if (note.isRest) {
            xml += `        <rest/>\n`;
          } else if (track.family === 'percussion') {
            xml += `        <unpitched>
          <display-step>E</display-step>
          <display-octave>4</display-octave>
        </unpitched>\n`;
          } else {
            xml += `        <pitch>
          <step>${note.step || 'C'}</step>
          ${note.alter !== 0 ? `<alter>${note.alter}</alter>` : ''}
          <octave>${note.octave || 4}</octave>
        </pitch>\n`;
          }

          xml += `        <duration>${durationVal}</duration>\n`;
          xml += `        <type>${noteType}</type>\n`;

          if (note.lyric) {
            xml += `        <lyric>
          <syllabic>single</syllabic>
          <text>${escapeXml(note.lyric)}</text>
        </lyric>\n`;
          }

          xml += `      </note>\n`;
        });
      }

      xml += `    </measure>\n`;
    }

    xml += `  </part>\n`;
  });

  xml += `</score-partwise>`;
  return xml;
}

function getNoteTypeName(durationBeats: number): string {
  if (durationBeats >= 4) return 'whole';
  if (durationBeats >= 2) return 'half';
  if (durationBeats >= 1) return 'quarter';
  if (durationBeats >= 0.5) return 'eighth';
  return '16th';
}

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
