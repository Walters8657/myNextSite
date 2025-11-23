import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import ToolCard from "../../ui/toolCard/toolCard";
import './snake.scss'

enum dir {
    up = "ArrowUp"
    , right = "ArrowRight"
    , down = "ArrowDown"
    , left = "ArrowLeft"
}

/** 
 * Holds coordinates for snake segment. 
 * 
 * (0, 0) starts at the top left corner.
 * 
 * The snakes head is the last item in the array.
 *  */
class cellLoc {
    x: number;
    y: number;
    constructor (newX: number, newY: number) {
        this.x = newX;
        this.y = newY;
    }
}

export default function Snake() {
    const [isPaused, setIsPaused] = useState<boolean>(true);
    const [isLost, setIsLost] = useState<boolean>(false);
    const [foodLoc, setFoodLoc] = useState<cellLoc>(new cellLoc(3, 0));
    const [snakeCharacter, setSnakeCharacter] = useState<cellLoc[]>([
            new cellLoc(0, 0)
            , new cellLoc(1, 0)
            , new cellLoc(2, 0)
        ]);

    const gameWidth: number = 15;
    const gameHeight: number = 20;
 
    const snakeDirectionRef = useRef<dir>(dir.right);
    const randomXRef = useRef<number>(Math.floor(Math.random() * gameWidth));
    const randomYRef = useRef<number>(Math.floor(Math.random() * gameHeight));
    const foodLocRef = useRef<cellLoc>(foodLoc);

    const gameField = new Array(gameHeight).fill(new Array(gameWidth).fill(null));

    useEffect(() => {
        // TODO: Implement last clicked on widget logic so this isn't running on every single keypress
        const handleKeyDown = (event: KeyboardEvent) => {
            if (validateDirection(event)) {
                event.preventDefault();
                setNewSnakeDirection(event);

                //TODO: Put move on a timer
                progressSnake();
            }
        };
        
        document.addEventListener("keydown", handleKeyDown);
        
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [])

    useEffect(() => {
        let workingSnake = [...snakeCharacter];
        let snakeHead = [...snakeCharacter][workingSnake.length -1];

        setFoodLoc((currentFood) => {
            if (snakeHead.x == currentFood.x && snakeHead.y == currentFood.y) {
                let newFood = getNewFood(workingSnake);
                foodLocRef.current = newFood; // Update ref immediately
                return newFood;
            }

            return currentFood;
        })
    }, [snakeCharacter])

    // Keep ref in sync with state
    useEffect(() => {
        foodLocRef.current = foodLoc;
    }, [foodLoc])

    function getNewFood(workingSnake: cellLoc[]): cellLoc {
        let randomX = Math.floor(Math.random() * gameWidth);
        let randomY = Math.floor(Math.random() * gameHeight);
        
        // Check if food overlaps with snake by comparing coordinates
        while (workingSnake.some(segment => segment.x === randomX && segment.y === randomY)) {
            randomX = Math.floor(Math.random() * gameWidth);
            randomY = Math.floor(Math.random() * gameHeight);
        }

        return new cellLoc(randomX, randomY);
    }

    function getPotentialNewHead(workingSnake: cellLoc[]) {
        let potentialX = workingSnake[workingSnake.length - 1].x;
        let potentialY = workingSnake[workingSnake.length - 1].y;

        switch (snakeDirectionRef.current) {
            case dir.up:
                potentialY--;
                break;
            case dir.right:
                potentialX++;
                break;
            case dir.down:
                potentialY++;
                break;
            case dir.left:
                potentialX--;
                break;
        }
        
        return {x: potentialX, y: potentialY}
    }

    /** Returns TRUE if keyboard event is an arrow key.
     * 
     * Returns FALSE otherwise.
     */
    function validateDirection(event: KeyboardEvent ): boolean {
        return Object.values<string>(dir).includes(event.key.toString());
    }

    /** Updates direction of the snake based on the keyboard event. */
    function setNewSnakeDirection(event: KeyboardEvent): void {
        switch (event.key.toString()){
            case "ArrowUp":
                snakeDirectionRef.current = dir.up;
                break;
            case "ArrowRight":
                snakeDirectionRef.current = dir.right;
                break;
            case "ArrowDown":
                snakeDirectionRef.current = dir.down;
                break;
            case "ArrowLeft":
                snakeDirectionRef.current = dir.left;
                break;
            default:
                break;
        }
    }

    /** Checks if a coordinate is out of bounds of the game */
    function coordOutOfBounds(coord: {x: number, y: number}): boolean {
        return (coord.x < 0 || coord.x >= gameWidth || coord.y < 0 || coord.y >= gameHeight);
    }

    /** Checks for if the snake is about to run into itself.
     * 
     * Will return TRUE if the snake will hit itself
     * 
     * Will return FALSE if the snake will hit an empty space
     * 
     * Using ignoreTail will return false if the tail would otherwise be hit
     */
    function coordHittingSnake(workingSnake: cellLoc[], coordX: number, coordY: number, ignoreTail: boolean) {
        // If the snake will replace the tail in position, return false
        // Will only run tail check if ignore tail set to true
        if ((workingSnake.length > 1) && (workingSnake[1].x == coordX) && (workingSnake[1].y == coordY) && ignoreTail)
            return false;

        let collision = false;

        // If the snake will hit any other part, return true
        workingSnake.forEach(snakeCell => {
            if ((snakeCell.x == coordX) && (snakeCell.y == coordY)) {
                collision = true;
            }
        })

        // If the snake will land on an empty space, return false
        return collision;
    }

    const isFood = useCallback((coords: {x: number, y: number}, log: boolean = false): boolean => {
        // Use ref to always get the latest food location value
        const currentFood = foodLocRef.current;
        let foodFound = ((coords.x == currentFood.x) && (coords.y == currentFood.y));
        
        return foodFound;
    }, [])

    /** Main game loop to step the snake forward one tick. */
    function progressSnake() {
        // Use functional update to ensure we have the latest state
        setSnakeCharacter((currentSnake) => {
            const potentialNewHead = getPotentialNewHead(currentSnake);

            let outOfBounds: boolean = coordOutOfBounds(potentialNewHead);
            let collision: boolean = coordHittingSnake(currentSnake, potentialNewHead.x, potentialNewHead.y, true);

            if (outOfBounds || collision) {
                setIsLost(true);
                return currentSnake;
            }

            //Progress snake forwards one - shift all segments and add new head
            const newSnake = [...currentSnake.slice(isFood(potentialNewHead, true) ? 0 : 1), new cellLoc(potentialNewHead.x, potentialNewHead.y)];

            return newSnake;
        });
    }

    return (
        <ToolCard title="Snake">
            <button className="centerButton" onClick={() => setIsPaused(!isPaused)}>{isPaused ? 'Start' : 'Pause'}</button>
            <div id="snakeGameArea">
                {
                    gameField.map((row, rowIdx) => {
                        return (
                            <div key={"row-" + rowIdx.toString()} className="snakeRow">
                                {
                                    row.map((col: any, colIdx: number) => {
                                        return(
                                            <div 
                                                key={"row-" + rowIdx.toString() + "_col-" + colIdx.toString()} 
                                                className={`
                                                    snakeGameCell 
                                                    ${coordHittingSnake(snakeCharacter, colIdx, rowIdx, false) ? 'activeSnakeCell' : ''}
                                                    ${isFood({x: colIdx, y: rowIdx}) ? 'activeFood' : ''}
                                                `}
                                            >
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        )
                    })
                }
            </div>
        </ToolCard>
    )
}