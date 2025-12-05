import React from 'react';
import { VoiceName } from '../types';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onChange: (voice: VoiceName) => void;
  disabled?: boolean;
}

const VOICE_OPTIONS = [
  { label: '男', value: VoiceName.Charon },
  { label: '女', value: VoiceName.Kore },
];

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onChange, disabled }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-stone-600 uppercase tracking-wider">Voice Character</label>
      <div className="flex flex-col sm:flex-row gap-3">
        {VOICE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`
              flex-1 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 border-2
              ${selectedVoice === option.value
                ? 'bg-amber-50 border-amber-600 text-amber-800 shadow-sm'
                : 'bg-white border-stone-200 text-stone-600 hover:border-amber-300 hover:bg-stone-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};