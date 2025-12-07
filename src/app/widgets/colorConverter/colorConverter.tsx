'use client';

import ToolCard from '../../ui/toolCard/toolCard';
import './colorConverter.scss'
import { useEffect, useState } from "react";
import { cssNamedColors, type CSSNamedColor } from './cssNamedColors';

export default function ColorConverter() {
    const [currentRGB, setCurrentRGB] = useState<[number, number, number]>([0, 0, 0]);
    const [currentHex, setCurrentHex] = useState("000000");
    const [currentHSL, setCurrentHSL] = useState<[number, number, number]>([0, 0, 0]);
    const [currentHSV, setCurrentHSV] = useState<[number, number, number]>([0, 0, 0]);
    const [currentCMY, setCurrentCMY] = useState<[number, number, number]>(rgbToCmy(0, 0, 0));
    const [currentHWB, setCurrentHWB] = useState<[number, number, number]>(rgbToHwb(0, 0, 0));
    const [lastChanged, setLastChanged] = useState<'rgb' | 'hsl' | 'hsv' | 'hex' | 'cmy' | 'hwb'>('rgb');
    const [closestNamedColor, setClosestNamedColor] = useState<CSSNamedColor | null>(null);

    // Function to generate a random RGB color
    function generateRandomRGB(): [number, number, number] {
        return [
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256)
        ] as [number, number, number];
    }

    // Initialize with random color on client side only
    useEffect(() => {
        setCurrentRGB(generateRandomRGB());
    }, []);

    
    // Color Value Sync on RGB change
    useEffect(() => {
        syncWithRgb();
    }, [currentRGB]);

    // Find closest named color when RGB changes
    useEffect(() => {
        setClosestNamedColor(findClosestNamedColor(currentRGB[0], currentRGB[1], currentRGB[2]));
    }, [currentRGB]);

    function syncWithRgb() {
        // Hex sync
        if (lastChanged != 'hex') {
        setCurrentHex(rgbToHex(currentRGB[0], currentRGB[1], currentRGB[2]));
        }

        // HSL sync
        if (lastChanged !== 'hsl') {
            setCurrentHSL(rgbToHsl(currentRGB[0], currentRGB[1], currentRGB[2]));
        }

        // HSV sync
        if (lastChanged !== 'hsv') {
            setCurrentHSV(rgbToHsv(currentRGB[0], currentRGB[1], currentRGB[2]));
        }

        // CMY sync
        if (lastChanged !== 'cmy') {
            setCurrentCMY(rgbToCmy(currentRGB[0], currentRGB[1], currentRGB[2]));
        }
        
        // HWB sync
        if (lastChanged !== 'hwb') {
            setCurrentHWB(rgbToHwb(currentRGB[0], currentRGB[1], currentRGB[2]));
        }
    }
    
    // --- rgbToX conversion functions ---
    function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
        // Convert RGB (0-255) to HSL (0-360, 0-100, 0-100)
        let red = r / 255;
        let green = g / 255;
        let blue = b / 255;
        let max = Math.max(red, green, blue);
        let min = Math.min(red, green, blue);
        let h = 0, s = 0, l = (max + min) / 2;
        if (max === min) {
            h = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case red:
                    h = (green - blue) / d + (green < blue ? 6 : 0);
                    break;
                case green:
                    h = (blue - red) / d + 2;
                    break;
                case blue:
                    h = (red - green) / d + 4;
                    break;
            }
            h /= 6;
        }
        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }

    function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
        // Convert RGB (0-255) to HSV (0-360, 0-100, 0-100)
        let red = r / 255;
        let green = g / 255;
        let blue = b / 255;
        let max = Math.max(red, green, blue);
        let min = Math.min(red, green, blue);
        let h = 0, s = 0, v = max;
        let d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max === min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case red:
                    h = (green - blue) / d + (green < blue ? 6 : 0);
                    break;
                case green:
                    h = (blue - red) / d + 2;
                    break;
                case blue:
                    h = (red - green) / d + 4;
                    break;
            }
            h /= 6;
        }
        return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
    }

    function rgbToCmy(r: number, g: number, b: number): [number, number, number] {
        // Convert RGB (0-255) to CMY (0-100, 0-100, 0-100)
        let c = 1 - (r / 255);
        let m = 1 - (g / 255);
        let y = 1 - (b / 255);
        return [Math.round(c * 100), Math.round(m * 100), Math.round(y * 100)];
    }
    function rgbToHex(r: number, g: number, b: number): string {
        return (
            r.toString(16).padStart(2, "0").toUpperCase() +
            g.toString(16).padStart(2, "0").toUpperCase() +
            b.toString(16).padStart(2, "0").toUpperCase()
        );
    }

    function rgbToHwb(r: number, g: number, b: number): [number, number, number] {
        // Convert RGB (0-255) to HWB (0-360, 0-100, 0-100)
        const [h] = rgbToHsv(r, g, b);
        const w = Math.min(r, g, b) / 255;
        const v = Math.max(r, g, b) / 255;
        const bVal = 1 - v;
        return [h, Math.round(w * 100), Math.round(bVal * 100)];
    }
    
    // --- XtoRgb conversion functions ---
    function hslToRgb(h: number, s: number, l: number): [number, number, number] {
        // Convert HSL (0-360, 0-100, 0-100) to RGB (0-255)
        let hue = h / 360;
        let sat = s / 100;
        let light = l / 100;
        let r = 0, g = 0, b = 0;
        if (sat === 0) {
            // Achromatic (grey)
            r = g = b = Math.round(light * 255);
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            let q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
            let p = 2 * light - q;
            r = Math.round(hue2rgb(p, q, hue + 1/3) * 255);
            g = Math.round(hue2rgb(p, q, hue) * 255);
            b = Math.round(hue2rgb(p, q, hue - 1/3) * 255);
        }
        return [r, g, b];
    }

    // --- HSV Conversion Functions ---
    function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
        // Convert HSV (0-360, 0-100, 0-100) to RGB (0-255)
        let hue = h;
        let sat = s / 100;
        let val = v / 100;
        let r = 0, g = 0, b = 0;
        if (sat === 0) {
            // Achromatic (grey)
            r = g = b = Math.round(val * 255);
        } else {
            hue = hue % 360;
            let sector = Math.floor(hue / 60);
            let fraction = (hue / 60) - sector;
            let p = val * (1 - sat);
            let q = val * (1 - sat * fraction);
            let t = val * (1 - sat * (1 - fraction));
            switch (sector) {
                case 0:
                    r = val; g = t; b = p;
                    break;
                case 1:
                    r = q; g = val; b = p;
                    break;
                case 2:
                    r = p; g = val; b = t;
                    break;
                case 3:
                    r = p; g = q; b = val;
                    break;
                case 4:
                    r = t; g = p; b = val;
                    break;
                case 5:
                default:
                    r = val; g = p; b = q;
                    break;
            }
            r = Math.round(r * 255);
            g = Math.round(g * 255);
            b = Math.round(b * 255);
        }
        return [r, g, b];
    }
    
    function cmyToRgb(c: number, m: number, y: number): [number, number, number] {
        // Convert CMY (0-100, 0-100, 0-100) to RGB (0-255)
        let cyan = c / 100;
        let magenta = m / 100;
        let yellow = y / 100;
        let r = Math.round((1 - cyan) * 255);
        let g = Math.round((1 - magenta) * 255);
        let b = Math.round((1 - yellow) * 255);
        return [r, g, b];
    }

    function hwbToRgb(h: number, w: number, b: number): [number, number, number] {
        // Convert HWB (0-360, 0-100, 0-100) to RGB (0-255)
        w = w / 100;
        b = b / 100;
        let ratio = w + b;
        if (ratio > 1) {
            w /= ratio;
            b /= ratio;
        }
        const v = 1 - b;
        const s = v === 0 ? 0 : 1 - w / v;
        const [r, g, bl] = hsvToRgb(h, s * 100, v * 100);
        return [r, g, bl];
    }

    // --- Named Color Functions ---
    function findClosestNamedColor(red: number, green: number, blue: number): CSSNamedColor | null {
        if (cssNamedColors.length === 0) return null;
        
        let closestColor = cssNamedColors[0];
        let minDistance = Number.MAX_VALUE;
        
        for (const namedColor of cssNamedColors) {
            const distance = calculateColorDistance(
                red, green, blue,
                namedColor.rgb[0], namedColor.rgb[1], namedColor.rgb[2]
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = namedColor;
            }
        }
        
        return closestColor;
    }
    
    function calculateColorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
        // Calculate Euclidean distance between two RGB colors
        const deltaR = r1 - r2;
        const deltaG = g1 - g2;
        const deltaB = b1 - b2;
        
        return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB);
    }

    // 6. Handlers (grouped by model)
    function handleRgbChange(rgbIndex: number, value: string) {
        setLastChanged('rgb');
        let sanitized = value.replace(/[^0-9]/g, '');
        if (sanitized === "") sanitized = "0";
        let parsedValue = parseInt(sanitized, 10);
        if (isNaN(parsedValue) || parsedValue < 0) parsedValue = 0;
        if (parsedValue > 255) parsedValue = 255;
        const newRGB = currentRGB.map((existing, index) => index === rgbIndex ? parsedValue : existing) as [number, number, number];
        setCurrentRGB(newRGB);
    }
    
    function handleHexChange(e: React.ChangeEvent<HTMLInputElement>) {
        setLastChanged('hex');
        let value = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, "");
        setCurrentHex(value);
        if (/^([0-9A-F]{3}){1,2}$/.test(value)) {
            let hexValue = value;
            if (hexValue.length === 3 && (hexValue[0] == hexValue[1] && hexValue[0] == hexValue[2])) {
                hexValue = hexValue + hexValue;
            }
            if (hexValue.length === 6) {
                const r = parseInt(hexValue.substring(0, 2), 16);
                const g = parseInt(hexValue.substring(2, 4), 16);
                const b = parseInt(hexValue.substring(4, 6), 16);
                if (
                    r !== currentRGB[0] ||
                    g !== currentRGB[1] ||
                    b !== currentRGB[2]
                ) {
                    setCurrentRGB([r, g, b]);
                }
            }
        }
    }
    function handleHslChange(hslIndex: number, value: string) {
        setLastChanged('hsl');
        let sanitized = value.replace(/[^0-9]/g, '');
        if (sanitized === "") sanitized = "0";
        let parsedValue = parseInt(sanitized, 10);
        if (isNaN(parsedValue) || parsedValue < 0) parsedValue = 0;
        if (hslIndex === 0 && parsedValue > 360) parsedValue = 360;
        if ((hslIndex === 1 || hslIndex === 2) && parsedValue > 100) parsedValue = 100;
        const newHSL: [number, number, number] = currentHSL.map((existing, index) => index === hslIndex ? parsedValue : existing) as [number, number, number];
        setCurrentHSL(newHSL);
        const newRGB = hslToRgb(newHSL[0], newHSL[1], newHSL[2]);
        setCurrentRGB(newRGB);
    }

    // Handle HSV input change
    function handleHsvChange(hsvIndex: number, value: string) {
        setLastChanged('hsv');
        let sanitized = value.replace(/[^0-9]/g, '');
        if (sanitized === "") sanitized = "0";
        let parsedValue = parseInt(sanitized, 10);
        if (isNaN(parsedValue) || parsedValue < 0) parsedValue = 0;
        if (hsvIndex === 0 && parsedValue > 360) parsedValue = 360;
        if ((hsvIndex === 1 || hsvIndex === 2) && parsedValue > 100) parsedValue = 100;
        const newHSV: [number, number, number] = currentHSV.map((existing, index) => index === hsvIndex ? parsedValue : existing) as [number, number, number];
        setCurrentHSV(newHSV);
        const newRGB = hsvToRgb(newHSV[0], newHSV[1], newHSV[2]);
        setCurrentRGB(newRGB);
    }

    // Handle CMY input change
    function handleCmyChange(cmyIndex: number, value: string) {
        setLastChanged('cmy');
        let sanitized = value.replace(/[^0-9]/g, '');
        if (sanitized === "") sanitized = "0";
        let parsedValue = parseInt(sanitized, 10);
        if (isNaN(parsedValue) || parsedValue < 0) parsedValue = 0;
        if (parsedValue > 100) parsedValue = 100;
        const newCMY: [number, number, number] = currentCMY.map((existing, index) => index === cmyIndex ? parsedValue : existing) as [number, number, number];
        setCurrentCMY(newCMY);
        // Update RGB
        const newRGB = cmyToRgb(newCMY[0], newCMY[1], newCMY[2]);
        setCurrentRGB(newRGB);
    }

    // Handler for HWB
    function handleHwbChange(hwbIndex: number, value: string) {
        setLastChanged('hwb');
        let sanitized = value.replace(/[^0-9]/g, '');
        if (sanitized === "") sanitized = "0";
        let parsedValue = parseInt(sanitized, 10);
        if (isNaN(parsedValue) || parsedValue < 0) parsedValue = 0;
        if (hwbIndex === 0 && parsedValue > 360) parsedValue = 360;
        if ((hwbIndex === 1 || hwbIndex === 2) && parsedValue > 100) parsedValue = 100;
        const newHWB: [number, number, number] = currentHWB.map((existing, index) => index === hwbIndex ? parsedValue : existing) as [number, number, number];
        setCurrentHWB(newHWB);
        const newRGB = hwbToRgb(newHWB[0], newHWB[1], newHWB[2]);
        setCurrentRGB(newRGB);
    }

    return(
        <ToolCard title="Color Converter">
            <form name="conversionsForm" id="conversionsForm">
                <button id ="randomColorBtn" type="button" onClick={() => {
                    setLastChanged('rgb'); 
                    setCurrentRGB(generateRandomRGB());
                }}></button>
                <div id="colorSwatchContainer">
                    <div 
                        id="currentColorSwatch" 
                        style={{ 
                            backgroundColor: `rgb(${currentRGB[0]}, ${currentRGB[1]}, ${currentRGB[2]})` 
                        }}
                    />
                </div>
                
                <span id="hexInputGroup" className="tripleInputContainer">
                    <label htmlFor="hex" className="tripleInputLabel">HEX</label>
                    <span>
                        <span>#</span>
                        <input
                            type="text"
                            name="hex"
                            id="hex"
                            value={currentHex}
                            maxLength={6}
                            onChange={handleHexChange}
                            className="hexInput"
                        />
                    </span>
                </span>

                
                <span id="fullRgbContainer" className="tripleInputContainer">
                    <label htmlFor="RGB1" className="tripleInputLabel">RGB</label>
                    {[
                        { id: "RGB1" },
                        { id: "RGB2" },
                        { id: "RGB3" }
                    ].map((channel, i) => (
                        <input
                            className="tripleInput"
                            type="number"
                            id={channel.id}
                            name={channel.id}
                            value={currentRGB[i]}
                            onChange={e => handleRgbChange(i, e.target.value)}
                            min={0}
                            max={255}
                            key={channel.id}
                        />
                    ))}
                </span>

                <span id="fullHslContainer" className="tripleInputContainer">
                    <label htmlFor="HSL1" className="tripleInputLabel">HSL</label>
                    {[
                        { id: "HSL1", min: 0, max: 360 },
                        { id: "HSL2", min: 0, max: 100 },
                        { id: "HSL3", min: 0, max: 100 }
                    ].map((channel, i) => (
                        <input
                            className="tripleInput"
                            type="number"
                            id={channel.id}
                            name={channel.id}
                            value={currentHSL[i]}
                            onChange={e => handleHslChange(i, e.target.value)}
                            min={channel.min}
                            max={channel.max}
                            key={channel.id}
                        />
                    ))}
                </span>

                <span id="fullHsvContainer" className="tripleInputContainer">
                    <label htmlFor="HSV1" className="tripleInputLabel">HSV</label>
                    {[
                        { id: "HSV1", min: 0, max: 360 },
                        { id: "HSV2", min: 0, max: 100 },
                        { id: "HSV3", min: 0, max: 100 }
                    ].map((channel, i) => (
                        <input
                            className="tripleInput"
                            type="number"
                            id={channel.id}
                            name={channel.id}
                            value={currentHSV[i]}
                            onChange={e => handleHsvChange(i, e.target.value)}
                            min={channel.min}
                            max={channel.max}
                            key={channel.id}
                        />
                    ))}
                </span>

                <span id="fullCmyContainer" className="tripleInputContainer">
                    <label htmlFor="CMY1" className="tripleInputLabel">CMY</label>
                    {[
                        { id: "CMY1", min: 0, max: 100 },
                        { id: "CMY2", min: 0, max: 100 },
                        { id: "CMY3", min: 0, max: 100 }
                    ].map((channel, i) => (
                        <input
                            className="tripleInput"
                            type="number"
                            id={channel.id}
                            name={channel.id}
                            value={currentCMY[i]}
                            onChange={e => handleCmyChange(i, e.target.value)}
                            min={channel.min}
                            max={channel.max}
                            key={channel.id}
                        />
                    ))}
                </span>

                <span id="fullHwbContainer" className="tripleInputContainer">
                    <label htmlFor="HWB1" className="tripleInputLabel">HWB</label>
                    {[
                        { id: "HWB1", min: 0, max: 360 },
                        { id: "HWB2", min: 0, max: 100 },
                        { id: "HWB3", min: 0, max: 100 }
                    ].map((channel, i) => (
                        <input
                            className="tripleInput"
                            type="number"
                            id={channel.id}
                            name={channel.id}
                            value={currentHWB[i]}
                            onChange={e => handleHwbChange(i, e.target.value)}
                            min={channel.min}
                            max={channel.max}
                            key={channel.id}
                        />
                    ))}
                </span>

                <span id="closestNamedColorContainer">
                    <p id="closestNamedColorTitle">Closest Named Color</p>
                    <div className="namedColorDisplay">
                        {closestNamedColor ? (
                            <p id='closestNamedColor' style={{ 
                                backgroundColor: `rgb(${closestNamedColor.rgb[0]}, ${closestNamedColor.rgb[1]}, ${closestNamedColor.rgb[2]})`,
                                color: closestNamedColor.textColor || 'black'
                            }}>
                                <span>{closestNamedColor.name}</span>
                                <br />
                                <span className="colorRGB">
                                    RGB({closestNamedColor.rgb[0]}, {closestNamedColor.rgb[1]}, {closestNamedColor.rgb[2]})
                                </span>
                            </p>
                        ) : (
                            <span>No named color found</span>
                        )}
                    </div>
                </span>
            </form>
        </ToolCard>
    )
}