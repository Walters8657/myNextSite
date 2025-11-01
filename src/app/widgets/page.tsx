"use client";
// @ts-ignore: react-masonry-component has no types
import Masonry from "react-masonry-component";
import "./widgets.scss";
import ColorConverter from "./colorConverter/colorConverter";
import HowMuchFaster from "./howMuchFaster/howMuchFaster";
import Minesweeper from "./minesweeper/minesweeper";
import SortingVisualizations from "./sortingVisualizations/sortingVisualizations";
import Boids from "./boids/boids";
import GameOfLife from "./gameOfLife/gameOfLife";
import CanvasOfBabble from "./canvasOfBabble/babble";
import Flashcards from "./flashCards/flashcards";

export default function Page() {
  const widgets = [
    <Boids key="boids" />,
    <GameOfLife key="gameOfLife" />,
    <Flashcards key="flashcards" />,
    <Minesweeper key="minesweeper" />,
    <HowMuchFaster key="howMuchFaster" />,
    <ColorConverter key="colorConverter" />,
    <CanvasOfBabble key="canvasOfBabble" />,
    <SortingVisualizations key="sortingVisualizations" />,
  ];

  const masonryOptions = {
    transitionDuration: 0,
    gutter: 32, // 2rem
    fitWidth: true,
  };

  return (
    <div className="masonry-container">
      <Masonry
        options={masonryOptions}
        disableImagesLoaded={false}
        updateOnEachImageLoad={false}
      >
        {widgets.map((widget, i) => (
          <div className="widgets-widget" key={i}>
            {widget}
          </div>
        ))}
      </Masonry>
    </div>
  );
}