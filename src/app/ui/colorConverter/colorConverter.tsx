'use client';

import ToolCard from '../toolCard/toolCard';
import './colorConverter.scss'
import { useEffect, useState } from "react";

let x = 255;
let y = 'FF';

export default function ColorConverter() {

    const [currentRGB, setCurrentRGB] = useState([0, 0, 0])
    const [currentHex, setCurrentHex] = useState("#000000")

    useEffect(() => {
        setCurrentHex(
            "#" 
            + currentRGB[0].toString(16).padStart(2, "0").toUpperCase()
            + currentRGB[1].toString(16).padStart(2, "0").toUpperCase()
            + currentRGB[2].toString(16).padStart(2, "0").toUpperCase() 
        );
    }, [currentRGB])

    function setRGB(rgbIndex: number, value: string) {
        if (value == ""){ // Defaults to 0 if input is emptied
            value = "0";
        } else {
            if (value.length > 1 && value.substring(0, 1) == "0") { // Removes leading 0
                value = value.substring(1)

                let actEl = document.activeElement as HTMLInputElement;
                if (actEl)
                    actEl.value = value.toString();
            }
        }

        let parsedValue = parseInt(value.toString())

        if (parsedValue > 255) { parsedValue = 255 }
        if (parsedValue < 0) { parsedValue = 255 }
        
        setCurrentRGB(
            currentRGB.map((existing, index) => {
                return index == rgbIndex ? parsedValue : existing
            })
        )
    }

    return(
        <ToolCard>
            <form name="rgbHex" id="rgbHex">
                <span id="fullRgbContainer">
                    <span className="rgbInputGroup">
                        <label className="rgbLabel" htmlFor="RGB1">R</label>
                        <input className="rgbInput" type="number" id="RGB1" name="RGB1" value={currentRGB[0]} onChange={e => setRGB(0, e.target.value)}/>
                    </span>

                    <span className="rgbInputGroup">
                        <label className="rgbLabel" htmlFor="RGB1">G</label>
                        <input className="rgbInput" type="number" id="RGB2" name="RGB2" value={currentRGB[1]} onChange={e => setRGB(1, e.target.value)}/>
                    </span>

                    <span className="rgbInputGroup">
                        <label className="rgbLabel" htmlFor="RGB1">B</label>
                        <input className="rgbInput" type="number" id="RGB3" name="RGB3" value={currentRGB[2]} onChange={e => setRGB(2, e.target.value)}/>
                    </span>
                </span>
                

                <br />

                <span id="hexInputGroup">
                    <label htmlFor="hex">HEX </label>
                    <input type="text" name="hex" id="hex" value={currentHex} maxLength={7} readOnly/>
                </span>
            </form>
        </ToolCard>
    )
}