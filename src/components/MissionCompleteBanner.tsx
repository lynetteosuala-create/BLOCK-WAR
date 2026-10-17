/**
 * Mission Success & Cash Reward Banner
 * LAGOS SURVIVAL: BLOCK WAR
 */

import React, { useEffect } from 'react';
import { Award, CheckCircle2, ChevronRight } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';

interface MissionCompleteBannerProps {
  title: string;
  nairaReward: number;
  xpReward: number;
  onDismiss: () => void;
}

export const MissionCompleteBanner: React.FC<MissionCompleteBannerProps> = ({
  title,
  nairaReward,
  xpReward,
  onDismiss,
}) => {
  useEffect(() => {
    soundManager.playUIClick(true);
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="absolute top-20 inset-x-0 z-40 flex justify-center pointer-events-none select-none animate-bounce">
      <div className="px-8 py-5 rounded-2xl bg-zinc-950/95 border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.6)] backdrop-blur-xl flex items-center gap-6 pointer-events-auto">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-black">
          <Award className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-tech text-xs font-bold text-amber-400 tracking-widest uppercase">
              OBJECTIVE COMPLETED
            </span>
          </div>
          <h3 className="font-tech text-2xl font-black text-white uppercase tracking-wide">
            {title}
          </h3>
          <div className="flex items-center gap-4 mt-1 font-tech font-bold text-sm">
            <span className="text-emerald-400">+₦{nairaReward.toLocaleString()} NAIRA CASH</span>
            <span className="text-amber-300">+{xpReward} XP</span>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="ml-4 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-tech font-bold text-xs uppercase cursor-pointer"
        >
          CLAIM
        </button>
      </div>
    </div>
  );
};
