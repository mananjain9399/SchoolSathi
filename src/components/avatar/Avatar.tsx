import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { AvatarState, AvatarPersona, Student } from '../../types';
import { SathiBirdieAvatar } from './SathiBirdieAvatar';
import { VeerBoyAvatar } from './VeerBoyAvatar';
import { AnanyaGirlAvatar } from './AnanyaGirlAvatar';

export interface AvatarProps {
  state: AvatarState;
  persona?: AvatarPersona;
  currentStudent?: Student | null;
  isMultiChild?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  showStateBadge?: boolean;
  className?: string;
}

/**
 * Resolves which avatar persona to render based on child gender or parent preference
 */
export function resolveAvatarPersona(
  preferredPersona?: AvatarPersona,
  student?: Student | null,
  isMultiChild?: boolean
): 'neutral' | 'boy' | 'girl' {
  if (preferredPersona && preferredPersona !== 'auto') {
    return preferredPersona;
  }
  if (isMultiChild || !student) {
    return 'neutral';
  }
  if (student.gender === 'male') {
    return 'boy';
  }
  if (student.gender === 'female') {
    return 'girl';
  }
  return 'neutral';
}

export const Avatar: React.FC<AvatarProps> = ({
  state,
  persona = 'auto',
  currentStudent = null,
  isMultiChild = false,
  size = 'lg',
  onClick,
  showStateBadge = false,
  className = '',
}) => {
  // Normalize state to lowercase for robust matching
  const normState = (state || 'idle').toLowerCase() as string;

  // Multi-frame mouth phoneme cycler for lightweight, believable lip-sync
  const [phonemeIndex, setPhonemeIndex] = useState(0);

  useEffect(() => {
    if (normState === 'speaking') {
      const timer = setInterval(() => {
        setPhonemeIndex((prev) => (prev + 1) % 4);
      }, 140);
      return () => clearInterval(timer);
    } else {
      setPhonemeIndex(0);
    }
  }, [normState]);

  // Trigger celebration confetti when entering celebrating state
  useEffect(() => {
    if (normState === 'celebrating') {
      try {
        confetti({
          particleCount: 50,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#F97316', '#FBBF24', '#10B981', '#3B82F6', '#EC4899'],
        });
      } catch {
        // graceful ignore if confetti fails
      }
    }
  }, [normState]);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-52 h-52 sm:w-60 sm:h-60',
    xl: 'w-64 h-64 sm:w-72 sm:h-72',
  }[size];

  // Animation class based on state
  const animationClass = {
    idle: 'animate-float',
    listening: 'scale-105 transition-transform duration-300',
    thinking: 'transition-all duration-300 rotate-1',
    speaking: 'animate-float',
    happy: 'animate-happy',
    concerned: 'transition-all duration-300',
    celebrating: 'animate-celebrate',
    error: 'transition-all duration-300',
  }[normState] || 'animate-float';

  // State label translation badge
  const stateLabels: Record<string, { text: string; color: string; icon: string }> = {
    idle: { text: 'Sathi Ready', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '✨' },
    listening: { text: 'Listening...', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '👂' },
    thinking: { text: 'Thinking...', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: '💡' },
    speaking: { text: 'Speaking...', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '🗣️' },
    happy: { text: 'Happy', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '😊' },
    concerned: { text: 'Attention', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: '⚠️' },
    celebrating: { text: 'Brilliant!', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '🎉' },
    error: { text: 'Please retry', color: 'bg-red-100 text-red-800 border-red-300', icon: '❓' },
  };

  const activeLabel = stateLabels[normState] || stateLabels.idle;
  const effectivePersona = resolveAvatarPersona(persona, currentStudent, isMultiChild);

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      role="img"
      aria-label={`SchoolSathi companion (${effectivePersona}) in ${normState} state`}
    >
      {/* Listening radiating soundwave rings */}
      {normState === 'listening' && (
        <>
          <div className="absolute inset-0 rounded-full bg-orange-400/20 animate-ping pointer-events-none" />
          <div className="absolute -inset-4 rounded-full border-2 border-orange-400/40 animate-pulse pointer-events-none" />
          <div className="absolute -inset-8 rounded-full border border-orange-300/30 animate-pulse delay-150 pointer-events-none" />
        </>
      )}

      {/* Floating Sparkles for Thinking State */}
      {normState === 'thinking' && (
        <div className="absolute -top-4 -right-2 flex space-x-1 items-center bg-white/95 px-3 py-1 rounded-full shadow-md border border-amber-200 animate-bounce z-10">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping delay-100" />
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping delay-200" />
        </div>
      )}

      {/* Speaking Soundwaves indicator */}
      {normState === 'speaking' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-full shadow-sm border border-blue-100 z-10">
          <span className="w-1 bg-blue-500 rounded-full animate-[soundWave_0.6s_ease-in-out_infinite]" />
          <span className="w-1 bg-blue-500 rounded-full animate-[soundWave_0.4s_ease-in-out_infinite_0.1s]" />
          <span className="w-1 bg-blue-500 rounded-full animate-[soundWave_0.8s_ease-in-out_infinite_0.2s]" />
          <span className="w-1 bg-blue-500 rounded-full animate-[soundWave_0.5s_ease-in-out_infinite_0.3s]" />
        </div>
      )}

      {/* Main Avatar Character based on resolved persona */}
      <div className={`relative ${sizeClasses} ${animationClass}`}>
        {effectivePersona === 'boy' ? (
          <VeerBoyAvatar state={state} phonemeIndex={phonemeIndex} />
        ) : effectivePersona === 'girl' ? (
          <AnanyaGirlAvatar state={state} phonemeIndex={phonemeIndex} />
        ) : (
          <SathiBirdieAvatar state={state} phonemeIndex={phonemeIndex} />
        )}
      </div>

      {/* Visual State Indicator Badge */}
      {showStateBadge && (
        <div
          id="avatar-state-indicator"
          className={`mt-2.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-xs transition-all duration-300 select-none ${
            activeLabel.color
          }`}
        >
          {normState === 'listening' ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span>Listening...</span>
            </>
          ) : normState === 'thinking' ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <span>Thinking...</span>
            </>
          ) : normState === 'speaking' ? (
            <>
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-1 h-3 bg-blue-600 rounded-full animate-[soundWave_0.5s_ease-in-out_infinite]" />
                <span className="w-1 h-4 bg-blue-600 rounded-full animate-[soundWave_0.35s_ease-in-out_infinite_0.1s]" />
                <span className="w-1 h-2 bg-blue-600 rounded-full animate-[soundWave_0.6s_ease-in-out_infinite_0.2s]" />
                <span className="w-1 h-3.5 bg-blue-600 rounded-full animate-[soundWave_0.4s_ease-in-out_infinite_0.3s]" />
              </div>
              <span>Speaking...</span>
            </>
          ) : (
            <>
              <span className="text-sm leading-none">{activeLabel.icon}</span>
              <span>{activeLabel.text}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
