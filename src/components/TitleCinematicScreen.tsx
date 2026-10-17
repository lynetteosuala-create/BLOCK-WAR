/**
 * Cinematic Opening Screen for LAGOS SURVIVAL: BLOCK WAR
 * Features 3D Lagos skyline background, moving yellow Danfo buses,
 * exact two-line slogan, sound effects, and main navigation buttons.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, UserCheck, ShieldAlert, Users, Settings as SettingsIcon, Volume2, VolumeX, Sun, Sunset, Moon, CloudRain } from 'lucide-react';
import { GameMode, WeatherType } from '../types/game';
import { soundManager } from '../audio/SoundManager';
import { TextureGenerator } from '../game/procedural/textures';
import { VehicleModelBuilder } from '../game/models/vehicles';

interface TitleCinematicScreenProps {
  onSelectMode: (mode: GameMode) => void;
  onOpenSettings: () => void;
}

export const TitleCinematicScreen: React.FC<TitleCinematicScreenProps> = ({
  onSelectMode,
  onOpenSettings,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [activeWeather, setActiveWeather] = useState<WeatherType>('golden_hour');

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // --- CINEMATIC 3D BACKGROUND SCENE ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf97316, 0.006);

    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 800);
    camera.position.set(0, 18, 55);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Warm Golden Hour Sky Lighting
    const hemiLight = new THREE.HemisphereLight(0xfdba74, 0x1e293b, 0.7);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xf97316, 2.4);
    sunLight.position.set(40, 60, 40);
    scene.add(sunLight);

    // Lagoon Water Plane
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(500, 300),
      new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.1, metalness: 0.5 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -1;
    scene.add(water);

    // Suspension Bridge Deck
    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(18, 1.2, 300),
      new THREE.MeshStandardMaterial({ map: TextureGenerator.getRoadTexture(), roughness: 0.8 })
    );
    bridge.position.set(0, 4, 0);
    scene.add(bridge);

    // Lekki-Ikoyi Bridge Suspension Pylons
    const pylonMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const pylonL = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.0, 50, 8), pylonMat);
    pylonL.position.set(-10, 25, 0);
    pylonL.rotation.z = -0.12;
    const pylonR = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.0, 50, 8), pylonMat);
    pylonR.position.set(10, 25, 0);
    pylonR.rotation.z = 0.12;
    scene.add(pylonL, pylonR);

    // Marina High-Rises in Background
    const buildTower = (x: number, z: number, h: number, w: number, color: number) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, w),
        new THREE.MeshStandardMaterial({
          color,
          map: TextureGenerator.getSkyscraperWindowsTexture(true),
          metalness: 0.5,
          roughness: 0.3,
        })
      );
      mesh.position.set(x, h / 2 - 1, z);
      scene.add(mesh);
    };

    buildTower(-55, -80, 110, 26, 0x1e293b);
    buildTower(-85, -70, 140, 32, 0x0f172a);
    buildTower(55, -80, 95, 24, 0x1e3a8a);
    buildTower(85, -70, 125, 28, 0x1e293b);
    buildTower(-30, -110, 160, 36, 0x0f172a);
    buildTower(30, -110, 150, 34, 0x1e293b);

    // Moving Yellow Danfo Buses across the bridge
    const danfos: THREE.Group[] = [];
    for (let i = 0; i < 3; i++) {
      const danfo = VehicleModelBuilder.buildDanfoBus();
      danfo.position.set(4, 4.6, -60 + i * 50);
      scene.add(danfo);
      danfos.push(danfo);
    }

    // Moving Traffic (opposite lane)
    const oncomingBikes: THREE.Group[] = [];
    for (let i = 0; i < 2; i++) {
      const bike = VehicleModelBuilder.buildOkadaMotorcycle();
      bike.position.set(-4, 4.6, 60 - i * 65);
      bike.rotation.y = Math.PI;
      scene.add(bike);
      oncomingBikes.push(bike);
    }

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Slow sweeping cinematic camera
      camera.position.x = Math.sin(time * 0.15) * 8;
      camera.position.y = 17 + Math.cos(time * 0.18) * 2;
      camera.lookAt(0, 12, -20);

      // Move Danfo buses forward
      danfos.forEach((bus) => {
        bus.position.z += 16 * delta;
        if (bus.position.z > 80) {
          bus.position.z = -120;
        }
      });

      // Move Oncoming traffic
      oncomingBikes.forEach((bike) => {
        bike.position.z -= 22 * delta;
        if (bike.position.z < -120) {
          bike.position.z = 80;
        }
      });

      renderer.render(scene, camera);
    };

    render();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleStartMusic = () => {
    soundManager.startBackgroundMusic();
  };

  const handleToggleSound = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      soundManager.setVolumes(0, 0, 0, 0);
    } else {
      soundManager.setVolumes(0.8, 0.9, 0.5, 0.4);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-black">
      {/* 3D Cinematic Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Cinematic Vignette & Ambient Light Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/80 pointer-events-none z-10" />

      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-amber-500 transform rotate-45" />
          <span className="font-tech text-xs tracking-widest text-amber-400 font-semibold uppercase">
            LAGOS SECTOR 01 • BROAD STREET RUNNER
          </span>
        </div>

        {/* Audio & Atmosphere Toggles */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSound}
            className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-zinc-300 hover:text-amber-400 hover:border-amber-500/50 transition-all cursor-pointer"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Central Dramatic Title & Slogan Section */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center mt-[-30px]">
        {/* Sub-badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 mb-3 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="font-tech text-xs font-bold tracking-widest text-amber-300 uppercase">
            3D OPEN WORLD SURVIVAL & TACTICAL ACTION
          </span>
        </div>

        {/* Exact Game Title */}
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white uppercase drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
          LAGOS SURVIVAL
          <span className="block text-amber-400 tracking-wider text-5xl sm:text-6xl md:text-7xl lg:text-8xl mt-[-10px] tactical-glow">
            BLOCK WAR
          </span>
        </h1>

        {/* Exact Two-Line Slogan: Large, stylish, dramatic, readable */}
        <div className="mt-4 max-w-2xl px-4 py-2 border-y border-amber-500/30 bg-black/40 backdrop-blur-md">
          <p className="font-tech text-lg sm:text-xl md:text-2xl text-amber-200/90 font-semibold tracking-wide leading-relaxed">
            "Survive the streets. Dominate the battlefield.
            <br />
            Build your empire. Become a Lagos legend."
          </p>
        </div>

        {/* Interactive Main Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full max-w-xl">
          {/* PLAY NOW */}
          <button
            onClick={() => {
              soundManager.playUIClick(true);
              handleStartMusic();
              onSelectMode('free_roam');
            }}
            className="w-full sm:flex-1 group relative overflow-hidden px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-tech font-bold text-lg tracking-wider uppercase transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] cursor-pointer"
          >
            <div className="flex items-center justify-center gap-3">
              <Play className="w-5 h-5 fill-current" />
              <span>PLAY NOW</span>
            </div>
          </button>

          {/* CREATE YOUR CHARACTER */}
          <button
            onClick={() => {
              soundManager.playUIClick();
              onSelectMode('character_creator');
            }}
            className="w-full sm:flex-1 px-8 py-4 rounded-xl bg-zinc-900/90 border border-zinc-700 text-white font-tech font-semibold text-lg tracking-wider uppercase transition-all duration-300 hover:border-amber-400 hover:bg-zinc-800/90 hover:text-amber-300 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-3">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <span>CUSTOMIZE</span>
            </div>
          </button>
        </div>

        {/* Secondary Mode Navigation Buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 max-w-2xl">
          {/* STORY MODE */}
          <button
            onClick={() => {
              soundManager.playUIClick();
              handleStartMusic();
              onSelectMode('story');
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-300 font-tech text-sm tracking-wider uppercase hover:border-amber-500/50 hover:text-white transition-all cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>STORY MODE</span>
          </button>

          {/* MULTIPLAYER */}
          <button
            onClick={() => {
              soundManager.playUIClick();
              handleStartMusic();
              onSelectMode('multiplayer');
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-300 font-tech text-sm tracking-wider uppercase hover:border-amber-500/50 hover:text-white transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>MULTIPLAYER</span>
          </button>

          {/* SURVIVAL / FREE BUILD */}
          <button
            onClick={() => {
              soundManager.playUIClick();
              handleStartMusic();
              onSelectMode('survival');
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-300 font-tech text-sm tracking-wider uppercase hover:border-amber-500/50 hover:text-white transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>SURVIVAL DEFENSE</span>
          </button>

          {/* SETTINGS */}
          <button
            onClick={() => {
              soundManager.playUIClick();
              onOpenSettings();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-300 font-tech text-sm tracking-wider uppercase hover:border-amber-500/50 hover:text-white transition-all cursor-pointer"
          >
            <SettingsIcon className="w-4 h-4 text-zinc-400" />
            <span>SETTINGS</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-between px-8 text-xs font-tech text-zinc-500">
        <div>NIGERIAN 3D ACTION • DANFO TRANSPORT • BLOCK SURVIVAL</div>
        <div className="flex items-center gap-2">
          <span>WASD MOVE</span>
          <span>•</span>
          <span>CLICK FIRE</span>
          <span>•</span>
          <span>E ENTER DANFO / SHOP</span>
          <span>•</span>
          <span>B BUILD</span>
        </div>
      </div>
    </div>
  );
};
