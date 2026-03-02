"use client";
import ToolCard from "@/app/ui/toolCard/toolCard";

import './chess.scss'
import { useEffect, useState } from "react";

const pieceType: Record<string, number> = {
    "pawn": 1
    ,"king": 2
    ,"queen": 3
    ,"bishop": 4
    ,"knight": 5
    ,"rook": 6
} as const

interface chessPiece {
    location: string;
    pieceType: number;
}

export default function Chess() {
    let columns: string[]= ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    let rows: string[] = ['1', '2', '3', '4', '5', '6', '7', '8'];

    const [whitePieces, setWhitePieces] = useState<chessPiece[]>();
    const [blackPieces, setBlackPieces] = useState<chessPiece[]>();

    function resetGame() {
        resetWhitePieces();
        resetBlackPieces();
    }

    function resetWhitePieces() {
        let newWhitePieces: chessPiece[] = [];

        columns.forEach(col => {
            let newPiece: chessPiece = {location: col + "2", pieceType: pieceType.pawn};
            newWhitePieces.push(newPiece);

            let row1Loc = col + "1";

            if (["a", "h"].includes(col)) {
                newPiece = {location: row1Loc, pieceType: pieceType.rook}
            } else if (["b", "g"].includes(col)) {
                newPiece = {location: row1Loc, pieceType: pieceType.knight}
            } else if (["c", "f"].includes(col)) {
                newPiece = {location: row1Loc, pieceType: pieceType.bishop}
            } else if (col == "d") {
                newPiece = {location: row1Loc, pieceType: pieceType.queen}
            } else if (col == "e") {
                newPiece = {location: row1Loc, pieceType: pieceType.king}
            }

            newWhitePieces.push(newPiece);
        });

        setWhitePieces(newWhitePieces);
    }

    function resetBlackPieces() {
        let newBlackPieces: chessPiece[] = [];

        columns.forEach(col => {
            let newPiece: chessPiece = {location: col + "7", pieceType: pieceType.pawn};
            newBlackPieces.push(newPiece);

            let row1Loc = col + "8";

            if (["a", "h"].includes(col)) {
                newPiece = {location: row1Loc, pieceType: pieceType.rook}
            } else if (["b", "g"].includes(col)) {
                newPiece = {location: row1Loc, pieceType: pieceType.knight}
            } else if (["c", "f"].includes(col)) {
                newPiece = {location: row1Loc, pieceType: pieceType.bishop}
            } else if (col == "d") {
                newPiece = {location: row1Loc, pieceType: pieceType.queen}
            } else if (col == "e") {
                newPiece = {location: row1Loc, pieceType: pieceType.king}
            }

            newBlackPieces.push(newPiece);
        });

        setBlackPieces(newBlackPieces);
    }

    useEffect(() => {
        resetGame();
    }, []);

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

        return className;
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
                                    <span className={getPieceClass(col, row)}></span>
                                </td>)
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </ToolCard>
    )
}