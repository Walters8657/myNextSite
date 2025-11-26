"use client";
import "./widgets.scss";

import Snake from "./snake/snake";
import Boids from "./boids/boids";
import GameOfLife from "./gameOfLife/gameOfLife";
import Flashcards from "./flashCards/flashcards";
import Minesweeper from "./minesweeper/minesweeper";
import CanvasOfBabble from "./canvasOfBabble/babble";
import HowMuchFaster from "./howMuchFaster/howMuchFaster";
import ColorConverter from "./colorConverter/colorConverter";
import SortingVisualizations from "./sortingVisualizations/sortingVisualizations";

export default function Page() {
  const widgets = [
    <Snake key="snake" />,
    <Boids key="boids" />,
    <Flashcards key="flashcards" />,
    <GameOfLife key="gameOfLife" />,
    <Minesweeper key="minesweeper" />,
    <HowMuchFaster key="howMuchFaster" />,
    <ColorConverter key="colorConverter" />,
    <CanvasOfBabble key="canvasOfBabble" />,
    <SortingVisualizations key="sortingVisualizations" />,
  ];

  return (
    <div className="widgetsContainer">
        {widgets.map((widget, i) => (
          <div className="widget" key={i}>
            {widget}
          </div>
        ))}
    </div>
  );
}