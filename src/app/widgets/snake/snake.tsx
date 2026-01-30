import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import ToolCard from "../../ui/toolCard/toolCard";
import './snake.scss'

/** Holds arrow direction definitions */
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
 * Positive X moves right, Positive Y moves down
 * 
 * The snakes head is the last item in the array.
 *  */
class cellLoc {
    x: number;
    y: number;
    direction: dir | null = null;

    constructor (newX: number, newY: number, newDir: dir | null = null) {
        this.x = newX;
        this.y = newY;
        this.direction = newDir;
    }
}

export default function Snake() {
    const gameWidth: number = 16;
    const gameHeight: number = 16;

    const [isPaused, setIsPaused] = useState<boolean>(true);
    const [isLost, setIsLost] = useState<boolean>(false);
    const [isWon, setIsWon] = useState<boolean>(false);
    const [foodLoc, setFoodLoc] = useState<cellLoc>(new cellLoc(8, 8));
    const [snakeCharacter, setSnakeCharacter] = useState<cellLoc[]>([
            new cellLoc(0, 0, dir.right)
            , new cellLoc(1, 0, dir.right)
            , new cellLoc(2, 0, dir.right)
        ]);

    const snakeDirectionRef = useRef<dir>(dir.right);
    const snakeCharacterRef = useRef<cellLoc[]>([
            new cellLoc(0, 0, dir.right)
            , new cellLoc(1, 0, dir.right)
            , new cellLoc(2, 0, dir.right)
        ]);
    const foodLocRef = useRef<cellLoc>(foodLoc);

    const gameField = new Array(gameHeight).fill(new Array(gameWidth).fill(null));

    useEffect(() => {
        // TODO: Implement last clicked on widget logic so this isn't running on every single keypress
        const handleKeyDown = (event: KeyboardEvent) => {
            if (validateDirection(event)) {
                event.preventDefault();
                setNewSnakeDirection(event);
            }
        };
        
        document.addEventListener("keydown", handleKeyDown);
        
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [])

    // Main timer for gameplay
    useEffect(() => {
        const timer = setInterval(() => {
            if (!isPaused && !isWon && !isLost)
                progressSnake();
        }, 400);

        return () => {
            clearTimeout(timer);
        }
    }, [isPaused, isWon, isLost])

    // If the snake moves, check if his head is on the current food and set a new food location if so
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

    // Keep refs in sync with state
    useEffect(() => {
        foodLocRef.current = foodLoc;
    }, [foodLoc]);

    useEffect(() => {
        snakeCharacterRef.current = snakeCharacter;
    }, [snakeCharacter]);

    /** 
     * Returns a cellLoc that is currently devoid of snake. 
     * 
     * @param workingSnake - The current snake data
     * @returns  Cell location that is empty
     * */
    function getNewFood(workingSnake: cellLoc[]): cellLoc {
        let randomX = Math.floor(Math.random() * gameWidth);
        let randomY = Math.floor(Math.random() * gameHeight);
        
        if (workingSnake.length == gameWidth * gameHeight) {
            setIsWon(true);
            return new cellLoc(-1, -1);
        }

        // Check if food overlaps with snake by comparing coordinates
        while (workingSnake.some(segment => segment.x === randomX && segment.y === randomY)) {
            randomX = Math.floor(Math.random() * gameWidth);
            randomY = Math.floor(Math.random() * gameHeight);
        }

        return new cellLoc(randomX, randomY);
    }

    /**
     * Gets the next location that the snake would like to move to
     * 
     * @param workingSnake - The current snake data
     * @returns X, Y, direction coordinates of an empty cell
     */
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
        
        return {x: potentialX, y: potentialY, direction: snakeDirectionRef.current}
    }

    /** 
     * Validates that the key pressed is an arrow key
     */
    function validateDirection(event: KeyboardEvent ): boolean {
        return Object.values<string>(dir).includes(event.key?.toString());
    }

    /** 
     * Updates direction ref to match keypress
     * */
    function setNewSnakeDirection(event: KeyboardEvent): void {
        const workingSnake = snakeCharacterRef.current;
        const workingHead = workingSnake[workingSnake.length - 1];

        switch (event.key.toString()){
            case "ArrowUp":
                if (workingHead.direction != dir.down)
                    snakeDirectionRef.current = dir.up;
                break;
            case "ArrowRight":
                if (workingHead.direction != dir.left)
                    snakeDirectionRef.current = dir.right;
                break;
            case "ArrowDown":
                if (workingHead.direction != dir.up)
                    snakeDirectionRef.current = dir.down;
                break;
            case "ArrowLeft":
                if (workingHead.direction != dir.right)
                    snakeDirectionRef.current = dir.left;
                break;
            default:
                break;
        }
    }

    /** 
     * Checks if a coordinate is out of bounds of the game 
     * 
     * @returns True if in bounds, False otherwise
     * */
    function coordOutOfBounds(coord: {x: number, y: number}): boolean {
        let OOB: boolean = (coord.x < 0 || coord.x >= gameWidth || coord.y < 0 || coord.y >= gameHeight);

        if (OOB)
            setIsLost(true);

        return OOB;
    }

    /** 
     * Checks if the snake is about to run into itself
     * 
     * @param workingSnake - The current snake data
     * @param coordX - X coordinate to check
     * @param coordY - Y coordinate to check
     * @param forMovement - Determines whether to use movement logic and updates
     * @returns
     * 
     * 0 - No collision
     * 
     * 1 - Head collision
     * 
     * 2 - Body collision
     * 
     * 3 - Tail collision
     */
    function coordHittingSnake(workingSnake: cellLoc[], coordX: number, coordY: number, forMovement: boolean): number {
        let collision: number = 0;
        // If the snake will replace the tail in position
        if ((workingSnake.length > 0) && (workingSnake[0].x == coordX) && (workingSnake[0].y == coordY))
            if (forMovement) // If using movement logic, the tail will be gone next tick
                return 0;
            else  // If not using movement logic, return tail hit
                return 3;
            
        // If the snake will hit any other part, return true
        workingSnake.forEach((snakeCell, idx) => {
            if ((snakeCell.x == coordX) && (snakeCell.y == coordY)) {
                if (idx == workingSnake.length - 1) // If cell is the tail
                    collision = 1;
                else // If cell is the body
                    collision = 2;
            }
        })

        if (forMovement && collision > 0) {
            setIsLost(true);
        }

        // If the snake will land on an empty space, return false
        return collision;
    }

    /**
     * Checks if the coordinate is a food cell
     * 
     * @param coords - X, Y coordinates to check
     * @returns True if coordinate is food
     */
    function isFood(coords: {x: number, y: number}): boolean {
        // Use ref to always get the latest food location value
        const currentFood = foodLocRef.current;
        let foodFound = ((coords.x == currentFood.x) && (coords.y == currentFood.y));
        
        return foodFound;
    }

    /**
     * Moves the snake forward one block
     */
    function progressSnake() {
        // Use functional update to ensure we have the latest state
        setSnakeCharacter((currentSnake) => {
            const potentialNewHead = getPotentialNewHead(currentSnake);

            let outOfBounds: boolean = coordOutOfBounds(potentialNewHead);
            let collision: number = coordHittingSnake(currentSnake, potentialNewHead.x, potentialNewHead.y, true);

            if (outOfBounds || collision > 0) {
                setIsLost(true);
                return currentSnake;
            }

            //Progress snake forwards one - shift all segments and add new head
            const newSnake = [...currentSnake.slice(isFood(potentialNewHead) ? 0 : 1), new cellLoc(potentialNewHead.x, potentialNewHead.y, potentialNewHead.direction)];

            snakeCharacterRef.current = newSnake;
            return newSnake;
        });
    }

    /**
     * Resets the game with the snake at the top left and a random food.
     */
    function resetGame() {
        setIsPaused(true);
        setIsWon(false);
        setIsLost(false);
        snakeDirectionRef.current = dir.right;

        const newSnake: cellLoc[] = [
            new cellLoc(0, 0),
            new cellLoc(1, 0),
            new cellLoc(2, 0)
        ];

        snakeCharacterRef.current = newSnake;
        setSnakeCharacter(newSnake);

        const newFood: cellLoc = getNewFood(newSnake);

        setFoodLoc(newFood);
        foodLocRef.current = newFood;
    }

    function getSnakeClass(xCoord: number, yCoord: number, forMovement: boolean) {
        let collision = coordHittingSnake(snakeCharacter, xCoord, yCoord, forMovement);

        if (isLost && collision > 0)
            return 'activeSnakeLoss'

        switch(collision) {
            case 0:
                return '';
            case 1: 
                return 'activeSnakeHead';
            case 2: 
                return 'activeSnakeBody';
            case 3: 
                return 'activeSnakeTail';
        }
    }

    return (
        <ToolCard title="Snake">
            <button className="centerButton" onClick={() => {
                if (isLost || isWon)
                    resetGame();
                else
                    setIsPaused(!isPaused)
            }}>{(isWon || isLost) ? "Reset" : isPaused ? 'Start' : 'Pause'}</button>
            
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
                                                    ${getSnakeClass(colIdx, rowIdx, false)}
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