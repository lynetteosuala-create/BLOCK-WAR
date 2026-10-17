/**
 * Call of Duty-style Tactical Ballistics & Combat System
 * LAGOS SURVIVAL: BLOCK WAR
 */

import * as THREE from 'three';
import { WeaponStats } from '../../types/game';
import { soundManager } from '../../audio/SoundManager';

export interface HitResult {
  hit: boolean;
  point: THREE.Vector3;
  targetId?: string;
  targetType?: 'enemy' | 'player' | 'building' | 'terrain';
  damage: number;
  isHeadshot: boolean;
}

export interface BulletTracer {
  line: THREE.Line;
  startTime: number;
  duration: number;
}

export interface ParticleEffect {
  points: THREE.Points;
  startTime: number;
  duration: number;
}

export class CombatSystem {
  private tracers: BulletTracer[] = [];
  private particles: ParticleEffect[] = [];
  private lastFireTime = 0;
  public isReloading = false;
  public reloadProgress = 0; // 0 to 1

  public onHitCallback?: (result: HitResult) => void;

  constructor(private scene: THREE.Scene) {}

  /**
   * Fires the active tactical weapon
   */
  public fire(
    weapon: WeaponStats,
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    targets: { id: string; type: 'enemy' | 'player'; mesh: THREE.Object3D; health: number }[],
    environmentMeshes: THREE.Object3D[]
  ): boolean {
    const now = performance.now();
    const fireInterval = 1000 / weapon.fireRate;

    if (now - this.lastFireTime < fireInterval || this.isReloading) {
      return false;
    }

    if (weapon.currentMag <= 0) {
      // Empty click
      soundManager.playUIClick();
      return false;
    }

    this.lastFireTime = now;
    weapon.currentMag--;

    // Sound effect based on category
    soundManager.playGunshot(weapon.category);

    // Muzzle Flash Light
    this.createMuzzleFlash(origin);

    // Accuracy spread calculation
    const spreadAngle = (1 - weapon.accuracy) * 0.08;
    const spreadX = (Math.random() - 0.5) * spreadAngle;
    const spreadY = (Math.random() - 0.5) * spreadAngle;

    const fireDir = direction.clone().add(new THREE.Vector3(spreadX, spreadY, 0)).normalize();

    // Raycast hit detection
    const raycaster = new THREE.Raycaster(origin, fireDir, 0.2, weapon.range);

    // Collect target meshes
    const checkableMeshes: THREE.Object3D[] = [];
    targets.forEach((t) => checkableMeshes.push(t.mesh));
    environmentMeshes.forEach((m) => checkableMeshes.push(m));

    const intersects = raycaster.intersectObjects(checkableMeshes, true);

    let endPoint = origin.clone().addScaledVector(fireDir, weapon.range);
    let hitResult: HitResult = {
      hit: false,
      point: endPoint,
      damage: 0,
      isHeadshot: false,
    };

    if (intersects.length > 0) {
      const firstHit = intersects[0];
      endPoint = firstHit.point;

      // Find if an enemy was hit
      let hitTarget: { id: string; type: 'enemy' | 'player'; health: number } | null = null;
      let currObj: THREE.Object3D | null = firstHit.object;

      while (currObj && !hitTarget) {
        const found = targets.find((t) => t.mesh === currObj);
        if (found) {
          hitTarget = found;
          break;
        }
        currObj = currObj.parent;
      }

      if (hitTarget) {
        // Headshot detection: hit height relative to target
        const isHeadshot = firstHit.point.y > 1.4;
        const damageDealt = isHeadshot ? weapon.damage * 2.2 : weapon.damage;

        hitResult = {
          hit: true,
          point: firstHit.point,
          targetId: hitTarget.id,
          targetType: hitTarget.type,
          damage: damageDealt,
          isHeadshot,
        };

        // Rewarding hitmarker audio ding
        soundManager.playHitmarker(isHeadshot);

        // Blood / Impact sparks
        this.createHitSparks(firstHit.point, isHeadshot ? 0xdc2626 : 0xf97316);
      } else {
        // Environment hit (concrete dust / sparks)
        hitResult = {
          hit: true,
          point: firstHit.point,
          targetType: 'building',
          damage: 0,
          isHeadshot: false,
        };
        this.createHitSparks(firstHit.point, 0xfacc15);
      }
    }

    // Spawn visual tracer beam
    this.createBulletTracer(origin, endPoint);

    if (this.onHitCallback && hitResult.hit) {
      this.onHitCallback(hitResult);
    }

    return true;
  }

  /**
   * Reload active weapon
   */
  public reload(weapon: WeaponStats, onComplete?: () => void) {
    if (this.isReloading || weapon.currentMag >= weapon.magazineSize || weapon.reserveAmmo <= 0) {
      return;
    }

    this.isReloading = true;
    this.reloadProgress = 0;
    soundManager.playReload();

    const startTime = performance.now();
    const duration = weapon.reloadTime * 1000;

    const interval = window.setInterval(() => {
      const elapsed = performance.now() - startTime;
      this.reloadProgress = Math.min(1, elapsed / duration);

      if (elapsed >= duration) {
        clearInterval(interval);
        const needed = weapon.magazineSize - weapon.currentMag;
        const loaded = Math.min(needed, weapon.reserveAmmo);
        weapon.currentMag += loaded;
        weapon.reserveAmmo -= loaded;
        this.isReloading = false;
        this.reloadProgress = 0;
        if (onComplete) onComplete();
      }
    }, 50);
  }

  /**
   * Spawns a glowing bullet tracer line
   */
  private createBulletTracer(start: THREE.Vector3, end: THREE.Vector3) {
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({
      color: 0xfef08a, // Glowing yellow-gold bullet streak
      linewidth: 2,
      transparent: true,
      opacity: 0.9,
    });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);

    this.tracers.push({
      line,
      startTime: performance.now(),
      duration: 120, // ms
    });
  }

  /**
   * Creates a brief muzzle flash burst
   */
  private createMuzzleFlash(pos: THREE.Vector3) {
    const flashLight = new THREE.PointLight(0xfef08a, 4, 8);
    flashLight.position.copy(pos);
    this.scene.add(flashLight);

    setTimeout(() => {
      this.scene.remove(flashLight);
      flashLight.dispose();
    }, 60);
  }

  /**
   * Spawns impact sparks
   */
  private createHitSparks(pos: THREE.Vector3, color = 0xfacc15) {
    const particleCount = 14;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          Math.random() * 3 + 1,
          (Math.random() - 0.5) * 4
        )
      );
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color,
      size: 0.12,
      transparent: true,
      opacity: 1,
    });

    const points = new THREE.Points(geometry, mat);
    this.scene.add(points);

    this.particles.push({
      points,
      startTime: performance.now(),
      duration: 350,
    });
  }

  /**
   * Update particle lifetimes and remove dead visuals
   */
  public update() {
    const now = performance.now();

    // Clean tracers
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      const elapsed = now - t.startTime;
      if (elapsed > t.duration) {
        this.scene.remove(t.line);
        t.line.geometry.dispose();
        (t.line.material as THREE.Material).dispose();
        this.tracers.splice(i, 1);
      } else {
        const mat = t.line.material as THREE.LineBasicMaterial;
        mat.opacity = 1 - elapsed / t.duration;
      }
    }

    // Clean sparks
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      const elapsed = now - p.startTime;
      if (elapsed > p.duration) {
        this.scene.remove(p.points);
        p.points.geometry.dispose();
        (p.points.material as THREE.Material).dispose();
        this.particles.splice(i, 1);
      } else {
        const mat = p.points.material as THREE.PointsMaterial;
        mat.opacity = 1 - elapsed / p.duration;
      }
    }
  }

  public dispose() {
    this.tracers.forEach((t) => {
      this.scene.remove(t.line);
      t.line.geometry.dispose();
      (t.line.material as THREE.Material).dispose();
    });
    this.particles.forEach((p) => {
      this.scene.remove(p.points);
      p.points.geometry.dispose();
      (p.points.material as THREE.Material).dispose();
    });
  }
}
