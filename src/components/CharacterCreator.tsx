/**
 * Interactive 3D Character Creator for LAGOS SURVIVAL: BLOCK WAR
 * Provides full 360-degree rotatable 3D preview, Nigerian skin tones,
 * hairstyles, tactical apparel, streetwear, accessories, and save options.
 */

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Shuffle,
  RotateCcw,
  Save,
  Play,
  Sparkles,
  Shield,
  Glasses,
  Check,
  ChevronRight,
  User,
} from 'lucide-react';
import { CharacterAppearance } from '../types/game';
import { CharacterModelBuilder, CharacterRig } from '../game/models/character';
import { WeaponModelBuilder } from '../game/models/weapons';
import { soundManager } from '../audio/SoundManager';

interface CharacterCreatorProps {
  initialAppearance?: CharacterAppearance;
  onSaveAndEnter: (appearance: CharacterAppearance) => void;
  onCancel: () => void;
}

const SKIN_TONES = [
  { name: 'Dark Ebony', color: '#2a1a12' },
  { name: 'Deep Cocoa', color: '#3b2219' },
  { name: 'Rich Mahogany', color: '#4a2c20' },
  { name: 'Warm Umber', color: '#5c3826' },
  { name: 'Golden Bronze', color: '#7a4b31' },
  { name: 'Caramel Tone', color: '#8d5b3d' },
  { name: 'Almond Honey', color: '#b37d56' },
];

const HAIR_STYLES = [
  { id: 'buzz', label: 'Clean Buzzcut' },
  { id: 'afro', label: 'Natural Afro' },
  { id: 'dreadlocks', label: 'Eko Dreadlocks' },
  { id: 'fade', label: 'Lagos Mid Fade' },
  { id: 'cornrows', label: 'Braided Rows' },
  { id: 'tactical_beret', label: 'Tactical Beret' },
  { id: 'cap', label: 'Snapback Cap' },
  { id: 'balaclava', label: 'Stealth Balaclava' },
];

const SHIRT_TYPES = [
  { id: 'tactical_vest', label: 'Kevlar Tactical Vest' },
  { id: 'streetwear_hoodie', label: 'Lagos Graphic Hoodie' },
  { id: 'ankara_jacket', label: 'Ankara Print Jacket' },
  { id: 'combat_shirt', label: 'Vanguard Combat Shirt' },
  { id: 'camo_tee', label: 'Tactical Camo Tee' },
];

const PANTS_TYPES = [
  { id: 'cargo_pants', label: 'Heavy Duty Cargo' },
  { id: 'military_fatigues', label: 'Tactical Camo Fatigues' },
  { id: 'denim_jeans', label: 'Raw Indigo Denim' },
  { id: 'tactical_shorts', label: 'Combat Tactical Shorts' },
];

const APPAREL_PALETTES = [
  '#1e293b', // Navy Slate
  '#0f172a', // Midnight Black
  '#78350f', // Desert Tan
  '#15803d', // Jungle Camo Green
  '#b91c1c', // Crimson Syndicate
  '#facc15', // Lagos Taxi Yellow
  '#f8fafc', // Clean White
  '#0284c7', // Atlantic Blue
];

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({
  initialAppearance,
  onSaveAndEnter,
  onCancel,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const defaultAppearance: CharacterAppearance = {
    name: 'Agent Adebayo',
    gender: 'male',
    skinTone: '#4a2c20',
    faceShape: 'chiseled',
    hairStyle: 'fade',
    hairColor: '#090a0f',
    shirtType: 'tactical_vest',
    shirtColor: '#1e293b',
    pantsType: 'cargo_pants',
    pantsColor: '#0f172a',
    shoesType: 'combat_boots',
    shoesColor: '#18181b',
    accessories: {
      sunglasses: true,
      goldChain: true,
      tacticalBackpack: true,
      gloves: true,
      holster: true,
    },
  };

  const [appearance, setAppearance] = useState<CharacterAppearance>(() => {
    const saved = localStorage.getItem('lagos_character_appearance');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return initialAppearance || defaultAppearance;
  });

  const [activeTab, setActiveTab] = useState<'body' | 'hair' | 'clothes' | 'gear'>('body');
  const [previewAnim, setPreviewAnim] = useState<'idle' | 'walk' | 'aim'>('idle');

  // Three.js Preview refs
  const rigRef = useRef<CharacterRig | null>(null);
  const rotYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const prevMouseXRef = useRef(0);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Initialize 3D preview scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0f17);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.25, 3.4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Studio 3-Point Lighting
    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.0);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    fillLight.position.set(-3, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfacc15, 1.2);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    const ambient = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.6);
    scene.add(ambient);

    // Circular pedestal platform
    const pedestalGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.15, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.075;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Build Character
    const rig = CharacterModelBuilder.buildCharacter(appearance);
    scene.add(rig.root);
    rigRef.current = rig;

    // Attach sample weapon
    const weapon3D = WeaponModelBuilder.buildWeapon('eko_viper');
    rig.weaponMount.add(weapon3D.group);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Rotate character model
      rig.root.rotation.y = rotYRef.current;

      const isAiming = previewAnim === 'aim';
      const speed = previewAnim === 'walk' ? 1.0 : 0;
      rig.animate(time, speed, isAiming, false);

      renderer.render(scene, camera);
    };

    animate();

    // Mouse drag rotation
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseXRef.current = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const delta = e.clientX - prevMouseXRef.current;
        rotYRef.current += delta * 0.01;
        prevMouseXRef.current = e.clientX;
      }
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      rig.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update 3D preview whenever appearance changes
  useEffect(() => {
    if (rigRef.current) {
      rigRef.current.updateAppearance(appearance);
    }
  }, [appearance]);

  const handleRandomize = () => {
    soundManager.playUIClick();
    const randomSkin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].color;
    const randomHair = HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)].id as any;
    const randomShirt = SHIRT_TYPES[Math.floor(Math.random() * SHIRT_TYPES.length)].id as any;
    const randomPants = PANTS_TYPES[Math.floor(Math.random() * PANTS_TYPES.length)].id as any;
    const randomShirtColor = APPAREL_PALETTES[Math.floor(Math.random() * APPAREL_PALETTES.length)];
    const randomPantsColor = APPAREL_PALETTES[Math.floor(Math.random() * APPAREL_PALETTES.length)];

    setAppearance((prev) => ({
      ...prev,
      skinTone: randomSkin,
      hairStyle: randomHair,
      shirtType: randomShirt,
      shirtColor: randomShirtColor,
      pantsType: randomPants,
      pantsColor: randomPantsColor,
    }));
  };

  const handleSave = () => {
    soundManager.playUIClick(true);
    localStorage.setItem('lagos_character_appearance', JSON.stringify(appearance));
    onSaveAndEnter(appearance);
  };

  return (
    <div className="relative w-full h-full bg-zinc-950 flex flex-col md:flex-row overflow-hidden select-none">
      {/* Left / Center: 3D Preview Canvas */}
      <div className="relative flex-1 h-[50vh] md:h-full bg-gradient-to-b from-zinc-900 to-black">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* 3D Preview Controls Dock */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
          <button
            onClick={() => {
              rotYRef.current -= 0.6;
              soundManager.playUIClick();
            }}
            className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-700 text-zinc-300 hover:text-amber-400 hover:border-amber-500/50 cursor-pointer"
            title="Rotate Left"
          >
            <RotateCw className="w-5 h-5 transform -scale-x-100" />
          </button>
          <button
            onClick={() => {
              rotYRef.current += 0.6;
              soundManager.playUIClick();
            }}
            className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-700 text-zinc-300 hover:text-amber-400 hover:border-amber-500/50 cursor-pointer"
            title="Rotate Right"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          {/* Animation Pose Toggles */}
          <div className="flex bg-zinc-900/90 border border-zinc-700 rounded-lg p-1 ml-2">
            {(['idle', 'walk', 'aim'] as const).map((anim) => (
              <button
                key={anim}
                onClick={() => {
                  setPreviewAnim(anim);
                  soundManager.playUIClick();
                }}
                className={`px-3 py-1 text-xs font-tech font-bold uppercase rounded-md transition-all cursor-pointer ${
                  previewAnim === anim ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {anim}
              </button>
            ))}
          </div>
        </div>

        {/* Drag Hint */}
        <div className="absolute bottom-6 left-6 text-xs font-tech text-zinc-500 pointer-events-none">
          CLICK & DRAG TO ROTATE 360° PREVIEW
        </div>
      </div>

      {/* Right Customization Drawer */}
      <div className="w-full md:w-[460px] h-[50vh] md:h-full bg-zinc-900/95 border-l border-zinc-800 flex flex-col z-20 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="font-tech text-2xl font-bold tracking-wider text-white uppercase flex items-center gap-2">
              <User className="w-6 h-6 text-amber-400" />
              CHARACTER CREATOR
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Design your unique operative for the Lagos Block War</p>
          </div>

          <button
            onClick={handleRandomize}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-tech font-semibold cursor-pointer border border-zinc-700"
            title="Randomize Appearance"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>RANDOM</span>
          </button>
        </div>

        {/* Character Name Input */}
        <div className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/40">
          <label className="text-xs font-tech tracking-wider text-zinc-400 font-semibold block mb-1 uppercase">
            OPERATIVE ALIAS
          </label>
          <input
            type="text"
            value={appearance.name}
            onChange={(e) => setAppearance({ ...appearance, name: e.target.value })}
            maxLength={20}
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-tech font-bold focus:border-amber-400 outline-none text-base"
            placeholder="Enter character name..."
          />
        </div>

        {/* Customization Category Tabs */}
        <div className="flex border-b border-zinc-800 px-6 pt-3 gap-2 overflow-x-auto">
          {[
            { id: 'body', label: 'Skin Tone' },
            { id: 'hair', label: 'Hair & Head' },
            { id: 'clothes', label: 'Tactical Apparel' },
            { id: 'gear', label: 'Accessories' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                soundManager.playUIClick();
              }}
              className={`pb-3 px-3 font-tech text-sm font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-300 font-bold'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. SKIN TONE TAB */}
          {activeTab === 'body' && (
            <div className="space-y-4">
              <label className="text-xs font-tech text-zinc-400 font-semibold uppercase block">
                MELANIN & COMPLEXION
              </label>
              <div className="grid grid-cols-4 gap-3">
                {SKIN_TONES.map((st) => (
                  <button
                    key={st.color}
                    onClick={() => {
                      setAppearance({ ...appearance, skinTone: st.color });
                      soundManager.playUIClick();
                    }}
                    className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                      appearance.skinTone === st.color
                        ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full border-2 border-white/20 mb-2"
                      style={{ backgroundColor: st.color }}
                    />
                    <span className="text-[11px] font-tech text-zinc-300 text-center leading-tight">
                      {st.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. HAIR & HEAD TAB */}
          {activeTab === 'hair' && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-tech text-zinc-400 font-semibold uppercase block mb-3">
                  HAIRSTYLE & HEADGEAR
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {HAIR_STYLES.map((hs) => (
                    <button
                      key={hs.id}
                      onClick={() => {
                        setAppearance({ ...appearance, hairStyle: hs.id as any });
                        soundManager.playUIClick();
                      }}
                      className={`p-3 rounded-lg border text-left font-tech text-sm transition-all cursor-pointer ${
                        appearance.hairStyle === hs.id
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {hs.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-tech text-zinc-400 font-semibold uppercase block mb-3">
                  HAIR COLOR
                </label>
                <div className="flex gap-2">
                  {['#090a0f', '#2a1a12', '#451a03', '#713f12', '#d97706', '#991b1b'].map((hc) => (
                    <button
                      key={hc}
                      onClick={() => setAppearance({ ...appearance, hairColor: hc })}
                      className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer ${
                        appearance.hairColor === hc ? 'border-amber-400 scale-110' : 'border-zinc-700'
                      }`}
                      style={{ backgroundColor: hc }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. CLOTHING TAB */}
          {activeTab === 'clothes' && (
            <div className="space-y-6">
              {/* Shirts & Vests */}
              <div>
                <label className="text-xs font-tech text-zinc-400 font-semibold uppercase block mb-3">
                  UPPER TORSO & ARMOR
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {SHIRT_TYPES.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        setAppearance({ ...appearance, shirtType: st.id as any });
                        soundManager.playUIClick();
                      }}
                      className={`p-3 rounded-lg border text-left font-tech text-sm transition-all cursor-pointer ${
                        appearance.shirtType === st.id
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* Upper Color Palette */}
                <div className="flex gap-2 mt-3">
                  {APPAREL_PALETTES.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAppearance({ ...appearance, shirtColor: color })}
                      className={`w-8 h-8 rounded-lg border transition-all cursor-pointer ${
                        appearance.shirtColor === color ? 'border-amber-400 scale-110 shadow-md' : 'border-zinc-800'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Pants */}
              <div>
                <label className="text-xs font-tech text-zinc-400 font-semibold uppercase block mb-3">
                  LOWER BODY PANTS
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PANTS_TYPES.map((pt) => (
                    <button
                      key={pt.id}
                      onClick={() => {
                        setAppearance({ ...appearance, pantsType: pt.id as any });
                        soundManager.playUIClick();
                      }}
                      className={`p-2.5 rounded-lg border text-left font-tech text-xs transition-all cursor-pointer ${
                        appearance.pantsType === pt.id
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>

                {/* Pants Color Palette */}
                <div className="flex gap-2 mt-3">
                  {APPAREL_PALETTES.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAppearance({ ...appearance, pantsColor: color })}
                      className={`w-8 h-8 rounded-lg border transition-all cursor-pointer ${
                        appearance.pantsColor === color ? 'border-amber-400 scale-110 shadow-md' : 'border-zinc-800'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. ACCESSORIES TAB */}
          {activeTab === 'gear' && (
            <div className="space-y-3">
              <label className="text-xs font-tech text-zinc-400 font-semibold uppercase block mb-2">
                TACTICAL GEAR & ACCESSORIES
              </label>

              {[
                { key: 'sunglasses', label: 'Tactical Ballistic Glasses' },
                { key: 'goldChain', label: 'Solid Gold Lagos Chain' },
                { key: 'tacticalBackpack', label: 'Assault Rucksack Backpack' },
                { key: 'gloves', label: 'Tactical Combat Gloves' },
                { key: 'holster', label: 'Quick-Draw Thigh Holster' },
              ].map((acc) => {
                const isChecked = (appearance.accessories as any)[acc.key];
                return (
                  <button
                    key={acc.key}
                    onClick={() => {
                      setAppearance({
                        ...appearance,
                        accessories: {
                          ...appearance.accessories,
                          [acc.key]: !isChecked,
                        },
                      });
                      soundManager.playUIClick();
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'border-amber-500/50 bg-amber-500/10 text-white'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="font-tech text-sm font-semibold">{acc.label}</span>
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border ${
                        isChecked ? 'bg-amber-500 border-amber-400 text-black' : 'border-zinc-700 bg-zinc-950'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-950/80 flex items-center gap-3">
          <button
            onClick={() => {
              soundManager.playUIClick();
              onCancel();
            }}
            className="px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 font-tech font-semibold text-sm uppercase hover:text-white hover:border-zinc-600 transition-all cursor-pointer"
          >
            BACK
          </button>

          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-tech font-bold text-base tracking-wider uppercase flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all cursor-pointer"
          >
            <span>SAVE & ENTER LAGOS</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
