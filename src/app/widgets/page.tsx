"use client";

import "./widgets.scss";

import { JSX, useState } from "react";

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
  const widgets: JSX.Element[] = [
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

  const [widgetOrder, setWidgetOrder] = useState(
    widgets.map(widget => {
      return widget.key
    })
  );

  /**
   * Moves selected widget up one spot
   * 
   * @param idx Widget index to move up
   */
 function widgetUp(idx: number) {
  setWidgetOrder(currentOrder => {
    if (idx == 0)
      return currentOrder;

    let workingOrder = [...currentOrder];

    let movingValue = currentOrder[idx];

    workingOrder[idx] = workingOrder[idx-1];
    workingOrder[idx-1] = movingValue;

    return workingOrder;
  })
 }

 /**
  * Moves selected widget down one spot
  * 
  * @param idx Widget index to move down
  */
function widgetDown(idx: number): void {
  setWidgetOrder(currentOrder => {
    if (idx == currentOrder.length - 1)
      return currentOrder

    let workingOrder = [...currentOrder];

    let movingValue = currentOrder[idx];
    
    workingOrder[idx] = workingOrder[idx + 1];
    workingOrder[idx + 1] = movingValue;

    return workingOrder;
  })
}

  return (
    <div className="widgetsContainer">
        {widgetOrder.map((widgetX, i) => (
          <div className="widget" key={widgetX}>
            <span className="orderControlBtns">
              <img id="upBtn" src="../arrow.svg" onClick={() => widgetUp(i)} />
              <img id="downBtn" src="../arrow.svg" onClick={() => widgetDown(i)} />
            </span>

            {widgets.find(widget => {
              return (widget.key == widgetX)
            })}
          </div>
        ))}
    </div>
  );
}