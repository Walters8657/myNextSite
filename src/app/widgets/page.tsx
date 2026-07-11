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
import Chess from "./chess/chess";


export default function Page() {
  const [lastClickedWidget, setLastClickedWidget] = useState("");
  const widgets: JSX.Element[] = [
    <Chess key="chess" />
    ,<Snake key="snake" lastClicked={lastClickedWidget}/>
    ,<Boids key="boids" />
    ,<Flashcards key="flashcards" />
    ,<GameOfLife key="gameOfLife" />
    ,<Minesweeper key="minesweeper" />
    ,<HowMuchFaster key="howMuchFaster" />
    ,<ColorConverter key="colorConverter" />
    ,<CanvasOfBabble key="canvasOfBabble" />
    ,<SortingVisualizations key="sortingVisualizations" />
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

  /**
   * TODO: Drag and Drop Reordering
   * 
   * --- Psudo ---
   * On start dragging gray out background and create a copy of the selected element at the cursor position
   * Do NOT check for change unless the element is different than the selected
   * As the cursor moves to a different element, move above if on top half, below if on bottom half
   * Iterate through the map comparing to the newly hovered element
   * --- Psudo ---
   */

  return (
    <div className="widgetsContainer">
        {widgetOrder.map((widgetX, i) => (
          <div className="widget" key={widgetX} onClick={() => setLastClickedWidget(widgetX ?? "")}>
            <div id="titleBar">
              <p>Title Here</p>
            </div>
            <span className="orderControlBtns">
              <img id="upBtn" src="/arrow.svg" onClick={() => widgetUp(i)} />
              <img id="downBtn" src="/arrow.svg" onClick={() => widgetDown(i)} />
            </span>

            {widgets.find(widget => {
              return (widget.key == widgetX)
            })}
          </div>
        ))}
    </div>
  );
}