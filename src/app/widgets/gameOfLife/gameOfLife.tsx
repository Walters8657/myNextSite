import { useEffect, useState, useRef } from "react";
import ToolCard from "../../ui/toolCard/toolCard";
import './gameOfLife.scss';

export default function GameOfLife() {
    const [grid, setGrid] = useState<boolean[][]>(Array.from({ length: 15 }, () => Array.from({ length: 15 }, () => false)));
    const [isPaused, setIsPaused] = useState(true);
    const [simSpeed, setSimSpeed] = useState(1);

    const gridRef = useRef<boolean[][]>(grid);

    useEffect(() => {
        clearGrid();
    }, []);

    useEffect(() => {
        gridRef.current = grid;
    }, [grid]);

    useEffect(() => {
        if (!isPaused) {
            console.log("Generating new frame");
            const interval = setInterval(() => {
                generateNewFrame();
            }, 1000 / (1 * simSpeed));
            return () => clearInterval(interval);
        }
    }, [isPaused, simSpeed]);
    
    function pauseResume() {
        setIsPaused(!isPaused);
    }

    function clearGrid() {
        setGrid(Array.from({ length: 15 }, () => Array.from({ length: 15 }, () => false)));
        setIsPaused(true);
    }

    // Switches a cell between alive and dead
    function switchCell(rowIndex: number, colIndex: number) {
        const newGrid = [...grid];
        newGrid[rowIndex][colIndex] = !newGrid[rowIndex][colIndex];
        setGrid(newGrid);
    }

    // Updates speed state and slider progress
    function handleSimSpeedChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newSpeed = parseFloat(e.target.value);
        setSimSpeed(newSpeed);
        
        // Update CSS custom property for slider progress
        const slider = e.target as HTMLInputElement;
        const progress = ((newSpeed - 1) / (10 - 1)) * 100;
        slider.style.setProperty('--sliderProgress', `${progress}%`);
    }

    // Returns number of alive cells touching another
    function getTouchingLivingCount(rowIndex: number, colIndex: number) {
        let nearbyCellCount = 0;
        const currentGrid = gridRef.current;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                // Skip a cell if it is itself
                if (i === 0 && j === 0) continue;

                // Get the new row and column index with wrapping 
                let rowIndexNew = rowIndex + i;
                let colIndexNew = colIndex + j;
                if (rowIndexNew < 0) rowIndexNew = currentGrid.length - 1;
                if (rowIndexNew >= currentGrid.length) rowIndexNew = 0;
                if (colIndexNew < 0) colIndexNew = currentGrid[rowIndexNew].length - 1;
                if (colIndexNew >= currentGrid[rowIndexNew].length) colIndexNew = 0;

                if (currentGrid[rowIndexNew][colIndexNew])
                    nearbyCellCount++;
            }
        }
        if (nearbyCellCount > 0)console.log(nearbyCellCount);
        return nearbyCellCount;
    }

    // Generates a new frame of the simulation
    function generateNewFrame() {
        const currentGrid = gridRef.current;
        const newGrid = Array.from({ length: currentGrid.length }, () => Array.from({ length: currentGrid[0].length }, () => false));
        
        for (let i = 0; i < currentGrid.length; i++) {
            for (let j = 0; j < currentGrid[i].length; j++) {
                const cell = currentGrid[i][j];
                const nearbyAliveCells = getTouchingLivingCount(i, j);
                
                // Apply Game of Life rules
                if (cell && (nearbyAliveCells === 2 || nearbyAliveCells === 3)) {
                    // Cell survives
                    newGrid[i][j] = true;
                } else if (!cell && nearbyAliveCells === 3) {
                    // Cell is born
                    newGrid[i][j] = true;
                }
                // Otherwise cell dies or stays dead (already false in newGrid)
            }
        }

        setGrid(newGrid);
    }

    return (
        <ToolCard title="Game of Life">
            <button id="pauseBtnGol" className="centerButton" onClick={pauseResume}>{isPaused ? 'Play' : 'Pause'}</button>
            <p id="simSpeedLabel">Sim Speed</p>
            <input 
                type="range" 
                id="simSpeedSlider" 
                min={1} 
                max={10} 
                value={simSpeed} 
                onChange={handleSimSpeedChange}
                style={{'--sliderProgress': `${((simSpeed - 1) / (10 - 1)) * 100}%`} as React.CSSProperties}
            />
            <div id="gameOfLifeSimulation">
                <table>
                    <tbody>
                        {grid.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, colIndex) => (
                                    <td
                                        className={"cell" + (cell ? " aliveCell" : " deadCell")}
                                        onClick={() => switchCell(rowIndex, colIndex)}
                                        key={colIndex}
                                    ></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button id="clearGridBtn" className="centerButton" onClick={clearGrid}>Clear Grid</button>
        </ToolCard>
    );
}