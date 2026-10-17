/**
 * Physics, Movement, Dual Cameras, and Vehicle Kinematics System
 * LAGOS SURVIVAL: BLOCK WAR
 */

import * as THREE from 'three';
import { CameraMode, Vehicle } from '../../types/game';
import { CityCollider } from '../models/city';
import { soundManager } from '../../audio/SoundManager';

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  jump: boolean;
  crouch: boolean;
  interact: boolean;
  reload: boolean;
  aim: boolean;
  fire: boolean;
  toggleCamera: boolean;
  toggleBuild: boolean;
  toggleInventory: boolean;
  horn: boolean;
  slot1: boolean;
  slot2: boolean;
  slot3: boolean;
  slot4: boolean;
  slot5: boolean;
  mouseXDelta: number;
  mouseYDelta: number;
  joystickX?: number;
  joystickY?: number;
}

export class PhysicsAndMovement {
  public position = new THREE.Vector3(0, 0, 5);
  public velocity = new THREE.Vector3(0, 0, 0);
  public yaw = 0; // Horizontal rotation
  public pitch = 0; // Vertical look angle
  public isGrounded = true;
  public isSprinting = false;
  public isCrouching = false;
  public isAiming = false;
  public currentSpeed = 0;

  public cameraMode: CameraMode = 'third_person';
  public currentVehicle: Vehicle | null = null;

  // Collision settings
  private playerRadius = 0.45;
  private playerHeight = 1.85;

  private stepTimeAccumulator = 0;

  constructor() {}

  /**
   * Updates player movement and physics
   */
  public update(
    delta: number,
    input: InputState,
    colliders: CityCollider[],
    stamina: number,
    onStaminaDrain: (amount: number) => void
  ) {
    // If driving a vehicle, run vehicle physics instead
    if (this.currentVehicle) {
      this.updateVehicleDriving(delta, input, colliders);
      return;
    }

    // Camera rotation from mouse delta
    const mouseSens = 0.0022;
    this.yaw -= input.mouseXDelta * mouseSens;
    this.pitch -= input.mouseYDelta * mouseSens;
    this.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.pitch));

    // Reset mouse deltas after applying
    input.mouseXDelta = 0;
    input.mouseYDelta = 0;

    // Sprinting & Crouching states
    this.isCrouching = input.crouch;
    this.isSprinting = input.sprint && !this.isCrouching && stamina > 5 && input.forward;
    this.isAiming = input.aim;

    if (this.isSprinting) {
      onStaminaDrain(delta * 14); // Consumes stamina
    }

    // Movement Speeds
    let baseSpeed = 4.8; // m/s normal walk
    if (this.isSprinting) baseSpeed = 8.6;
    if (this.isCrouching) baseSpeed = 2.4;
    if (this.isAiming) baseSpeed *= 0.6;

    // Direction calculation
    const moveVector = new THREE.Vector3();
    const hasAnalog = input.joystickX !== undefined && input.joystickY !== undefined && (input.joystickX !== 0 || input.joystickY !== 0);

    if (hasAnalog) {
      moveVector.x = input.joystickX!;
      moveVector.z = -input.joystickY!; // forward is negative Z in Three.js
      const magnitude = Math.min(1, Math.sqrt(moveVector.x * moveVector.x + moveVector.z * moveVector.z));
      if (magnitude > 0.05) {
        moveVector.normalize();
        moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        this.velocity.x = moveVector.x * baseSpeed * magnitude;
        this.velocity.z = moveVector.z * baseSpeed * magnitude;
        this.currentSpeed = baseSpeed * magnitude;

        this.stepTimeAccumulator += delta * (this.isSprinting ? 14 : 9) * magnitude;
        if (this.stepTimeAccumulator > Math.PI) {
          this.stepTimeAccumulator = 0;
          if (this.isGrounded) {
            soundManager.playFootstep(this.isSprinting);
          }
        }
      } else {
        this.velocity.x *= 0.7;
        this.velocity.z *= 0.7;
        this.currentSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
      }
    } else {
      if (input.forward) moveVector.z -= 1;
      if (input.backward) moveVector.z += 1;
      if (input.left) moveVector.x -= 1;
      if (input.right) moveVector.x += 1;

      if (moveVector.lengthSq() > 0.001) {
        moveVector.normalize();
        moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

        this.velocity.x = moveVector.x * baseSpeed;
        this.velocity.z = moveVector.z * baseSpeed;

        this.currentSpeed = baseSpeed;

        // Footstep audio cadence
        this.stepTimeAccumulator += delta * (this.isSprinting ? 14 : 9);
        if (this.stepTimeAccumulator > Math.PI) {
          this.stepTimeAccumulator = 0;
          if (this.isGrounded) {
            soundManager.playFootstep(this.isSprinting);
          }
        }
      } else {
        this.velocity.x *= 0.7;
        this.velocity.z *= 0.7;
        this.currentSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
      }
    }

    // Jump Physics
    if (input.jump && this.isGrounded && !this.isCrouching) {
      this.velocity.y = 6.2;
      this.isGrounded = false;
      soundManager.playFootstep(true);
    }

    // Gravity
    const gravity = -18.0;
    this.velocity.y += gravity * delta;

    // Apply movement with AABB obstacle collision
    const nextX = this.position.x + this.velocity.x * delta;
    const nextZ = this.position.z + this.velocity.z * delta;
    const nextY = this.position.y + this.velocity.y * delta;

    // Check X collision
    if (!this.checkCollision(nextX, this.position.y, this.position.z, colliders)) {
      this.position.x = nextX;
    } else {
      this.velocity.x = 0;
    }

    // Check Z collision
    if (!this.checkCollision(this.position.x, this.position.y, nextZ, colliders)) {
      this.position.z = nextZ;
    } else {
      this.velocity.z = 0;
    }

    // Ground check (floor level is y = 0)
    if (nextY <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.position.y = nextY;
      this.isGrounded = false;
    }
  }

  /**
   * Collision check against rectangular city colliders
   */
  private checkCollision(x: number, y: number, z: number, colliders: CityCollider[]): boolean {
    const r = this.playerRadius;
    const h = this.playerHeight;

    for (let i = 0; i < colliders.length; i++) {
      const c = colliders[i];
      // Overlap test
      if (
        x + r > c.min.x &&
        x - r < c.max.x &&
        z + r > c.min.z &&
        z - r < c.max.z &&
        y + h > c.min.y &&
        y < c.max.y
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Vehicle Driving Kinematics
   */
  private updateVehicleDriving(delta: number, input: InputState, colliders: CityCollider[]) {
    if (!this.currentVehicle) return;

    const v = this.currentVehicle;

    // Steering
    if (input.joystickX !== undefined && Math.abs(input.joystickX) > 0.08) {
      v.rotation -= input.joystickX * 2.0 * delta;
    } else {
      if (input.left) v.rotation += 1.8 * delta;
      if (input.right) v.rotation -= 1.8 * delta;
    }

    // Acceleration & Braking
    if (input.joystickY !== undefined && Math.abs(input.joystickY) > 0.08) {
      if (input.joystickY > 0) {
        v.speed = Math.min(v.maxSpeed, v.speed + v.acceleration * input.joystickY * delta);
      } else {
        v.speed = Math.max(-v.maxSpeed * 0.4, v.speed + v.acceleration * 1.4 * input.joystickY * delta);
      }
    } else {
      if (input.forward) {
        v.speed = Math.min(v.maxSpeed, v.speed + v.acceleration * delta);
      } else if (input.backward) {
        v.speed = Math.max(-v.maxSpeed * 0.4, v.speed - v.acceleration * 1.4 * delta);
      } else {
        // Coasting friction
        v.speed *= 0.96;
      }
    }

    // Audio sound modulation
    soundManager.updateVehicleEngine(v.speed / v.maxSpeed);

    if (input.horn) {
      soundManager.playDanfoHorn();
    }

    // Apply vehicle translation
    const forwardVec = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.rotation);
    const nextX = v.position[0] + forwardVec.x * v.speed * delta;
    const nextZ = v.position[2] + forwardVec.z * v.speed * delta;

    // Simple barrier check
    if (!this.checkCollision(nextX, 0, nextZ, colliders)) {
      v.position[0] = nextX;
      v.position[2] = nextZ;
    } else {
      v.speed = -v.speed * 0.3; // Bounce back
    }

    // Sync player position with vehicle
    this.position.set(v.position[0], v.position[1], v.position[2]);
    this.yaw = v.rotation;
  }

  /**
   * Updates Camera Position and Orientation based on First-Person / Third-Person mode
   */
  public updateCamera(camera: THREE.PerspectiveCamera, adsFovMultiplier = 1.0) {
    const targetFov = 72 / adsFovMultiplier;
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.2);
    camera.updateProjectionMatrix();

    if (this.currentVehicle) {
      // Vehicle chase camera
      const chaseDist = 7.5;
      const chaseHeight = 3.6;
      const rot = this.currentVehicle.rotation;

      const targetX = this.currentVehicle.position[0] + Math.sin(rot) * chaseDist;
      const targetZ = this.currentVehicle.position[2] + Math.cos(rot) * chaseDist;
      const targetY = this.currentVehicle.position[1] + chaseHeight;

      camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.15);
      camera.lookAt(
        this.currentVehicle.position[0],
        this.currentVehicle.position[1] + 1.2,
        this.currentVehicle.position[2]
      );
      return;
    }

    if (this.cameraMode === 'first_person') {
      // First person: at character eye level
      const eyeHeight = this.isCrouching ? 1.15 : 1.72;
      camera.position.set(this.position.x, this.position.y + eyeHeight, this.position.z);

      camera.rotation.order = 'YXZ';
      camera.rotation.y = this.yaw;
      camera.rotation.x = this.pitch;
    } else {
      // Third person: over-the-shoulder tactical follow camera
      const camDist = this.isAiming ? 1.9 : 3.4;
      const camHeight = this.isCrouching ? 1.2 : 1.85;
      const shoulderOffset = 0.55; // Right shoulder tactical offset

      const rightVec = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      const backVec = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

      const targetCamPos = new THREE.Vector3()
        .copy(this.position)
        .addScaledVector(rightVec, shoulderOffset)
        .addScaledVector(backVec, camDist);
      targetCamPos.y += camHeight - Math.sin(this.pitch) * camDist * 0.7;

      camera.position.copy(targetCamPos);

      // Look at target point ahead
      const lookTarget = new THREE.Vector3()
        .copy(this.position)
        .addScaledVector(rightVec, shoulderOffset * 0.4);
      lookTarget.y += camHeight;
      const forwardVec = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
      lookTarget.addScaledVector(forwardVec, 20);

      camera.lookAt(lookTarget);
    }
  }

  /**
   * Enter or exit vehicle
   */
  public toggleVehicle(nearbyVehicle: Vehicle | null): boolean {
    if (this.currentVehicle) {
      // Exit vehicle
      const exitPos = new THREE.Vector3(
        this.currentVehicle.position[0] - 2.2,
        0,
        this.currentVehicle.position[2]
      );
      this.position.copy(exitPos);
      this.currentVehicle.isOccupied = false;
      this.currentVehicle = null;
      soundManager.stopVehicleEngine();
      return false;
    } else if (nearbyVehicle) {
      // Enter vehicle
      this.currentVehicle = nearbyVehicle;
      nearbyVehicle.isOccupied = true;
      soundManager.startVehicleEngine();
      soundManager.playDanfoHorn();
      return true;
    }
    return false;
  }
}
