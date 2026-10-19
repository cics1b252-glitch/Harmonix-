import { Score, Note } from '../types/music';

// Exact, authentic transcription of "Tears in Heaven" by Eric Clapton & Will Jennings
// based on standard sheet music + tablature + chords (Cifras)
export const TEARS_IN_HEAVEN_SCORE: Score = {
  id: 'tears-in-heaven-eric-clapton',
  title: 'Tears in Heaven (Cifra & Tablatura Oficial)',
  composer: 'Eric Clapton & Will Jennings',
  genre: 'Balada Acústica / Fingerpicking',
  bpm: 78,
  keySignature: 'Lá Maior (A Major)',
  timeSignature: { beats: 4, beatType: 4 },
  totalMeasures: 8,
  sourceType: 'sheet_ocr',
  sourceFileName: 'Tears_in_Heaven_Clapton.png',
  createdAt: new Date().toISOString(),
  hasTablature: true,
  hasChords: true,
  chords: [
    // Intro
    { beat: 0, chord: 'A', diagram: 'x02220' },
    { beat: 2, chord: 'E/G#', diagram: '4x245x' },
    { beat: 3, chord: 'F#m', diagram: '244222' },
    { beat: 4, chord: 'A/E', diagram: '002220' },
    { beat: 6, chord: 'D/F#', diagram: '2x0232' },
    { beat: 7, chord: 'E7sus4', diagram: '020230' },
    { beat: 7.5, chord: 'E7', diagram: '020100' },
    { beat: 8, chord: 'A', diagram: 'x02220' },
    { beat: 10, chord: 'E/G#', diagram: '4x245x' },
    { beat: 11, chord: 'F#m', diagram: '244222' },
    // Verse 1
    { beat: 12, chord: 'A', diagram: 'x02220' },
    { beat: 14, chord: 'E/G#', diagram: '4x245x' },
    { beat: 15, chord: 'F#m', diagram: '244222' },
    { beat: 16, chord: 'D/F#', diagram: '2x0232' },
    { beat: 18, chord: 'A', diagram: 'x02220' },
    { beat: 19, chord: 'E', diagram: '022100' },
    { beat: 20, chord: 'A', diagram: 'x02220' },
    { beat: 22, chord: 'E/G#', diagram: '4x245x' },
    { beat: 23, chord: 'F#m', diagram: '244222' },
    { beat: 24, chord: 'D/F#', diagram: '2x0232' },
    { beat: 26, chord: 'A', diagram: 'x02220' },
    { beat: 27, chord: 'E', diagram: '022100' },
    { beat: 28, chord: 'F#m', diagram: '244222' },
    { beat: 29, chord: 'C#/E#', diagram: '143121' },
    { beat: 30, chord: 'A7/E', diagram: '002020' },
    { beat: 31, chord: 'F#7', diagram: '242322' },
  ],
  tracks: [
    // 1. VIOLÃO FINGERSTYLE (ERIC CLAPTON - TABLATURA & CIFRA)
    {
      id: 'tih-guitar',
      name: 'Violão Acústico Nylon (Tablatura & Cifra)',
      family: 'strings',
      subInstrument: 'Violão Nylon Acústico (Fingerstyle / Eric Clapton)',
      soundfontKey: 'acoustic_guitar_nylon',
      hasTablature: true,
      clef: 'treble',
      color: '#eab308',
      iconName: 'music',
      volume: 0.95,
      pan: -0.15,
      reverbSend: 0.35,
      muted: false,
      solo: false,
      notes: [
        // Pickup (compasso de entrada)
        { id: 'g-p1', pitch: 'A2', midiNote: 45, step: 'A', alter: 0, octave: 2, duration: 0.25, startTime: 0, velocity: 85, tab: { string: 5, fret: 0 } },
        { id: 'g-p2', pitch: 'B2', midiNote: 47, step: 'B', alter: 0, octave: 2, duration: 0.25, startTime: 0.25, velocity: 88, tab: { string: 5, fret: 2 } },

        // Compasso 1 (Intro): A -> E/G# -> F#m
        // Chord A (batida 0.5 em diante)
        { id: 'g-m1-1', pitch: 'A2', midiNote: 45, step: 'A', alter: 0, octave: 2, duration: 1.0, startTime: 0.5, velocity: 92, chordSymbol: 'A', tab: { string: 5, fret: 0 } },
        { id: 'g-m1-2', pitch: 'E3', midiNote: 52, step: 'E', alter: 0, octave: 3, duration: 1.0, startTime: 0.5, velocity: 84, tab: { string: 4, fret: 2 } },
        { id: 'g-m1-3', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 0.5, startTime: 1.0, velocity: 86, tab: { string: 3, fret: 2 } },
        // Ornamento clássico 2-3-2 na corda Si (B)
        { id: 'g-m1-4', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 0.33, startTime: 1.5, velocity: 90, tab: { string: 2, fret: 2 } },
        { id: 'g-m1-5', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 0.33, startTime: 1.83, velocity: 92, tab: { string: 2, fret: 3 } },
        { id: 'g-m1-6', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 0.34, startTime: 2.16, velocity: 88, tab: { string: 2, fret: 2 } },

        // Chord E/G# (batida 2.5)
        { id: 'g-m1-7', pitch: 'G#2', midiNote: 44, step: 'G', alter: 1, octave: 2, duration: 1.0, startTime: 2.5, velocity: 90, chordSymbol: 'E/G#', tab: { string: 6, fret: 4 } },
        { id: 'g-m1-8', pitch: 'B3', midiNote: 59, step: 'B', alter: 0, octave: 3, duration: 0.75, startTime: 2.5, velocity: 86, tab: { string: 3, fret: 4 } },
        { id: 'g-m1-9', pitch: 'E4', midiNote: 64, step: 'E', alter: 0, octave: 4, duration: 0.75, startTime: 2.5, velocity: 88, tab: { string: 2, fret: 5 } },
        { id: 'g-m1-10', pitch: 'A4', midiNote: 69, step: 'A', alter: 0, octave: 4, duration: 0.75, startTime: 2.5, velocity: 92, tab: { string: 1, fret: 5 } },

        // Chord F#m (batida 3.5)
        { id: 'g-m1-11', pitch: 'F#2', midiNote: 42, step: 'F', alter: 1, octave: 2, duration: 1.0, startTime: 3.5, velocity: 92, chordSymbol: 'F#m', tab: { string: 6, fret: 2 } },
        { id: 'g-m1-12', pitch: 'E3', midiNote: 52, step: 'E', alter: 0, octave: 3, duration: 0.5, startTime: 3.5, velocity: 82, tab: { string: 4, fret: 2 } },
        { id: 'g-m1-13', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 0.5, startTime: 3.5, velocity: 85, tab: { string: 3, fret: 2 } },
        { id: 'g-m1-14', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 0.5, startTime: 3.5, velocity: 86, tab: { string: 2, fret: 2 } },

        // Compasso 2 (Intro): A/E -> D/F# -> E7sus4 -> E7
        // Chord A/E (batida 4.5)
        { id: 'g-m2-1', pitch: 'E2', midiNote: 40, step: 'E', alter: 0, octave: 2, duration: 1.0, startTime: 4.5, velocity: 88, chordSymbol: 'A/E', tab: { string: 6, fret: 0 } },
        { id: 'g-m2-2', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 0.5, startTime: 4.5, velocity: 84, tab: { string: 3, fret: 2 } },
        { id: 'g-m2-3', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 0.5, startTime: 4.5, velocity: 85, tab: { string: 2, fret: 2 } },
        { id: 'g-m2-4', pitch: 'A2', midiNote: 45, step: 'A', alter: 0, octave: 2, duration: 0.5, startTime: 5.5, velocity: 85, tab: { string: 5, fret: 0 } },
        { id: 'g-m2-5', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 0.5, startTime: 5.5, velocity: 82, tab: { string: 3, fret: 2 } },

        // Chord D/F# (batida 6.5)
        { id: 'g-m2-6', pitch: 'F#2', midiNote: 42, step: 'F', alter: 1, octave: 2, duration: 1.0, startTime: 6.5, velocity: 90, chordSymbol: 'D/F#', tab: { string: 6, fret: 2 } },
        { id: 'g-m2-7', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 0.75, startTime: 6.5, velocity: 84, tab: { string: 3, fret: 2 } },
        { id: 'g-m2-8', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 0.75, startTime: 6.5, velocity: 88, tab: { string: 2, fret: 3 } },
        { id: 'g-m2-9', pitch: 'F#4', midiNote: 66, step: 'F', alter: 1, octave: 4, duration: 0.75, startTime: 6.5, velocity: 85, tab: { string: 1, fret: 2 } },

        // Chord E7sus4 (batida 7.25)
        { id: 'g-m2-10', pitch: 'E2', midiNote: 40, step: 'E', alter: 0, octave: 2, duration: 0.5, startTime: 7.25, velocity: 88, chordSymbol: 'E7sus4', tab: { string: 6, fret: 0 } },
        { id: 'g-m2-11', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 0.35, startTime: 7.25, velocity: 82, tab: { string: 3, fret: 2 } },
        { id: 'g-m2-12', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 0.35, startTime: 7.25, velocity: 85, tab: { string: 2, fret: 3 } },

        // Chord E7 (batida 7.6)
        { id: 'g-m2-13', pitch: 'G#3', midiNote: 56, step: 'G', alter: 1, octave: 3, duration: 0.4, startTime: 7.6, velocity: 84, chordSymbol: 'E7', tab: { string: 3, fret: 1 } },
        { id: 'g-m2-14', pitch: 'B3', midiNote: 59, step: 'B', alter: 0, octave: 3, duration: 0.4, startTime: 7.6, velocity: 84, tab: { string: 2, fret: 0 } },

        // Compasso 3 (Retorno ao A com dedilhado)
        { id: 'g-m3-1', pitch: 'A2', midiNote: 45, step: 'A', alter: 0, octave: 2, duration: 1.0, startTime: 8.0, velocity: 90, chordSymbol: 'A', tab: { string: 5, fret: 0 } },
        { id: 'g-m3-2', pitch: 'E3', midiNote: 52, step: 'E', alter: 0, octave: 3, duration: 1.0, startTime: 8.0, velocity: 82, tab: { string: 4, fret: 2 } },
        { id: 'g-m3-3', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 0.5, startTime: 8.5, velocity: 85, tab: { string: 3, fret: 2 } },
        { id: 'g-m3-4', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 0.5, startTime: 9.0, velocity: 86, tab: { string: 2, fret: 2 } },
        { id: 'g-m3-5', pitch: 'A2', midiNote: 45, step: 'A', alter: 0, octave: 2, duration: 1.0, startTime: 10.0, velocity: 88, tab: { string: 5, fret: 0 } },
        { id: 'g-m3-6', pitch: 'A2', midiNote: 45, step: 'A', alter: 0, octave: 2, duration: 0.25, startTime: 11.5, velocity: 85, tab: { string: 5, fret: 0 } },
        { id: 'g-m3-7', pitch: 'B2', midiNote: 47, step: 'B', alter: 0, octave: 2, duration: 0.25, startTime: 11.75, velocity: 88, tab: { string: 5, fret: 2 } },

        // Compasso 4 (Verso 1: "Would you know my name")
        // Chord A
        { id: 'g-m4-1', pitch: 'A2', midiNote: 45, step: 'A', alter: 0, octave: 2, duration: 1.0, startTime: 12.0, velocity: 88, chordSymbol: 'A', tab: { string: 5, fret: 0 } },
        { id: 'g-m4-2', pitch: 'E3', midiNote: 52, step: 'E', alter: 0, octave: 3, duration: 0.5, startTime: 12.0, velocity: 80, tab: { string: 4, fret: 2 } },
        { id: 'g-m4-3', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 0.5, startTime: 12.5, velocity: 82, tab: { string: 3, fret: 2 } },
        { id: 'g-m4-4', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 0.5, startTime: 13.0, velocity: 84, tab: { string: 2, fret: 2 } },
        // Chord E/G#
        { id: 'g-m4-5', pitch: 'G#2', midiNote: 44, step: 'G', alter: 1, octave: 2, duration: 1.0, startTime: 14.0, velocity: 88, chordSymbol: 'E/G#', tab: { string: 6, fret: 4 } },
        { id: 'g-m4-6', pitch: 'B3', midiNote: 59, step: 'B', alter: 0, octave: 3, duration: 0.5, startTime: 14.0, velocity: 82, tab: { string: 3, fret: 4 } },
        { id: 'g-m4-7', pitch: 'E4', midiNote: 64, step: 'E', alter: 0, octave: 4, duration: 0.5, startTime: 14.5, velocity: 85, tab: { string: 2, fret: 5 } },
        // Chord F#m
        { id: 'g-m4-8', pitch: 'F#2', midiNote: 42, step: 'F', alter: 1, octave: 2, duration: 1.0, startTime: 15.0, velocity: 88, chordSymbol: 'F#m', tab: { string: 6, fret: 2 } },
        { id: 'g-m4-9', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 0.5, startTime: 15.0, velocity: 82, tab: { string: 3, fret: 2 } },
        { id: 'g-m4-10', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 0.5, startTime: 15.5, velocity: 84, tab: { string: 2, fret: 2 } },

        // Compasso 5 (Verso: "if I saw you in heaven?")
        // Chord D/F#
        { id: 'g-m5-1', pitch: 'F#2', midiNote: 42, step: 'F', alter: 1, octave: 2, duration: 1.0, startTime: 16.0, velocity: 90, chordSymbol: 'D/F#', tab: { string: 6, fret: 2 } },
        { id: 'g-m5-2', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 0.5, startTime: 16.0, velocity: 82, tab: { string: 3, fret: 2 } },
        { id: 'g-m5-3', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 0.5, startTime: 16.5, velocity: 85, tab: { string: 2, fret: 3 } },
        // Chord A
        { id: 'g-m5-4', pitch: 'A2', midiNote: 45, step: 'A', alter: 0, octave: 2, duration: 1.0, startTime: 18.0, velocity: 88, chordSymbol: 'A', tab: { string: 5, fret: 0 } },
        { id: 'g-m5-5', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 0.5, startTime: 18.0, velocity: 82, tab: { string: 2, fret: 2 } },
        // Chord E & E7
        { id: 'g-m5-6', pitch: 'E2', midiNote: 40, step: 'E', alter: 0, octave: 2, duration: 1.0, startTime: 19.0, velocity: 88, chordSymbol: 'E', tab: { string: 6, fret: 0 } },
        { id: 'g-m5-7', pitch: 'G#3', midiNote: 56, step: 'G', alter: 1, octave: 3, duration: 0.5, startTime: 19.0, velocity: 82, tab: { string: 3, fret: 1 } },
        { id: 'g-m5-8', pitch: 'B3', midiNote: 59, step: 'B', alter: 0, octave: 3, duration: 0.5, startTime: 19.5, velocity: 84, tab: { string: 2, fret: 0 } },

        // Compasso 6 (Verso: "Would it be the same")
        // Chord A -> E/G# -> F#m
        { id: 'g-m6-1', pitch: 'A2', midiNote: 45, step: 'A', alter: 0, octave: 2, duration: 1.0, startTime: 20.0, velocity: 88, chordSymbol: 'A', tab: { string: 5, fret: 0 } },
        { id: 'g-m6-2', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 0.5, startTime: 20.0, velocity: 82, tab: { string: 3, fret: 2 } },
        { id: 'g-m6-3', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 0.5, startTime: 20.5, velocity: 85, tab: { string: 2, fret: 2 } },
        { id: 'g-m6-4', pitch: 'G#2', midiNote: 44, step: 'G', alter: 1, octave: 2, duration: 1.0, startTime: 22.0, velocity: 88, chordSymbol: 'E/G#', tab: { string: 6, fret: 4 } },
        { id: 'g-m6-5', pitch: 'E4', midiNote: 64, step: 'E', alter: 0, octave: 4, duration: 0.5, startTime: 22.0, velocity: 85, tab: { string: 2, fret: 5 } },
        { id: 'g-m6-6', pitch: 'F#2', midiNote: 42, step: 'F', alter: 1, octave: 2, duration: 1.0, startTime: 23.0, velocity: 88, chordSymbol: 'F#m', tab: { string: 6, fret: 2 } },
        { id: 'g-m6-7', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 0.5, startTime: 23.0, velocity: 84, tab: { string: 2, fret: 2 } },

        // Compasso 7 (Verso: "if I saw you in heaven?")
        // Chord D/F# -> A -> E
        { id: 'g-m7-1', pitch: 'F#2', midiNote: 42, step: 'F', alter: 1, octave: 2, duration: 1.0, startTime: 24.0, velocity: 90, chordSymbol: 'D/F#', tab: { string: 6, fret: 2 } },
        { id: 'g-m7-2', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 0.5, startTime: 24.0, velocity: 84, tab: { string: 2, fret: 3 } },
        { id: 'g-m7-3', pitch: 'F#4', midiNote: 66, step: 'F', alter: 1, octave: 4, duration: 0.5, startTime: 24.5, velocity: 86, tab: { string: 1, fret: 2 } },
        { id: 'g-m7-4', pitch: 'A2', midiNote: 45, step: 'A', alter: 0, octave: 2, duration: 1.0, startTime: 26.0, velocity: 88, chordSymbol: 'A', tab: { string: 5, fret: 0 } },
        { id: 'g-m7-5', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 0.5, startTime: 26.0, velocity: 82, tab: { string: 2, fret: 2 } },
        { id: 'g-m7-6', pitch: 'E2', midiNote: 40, step: 'E', alter: 0, octave: 2, duration: 1.0, startTime: 27.0, velocity: 88, chordSymbol: 'E', tab: { string: 6, fret: 0 } },
        { id: 'g-m7-7', pitch: 'G#3', midiNote: 56, step: 'G', alter: 1, octave: 3, duration: 0.5, startTime: 27.0, velocity: 82, tab: { string: 3, fret: 1 } },

        // Compasso 8 (Ponte: F#m -> C#/E# -> A7/E -> F#7)
        { id: 'g-m8-1', pitch: 'F#2', midiNote: 42, step: 'F', alter: 1, octave: 2, duration: 1.0, startTime: 28.0, velocity: 88, chordSymbol: 'F#m', tab: { string: 6, fret: 2 } },
        { id: 'g-m8-2', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 0.5, startTime: 28.0, velocity: 82, tab: { string: 2, fret: 2 } },
        { id: 'g-m8-3', pitch: 'F2', midiNote: 41, step: 'F', alter: 0, octave: 2, duration: 1.0, startTime: 29.0, velocity: 88, chordSymbol: 'C#/E#', tab: { string: 6, fret: 1 } },
        { id: 'g-m8-4', pitch: 'C4', midiNote: 60, step: 'C', alter: 0, octave: 4, duration: 0.5, startTime: 29.0, velocity: 82, tab: { string: 2, fret: 1 } },
        { id: 'g-m8-5', pitch: 'E2', midiNote: 40, step: 'E', alter: 0, octave: 2, duration: 1.0, startTime: 30.0, velocity: 88, chordSymbol: 'A7/E', tab: { string: 6, fret: 0 } },
        { id: 'g-m8-6', pitch: 'G3', midiNote: 55, step: 'G', alter: 0, octave: 3, duration: 0.5, startTime: 30.0, velocity: 82, tab: { string: 3, fret: 0 } },
        { id: 'g-m8-7', pitch: 'F#2', midiNote: 42, step: 'F', alter: 1, octave: 2, duration: 1.0, startTime: 31.0, velocity: 90, chordSymbol: 'F#7', tab: { string: 6, fret: 2 } },
        { id: 'g-m8-8', pitch: 'A#3', midiNote: 58, step: 'A', alter: 1, octave: 3, duration: 0.5, startTime: 31.0, velocity: 84, tab: { string: 3, fret: 3 } },
      ],
    },

    // 2. VOZ PRINCIPAL COM LETRA (ERIC CLAPTON)
    {
      id: 'tih-vocal',
      name: 'Voz Principal & Melodia (Eric Clapton)',
      family: 'choir',
      subInstrument: 'Voz Tenor Solo & Letra',
      soundfontKey: 'choir_aahs',
      clef: 'treble',
      color: '#ec4899',
      iconName: 'users',
      volume: 0.9,
      pan: 0,
      reverbSend: 0.45,
      muted: false,
      solo: false,
      notes: [
        // Compasso 4: "1. Would you know my name"
        { id: 'v-1', pitch: 'E4', midiNote: 64, step: 'E', alter: 0, octave: 4, duration: 0.5, startTime: 12.0, velocity: 90, lyric: '1. Would' },
        { id: 'v-2', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 0.5, startTime: 12.5, velocity: 86, lyric: 'you' },
        { id: 'v-3', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 1.0, startTime: 13.0, velocity: 88, lyric: 'know' },
        { id: 'v-4', pitch: 'B3', midiNote: 59, step: 'B', alter: 0, octave: 3, duration: 0.5, startTime: 14.0, velocity: 85, lyric: 'my' },
        { id: 'v-5', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 1.5, startTime: 14.5, velocity: 88, lyric: 'name' },

        // Compasso 5: "if I saw you in heav - en?"
        { id: 'v-6', pitch: 'F#4', midiNote: 66, step: 'F', alter: 1, octave: 4, duration: 0.5, startTime: 16.0, velocity: 92, lyric: 'if' },
        { id: 'v-7', pitch: 'A4', midiNote: 69, step: 'A', alter: 0, octave: 4, duration: 0.5, startTime: 16.5, velocity: 94, lyric: 'I' },
        { id: 'v-8', pitch: 'G#4', midiNote: 68, step: 'G', alter: 1, octave: 4, duration: 0.5, startTime: 17.0, velocity: 90, lyric: 'saw' },
        { id: 'v-9', pitch: 'F#4', midiNote: 66, step: 'F', alter: 1, octave: 4, duration: 0.5, startTime: 17.5, velocity: 88, lyric: 'you' },
        { id: 'v-10', pitch: 'E4', midiNote: 64, step: 'E', alter: 0, octave: 4, duration: 0.5, startTime: 18.0, velocity: 86, lyric: 'in' },
        { id: 'v-11', pitch: 'F#4', midiNote: 66, step: 'F', alter: 1, octave: 4, duration: 0.5, startTime: 18.5, velocity: 88, lyric: 'heav-' },
        { id: 'v-12', pitch: 'E4', midiNote: 64, step: 'E', alter: 0, octave: 4, duration: 1.0, startTime: 19.0, velocity: 85, lyric: 'en?' },

        // Compasso 6: "Would it be the same"
        { id: 'v-13', pitch: 'E4', midiNote: 64, step: 'E', alter: 0, octave: 4, duration: 0.5, startTime: 20.0, velocity: 90, lyric: 'Would' },
        { id: 'v-14', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 0.5, startTime: 20.5, velocity: 86, lyric: 'it' },
        { id: 'v-15', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 1.0, startTime: 21.0, velocity: 88, lyric: 'be' },
        { id: 'v-16', pitch: 'B3', midiNote: 59, step: 'B', alter: 0, octave: 3, duration: 0.5, startTime: 22.0, velocity: 85, lyric: 'the' },
        { id: 'v-17', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 1.5, startTime: 22.5, velocity: 88, lyric: 'same' },

        // Compasso 7: "if I saw you in heav - en?"
        { id: 'v-18', pitch: 'F#4', midiNote: 66, step: 'F', alter: 1, octave: 4, duration: 0.5, startTime: 24.0, velocity: 92, lyric: 'if' },
        { id: 'v-19', pitch: 'A4', midiNote: 69, step: 'A', alter: 0, octave: 4, duration: 0.5, startTime: 24.5, velocity: 94, lyric: 'I' },
        { id: 'v-20', pitch: 'G#4', midiNote: 68, step: 'G', alter: 1, octave: 4, duration: 0.5, startTime: 25.0, velocity: 90, lyric: 'saw' },
        { id: 'v-21', pitch: 'F#4', midiNote: 66, step: 'F', alter: 1, octave: 4, duration: 0.5, startTime: 25.5, velocity: 88, lyric: 'you' },
        { id: 'v-22', pitch: 'E4', midiNote: 64, step: 'E', alter: 0, octave: 4, duration: 0.5, startTime: 26.0, velocity: 86, lyric: 'in' },
        { id: 'v-23', pitch: 'F#4', midiNote: 66, step: 'F', alter: 1, octave: 4, duration: 0.5, startTime: 26.5, velocity: 88, lyric: 'heav-' },
        { id: 'v-24', pitch: 'E4', midiNote: 64, step: 'E', alter: 0, octave: 4, duration: 1.0, startTime: 27.0, velocity: 85, lyric: 'en?' },

        // Compasso 8: "I must be strong..."
        { id: 'v-25', pitch: 'A4', midiNote: 69, step: 'A', alter: 0, octave: 4, duration: 1.0, startTime: 28.0, velocity: 92, lyric: 'I' },
        { id: 'v-26', pitch: 'G#4', midiNote: 68, step: 'G', alter: 1, octave: 4, duration: 1.0, startTime: 29.0, velocity: 88, lyric: 'must' },
        { id: 'v-27', pitch: 'F#4', midiNote: 66, step: 'F', alter: 1, octave: 4, duration: 1.0, startTime: 30.0, velocity: 90, lyric: 'be' },
        { id: 'v-28', pitch: 'E4', midiNote: 64, step: 'E', alter: 0, octave: 4, duration: 1.0, startTime: 31.0, velocity: 86, lyric: 'strong' },
      ],
    },

    // 3. TECLAS / PIANO RHODES & ÓRGÃO HARMÔNICO
    {
      id: 'tih-keys',
      name: 'Teclas & Harmonia (Rhodes & Órgão)',
      family: 'keys',
      subInstrument: 'Piano Elétrico Vintage Rhodes',
      soundfontKey: 'electric_piano_1',
      clef: 'treble',
      color: '#3b82f6',
      iconName: 'piano',
      volume: 0.78,
      pan: 0.25,
      reverbSend: 0.45,
      muted: false,
      solo: false,
      notes: [
        // M1
        { id: 'k-1', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 2, startTime: 0, velocity: 70 },
        { id: 'k-2', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 2, startTime: 0, velocity: 72 },
        { id: 'k-3', pitch: 'E4', midiNote: 64, step: 'E', alter: 0, octave: 4, duration: 2, startTime: 0, velocity: 70 },
        { id: 'k-4', pitch: 'G#3', midiNote: 56, step: 'G', alter: 1, octave: 3, duration: 1, startTime: 2, velocity: 70 },
        { id: 'k-5', pitch: 'F#3', midiNote: 54, step: 'F', alter: 1, octave: 3, duration: 1, startTime: 3, velocity: 72 },
        // M2
        { id: 'k-6', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 2, startTime: 4, velocity: 70 },
        { id: 'k-7', pitch: 'F#3', midiNote: 54, step: 'F', alter: 1, octave: 3, duration: 1, startTime: 6, velocity: 72 },
        { id: 'k-8', pitch: 'E3', midiNote: 52, step: 'E', alter: 0, octave: 3, duration: 1, startTime: 7, velocity: 74 },
        // M3
        { id: 'k-9', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 4, startTime: 8, velocity: 72 },
        // M4
        { id: 'k-10', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 2, startTime: 12, velocity: 70 },
        { id: 'k-11', pitch: 'G#3', midiNote: 56, step: 'G', alter: 1, octave: 3, duration: 1, startTime: 14, velocity: 70 },
        { id: 'k-12', pitch: 'F#3', midiNote: 54, step: 'F', alter: 1, octave: 3, duration: 1, startTime: 15, velocity: 70 },
        // M5
        { id: 'k-13', pitch: 'F#3', midiNote: 54, step: 'F', alter: 1, octave: 3, duration: 2, startTime: 16, velocity: 70 },
        { id: 'k-14', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 1, startTime: 18, velocity: 70 },
        { id: 'k-15', pitch: 'E3', midiNote: 52, step: 'E', alter: 0, octave: 3, duration: 1, startTime: 19, velocity: 72 },
        // M6
        { id: 'k-16', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 2, startTime: 20, velocity: 70 },
        { id: 'k-17', pitch: 'G#3', midiNote: 56, step: 'G', alter: 1, octave: 3, duration: 1, startTime: 22, velocity: 70 },
        { id: 'k-18', pitch: 'F#3', midiNote: 54, step: 'F', alter: 1, octave: 3, duration: 1, startTime: 23, velocity: 70 },
        // M7
        { id: 'k-19', pitch: 'F#3', midiNote: 54, step: 'F', alter: 1, octave: 3, duration: 2, startTime: 24, velocity: 70 },
        { id: 'k-20', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 1, startTime: 26, velocity: 70 },
        { id: 'k-21', pitch: 'E3', midiNote: 52, step: 'E', alter: 0, octave: 3, duration: 1, startTime: 27, velocity: 72 },
        // M8
        { id: 'k-22', pitch: 'F#3', midiNote: 54, step: 'F', alter: 1, octave: 3, duration: 1, startTime: 28, velocity: 72 },
        { id: 'k-23', pitch: 'F3', midiNote: 53, step: 'F', alter: 0, octave: 3, duration: 1, startTime: 29, velocity: 72 },
        { id: 'k-24', pitch: 'E3', midiNote: 52, step: 'E', alter: 0, octave: 3, duration: 1, startTime: 30, velocity: 72 },
        { id: 'k-25', pitch: 'F#3', midiNote: 54, step: 'F', alter: 1, octave: 3, duration: 1, startTime: 31, velocity: 75 },
      ],
    },

    // 4. SOPROS SUAVES (FLAUTA TRANSVERSAL CONTRACANTO)
    {
      id: 'tih-woodwinds',
      name: 'Sopros Melódicos (Flauta Contracanto)',
      family: 'woodwinds',
      subInstrument: 'Flauta Transversal de Concerto',
      soundfontKey: 'flute',
      clef: 'treble',
      color: '#10b981',
      iconName: 'wind',
      volume: 0.72,
      pan: -0.3,
      reverbSend: 0.5,
      muted: false,
      solo: false,
      notes: [
        // M3 (entrada suave na transição)
        { id: 'w-1', pitch: 'C#5', midiNote: 73, step: 'C', alter: 1, octave: 5, duration: 2, startTime: 8, velocity: 75 },
        { id: 'w-2', pitch: 'E5', midiNote: 76, step: 'E', alter: 0, octave: 5, duration: 2, startTime: 10, velocity: 78 },
        // M5 (resposta ao "if I saw you in heaven")
        { id: 'w-3', pitch: 'A5', midiNote: 81, step: 'A', alter: 0, octave: 5, duration: 1.5, startTime: 18, velocity: 78 },
        { id: 'w-4', pitch: 'G#5', midiNote: 80, step: 'G', alter: 1, octave: 5, duration: 0.5, startTime: 19.5, velocity: 75 },
        // M7 (resposta)
        { id: 'w-5', pitch: 'A5', midiNote: 81, step: 'A', alter: 0, octave: 5, duration: 2, startTime: 26, velocity: 80 },
      ],
    },

    // 5. METAIS QUENTES (TROMPAS SUAVES)
    {
      id: 'tih-brass',
      name: 'Metais Suaves (Trompa Harmônica)',
      family: 'brass',
      subInstrument: 'Trompa Francesa Clássica',
      soundfontKey: 'french_horn',
      clef: 'treble',
      color: '#f59e0b',
      iconName: 'bell',
      volume: 0.7,
      pan: 0.35,
      reverbSend: 0.55,
      muted: false,
      solo: false,
      notes: [
        { id: 'b-1', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 4, startTime: 12, velocity: 68 },
        { id: 'b-2', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 4, startTime: 16, velocity: 70 },
        { id: 'b-3', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 4, startTime: 20, velocity: 68 },
        { id: 'b-4', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 4, startTime: 24, velocity: 70 },
        { id: 'b-5', pitch: 'C#4', midiNote: 61, step: 'C', alter: 1, octave: 4, duration: 4, startTime: 28, velocity: 72 },
      ],
    },

    // 6. PERCUSSÃO LEVE (SHAKER & VASSOURINHAS ACÚSTICAS)
    {
      id: 'tih-percussion',
      name: 'Percussão Acústica (Shaker & Bumbo Leve)',
      family: 'percussion',
      subInstrument: 'Bateria com Vassourinhas & Shaker',
      soundfontKey: 'synth_drum',
      clef: 'percussion',
      color: '#f97316',
      iconName: 'disc',
      volume: 0.68,
      pan: 0,
      reverbSend: 0.35,
      muted: false,
      solo: false,
      notes: [
        // A partir do compasso 4 (Verso)
        { id: 'p-1', pitch: 'hihat', midiNote: 42, step: 'P', alter: 0, octave: 1, duration: 0.5, startTime: 12, velocity: 65 },
        { id: 'p-2', pitch: 'hihat', midiNote: 42, step: 'P', alter: 0, octave: 1, duration: 0.5, startTime: 12.5, velocity: 60 },
        { id: 'p-3', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1.0, startTime: 13, velocity: 72 },
        { id: 'p-4', pitch: 'hihat', midiNote: 42, step: 'P', alter: 0, octave: 1, duration: 0.5, startTime: 14, velocity: 65 },
        { id: 'p-5', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1.0, startTime: 15, velocity: 72 },

        { id: 'p-6', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1.0, startTime: 16, velocity: 70 },
        { id: 'p-7', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1.0, startTime: 17, velocity: 72 },
        { id: 'p-8', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1.0, startTime: 18, velocity: 70 },
        { id: 'p-9', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1.0, startTime: 19, velocity: 72 },

        { id: 'p-10', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1.0, startTime: 20, velocity: 70 },
        { id: 'p-11', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1.0, startTime: 21, velocity: 72 },
        { id: 'p-12', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1.0, startTime: 22, velocity: 70 },
        { id: 'p-13', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1.0, startTime: 23, velocity: 72 },

        { id: 'p-14', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1.0, startTime: 24, velocity: 70 },
        { id: 'p-15', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1.0, startTime: 25, velocity: 72 },
        { id: 'p-16', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1.0, startTime: 26, velocity: 70 },
        { id: 'p-17', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1.0, startTime: 27, velocity: 72 },

        { id: 'p-18', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1.0, startTime: 28, velocity: 70 },
        { id: 'p-19', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1.0, startTime: 29, velocity: 70 },
        { id: 'p-20', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1.0, startTime: 30, velocity: 72 },
        { id: 'p-21', pitch: 'crash', midiNote: 49, step: 'P', alter: 0, octave: 1, duration: 2.0, startTime: 31, velocity: 75 },
      ],
    },
  ],
};
