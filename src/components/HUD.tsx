/**
 * Tactical Combat & Lagos Life HUD Overlay
 * LAGOS SURVIVAL: BLOCK WAR
 */

import React, { useState } from 'react';
import {
  Shield,
  Heart,
  Zap,
  Utensils,
  Crosshair,
  Compass,
  Radio,
  Car,
  Hammer,
  Eye,
  Sliders,
  Award,
  Gamepad2,
} from 'lucide-react';
import { WeaponStats, CameraMode, StoryMission, KillFeedEntry } from '../types/game';

interface HUDProps {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  stamina: number;
  hunger: number;
  energy: number;
  naira: number;
  activeWeapon: WeaponStats;
  weapons: WeaponStats[];
  currentWeaponIndex: number;
  cameraMode: CameraMode;
  isBuildMode: boolean;
  isAiming: boolean;
  isReloading: boolean;
  interactionPrompt: string | null;
  activeMission?: StoryMission;
  killFeed: KillFeedEntry[];
  hitmarkerActive: boolean;
  isHeadshot: boolean;
  showJoystick?: boolean;
  onSelectWeapon: (idx: number) => void;
  onToggleCamera: () => void;
  onToggleBuild: () => void;
  onOpenInventory: () => void;
  onOpenPause: () => void;
  onToggleJoystick?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  health,
  maxHealth,
  armor,
  maxArmor,
  stamina,
  hunger,
  energy,
  naira,
  activeWeapon,
  weapons,
  currentWeaponIndex,
  cameraMode,
  isBuildMode,
  isAiming,
  isReloading,
  interactionPrompt,
  activeMission,
  killFeed,
  hitmarkerActive,
  isHeadshot,
  showJoystick = true,
  onSelectWeapon,
  onToggleCamera,
  onToggleBuild,
  onOpenInventory,
  onOpenPause,
  onToggleJoystick,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
      {/* --- TOP ROW --- */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: Player Stats & Lagos Currency ₦ */}
        <div className="flex flex-col gap-2">
          {/* Currency Card */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-950/80 border border-amber-500/30 backdrop-blur-md shadow-lg pointer-events-auto">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-tech font-bold text-amber-400 text-lg">
              ₦
            </div>
            <div>
              <div className="text-[10px] font-tech text-amber-300 font-semibold uppercase tracking-widest">
                LAGOS NAIRA CASH
              </div>
              <div className="font-tech text-xl font-bold text-white tracking-wide">
                ₦{naira.toLocaleString()}
              </div>
            </div>
          </div>

          {/* District Location Tag */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/70 border border-zinc-800 text-xs font-tech text-zinc-300">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold uppercase tracking-wider">
              {activeMission ? activeMission.district : 'EKO MAINLAND • SECTOR 01'}
            </span>
          </div>
        </div>

        {/* Top-Right: Active Story Objective & Killfeed */}
        <div className="flex flex-col items-end gap-3 max-w-sm">
          {/* Active Objective Tracker */}
          {activeMission && (
            <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/90 backdrop-blur-md w-full shadow-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[10px] font-tech font-bold tracking-widest text-amber-400 uppercase">
                  ACTIVE MISSION: {activeMission.title}
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-medium">
                {activeMission.objectives.find((o) => !o.completed)?.description || 'All objectives completed!'}
              </p>
            </div>
          )}

          {/* Tactical Killfeed */}
          <div className="flex flex-col gap-1 items-end">
            {killFeed.map((kf) => (
              <div
                key={kf.id}
                className="px-3 py-1 rounded bg-black/70 border border-red-500/30 text-xs font-tech flex items-center gap-2 animate-fade-in"
              >
                <span className="text-emerald-400 font-bold">{kf.killer}</span>
                <span className="text-zinc-500 text-[10px]">[{kf.weapon}]</span>
                <span className="text-red-400 font-semibold">{kf.victim}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- CENTER: RETICLE, HITMARKER & INTERACTION PROMPT --- */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* Tactical Crosshair / Aim Reticle */}
        {!isBuildMode && (
          <div className="relative flex items-center justify-center">
            {isAiming ? (
              // Precise ADS Optic Dot / Reticle
              <div className="relative flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                <div className="absolute w-12 h-12 rounded-full border border-red-500/40" />
                <div className="absolute w-20 h-0.5 bg-red-500/30" />
                <div className="absolute h-20 w-0.5 bg-red-500/30" />
              </div>
            ) : (
              // Standard Hipfire Tactical Crosshair
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute w-1.5 h-1.5 bg-white/80 rounded-full" />
                <div className="absolute top-0 w-0.5 h-2 bg-white/70" />
                <div className="absolute bottom-0 w-0.5 h-2 bg-white/70" />
                <div className="absolute left-0 h-0.5 w-2 bg-white/70" />
                <div className="absolute right-0 h-0.5 w-2 bg-white/70" />
              </div>
            )}

            {/* Hitmarker Confirmation Flash */}
            {hitmarkerActive && (
              <div className="absolute w-8 h-8 pointer-events-none">
                <div
                  className={`absolute inset-0 border-2 transform rotate-45 ${
                    isHeadshot ? 'border-red-500 scale-125' : 'border-amber-400'
                  }`}
                />
              </div>
            )}
          </div>
        )}

        {/* Dynamic Interaction Prompt (e.g. Enter Danfo Bus / Speak to Vendor) */}
        {interactionPrompt && (
          <div className="mt-20 px-5 py-2.5 rounded-xl bg-amber-500/90 text-black font-tech font-bold text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(245,158,11,0.6)] backdrop-blur-md animate-bounce pointer-events-auto">
            {interactionPrompt}
          </div>
        )}
      </div>

      {/* --- BOTTOM ROW: TACTICAL HUD DOCK --- */}
      <div className="w-full flex flex-col items-center gap-3">
        {/* Unified Bottom Bar (Vitals, Quickslots, Ammo) */}
        <div className="w-full max-w-4xl flex items-end justify-between gap-4 pointer-events-auto">
          {/* Left: Vitals & Survival Gauges (Health, Armor, Stamina, Hunger) */}
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-zinc-950/85 border border-zinc-800 backdrop-blur-md min-w-[240px] shadow-2xl">
            {/* Health Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-tech">
                <span className="flex items-center gap-1.5 text-red-400 font-bold">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  HEALTH
                </span>
                <span className="text-white font-bold">{Math.round(health)} / {maxHealth}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200"
                  style={{ width: `${(health / maxHealth) * 100}%` }}
                />
              </div>
            </div>

            {/* Armor Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-tech">
                <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                  <Shield className="w-3.5 h-3.5 fill-current" />
                  ARMOR
                </span>
                <span className="text-white font-bold">{Math.round(armor)} / {maxArmor}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-200"
                  style={{ width: `${(armor / maxArmor) * 100}%` }}
                />
              </div>
            </div>

            {/* Stamina & Hunger Mini-bars */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/80">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-tech text-amber-300">
                  <span className="flex items-center gap-1"><Zap className="w-2.5 h-2.5" /> STAMINA</span>
                  <span>{Math.round(stamina)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${stamina}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-tech text-emerald-300">
                  <span className="flex items-center gap-1"><Utensils className="w-2.5 h-2.5" /> HUNGER</span>
                  <span>{Math.round(hunger)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${hunger}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Center: Tactical Quick Controls Dock (1-5 Weapons, Build, Camera) */}
          <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-zinc-950/85 border border-zinc-800 backdrop-blur-md shadow-2xl">
            {/* Quickslot 1 to 5 */}
            {weapons.slice(0, 5).map((w, idx) => (
              <button
                key={w.id}
                onClick={() => onSelectWeapon(idx)}
                className={`relative px-3 py-2 rounded-xl flex flex-col items-center border transition-all cursor-pointer ${
                  currentWeaponIndex === idx
                    ? 'border-amber-400 bg-amber-500/20 text-white font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <span className="text-[10px] font-tech text-amber-400 font-bold absolute top-1 left-1.5">
                  {idx + 1}
                </span>
                <Crosshair className="w-4 h-4 mt-2.5" />
                <span className="text-[9px] font-tech truncate max-w-[60px] mt-1">{w.name.split(' ')[0]}</span>
              </button>
            ))}

            <div className="w-[1px] h-10 bg-zinc-800 mx-1" />

            {/* Build Mode Toggle Button */}
            <button
              onClick={onToggleBuild}
              className={`px-3 py-2 rounded-xl flex flex-col items-center border transition-all cursor-pointer ${
                isBuildMode
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
              }`}
              title="Toggle Building Mode (B)"
            >
              <span className="text-[10px] font-tech text-emerald-400 font-bold">B</span>
              <Hammer className="w-4 h-4 mt-1" />
              <span className="text-[9px] font-tech mt-1">BUILD</span>
            </button>

            {/* Camera View Switch (First Person / Third Person) */}
            <button
              onClick={onToggleCamera}
              className="px-3 py-2 rounded-xl flex flex-col items-center border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white cursor-pointer"
              title="Toggle Camera View (V)"
            >
              <span className="text-[10px] font-tech text-blue-400 font-bold">V</span>
              <Eye className="w-4 h-4 mt-1" />
              <span className="text-[9px] font-tech mt-1">{cameraMode === 'first_person' ? '1ST' : '3RD'}</span>
            </button>

            {/* Inventory & Pause */}
            <button
              onClick={onOpenInventory}
              className="px-3 py-2 rounded-xl flex flex-col items-center border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white cursor-pointer"
              title="Open Inventory (Tab)"
            >
              <span className="text-[10px] font-tech text-purple-400 font-bold">TAB</span>
              <Sliders className="w-4 h-4 mt-1" />
              <span className="text-[9px] font-tech mt-1">ITEMS</span>
            </button>

            {/* Virtual Joystick Toggle Button */}
            {onToggleJoystick && (
              <button
                onClick={onToggleJoystick}
                className={`px-3 py-2 rounded-xl flex flex-col items-center border transition-all cursor-pointer ${
                  showJoystick
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                }`}
                title="Toggle Virtual Joystick"
              >
                <span className="text-[10px] font-tech text-amber-400 font-bold">JOY</span>
                <Gamepad2 className="w-4 h-4 mt-1" />
                <span className="text-[9px] font-tech mt-1">{showJoystick ? 'ON' : 'OFF'}</span>
              </button>
            )}
          </div>

          {/* Right: Weapon Ammunition Counter (Call of Duty Style) */}
          <div className="flex flex-col items-end p-3.5 rounded-2xl bg-zinc-950/85 border border-zinc-800 backdrop-blur-md min-w-[200px] shadow-2xl">
            <div className="text-[11px] font-tech text-amber-400 font-bold uppercase tracking-wider">
              {activeWeapon.name}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-tech text-4xl font-extrabold text-white tracking-tight">
                {activeWeapon.currentMag}
              </span>
              <span className="font-tech text-xl font-bold text-zinc-500">
                / {activeWeapon.reserveAmmo}
              </span>
            </div>
            <div className="text-[10px] font-tech text-zinc-400 mt-0.5">
              {isReloading ? (
                <span className="text-amber-400 font-bold animate-pulse">RELOADING...</span>
              ) : (
                'PRESS [R] TO RELOAD'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
