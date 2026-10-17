/**
 * Modular Building & Fortification System for LAGOS SURVIVAL: BLOCK WAR
 * Provides 3D placeable defensive structures, holographic preview meshes, and recipes.
 */

import * as THREE from 'three';
import { BuildingPiece, PlacedBuilding } from '../../types/game';

export const BUILDING_CATALOG: BuildingPiece[] = [
  {
    id: 'wood_wall',
    name: 'Timber Block Wall',
    category: 'structure',
    woodCost: 20,
    metalCost: 0,
    concreteCost: 0,
    health: 200,
    maxHealth: 200,
    previewColor: '#854d0e',
    dimensions: [3.0, 2.4, 0.3],
    description: 'Quick wooden perimeter barricade constructed from local market planks.',
  },
  {
    id: 'metal_barricade',
    name: 'Reinforced Steel Barricade',
    category: 'defense',
    woodCost: 10,
    metalCost: 35,
    concreteCost: 0,
    health: 550,
    maxHealth: 550,
    previewColor: '#64748b',
    dimensions: [2.8, 1.4, 0.4],
    description: 'Heavy bulletproof steel chest-high barrier ideal for tactical cover.',
  },
  {
    id: 'sandbag_bunker',
    name: 'Sandbag Bastion',
    category: 'defense',
    woodCost: 5,
    metalCost: 5,
    concreteCost: 30,
    health: 400,
    maxHealth: 400,
    previewColor: '#d97706',
    dimensions: [2.5, 1.1, 0.8],
    description: 'High-absorption ballistic sandbags for fortified block defense.',
  },
  {
    id: 'watchtower_platform',
    name: 'Scaffold Watchtower',
    category: 'structure',
    woodCost: 40,
    metalCost: 25,
    concreteCost: 0,
    health: 450,
    maxHealth: 450,
    previewColor: '#3b82f6',
    dimensions: [3.5, 4.2, 3.5],
    description: 'Elevated vantage post providing strategic sniper sightlines across the block.',
  },
  {
    id: 'defense_turret',
    name: 'Auto-Sentry Turret',
    category: 'defense',
    woodCost: 0,
    metalCost: 80,
    concreteCost: 20,
    health: 300,
    maxHealth: 300,
    previewColor: '#ef4444',
    dimensions: [1.2, 1.6, 1.2],
    description: 'Automated 9mm turret that detects and engages hostile Syndicate militia.',
  },
  {
    id: 'workbench',
    name: 'Survival Workbench',
    category: 'utility',
    woodCost: 25,
    metalCost: 15,
    concreteCost: 0,
    health: 250,
    maxHealth: 250,
    previewColor: '#10b981',
    dimensions: [1.8, 1.0, 1.0],
    description: 'Enables advanced weapons tuning, ammo reloads, and plate carrier crafting.',
  },
  {
    id: 'storage_crate',
    name: 'Lagos Supply Crate',
    category: 'utility',
    woodCost: 15,
    metalCost: 5,
    concreteCost: 0,
    health: 150,
    maxHealth: 150,
    previewColor: '#f59e0b',
    dimensions: [1.2, 0.9, 1.2],
    description: 'Secure cache for hoarding collected scrap, rations, and extra magazines.',
  },
];

export class ConstructionBuilder {
  /**
   * Builds the actual 3D mesh for a placed building piece
   */
  public static buildMesh(pieceId: string): THREE.Group {
    const group = new THREE.Group();
    group.name = `Building_${pieceId}`;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const sandbagMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.95 });

    if (pieceId === 'wood_wall') {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.4, 0.3), woodMat);
      wall.position.y = 1.2;
      wall.castShadow = true;
      group.add(wall);
    } else if (pieceId === 'metal_barricade') {
      const barricade = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.4, 0.4), metalMat);
      barricade.position.y = 0.7;
      barricade.castShadow = true;
      // Slit viewport
      const slit = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.45), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
      slit.position.y = 1.0;
      group.add(barricade, slit);
    } else if (pieceId === 'sandbag_bunker') {
      for (let row = 0; row < 3; row++) {
        for (let col = -2; col <= 2; col++) {
          const bag = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.38), sandbagMat);
          bag.position.set(col * 0.5, row * 0.35 + 0.18, 0);
          bag.castShadow = true;
          group.add(bag);
        }
      }
    } else if (pieceId === 'defense_turret') {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.6, 8), metalMat);
      base.position.y = 0.3;
      const swivel = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), metalMat);
      swivel.position.y = 0.75;
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8), metalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.75, 0.4);
      group.add(base, swivel, barrel);
    } else if (pieceId === 'watchtower_platform') {
      // 4 Leg stilts
      [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]].forEach(([x, z]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 4.0, 6), metalMat);
        leg.position.set(x, 2.0, z);
        group.add(leg);
      });
      const deck = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.25, 3.5), woodMat);
      deck.position.y = 4.0;
      group.add(deck);
    } else {
      // Workbench / Storage Crate
      const crate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.2), woodMat);
      crate.position.y = 0.45;
      const straps = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.94, 0.1), metalMat);
      straps.position.y = 0.45;
      group.add(crate, straps);
    }

    return group;
  }

  /**
   * Builds the semi-transparent holographic preview mesh for placement
   */
  public static buildPreviewMesh(piece: BuildingPiece): THREE.Group {
    const group = this.buildMesh(piece.id);
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: 0x22c55e, // Green valid placement indicator
          transparent: true,
          opacity: 0.5,
          wireframe: true,
        });
      }
    });
    return group;
  }
}
