/**
 * Responsive Mobile Touch Controls with Draggable Analog Joystick
 * LAGOS SURVIVAL: BLOCK WAR
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crosshair,
  Zap,
  RotateCw,
  Eye,
  Hammer,
  Shield,
  ArrowUp,
  Volume2,
} from 'lucide-react';
import { InputState } from '../game/systems/PhysicsAndMovement';

interface MobileControlsProps {
  inputs: InputState;
  isVisible?: boolean;
  onFireDown: () => void;
  onFireUp: () => void;
  onAimToggle: () => void;
  onJump: () => void;
  onInteract: () => void;
  onReload: () => void;
  onToggleCamera: () => void;
  onToggleBuild: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  inputs,
  isVisible = true,
  onFireDown,
  onFireUp,
  onAimToggle,
  onJump,
  onInteract,
  onReload,
  onToggleCamera,
  onToggleBuild,
}) => {
  // Joystick State
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingJoystick, setIsDraggingJoystick] = useState(false);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const activeTouchIdRef = useRef<number | null>(null);

  // Look / Aim Drag State (Right side swipe)
  const lookTouchIdRef = useRef<number | null>(null);
  const lastLookPosRef = useRef<{ x: number; y: number } | null>(null);

  const JOYSTICK_RADIUS = 52; // Max drag distance from center in px

  /**
   * Reset joystick to center and clear inputs
   */
  const resetJoystick = useCallback(() => {
    setKnobPos({ x: 0, y: 0 });
    setIsDraggingJoystick(false);
    activeTouchIdRef.current = null;
    inputs.joystickX = 0;
    inputs.joystickY = 0;
    inputs.forward = false;
    inputs.backward = false;
    inputs.left = false;
    inputs.right = false;
    inputs.sprint = false;
  }, [inputs]);

  /**
   * Process position delta and update continuous input vector
   */
  const handleJoystickMove = useCallback((clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    let clampedX = deltaX;
    let clampedY = deltaY;

    if (distance > JOYSTICK_RADIUS) {
      const angle = Math.atan2(deltaY, deltaX);
      clampedX = Math.cos(angle) * JOYSTICK_RADIUS;
      clampedY = Math.sin(angle) * JOYSTICK_RADIUS;
    }

    setKnobPos({ x: clampedX, y: clampedY });

    // Normalized continuous inputs [-1, 1]
    const normX = clampedX / JOYSTICK_RADIUS;
    const normY = -clampedY / JOYSTICK_RADIUS; // -Y is forward (up)

    inputs.joystickX = normX;
    inputs.joystickY = normY;

    // Discrete boolean fallbacks for compatible systems
    inputs.forward = normY > 0.25;
    inputs.backward = normY < -0.25;
    inputs.left = normX < -0.25;
    inputs.right = normX > 0.25;

    // Auto-sprint if pushed hard forward (> 85%)
    inputs.sprint = normY > 0.85;
  }, [inputs]);

  // Touch Event Handlers for Joystick
  const onJoystickTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (activeTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouchIdRef.current = touch.identifier;
    setIsDraggingJoystick(true);
    handleJoystickMove(touch.clientX, touch.clientY);
  };

  const onJoystickTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchIdRef.current) {
        handleJoystickMove(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const onJoystickTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchIdRef.current) {
        resetJoystick();
        break;
      }
    }
  };

  // Mouse / Pointer fallback (allows testing on desktop touch-emulation or direct click)
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return; // Handled by touch events
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDraggingJoystick(true);
    handleJoystickMove(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    if (isDraggingJoystick) {
      handleJoystickMove(e.clientX, e.clientY);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    resetJoystick();
  };

  // Right-Screen Touch Look Handler
  const onLookTouchStart = (e: React.TouchEvent) => {
    if (lookTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    lookTouchIdRef.current = touch.identifier;
    lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onLookTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current && lastLookPosRef.current) {
        const deltaX = touch.clientX - lastLookPosRef.current.x;
        const deltaY = touch.clientY - lastLookPosRef.current.y;

        // Apply to mouse deltas for smooth camera rotation
        inputs.mouseXDelta += deltaX * 1.5;
        inputs.mouseYDelta += deltaY * 1.5;

        lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
        break;
      }
    }
  };

  const onLookTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
        lastLookPosRef.current = null;
        break;
      }
    }
  };

  useEffect(() => {
    return () => {
      resetJoystick();
    };
  }, [resetJoystick]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 overflow-hidden font-tech">
      {/* Invisible Look/Aim Swipe Surface on Right Half of Screen */}
      <div
        className="absolute top-0 right-0 w-1/2 h-2/3 pointer-events-auto touch-none"
        onTouchStart={onLookTouchStart}
        onTouchMove={onLookTouchMove}
        onTouchEnd={onLookTouchEnd}
        onTouchCancel={onLookTouchEnd}
      />

      {/* --- BOTTOM-LEFT: DRAGGABLE ANALOG JOYSTICK OVERLAY --- */}
      <div className="absolute bottom-6 left-6 pointer-events-auto touch-none">
        <div
          ref={joystickBaseRef}
          onTouchStart={onJoystickTouchStart}
          onTouchMove={onJoystickTouchMove}
          onTouchEnd={onJoystickTouchEnd}
          onTouchCancel={onJoystickTouchEnd}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="relative w-36 h-36 rounded-full bg-zinc-950/70 border-2 border-amber-500/40 backdrop-blur-md shadow-[0_0_25px_rgba(245,158,11,0.25)] flex items-center justify-center cursor-pointer"
        >
          {/* Outer Compass & Crosshair Markings */}
          <div className="absolute inset-2 rounded-full border border-zinc-700/50 pointer-events-none" />
          <div className="absolute top-1 text-[9px] text-amber-400/80 font-bold tracking-widest pointer-events-none">
            FWD
          </div>
          <div className="absolute bottom-1 text-[9px] text-zinc-500 font-bold tracking-widest pointer-events-none">
            REV
          </div>
          <div className="absolute left-1.5 text-[9px] text-zinc-500 font-bold pointer-events-none">
            L
          </div>
          <div className="absolute right-1.5 text-[9px] text-zinc-500 font-bold pointer-events-none">
            R
          </div>

          {/* Crosshair guide lines */}
          <div className="absolute w-full h-[1px] bg-amber-500/15 pointer-events-none" />
          <div className="absolute h-full w-[1px] bg-amber-500/15 pointer-events-none" />

          {/* Draggable Inner Knob / Thumbstick */}
          <div
            className={`w-16 h-16 rounded-full border-2 transition-transform duration-75 flex items-center justify-center shadow-xl ${
              isDraggingJoystick
                ? 'bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 border-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-105'
                : 'bg-zinc-800/90 border-amber-500/60 shadow-lg'
            }`}
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              transition: isDraggingJoystick ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
            }}
          >
            {/* Center Thumb Grip & Directional Arrow */}
            <div className="w-8 h-8 rounded-full bg-zinc-950/60 border border-black/30 flex items-center justify-center">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  isDraggingJoystick ? 'bg-black' : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Joystick Label */}
        <div className="text-[10px] text-center text-amber-300/80 font-semibold tracking-widest mt-1.5 uppercase">
          MOVE JOYSTICK
        </div>
      </div>

      {/* --- BOTTOM-RIGHT: TACTICAL COMBAT & ACTION BUTTONS --- */}
      <div className="absolute bottom-6 right-6 pointer-events-auto flex flex-col items-end gap-3">
        {/* Top Mini Utilities Row (Camera, Build, Reload, Enter Vehicle) */}
        <div className="flex items-center gap-2">
          {/* Camera Perspective Toggle */}
          <button
            onClick={onToggleCamera}
            className="w-11 h-11 rounded-xl bg-zinc-900/90 border border-zinc-700/80 active:border-blue-400 flex items-center justify-center text-zinc-300 active:scale-95 transition-all shadow-md"
            title="Switch 1st/3rd Camera"
          >
            <Eye className="w-5 h-5 text-blue-400" />
          </button>

          {/* Fortification Build Mode Toggle */}
          <button
            onClick={onToggleBuild}
            className="w-11 h-11 rounded-xl bg-zinc-900/90 border border-zinc-700/80 active:border-emerald-400 flex items-center justify-center text-emerald-400 active:scale-95 transition-all shadow-md"
            title="Toggle Building Mode"
          >
            <Hammer className="w-5 h-5" />
          </button>

          {/* Reload Weapon */}
          <button
            onClick={onReload}
            className="w-11 h-11 rounded-xl bg-zinc-900/90 border border-zinc-700/80 active:border-amber-400 flex items-center justify-center text-zinc-300 active:scale-95 transition-all shadow-md"
            title="Reload Weapon"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          {/* Interact / Drive (E key) */}
          <button
            onClick={onInteract}
            className="w-12 h-11 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 border border-amber-300 text-black font-extrabold text-sm flex items-center justify-center active:scale-95 transition-all shadow-lg"
            title="Interact / Enter Vehicle"
          >
            ENTER
          </button>
        </div>

        {/* Primary Combat Controls Row */}
        <div className="flex items-center gap-3">
          {/* Aim-Down-Sights (ADS) */}
          <button
            onClick={onAimToggle}
            className="w-14 h-14 rounded-2xl bg-zinc-900/95 border-2 border-zinc-700 active:border-amber-400 flex flex-col items-center justify-center text-amber-400 font-bold active:scale-95 transition-all shadow-lg"
          >
            <Crosshair className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-wider">ADS</span>
          </button>

          {/* Jump Button */}
          <button
            onClick={onJump}
            className="w-14 h-14 rounded-2xl bg-zinc-900/95 border-2 border-zinc-700 active:border-blue-400 flex flex-col items-center justify-center text-white font-bold active:scale-95 transition-all shadow-lg"
          >
            <Zap className="w-5 h-5 mb-0.5 text-blue-400" />
            <span className="text-[10px] tracking-wider">JUMP</span>
          </button>

          {/* Huge Main Tactical FIRE Trigger Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onFireDown();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onFireUp();
            }}
            onMouseDown={onFireDown}
            onMouseUp={onFireUp}
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 border-2 border-amber-300 text-black font-black text-sm tracking-wider flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.6)] active:scale-95 transition-all cursor-pointer"
          >
            FIRE
          </button>
        </div>
      </div>
    </div>
  );
};
