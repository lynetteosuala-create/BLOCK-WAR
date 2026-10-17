/**
 * Real-Time Multiplayer Synchronization System for LAGOS SURVIVAL: BLOCK WAR
 * Synchronizes player positions, rotations, character models, shooting, and match scores.
 */

import * as THREE from 'three';
import { MultiplayerPlayer, KillFeedEntry, CharacterAppearance } from '../../types/game';
import { CharacterModelBuilder, CharacterRig } from '../models/character';
import { WeaponModelBuilder } from '../models/weapons';

export interface RemotePlayerEntity {
  data: MultiplayerPlayer;
  rig: CharacterRig;
  targetPos: THREE.Vector3;
  targetYaw: number;
}

export class MultiplayerSystem {
  private channel: BroadcastChannel | null = null;
  public localPlayerId: string;
  public localTeam: 'red' | 'blue' = 'blue';
  public remotePlayers: Map<string, RemotePlayerEntity> = new Map();
  public killFeed: KillFeedEntry[] = [];
  public teamScores = { red: 0, blue: 0 };
  public isConnected = true;
  public roomCode = 'LAGOS-MAIN';

  public onScoreUpdate?: (scores: { red: number; blue: number }) => void;
  public onKillFeedUpdate?: (entry: KillFeedEntry) => void;

  constructor(private scene: THREE.Scene) {
    this.localPlayerId = 'player_' + Math.random().toString(36).substring(2, 9);

    // Initialize BroadcastChannel for instant cross-tab multiplayer sync
    try {
      this.channel = new BroadcastChannel('lagos_block_war_multiplayer');
      this.channel.onmessage = (event) => {
        this.handleMessage(event.data);
      };
    } catch {
      console.warn('BroadcastChannel not supported in this environment');
    }
  }

  /**
   * Broadcasts local player state to other players
   */
  public broadcastLocalState(
    position: THREE.Vector3,
    yaw: number,
    pitch: number,
    weaponId: string,
    isFiring: boolean,
    health: number,
    appearance: CharacterAppearance
  ) {
    if (!this.channel) return;

    const payload = {
      type: 'PLAYER_UPDATE',
      player: {
        id: this.localPlayerId,
        name: appearance.name || 'Lagos Agent',
        team: this.localTeam,
        position: [position.x, position.y, position.z],
        rotation: yaw,
        pitch,
        health,
        kills: 0,
        deaths: 0,
        currentWeapon: weaponId,
        isFiring,
        appearance,
        lastUpdate: Date.now(),
        ping: 18 + Math.floor(Math.random() * 8),
      },
    };

    this.channel.postMessage(payload);
  }

  /**
   * Broadcasts a hit or kill event
   */
  public broadcastKill(victimName: string, weaponName: string) {
    if (!this.channel) return;

    const entry: KillFeedEntry = {
      id: Math.random().toString(),
      killer: 'You',
      victim: victimName,
      weapon: weaponName,
      timestamp: Date.now(),
    };

    if (this.localTeam === 'blue') this.teamScores.blue += 100;
    else this.teamScores.red += 100;

    this.killFeed.unshift(entry);
    if (this.killFeed.length > 5) this.killFeed.pop();

    this.channel.postMessage({
      type: 'KILL_EVENT',
      entry,
      teamScores: this.teamScores,
    });

    if (this.onKillFeedUpdate) this.onKillFeedUpdate(entry);
    if (this.onScoreUpdate) this.onScoreUpdate(this.teamScores);
  }

  /**
   * Processes incoming multiplayer packets
   */
  private handleMessage(data: any) {
    if (!data || !data.type) return;

    if (data.type === 'PLAYER_UPDATE') {
      const p: MultiplayerPlayer = data.player;
      if (p.id === this.localPlayerId) return; // Ignore own echoes

      let remote = this.remotePlayers.get(p.id);
      if (!remote) {
        // Spawn 3D avatar for incoming player
        const rig = CharacterModelBuilder.buildCharacter(p.appearance);
        rig.root.position.set(p.position[0], p.position[1], p.position[2]);

        const weapon3D = WeaponModelBuilder.buildWeapon(p.currentWeapon || 'eko_viper');
        rig.weaponMount.add(weapon3D.group);

        this.scene.add(rig.root);

        remote = {
          data: p,
          rig,
          targetPos: new THREE.Vector3(...p.position),
          targetYaw: p.rotation,
        };
        this.remotePlayers.set(p.id, remote);
      } else {
        remote.data = p;
        remote.targetPos.set(p.position[0], p.position[1], p.position[2]);
        remote.targetYaw = p.rotation;
      }
    } else if (data.type === 'KILL_EVENT') {
      this.killFeed.unshift(data.entry);
      if (this.killFeed.length > 5) this.killFeed.pop();
      if (data.teamScores) {
        this.teamScores = data.teamScores;
        if (this.onScoreUpdate) this.onScoreUpdate(this.teamScores);
      }
      if (this.onKillFeedUpdate) this.onKillFeedUpdate(data.entry);
    }
  }

  /**
   * Interpolate remote player positions smoothly
   */
  public update(delta: number, time: number) {
    const now = Date.now();

    this.remotePlayers.forEach((remote, id) => {
      // Timeout inactive players (5 seconds)
      if (now - remote.data.lastUpdate > 5000) {
        this.scene.remove(remote.rig.root);
        remote.rig.dispose();
        this.remotePlayers.delete(id);
        return;
      }

      // Smooth lerp
      remote.rig.root.position.lerp(remote.targetPos, 0.2);
      remote.rig.root.rotation.y = THREE.MathUtils.lerp(remote.rig.root.rotation.y, remote.targetYaw, 0.2);

      const isMoving = remote.rig.root.position.distanceTo(remote.targetPos) > 0.1;
      remote.rig.animate(time, isMoving ? 1.0 : 0, false, remote.data.isFiring);
    });
  }

  public dispose() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.remotePlayers.forEach((p) => {
      this.scene.remove(p.rig.root);
      p.rig.dispose();
    });
    this.remotePlayers.clear();
  }
}
