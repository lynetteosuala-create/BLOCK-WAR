/**
 * Nigerian Market Vendor & Canteen Dialog Component
 * Supports Mama Ngozi's Suya & Jollof Buka and Chidi's Tactical Armory
 */

import React from 'react';
import { X, Utensils, Shield, Crosshair, HeartPulse, Hammer, Coffee, Check, ShoppingBag } from 'lucide-react';
import { ShopItem } from '../types/game';
import { MAMA_NGOZI_SHOP, CHIDI_ARMORY_SHOP } from '../game/systems/EconomyAndMissions';
import { soundManager } from '../audio/SoundManager';

interface ShopModalProps {
  shopType: 'suya' | 'armory';
  naira: number;
  onBuyItem: (item: ShopItem) => boolean;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  shopType,
  naira,
  onBuyItem,
  onClose,
}) => {
  const isSuya = shopType === 'suya';
  const items = isSuya ? MAMA_NGOZI_SHOP : CHIDI_ARMORY_SHOP;

  const title = isSuya ? "MAMA NGOZI'S SUYA & JOLLOF BUKA" : "CHIDI'S EKO DEFENSE ARMORY";
  const subtitle = isSuya
    ? '"Hot peppered beef, fresh jollof rice, and chilled zobo. Eat and gain strength!"'
    : '"Authorized high-caliber ammunition, ballistic plates, and tactical gear."';

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Beef':
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-purple-400" />;
      case 'Crosshair':
      case 'Zap':
        return <Crosshair className="w-5 h-5 text-amber-400" />;
      case 'Shield':
      case 'ShieldCheck':
        return <Shield className="w-5 h-5 text-blue-400" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-red-400" />;
      default:
        return <Hammer className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-xs font-tech text-amber-400 font-bold uppercase tracking-widest">
                {isSuya ? 'OSHODI FOOD MARKET' : 'SECTOR 04 WEAPONS SUPPLY'}
              </span>
            </div>
            <h2 className="font-tech text-2xl font-bold text-white tracking-wide uppercase">
              {title}
            </h2>
            <p className="text-xs text-zinc-400 mt-1 italic font-tech">
              {subtitle}
            </p>
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

        {/* Currency Bar */}
        <div className="px-6 py-3 bg-zinc-950/60 border-b border-zinc-800 flex items-center justify-between text-xs font-tech">
          <span className="text-zinc-400 font-semibold uppercase">YOUR CASH BALANCE:</span>
          <span className="text-amber-400 font-bold text-base">₦{naira.toLocaleString()}</span>
        </div>

        {/* Inventory Items Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
          {items.map((item) => {
            const canAfford = naira >= item.price;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  canAfford
                    ? 'border-zinc-800 bg-zinc-950/80 hover:border-amber-500/50'
                    : 'border-zinc-900 bg-zinc-950/40 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                      {renderIcon(item.icon)}
                    </div>
                    <span className="font-tech text-base font-bold text-amber-400">
                      ₦{item.price.toLocaleString()}
                    </span>
                  </div>

                  <h3 className="font-tech text-base font-bold text-white mb-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <button
                  disabled={!canAfford}
                  onClick={() => {
                    if (canAfford) {
                      soundManager.playUIClick(true);
                      onBuyItem(item);
                    }
                  }}
                  className={`mt-4 w-full py-2.5 rounded-lg font-tech font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    canAfford
                      ? 'bg-amber-500 text-black hover:bg-yellow-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{canAfford ? 'PURCHASE' : 'INSUFFICIENT NAIRA'}</span>
                </button>
              </div>
            );
          })}
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
            RETURN TO STREETS
          </button>
        </div>
      </div>
    </div>
  );
};
