/**
 * LAGOS SURVIVAL: BLOCK WAR
 * Master Application & State Controller
 */

import React, { useState, useEffect, useRef } from 'react';
import { TitleCinematicScreen } from './components/TitleCinematicScreen';
import { CharacterCreator } from './components/CharacterCreator';
import { HUD } from './components/HUD';
import { BuildingOverlay } from './components/BuildingOverlay';
import { ShopModal } from './components/ShopModal';
import { InventoryModal } from './components/InventoryModal';
import { MultiplayerModal } from './components/MultiplayerModal';
import { PauseSettingsModal } from './components/PauseSettingsModal';
import { MobileControls } from './components/MobileControls';
import { MissionCompleteBanner } from './components/MissionCompleteBanner';

import { LagosGameEngine } from './game/LagosGameEngine';
import {
  GameMode,
  CharacterAppearance,
  WeaponStats,
  StoryMission,
  WeatherType,
  ShopItem,
  KillFeedEntry,
} from './types/game';
import { STORY_MISSIONS } from './game/systems/EconomyAndMissions';
import { WEAPON_CATALOG } from './game/models/weapons';
import { soundManager } from './audio/SoundManager';

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>('cinematic_intro');
  const [appearance, setAppearance] = useState<CharacterAppearance>(() => {
    const saved = localStorage.getItem('lagos_character_appearance');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
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
  });

  // Game Engine & 3D Canvas ref
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<LagosGameEngine | null>(null);

  // HUD & Survival State
  const [health, setHealth] = useState(100);
  const [armor, setArmor] = useState(50);
  const [stamina, setStamina] = useState(100);
  const [hunger, setHunger] = useState(85);
  const [energy, setEnergy] = useState(90);
  const [naira, setNaira] = useState(() => {
    const saved = localStorage.getItem('lagos_cash_naira');
    return saved ? parseInt(saved, 10) : 5000;
  });

  // Weapon & Combat State
  const [weapons, setWeapons] = useState<WeaponStats[]>(JSON.parse(JSON.stringify(WEAPON_CATALOG)));
  const [currentWeaponIndex, setCurrentWeaponIndex] = useState(0);
  const [resources, setResources] = useState({ wood: 100, metal: 120, concrete: 80 });
  const [isBuildMode, setIsBuildMode] = useState(false);
  const [selectedBuildIndex, setSelectedBuildIndex] = useState(0);
  const [cameraMode, setCameraMode] = useState<'first_person' | 'third_person'>('third_person');
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [showJoystick, setShowJoystick] = useState(true);

  // Modals & Popups
  const [shopOpen, setShopOpen] = useState<'suya' | 'armory' | null>(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [multiplayerOpen, setMultiplayerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Notifications & Hits
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [hitmarkerActive, setHitmarkerActive] = useState(false);
  const [isHeadshot, setIsHeadshot] = useState(false);
  const [rewardBanner, setRewardBanner] = useState<{ title: string; naira: number; xp: number } | null>(null);
  const [killFeed, setKillFeed] = useState<KillFeedEntry[]>([]);
  const [missions, setMissions] = useState<StoryMission[]>(STORY_MISSIONS);
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);

  // Initialize or teardown 3D Game Engine when entering/leaving playable mode
  const isPlayingGame = gameMode !== 'cinematic_intro' && gameMode !== 'character_creator';

  useEffect(() => {
    if (!isPlayingGame) {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
      return;
    }

    if (!canvasMountRef.current) return;
    const container = canvasMountRef.current;

    // Start 3D Game Engine
    const engine = new LagosGameEngine(container, appearance, {
      onHealthChange: (h, a) => {
        setHealth(h);
        setArmor(a);
      },
      onAmmoChange: (mag, res) => {
        setWeapons((prev) => {
          const next = [...prev];
          next[engine.currentWeaponIndex].currentMag = mag;
          next[engine.currentWeaponIndex].reserveAmmo = res;
          return next;
        });
      },
      onStaminaChange: (s) => setStamina(s),
      onHungerChange: (hun, nrg) => {
        setHunger(hun);
        setEnergy(nrg);
      },
      onInteractPrompt: (prompt) => setInteractionPrompt(prompt),
      onHitmarker: (headshot) => {
        setIsHeadshot(headshot);
        setHitmarkerActive(true);
        setTimeout(() => setHitmarkerActive(false), 120);
      },
      onEnemyDefeated: (enemyName, reward) => {
        setNaira((prev) => {
          const updated = prev + reward;
          localStorage.setItem('lagos_cash_naira', updated.toString());
          return updated;
        });
        setRewardBanner({
          title: `ELIMINATED ${enemyName.toUpperCase()}`,
          naira: reward,
          xp: 150,
        });

        // Update active mission count if applicable
        setMissions((prev) => {
          const next = [...prev];
          const curMiss = next[currentMissionIndex];
          const obj = curMiss.objectives.find((o) => o.targetCount && (o.currentCount || 0) < o.targetCount);
          if (obj) {
            obj.currentCount = (obj.currentCount || 0) + 1;
            if (obj.currentCount >= (obj.targetCount || 1)) {
              obj.completed = true;
              setRewardBanner({
                title: `${curMiss.title.toUpperCase()} OBJECTIVE COMPLETE!`,
                naira: curMiss.rewardNaira,
                xp: curMiss.rewardXP,
              });
            }
          }
          return next;
        });
      },
      onOpenShop: (type) => setShopOpen(type),
      onResourcesChange: (res) => setResources({ ...res }),
    });

    engineRef.current = engine;

    // Sync multiplayer kills and scores
    engine.multiplayer.onKillFeedUpdate = (entry) => {
      setKillFeed((prev) => [entry, ...prev].slice(0, 5));
    };

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [isPlayingGame]);

  // Click on game canvas to capture pointer lock
  const handleCanvasClick = () => {
    if (engineRef.current && !shopOpen && !inventoryOpen && !multiplayerOpen && !settingsOpen) {
      engineRef.current.requestPointerLock();
    }
  };

  const handleSelectWeapon = (idx: number) => {
    setCurrentWeaponIndex(idx);
    if (engineRef.current) {
      engineRef.current.selectWeapon(idx);
    }
  };

  const handleToggleCamera = () => {
    if (engineRef.current) {
      const nextMode = cameraMode === 'first_person' ? 'third_person' : 'first_person';
      setCameraMode(nextMode);
      engineRef.current.physics.cameraMode = nextMode;
      soundManager.playUIClick();
    }
  };

  const handleToggleBuild = () => {
    if (engineRef.current) {
      const nextState = !isBuildMode;
      setIsBuildMode(nextState);
      engineRef.current.isBuildMode = nextState;
      soundManager.playUIClick(nextState);
    }
  };

  const handleBuyItem = (item: ShopItem): boolean => {
    if (naira < item.price) return false;

    setNaira((prev) => {
      const updated = prev - item.price;
      localStorage.setItem('lagos_cash_naira', updated.toString());
      return updated;
    });

    // Apply item effects immediately
    if (item.effect?.health) setHealth((h) => Math.min(100, h + item.effect!.health!));
    if (item.effect?.armor) setArmor((a) => Math.min(100, a + item.effect!.armor!));
    if (item.effect?.hunger) setHunger((hun) => Math.min(100, hun + item.effect!.hunger!));
    if (item.effect?.energy) setEnergy((e) => Math.min(100, e + item.effect!.energy!));
    if (item.effect?.ammo && engineRef.current) {
      const cur = engineRef.current.weapons[currentWeaponIndex];
      cur.reserveAmmo += item.effect.ammo;
      setWeapons([...engineRef.current.weapons]);
    }
    if (item.id === 'resource_bundle') {
      setResources((r) => ({
        wood: r.wood + 60,
        metal: r.metal + 60,
        concrete: r.concrete + 40,
      }));
      if (engineRef.current) {
        engineRef.current.resources.wood += 60;
        engineRef.current.resources.metal += 60;
        engineRef.current.resources.concrete += 40;
      }
    }

    return true;
  };

  const handleCraftItem = (recipeId: string): boolean => {
    if (!engineRef.current) return false;
    soundManager.playBuildPlacement();

    if (recipeId === 'craft_ammo_rifle') {
      setResources((r) => ({ ...r, metal: r.metal - 30 }));
      engineRef.current.resources.metal -= 30;
      engineRef.current.weapons[0].reserveAmmo += 60;
      setWeapons([...engineRef.current.weapons]);
    } else if (recipeId === 'craft_ammo_smg') {
      setResources((r) => ({ ...r, metal: r.metal - 25 }));
      engineRef.current.resources.metal -= 25;
      engineRef.current.weapons[1].reserveAmmo += 90;
      setWeapons([...engineRef.current.weapons]);
    } else if (recipeId === 'craft_armor_plate') {
      setResources((r) => ({ ...r, metal: r.metal - 45, concrete: r.concrete - 15 }));
      engineRef.current.resources.metal -= 45;
      engineRef.current.resources.concrete -= 15;
      setArmor((a) => Math.min(100, a + 50));
    } else if (recipeId === 'craft_medkit') {
      setResources((r) => ({ ...r, wood: r.wood - 15, metal: r.metal - 15 }));
      engineRef.current.resources.wood -= 15;
      engineRef.current.resources.metal -= 15;
      setHealth((h) => Math.min(100, h + 50));
    }
    return true;
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black text-white select-none">
      {/* 1. CINEMATIC TITLE SCREEN */}
      {gameMode === 'cinematic_intro' && (
        <TitleCinematicScreen
          onSelectMode={(mode) => setGameMode(mode)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      {/* 2. CHARACTER CREATOR */}
      {gameMode === 'character_creator' && (
        <CharacterCreator
          initialAppearance={appearance}
          onSaveAndEnter={(savedApp) => {
            setAppearance(savedApp);
            setGameMode('free_roam');
          }}
          onCancel={() => setGameMode('cinematic_intro')}
        />
      )}

      {/* 3. PLAYABLE 3D OPEN WORLD GAME */}
      {isPlayingGame && (
        <div className="relative w-full h-full" onClick={handleCanvasClick}>
          {/* Isolated 3D Canvas Mount */}
          <div ref={canvasMountRef} className="absolute inset-0 z-0 cursor-crosshair" />

          {/* Tactical HUD Overlay */}
          <HUD
            health={health}
            maxHealth={100}
            armor={armor}
            maxArmor={100}
            stamina={stamina}
            hunger={hunger}
            energy={energy}
            naira={naira}
            activeWeapon={weapons[currentWeaponIndex]}
            weapons={weapons}
            currentWeaponIndex={currentWeaponIndex}
            cameraMode={cameraMode}
            isBuildMode={isBuildMode}
            isAiming={engineRef.current?.physics.isAiming || false}
            isReloading={engineRef.current?.combat.isReloading || false}
            interactionPrompt={interactionPrompt}
            activeMission={missions[currentMissionIndex]}
            killFeed={killFeed}
            hitmarkerActive={hitmarkerActive}
            isHeadshot={isHeadshot}
            showJoystick={showJoystick}
            onSelectWeapon={handleSelectWeapon}
            onToggleCamera={handleToggleCamera}
            onToggleBuild={handleToggleBuild}
            onOpenInventory={() => setInventoryOpen(true)}
            onOpenPause={() => setSettingsOpen(true)}
            onToggleJoystick={() => setShowJoystick((prev) => !prev)}
          />

          {/* Building Mode Palette */}
          {isBuildMode && (
            <BuildingOverlay
              selectedIndex={selectedBuildIndex}
              resources={resources}
              onSelectPiece={(idx) => {
                setSelectedBuildIndex(idx);
                if (engineRef.current) engineRef.current.selectedBuildingIndex = idx;
              }}
              onRotate={() => {
                if (engineRef.current) engineRef.current.buildingRotation += Math.PI / 2;
              }}
              onClose={handleToggleBuild}
            />
          )}

          {/* Mobile Touch Controls Overlay with Analog Joystick */}
          {engineRef.current && (
            <MobileControls
              inputs={engineRef.current.inputs}
              isVisible={showJoystick}
              onFireDown={() => {
                if (engineRef.current) {
                  if (isBuildMode) engineRef.current.placeBuilding();
                  else engineRef.current.inputs.fire = true;
                }
              }}
              onFireUp={() => {
                if (engineRef.current) engineRef.current.inputs.fire = false;
              }}
              onAimToggle={() => {
                if (engineRef.current) engineRef.current.inputs.aim = !engineRef.current.inputs.aim;
              }}
              onJump={() => {
                if (engineRef.current) engineRef.current.inputs.jump = true;
                setTimeout(() => {
                  if (engineRef.current) engineRef.current.inputs.jump = false;
                }, 150);
              }}
              onInteract={() => {
                if (engineRef.current) engineRef.current.triggerInteract();
              }}
              onReload={() => {
                if (engineRef.current) engineRef.current.inputs.reload = true;
                setTimeout(() => {
                  if (engineRef.current) engineRef.current.inputs.reload = false;
                }, 150);
              }}
              onToggleCamera={handleToggleCamera}
              onToggleBuild={handleToggleBuild}
            />
          )}

          {/* Mission Success Celebration Banner */}
          {rewardBanner && (
            <MissionCompleteBanner
              title={rewardBanner.title}
              nairaReward={rewardBanner.naira}
              xpReward={rewardBanner.xp}
              onDismiss={() => setRewardBanner(null)}
            />
          )}
        </div>
      )}

      {/* --- MODAL OVERLAYS --- */}
      {/* Shop Modal */}
      {shopOpen && (
        <ShopModal
          shopType={shopOpen}
          naira={naira}
          onBuyItem={handleBuyItem}
          onClose={() => setShopOpen(null)}
        />
      )}

      {/* Inventory & Crafting Modal */}
      {inventoryOpen && (
        <InventoryModal
          weapons={weapons}
          activeWeaponIndex={currentWeaponIndex}
          resources={resources}
          onSelectWeapon={handleSelectWeapon}
          onCraftItem={handleCraftItem}
          onClose={() => setInventoryOpen(false)}
        />
      )}

      {/* Multiplayer Matchmaking Modal */}
      {multiplayerOpen && (
        <MultiplayerModal
          currentRoom={engineRef.current?.multiplayer.roomCode || 'LAGOS-MAIN'}
          selectedTeam={engineRef.current?.multiplayer.localTeam || 'blue'}
          scores={engineRef.current?.multiplayer.teamScores || { red: 0, blue: 0 }}
          onJoinRoom={(code, team) => {
            if (engineRef.current) {
              engineRef.current.multiplayer.roomCode = code;
              engineRef.current.multiplayer.localTeam = team;
            }
            setMultiplayerOpen(false);
          }}
          onClose={() => setMultiplayerOpen(false)}
        />
      )}

      {/* Pause & Settings Modal */}
      {settingsOpen && (
        <PauseSettingsModal
          weather={weather}
          onSetWeather={(w) => {
            setWeather(w);
            if (engineRef.current) engineRef.current.setWeather(w);
          }}
          onSetGraphics={(q) => {
            if (engineRef.current) engineRef.current.setGraphicsQuality(q);
          }}
          onResume={() => setSettingsOpen(false)}
          onReturnToTitle={() => {
            setSettingsOpen(false);
            setGameMode('cinematic_intro');
          }}
        />
      )}
    </main>
  );
}
