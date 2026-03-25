"use client";
import ToolCard from "@/app/ui/toolCard/toolCard";

import './chess.scss'
import { useEffect, useRef, useState } from "react";

const pieceType: Record<string, number> = {
    "pawn": 1
    ,"king": 2
    ,"queen": 3
    ,"bishop": 4
    ,"knight": 5
    ,"rook": 6
} as const

const pieceColor: Record<string, number> = {
    "white": 1
    ,"black": 2
}

interface chessPiece {
    location: string;
    pieceType: number;
    color: number;
}

export default function Chess() {
    let columns: string[]= ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    let rows: string[] = ['1', '2', '3', '4', '5', '6', '7', '8'];

    const [whitePieces, setWhitePieces] = useState<chessPiece[]>([]);
    const [blackPieces, setBlackPieces] = useState<chessPiece[]>([]);

    const [selectedPiece, setSelectedPiece] = useState<chessPiece | null>(null);

    const [ potentialMoveList, setPotentialMoveList] = useState<String[] | null>([]);

    const allPiecesRef = useRef<chessPiece[]>([]);
    const selectedPieceRef = useRef<chessPiece | null>(null);

    useEffect(() => {
        resetGame();
    }, []);

    useEffect(() => {
        if (whitePieces.length > 0 && blackPieces.length > 0) {
            let newPieceSet = whitePieces.concat(blackPieces!);

            allPiecesRef.current = newPieceSet;
        }
    }, [whitePieces, blackPieces])

    useEffect (() => {
        selectedPieceRef.current = selectedPiece;
        setPotentialMoves();
    }, [selectedPiece])

    function resetGame() {
        resetWhitePieces();
        resetBlackPieces();
    }

    function resetWhitePieces() {
        let newWhitePieces: chessPiece[] = [];

        columns.forEach(col => {
            //#region Pawn Setup
            let newPawn: chessPiece = {
                location: col + "2"
                ,pieceType: pieceType.pawn
                ,color: pieceColor.white
            };
            newWhitePieces.push(newPawn);
            //#endregion Pawn Setup

            //#region Major Piece Setup
            let newPiece: chessPiece = {
                location: col + "1"
                ,pieceType: pieceType.pawn
                ,color: pieceColor.white
            };

            if (["a", "h"].includes(col)) {
                newPiece.pieceType = pieceType.rook
            } else if (["b", "g"].includes(col)) {
                newPiece.pieceType = pieceType.knight;
            } else if (["c", "f"].includes(col)) {
                newPiece.pieceType = pieceType.bishop;
            } else if (col == "d") {
                newPiece.pieceType= pieceType.queen;
            } else if (col == "e") {
                newPiece.pieceType = pieceType.king;
            }
            //#endregion Major Piece Setup

            newWhitePieces.push(newPiece);
        });

        setWhitePieces(newWhitePieces);
    }

    function resetBlackPieces() {
        let newBlackPieces: chessPiece[] = [];

        columns.forEach(col => {
            //#region Pawn Setup
            let newPawn: chessPiece = {
                location: col + "7"
                ,pieceType: pieceType.pawn
                ,color: pieceColor.black
            };
            newBlackPieces.push(newPawn);
            //#endregion Pawn Setup

            //#region Major Piece Setup
            let newPiece: chessPiece = {
                location: col + "8"
                ,pieceType: pieceType.pawn
                ,color: pieceColor.black
            };

            if (["a", "h"].includes(col)) {
                newPiece.pieceType = pieceType.rook
            } else if (["b", "g"].includes(col)) {
                newPiece.pieceType = pieceType.knight;
            } else if (["c", "f"].includes(col)) {
                newPiece.pieceType = pieceType.bishop;
            } else if (col == "d") {
                newPiece.pieceType= pieceType.queen;
            } else if (col == "e") {
                newPiece.pieceType = pieceType.king;
            }
            //#endregion Major Piece Setup

            newBlackPieces.push(newPiece);
        });

        setBlackPieces(newBlackPieces);
    }

    function boardSquareColor(cIdx: number, rIdx: number): string {
        let className: string = "";

        if (rIdx % 2 == 0) // Even Row
            className = (cIdx % 2) == 1 ? "darkSquare " : "lightSquare "
        else // Odd Row
            className = (cIdx % 2) == 0 ? "darkSquare " : "lightSquare "
        
        return className;
    }

    function getPieceClass(col: string, row: string): string {
        let className: string = "";

        whitePieces?.forEach((piece) => {
            if (col + row == piece.location) {
                className = "whitePiece piece piece" + piece.pieceType;
            }
        })

        blackPieces?.forEach((piece) => {
            if (col + row == piece.location) {
                className = "blackPiece piece piece" + piece.pieceType;
            }
        })

        if (selectedPiece?.location == col + row) {
            className += " selectedPiece";
        }

        if (potentialMoveList?.includes(col + row)) {
            className += " potentialMove" 
        }

        className += " boardSquare";

        return className;
    }

    function handleOnBoardClick(col: string, row: string) {
        let allPieces: chessPiece[] = allPiecesRef.current;
        let clickedPiece: chessPiece | null = null;

        // Finds if a piece was clicked on or not
        clickedPiece = allPieces.find(piece => {
            return piece.location == col + row
        }) ?? null;

        if (clickedPiece == selectedPiece) { // If the piece clicked on was the already selected piece, de-select
            setSelectedPiece(null);
            selectedPieceRef.current = null;
        } else if (potentialMoveList?.includes(col + row)) { // If the clicked square is in the potential move list
            let movedPiece = selectedPiece;

            if (!movedPiece) return;

            movedPiece.location = col + row;

            let collision = checkPieceCollision(movedPiece.location);

            if (collision > 0 && collision != movedPiece.color) { //If taking piece
                if (collision == 1) {
                    let newWhite = whitePieces.filter(piece => {
                        return piece.location != movedPiece.location
                    });

                    let newBlack = blackPieces.filter(piece => {
                        return piece.location != selectedPiece?.location;
                    });

                    newBlack.push(movedPiece);

                    setWhitePieces(newWhite);
                    setBlackPieces(newBlack);
                } else {
                    let newBlack = blackPieces.filter(piece => {
                        return piece.location != movedPiece.location
                    });

                    let newWhite = whitePieces.filter(piece => {
                        return piece.location != selectedPiece?.location;
                    });

                    newWhite.push(movedPiece)

                    setBlackPieces(newBlack);
                    setWhitePieces(newWhite);
                }
            }

            setSelectedPiece(null);
            selectedPieceRef.current = null;
        } else {
            // Otherwise set the new active piece. Empty squares are null.
            setSelectedPiece(clickedPiece);
            selectedPieceRef.current = clickedPiece;
        }

    }

    function setPotentialMoves() {
        switch (selectedPieceRef.current?.pieceType) {
            case pieceType.pawn: 
                setPawnMoves();
                break;
            case pieceType.knight:
                setKnightMoves();
                break;
            case pieceType.king:
                setKingMoves();
                break;
            case pieceType.rook:
                setRookMoves();
                break;
            case pieceType.bishop:
                setBishopMoves();
                break;
            case pieceType.queen:
                setQueenMoves();
                break;
            default: // Handles no piece selected
                setPotentialMoveList(null);
                break;
        }
    }

    function setPawnMoves() {
        let piece = selectedPieceRef.current!;
        let potentialLocs: String[] = [];
        let frontCollision: number = 0;

        for (let i = 1; i <= 2; i++) {
            let newLoc = piece.location.charAt(0) + (parseInt(piece.location.charAt(1)) + (piece.color == pieceColor.white ? i : -i));

            frontCollision = checkPieceCollision(newLoc);

            // Since pawns can only take diagonally, head on collisions are not allowed with _either_ piece color
            if (frontCollision == 0) {
                potentialLocs.push(newLoc);
            };

            //#region Search for Attacks
            let colIdx = columns.findIndex((col) => {
                return col == piece.location.charAt(0);
            });

            let row = parseInt(piece.location.charAt(1)) + (piece.color == pieceColor.white ? 1 : -1);

            newLoc = columns[colIdx + 1] + row;
            if (checkPieceCollision(newLoc) > 0 && piece.color != checkPieceCollision(newLoc))
                potentialLocs.push(newLoc);

            newLoc = columns[colIdx - 1] + row;
            if (checkPieceCollision(newLoc) > 0 && piece.color != checkPieceCollision(newLoc))
                potentialLocs.push(newLoc);
            //#endregion Search for Attacks

            // If the piece has already moved, or is blocked, break the for loop before the second step
            if (![2, 7].includes(parseInt(piece.location.charAt(1))) || frontCollision > 0) {
                break;
            }
        }

        setPotentialMoveList(potentialLocs);
    }

    function setKnightMoves() {
        const moves = [
            [1, 2],
            [2, 1],
            [2, -1],
            [1, -2],
            [-1, -2],
            [-2, -1],
            [-2, 1],
            [-1, 2]
        ];    
        
        let piece = selectedPieceRef.current!;
        let potentialLocs: String[] = [];

        let colIdx = columns.findIndex((col) => {
            return col == piece.location.charAt(0);
        });

        let row = parseInt(piece.location.charAt(1));

        moves.forEach((move) => {
            let newLoc: String = "";

            newLoc = (columns[colIdx + move[0]] ?? "") + (row + move[1]);

            if(checkPieceCollision(newLoc) != piece.color) {
                potentialLocs.push(newLoc);
            }
        })

        setPotentialMoveList(potentialLocs);
    }

    function setKingMoves() {
        const moves = [
            [0, 1],
            [1, 1],
            [1, 0],
            [1, -1],
            [0, -1],
            [-1, -1],
            [-1, 0],
            [-1, 1]
        ];    
        
        let piece = selectedPieceRef.current!;
        let potentialLocs: String[] = [];

        let colIdx = columns.findIndex((col) => {
            return col == piece.location.charAt(0);
        });

        let row = parseInt(piece.location.charAt(1));

        moves.forEach((move) => {
            let newLoc: String = "";

            newLoc = (columns[colIdx + move[0]] ?? "") + (row + move[1]);

            if(checkPieceCollision(newLoc) != piece.color) {
                potentialLocs.push(newLoc);
            }
        })

        setPotentialMoveList(potentialLocs);
    }
    
    function setRookMoves() {
        setPotentialMoveList(getRookMoves());
    }

    function setBishopMoves() {
        setPotentialMoveList(getBishopMoves());
    }

    function setQueenMoves() {
        let potentialLocs: String[] = [];
        let potentialLocs1: String[] = [];
        let potentialLocs2: String[] = [];

        potentialLocs1 = getBishopMoves();
        potentialLocs2 = getRookMoves();

        potentialLocs = potentialLocs1.concat(potentialLocs2);

        setPotentialMoveList(potentialLocs);
    }

    function getRookMoves() {
        let piece = selectedPieceRef.current!;
        let potentialLocs: String[] = [];

        let colIdx = columns.findIndex((col) => {
            return col == piece.location.charAt(0);
        });

        let row = parseInt(piece.location.charAt(1));

        //#region Up
        for (let i = row + 1; i <= 8; i++) {
            let newLoc = piece.location.charAt(0) + i;
            let collision = checkPieceCollision(newLoc);

            if (collision == piece.color) {
                break;
            } else if (collision > 0) {
                potentialLocs.push(newLoc);
                break;
            } else {
                potentialLocs.push(newLoc);
            }
        }
        //#endregion Up

        //#region Down
        for (let i = row - 1; i >= 1; i--) {
            let newLoc = piece.location.charAt(0) + i;
            let collision = checkPieceCollision(newLoc);

            if (collision == piece.color) {
                break;
            } else if (collision > 0) {
                potentialLocs.push(newLoc);
                break;
            } else {
                potentialLocs.push(newLoc);
            }
        }
        //#endregion Down

        //#region Right
        for (let i = colIdx + 1; i < 8; i++) {
            let newLoc = columns[i].toString() + row.toString();
            let collision = checkPieceCollision(newLoc);

            if (collision == piece.color) {
                break;
            } else if (collision > 0) {
                potentialLocs.push(newLoc);
                break;
            } else {
                potentialLocs.push(newLoc);
            }
        }
        //#endregion Right

        //#region Left
        for (let i = colIdx - 1; i >= 0; i--) {
            let newLoc = columns[i].toString() + row.toString();
            let collision = checkPieceCollision(newLoc);

            if (collision == piece.color) {
                break;
            } else if (collision > 0) {
                potentialLocs.push(newLoc);
                break;
            } else {
                potentialLocs.push(newLoc);
            }
        }
        //#endregion Left

        return potentialLocs;
    }

    function getBishopMoves() {
        let piece = selectedPieceRef.current!;
        let potentialLocs: String[] = [];

        let colIdx = columns.findIndex((col) => {
            return col == piece.location.charAt(0);
        });

        let row = parseInt(piece.location.charAt(1));
        
        //#region Up Right
        for (let i = colIdx + 1; i <= 8; i++) {
            let newLocUp = (columns[i] ?? "") + (row + (colIdx - i));

            let upCollision = checkPieceCollision(newLocUp);

            if (upCollision == piece.color) {
                break;
            } if (upCollision > 0) {
                potentialLocs.push(newLocUp);
                break;
            } else {
                potentialLocs.push(newLocUp);
            }
        }
        //#endregion Up Right
        
        //#region Down Right
        for (let i = colIdx + 1; i <= 8; i++) {
            let newLocUp = (columns[i] ?? "") + (row - (colIdx - i));

            let upCollision = checkPieceCollision(newLocUp);

            if (upCollision == piece.color) {
                break;
            } if (upCollision > 0) {
                potentialLocs.push(newLocUp);
                break;
            } else {
                potentialLocs.push(newLocUp);
            }
        }
        //#endregion Down Right

        //#region Up Left
        for (let i = colIdx - 1; i >= 0; i--) {
            let newLocUp = (columns[i] ?? "") + (row + (colIdx - i));

            let upCollision = checkPieceCollision(newLocUp);

            if (upCollision == piece.color) {
                break;
            } if (upCollision > 0) {
                potentialLocs.push(newLocUp);
                break;
            } else {
                potentialLocs.push(newLocUp);
            }
        }
        //#endregion Up Left
        
        //#region Down Left
        for (let i = colIdx - 1; i >= 0; i--) {
            let newLocUp = (columns[i] ?? "") + (row - (colIdx - i));

            let upCollision = checkPieceCollision(newLocUp);

            if (upCollision == piece.color) {
                break;
            } if (upCollision > 0) {
                potentialLocs.push(newLocUp);
                break;
            } else {
                potentialLocs.push(newLocUp);
            }
        }
        //#endregion Down Left

        return potentialLocs;
    }

    /**
     * 
     * @param newLoc Location to check for collision
     * @returns 0 if no collision, 1 if white collision, 2 if black collision
     */
    function checkPieceCollision(newLoc: String): number {
        let collision: number = 0;

        allPiecesRef.current.forEach(existingPiece => {
            if (existingPiece.location == newLoc) {
                collision = existingPiece.color;
            }
        });

        return collision;
    }

    return (
        <ToolCard title="Chess">
            <table id="chessBoard">
                <tbody>
                    {rows.reverse().map((row: string, rIdx: number) => (
                        <tr key={row}>
                            {columns.map((col: string, cIdx: number) => {
                                return (<td key={col + row} className={boardSquareColor(cIdx, rIdx)}>
                                    <p className="colLabel">{(row == '1' ? col : '')}</p>
                                    <p className="rowLabel">{(col == 'a' ? row : '')}</p>
                                    <span className={getPieceClass(col, row)} onClick={() => handleOnBoardClick(col, row)}></span>
                                </td>)
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </ToolCard>
    )
}