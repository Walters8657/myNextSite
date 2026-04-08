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

class chessPiece {
    location: string;
    pieceType: number;
    color: number;

    constructor(location: string, pieceType: number, color: number) {
        this.location = location;
        this.pieceType = pieceType;
        this.color = color;
    }
}

export default function Chess() {
    let columns: string[]= ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    let rows: string[] = ['1', '2', '3', '4', '5', '6', '7', '8'];


    const [whitePieces, setWhitePieces] = useState<chessPiece[]>([]);
    const [blackPieces, setBlackPieces] = useState<chessPiece[]>([]);

    const [selectedPiece, setSelectedPiece] = useState<chessPiece | null>(null);

    const [potentialMoveList, setPotentialMoveList] = useState<String[] | null>([]);
    const [enPassantTake, setEnPassantTake] = useState<String | null>(null);

    const playerTurnRef = useRef<Number>(1);

    const allPiecesRef = useRef<chessPiece[]>([]);
    const selectedPieceRef = useRef<chessPiece | null>(null);
    const enPassantRef = useRef<string | null>(null);

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
            let newPawn = new chessPiece(col + "2", pieceType.pawn, pieceColor.white);
            newWhitePieces.push(newPawn);
            //#endregion Pawn Setup

            //#region Major Piece Setup
            let newPiece = new chessPiece(col + "1", pieceType.pawn, pieceColor.white);

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
            let newPawn= new chessPiece(col + "7", pieceType.pawn, pieceColor.black);
            newBlackPieces.push(newPawn);
            //#endregion Pawn Setup

            //#region Major Piece Setup
            let newPiece= new chessPiece(col + "8", pieceType.pawn, pieceColor.black);

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

    function checkEnPassant(clickedCol: string, clickedRow: string, pieceMoving: chessPiece) {
        if (
            (pieceMoving.location.charAt(1) == '2' && clickedRow == '4' && pieceMoving.color == pieceColor.white) 
                || 
            (pieceMoving.location.charAt(1) == '7' && clickedRow == '5' && pieceMoving.color == pieceColor.black)) {
            enPassantRef.current = clickedCol + clickedRow;
        } else {
            enPassantRef.current = null;
        }
    }

    function handleOnBoardClick(col: string, row: string) {
        let allPieces: chessPiece[] = allPiecesRef.current;

        let clickedPiece: chessPiece | null = allPieces.find(piece => {
            return piece.location == col + row
        }) ?? null;

        if (clickedPiece == selectedPiece) { // If the piece clicked on was the already selected piece, de-select
            setSelectedPiece(null);
            selectedPieceRef.current = null;
        } else if (potentialMoveList?.includes(col + row)) { // If the square is being moved to
            setPotentialMoveList(null); // Reset potential move list

            // Setup working piece
            let pieceMoving = selectedPieceRef.current;
            
            if (!pieceMoving) { return; }

            checkEnPassant(col, row, pieceMoving);

            //Check for a capture at the new location
            let collision = checkPieceCollision(col + row);

            // Set piece to move to new location
            pieceMoving.location = col + row;

            if (collision > 0 && collision != pieceMoving.color) { // If colliding with other colors piece
                if (collision == 1) {
                    takeWhitePiece(pieceMoving);
                } else {
                    takeBlackPiece(pieceMoving);
                }
            }

            if (pieceMoving.pieceType == pieceType.pawn) {
                if (["1", "8"].includes(row)) {
                    console.log("Promotion")
                }
            }

            // Unselect pieces and switch turns
            setSelectedPiece(null);
            selectedPieceRef.current = null;

            playerTurnRef.current = (playerTurnRef.current == 1) ? 2 : 1;
        } else if (clickedPiece) { // If there is a piece in the selected square
            //If the selected piece is the current turns piece
            if (clickedPiece.color == playerTurnRef.current) {
                setSelectedPiece(clickedPiece);
                selectedPieceRef.current = clickedPiece;
            }
        } else {
            setSelectedPiece(null);
            selectedPieceRef.current = null;
        }
    }

    function takeWhitePiece(pieceMoving: chessPiece) {
        // Since en passant takes a piece not on the same square, it needs to be checked individually
        let newWhite = whitePieces.filter(piece => {
            return (piece.location != pieceMoving.location && piece.location != enPassantTake);
        });

        let newBlack = blackPieces.filter(piece => {
            return piece.location != selectedPiece?.location;
        });

        newBlack.push(pieceMoving);

        setWhitePieces(newWhite);
        setBlackPieces(newBlack);
    }

    function takeBlackPiece(pieceMoving: chessPiece) {
        // Since en passant takes a piece not on the same square, it needs to be checked individually
        let newBlack = blackPieces.filter(piece => {
            return (piece.location != pieceMoving.location && piece.location != enPassantTake)
        });

        let newWhite = whitePieces.filter(piece => {
            return piece.location != selectedPiece?.location;
        });

        newWhite.push(pieceMoving)

        setBlackPieces(newBlack);
        setWhitePieces(newWhite);
    }

    function getPotentialMovesFromList(moves: number[][]) {
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

        return potentialLocs;
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

        let moves: number[][] = [];

        let colIdx = columns.findIndex((col) => {
            return col == piece.location.charAt(0);
        });

        let row = parseInt(piece.location.charAt(1));

        if (piece.color == pieceColor.white) {
            let  movesAhead = (row == 2 ? 2 : 1); // Double  first move logic

            for (let i = 1; i <= movesAhead; i++) {
                let newLoc = columns[colIdx] + (row + i); // Add if white
                let collision = checkPieceCollision(newLoc);

                if (collision > 0) {
                    break;
                } else {
                    potentialLocs.push(newLoc);
                }
            }

            //Potential attacking moves
            moves = [
                [-1, 1],
                [1, 1]
            ]
        }

        if (piece.color == pieceColor.black) {
            let  movesAhead = (row == 7 ? 2 : 1); // Double first move logic

            for (let i = 1; i <= movesAhead; i++) {
                let newLoc = columns[colIdx] + (row - i); // Subtract if black
                let collision = checkPieceCollision(newLoc);

                if (collision > 0) {
                    break;
                } else {
                    potentialLocs.push(newLoc);
                }
            }

            // Potential attacking moves
            moves = [
                [-1, -1],
                [1, -1]
            ]
        }

        moves.forEach((move) => {
            let newLoc: String = "";

            newLoc = (columns[colIdx + move[0]] ?? "") + (row + move[1]);
            
            let collision = checkPieceCollision(newLoc);

            if(collision > 0 && collision != piece.color) {
                potentialLocs.push(newLoc);
            }
        })

        // If pawn has double moved
        if (enPassantRef.current != null) {
            let enColIdx = columns.findIndex((col) => {
                return col == enPassantRef.current!.charAt(0);
            });

            let enRow = parseInt(enPassantRef.current!.charAt(1));

            // If en passant actually possible
            if (row == enRow && Math.abs(enColIdx - colIdx) == 1) {
                let newLoc: string = (columns[enColIdx] + (row == 5 ? '6' : '3'));

                // Add en passant as possible move and track potential en passant take
                potentialLocs.push(newLoc);
                setEnPassantTake(enPassantRef.current);
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

        let potentialLocs: String[] = getPotentialMovesFromList(moves);
        
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

        let potentialLocs: String[] = getPotentialMovesFromList(moves);
        
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

        // Check for collisions with pieces
        allPiecesRef.current.forEach(existingPiece => {
            if (existingPiece.location == newLoc) {
                collision = existingPiece.color;
            }
        });

        // Check if en passant has happened
        allPiecesRef.current.forEach(existingPiece => {
            if (existingPiece.location == enPassantTake) {
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