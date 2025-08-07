"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import ToolCard from "../../ui/toolCard/toolCard";
import "./minesweeper.scss"

interface GameTile {
    isBomb: boolean;
    bombsTouching: number;
    isRevealed: boolean;
    isFlagged: boolean;
}

// Color mapping for minesweeper numbers (standard minesweeper colors)
const bombColors: Record<number, string> = {
    1: "blue",
    2: "green", 
    3: "red",
    4: "darkblue",
    5: "maroon",
    6: "teal",
    7: "black",
    8: "gray"
} as const;

function getColor(numBombs: number): string {
    // Validate input
    if (numBombs < 0 || numBombs > 8 || !Number.isInteger(numBombs)) {
        return "";
    }
    
    return bombColors[numBombs] || "";
}

// Function to detect if device is primarily touchscreen
function detectTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for touch support
    const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Check if the primary input mechanism is touch
    const hasTouchPointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    
    // Check for mobile/tablet user agent
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return hasTouchSupport && (hasTouchPointer || isMobileUA);
}

export default function Minesweeper() {
    const [fullGameData, setFullGameData] = useState<GameTile[][]>([])
    const [isWon, setIsWon] = useState(false);
    const [isLost, setIsLost] = useState(false);
    const [resetButtonState, setResetButtonState] = useState("smile");
    const [isClient, setIsClient] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [useFlag, setUseFlag] = useState(false);

    const resetButtonClass = useMemo((): string => {
        if (isWon) return "win";
        if (isLost) return "dead";
        return resetButtonState;
    }, [isWon, isLost, resetButtonState]);

    const handleMouseDown = useCallback((): void => {
        setResetButtonState("nervous");
    }, []);

    const handleMouseUp = useCallback((): void => {
        setResetButtonState("smile");
    }, []);

    const handleReset = useCallback((): void => {
        createMineArray(10, 8, 10);
    }, []);

    const handleCellClick = useCallback((rowIndex: number, cellIndex: number, cell: GameTile): void => {
        if (isLost || !fullGameData[rowIndex] || !fullGameData[rowIndex][cellIndex]) return;
        
        // Don't reveal flagged cells
        if (cell.isFlagged) return;
        
        if (cell.isBomb) {
            setIsLost(true);
        } else {
            revealCell(rowIndex, cellIndex);
        }
    }, [isLost, fullGameData]);

    const handleRightClick = useCallback((e: React.MouseEvent, rowIndex: number, cellIndex: number, cell: GameTile): void => {
        e.preventDefault(); // Prevent context menu
        if (isLost || isWon || !fullGameData[rowIndex] || !fullGameData[rowIndex][cellIndex]) return;
        
        // Don't allow flagging revealed cells
        if (cell.isRevealed) return;
        
        const newData = [...fullGameData];
        newData[rowIndex][cellIndex].isFlagged = !newData[rowIndex][cellIndex].isFlagged;
        setFullGameData(newData);
    }, [isLost, isWon, fullGameData]);

    // Set client flag and detect touch device on mount
    useEffect(() => {
        setIsClient(true);
        setIsTouchDevice(detectTouchDevice());
    }, []);

    // Initialize game only after client-side hydration
    useEffect(() => {
        if (isClient) {
            createMineArray(10, 8, 10);
        }
    }, [isClient])

    function createMineArray(rows: number, cols: number, numBombs: number): void {
        const totalCells = rows * cols;
        
        // Generate random bomb positions using Fisher-Yates shuffle
        const positions = Array.from({ length: totalCells }, (_, i) => i);
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        const bombPositions = new Set(positions.slice(0, numBombs));
        
        // Helper function to check if coordinates are within bounds
        const isValidPosition = (row: number, col: number) => 
            row >= 0 && row < rows && col >= 0 && col < cols;
        
        // Initialize game data
        const newGameData: GameTile[][] = Array.from({ length: rows }, (_, i) =>
            Array.from({ length: cols }, (_, j) => {
                const position = i * cols + j;
                const isBomb = bombPositions.has(position);
                return { isBomb, bombsTouching: 0, isRevealed: false, isFlagged: false };
            })
        );
        
        // Update neighbor counts for cells adjacent to bombs
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (newGameData[i][j].isBomb) {
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            if (di === 0 && dj === 0) continue;
                            const newRow = i + di;
                            const newCol = j + dj;
                            if (isValidPosition(newRow, newCol)) {
                                newGameData[newRow][newCol].bombsTouching++;
                            }
                        }
                    }
                }
            }
        }

        setFullGameData(newGameData);
        setIsWon(false);
        setIsLost(false);
        setResetButtonState("smile");
    }

    function revealCell(rowIndex: number, cellIndex: number): void {
        if (!fullGameData[rowIndex] || !fullGameData[rowIndex][cellIndex]) {
            return;
        }
        
        const newData = [...fullGameData];
        const queue: [number, number][] = [[rowIndex, cellIndex]];
        
        // Process cells using a queue to avoid recursion
        while (queue.length > 0) {
            const [currentRow, currentCol] = queue.shift()!;
            const cell = newData[currentRow][currentCol];
            
            // Skip if already revealed, is a bomb, or is flagged
            if (cell.isRevealed || cell.isBomb || cell.isFlagged) {
                continue;
            }
            
            // Reveal the current cell
            cell.isRevealed = true;
            
            // If this cell has no adjacent bombs, reveal all adjacent cells
            if (cell.bombsTouching === 0) {
                // Check all 8 adjacent cells
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const newRow = currentRow + i;
                        const newCol = currentCol + j;
                        
                        // Skip if out of bounds or same cell
                        if (newRow < 0 || newRow >= newData.length || 
                            newCol < 0 || newCol >= newData[newRow].length ||
                            (i === 0 && j === 0)) {
                            continue;
                        }
                        
                        const adjacentCell = newData[newRow][newCol];
                        
                        // Add to queue if not revealed, not a bomb
                        if (!adjacentCell.isRevealed && !adjacentCell.isBomb) {
                            queue.push([newRow, newCol]);
                        }
                    }
                }
            }
        }
        
        setFullGameData(newData);
        checkWinState(newData);
    }

    function checkWinState(newData: GameTile[][]): void {
        // Check if all non-bomb cells are revealed
        const isWon = newData.every(row => 
            row.every(cell => cell.isBomb || cell.isRevealed)
        );
        setIsWon(isWon);
    }

    // Memoize cell content to avoid unnecessary re-renders
    const renderCellContent = useCallback((cell: GameTile): string | number | null => {
        if (cell.isFlagged) return null; // Don't show content if flagged
        
        if (!cell.isRevealed && !isLost) return null;

        if (cell.isBomb) return 'X';
        
        if (cell.bombsTouching > 0) return cell.bombsTouching;
        return '';
    }, [isLost]);

    // Don't render until client-side hydration is complete
    if (!isClient) {
        return (
            <ToolCard>
                <p id="mineHeader">MiniSweeper</p>
                <div id="minefield">
                    <p>Loading...</p>
                </div>
            </ToolCard>
        );
    }

    return(
        <ToolCard>
            <p id="mineHeader">MiniSweeper</p>
            <button 
                id="resetButton" 
                className={resetButtonClass}
                onClick={handleReset}
            />
            <div 
                id="minefield"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            >
                <table>
                    <tbody>
                        {fullGameData.length > 0 && fullGameData.map((row: GameTile[], rowIndex: number) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <td 
                                        key={cellIndex}
                                        className={!cell.isRevealed ? "unclicked" : ""}
                                    >
                                        <p 
                                            className={`${!cell.isBomb ? getColor(cell.bombsTouching) : ''} ${cell.isFlagged ? 'flagged' : ''}`}
                                            onClick={() => handleCellClick(rowIndex, cellIndex, cell)}
                                            onContextMenu={(e) => handleRightClick(e, rowIndex, cellIndex, cell)}
                                        >
                                            {renderCellContent(cell)}
                                        </p>                                                
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isTouchDevice && <p id="mobileToggle">Show<span id="slider" className={useFlag ? "useFlag" : ""} onClick={() => setUseFlag(!useFlag)}><span></span></span> Flag</p>}
        </ToolCard>
    ) 
}