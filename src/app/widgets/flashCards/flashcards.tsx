import { useEffect, useState } from "react";
import ToolCard from "../../ui/toolCard/toolCard";
import "./flashcards.scss"
import { stateCapitals } from "./stateCapitals";
import { basicSpanish } from "./basicSpanish";
import { Flashcard } from "./types";

const cardSets = [
    { name: "State Capitals", flashcards: stateCapitals },
    { name: "Basic Spanish", flashcards: basicSpanish }
];

export default function Flashcards() {
    const [flashcards, setFlashcards] = useState<Flashcard[]>(stateCapitals);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [currentCardSet, setCurrentCardSet] = useState("State Capitals");
    const [isFront, setIsFront] = useState(true);

    // Get new selection of flashcards, shuffle them, and update states
    useEffect(() => {
        let newFlashcards = cardSets.find(set => set.name === currentCardSet)?.flashcards || [];
        
        newFlashcards = [...newFlashcards].sort(() => Math.random() - 0.5);
        setFlashcards(newFlashcards);
        setCurrentCardIndex(0);
        setIsFront(true);
    }, [currentCardSet]);

    function shuffleCards() {
        let newFlashcards = [...flashcards];
        newFlashcards = newFlashcards.sort(() => Math.random() - 0.5);
        setFlashcards(newFlashcards);
        setCurrentCardIndex(0);
        setIsFront(true);
    }

    function prevCard() {
        let maxIndex = flashcards.length - 1;
        let newIndex = currentCardIndex - 1;

        newIndex < 0 ? newIndex = maxIndex : null;
        setCurrentCardIndex(newIndex);
        setIsFront(true);
    }

    function nextCard() {
        let maxIndex = flashcards.length - 1;
        let newIndex = currentCardIndex + 1;
        
        newIndex > maxIndex ? newIndex = 0 : null;
        setCurrentCardIndex(newIndex);
        setIsFront(true);
    }

    function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setCurrentCardSet(e.target.value);
    }

    return (
        <ToolCard title="Flashcards">
            <select name="cardSets" id="cardSets" value={currentCardSet} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSelectChange(e)}>
                {cardSets.map((set) => (
                    <option key={set.name} value={set.name}>{set.name}</option>
                ))}
            </select>
            <button id="shuffleBtn" className="center-button" onClick={() => shuffleCards()}>Shuffle</button>
            <div className="flashcards-container">
                <div className="flashcards-card" onClick={() => setIsFront(!isFront)}>
                    <div className={`flashcards-card-front ${isFront ? "active" : ""}`}>
                        {flashcards[currentCardIndex].front}
                    </div>
                    <div className={`flashcards-card-back ${!isFront ? "active" : ""}`}>
                        {flashcards[currentCardIndex].back}
                    </div>
                </div>
            </div>
            <p>{currentCardIndex + 1} / {flashcards.length}</p>
            <div className="prev-next-buttons">
                <button id="prevBtn" onClick={() => prevCard()}>{'<'}</button>
                <button id="nextBtn" onClick={() => nextCard()}>{'>'}</button>
            </div>
        </ToolCard>
    );
}