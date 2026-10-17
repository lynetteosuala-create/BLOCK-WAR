/**
 * Procedural Modular 3D Character Model for LAGOS SURVIVAL: BLOCK WAR
 * Generates an articulated 3D character mesh with interchangeable skin tones,
 * hairstyles, tactical and streetwear apparel, and accessories.
 */

import * as THREE from 'three';
import { CharacterAppearance } from '../../types/game';

export interface CharacterRig {
  root: THREE.Group;
  head: THREE.Group;
  torso: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  weaponMount: THREE.Group;
  animate: (time: number, speed: number, isAiming: boolean, isFiring: boolean) => void;
  updateAppearance: (app: CharacterAppearance) => void;
  dispose: () => void;
}

export class CharacterModelBuilder {
  /**
   * Builds an articulated 3D character model
   */
  public static buildCharacter(appearance: CharacterAppearance): CharacterRig {
    const root = new THREE.Group();
    root.name = 'CharacterRoot';

    // Materials dictionary for dynamic updates
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(appearance.skinTone),
      roughness: 0.7,
      metalness: 0.1,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(appearance.hairColor),
      roughness: 0.85,
      metalness: 0.05,
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(appearance.shirtColor),
      roughness: 0.65,
      metalness: 0.1,
    });

    const vestMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1e293b),
      roughness: 0.5,
      metalness: 0.3,
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(appearance.pantsColor),
      roughness: 0.7,
      metalness: 0.05,
    });

    const shoesMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(appearance.shoesColor),
      roughness: 0.8,
      metalness: 0.2,
    });

    const accessoryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd97706), // Gold / bronze
      roughness: 0.2,
      metalness: 0.9,
    });

    const blackGearMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x18181b),
      roughness: 0.4,
      metalness: 0.5,
    });

    // --- TORSO GROUP ---
    const torso = new THREE.Group();
    torso.position.y = 1.05; // Pivot point at pelvis
    root.add(torso);

    // Pelvis
    const pelvisGeo = new THREE.BoxGeometry(0.36, 0.18, 0.22);
    const pelvis = new THREE.Mesh(pelvisGeo, pantsMat);
    pelvis.position.y = 0.05;
    pelvis.castShadow = true;
    torso.add(pelvis);

    // Upper Chest
    const chestGeo = new THREE.BoxGeometry(0.44, 0.45, 0.26);
    const chest = new THREE.Mesh(chestGeo, shirtMat);
    chest.position.y = 0.35;
    chest.castShadow = true;
    torso.add(chest);

    // Tactical Vest Overlay (if tactical shirt/vest)
    const vestGeo = new THREE.BoxGeometry(0.47, 0.42, 0.30);
    const vest = new THREE.Mesh(vestGeo, vestMat);
    vest.position.y = 0.36;
    vest.castShadow = true;
    vest.visible = appearance.shirtType === 'tactical_vest' || appearance.shirtType === 'combat_shirt';
    torso.add(vest);

    // Tactical Pouches on Vest
    const pouchGeo = new THREE.BoxGeometry(0.1, 0.12, 0.06);
    const pouch1 = new THREE.Mesh(pouchGeo, blackGearMat);
    pouch1.position.set(-0.12, 0.3, 0.17);
    const pouch2 = new THREE.Mesh(pouchGeo, blackGearMat);
    pouch2.position.set(0.12, 0.3, 0.17);
    vest.add(pouch1, pouch2);

    // Backpack (if toggled)
    const backpackGeo = new THREE.BoxGeometry(0.34, 0.4, 0.16);
    const backpack = new THREE.Mesh(backpackGeo, blackGearMat);
    backpack.position.set(0, 0.38, -0.21);
    backpack.visible = appearance.accessories.tacticalBackpack;
    torso.add(backpack);

    // Gold Chain (if toggled)
    const chainGeo = new THREE.TorusGeometry(0.12, 0.015, 8, 16);
    const chain = new THREE.Mesh(chainGeo, accessoryMat);
    chain.rotation.x = Math.PI / 3;
    chain.position.set(0, 0.52, 0.08);
    chain.visible = appearance.accessories.goldChain;
    torso.add(chain);

    // --- HEAD GROUP ---
    const head = new THREE.Group();
    head.position.y = 0.62;
    torso.add(head);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.1, 8);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = -0.02;
    head.add(neck);

    // Face / Head
    const headGeo = new THREE.BoxGeometry(0.24, 0.28, 0.24);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.y = 0.14;
    headMesh.castShadow = true;
    head.add(headMesh);

    // Facial features (Stylized sunglasses / visor)
    const glassesGeo = new THREE.BoxGeometry(0.25, 0.06, 0.05);
    const glasses = new THREE.Mesh(glassesGeo, blackGearMat);
    glasses.position.set(0, 0.16, 0.13);
    glasses.visible = appearance.accessories.sunglasses;
    head.add(glasses);

    // Hairstyle / Headgear
    const hairGroup = new THREE.Group();
    hairGroup.position.set(0, 0.2, 0);
    head.add(hairGroup);

    const updateHairMeshes = (style: CharacterAppearance['hairStyle']) => {
      // Clear previous hair
      while (hairGroup.children.length > 0) {
        hairGroup.remove(hairGroup.children[0]);
      }

      if (style === 'afro') {
        const afroGeo = new THREE.SphereGeometry(0.22, 12, 12);
        const afro = new THREE.Mesh(afroGeo, hairMat);
        afro.scale.set(1.1, 0.95, 1.1);
        afro.position.set(0, 0.06, -0.02);
        hairGroup.add(afro);
      } else if (style === 'dreadlocks') {
        const dreadBase = new THREE.BoxGeometry(0.26, 0.12, 0.26);
        const base = new THREE.Mesh(dreadBase, hairMat);
        base.position.y = 0.06;
        hairGroup.add(base);

        // Hanging dread locks
        for (let i = 0; i < 8; i++) {
          const dreadGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.22, 6);
          const dread = new THREE.Mesh(dreadGeo, hairMat);
          const angle = (i / 8) * Math.PI * 2;
          dread.position.set(Math.cos(angle) * 0.12, -0.04, Math.sin(angle) * 0.12);
          dread.rotation.z = Math.cos(angle) * 0.2;
          hairGroup.add(dread);
        }
      } else if (style === 'tactical_beret') {
        const beretGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.08, 12);
        const beret = new THREE.Mesh(beretGeo, new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.8 }));
        beret.position.set(0.04, 0.08, 0.02);
        beret.rotation.z = -0.2;
        hairGroup.add(beret);
      } else if (style === 'cap') {
        const capCrown = new THREE.SphereGeometry(0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const cap = new THREE.Mesh(capCrown, blackGearMat);
        cap.position.y = 0.05;
        const visorGeo = new THREE.BoxGeometry(0.18, 0.02, 0.12);
        const capVisor = new THREE.Mesh(visorGeo, blackGearMat);
        capVisor.position.set(0, 0.04, 0.14);
        hairGroup.add(cap, capVisor);
      } else if (style === 'balaclava') {
        const maskGeo = new THREE.BoxGeometry(0.25, 0.3, 0.25);
        const mask = new THREE.Mesh(maskGeo, blackGearMat);
        mask.position.y = -0.06;
        hairGroup.add(mask);
      } else {
        // Buzz / Fade
        const buzzGeo = new THREE.BoxGeometry(0.25, 0.08, 0.25);
        const buzz = new THREE.Mesh(buzzGeo, hairMat);
        buzz.position.y = 0.06;
        hairGroup.add(buzz);
      }
    };
    updateHairMeshes(appearance.hairStyle);

    // --- ARMS ---
    // Left Arm (Shoulder Pivot)
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.29, 0.52, 0);
    torso.add(leftArm);

    const lUpperArmGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.26, 8);
    const lUpperArm = new THREE.Mesh(lUpperArmGeo, shirtMat);
    lUpperArm.position.y = -0.13;
    leftArm.add(lUpperArm);

    const lForearm = new THREE.Group();
    lForearm.position.y = -0.26;
    leftArm.add(lForearm);

    const lLowerArmGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.24, 8);
    const lLowerArm = new THREE.Mesh(lLowerArmGeo, skinMat);
    lLowerArm.position.y = -0.12;
    lForearm.add(lLowerArm);

    const lHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.09, 0.06),
      appearance.accessories.gloves ? blackGearMat : skinMat
    );
    lHand.position.y = -0.26;
    lForearm.add(lHand);

    // Right Arm (Shoulder Pivot)
    const rightArm = new THREE.Group();
    rightArm.position.set(0.29, 0.52, 0);
    torso.add(rightArm);

    const rUpperArmGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.26, 8);
    const rUpperArm = new THREE.Mesh(rUpperArmGeo, shirtMat);
    rUpperArm.position.y = -0.13;
    rightArm.add(rUpperArm);

    const rForearm = new THREE.Group();
    rForearm.position.y = -0.26;
    rightArm.add(rForearm);

    const rLowerArmGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.24, 8);
    const rLowerArm = new THREE.Mesh(rLowerArmGeo, skinMat);
    rLowerArm.position.y = -0.12;
    rForearm.add(rLowerArm);

    const rHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.09, 0.06),
      appearance.accessories.gloves ? blackGearMat : skinMat
    );
    rHand.position.y = -0.26;
    rForearm.add(rHand);

    // Weapon mount node attached to right hand
    const weaponMount = new THREE.Group();
    weaponMount.name = 'WeaponMount';
    weaponMount.position.set(0, -0.06, 0.06);
    weaponMount.rotation.x = Math.PI / 2;
    rHand.add(weaponMount);

    // --- LEGS ---
    // Left Leg (Hip Pivot)
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.11, -0.04, 0);
    torso.add(leftLeg);

    const lThighGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.44, 8);
    const lThigh = new THREE.Mesh(lThighGeo, pantsMat);
    lThigh.position.y = -0.22;
    leftLeg.add(lThigh);

    const lShinGroup = new THREE.Group();
    lShinGroup.position.y = -0.44;
    leftLeg.add(lShinGroup);

    const lShinGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.44, 8);
    const lShin = new THREE.Mesh(lShinGeo, pantsMat);
    lShin.position.y = -0.22;
    lShinGroup.add(lShin);

    const lFoot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.12, 0.22), shoesMat);
    lFoot.position.set(0, -0.46, 0.04);
    lFoot.castShadow = true;
    lShinGroup.add(lFoot);

    // Right Leg (Hip Pivot)
    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.11, -0.04, 0);
    torso.add(rightLeg);

    const rThighGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.44, 8);
    const rThigh = new THREE.Mesh(rThighGeo, pantsMat);
    rThigh.position.y = -0.22;
    rightLeg.add(rThigh);

    // Holster on right thigh (if toggled)
    const holster = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), blackGearMat);
    holster.position.set(0.09, -0.16, 0);
    holster.visible = appearance.accessories.holster;
    rightLeg.add(holster);

    const rShinGroup = new THREE.Group();
    rShinGroup.position.y = -0.44;
    rightLeg.add(rShinGroup);

    const rShinGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.44, 8);
    const rShin = new THREE.Mesh(rShinGeo, pantsMat);
    rShin.position.y = -0.22;
    rShinGroup.add(rShin);

    const rFoot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.12, 0.22), shoesMat);
    rFoot.position.set(0, -0.46, 0.04);
    rFoot.castShadow = true;
    rShinGroup.add(rFoot);

    // Animate function for walk / run / aim cycles
    const animate = (time: number, speed: number, isAiming: boolean, isFiring: boolean) => {
      const isMoving = speed > 0.05;

      if (isMoving) {
        const cycleSpeed = speed * 9.0;
        const swing = Math.sin(time * cycleSpeed) * 0.7;

        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;

        // Subtle torso bounce & roll
        torso.position.y = 1.05 + Math.abs(Math.sin(time * cycleSpeed)) * 0.05;

        if (!isAiming) {
          leftArm.rotation.x = -swing * 0.6;
          rightArm.rotation.x = swing * 0.6;
        }
      } else {
        // Idle breathing
        torso.position.y = 1.05 + Math.sin(time * 2.5) * 0.015;
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        if (!isAiming) {
          leftArm.rotation.x = Math.sin(time * 2) * 0.05;
          rightArm.rotation.x = -Math.sin(time * 2) * 0.05;
        }
      }

      // Tactical Aiming Posture (Call of Duty ready stance)
      if (isAiming) {
        rightArm.rotation.x = -Math.PI / 2 + 0.15;
        rightArm.rotation.y = -0.3;
        leftArm.rotation.x = -Math.PI / 2 + 0.35;
        leftArm.rotation.y = 0.55;
        rForearm.rotation.x = -0.2;
        lForearm.rotation.x = -0.4;
      } else {
        // Hip fire / ready carry
        rightArm.rotation.x = -0.6;
        rightArm.rotation.y = -0.15;
        leftArm.rotation.x = -0.5;
        leftArm.rotation.y = 0.3;
      }

      // Weapon recoil kick
      if (isFiring) {
        rightArm.rotation.x -= 0.15;
        torso.position.z -= 0.03;
      }
    };

    // Dynamic appearance update
    const updateAppearance = (app: CharacterAppearance) => {
      skinMat.color.set(app.skinTone);
      hairMat.color.set(app.hairColor);
      shirtMat.color.set(app.shirtColor);
      pantsMat.color.set(app.pantsColor);
      shoesMat.color.set(app.shoesColor);

      vest.visible = app.shirtType === 'tactical_vest' || app.shirtType === 'combat_shirt';
      backpack.visible = app.accessories.tacticalBackpack;
      chain.visible = app.accessories.goldChain;
      glasses.visible = app.accessories.sunglasses;
      holster.visible = app.accessories.holster;

      updateHairMeshes(app.hairStyle);
    };

    const dispose = () => {
      skinMat.dispose();
      hairMat.dispose();
      shirtMat.dispose();
      vestMat.dispose();
      pantsMat.dispose();
      shoesMat.dispose();
      accessoryMat.dispose();
      blackGearMat.dispose();
    };

    return {
      root,
      head,
      torso,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      weaponMount,
      animate,
      updateAppearance,
      dispose,
    };
  }
}
