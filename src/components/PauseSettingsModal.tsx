/**
 * Pause Menu & Settings Modal
 * LAGOS SURVIVAL: BLOCK WAR
 */

import React, { useState } from 'react';
import { X, Sliders, Volume2, Monitor, Sun, Sunset, Moon, CloudRain, Keyboard, Home, Play } from 'lucide-react';
import { GameSettings, WeatherType } from '../types/game';
import { soundManager } from '../audio/SoundManager';

interface PauseSettingsModalProps {
  weather: WeatherType;
  onSetWeather: (w: WeatherType) => void;
  onSetGraphics: (q: 'low' | 'medium' | 'high') => void;
  onResume: () => void;
  onReturnToTitle: () => void;
}

export const PauseSettingsModal: React.FC<PauseSettingsModalProps> = ({
  weather,
  onSetWeather,
  onSetGraphics,
  onResume,
  onReturnToTitle,
}) => {
  const [graphics, setGraphics] = useState<'low' | 'medium' | 'high'>('high');
  const [masterVol, setMasterVol] = useState(0.8);
  const [sfxVol, setSfxVol] = useState(0.9);
  const [musicVol, setMusicVol] = useState(0.5);

  const handleGraphicsChange = (q: 'low' | 'medium' | 'high') => {
    setGraphics(q);
    onSetGraphics(q);
    soundManager.playUIClick();
  };

  const handleVolumeChange = (type: 'master' | 'sfx' | 'music', val: number) => {
    if (type === 'master') setMasterVol(val);
    if (type === 'sfx') setSfxVol(val);
    if (type === 'music') setMusicVol(val);
    soundManager.setVolumes(
      type === 'master' ? val : masterVol,
      type === 'sfx' ? val : sfxVol,
      type === 'music' ? val : musicVol,
      0.4
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sliders className="w-6 h-6 text-amber-400" />
            <h2 className="font-tech text-2xl font-bold text-white tracking-wide uppercase">
              SETTINGS & PAUSE MENU
            </h2>
          </div>

          <button
            onClick={() => {
              soundManager.playUIClick();
              onResume();
            }}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Graphics Quality */}
          <div>
            <label className="text-xs font-tech text-zinc-400 font-semibold uppercase block mb-2 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-400" />
              GRAPHICS FIDELITY PRESET
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => handleGraphicsChange(q)}
                  className={`py-3 rounded-xl border font-tech font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    graphics === q
                      ? 'border-amber-400 bg-amber-500/20 text-white shadow-md'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {q} QUALITY
                </button>
              ))}
            </div>
          </div>

          {/* Time of Day & Weather Atmosphere */}
          <div>
            <label className="text-xs font-tech text-zinc-400 font-semibold uppercase block mb-2 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              LAGOS ATMOSPHERE & TIME OF DAY
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { id: 'sunny', label: 'Midday Sun', icon: Sun },
                { id: 'golden_hour', label: 'Golden Hour', icon: Sunset },
                { id: 'night', label: 'Night City', icon: Moon },
                { id: 'rainstorm', label: 'Rainstorm', icon: CloudRain },
              ].map((w) => {
                const Icon = w.icon;
                const isSelected = weather === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => {
                      onSetWeather(w.id as WeatherType);
                      soundManager.playUIClick();
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center font-tech text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold shadow-md'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <span>{w.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio Sliders */}
          <div className="space-y-4">
            <label className="text-xs font-tech text-zinc-400 font-semibold uppercase block flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              AUDIO VOLUMES
            </label>

            <div>
              <div className="flex justify-between text-xs font-tech text-zinc-300 mb-1">
                <span>Master Volume</span>
                <span>{Math.round(masterVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={masterVol}
                onChange={(e) => handleVolumeChange('master', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-tech text-zinc-300 mb-1">
                <span>Weapons & SFX</span>
                <span>{Math.round(sfxVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxVol}
                onChange={(e) => handleVolumeChange('sfx', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-tech text-zinc-300 mb-1">
                <span>Afro Rhythms Music</span>
                <span>{Math.round(musicVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVol}
                onChange={(e) => handleVolumeChange('music', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Keybindings Reference */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
            <div className="text-xs font-tech text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-purple-400" />
              DESKTOP CONTROLS
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-tech text-zinc-300">
              <div><span className="text-amber-400 font-bold">WASD:</span> Move / Drive</div>
              <div><span className="text-amber-400 font-bold">CLICK:</span> Shoot / Place</div>
              <div><span className="text-amber-400 font-bold">RIGHT CLICK:</span> Aim (ADS)</div>
              <div><span className="text-amber-400 font-bold">SPACE:</span> Jump</div>
              <div><span className="text-amber-400 font-bold">SHIFT:</span> Sprint</div>
              <div><span className="text-amber-400 font-bold">C:</span> Crouch</div>
              <div><span className="text-amber-400 font-bold">E:</span> Enter Car / Shop</div>
              <div><span className="text-amber-400 font-bold">R:</span> Reload / Rotate</div>
              <div><span className="text-amber-400 font-bold">V:</span> Camera 1st / 3rd</div>
              <div><span className="text-amber-400 font-bold">B:</span> Building Mode</div>
              <div><span className="text-amber-400 font-bold">TAB:</span> Inventory</div>
              <div><span className="text-amber-400 font-bold">H:</span> Danfo Horn</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <button
            onClick={() => {
              soundManager.playUIClick();
              onReturnToTitle();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 font-tech font-bold text-xs uppercase hover:bg-red-900/60 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>

          <button
            onClick={() => {
              soundManager.playUIClick(true);
              onResume();
            }}
            className="px-8 py-3 rounded-xl bg-amber-500 text-black font-tech font-bold text-sm tracking-wider uppercase hover:bg-yellow-400 transition-all cursor-pointer"
          >
            RESUME GAME
          </button>
        </div>
      </div>
    </div>
  );
};
