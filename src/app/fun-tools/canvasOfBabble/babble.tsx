"use client";
import ToolCard from '@/app/ui/toolCard/toolCard';
import { useState, useEffect, useRef, useCallback } from 'react';

import './babble.scss';

// Convert integer to base36 string
function numberToSeed(n: number): string {
    const u = (n >>> 0);
    return u.toString(36);
}

// Convert base36 string to integer
function seedToNumber(s: string): number | null {
    if (!s) return null;
    const parsed = parseInt(s, 36);
    if (Number.isNaN(parsed)) return null;
    return (parsed >>> 0);
}

// Deterministic PRNG: mulberry32
function createRng(seed32: number) {
    let t = seed32 >>> 0;

    // Essentially mixing the data bits across the 32 bits of the seed
    return function next(): number {
        t += 0x6D2B79F5;  // Add a large prime constant
        let x = Math.imul(t ^ (t >>> 15), 1 | t);  // Mix and multiply
        x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);  // More mixing
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;  // Final mix and normalize
    };
}

export default function CanvasOfBabble() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [seed, setSeed] = useState<number | null>(null);
    const [seedInput, setSeedInput] = useState<string>("");

    useEffect(() => {
        // Generate a dynamic default seed (uses current time mixed down to 32 bits)
        const now = Date.now();
        const defaultSeed = ((now & 0xffffffff) ^ ((now / 1000) | 0)) >>> 0;
        setSeed(defaultSeed);
        setSeedInput(numberToSeed(defaultSeed));
    }, []);

    // Render the canvas for the provided seed (or current state seed)
    const generateNewCanvas = useCallback((nextSeed?: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const activeSeed = (nextSeed ?? seed ?? 0) >>> 0;
        const rng = createRng(activeSeed);

        // Create proper 250x250 ImageData
        const imageData = ctx.createImageData(250, 250);
        const data = imageData.data;
        
        // Fill pixel data with correct indexing
        for (let y = 0; y < 250; y++) {
            for (let x = 0; x < 250; x++) {
                const pixelIndex = (y * 250 + x) * 4;
                // Use seeded PRNG for consistent colors per seed
                data[pixelIndex] = Math.floor(rng() * 256);     // Red
                data[pixelIndex + 1] = Math.floor(rng() * 256); // Green
                data[pixelIndex + 2] = Math.floor(rng() * 256); // Blue
                data[pixelIndex + 3] = 255; // Alpha
            }
        }
        
        // Render the image data to canvas
        ctx.putImageData(imageData, 0, 0);

        // Sync state if a new seed was used
        if (nextSeed !== undefined) {
            setSeed(nextSeed);
            setSeedInput(numberToSeed(nextSeed));
        }
    }, [seed]);

    // Automatically render a new canvas whenever the seed changes
    useEffect(() => {
        if (seed !== null) {
            generateNewCanvas();
        }
    }, [seed, generateNewCanvas]);

    // Press-and-hold support for arrow buttons with 0.5s delay before repeat
    const holdTimerRef = useRef<number | null>(null); // setInterval id
    const holdDelayRef = useRef<number | null>(null); // setTimeout id
    const holdDeltaRef = useRef<number>(0);

    function startHold(delta: number) {
        if (seed === null) return;
        // Prevent duplicate timers
        if (holdDelayRef.current !== null || holdTimerRef.current !== null) return;
        holdDeltaRef.current = delta;

        // After 500ms, start repeating and perform the first step
        holdDelayRef.current = window.setTimeout(() => {
            const step = () => {
                setSeed((prev) => (((prev ?? 0) + holdDeltaRef.current) >>> 0));
            };
            step();
            holdTimerRef.current = window.setInterval(step, 60);
            holdDelayRef.current = null;
        }, 500);
    }

    function stopHold() {
        // If repeating, stop interval
        if (holdTimerRef.current !== null) {
            clearInterval(holdTimerRef.current);
            holdTimerRef.current = null;
        }
        // If still in delay window (not yet repeating), treat as single step tap
        if (holdDelayRef.current !== null) {
            clearTimeout(holdDelayRef.current);
            holdDelayRef.current = null;
            // Single step on tap
            setSeed((prev) => (((prev ?? 0) + holdDeltaRef.current) >>> 0));
        }
    }

    // Cleanup timers if component unmounts
    useEffect(() => {
        return () => {
            if (holdTimerRef.current !== null) clearInterval(holdTimerRef.current);
            if (holdDelayRef.current !== null) clearTimeout(holdDelayRef.current);
        };
    }, []);

    return (
        <ToolCard title="Canvas of Babble">
            <canvas ref={canvasRef} id="babbleCanvas" width={250} height={250}></canvas>
            <div className="babble-controls">
                <button
                    id="prevSeedBtn"
                    aria-label="Previous seed"
                    onPointerDown={() => startHold(-1)}
                    onPointerUp={stopHold}
                    onPointerLeave={stopHold}
                >
                    {'<'}
                </button>
                <input
                    aria-label="Seed"
                    value={seedInput}
                    onChange={(e) => {
                        const v = e.target.value.trim().toLowerCase();
                        setSeedInput(v);
                        const n = seedToNumber(v);
                        if (n !== null) {
                            setSeed(n);
                        }
                    }}
                    className="babble-seed-input"
                />
                <button
                    id="nextSeedBtn"
                    aria-label="Next seed"
                    onPointerDown={() => startHold(1)}
                    onPointerUp={stopHold}
                    onPointerLeave={stopHold}
                >
                    {'>'}
                </button>
                <button
                    id="randomSeedBtn"
                    aria-label="Generate random seed"
                    onClick={() => {
                        // Mix time and Math.random to produce a fresh unsigned 32-bit seed
                        const now = Date.now();
                        const mixedRandom = (((now & 0xffffffff) ^ ((Math.random() * 0xffffffff) >>> 0)) >>> 0);
                        generateNewCanvas(mixedRandom);
                    }}
                >
                    Random
                </button>
            </div>
        </ToolCard>
    );
}