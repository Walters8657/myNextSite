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
                className = "whitePiece piece" + piece.pieceType;
            }
        })

        blackPieces?.forEach((piece) => {
            if (col + row == piece.location) {
                className = "blackPiece piece" + piece.pieceType;
            }
        })

        if (selectedPiece?.location == col + row) {
            className += " selectedPiece";
        }

        if (potentialMoveList?.includes(col + row)) {
            className += " potentialMove"
        }

        className = className + " piece";

        return className;
    }

    function handleOnPieceSelect(col: string, row: string) {
        let allPieces: chessPiece[] = allPiecesRef.current;
        let clickedPiece: chessPiece | null = null;

        // Finds if a piece was clicked on or not
        allPieces.forEach(piece => {
            if (piece.location == col + row) {
                clickedPiece = piece;
            }
        });

        if (clickedPiece == selectedPiece) { 
            // If the piece clicked on was the already selected piece, de-select 
            setSelectedPiece(null);
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
        let potentialLocs = [];
        let collision: number = 0;

        for (let i = 1; i <= 2; i++) {
            let newLoc = piece.location.charAt(0) + (parseInt(piece.location.charAt(1)) + (piece.color == pieceColor.white ? i : -i));

            collision = checkPieceCollision(newLoc);

            // Since pawns can only take diagonally, head on collisions are not allowed with _either_ piece color
            if (collision == 0) {
                potentialLocs.push(newLoc);
            };

            // TODO: Look diagonally for attacks

            // If the piece has already moved, or is blocked, break the for loop before the second step
            if (![2, 7].includes(parseInt(piece.location.charAt(1))) || collision > 0) {
                break;
            }
        }

        setPotentialMoveList(potentialLocs);
    }

    function setKnightMoves() {}

    function setKingMoves() {}
    
    function setRookMoves() {}

    function setBishopMoves() {}

    function setQueenMoves() {}

    /**
     * 
     * @param newLoc Location to check for collision
     * @returns 0 if no collision, 1 if white collision, 2 if black collision
     */
    function checkPieceCollision(newLoc: String): number {
        let collision: boolean = false;

        allPiecesRef.current.forEach(existingPiece => {
            if (existingPiece.location == newLoc) {
                collision = true;

                return existingPiece.color;
            }
        });

        return 0;
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
                                    <span className={getPieceClass(col, row)} onClick={() => handleOnPieceSelect(col, row)}></span>
                                </td>)
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </ToolCard>
    )
}