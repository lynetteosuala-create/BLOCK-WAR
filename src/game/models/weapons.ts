/**
 * 3D Procedural Weapon Models & Catalog for LAGOS SURVIVAL: BLOCK WAR
 * Call of Duty-style fictional tactical weapons with custom models, scopes, and stats.
 */

import * as THREE from 'three';
import { WeaponStats } from '../../types/game';

export const WEAPON_CATALOG: WeaponStats[] = [
  {
    id: 'eko_viper',
    name: 'Eko Viper AR-24',
    category: 'assault_rifle',
    damage: 34,
    fireRate: 11, // rounds/sec
    magazineSize: 30,
    currentMag: 30,
    reserveAmmo: 180,
    reloadTime: 1.8,
    range: 120,
    recoil: 0.04,
    accuracy: 0.92,
    adsZoom: 1.35,
    color: '#0f172a',
    unlocked: true,
    description: 'Standard issue tactical assault rifle with holographic optic and balanced recoil.',
  },
  {
    id: 'oshodi_shredder',
    name: 'Oshodi Shredder 9mm',
    category: 'smg',
    damage: 24,
    fireRate: 16,
    magazineSize: 35,
    currentMag: 35,
    reserveAmmo: 210,
    reloadTime: 1.4,
    range: 70,
    recoil: 0.06,
    accuracy: 0.84,
    adsZoom: 1.25,
    color: '#334155',
    unlocked: true,
    description: 'Ultra-fast submachine gun engineered for tight corner fights in Lagos markets.',
  },
  {
    id: 'danfo_breaker',
    name: 'Danfo Breaker 12G',
    category: 'shotgun',
    damage: 96,
    fireRate: 1.8,
    magazineSize: 8,
    currentMag: 8,
    reserveAmmo: 48,
    reloadTime: 2.4,
    range: 35,
    recoil: 0.12,
    accuracy: 0.65,
    adsZoom: 1.15,
    color: '#78350f',
    unlocked: true,
    description: 'Heavy tactical pump shotgun delivering brutal stopping power at close range.',
  },
  {
    id: 'bar_beach_sniper',
    name: 'Bar Beach Hawk .50',
    category: 'sniper',
    damage: 130,
    fireRate: 0.9,
    magazineSize: 5,
    currentMag: 5,
    reserveAmmo: 30,
    reloadTime: 2.8,
    range: 260,
    recoil: 0.22,
    accuracy: 0.98,
    adsZoom: 2.8,
    color: '#1e293b',
    unlocked: true,
    description: 'High caliber precision sniper rifle equipped with high magnification optical scope.',
  },
  {
    id: 'marina_pistol',
    name: 'Marina 9mm Tactical',
    category: 'pistol',
    damage: 28,
    fireRate: 6,
    magazineSize: 15,
    currentMag: 15,
    reserveAmmo: 90,
    reloadTime: 1.1,
    range: 55,
    recoil: 0.035,
    accuracy: 0.9,
    adsZoom: 1.2,
    color: '#09090b',
    unlocked: true,
    description: 'Lightweight sidearm with rapid draw speed and crisp trigger response.',
  },
];

export class WeaponModelBuilder {
  /**
   * Builds a detailed 3D tactical weapon mesh
   */
  public static buildWeapon(weaponId: string): { group: THREE.Group; muzzle: THREE.Vector3 } {
    const group = new THREE.Group();
    group.name = `Weapon_${weaponId}`;

    // High quality tactical PBR materials
    const gunMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e242b,
      metalness: 0.85,
      roughness: 0.25,
    });

    const polymerMat = new THREE.MeshStandardMaterial({
      color: 0x090a0f,
      metalness: 0.2,
      roughness: 0.8,
    });

    const camoMat = new THREE.MeshStandardMaterial({
      color: weaponId === 'danfo_breaker' ? 0x854d0e : 0x223528,
      metalness: 0.3,
      roughness: 0.6,
    });

    const opticLensMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.02,
    });

    let muzzle = new THREE.Vector3(0, 0, 0.45);

    if (weaponId === 'eko_viper') {
      // Assault Rifle
      // Lower receiver
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.07, 0.28), gunMetalMat);
      receiver.position.set(0, 0, 0);
      group.add(receiver);

      // Handguard
      const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.2), camoMat);
      handguard.position.set(0, 0.01, 0.22);
      group.add(handguard);

      // Barrel & Muzzle Brake
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 8), gunMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.015, 0.4);
      group.add(barrel);

      const muzzleBrake = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.05, 8), gunMetalMat);
      muzzleBrake.rotation.x = Math.PI / 2;
      muzzleBrake.position.set(0, 0.015, 0.54);
      group.add(muzzleBrake);

      // Curved Magazine
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.16, 0.07), polymerMat);
      mag.position.set(0, -0.1, 0.08);
      mag.rotation.x = 0.2;
      group.add(mag);

      // Pistol Grip
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.12, 0.05), polymerMat);
      grip.position.set(0, -0.08, -0.08);
      grip.rotation.x = -0.3;
      group.add(grip);

      // Tactical Stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.09, 0.2), polymerMat);
      stock.position.set(0, 0, -0.22);
      group.add(stock);

      // Holographic Sight
      const holoBase = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.02, 0.08), gunMetalMat);
      holoBase.position.set(0, 0.045, 0.02);
      const holoFrame = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.04, 0.01), gunMetalMat);
      holoFrame.position.set(0, 0.065, 0.02);
      const holoLens = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.03), opticLensMat);
      holoLens.position.set(0, 0.065, 0.025);
      group.add(holoBase, holoFrame, holoLens);

      muzzle = new THREE.Vector3(0, 0.015, 0.58);
    } else if (weaponId === 'bar_beach_sniper') {
      // Sniper Rifle
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.42), gunMetalMat);
      body.position.set(0, 0, 0);
      group.add(body);

      // Long heavy barrel
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.65, 8), gunMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, 0.5);
      group.add(barrel);

      // Big Muzzle Flash Suppressor
      const brake = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.08), gunMetalMat);
      brake.position.set(0, 0.02, 0.84);
      group.add(brake);

      // High-power scope
      const scopeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.24, 12), polymerMat);
      scopeBody.rotation.x = Math.PI / 2;
      scopeBody.position.set(0, 0.08, 0.02);
      const scopeMount = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.04, 0.12), gunMetalMat);
      scopeMount.position.set(0, 0.05, 0.02);
      group.add(scopeBody, scopeMount);

      // Bipod legs
      const bipodL = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 6), gunMetalMat);
      bipodL.position.set(-0.06, -0.06, 0.45);
      bipodL.rotation.z = -0.3;
      const bipodR = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 6), gunMetalMat);
      bipodR.position.set(0.06, -0.06, 0.45);
      bipodR.rotation.z = 0.3;
      group.add(bipodL, bipodR);

      // Heavy stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.11, 0.28), polymerMat);
      stock.position.set(0, -0.01, -0.3);
      group.add(stock);

      muzzle = new THREE.Vector3(0, 0.02, 0.9);
    } else if (weaponId === 'danfo_breaker') {
      // Shotgun
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.075, 0.32), gunMetalMat);
      group.add(receiver);

      // Dual tubes (barrel & magazine tube)
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.48, 8), gunMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, 0.38);
      const magTube = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.42, 8), gunMetalMat);
      magTube.rotation.x = Math.PI / 2;
      magTube.position.set(0, -0.015, 0.35);
      group.add(barrel, magTube);

      // Pump action slide (wood finish)
      const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.15, 8), camoMat);
      pump.rotation.x = Math.PI / 2;
      pump.position.set(0, -0.015, 0.32);
      group.add(pump);

      // Wood buttstock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.26), camoMat);
      stock.position.set(0, -0.03, -0.26);
      stock.rotation.x = -0.1;
      group.add(stock);

      muzzle = new THREE.Vector3(0, 0.02, 0.64);
    } else if (weaponId === 'oshodi_shredder') {
      // Compact SMG
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.08, 0.24), polymerMat);
      group.add(body);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8), gunMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.01, 0.2);
      group.add(barrel);

      // Front vertical foregrip
      const foregrip = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.1, 8), polymerMat);
      foregrip.position.set(0, -0.07, 0.16);
      group.add(foregrip);

      // Long stick magazine
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.04), gunMetalMat);
      mag.position.set(0, -0.12, -0.02);
      group.add(mag);

      // Folding wire stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.18), gunMetalMat);
      stock.position.set(0, 0.02, -0.19);
      group.add(stock);

      muzzle = new THREE.Vector3(0, 0.01, 0.3);
    } else {
      // Marina 9mm Pistol
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.04, 0.18), gunMetalMat);
      slide.position.set(0, 0.04, 0.04);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.09, 0.05), polymerMat);
      frame.position.set(0, -0.02, -0.01);
      frame.rotation.x = -0.25;
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.04, 6), gunMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.04, 0.14);
      group.add(slide, frame, barrel);

      muzzle = new THREE.Vector3(0, 0.04, 0.16);
    }

    return { group, muzzle };
  }
}
