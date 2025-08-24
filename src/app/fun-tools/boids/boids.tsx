import { useEffect, useState, useRef } from "react";
import ToolCard from "../../ui/toolCard/toolCard";
import './boids.scss';

export default function Boids() {
    const [numBoids, setNumBoids] = useState<number>(25);
    const [baseAttraction, setBaseAttraction] = useState<number>(1);
    const [baseRepulsion, setBaseRepulsion] = useState<number>(1);
    const [baseInfluence, setBaseInfluence] = useState<number>(1);
    const [baseMaxSpeed, setBaseMaxSpeed] = useState<number>(25);
    const [baseTurnRadius, setBaseTurnRadius] = useState<number>(10);
    const [baseViewDistance, setBaseViewDistance] = useState<number>(50);
    const [variance, setVariance] = useState<number>(0.2);

    const [boids, setBoids] = useState<Boid[]>([]);

    const simulationRef = useRef<HTMLDivElement>(null);

    class Boid {
        position: {
            x: number;
            y: number
        };
        velocity: {
            x: number;
            y: number;
        };
        
        attraction: number;
        repulsion: number;
        influence: number;
        maxSpeed: number;
        turnRadius: number;
        viewDistance: number;
    
        constructor (position?: {x: number, y: number}, velocity?: {x: number, y: number}) {
            this.position = position || { x: 0, y: 0 };
            this.velocity = velocity || { x: 0, y: 0 };
    
            this.attraction = getVarianceValue(baseAttraction);
            this.repulsion = getVarianceValue(baseRepulsion);
            this.influence = getVarianceValue(baseInfluence);
            this.maxSpeed = getVarianceValue(baseMaxSpeed);
            this.turnRadius = getVarianceValue(baseTurnRadius);
            this.viewDistance = getVarianceValue(baseViewDistance);
        }
    } 

    // On simulation container change
    useEffect(() => {
        if (simulationRef.current) {
            refreshBoids();
        }
    }, [simulationRef.current]);

    // On number of boids change
    useEffect(() => {
        refreshBoids();
    }, [numBoids]);

    // On any of the base parameters change
    useEffect(() => {
        updateBoidsPreservePositionVelocity();
    }, [baseAttraction, baseRepulsion, baseInfluence, baseMaxSpeed, baseTurnRadius, baseViewDistance, variance]);

    // Create new boids
    function refreshBoids() {
        const newBoids = Array.from({ length: numBoids }, () => {
            const position = getRandomPosition();
            return new Boid(position);
        });
        console.log("Refresh Boids");
        setBoids(newBoids);
    }

    // Update boids with new parameters, preserving the existing position and velocity
    function updateBoidsPreservePositionVelocity() {
        setBoids(boids.map(boid => {
            return new Boid(
                boid.position,
                boid.velocity
            );
        }));
    }

    // Get a random position within the simulation window
    function getRandomPosition() {
        const simulationWindow = simulationRef.current;
        const maxX = simulationWindow?.clientWidth || 248; // fallback width
        const maxY = simulationWindow?.clientHeight || 210; // fallback height

        return {
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY)
        }
    }

    // Get a value with a variance from the base value
    function getVarianceValue(baseValue: number) {
        const offset = Math.random() * variance * baseValue;

        if (Math.random() < 0.5) {
            return baseValue + offset;
        }

        return baseValue - offset;
    }

    return (
        <ToolCard title="Boids">
            <div id="boidsContainer">
                <div id="boidsSimulation" ref={simulationRef}>
                    {boids.map((boid, index) => (
                        <div key={index} className="boid" style={{
                            left: boid.position.x + 'px',
                            top: boid.position.y + 'px'
                        }}></div>
                    ))}
                </div>
                <span className="boidsInput">
                    <label htmlFor="numBoids">Number of Boids</label>
                    <input type="number" id="numBoids" value={numBoids} min={1} max={100} step={1} onChange={(e) => setNumBoids(parseInt(e.target.value))} />
                </span>
                <span className="boidsInput">
                    <label htmlFor="baseAttraction">Base Attraction</label>
                    <input type="number" id="baseAttraction" value={baseAttraction} min={0} max={10} step={0.1} onChange={(e) => setBaseAttraction(parseFloat(e.target.value))} />
                </span>
                <span className="boidsInput">
                    <label htmlFor="baseRepulsion">Base Repulsion</label>
                    <input type="number" id="baseRepulsion" value={baseRepulsion} min={0} max={10} step={0.1} onChange={(e) => setBaseRepulsion(parseFloat(e.target.value))} />
                </span>
                <span className="boidsInput">
                    <label htmlFor="baseInfluence">Base Influence</label>
                    <input type="number" id="baseInfluence" value={baseInfluence} min={0} max={10} step={0.1} onChange={(e) => setBaseInfluence(parseFloat(e.target.value))} />
                </span>
                <span className="boidsInput">
                    <label htmlFor="baseMaxSpeed">Base Max Speed</label>
                    <input type="number" id="baseMaxSpeed" value={baseMaxSpeed} min={0} max={100} step={1} onChange={(e) => setBaseMaxSpeed(parseInt(e.target.value))} />
                </span>
                <span className="boidsInput">
                    <label htmlFor="baseTurnRadius">Base Turn Radius</label>
                    <input type="number" id="baseTurnRadius" value={baseTurnRadius} min={0} max={100} step={1} onChange={(e) => setBaseTurnRadius(parseInt(e.target.value))} />
                </span>
                <span className="boidsInput">
                    <label htmlFor="baseViewDistance">Base View Distance</label>
                    <input type="number" id="baseViewDistance" value={baseViewDistance} min={0} max={100} step={1} onChange={(e) => setBaseViewDistance(parseInt(e.target.value))} />
                </span>
                <span className="boidsInput">
                    <label htmlFor="variance">% Variance</label>
                    <input type="number" id="variance" value={variance} min={0} max={1} step={0.01} onChange={(e) => setVariance(parseFloat(e.target.value))} />
                </span>
            </div>
        </ToolCard>
    );
}