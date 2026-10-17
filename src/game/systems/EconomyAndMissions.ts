/**
 * Story Campaign Missions, Economy & Shop Catalog for LAGOS SURVIVAL: BLOCK WAR
 */

import { StoryMission, ShopItem } from '../../types/game';

export const STORY_MISSIONS: StoryMission[] = [
  {
    id: 'mission_1',
    title: 'Arrival at Oshodi',
    district: 'Oshodi Market',
    briefing: 'Welcome to Lagos. Head to Oshodi Broad Market, interact with Mama Ngozi at the Suya Buka, and restore your survival stats with hot Suya.',
    objectives: [
      { description: 'Locate Mama Ngozi Buka in Oshodi Market', completed: false, targetCoords: [40, 0, -38] },
      { description: 'Purchase and eat hot peppered Suya', completed: false },
      { description: 'Speak with Alhaji Danfo at the transport depot', completed: false, targetCoords: [62, 0, -38] },
    ],
    rewardNaira: 3500,
    rewardXP: 250,
    isCompleted: false,
    isUnlocked: true,
  },
  {
    id: 'mission_2',
    title: 'Danfo Hijack Retrieval',
    district: 'Mainland Industrial Base',
    briefing: 'A Syndicate cell has hijacked a vital bullion Danfo bus near the shipping containers. Infiltrate the base, eliminate 3 Syndicate mercenaries, and secure the yellow bus.',
    objectives: [
      { description: 'Infiltrate the container base in South-West', completed: false, targetCoords: [-35, 0, 20] },
      { description: 'Neutralize 3 Syndicate Mercenaries', completed: false, currentCount: 0, targetCount: 3 },
      { description: 'Enter the Yellow Danfo Bus (Press E)', completed: false },
    ],
    rewardNaira: 8000,
    rewardXP: 600,
    isCompleted: false,
    isUnlocked: false,
  },
  {
    id: 'mission_3',
    title: 'Island Siege at Marina',
    district: 'Marina Commercial Island',
    briefing: 'Syndicate snipers have taken positions on Marina skyscrapers overlooking the expressway. Drive across the district and eliminate the sniper threat.',
    objectives: [
      { description: 'Travel to the Marina Commercial Skyscraper plaza', completed: false, targetCoords: [-45, 0, -70] },
      { description: 'Eliminate 4 Syndicate operatives', completed: false, currentCount: 0, targetCount: 4 },
      { description: 'Reach the Marina broadcast antenna', completed: false },
    ],
    rewardNaira: 12500,
    rewardXP: 1000,
    isCompleted: false,
    isUnlocked: false,
  },
  {
    id: 'mission_4',
    title: 'Fortress Victoria',
    district: 'Lekki Bridge Perimeter',
    briefing: 'Prepare for the ultimate Block War. Enter Building Mode (B), construct 3 defensive barricades, and hold the perimeter against an assault wave.',
    objectives: [
      { description: 'Switch to Building Mode (Key B)', completed: false },
      { description: 'Place 3 defensive fortifications', completed: false, currentCount: 0, targetCount: 3 },
      { description: 'Survive the block defense assault', completed: false },
    ],
    rewardNaira: 20000,
    rewardXP: 1800,
    isCompleted: false,
    isUnlocked: false,
  },
];

export const MAMA_NGOZI_SHOP: ShopItem[] = [
  {
    id: 'food_suya',
    name: 'Spicy Beef Suya',
    category: 'food',
    price: 800,
    description: 'Hot skewered beef coated in authentic yaji pepper spice. Restores hunger and health.',
    icon: 'Beef',
    effect: { hunger: 45, health: 30 },
  },
  {
    id: 'food_jollof',
    name: 'Party Jollof Rice & Plantain',
    category: 'food',
    price: 1500,
    description: 'Rich firewood smoky Jollof rice with fried sweet dodo. Fully recharges energy and hunger.',
    icon: 'Utensils',
    effect: { hunger: 85, health: 45, energy: 40 },
  },
  {
    id: 'drink_zobo',
    name: 'Chilled Hibiscus Zobo',
    category: 'food',
    price: 600,
    description: 'Refreshing ginger-infused Nigerian Zobo drink. Recharges stamina and energy.',
    icon: 'Coffee',
    effect: { energy: 60, health: 15 },
  },
];

export const CHIDI_ARMORY_SHOP: ShopItem[] = [
  {
    id: 'ammo_rifle',
    name: '5.56mm NATO Rifle Mag (90 Rds)',
    category: 'ammo',
    price: 2500,
    description: 'High-velocity armor-piercing ammunition for Eko Viper AR-24.',
    icon: 'Crosshair',
    effect: { ammo: 90 },
  },
  {
    id: 'ammo_smg',
    name: '9mm Luger SMG Drum (120 Rds)',
    category: 'ammo',
    price: 2000,
    description: 'Full metal jacket submachine gun rounds for Oshodi Shredder.',
    icon: 'Zap',
    effect: { ammo: 120 },
  },
  {
    id: 'ammo_shotgun',
    name: '12-Gauge Buckshot (32 Rds)',
    category: 'ammo',
    price: 2800,
    description: 'Heavy tactical door-breaching shotgun shells.',
    icon: 'Shield',
    effect: { ammo: 32 },
  },
  {
    id: 'armor_plate',
    name: 'Ceramic Ballistic Plate',
    category: 'armor',
    price: 4500,
    description: 'Level IV body armor plate that absorbs high-caliber rifle hits.',
    icon: 'ShieldCheck',
    effect: { armor: 100 },
  },
  {
    id: 'medkit_tactical',
    name: 'Field Trauma Medkit',
    category: 'food',
    price: 3200,
    description: 'Hemostatic gauze and adrenaline syringe that restores health to full.',
    icon: 'HeartPulse',
    effect: { health: 100 },
  },
  {
    id: 'resource_bundle',
    name: 'Construction Scrap Pack',
    category: 'resource',
    price: 3500,
    description: 'Bundle of 60 Wood, 60 Metal, and 40 Concrete for building fortifications.',
    icon: 'Hammer',
  },
];
