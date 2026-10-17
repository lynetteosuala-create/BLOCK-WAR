/**
 * Tactical Inventory & Survival Crafting Modal
 * LAGOS SURVIVAL: BLOCK WAR
 */

import React, { useState } from 'react';
import { X, Shield, Crosshair, Wrench, Package, Hammer, Zap, Heart, Check } from 'lucide-react';
import { WeaponStats } from '../types/game';
import { soundManager } from '../audio/SoundManager';

interface InventoryModalProps {
  weapons: WeaponStats[];
  activeWeaponIndex: number;
  resources: { wood: number; metal: number; concrete: number };
  onSelectWeapon: (idx: number) => void;
  onCraftItem: (recipeId: string) => boolean;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  weapons,
  activeWeaponIndex,
  resources,
  onSelectWeapon,
  onCraftItem,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'weapons' | 'crafting' | 'resources'>('weapons');

  const CRAFT_RECIPES = [
    {
      id: 'craft_ammo_rifle',
      name: '5.56mm Ammunition Batch (+60 Rds)',
      desc: 'Pressed brass ammunition casing filled with propellant gunpowder.',
      cost: { wood: 0, metal: 30, concrete: 0 },
      reward: '60 Rifle Rounds',
    },
    {
      id: 'craft_ammo_smg',
      name: '9mm Parabellum Batch (+90 Rds)',
      desc: 'High rate of fire submachine gun rounds.',
      cost: { wood: 0, metal: 25, concrete: 0 },
      reward: '90 SMG Rounds',
    },
    {
      id: 'craft_armor_plate',
      name: 'Ballistic Armor Plate (+50 Armor)',
      desc: 'Tempered steel plate insert for tactical vest.',
      cost: { wood: 0, metal: 45, concrete: 15 },
      reward: '+50 Armor',
    },
    {
      id: 'craft_medkit',
      name: 'Emergency Field Dressing (+50 Health)',
      desc: 'Sterile tourniquet and pain relief shot.',
      cost: { wood: 15, metal: 15, concrete: 0 },
      reward: '+50 Health',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-amber-400" />
            <h2 className="font-tech text-2xl font-bold text-white tracking-wide uppercase">
              TACTICAL INVENTORY & CRAFTING
            </h2>
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

        {/* Category Tabs */}
        <div className="flex border-b border-zinc-800 px-6 pt-3 gap-2 bg-zinc-950/60">
          {[
            { id: 'weapons', label: 'Weapons Arsenal' },
            { id: 'crafting', label: 'Survival Workbench' },
            { id: 'resources', label: 'Raw Resources' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                soundManager.playUIClick();
              }}
              className={`pb-3 px-4 font-tech text-sm font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-300 font-bold'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* WEAPONS TAB */}
          {activeTab === 'weapons' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {weapons.map((w, idx) => {
                const isActive = activeWeaponIndex === idx;
                return (
                  <div
                    key={w.id}
                    onClick={() => {
                      soundManager.playUIClick();
                      onSelectWeapon(idx);
                    }}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-tech text-base font-bold text-white">{w.name}</span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-tech font-bold uppercase">
                            EQUIPPED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mb-3">{w.description}</p>
                      
                      {/* Weapon Stats */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-tech text-zinc-300">
                        <div>DMG: <span className="text-white font-bold">{w.damage}</span></div>
                        <div>MAG: <span className="text-white font-bold">{w.magazineSize}</span></div>
                        <div>RPM: <span className="text-white font-bold">{w.fireRate * 60}</span></div>
                        <div>RANGE: <span className="text-white font-bold">{w.range}m</span></div>
                      </div>
                    </div>

                    <button
                      className={`mt-4 w-full py-2 rounded-lg font-tech font-bold text-xs uppercase tracking-wider ${
                        isActive ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {isActive ? 'CURRENT LOADOUT' : 'EQUIP WEAPON'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* CRAFTING TAB */}
          {activeTab === 'crafting' && (
            <div className="space-y-4">
              {CRAFT_RECIPES.map((rec) => {
                const canCraft =
                  resources.wood >= rec.cost.wood &&
                  resources.metal >= rec.cost.metal &&
                  resources.concrete >= rec.cost.concrete;

                return (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-amber-400" />
                        <h3 className="font-tech text-base font-bold text-white">{rec.name}</h3>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{rec.desc}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs font-tech text-zinc-400">
                        <span>Costs:</span>
                        {rec.cost.wood > 0 && <span className="text-amber-400">Wood {rec.cost.wood}</span>}
                        {rec.cost.metal > 0 && <span className="text-blue-400">Metal {rec.cost.metal}</span>}
                        {rec.cost.concrete > 0 && <span className="text-zinc-300">Concrete {rec.cost.concrete}</span>}
                      </div>
                    </div>

                    <button
                      disabled={!canCraft}
                      onClick={() => {
                        if (canCraft) {
                          onCraftItem(rec.id);
                        }
                      }}
                      className={`px-5 py-2.5 rounded-xl font-tech font-bold text-xs uppercase tracking-wider cursor-pointer transition-all ${
                        canCraft
                          ? 'bg-amber-500 text-black hover:bg-yellow-400 shadow-md'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      {canCraft ? 'CRAFT ITEM' : 'NEED MATERIALS'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* RESOURCES TAB */}
          {activeTab === 'resources' && (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                <div className="text-xs font-tech text-amber-400 font-bold uppercase mb-2">TIMBER WOOD</div>
                <div className="font-tech text-4xl font-extrabold text-white">{resources.wood}</div>
                <p className="text-[11px] text-zinc-500 mt-2">Scavenged from market stalls & pallets</p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                <div className="text-xs font-tech text-blue-400 font-bold uppercase mb-2">SCRAP STEEL</div>
                <div className="font-tech text-4xl font-extrabold text-white">{resources.metal}</div>
                <p className="text-[11px] text-zinc-500 mt-2">Recovered from vehicles and container yards</p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                <div className="text-xs font-tech text-zinc-300 font-bold uppercase mb-2">CONCRETE BLOCKS</div>
                <div className="font-tech text-4xl font-extrabold text-white">{resources.concrete}</div>
                <p className="text-[11px] text-zinc-500 mt-2">High density construction aggregates</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end">
          <button
            onClick={() => {
              soundManager.playUIClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-tech font-semibold text-sm uppercase transition-all cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
