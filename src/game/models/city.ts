/**
 * 3D Open World Procedural Lagos City Builder for LAGOS SURVIVAL: BLOCK WAR
 * Generates Marina skyscrapers, Oshodi Danfo bus terminal & markets,
 * Suya stalls, Lekki suspension bridge, waterfront lagoon, palm trees, and colliders.
 */

import * as THREE from 'three';
import { TextureGenerator } from '../procedural/textures';

export interface CityCollider {
  min: THREE.Vector3;
  max: THREE.Vector3;
  tag?: string;
}

export interface CityWorldResult {
  sceneGroup: THREE.Group;
  colliders: CityCollider[];
  spawnPoints: {
    player: THREE.Vector3;
    danfoBus: THREE.Vector3;
    okada: THREE.Vector3;
    suyaBuka: THREE.Vector3;
    armoryShop: THREE.Vector3;
    baseCamp: THREE.Vector3;
    bridge: THREE.Vector3;
  };
}

export class LagosCityBuilder {
  /**
   * Constructs the full playable Lagos open world
   */
  public static buildLagosWorld(): CityWorldResult {
    const sceneGroup = new THREE.Group();
    sceneGroup.name = 'Lagos_OpenWorld';

    const colliders: CityCollider[] = [];

    const addCollider = (pos: THREE.Vector3, size: THREE.Vector3, tag = 'building') => {
      colliders.push({
        min: new THREE.Vector3(pos.x - size.x / 2, pos.y - size.y / 2, pos.z - size.z / 2),
        max: new THREE.Vector3(pos.x + size.x / 2, pos.y + size.y / 2, pos.z + size.z / 2),
        tag,
      });
    };

    // --- TERRAIN & ROADS ---
    // Ground base plane
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e242b,
      roughness: 0.95,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    sceneGroup.add(ground);

    // Primary Broad Expressway (Z-axis, 24m wide)
    const mainRoadGeo = new THREE.PlaneGeometry(24, 480);
    const roadTexture = TextureGenerator.getRoadTexture();
    const mainRoadMat = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.85,
    });
    const mainRoad = new THREE.Mesh(mainRoadGeo, mainRoadMat);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.01, 0);
    mainRoad.receiveShadow = true;
    sceneGroup.add(mainRoad);

    // Cross Avenue (X-axis, 18m wide)
    const crossRoadGeo = new THREE.PlaneGeometry(480, 18);
    const crossRoadMat = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.85,
    });
    const crossRoad = new THREE.Mesh(crossRoadGeo, crossRoadMat);
    crossRoad.rotation.x = -Math.PI / 2;
    crossRoad.position.set(0, 0.012, 0);
    crossRoad.receiveShadow = true;
    sceneGroup.add(crossRoad);

    // Sidewalks
    const sidewalkTex = TextureGenerator.getSidewalkTexture();
    const sidewalkMat = new THREE.MeshStandardMaterial({ map: sidewalkTex, roughness: 0.9 });

    // Left Sidewalk
    const leftSidewalk = new THREE.Mesh(new THREE.BoxGeometry(6, 0.25, 480), sidewalkMat);
    leftSidewalk.position.set(-15, 0.12, 0);
    leftSidewalk.receiveShadow = true;
    sceneGroup.add(leftSidewalk);

    // Right Sidewalk
    const rightSidewalk = new THREE.Mesh(new THREE.BoxGeometry(6, 0.25, 480), sidewalkMat);
    rightSidewalk.position.set(15, 0.12, 0);
    rightSidewalk.receiveShadow = true;
    sceneGroup.add(rightSidewalk);

    // --- DISTRICT 1: MARINA COMMERCIAL SKYSCRAPERS (North-West Zone) ---
    const buildSkyscraper = (x: number, z: number, w: number, d: number, h: number, color = 0x334155) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(x, 0, z);

      // Building Main Tower
      const bMat = new THREE.MeshStandardMaterial({
        color,
        map: TextureGenerator.getSkyscraperWindowsTexture(Math.random() > 0.5),
        roughness: 0.3,
        metalness: 0.6,
      });
      const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bMat);
      tower.position.y = h / 2;
      tower.castShadow = true;
      tower.receiveShadow = true;
      bGroup.add(tower);

      // Rooftop Spire / Antenna / HVAC
      const roofHvac = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.4, 3, d * 0.4),
        new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.7 })
      );
      roofHvac.position.y = h + 1.5;
      bGroup.add(roofHvac);

      // Antenna
      const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.3, 12, 8),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
      );
      antenna.position.set(0, h + 9, 0);
      bGroup.add(antenna);

      sceneGroup.add(bGroup);
      addCollider(new THREE.Vector3(x, h / 2, z), new THREE.Vector3(w, h, d));
    };

    // Marina Towers Cluster
    buildSkyscraper(-45, -70, 24, 28, 95, 0x1e293b);
    buildSkyscraper(-80, -65, 30, 26, 120, 0x0f172a);
    buildSkyscraper(-45, -125, 26, 32, 80, 0x1e3a8a);
    buildSkyscraper(-85, -125, 28, 28, 110, 0x1e293b);

    // Billboards on Marina Skyscraper Facade
    const bbGeo = new THREE.BoxGeometry(18, 9, 0.6);
    const bbMesh = new THREE.Mesh(
      bbGeo,
      new THREE.MeshStandardMaterial({ map: TextureGenerator.getBillboardTexture(2) })
    );
    bbMesh.position.set(-32, 22, -70);
    sceneGroup.add(bbMesh);

    // --- DISTRICT 2: OSHODI OPEN-AIR MARKET & DANFO BUS PARK (North-East Zone) ---
    const marketZincTex = TextureGenerator.getCorrugatedZincTexture();
    const zincMat = new THREE.MeshStandardMaterial({ map: marketZincTex, roughness: 0.8, metalness: 0.4 });

    // Mama Ngozi's Famous Suya & Jollof Buka (Interactive Restaurant)
    const bukaGroup = new THREE.Group();
    bukaGroup.position.set(40, 0, -45);
    bukaGroup.name = 'Shop_MamaNgoziBuka';

    // Buka Structure (Concrete walls with open front counter)
    const bukaWalls = new THREE.Mesh(
      new THREE.BoxGeometry(12, 4.5, 9),
      new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8 })
    );
    bukaWalls.position.y = 2.25;
    bukaWalls.castShadow = true;
    bukaGroup.add(bukaWalls);

    // Zinc Roof overhang
    const bukaRoof = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.4, 10.5), zincMat);
    bukaRoof.position.set(0, 4.6, 0);
    bukaRoof.rotation.x = 0.08;
    bukaGroup.add(bukaRoof);

    // Suya BBQ Grill Out Front with Red Glowing Coals
    const grill = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.1, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8 })
    );
    grill.position.set(0, 0.55, 5.8);
    const coalMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xff4500,
      emissiveIntensity: 1.2,
    });
    const coals = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.15, 0.9), coalMat);
    coals.position.set(0, 1.1, 5.8);
    bukaGroup.add(grill, coals);

    // Buka Signboard
    const bukaSign = new THREE.Mesh(
      new THREE.BoxGeometry(9, 2.5, 0.3),
      new THREE.MeshStandardMaterial({ map: TextureGenerator.getBillboardTexture(0) })
    );
    bukaSign.position.set(0, 4.2, 5.0);
    bukaGroup.add(bukaSign);

    sceneGroup.add(bukaGroup);
    addCollider(new THREE.Vector3(40, 2.25, -45), new THREE.Vector3(12, 4.5, 9), 'suya_buka');

    // Chidi's Tactical Defense Armory & Electronics Shop
    const armoryGroup = new THREE.Group();
    armoryGroup.position.set(42, 0, -75);
    armoryGroup.name = 'Shop_Armory';

    const armoryBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(14, 5, 10),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.4 })
    );
    armoryBuilding.position.y = 2.5;
    armoryBuilding.castShadow = true;
    armoryGroup.add(armoryBuilding);

    const armorySign = new THREE.Mesh(
      new THREE.BoxGeometry(10, 2.6, 0.3),
      new THREE.MeshStandardMaterial({ map: TextureGenerator.getBillboardTexture(1) })
    );
    armorySign.position.set(0, 4.5, 5.4);
    armoryGroup.add(armorySign);

    sceneGroup.add(armoryGroup);
    addCollider(new THREE.Vector3(42, 2.5, -75), new THREE.Vector3(14, 5, 10), 'armory');

    // Oshodi Market Stalls (Row of colourful open stalls with umbrellas and tables)
    const buildMarketStall = (x: number, z: number, color: 'green' | 'red' | 'blue') => {
      const stall = new THREE.Group();
      stall.position.set(x, 0, z);

      // Wooden Table
      const table = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.9, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
      );
      table.position.y = 0.45;
      table.castShadow = true;
      stall.add(table);

      // Crates of fruits / textiles
      const crate1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.4, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xf97316 })
      );
      crate1.position.set(-0.9, 1.0, 0.2);
      const crate2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.4, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x22c55e })
      );
      crate2.position.set(0.6, 1.0, -0.1);
      stall.add(crate1, crate2);

      // Striped Canvas Canopy
      const canopy = new THREE.Mesh(
        new THREE.ConeGeometry(2.4, 1.0, 8),
        new THREE.MeshStandardMaterial({ map: TextureGenerator.getMarketAwningTexture(color), roughness: 0.7 })
      );
      canopy.position.set(0, 2.8, 0);
      canopy.castShadow = true;

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 2.8, 6),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
      );
      pole.position.y = 1.4;

      stall.add(canopy, pole);
      sceneGroup.add(stall);
      addCollider(new THREE.Vector3(x, 1, z), new THREE.Vector3(3.2, 2, 1.8), 'stall');
    };

    buildMarketStall(30, -25, 'green');
    buildMarketStall(36, -25, 'red');
    buildMarketStall(42, -25, 'blue');
    buildMarketStall(48, -25, 'green');
    buildMarketStall(30, -15, 'red');
    buildMarketStall(36, -15, 'blue');

    // Danfo Bus Depot Canopy (Large yellow depot bay where passenger missions start)
    const depotRoof = new THREE.Mesh(new THREE.BoxGeometry(26, 0.4, 16), zincMat);
    depotRoof.position.set(65, 4.6, -45);
    sceneGroup.add(depotRoof);

    // Support pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 }); // Painted Danfo yellow
    [[-11, -6], [-11, 6], [11, -6], [11, 6]].forEach(([px, pz]) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 4.6, 8), pillarMat);
      pillar.position.set(65 + px, 2.3, -45 + pz);
      sceneGroup.add(pillar);
      addCollider(pillar.position, new THREE.Vector3(0.6, 4.6, 0.6));
    });

    // --- DISTRICT 3: LEKKI-IKOYI SUSPENSION BRIDGE & WATERFRONT LAGOON (South Zone) ---
    // Lagoon Water Plane
    const lagoonGeo = new THREE.PlaneGeometry(600, 160);
    const lagoonMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7, // Tropical coastal blue
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85,
    });
    const lagoon = new THREE.Mesh(lagoonGeo, lagoonMat);
    lagoon.rotation.x = -Math.PI / 2;
    lagoon.position.set(0, -0.4, 140);
    sceneGroup.add(lagoon);

    // Suspension Bridge Deck
    const bridgeDeck = new THREE.Mesh(
      new THREE.BoxGeometry(20, 1.2, 150),
      new THREE.MeshStandardMaterial({ map: roadTexture, roughness: 0.8 })
    );
    bridgeDeck.position.set(0, 4.5, 140);
    bridgeDeck.castShadow = true;
    bridgeDeck.receiveShadow = true;
    sceneGroup.add(bridgeDeck);

    // Bridge Guardrails
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 150), railMat);
    railL.position.set(-9.8, 5.5, 140);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 150), railMat);
    railR.position.set(9.8, 5.5, 140);
    sceneGroup.add(railL, railR);
    addCollider(railL.position, new THREE.Vector3(0.5, 1.5, 150), 'rail');
    addCollider(railR.position, new THREE.Vector3(0.5, 1.5, 150), 'rail');

    // Iconic Triangular Suspension Cable Pylons (Lekki-Ikoyi Link Bridge silhouette)
    const pylonMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4, metalness: 0.3 });
    const pylonL = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.2, 54, 8), pylonMat);
    pylonL.position.set(-11, 27, 140);
    pylonL.rotation.z = -0.12;
    const pylonR = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.2, 54, 8), pylonMat);
    pylonR.position.set(11, 27, 140);
    pylonR.rotation.z = 0.12;
    sceneGroup.add(pylonL, pylonR);

    // Stay Cables
    const cableMat = new THREE.MeshBasicMaterial({ color: 0xd1d5db });
    for (let c = -60; c <= 60; c += 15) {
      if (Math.abs(c) < 5) continue;
      const cableGeo = new THREE.CylinderGeometry(0.04, 0.04, 38, 4);
      const cable = new THREE.Mesh(cableGeo, cableMat);
      cable.position.set(0, 22, 140 + c / 2);
      cable.rotation.x = Math.atan2(c, 45);
      sceneGroup.add(cable);
    }

    // Waterfront Palm Trees
    const buildPalmTree = (x: number, z: number) => {
      const palm = new THREE.Group();
      palm.position.set(x, 0, z);

      // Curved Trunk
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.9 });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 7, 8), trunkMat);
      trunk.position.set(0.3, 3.5, 0);
      trunk.rotation.z = 0.08;
      trunk.castShadow = true;
      palm.add(trunk);

      // Palm Fronds
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
      for (let i = 0; i < 6; i++) {
        const frond = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 3.2), leafMat);
        frond.position.set(0.5, 7, 0);
        frond.rotation.y = (i / 6) * Math.PI * 2;
        frond.rotation.x = 0.45;
        palm.add(frond);
      }
      sceneGroup.add(palm);
    };

    [[-30, 55], [-45, 60], [-25, 75], [30, 55], [45, 65], [25, 75]].forEach(([px, pz]) => {
      buildPalmTree(px, pz);
    });

    // --- DISTRICT 4: BASE CAMP & SYNDICATE COMPOUND (South-West Zone) ---
    // Shipping Containers (Red, Blue, Yellow)
    const buildContainer = (x: number, z: number, y = 1.3, color = 0x1d4ed8, rot = 0) => {
      const container = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 2.6, 6.2),
        new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.5 })
      );
      container.position.set(x, y, z);
      container.rotation.y = rot;
      container.castShadow = true;
      sceneGroup.add(container);
      addCollider(container.position, new THREE.Vector3(2.6, 2.6, 6.2), 'container');
    };

    buildContainer(-35, 20, 1.3, 0xb91c1c, 0.2);
    buildContainer(-35, 20, 3.9, 0x1d4ed8, 0.2); // Stacked
    buildContainer(-42, 22, 1.3, 0xeab308, -0.4);
    buildContainer(-38, 32, 1.3, 0x15803d, 1.57);

    // Watchtower
    const towerPillars = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 7, 8),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
    );
    towerPillars.position.set(-52, 3.5, 25);
    const towerPlatform = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 0.4, 4.5),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
    towerPlatform.position.set(-52, 7, 25);
    sceneGroup.add(towerPillars, towerPlatform);
    addCollider(towerPlatform.position, new THREE.Vector3(4.5, 7, 4.5), 'tower');

    // Streetlamps with warm light glow
    const buildStreetLamp = (x: number, z: number) => {
      const lamp = new THREE.Group();
      lamp.position.set(x, 0, z);

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.12, 6.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
      );
      pole.position.y = 3.25;

      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 1.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
      );
      arm.rotation.z = Math.PI / 3;
      arm.position.set(0.6, 6.2, 0);

      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.9 })
      );
      bulb.position.set(1.4, 6.0, 0);

      lamp.add(pole, arm, bulb);
      sceneGroup.add(lamp);
    };

    [-90, -45, 0, 45, 90].forEach((z) => {
      buildStreetLamp(-14, z);
      buildStreetLamp(14, z);
    });

    return {
      sceneGroup,
      colliders,
      spawnPoints: {
        player: new THREE.Vector3(0, 0, 5),
        danfoBus: new THREE.Vector3(4, 0, -10),
        okada: new THREE.Vector3(-6, 0, 2),
        suyaBuka: new THREE.Vector3(40, 0, -38),
        armoryShop: new THREE.Vector3(42, 0, -68),
        baseCamp: new THREE.Vector3(-35, 0, 20),
        bridge: new THREE.Vector3(0, 4.5, 95),
      },
    };
  }
}
