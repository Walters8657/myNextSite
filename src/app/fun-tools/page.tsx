"use client";
// @ts-ignore: react-masonry-component has no types
import Masonry from "react-masonry-component";
import "./funTools.scss";
import ColorConverter from "../ui/colorConverter/colorConverter";
import HowMuchFaster from "../ui/howMuchFaster/howMuchFaster";
import Minesweeper from "../ui/minesweeper/minesweeper";

export default function Page() {
  const widgets = [
    <Minesweeper key="minesweeper" />,
    <ColorConverter key="colorConverter" />,
    <HowMuchFaster key="howMuchFaster" />,
  ];

  const masonryOptions = {
    transitionDuration: 0,
    gutter: 32, // 2rem
    fitWidth: true,
  };

  return (
    <Masonry
      className="my-masonry-grid"
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
  );
}