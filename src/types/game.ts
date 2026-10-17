/**
 * Core Game Data Types for LAGOS SURVIVAL: BLOCK WAR
 */

export type GameMode = 
  | 'cinematic_intro'
  | 'character_creator'
  | 'story'
  | 'survival'
  | 'team_battle'
  | 'multiplayer'
  | 'free_roam'
  | 'free_build';

export type WeatherType = 'sunny' | 'golden_hour' | 'night' | 'rainstorm';

export type CameraMode = 'first_person' | 'third_person';

export interface CharacterAppearance {
  name: string;
  skinTone: string; // Hex color
  faceShape: 'chiseled' | 'round' | 'square' | 'sharp';
  hairStyle: 'buzz' | 'afro' | 'dreadlocks' | 'fade' | 'cornrows' | 'tactical_beret' | 'cap' | 'balaclava';
  hairColor: string;
  shirtType: 'tactical_vest' | 'streetwear_hoodie' | 'ankara_jacket' | 'combat_shirt' | 'camo_tee';
  shirtColor: string;
  pantsType: 'cargo_pants' | 'military_fatigues' | 'denim_jeans' | 'tactical_shorts';
  pantsColor: string;
  shoesType: 'combat_boots' | 'high_tops' | 'tactical_sneakers';
  shoesColor: string;
  accessories: {
    sunglasses: boolean;
    goldChain: boolean;
    tacticalBackpack: boolean;
    gloves: boolean;
    holster: boolean;
  };
  gender: 'male' | 'female';
}

export interface WeaponStats {
  id: string;
  name: string;
  category: 'assault_rifle' | 'smg' | 'shotgun' | 'sniper' | 'pistol' | 'lmg';
  damage: number;
  fireRate: number; // rounds per second
  magazineSize: number;
  currentMag: number;
  reserveAmmo: number;
  reloadTime: number; // seconds
  range: number;
  recoil: number;
  accuracy: number;
  adsZoom: number; // field of view factor
  color: string;
  unlocked: boolean;
  description: string;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  stamina: number;
  maxStamina: number;
  hunger: number;
  maxHunger: number;
  energy: number;
  maxEnergy: number;
  naira: number; // ₦ Currency
  xp: number;
  level: number;
  reputation: number; // Lagos street rep
}

export interface BuildingPiece {
  id: string;
  name: string;
  category: 'defense' | 'structure' | 'utility';
  woodCost: number;
  metalCost: number;
  concreteCost: number;
  health: number;
  maxHealth: number;
  previewColor: string;
  dimensions: [number, number, number];
  description: string;
}

export interface PlacedBuilding {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: number;
  health: number;
  maxHealth: number;
}

export interface Vehicle {
  id: string;
  type: 'danfo' | 'okada' | 'suv' | 'taxi';
  name: string;
  position: [number, number, number];
  rotation: number;
  speed: number;
  maxSpeed: number;
  acceleration: number;
  steering: number;
  health: number;
  maxHealth: number;
  fuel: number;
  isOccupied: boolean;
  color?: string;
}

export interface NPC {
  id: string;
  name: string;
  type: 'civilian' | 'enemy' | 'shopkeeper' | 'companion' | 'quest_giver';
  role?: string;
  position: [number, number, number];
  rotation: number;
  health: number;
  maxHealth: number;
  isHostile: boolean;
  dialogue?: string[];
  shopItems?: ShopItem[];
  weapon?: string;
  state: 'idle' | 'walking' | 'fleeing' | 'patrol' | 'combat' | 'dead';
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'food' | 'ammo' | 'armor' | 'resource' | 'weapon';
  price: number; // ₦ Naira
  description: string;
  icon: string;
  effect?: {
    health?: number;
    armor?: number;
    hunger?: number;
    energy?: number;
    ammo?: number;
  };
}

export interface StoryMission {
  id: string;
  title: string;
  district: string;
  briefing: string;
  objectives: {
    description: string;
    completed: boolean;
    currentCount?: number;
    targetCount?: number;
    targetCoords?: [number, number, number];
  }[];
  rewardNaira: number;
  rewardXP: number;
  isCompleted: boolean;
  isUnlocked: boolean;
}

export interface MultiplayerPlayer {
  id: string;
  name: string;
  team: 'red' | 'blue'; // Marina Enforcers vs Eko Vanguard
  position: [number, number, number];
  rotation: number;
  pitch: number;
  health: number;
  kills: number;
  deaths: number;
  currentWeapon: string;
  isFiring: boolean;
  appearance: CharacterAppearance;
  lastUpdate: number;
  ping: number;
}

export interface KillFeedEntry {
  id: string;
  killer: string;
  victim: string;
  weapon: string;
  timestamp: number;
}

export interface GameSettings {
  graphicsQuality: 'low' | 'medium' | 'high';
  shadows: boolean;
  postProcessing: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  ambienceVolume: number;
  mouseSensitivity: number;
  fov: number;
}
