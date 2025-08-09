import ToolCard from "../../ui/toolCard/toolCard";
import "./sortingVisualizations.scss";
import { useEffect, useState } from "react";

interface Bar {
    order: number;
}

export default function SortingVisualizations() {
    const [bars, setBars] = useState<Bar[]>([]);
    const [selectedSortIndex, setSelectedSortIndex] = useState<number>(0);
    const numBars = 105;

    const populateBars = () => {
        setBars(Array.from({ length: numBars }, (_i, j) => ({ order: j })));
    }

    const shuffleBars = async () => {
        let newBars = [...bars];
        for (let i = newBars.length - 1; i >= 0; i--) {
            let rand = Math.floor(Math.random() * (i + 1));
          newBars = await swapAndRender(newBars, i, rand, 0);
        }
    }

    const swapBars = ( array: Bar[], i: number, j: number) => {
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;

        return array;
    }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const swapAndRender = async (array: Bar[], i: number, j: number, ms = 0): Promise<Bar[]> => {
      array = swapBars(array, i, j);
      setBars([...array]);
      await delay(ms);
      return array;
  }

    const bubbleSort = async () => {
        let newBars = [...bars];
        let swapped = true;

        while (swapped) {
            swapped = false;
            for (let i = 0; i < newBars.length - 1; i++) {
                // If out of order, swap the bars and update state
                if (newBars[i].order > newBars[i + 1].order) {
                  newBars = await swapAndRender(newBars, i, i + 1, 0);
                  swapped = true;
                }
            }
        }
    }

    const selectionSort = async () => { 
        let newBars = [...bars];
        for (let i = 0; i < newBars.length - 1; i++) {
            for (let n = i + 1; n < newBars.length; n++) {
                if (newBars[i].order > newBars[n].order) {
                  newBars = await swapAndRender(newBars, i, n, 0);
                }
            }
        }
     }

    const insertionSort = async () => {
        let newBars = [...bars];
        for (let i = 1; i < newBars.length; i++) {
            let j = i;
            // Bubble sort downwards to keep the bars in order
            while (j > 0 && newBars[j - 1].order > newBars[j].order) {
              newBars = await swapAndRender(newBars, j - 1, j, 0);
                j--;
            }
        }
    }

    const mergeSort = async () => {
        let newBars = [...bars];
        const n = newBars.length;
        for (let bucketSize = 1; bucketSize < n; bucketSize *= 2) {
            // Iterate through the bars in chunks of size bucketSize
            for (let left = 0; left < n; left += 2 * bucketSize) {
                let mid = Math.min(left + bucketSize, n);
                const right = Math.min(left + 2 * bucketSize, n);
                if (mid >= right) continue;

                let i = left;
                let j = mid;

                // Iterate through the bars in the chunk
                while (i < j && j < right) {
                    // If the bars are in order, move the pointers forward
                    if (newBars[i].order <= newBars[j].order) {
                        i++;
                    } else {
                        // Bubble sort to keep the bars in order
                      for (let k = j; k > i; k--) {
                          newBars = await swapAndRender(newBars, k, k - 1, 0);
                      }
                        i++;
                        j++;
                        mid++;
                    }
                }
            }
        }
        setBars([...newBars]);
    }

    const quickSort = async () => {
        let working = [...bars];
      
        const partition = async (low: number, high: number): Promise<number> => {
            const pivotValue = working[high].order;
            // Store index is the index of the last bar that is less than the pivot
            let storeIndex = low;
            // Iterate through the bars in the chunk
            for (let scanIndex = low; scanIndex < high; scanIndex++) {
                // If the bar is less than the pivot, swap it with the store index
                if (working[scanIndex].order <= pivotValue) {
                    working = await swapAndRender(working, storeIndex, scanIndex, 0);
                    storeIndex++;
                }
            }
            working = await swapAndRender(working, storeIndex, high, 0);
            return storeIndex;
        };

        // Stack to keep track of the low and high indices of the chunks
        const stack: Array<{ low: number; high: number }> = [];
        if (working.length > 1) stack.push({ low: 0, high: working.length - 1 });

        while (stack.length) {
            // Pop the last chunk from the stack
            const { low, high } = stack.pop()!;
            // If the chunk is empty, skip it
            if (low >= high) continue;
            // Partition the chunk and get the new pivot index
            const p = await partition(low, high);
            // If the left chunk is not empty, push it to the stack
            if (p - 1 > low) stack.push({ low, high: p - 1 });
            // If the right chunk is not empty, push it to the stack
            if (p + 1 < high) stack.push({ low: p + 1, high });
        }

        setBars([...working]);
     }

    useEffect(() => {
        populateBars();
    }, [numBars]);

    const sortTypes = [
        { name: "Bubble Sort", func: bubbleSort },
        { name: "Selection Sort", func: selectionSort },
        { name: "Insertion Sort", func: insertionSort },
        { name: "Merge Sort", func: mergeSort },
        { name: "Quick Sort", func: quickSort },
    ]

    return (
        <ToolCard>
            <p id="title">Visualizations</p>
            <button id="shuffleBtn" onClick={shuffleBars}>Shuffle</button>
            <div className="bars-container">
                {bars.map((bar) => (
                    <div key={'bar-' + bar.order} className="bar" style={{ height: `${bar.order * 2}px` }}></div>
                ))}
            </div>
            <div className="sort-container">
                <select
                    name="sortType"
                    id="sortType"
                    value={selectedSortIndex}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSortIndex(parseInt(e.target.value))}
                >
                    {sortTypes.map((type, index) => (
                        <option key={index} value={index}>{type.name}</option>
                    ))}
                </select>
                <button id="sortBtn" onClick={() => sortTypes[selectedSortIndex].func()}>Sort</button>
            </div>
        </ToolCard>
    );
}
