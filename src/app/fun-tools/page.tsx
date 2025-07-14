"use client";
// @ts-ignore: react-masonry-component has no types
import Masonry from "react-masonry-component";
import "./funTools.scss";
import ColorConverter from "../ui/colorConverter/colorConverter";
import dynamic from 'next/dynamic';

const Minesweeper = dynamic(() => import("../ui/minesweeper/minesweeper"), { ssr: false });

export default function Page() {
  const widgets = [
    <Minesweeper key="minesweeper1" />,
    <ColorConverter key="color1" />,
    <ColorConverter key="color2" />,
    <Minesweeper key="minesweeper2" />,
    <ColorConverter key="color3" />,
    <ColorConverter key="color4" />,
    <ColorConverter key="color5" />,
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