/**
 * Intelligent AI Characters System for LAGOS SURVIVAL: BLOCK WAR
 * Controls civilian pedestrians, interactive Nigerian vendors, and hostile Syndicate militia.
 */

import * as THREE from 'three';
import { NPC, CharacterAppearance } from '../../types/game';
import { CharacterModelBuilder, CharacterRig } from '../models/character';
import { WeaponModelBuilder } from '../models/weapons';
import { soundManager } from '../../audio/SoundManager';

export interface AIEntity {
  data: NPC;
  rig: CharacterRig;
  targetPos: THREE.Vector3;
  patrolPoints: THREE.Vector3[];
  patrolIdx: number;
  lastShootTime: number;
  alertTimer: number;
}

export class AISystem {
  public entities: AIEntity[] = [];

  constructor(private scene: THREE.Scene) {}

  /**
   * Initializes NPCs across the Lagos districts
   */
  public initWorldNPCs() {
    // 1. Mama Ngozi (Suya & Jollof Buka Vendor)
    this.spawnNPC({
      id: 'npc_mama_ngozi',
      name: 'Mama Ngozi',
      type: 'shopkeeper',
      role: 'Suya Buka Host',
      position: [40, 0, -39],
      rotation: Math.PI,
      health: 100,
      maxHealth: 100,
      isHostile: false,
      dialogue: [
        'Welcome to Mama Ngozi Buka! My hot peppered Suya go give you power!',
        'No fighting inside my canteen o! Buy your food and drink chilled Zobo.',
        'You look tired my pikin, take hot Jollof rice and pepper soup!',
      ],
      state: 'idle',
    }, {
      name: 'Mama Ngozi',
      gender: 'female',
      skinTone: '#4a2c20',
      faceShape: 'round',
      hairStyle: 'tactical_beret',
      hairColor: '#18181b',
      shirtType: 'ankara_jacket',
      shirtColor: '#ea580c',
      pantsType: 'denim_jeans',
      pantsColor: '#1e3a8a',
      shoesType: 'tactical_sneakers',
      shoesColor: '#f8fafc',
      accessories: { sunglasses: false, goldChain: true, tacticalBackpack: false, gloves: false, holster: false },
    });

    // 2. Chidi (Defense Armory & Gunsmith)
    this.spawnNPC({
      id: 'npc_chidi',
      name: 'Chidi Armory',
      type: 'shopkeeper',
      role: 'Eko Weapons Specialist',
      position: [42, 0, -69],
      rotation: Math.PI,
      health: 150,
      maxHealth: 150,
      isHostile: false,
      dialogue: [
        'Greetings soldier! Quality NATO-spec ammunition and body armor right here.',
        'The Syndicate boys dey gather near the containers. Upgrade your AR-24!',
        'Stock up on high-caliber rounds before you enter the block war.',
      ],
      state: 'idle',
    }, {
      name: 'Chidi',
      gender: 'male',
      skinTone: '#3b2219',
      faceShape: 'chiseled',
      hairStyle: 'buzz',
      hairColor: '#090a0f',
      shirtType: 'combat_shirt',
      shirtColor: '#334155',
      pantsType: 'military_fatigues',
      pantsColor: '#1e293b',
      shoesType: 'combat_boots',
      shoesColor: '#090a0f',
      accessories: { sunglasses: true, goldChain: false, tacticalBackpack: false, gloves: true, holster: true },
    });

    // 3. Alhaji Danfo Driver (Transport Lead)
    this.spawnNPC({
      id: 'npc_alhaji',
      name: 'Alhaji Danfo',
      type: 'quest_giver',
      role: 'Lagos Transport Union Chief',
      position: [62, 0, -38],
      rotation: 0,
      health: 120,
      maxHealth: 120,
      isHostile: false,
      dialogue: [
        'Oga! Danfo express ready. Deliver passengers to CMS and earn ₦4,500!',
        'Drive carefully with my yellow bus o! Police dey checkpoint for bridge.',
        'Lagos hustle no easy, but fast drivers make real money today.',
      ],
      state: 'idle',
    }, {
      name: 'Alhaji Danfo',
      gender: 'male',
      skinTone: '#5c3826',
      faceShape: 'square',
      hairStyle: 'cap',
      hairColor: '#18181b',
      shirtType: 'streetwear_hoodie',
      shirtColor: '#facc15', // Danfo yellow hoodie
      pantsType: 'cargo_pants',
      pantsColor: '#18181b',
      shoesType: 'high_tops',
      shoesColor: '#facc15',
      accessories: { sunglasses: true, goldChain: true, tacticalBackpack: false, gloves: false, holster: false },
    });

    // 4. Hostile Syndicate Mercenaries (Container Base Patrols)
    const enemySpawns: [number, number, number][] = [
      [-32, 0, 15],
      [-42, 0, 28],
      [-26, 0, 34],
      [-48, 0, 18],
    ];

    enemySpawns.forEach(([x, y, z], idx) => {
      this.spawnNPC({
        id: `enemy_syndicate_${idx}`,
        name: `Syndicate Merc #${idx + 1}`,
        type: 'enemy',
        role: 'Armed Militant',
        position: [x, y, z],
        rotation: Math.random() * Math.PI * 2,
        health: 100,
        maxHealth: 100,
        isHostile: true,
        weapon: 'eko_viper',
        state: 'patrol',
      }, {
        name: `Syndicate #${idx + 1}`,
        gender: 'male',
        skinTone: '#4a2c20',
        faceShape: 'sharp',
        hairStyle: 'balaclava',
        hairColor: '#090a0f',
        shirtType: 'tactical_vest',
        shirtColor: '#7f1d1d', // Hostile dark red tactical theme
        pantsType: 'military_fatigues',
        pantsColor: '#1e293b',
        shoesType: 'combat_boots',
        shoesColor: '#09090b',
        accessories: { sunglasses: false, goldChain: false, tacticalBackpack: true, gloves: true, holster: true },
      }, [
        new THREE.Vector3(x + 6, 0, z + 6),
        new THREE.Vector3(x - 6, 0, z - 6),
        new THREE.Vector3(x, 0, z),
      ]);
    });

    // 5. Civilian Pedestrians walking the Sidewalks
    const civSpawns = [
      { pos: [-15, 0, -30], name: 'Babatunde' },
      { pos: [15, 0, -10], name: 'Chioma' },
      { pos: [15, 0, 25], name: 'Emeka' },
    ];

    civSpawns.forEach((civ, idx) => {
      this.spawnNPC({
        id: `civ_${idx}`,
        name: civ.name,
        type: 'civilian',
        role: 'Lagos Resident',
        position: [civ.pos[0], civ.pos[1], civ.pos[2]],
        rotation: 0,
        health: 80,
        maxHealth: 80,
        isHostile: false,
        dialogue: [
          'How far my brother? Lagos hot today!',
          'Make you take am easy with all those weapons o!',
          'I just want reach Oshodi buy bread and eggs.',
        ],
        state: 'walking',
      }, {
        name: civ.name,
        gender: idx % 2 === 0 ? 'male' : 'female',
        skinTone: '#5c3826',
        faceShape: 'round',
        hairStyle: idx % 2 === 0 ? 'fade' : 'cornrows',
        hairColor: '#090a0f',
        shirtType: 'streetwear_hoodie',
        shirtColor: idx % 2 === 0 ? '#0284c7' : '#db2777',
        pantsType: 'denim_jeans',
        pantsColor: '#1e293b',
        shoesType: 'high_tops',
        shoesColor: '#ffffff',
        accessories: { sunglasses: false, goldChain: false, tacticalBackpack: false, gloves: false, holster: false },
      }, [
        new THREE.Vector3(civ.pos[0], 0, civ.pos[2] + 40),
        new THREE.Vector3(civ.pos[0], 0, civ.pos[2] - 40),
      ]);
    });
  }

  /**
   * Spawns an individual NPC into the 3D scene
   */
  public spawnNPC(
    data: NPC,
    appearance: CharacterAppearance,
    patrolPoints: THREE.Vector3[] = []
  ): AIEntity {
    const rig = CharacterModelBuilder.buildCharacter(appearance);
    rig.root.position.set(data.position[0], data.position[1], data.position[2]);
    rig.root.rotation.y = data.rotation;

    // Attach weapon model if armed
    if (data.weapon) {
      const weapon3D = WeaponModelBuilder.buildWeapon(data.weapon);
      weapon3D.group.scale.set(0.9, 0.9, 0.9);
      rig.weaponMount.add(weapon3D.group);
    }

    this.scene.add(rig.root);

    const entity: AIEntity = {
      data,
      rig,
      targetPos: patrolPoints.length > 0 ? patrolPoints[0].clone() : new THREE.Vector3(...data.position),
      patrolPoints,
      patrolIdx: 0,
      lastShootTime: 0,
      alertTimer: 0,
    };

    this.entities.push(entity);
    return entity;
  }

  /**
   * Updates all AI behaviors (patrol, alert detection, attack, animations)
   */
  public update(
    delta: number,
    time: number,
    playerPos: THREE.Vector3,
    onEnemyFire?: (origin: THREE.Vector3, dir: THREE.Vector3) => void
  ) {
    this.entities.forEach((ent) => {
      if (ent.data.state === 'dead') return;

      const pos = ent.rig.root.position;
      const distToPlayer = pos.distanceTo(playerPos);

      if (ent.data.isHostile) {
        // Hostile Syndicate Combat AI
        if (distToPlayer < 24) {
          // Alerted: engage player
          ent.data.state = 'combat';

          // Turn towards player
          const lookDir = new THREE.Vector3().subVectors(playerPos, pos);
          lookDir.y = 0;
          ent.rig.root.rotation.y = Math.atan2(lookDir.x, lookDir.z);

          // Animate aiming
          ent.rig.animate(time, 0.2, true, false);

          // Attack player in bursts
          const now = performance.now();
          if (now - ent.lastShootTime > 1400) {
            ent.lastShootTime = now;
            soundManager.playGunshot('assault_rifle');
            if (onEnemyFire) {
              const fireOrigin = pos.clone().add(new THREE.Vector3(0, 1.4, 0));
              const fireDir = new THREE.Vector3().subVectors(playerPos, fireOrigin).normalize();
              onEnemyFire(fireOrigin, fireDir);
            }
          }

          // Advance towards player if too far
          if (distToPlayer > 8) {
            lookDir.normalize();
            pos.addScaledVector(lookDir, 2.5 * delta);
          }
        } else {
          // Normal patrol between points
          ent.data.state = 'patrol';
          if (ent.patrolPoints.length > 0) {
            const target = ent.patrolPoints[ent.patrolIdx];
            const toTarget = new THREE.Vector3().subVectors(target, pos);
            toTarget.y = 0;
            const dist = toTarget.length();

            if (dist < 1.0) {
              ent.patrolIdx = (ent.patrolIdx + 1) % ent.patrolPoints.length;
            } else {
              toTarget.normalize();
              ent.rig.root.rotation.y = Math.atan2(toTarget.x, toTarget.z);
              pos.addScaledVector(toTarget, 2.2 * delta);
              ent.rig.animate(time, 1.0, false, false);
            }
          }
        }
      } else if (ent.data.type === 'civilian') {
        // Civilian walking between sidewalk bounds
        if (ent.patrolPoints.length > 0) {
          const target = ent.patrolPoints[ent.patrolIdx];
          const toTarget = new THREE.Vector3().subVectors(target, pos);
          toTarget.y = 0;
          const dist = toTarget.length();

          if (dist < 1.0) {
            ent.patrolIdx = (ent.patrolIdx + 1) % ent.patrolPoints.length;
          } else {
            toTarget.normalize();
            ent.rig.root.rotation.y = Math.atan2(toTarget.x, toTarget.z);
            pos.addScaledVector(toTarget, 1.8 * delta);
            ent.rig.animate(time, 0.8, false, false);
          }
        }
      } else {
        // Idle vendors breathing / greeting
        ent.rig.animate(time, 0, false, false);
      }
    });
  }

  /**
   * Applies damage to an NPC
   */
  public damageNPC(npcId: string, damage: number): { defeated: boolean; npc: NPC | null } {
    const ent = this.entities.find((e) => e.data.id === npcId);
    if (!ent || ent.data.state === 'dead') return { defeated: false, npc: null };

    ent.data.health -= damage;

    if (ent.data.health <= 0) {
      ent.data.health = 0;
      ent.data.state = 'dead';

      // Fall down animation / tip over
      ent.rig.root.rotation.x = Math.PI / 2;
      ent.rig.root.position.y = 0.2;

      // Clean up after 15 seconds
      setTimeout(() => {
        this.scene.remove(ent.rig.root);
        ent.rig.dispose();
      }, 15000);

      return { defeated: true, npc: ent.data };
    }

    return { defeated: false, npc: ent.data };
  }

  public dispose() {
    this.entities.forEach((ent) => {
      this.scene.remove(ent.rig.root);
      ent.rig.dispose();
    });
    this.entities = [];
  }
}
