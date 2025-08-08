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

    const shuffleBars = () => {
        setBars([...bars].sort(() => Math.random() - 0.5));
    }

    const bubbleSort = async () => {
        let newBars = [...bars];
        let swapped = true;

        while (swapped) {
            swapped = false;
            for (let i = 0; i < newBars.length - 1; i++) {
                // If out of order, swap the bars
                if (newBars[i].order > newBars[i + 1].order) {
                    // Swap the bars
                    let temp = newBars[i];
                    newBars[i] = newBars[i + 1];
                    newBars[i + 1] = temp;
                    swapped = true;
                    
                    // Update state with current step
                    setBars([...newBars]);
                    
                    // Wait before next step
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
        }
    }

    const selectionSort = async () => { alert("Selection Sort"); }
    const insertionSort = async () => { alert("Insertion Sort"); }
    const mergeSort = async () => { alert("Merge Sort"); }
    const quickSort = async () => { alert("Quick Sort"); }

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
