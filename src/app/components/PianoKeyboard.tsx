import React, { useState } from 'react';

const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface PianoKeyboardProps {
  pressedKeys: { [midi: number]: 'right' | 'left' | 'both' };
  showLabels: boolean;
}

export function PianoKeyboard({ pressedKeys, showLabels }: PianoKeyboardProps) {
  const keys: { midi: number; note: number; isWhite: boolean; name: string; octave: number }[] = [];
  for (let midi = 21; midi <= 108; midi++) {
    const note = midi % 12;
    const isWhite = WHITE_KEYS.includes(note);
    keys.push({ midi, note, isWhite, name: NOTE_NAMES[note], octave: Math.floor(midi / 12) - 1 });
  }
  const whiteKeys = keys.filter((k) => k.isWhite);
  const blackKeys = keys.filter((k) => !k.isWhite);
  const getKeyClass = (midi: number) => {
    if (!pressedKeys[midi]) return '';
    if (pressedKeys[midi] === 'right') return 'pressed pressed-right';
    if (pressedKeys[midi] === 'left') return 'pressed pressed-left';
    if (pressedKeys[midi] === 'both') return 'pressed pressed-both';
    return 'pressed';
  };
  return (
    <div className={`piano${showLabels ? '' : ' labels-hidden'}`}>
      <div className="keys">
        <div className="white-keys">
          {whiteKeys.map((k) => {
            const pc = k.midi % 12;
            const label = showLabels ? (pc === 0 ? `${k.name}${k.octave}` : k.name) : '';
            return (
              <div key={k.midi} className={`white-key ${getKeyClass(k.midi)}`}>
                {label && <span className="label">{label}</span>}
              </div>
            );
          })}
        </div>
        <div className="black-keys">
          {blackKeys.map((k) => {
            const idx = whiteKeys.findIndex((wk) => wk.midi > k.midi) - 1;
            const label = showLabels ? `${k.name}${k.octave}` : '';
            return (
              <div key={k.midi} className="black-key-wrap" style={{ gridColumn: idx + 2 }}>
                <div className={`black-key ${getKeyClass(k.midi)}`}>
                  {label && <span className="label">{label}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
