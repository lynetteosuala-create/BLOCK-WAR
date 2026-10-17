/**
 * Master 3D Game Engine Controller for LAGOS SURVIVAL: BLOCK WAR
 * Coordinates Three.js scene, PBR lighting, physics, combat, AI, vehicles, and building.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CharacterAppearance,
  WeaponStats,
  BuildingPiece,
  PlacedBuilding,
  Vehicle,
  WeatherType,
  CameraMode,
  GameMode,
} from '../types/game';
import { LagosCityBuilder, CityCollider } from './models/city';
import { CharacterModelBuilder, CharacterRig } from './models/character';
import { VehicleModelBuilder } from './models/vehicles';
import { WeaponModelBuilder, WEAPON_CATALOG } from './models/weapons';
import { ConstructionBuilder, BUILDING_CATALOG } from './models/construction';
import { PhysicsAndMovement, InputState } from './systems/PhysicsAndMovement';
import { CombatSystem, HitResult } from './systems/CombatSystem';
import { AISystem } from './systems/AISystem';
import { MultiplayerSystem } from './systems/MultiplayerSystem';
import { soundManager } from '../audio/SoundManager';

export interface GameEngineCallbacks {
  onHealthChange: (health: number, armor: number) => void;
  onAmmoChange: (mag: number, reserve: number) => void;
  onStaminaChange: (stamina: number) => void;
  onHungerChange: (hunger: number, energy: number) => void;
  onInteractPrompt: (prompt: string | null, targetType?: string) => void;
  onHitmarker: (isHeadshot: boolean, damage: number) => void;
  onEnemyDefeated: (enemyName: string, rewardNaira: number) => void;
  onOpenShop: (shopType: 'suya' | 'armory') => void;
  onResourcesChange: (resources: { wood: number; metal: number; concrete: number }) => void;
}

export class LagosGameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private pmremGenerator: THREE.PMREMGenerator;

  // Systems
  public physics: PhysicsAndMovement;
  public combat: CombatSystem;
  public ai: AISystem;
  public multiplayer: MultiplayerSystem;

  // Visual Assets & Nodes
  private playerRig: CharacterRig | null = null;
  private fpWeaponGroup: THREE.Group | null = null;
  private vehicles: { data: Vehicle; mesh: THREE.Group }[] = [];
  private colliders: CityCollider[] = [];
  private placedBuildings: { data: PlacedBuilding; mesh: THREE.Group }[] = [];
  private buildingPreviewMesh: THREE.Group | null = null;

  // Environment & Lighting
  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private rainParticles: THREE.Points | null = null;
  public currentWeather: WeatherType = 'sunny';

  // Game & Weapon State
  public currentWeaponIndex = 0;
  public weapons: WeaponStats[] = JSON.parse(JSON.stringify(WEAPON_CATALOG));
  public resources = { wood: 100, metal: 120, concrete: 80 };
  public isBuildMode = false;
  public selectedBuildingIndex = 0;
  public buildingRotation = 0;

  // Survival attributes
  public health = 100;
  public maxHealth = 100;
  public armor = 50;
  public maxArmor = 100;
  public stamina = 100;
  public maxStamina = 100;
  public hunger = 80;
  public energy = 90;

  // Loop & Input
  private isRunning = false;
  private clock = new THREE.Clock();
  public inputs: InputState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
    crouch: false,
    interact: false,
    reload: false,
    aim: false,
    fire: false,
    toggleCamera: false,
    toggleBuild: false,
    toggleInventory: false,
    horn: false,
    slot1: false,
    slot2: false,
    slot3: false,
    slot4: false,
    slot5: false,
    mouseXDelta: 0,
    mouseYDelta: 0,
  };

  private callbacks: GameEngineCallbacks;
  private currentNearbyInteraction: { type: 'suya' | 'armory' | 'vehicle' | 'scrap'; data?: any } | null = null;

  constructor(container: HTMLElement, appearance: CharacterAppearance, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x94a3b8, 0.0035);

    this.camera = new THREE.PerspectiveCamera(72, container.clientWidth / container.clientHeight, 0.1, 1000);

    // 2. Renderer setup with high physical fidelity
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 3. Studio Environment Reflection (RoomEnvironment)
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    // 4. Lighting Rig
    this.hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x1e293b, 0.65);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    this.sunLight.position.set(60, 100, 50);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 300;
    const d = 120;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // 5. Initialize Subsystems
    this.physics = new PhysicsAndMovement();
    this.combat = new CombatSystem(this.scene);
    this.ai = new AISystem(this.scene);
    this.multiplayer = new MultiplayerSystem(this.scene);

    // 6. Build Lagos Open World
    const world = LagosCityBuilder.buildLagosWorld();
    this.scene.add(world.sceneGroup);
    this.colliders = world.colliders;

    // 7. Spawn Vehicles
    this.spawnVehicles(world.spawnPoints);

    // 8. Spawn Player 3D Character Rig
    this.setupPlayer(appearance);

    // 9. Initialize NPCs and Hostiles
    this.ai.initWorldNPCs();

    // 10. Hook combat hits & callbacks
    this.setupCombatListeners();

    // 11. Event listeners
    this.bindEvents();

    // 12. Start animation loop
    this.isRunning = true;
    this.animate();
  }

  /**
   * Spawns drivable vehicles
   */
  private spawnVehicles(spawns: { danfoBus: THREE.Vector3; okada: THREE.Vector3 }) {
    // 1. Signature Yellow Danfo Bus
    const danfoMesh = VehicleModelBuilder.buildDanfoBus();
    danfoMesh.position.copy(spawns.danfoBus);
    this.scene.add(danfoMesh);

    const danfoData: Vehicle = {
      id: 'danfo_01',
      type: 'danfo',
      name: 'Lagos Danfo Express Bus',
      position: [spawns.danfoBus.x, spawns.danfoBus.y, spawns.danfoBus.z],
      rotation: 0,
      speed: 0,
      maxSpeed: 24, // m/s
      acceleration: 12,
      steering: 0,
      health: 600,
      maxHealth: 600,
      fuel: 100,
      isOccupied: false,
    };
    this.vehicles.push({ data: danfoData, mesh: danfoMesh });

    // 2. Okada Motorcycle
    const okadaMesh = VehicleModelBuilder.buildOkadaMotorcycle();
    okadaMesh.position.copy(spawns.okada);
    this.scene.add(okadaMesh);

    const okadaData: Vehicle = {
      id: 'okada_01',
      type: 'okada',
      name: 'Eko Commercial Okada',
      position: [spawns.okada.x, spawns.okada.y, spawns.okada.z],
      rotation: 0.4,
      speed: 0,
      maxSpeed: 30,
      acceleration: 18,
      steering: 0,
      health: 250,
      maxHealth: 250,
      fuel: 100,
      isOccupied: false,
    };
    this.vehicles.push({ data: okadaData, mesh: okadaMesh });
  }

  /**
   * Builds player character rig and first-person weapon model
   */
  public setupPlayer(appearance: CharacterAppearance) {
    if (this.playerRig) {
      this.scene.remove(this.playerRig.root);
      this.playerRig.dispose();
    }

    this.playerRig = CharacterModelBuilder.buildCharacter(appearance);
    this.scene.add(this.playerRig.root);

    // Mount active weapon on player's third-person hand
    this.updateActiveWeaponVisuals();
  }

  /**
   * Updates weapon models on character and first-person camera
   */
  public updateActiveWeaponVisuals() {
    const curWeapon = this.weapons[this.currentWeaponIndex];

    // Third-person character mount
    if (this.playerRig) {
      while (this.playerRig.weaponMount.children.length > 0) {
        this.playerRig.weaponMount.remove(this.playerRig.weaponMount.children[0]);
      }
      const w3d = WeaponModelBuilder.buildWeapon(curWeapon.id);
      this.playerRig.weaponMount.add(w3d.group);
    }

    // First-person camera weapon node
    if (this.fpWeaponGroup) {
      this.camera.remove(this.fpWeaponGroup);
    }

    this.fpWeaponGroup = new THREE.Group();
    const fpW3D = WeaponModelBuilder.buildWeapon(curWeapon.id);
    this.fpWeaponGroup.add(fpW3D.group);
    this.fpWeaponGroup.position.set(0.24, -0.22, -0.45); // Bottom-right tactical weapon view
    this.fpWeaponGroup.scale.set(0.85, 0.85, 0.85);
    this.camera.add(this.fpWeaponGroup);

    this.callbacks.onAmmoChange(curWeapon.currentMag, curWeapon.reserveAmmo);
  }

  /**
   * Sets up combat hits, damage calculations, and loot awards
   */
  private setupCombatListeners() {
    this.combat.onHitCallback = (result: HitResult) => {
      if (result.targetType === 'enemy' && result.targetId) {
        this.callbacks.onHitmarker(result.isHeadshot, result.damage);

        const { defeated, npc } = this.ai.damageNPC(result.targetId, result.damage);
        if (defeated && npc) {
          const reward = 1200 + Math.floor(Math.random() * 800);
          this.callbacks.onEnemyDefeated(npc.name, reward);
          this.multiplayer.broadcastKill(npc.name, this.weapons[this.currentWeaponIndex].name);
        }
      }
    };
  }

  /**
   * Switches weapon slot (0 to 4)
   */
  public selectWeapon(index: number) {
    if (index >= 0 && index < this.weapons.length && index !== this.currentWeaponIndex) {
      this.currentWeaponIndex = index;
      soundManager.playReload();
      this.updateActiveWeaponVisuals();
    }
  }

  /**
   * Sets weather and lighting
   */
  public setWeather(weather: WeatherType) {
    this.currentWeather = weather;

    if (weather === 'sunny') {
      this.scene.fog = new THREE.FogExp2(0x94a3b8, 0.0035);
      this.sunLight.color.setHex(0xffedd5);
      this.sunLight.intensity = 1.8;
      this.hemiLight.color.setHex(0xbae6fd);
      this.hemiLight.groundColor.setHex(0x1e293b);
      this.renderer.toneMappingExposure = 1.15;
    } else if (weather === 'golden_hour') {
      this.scene.fog = new THREE.FogExp2(0xf97316, 0.0045);
      this.sunLight.color.setHex(0xf97316);
      this.sunLight.intensity = 2.2;
      this.hemiLight.color.setHex(0xfdba74);
      this.hemiLight.groundColor.setHex(0x7c2d12);
      this.renderer.toneMappingExposure = 1.25;
    } else if (weather === 'night') {
      this.scene.fog = new THREE.FogExp2(0x090a0f, 0.0075);
      this.sunLight.color.setHex(0x38bdf8);
      this.sunLight.intensity = 0.35;
      this.hemiLight.color.setHex(0x1e293b);
      this.hemiLight.groundColor.setHex(0x020617);
      this.renderer.toneMappingExposure = 0.85;
    } else if (weather === 'rainstorm') {
      this.scene.fog = new THREE.FogExp2(0x475569, 0.009);
      this.sunLight.color.setHex(0x64748b);
      this.sunLight.intensity = 0.6;
      this.hemiLight.color.setHex(0x334155);
      this.renderer.toneMappingExposure = 0.95;
    }
  }

  /**
   * Sets graphics fidelity (Low / Medium / High)
   */
  public setGraphicsQuality(quality: 'low' | 'medium' | 'high') {
    if (quality === 'low') {
      this.renderer.shadowMap.enabled = false;
      this.renderer.setPixelRatio(1.0);
    } else if (quality === 'medium') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.BasicShadowMap;
      this.renderer.setPixelRatio(1.0);
    } else {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    }
  }

  /**
   * Places a fortification piece when in Building Mode
   */
  public placeBuilding() {
    if (!this.isBuildMode) return;
    const piece = BUILDING_CATALOG[this.selectedBuildingIndex];

    if (
      this.resources.wood < piece.woodCost ||
      this.resources.metal < piece.metalCost ||
      this.resources.concrete < piece.concreteCost
    ) {
      soundManager.playUIClick(false);
      return;
    }

    // Deduct costs
    this.resources.wood -= piece.woodCost;
    this.resources.metal -= piece.metalCost;
    this.resources.concrete -= piece.concreteCost;
    this.callbacks.onResourcesChange(this.resources);

    // Determine grid-snapped placement position
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.physics.yaw);
    const placePos = this.physics.position.clone().addScaledVector(forward, 4.0);
    // Snap to 1.0m grid
    placePos.x = Math.round(placePos.x);
    placePos.z = Math.round(placePos.z);
    placePos.y = 0;

    const mesh = ConstructionBuilder.buildMesh(piece.id);
    mesh.position.copy(placePos);
    mesh.rotation.y = this.buildingRotation;
    this.scene.add(mesh);

    const placedData: PlacedBuilding = {
      id: 'bldg_' + Math.random().toString(36).substring(2, 8),
      type: piece.id,
      position: [placePos.x, placePos.y, placePos.z],
      rotation: this.buildingRotation,
      health: piece.health,
      maxHealth: piece.maxHealth,
    };

    this.placedBuildings.push({ data: placedData, mesh });

    // Add collider
    this.colliders.push({
      min: new THREE.Vector3(placePos.x - piece.dimensions[0] / 2, 0, placePos.z - piece.dimensions[2] / 2),
      max: new THREE.Vector3(placePos.x + piece.dimensions[0] / 2, piece.dimensions[1], placePos.z + piece.dimensions[2] / 2),
      tag: 'player_build',
    });

    soundManager.playBuildPlacement();
  }

  /**
   * Master Animation & Render Loop
   */
  private animate = () => {
    if (!this.isRunning) return;
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // 1. Process slot switches from input
    if (this.inputs.slot1) this.selectWeapon(0);
    if (this.inputs.slot2) this.selectWeapon(1);
    if (this.inputs.slot3) this.selectWeapon(2);
    if (this.inputs.slot4) this.selectWeapon(3);
    if (this.inputs.slot5) this.selectWeapon(4);

    // 2. Physics & Player Movement
    this.physics.update(
      delta,
      this.inputs,
      this.colliders,
      this.stamina,
      (drain) => {
        this.stamina = Math.max(0, this.stamina - drain);
        this.callbacks.onStaminaChange(this.stamina);
      }
    );

    // Regenerate stamina if not sprinting
    if (!this.physics.isSprinting && this.stamina < this.maxStamina) {
      this.stamina = Math.min(this.maxStamina, this.stamina + delta * 18);
      this.callbacks.onStaminaChange(this.stamina);
    }

    // Hunger and energy slow decay
    this.hunger = Math.max(0, this.hunger - delta * 0.05);
    this.energy = Math.max(0, this.energy - delta * 0.03);
    this.callbacks.onHungerChange(this.hunger, this.energy);

    // 3. Sync 3D Player Rig
    if (this.playerRig) {
      // Hide player model in first person or inside vehicle
      this.playerRig.root.visible = this.physics.cameraMode === 'third_person' && !this.physics.currentVehicle;

      this.playerRig.root.position.copy(this.physics.position);
      this.playerRig.root.rotation.y = this.physics.yaw;
      this.playerRig.animate(time, this.physics.currentSpeed, this.physics.isAiming, this.inputs.fire);
    }

    // 4. Update Cameras
    const curWeapon = this.weapons[this.currentWeaponIndex];
    const adsZoom = this.physics.isAiming ? curWeapon.adsZoom : 1.0;
    this.physics.updateCamera(this.camera, adsZoom);

    // First person weapon position sway / recoil
    if (this.fpWeaponGroup) {
      this.fpWeaponGroup.visible = this.physics.cameraMode === 'first_person' && !this.physics.currentVehicle;
      if (this.physics.isAiming) {
        // Center weapon for precise Aim-Down-Sights (ADS)
        this.fpWeaponGroup.position.set(0.0, -0.16, -0.32);
      } else {
        // Natural walking sway
        const swayX = Math.sin(time * 8) * (this.physics.currentSpeed > 1 ? 0.015 : 0.003);
        const swayY = Math.cos(time * 16) * (this.physics.currentSpeed > 1 ? 0.015 : 0.003);
        this.fpWeaponGroup.position.set(0.24 + swayX, -0.22 + swayY, -0.45);
      }
    }

    // 5. Weapon Combat & Firing
    if (this.inputs.fire && !this.isBuildMode && !this.physics.currentVehicle) {
      const forwardDir = new THREE.Vector3();
      this.camera.getWorldDirection(forwardDir);
      const fireOrigin = this.camera.position.clone();

      // Collect target enemies
      const targets = this.ai.entities
        .filter((e) => e.data.isHostile && e.data.state !== 'dead')
        .map((e) => ({
          id: e.data.id,
          type: 'enemy' as const,
          mesh: e.rig.root,
          health: e.data.health,
        }));

      // Environment colliders
      const envMeshes = this.placedBuildings.map((b) => b.mesh);

      const fired = this.combat.fire(curWeapon, fireOrigin, forwardDir, targets, envMeshes);
      if (fired) {
        this.callbacks.onAmmoChange(curWeapon.currentMag, curWeapon.reserveAmmo);
      }
    }

    // Reload check
    if (this.inputs.reload && !this.combat.isReloading) {
      this.combat.reload(curWeapon, () => {
        this.callbacks.onAmmoChange(curWeapon.currentMag, curWeapon.reserveAmmo);
      });
    }

    // 6. Update AI Systems
    this.ai.update(delta, time, this.physics.position, (enemyOrigin, enemyDir) => {
      // Enemy firing back at player
      const dist = enemyOrigin.distanceTo(this.physics.position);
      if (dist < 28 && Math.random() < 0.65) {
        // Player takes damage
        const damage = 12 + Math.floor(Math.random() * 8);
        if (this.armor > 0) {
          const absorbed = Math.min(this.armor, damage * 0.7);
          this.armor -= absorbed;
          this.health -= damage - absorbed;
        } else {
          this.health -= damage;
        }
        this.health = Math.max(0, this.health);
        this.armor = Math.max(0, this.armor);
        this.callbacks.onHealthChange(this.health, this.armor);
        soundManager.playHitmarker(false);
      }
    });

    // 7. Sync Vehicles 3D meshes
    this.vehicles.forEach((v) => {
      v.mesh.position.set(v.data.position[0], v.data.position[1], v.data.position[2]);
      v.mesh.rotation.y = v.data.rotation;
    });

    // 8. Building Holographic Preview
    this.updateBuildingPreview();

    // 9. Interaction checks (Mama Ngozi Buka, Chidi Armory, Danfo Bus)
    this.checkNearbyInteractions();

    // 10. Update Particles & Tracers
    this.combat.update();

    // 11. Multiplayer updates
    this.multiplayer.update(delta, time);
    // Broadcast local state periodically
    if (Math.random() < 0.3) {
      this.multiplayer.broadcastLocalState(
        this.physics.position,
        this.physics.yaw,
        this.physics.pitch,
        curWeapon.id,
        this.inputs.fire,
        this.health,
        {
          name: 'Lagos Agent',
          gender: 'male',
          skinTone: '#4a2c20',
          faceShape: 'chiseled',
          hairStyle: 'tactical_beret',
          hairColor: '#090a0f',
          shirtType: 'tactical_vest',
          shirtColor: '#1e293b',
          pantsType: 'cargo_pants',
          pantsColor: '#0f172a',
          shoesType: 'combat_boots',
          shoesColor: '#090a0f',
          accessories: { sunglasses: true, goldChain: true, tacticalBackpack: true, gloves: true, holster: true },
        }
      );
    }

    // 12. Render Scene
    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Updates holographic building placement preview
   */
  private updateBuildingPreview() {
    if (!this.isBuildMode) {
      if (this.buildingPreviewMesh) {
        this.scene.remove(this.buildingPreviewMesh);
        this.buildingPreviewMesh = null;
      }
      return;
    }

    const piece = BUILDING_CATALOG[this.selectedBuildingIndex];
    if (!this.buildingPreviewMesh) {
      this.buildingPreviewMesh = ConstructionBuilder.buildPreviewMesh(piece);
      this.scene.add(this.buildingPreviewMesh);
    }

    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.physics.yaw);
    const placePos = this.physics.position.clone().addScaledVector(forward, 4.0);
    placePos.x = Math.round(placePos.x);
    placePos.z = Math.round(placePos.z);
    placePos.y = 0;

    this.buildingPreviewMesh.position.copy(placePos);
    this.buildingPreviewMesh.rotation.y = this.buildingRotation;
  }

  /**
   * Checks if player is near interactable points
   */
  private checkNearbyInteractions() {
    const pPos = this.physics.position;

    // Check vehicles
    let nearVehicle: Vehicle | null = null;
    for (const v of this.vehicles) {
      const vPos = new THREE.Vector3(...v.data.position);
      if (pPos.distanceTo(vPos) < 3.8) {
        nearVehicle = v.data;
        break;
      }
    }

    if (this.physics.currentVehicle) {
      this.callbacks.onInteractPrompt('Press [E] to Exit Vehicle', 'vehicle');
      this.currentNearbyInteraction = { type: 'vehicle', data: this.physics.currentVehicle };
      return;
    }

    if (nearVehicle) {
      this.callbacks.onInteractPrompt(`Press [E] to Drive ${nearVehicle.name}`, 'vehicle');
      this.currentNearbyInteraction = { type: 'vehicle', data: nearVehicle };
      return;
    }

    // Mama Ngozi Buka Shop trigger (at [40, 0, -39])
    const bukaPos = new THREE.Vector3(40, 0, -39);
    if (pPos.distanceTo(bukaPos) < 5.0) {
      this.callbacks.onInteractPrompt("Press [E] to open Mama Ngozi's Suya & Jollof Buka", 'suya');
      this.currentNearbyInteraction = { type: 'suya' };
      return;
    }

    // Chidi Armory trigger (at [42, 0, -69])
    const armoryPos = new THREE.Vector3(42, 0, -69);
    if (pPos.distanceTo(armoryPos) < 5.0) {
      this.callbacks.onInteractPrompt("Press [E] to open Chidi's Tactical Defense Armory", 'armory');
      this.currentNearbyInteraction = { type: 'armory' };
      return;
    }

    this.callbacks.onInteractPrompt(null);
    this.currentNearbyInteraction = null;
  }

  /**
   * Trigger interaction on 'E'
   */
  public triggerInteract() {
    if (!this.currentNearbyInteraction) return;

    if (this.currentNearbyInteraction.type === 'vehicle') {
      const entered = this.physics.toggleVehicle(this.currentNearbyInteraction.data);
      if (entered) {
        this.callbacks.onInteractPrompt('Press [E] to Exit Vehicle | [H] Danfo Horn', 'vehicle');
      }
    } else if (this.currentNearbyInteraction.type === 'suya') {
      this.callbacks.onOpenShop('suya');
    } else if (this.currentNearbyInteraction.type === 'armory') {
      this.callbacks.onOpenShop('armory');
    }
  }

  /**
   * Keyboard & Mouse Input Bindings
   */
  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('wheel', this.handleWheel);
    window.addEventListener('resize', this.handleResize);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
        this.inputs.forward = true;
        break;
      case 'KeyS':
        this.inputs.backward = true;
        break;
      case 'KeyA':
        this.inputs.left = true;
        break;
      case 'KeyD':
        this.inputs.right = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.inputs.sprint = true;
        break;
      case 'Space':
        this.inputs.jump = true;
        break;
      case 'KeyC':
        this.inputs.crouch = true;
        break;
      case 'KeyE':
        this.triggerInteract();
        break;
      case 'KeyR':
        if (this.isBuildMode) {
          this.buildingRotation += Math.PI / 2;
        } else {
          this.inputs.reload = true;
        }
        break;
      case 'KeyV':
        // Toggle camera First Person / Third Person
        this.physics.cameraMode = this.physics.cameraMode === 'first_person' ? 'third_person' : 'first_person';
        soundManager.playUIClick();
        break;
      case 'KeyB':
        // Toggle building mode
        this.isBuildMode = !this.isBuildMode;
        soundManager.playUIClick(this.isBuildMode);
        break;
      case 'KeyH':
        this.inputs.horn = true;
        if (this.physics.currentVehicle) {
          soundManager.playDanfoHorn();
        }
        break;
      case 'Digit1':
        this.selectWeapon(0);
        break;
      case 'Digit2':
        this.selectWeapon(1);
        break;
      case 'Digit3':
        this.selectWeapon(2);
        break;
      case 'Digit4':
        this.selectWeapon(3);
        break;
      case 'Digit5':
        this.selectWeapon(4);
        break;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
        this.inputs.forward = false;
        break;
      case 'KeyS':
        this.inputs.backward = false;
        break;
      case 'KeyA':
        this.inputs.left = false;
        break;
      case 'KeyD':
        this.inputs.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.inputs.sprint = false;
        break;
      case 'Space':
        this.inputs.jump = false;
        break;
      case 'KeyC':
        this.inputs.crouch = false;
        break;
      case 'KeyR':
        this.inputs.reload = false;
        break;
      case 'KeyH':
        this.inputs.horn = false;
        break;
    }
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      if (this.isBuildMode) {
        this.placeBuilding();
      } else {
        this.inputs.fire = true;
      }
    } else if (e.button === 2) {
      this.inputs.aim = true;
    }
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (e.button === 0) {
      this.inputs.fire = false;
    } else if (e.button === 2) {
      this.inputs.aim = false;
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    // Standard pointer movement (supports pointer lock or mouse drag)
    if (document.pointerLockElement === this.renderer.domElement || e.buttons > 0) {
      this.inputs.mouseXDelta += e.movementX;
      this.inputs.mouseYDelta += e.movementY;
    }
  };

  private handleWheel = (e: WheelEvent) => {
    if (this.isBuildMode) {
      if (e.deltaY > 0) {
        this.selectedBuildingIndex = (this.selectedBuildingIndex + 1) % BUILDING_CATALOG.length;
      } else {
        this.selectedBuildingIndex = (this.selectedBuildingIndex - 1 + BUILDING_CATALOG.length) % BUILDING_CATALOG.length;
      }
      if (this.buildingPreviewMesh) {
        this.scene.remove(this.buildingPreviewMesh);
        this.buildingPreviewMesh = null;
      }
    }
  };

  private handleResize = () => {
    if (!this.container) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  public requestPointerLock() {
    this.renderer.domElement.requestPointerLock?.();
  }

  public dispose() {
    this.isRunning = false;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('wheel', this.handleWheel);
    window.removeEventListener('resize', this.handleResize);

    this.combat.dispose();
    this.ai.dispose();
    this.multiplayer.dispose();
    this.pmremGenerator.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
