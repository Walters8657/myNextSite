"use client";
// @ts-ignore: react-masonry-component has no types
import Masonry from "react-masonry-component";
import "./funTools.scss";
import ColorConverter from "./colorConverter/colorConverter";
import HowMuchFaster from "./howMuchFaster/howMuchFaster";
import Minesweeper from "./minesweeper/minesweeper";
import SortingVisualizations from "./sortingVisualizations/sortingVisualizations";
import Boids from "./boids/boids";

export default function Page() {
  const widgets = [
    <Boids key="boids" />,
    <Minesweeper key="minesweeper" />,
    <ColorConverter key="colorConverter" />,
    <HowMuchFaster key="howMuchFaster" />,
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
          <div className="fun-tools-widget" key={i}>
            {widget}
          </div>
        ))}
      </Masonry>
    </div>
  );
}