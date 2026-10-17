/**
 * Procedural 3D Vehicle Models for LAGOS SURVIVAL: BLOCK WAR
 * Detailed Lagos Danfo yellow buses with black double stripes, Okada bikes, and SUVs.
 */

import * as THREE from 'three';
import { Vehicle } from '../../types/game';
import { TextureGenerator } from '../procedural/textures';

export class VehicleModelBuilder {
  /**
   * Builds the iconic Yellow Lagos Danfo Minibus
   */
  public static buildDanfoBus(): THREE.Group {
    const bus = new THREE.Group();
    bus.name = 'Danfo_Bus';

    const danfoYellowMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Bright Lagos taxi yellow
      metalness: 0.3,
      roughness: 0.4,
    });

    const blackStripeMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.2,
      roughness: 0.8,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
      metalness: 0.1,
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      roughness: 0.3,
      metalness: 0.8,
    });

    const bumperMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.5,
      metalness: 0.5,
    });

    // Lower Main Body Hull
    const hull = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.1, 4.8), danfoYellowMat);
    hull.position.y = 0.95;
    hull.castShadow = true;
    bus.add(hull);

    // Iconic twin black stripes running down both sides
    const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.12, 4.82), blackStripeMat);
    stripe1.position.y = 0.85;
    const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.12, 4.82), blackStripeMat);
    stripe2.position.y = 1.05;
    bus.add(stripe1, stripe2);

    // Cabin Upper Roof Section
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.02, 1.0, 4.6), danfoYellowMat);
    cabin.position.set(0, 1.9, -0.05);
    cabin.castShadow = true;
    bus.add(cabin);

    // Front Windshield
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.75), glassMat);
    windshield.position.set(0, 1.85, 2.27);
    windshield.rotation.x = -0.15;
    bus.add(windshield);

    // Side Windows
    const sideWinL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.65, 3.4), glassMat);
    sideWinL.position.set(-1.02, 1.85, -0.2);
    const sideWinR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.65, 3.4), glassMat);
    sideWinR.position.set(1.02, 1.85, -0.2);
    bus.add(sideWinL, sideWinR);

    // Bumpers (Front & Back)
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.16, 0.28, 0.3), bumperMat);
    frontBumper.position.set(0, 0.52, 2.45);
    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(2.16, 0.28, 0.3), bumperMat);
    rearBumper.position.set(0, 0.52, -2.45);
    bus.add(frontBumper, rearBumper);

    // Headlights (Warm glow emissive)
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfef08a,
      emissiveIntensity: 0.8,
    });
    const headL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 12), headlightMat);
    headL.rotation.x = Math.PI / 2;
    headL.position.set(-0.7, 0.8, 2.42);
    const headR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 12), headlightMat);
    headR.rotation.x = Math.PI / 2;
    headR.position.set(0.7, 0.8, 2.42);
    bus.add(headL, headR);

    // Roof Luggage Rack with market crates & baggage
    const rack = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 3.0), bumperMat);
    rack.position.set(0, 2.45, -0.4);
    const luggage1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.8), new THREE.MeshStandardMaterial({ color: 0x1d4ed8 }));
    luggage1.position.set(-0.4, 2.65, -0.3);
    const luggage2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.9), new THREE.MeshStandardMaterial({ color: 0xb91c1c }));
    luggage2.position.set(0.35, 2.68, -0.5);
    bus.add(rack, luggage1, luggage2);

    // Wheels (4 Wheels)
    const wheelPositions = [
      [-1.05, 0.45, 1.4], // Front Left
      [1.05, 0.45, 1.4],  // Front Right
      [-1.05, 0.45, -1.4], // Rear Left
      [1.05, 0.45, -1.4],  // Rear Right
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(x, y, z);

      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.28, 16), tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.29, 12), rimMat);
      rim.rotation.z = Math.PI / 2;

      wheelGroup.add(tire, rim);
      bus.add(wheelGroup);
    });

    return bus;
  }

  /**
   * Builds an Okada Motorcycle (Lagos commercial bike)
   */
  public static buildOkadaMotorcycle(): THREE.Group {
    const bike = new THREE.Group();
    bike.name = 'Okada_Bike';

    const redPaintMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.6, roughness: 0.3 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });

    // Chassis frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 1.2), chromeMat);
    frame.position.y = 0.55;
    bike.add(frame);

    // Gas Tank
    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.45), redPaintMat);
    tank.position.set(0, 0.78, 0.15);
    bike.add(tank);

    // Two-person Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.65), seatMat);
    seat.position.set(0, 0.75, -0.32);
    bike.add(seat);

    // Handlebars
    const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8), chromeMat);
    handleBar.rotation.z = Math.PI / 2;
    handleBar.position.set(0, 0.96, 0.45);
    bike.add(handleBar);

    // Front & Rear Wheels
    const frontWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.09, 16), tireMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.32, 0.85);
    frontWheel.castShadow = true;

    const rearWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.11, 16), tireMat);
    rearWheel.rotation.z = Math.PI / 2;
    rearWheel.position.set(0, 0.32, -0.75);
    rearWheel.castShadow = true;

    bike.add(frontWheel, rearWheel);
    return bike;
  }

  /**
   * Builds a Black Tactical SUV
   */
  public static buildSUV(): THREE.Group {
    const suv = new THREE.Group();
    suv.name = 'Tactical_SUV';

    const suvBodyMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.7, roughness: 0.2 });
    const tintGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.5,
      transparent: true,
      opacity: 0.85,
    });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });

    // Chassis
    const lower = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 4.4), suvBodyMat);
    lower.position.y = 0.8;
    lower.castShadow = true;

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 2.6), suvBodyMat);
    cabin.position.set(0, 1.45, -0.3);
    cabin.castShadow = true;

    // Glass
    const frontGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.6), tintGlassMat);
    frontGlass.position.set(0, 1.45, 1.02);
    frontGlass.rotation.x = -0.3;

    suv.add(lower, cabin, frontGlass);

    // 4 Wheels
    [[-1.0, 0.45, 1.3], [1.0, 0.45, 1.3], [-1.0, 0.45, -1.3], [1.0, 0.45, -1.3]].forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.28, 16), tireMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      suv.add(wheel);
    });

    return suv;
  }
}
