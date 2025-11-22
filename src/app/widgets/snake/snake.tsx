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
class snakeBody {
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
    const snakeDirectionRef = useRef<dir>(dir.right);
    const [snakeCharacter, setSnakeCharacter] = useState<snakeBody[]>([
            new snakeBody(0, 0)
            , new snakeBody(1, 0)
            , new snakeBody(2, 0)
        ]);

    const gameWidth: number = 15;
    const gameHeight: number = 20;

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

    function getPotentialNewHead(workingSnake: snakeBody[]) {
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
    function coordHittingSnake(workingSnake: snakeBody[], coordX: number, coordY: number, ignoreTail: boolean) {
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

            //Check if snake hits food
            let foundFood = true;

            //Progress snake forwards one - shift all segments and add new head
            const newSnake = [...currentSnake.slice(foundFood ? 0 : 1), new snakeBody(potentialNewHead.x, potentialNewHead.y)];

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
                                                className={`snakeGameCell ${coordHittingSnake(snakeCharacter, colIdx, rowIdx, false) ? 'activeSnakeCell' : ''}`}
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