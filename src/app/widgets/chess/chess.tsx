"use client";
import ToolCard from "@/app/ui/toolCard/toolCard";

import './chess.scss'
import { Activity, useEffect, useRef, useState } from "react";

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

    const [potentialMoveList, setPotentialMoveList] = useState<string[] | null>([]);
    const [enPassantTake, setEnPassantTake] = useState<string | null>(null);

    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [resolvePromotionPromise, setResolvePromotionPromise] = useState<((value: number | null) => void)>();

    const playerTurnRef = useRef<number>(1);

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
        playerTurnRef.current = pieceColor.white;
    }

    function resetWhitePieces() {
        let newWhitePieces: chessPiece[] = [];

        columns.forEach(col => {
            // Pawn Setup
            let newPawn = new chessPiece(col + "2", pieceType.pawn, pieceColor.white);
            newWhitePieces.push(newPawn);

            // Major Piece Setup
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

            newWhitePieces.push(newPiece);
        });

        setWhitePieces(newWhitePieces);
    }

    function resetBlackPieces() {
        let newBlackPieces: chessPiece[] = [];

        columns.forEach(col => {
            // Pawn Setup
            let newPawn= new chessPiece(col + "7", pieceType.pawn, pieceColor.black);
            newBlackPieces.push(newPawn);

            // Major Piece Setup
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

            newBlackPieces.push(newPiece);
        });

        setBlackPieces(newBlackPieces);
    }

    //#region CSS Classes
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

    function getPromotionClass(pieceTypeNum: number): string {
        return (playerTurnRef.current == pieceColor.white ? "whitePiece " : "blackPiece ") + "piece boardSquare piece" + pieceTypeNum
    }

    function boardSquareColor(cIdx: number, rIdx: number): string {
        let className: string = "";

        if (rIdx % 2 == 0) // Even Row
            className = (cIdx % 2) == 1 ? "darkSquare " : "lightSquare "
        else // Odd Row
            className = (cIdx % 2) == 0 ? "darkSquare " : "lightSquare "
        
        return className;
    }
    //#endregion CSS Classes

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

    async function handleOnBoardClick(col: string, row: string) {
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

            //#region Promotion Logic
            if (pieceMoving.pieceType == pieceType.pawn) {
                if (["1", "8"].includes(row)) {
                    pieceMoving.pieceType = await openPromotePiece();
                }
            }
            //#endregion Promotion Logic

            if (collision > 0 && collision != pieceMoving.color) { // If colliding with other colors piece
                if (collision == 1) {
                    takeWhitePiece(pieceMoving);
                } else {
                    takeBlackPiece(pieceMoving);
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

    const openPromotePiece = () => {
        setShowPromotionModal(true);
        return new Promise((resolve: ((value: number) => void)) => {
            setResolvePromotionPromise(() => resolve);
        })
    }

    const closePromotePiece = (pieceSelection: number) => {
        if (resolvePromotionPromise) {
            resolvePromotionPromise(pieceSelection);
        }
        setShowPromotionModal(false);
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

    //#region Get Moves
    function setPotentialMoves() {
        let potentialMoves: string[] = [];
        switch (selectedPieceRef.current?.pieceType) {
            case pieceType.pawn: 
                potentialMoves = getPawnMoves();
                break;
            case pieceType.knight:
                potentialMoves = getKnightMoves();
                break;
            case pieceType.king:
                potentialMoves = getKingMoves();
                break;
            case pieceType.rook:
                potentialMoves = getRookMoves();
                break;
            case pieceType.bishop:
                potentialMoves = getBishopMoves();
                break;
            case pieceType.queen:
                potentialMoves = getQueenMoves();
                break;
            default: // Handles no piece selected
                break;
        }

        let badMoves: string[] = [];

        potentialMoves.forEach(move => {
            let testState: chessPiece[] = [...allPiecesRef.current];
            let selected: chessPiece | null = Object.assign({}, selectedPieceRef.current);

            testState = testState.filter(piece => {
                return (
                    piece.location != selected.location
                    && piece.location != move
                )
            });

            selected.location = move;

            testState.push(selected);

            if (checkIsCheck(selected.color, testState)) {
                badMoves.push(move);
            }
        });

        potentialMoves = potentialMoves.map(move => {
            if (!badMoves.includes(move)) {
                return move;
            }
            
            return "";
        })

        setPotentialMoveList(potentialMoves);
    }

    function getPotentialMovesFromList(moves: number[][], piece = selectedPieceRef.current!, gameState = allPiecesRef.current!) {
        let potentialLocs: string[] = [];

        let colIdx = columns.findIndex((col) => {
            return col == piece.location.charAt(0);
        });

        let row = parseInt(piece.location.charAt(1));

        moves.forEach((move) => {
            let newLoc: string = "";

            newLoc = (columns[colIdx + move[0]] ?? "") + (row + move[1]);

            if(checkPieceCollision(newLoc, gameState) != piece.color) {
                potentialLocs.push(newLoc);
            }
        })

        return potentialLocs;
    }

    function getPawnMoves(piece = selectedPieceRef.current!, gameState = allPiecesRef.current!) {
        let potentialLocs: string[] = [];

        let moves: number[][] = [];

        let colIdx = columns.findIndex((col) => {
            return col == piece.location.charAt(0);
        });

        let row = parseInt(piece.location.charAt(1));

        if (piece.color == pieceColor.white) {
            //Potential attacking moves
            moves = [
                [-1, 1],
                [1, 1]
            ]

            let  movesAhead = (row == 2 ? 2 : 1); // Double  first move logic

            for (let i = 1; i <= movesAhead; i++) {
                let newLoc = columns[colIdx] + (row + i); // Add if white
                let collision = checkPieceCollision(newLoc, gameState);

                if (collision > 0) {
                    break;
                } else {
                    potentialLocs.push(newLoc);
                }
            }
        }

        if (piece.color == pieceColor.black) {
            // Potential attacking moves
            moves = [
                [-1, -1],
                [1, -1]
            ]

            let  movesAhead = (row == 7 ? 2 : 1); // Double first move logic

            for (let i = 1; i <= movesAhead; i++) {
                let newLoc = columns[colIdx] + (row - i); // Subtract if black
                let collision = checkPieceCollision(newLoc, gameState);

                if (collision > 0) {
                    break;
                } else {
                    potentialLocs.push(newLoc);
                }
            }
        }

        moves.forEach((move) => {
            let newLoc: string = "";

            newLoc = (columns[colIdx + move[0]] ?? "") + (row + move[1]);
            
            let collision = checkPieceCollision(newLoc, gameState);

            if(collision > 0 && collision != piece.color) {
                potentialLocs.push(newLoc);
            }
        })

        // If enemy neighbor pawn just double moved
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

        return potentialLocs;
    }

    function getKnightMoves(piece = selectedPieceRef.current!, gameState = allPiecesRef.current!) {
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

        let potentialLocs: string[] = getPotentialMovesFromList(moves, piece, gameState);
        
        return potentialLocs;
    }

    function getKingMoves(piece = selectedPieceRef.current!, gameState = allPiecesRef.current!) {
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

        let potentialLocs: string[] = getPotentialMovesFromList(moves, piece, gameState);
        
        return potentialLocs;
    }

    function getQueenMoves(piece = selectedPieceRef.current!, gameState = allPiecesRef.current!) {
        let potentialLocs: string[] = [];
        let potentialLocs1: string[] = [];
        let potentialLocs2: string[] = [];

        potentialLocs1 = getBishopMoves(piece, gameState);
        potentialLocs2 = getRookMoves(piece, gameState);

        potentialLocs = potentialLocs1.concat(potentialLocs2);

        return potentialLocs;
    }

    function getRookMoves(piece = selectedPieceRef.current!, gameState = allPiecesRef.current!) {
        let potentialLocs: string[] = [];

        let colIdx = columns.findIndex((col) => {
            return col == piece.location.charAt(0);
        });

        let row = parseInt(piece.location.charAt(1));

        //#region Up
        for (let i = row + 1; i <= 8; i++) {
            let newLoc = piece.location.charAt(0) + i;
            let collision = checkPieceCollision(newLoc, gameState);

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
            let collision = checkPieceCollision(newLoc, gameState);

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
            let collision = checkPieceCollision(newLoc, gameState);

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
            let collision = checkPieceCollision(newLoc, gameState);

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

    function getBishopMoves(piece = selectedPieceRef.current!, gameState = allPiecesRef.current!) {
        let potentialLocs: string[] = [];

        let colIdx = columns.findIndex((col) => {
            return col == piece.location.charAt(0);
        });

        let row = parseInt(piece.location.charAt(1));
        
        //#region Up Right
        for (let i = colIdx + 1; i <= 8; i++) {
            let newLocUp = (columns[i] ?? "") + (row + (colIdx - i));

            let upCollision = checkPieceCollision(newLocUp, gameState);

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

            let upCollision = checkPieceCollision(newLocUp, gameState);

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

            let upCollision = checkPieceCollision(newLocUp, gameState);

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

            let upCollision = checkPieceCollision(newLocUp, gameState);

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
    //#endregion Get Moves

    /**
     * 
     * @param newLoc Location to check for collision
     * @returns 0 if no collision, 1 if white collision, 2 if black collision
     */
    function checkPieceCollision(newLoc: string, gameState = allPiecesRef.current): number {
        let collision: number = 0;

        // Check for collisions with pieces
        gameState.forEach(existingPiece => {
            if (existingPiece.location == newLoc) {
                collision = existingPiece.color;
            }
        });

        // Check if en passant has happened
        gameState.forEach(existingPiece => {
            if (existingPiece.location == enPassantTake) {
                collision = existingPiece.color;
            }
        });

        return collision;
    }

    function checkIsCheck(color: number, gameState = allPiecesRef.current) {
        let ownKing = gameState.find(piece => {
            return (
                piece.color == color
                && piece.pieceType == pieceType.king
            )
        });

        let enemyPawns: (chessPiece | undefined)[] = gameState.map(piece => {
            if (piece.color != color && piece.pieceType == pieceType.pawn) {
                return piece;
            }
        });

        const bishopMoves: string[] = getBishopMoves(ownKing, gameState);
        const rookMoves: string[] = getRookMoves(ownKing, gameState);
        const knightMoves: string[] = getKnightMoves(ownKing, gameState);
        const pawnMoves: string[] = getPawnMoves(ownKing, gameState);

        let isCheck = false;

        bishopMoves.forEach(move => {
            let kingAttacker = gameState.find(piece => {
                return (
                    piece.color !=  color // Opposite color piece
                    && piece.location == move // Target square
                    && (
                        [
                            pieceType.bishop,
                            pieceType.queen
                        ].includes(piece.pieceType) // Piece can see king
                    )
                )
            });

            if (kingAttacker != undefined) {
                isCheck = true;
            }
        });

        rookMoves.forEach(move => {
            let kingAttacker = gameState.find(piece => {
                return (
                    piece.color !=  color // Opposite color piece
                    && piece.location == move // Target square
                    && (
                        [
                            pieceType.rook,
                            pieceType.queen
                        ].includes(piece.pieceType) // Piece can see king
                    )
                )
            });

            if (kingAttacker != undefined) {
                isCheck = true;
            }
        });

        knightMoves.forEach(move => {
            let kingAttacker = gameState.find(piece => {
                return (
                    piece.color !=  color // Opposite color piece
                    && piece.location == move // Target square
                    && (
                        [
                            pieceType.knight
                        ].includes(piece.pieceType) // Piece can see king
                    )
                )
            });

            if (kingAttacker != undefined) {
                isCheck = true;
            }
        });

        pawnMoves.forEach(move => {
            let kingAttacker = gameState.find(piece => {
                return (
                    piece.color !=  color // Opposite color piece
                    && piece.location == move // Target square
                    && (
                        [
                            pieceType.pawn
                        ].includes(piece.pieceType) // Piece can see king
                    )
                )
            });

            if (kingAttacker != undefined) {
                isCheck = true;
            }
        });

        return isCheck;
    }

    return (
        <ToolCard title="Chess">
            <button id="resetChess" onClick={resetGame}>Reset Game</button>
            <table id="chessBoard">
                <tbody className={showPromotionModal ? "darkOverlay" : ""}>
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
                <Activity mode={showPromotionModal ? "visible" : "hidden"}>
                    <tbody id="promotionRow">
                        <tr>
                            <td className="lightSquare">
                                <span 
                                    onClick={() => closePromotePiece(pieceType.queen)}
                                    className={getPromotionClass(pieceType.queen)}
                                ></span>
                            </td>
                            <td className="lightSquare">
                                <span 
                                    onClick={() => closePromotePiece(pieceType.rook)}
                                    className={getPromotionClass(pieceType.rook)}
                                ></span>
                            </td>
                            <td className="lightSquare">
                                <span 
                                    onClick={() => closePromotePiece(pieceType.bishop)}
                                    className={getPromotionClass(pieceType.bishop)}
                                ></span>
                            </td>
                            <td className="lightSquare">
                                <span 
                                    onClick={() => closePromotePiece(pieceType.knight)}
                                    className={getPromotionClass(pieceType.knight)}
                                ></span>
                            </td>
                        </tr>
                    </tbody>
                </Activity>
            </table>
        </ToolCard>
    )
}