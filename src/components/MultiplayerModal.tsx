/**
 * Real-Time Online Multiplayer Lobby & Matchmaking Modal
 * LAGOS SURVIVAL: BLOCK WAR
 */

import React, { useState } from 'react';
import { X, Users, Shield, Globe, Radio, Swords, Trophy, Copy, Check, Play } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';

interface MultiplayerModalProps {
  currentRoom: string;
  selectedTeam: 'red' | 'blue';
  scores: { red: number; blue: number };
  onJoinRoom: (roomCode: string, team: 'red' | 'blue') => void;
  onClose: () => void;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  currentRoom,
  selectedTeam,
  scores,
  onJoinRoom,
  onClose,
}) => {
  const [roomInput, setRoomInput] = useState(currentRoom || 'LAGOS-MAIN');
  const [team, setTeam] = useState<'red' | 'blue'>(selectedTeam);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = () => {
    soundManager.playUIClick(true);
    onJoinRoom(roomInput.trim().toUpperCase(), team);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="w-6 h-6 text-blue-400 animate-pulse" />
            <div>
              <h2 className="font-tech text-2xl font-bold text-white tracking-wide uppercase">
                LAGOS BLOCK WAR • LIVE MULTIPLAYER
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Real-time cross-tab & online session synchronization</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playUIClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Live Scoreboard */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
            <div className="text-xs font-tech text-zinc-400 uppercase tracking-widest text-center mb-3">
              LIVE SECTOR MATCH SCORE
            </div>

            <div className="flex items-center justify-around">
              {/* Blue Team */}
              <div className="text-center">
                <div className="font-tech text-xs text-blue-400 font-bold uppercase">EKO VANGUARD</div>
                <div className="font-tech text-4xl font-extrabold text-blue-400 mt-1">{scores.blue}</div>
              </div>

              <div className="font-tech text-2xl font-bold text-zinc-600">VS</div>

              {/* Red Team */}
              <div className="text-center">
                <div className="font-tech text-xs text-red-400 font-bold uppercase">MARINA ENFORCERS</div>
                <div className="font-tech text-4xl font-extrabold text-red-400 mt-1">{scores.red}</div>
              </div>
            </div>
          </div>

          {/* Team Selection */}
          <div>
            <label className="text-xs font-tech text-zinc-400 font-semibold uppercase block mb-2">
              SELECT YOUR SQUAD ALLIANCE
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setTeam('blue');
                  soundManager.playUIClick();
                }}
                className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                  team === 'blue'
                    ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                }`}
              >
                <Shield className="w-6 h-6 text-blue-400 mb-2" />
                <span className="font-tech text-base font-bold text-white">EKO VANGUARD</span>
                <span className="text-xs text-zinc-400 mt-1">Lagos Defense Coalition</span>
              </button>

              <button
                onClick={() => {
                  setTeam('red');
                  soundManager.playUIClick();
                }}
                className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                  team === 'red'
                    ? 'border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                }`}
              >
                <Swords className="w-6 h-6 text-red-400 mb-2" />
                <span className="font-tech text-base font-bold text-white">MARINA ENFORCERS</span>
                <span className="text-xs text-zinc-400 mt-1">Syndicate Heavy Division</span>
              </button>
            </div>
          </div>

          {/* Room Code */}
          <div>
            <label className="text-xs font-tech text-zinc-400 font-semibold uppercase block mb-1">
              MULTIPLAYER CHANNEL / ROOM CODE
            </label>
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-tech font-bold text-base uppercase tracking-wider focus:border-amber-400 outline-none"
              placeholder="e.g. LAGOS-MAIN, EKO-ZONE"
            />
            <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
              Open another tab or window on this machine to immediately connect and play together in real time!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 font-tech text-xs uppercase hover:text-white cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'LINK COPIED' : 'INVITE LINK'}</span>
          </button>

          <button
            onClick={handleConnect}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-black font-tech font-bold text-sm tracking-wider uppercase flex items-center gap-2 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>CONNECT TO MATCH</span>
          </button>
        </div>
      </div>
    </div>
  );
};
