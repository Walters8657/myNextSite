import "./flashcards.scss"

import { useEffect, useState } from "react";
import ToolCard from "../../ui/toolCard/toolCard";
import { Flashcard } from "./types";

//Capitals
import { stateCapitals } from "./flashcardData/stateCapitals";
import { europeanCapitals } from "./flashcardData/europeanCapitals";
import { northAmericanCapitals } from "./flashcardData/northAmericanCapitals";
import { southAmericanCapitals } from "./flashcardData/southAmericanCapitals";
import { asianCapitals } from "./flashcardData/asianCapitals";
import { oceanicCapitals } from "./flashcardData/oceanicCapitals";
import { africanCapitals } from "./flashcardData/africanCapitals";

//Spanish
import { basicSpanish } from "./flashcardData/basicSpanish";

const cardSets = [
    // Capitals
    { name: "US State Capitals", flashcards: stateCapitals },
    { name: "European Capitals", flashcards: europeanCapitals },
    { name: "North American Capitals", flashcards: northAmericanCapitals },
    { name: "South American Capitals", flashcards: southAmericanCapitals },
    { name: "Asian Capitals", flashcards: asianCapitals },
    { name: "Oceanic Capitals", flashcards: oceanicCapitals },
    { name: "African Capitals", flashcards: africanCapitals },

    // Spanish
    { name: "Spanish Colors", flashcards: basicSpanish[0] },
    { name: "Spanish Directions", flashcards: basicSpanish[1] },
    { name: "Spanish Greetings", flashcards: basicSpanish[2] },
    { name: "Spanish Answers", flashcards: basicSpanish[3] },
    { name: "Spanish Pronouns", flashcards: basicSpanish[4] },
    { name: "Spanish Days of the Week", flashcards: basicSpanish[5] },
    { name: "Spanish Months of the Year", flashcards: basicSpanish[6] },
    { name: "Spanish Animals", flashcards: basicSpanish[7] },
    { name: "Spanish Family", flashcards: basicSpanish[8] },
    { name: "Spanish Actions", flashcards: basicSpanish[9] },
    { name: "Spanish Feelings", flashcards: basicSpanish[10] },
    { name: "Spanish Numbers", flashcards: basicSpanish[11] },
];

export default function Flashcards() {
    const [flashcards, setFlashcards] = useState<Flashcard[]>(stateCapitals);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [currentCardSet, setCurrentCardSet] = useState("US State Capitals");
    const [isFront, setIsFront] = useState(true);
    const [inverted, setInverted] = useState(false);

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
            <span id="invertCheckboxContainer">
                <input type="checkbox" id="invert" name="invert" checked={inverted} onChange={() => setInverted(!inverted)} />
                <label htmlFor="invert">Invert Flashcards</label>
            </span>
            <button id="shuffleBtn" className="centerButton" onClick={() => shuffleCards()}>Shuffle</button>
            <div className="flashcardsContainer">
                <div className="flashcardsCard" onClick={() => setIsFront(!isFront)}>
                    <div className={`flashcardsCardFront ${isFront ? "active" : ""}`}>
                        {inverted ? flashcards[currentCardIndex].back : flashcards[currentCardIndex].front}
                    </div>
                    <div className={`flashcardsCardBack ${!isFront ? "active" : ""}`}>
                        {inverted ? flashcards[currentCardIndex].front : flashcards[currentCardIndex].back}
                    </div>
                </div>
            </div>
            <p>{currentCardIndex + 1} / {flashcards.length}</p>
            <div className="prevNextButtons">
                <button id="prevBtn" onClick={() => prevCard()}>{'<'}</button>
                <button id="nextBtn" onClick={() => nextCard()}>{'>'}</button>
            </div>
        </ToolCard>
    );
}