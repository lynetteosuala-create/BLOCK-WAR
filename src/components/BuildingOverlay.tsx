/**
 * Tactical Construction & Fortification Overlay
 * LAGOS SURVIVAL: BLOCK WAR
 */

import React from 'react';
import { Hammer, RotateCw, X, Shield, Box, Sparkles } from 'lucide-react';
import { BUILDING_CATALOG } from '../game/models/construction';
import { soundManager } from '../audio/SoundManager';

interface BuildingOverlayProps {
  selectedIndex: number;
  resources: { wood: number; metal: number; concrete: number };
  onSelectPiece: (idx: number) => void;
  onRotate: () => void;
  onClose: () => void;
}

export const BuildingOverlay: React.FC<BuildingOverlayProps> = ({
  selectedIndex,
  resources,
  onSelectPiece,
  onRotate,
  onClose,
}) => {
  const activePiece = BUILDING_CATALOG[selectedIndex];

  return (
    <div className="absolute inset-x-0 bottom-24 z-30 flex flex-col items-center pointer-events-none select-none">
      {/* Top Floating Info Tag */}
      <div className="mb-3 px-5 py-2 rounded-xl bg-zinc-950/90 border border-emerald-500/40 backdrop-blur-md shadow-2xl flex items-center gap-4 pointer-events-auto">
        <div className="flex items-center gap-2">
          <Hammer className="w-4 h-4 text-emerald-400" />
          <span className="font-tech text-xs font-bold text-white uppercase tracking-wider">
            BUILD MODE ACTIVE: {activePiece.name}
          </span>
        </div>

        <div className="w-[1px] h-4 bg-zinc-700" />

        {/* Resource Requirements for active piece */}
        <div className="flex items-center gap-3 text-xs font-tech">
          <span className={`${resources.wood >= activePiece.woodCost ? 'text-amber-400' : 'text-red-400 font-bold'}`}>
            Wood: {activePiece.woodCost} ({resources.wood})
          </span>
          <span className={`${resources.metal >= activePiece.metalCost ? 'text-blue-400' : 'text-red-400 font-bold'}`}>
            Metal: {activePiece.metalCost} ({resources.metal})
          </span>
          <span className={`${resources.concrete >= activePiece.concreteCost ? 'text-zinc-300' : 'text-red-400 font-bold'}`}>
            Concrete: {activePiece.concreteCost} ({resources.concrete})
          </span>
        </div>

        <div className="w-[1px] h-4 bg-zinc-700" />

        {/* Rotate Button */}
        <button
          onClick={() => {
            soundManager.playUIClick();
            onRotate();
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-tech text-xs uppercase cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>ROTATE [R]</span>
        </button>

        <button
          onClick={() => {
            soundManager.playUIClick();
            onClose();
          }}
          className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
          title="Exit Build Mode"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Piece Selection Strip */}
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-zinc-950/90 border border-zinc-800 backdrop-blur-md shadow-2xl overflow-x-auto max-w-[95vw] pointer-events-auto">
        {BUILDING_CATALOG.map((piece, idx) => {
          const isSelected = selectedIndex === idx;
          const canAfford =
            resources.wood >= piece.woodCost &&
            resources.metal >= piece.metalCost &&
            resources.concrete >= piece.concreteCost;

          return (
            <button
              key={piece.id}
              onClick={() => {
                soundManager.playUIClick();
                onSelectPiece(idx);
              }}
              className={`px-3 py-2 rounded-xl flex flex-col items-center min-w-[110px] border transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <span className={`font-tech text-xs font-bold truncate max-w-[100px] ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                {piece.name}
              </span>
              <span className="text-[10px] font-tech text-zinc-400 mt-1">
                HP {piece.health}
              </span>
              <span className={`text-[9px] font-tech mt-0.5 ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                {canAfford ? 'READY' : 'LOW RES'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 text-[11px] font-tech text-zinc-400 pointer-events-none">
        LEFT CLICK: PLACE FORTIFICATION • MOUSE WHEEL: CYCLE PIECES
      </div>
    </div>
  );
};
