/**
 * Procedural Canvas Textures for LAGOS SURVIVAL: BLOCK WAR
 * Generates rich PBR textures in-memory: asphalt, Lagos Danfo yellow stripes,
 * market stalls, weathered concrete, zinc roofs, and commercial billboards.
 */

import * as THREE from 'three';

export class TextureGenerator {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  /**
   * Helper to set standard sRGB and repeat settings
   */
  private static configureTexture(texture: THREE.CanvasTexture, repeatX = 1, repeatY = 1): THREE.CanvasTexture {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Asphalt Road with Lagos yellow double center line and curb markings
   */
  public static getRoadTexture(): THREE.CanvasTexture {
    const key = 'road';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dark gritty asphalt base
    ctx.fillStyle = '#1c1f24';
    ctx.fillRect(0, 0, 512, 512);

    // Asphalt noise & grain
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const gray = Math.floor(25 + Math.random() * 25);
      ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Double Lagos Yellow center lines
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(246, 0, 8, 512);
    ctx.fillRect(258, 0, 8, 512);

    // White outer road edges
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(20, 0, 6, 512);
    ctx.fillRect(486, 0, 6, 512);

    const texture = new THREE.CanvasTexture(canvas);
    this.configureTexture(texture, 1, 6);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Pedestrian Crossing / Zebra
   */
  public static getZebraCrossingTexture(): THREE.CanvasTexture {
    const key = 'zebra';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#1e242b';
    ctx.fillRect(0, 0, 512, 256);

    // Thick white stripes
    ctx.fillStyle = '#ffffff';
    for (let i = 20; i < 500; i += 60) {
      ctx.fillRect(i, 30, 36, 196);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.configureTexture(texture, 1, 1);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Concrete Sidewalk Paver Pattern
   */
  public static getSidewalkTexture(): THREE.CanvasTexture {
    const key = 'sidewalk';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#565d68';
    ctx.fillRect(0, 0, 256, 256);

    // Slab tiles
    ctx.strokeStyle = '#373c44';
    ctx.lineWidth = 4;
    for (let x = 0; x <= 256; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y <= 256; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.configureTexture(texture, 4, 4);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Signature Yellow Danfo Decal Texture with black stripes & text
   */
  public static getDanfoDecalTexture(): THREE.CanvasTexture {
    const key = 'danfo_decal';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Brilliant Lagos taxi yellow
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 512, 256);

    // Iconic twin horizontal black stripes
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 110, 512, 22);
    ctx.fillRect(0, 145, 512, 22);

    // Route lettering: EKO - OSHODI - CMS
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('LAGOS STATE TRANSPORT - EKO EXPRESS', 32, 85);
    ctx.font = 'bold 18px monospace';
    ctx.fillText('NO SITTING ON ENGINE', 140, 215);

    const texture = new THREE.CanvasTexture(canvas);
    this.configureTexture(texture, 1, 1);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Corrugated Galvanized Zinc Roof (found across bustling Lagos markets)
   */
  public static getCorrugatedZincTexture(): THREE.CanvasTexture {
    const key = 'zinc';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    for (let x = 0; x < 256; x += 16) {
      const grad = ctx.createLinearGradient(x, 0, x + 16, 0);
      grad.addColorStop(0, '#525b68');
      grad.addColorStop(0.5, '#8490a0');
      grad.addColorStop(1, '#3b4350');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, 16, 256);
    }

    // Rust spots
    ctx.fillStyle = 'rgba(163, 67, 34, 0.45)';
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 8, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.configureTexture(texture, 3, 3);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Vibrant Market Awning Striped Canopy (Yellow & Green / Red & White)
   */
  public static getMarketAwningTexture(color: 'green' | 'red' | 'blue' = 'green'): THREE.CanvasTexture {
    const key = `market_awning_${color}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const mainColor = color === 'green' ? '#15803d' : color === 'red' ? '#b91c1c' : '#1d4ed8';
    for (let x = 0; x < 256; x += 32) {
      ctx.fillStyle = mainColor;
      ctx.fillRect(x, 0, 16, 256);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x + 16, 0, 16, 256);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.configureTexture(texture, 2, 2);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Skyscraper Window Matrix Texture
   */
  public static getSkyscraperWindowsTexture(lightUp = false): THREE.CanvasTexture {
    const key = `skyscraper_${lightUp}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Concrete facade
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 512);

    const rows = 16;
    const cols = 8;
    const w = 20;
    const h = 22;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 12 + c * 30;
        const y = 12 + r * 30;

        const isLit = Math.random() > 0.45;
        if (isLit) {
          ctx.fillStyle = lightUp ? '#fef08a' : '#60a5fa';
        } else {
          ctx.fillStyle = '#0f172a';
        }
        ctx.fillRect(x, y, w, h);

        // Window frames
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(x, y, w, h);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.configureTexture(texture, 1, 2);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Lagos Commercial Billboards (Mama Ngozi Suya, Zenith Bank, Block War Alert)
   */
  public static getBillboardTexture(index: number): THREE.CanvasTexture {
    const key = `billboard_${index}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    if (index === 0) {
      // Suya & Jollof Buka
      const grad = ctx.createLinearGradient(0, 0, 512, 256);
      grad.addColorStop(0, '#7f1d1d');
      grad.addColorStop(1, '#ea580c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('MAMA NGOZI SUYA & BUKA', 30, 80);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('Hot Peppered Beef • Jollof Rice • Fresh Fish', 30, 130);
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('RESTORE HEALTH & HUNGER NOW ₦500', 30, 195);
    } else if (index === 1) {
      // Eko Tactical Armory
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 256);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, 492, 236);

      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 38px monospace';
      ctx.fillText('EKO DEFENSE ARMORY', 40, 75);
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('Authorized Tactical Gear • Ammo • Armor Plates', 40, 125);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('OSHODI SECTOR 4 • UPGRADE LOADOUTS', 40, 190);
    } else {
      // Block War City Notice
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(0, 0, 512, 256);

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText('LAGOS SURVIVAL: BLOCK WAR', 25, 75);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'italic bold 20px sans-serif';
      ctx.fillText('"Survive the streets. Dominate the battlefield."', 25, 120);
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('BUILD YOUR EMPIRE • BECOME A LEGEND', 25, 180);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.configureTexture(texture, 1, 1);
    this.cache.set(key, texture);
    return texture;
  }
}
