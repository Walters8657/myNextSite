import { useEffect, useState, useRef } from "react";
import ToolCard from "../../ui/toolCard/toolCard";
import './boids.scss';

class Boid {
    position: {
        x: number;
        y: number
    };
    velocity: {
        deg: number;
        speed: number;
    };
    
    attraction: number;
    repulsion: number;
    influence: number;
    maxSpeed: number;
    turnRadius: number;
    viewDistance: number;

    constructor (position?: {x: number, y: number}, velocity?: {deg: number, speed: number}, params?: {
        baseAttraction: number;
        baseRepulsion: number;
        baseInfluence: number;
        baseMaxSpeed: number;
        baseTurnRadius: number;
        baseViewDistance: number;
        variance: number;
    }) {
        this.position = position || { x: 0, y: 0 };
        this.velocity = velocity || { deg: 0, speed: 0 };

        if (params) {
            this.attraction = this.getVarianceValue(params.baseAttraction, params.variance);
            this.repulsion = this.getVarianceValue(params.baseRepulsion, params.variance);
            this.influence = this.getVarianceValue(params.baseInfluence, params.variance);
            this.maxSpeed = this.getVarianceValue(params.baseMaxSpeed, params.variance);
            this.turnRadius = this.getVarianceValue(params.baseTurnRadius, params.variance);
            this.viewDistance = this.getVarianceValue(params.baseViewDistance, params.variance);
        } else {
            this.attraction = 1;
            this.repulsion = 1;
            this.influence = 1;
            this.maxSpeed = 25;
            this.turnRadius = 10;
            this.viewDistance = 50;
        }
    }

    // Get a value with a variance from the base value
    getVarianceValue(baseValue: number, variance: number) {
        const offset = Math.random() * variance * baseValue;

        if (Math.random() < 0.5) {
            return baseValue + offset;
        }

        return baseValue - offset;
    }

    getNearbyBoids(boids: Boid[]) {
        return boids.filter(boid => {
            return (
                Math.sqrt(
                    Math.pow(boid.position.x - this.position.x, 2) + 
                    Math.pow(boid.position.y - this.position.y, 2)
                ) < this.viewDistance
            )
        })
    }

    setNewRotation(boids: Boid[]) {
        const nearbyBoids = this.getNearbyBoids(boids);
        let x = 0, y = 0, w = 0;

        nearbyBoids.forEach(boid => {
            const radians = boid.velocity.deg * (Math.PI / 180);
            x += Math.cos(radians) * boid.influence;
            y += Math.sin(radians) * boid.influence;
            w += boid.influence;
        });

        let angle = Math.atan2(y, x);
        
        // Convert current velocity to radians for comparison
        const currentRadians = this.velocity.deg * (Math.PI / 180);
        
        // Calculate the shortest angular difference
        let angleDiff = angle - currentRadians;
        
        // Normalize to [-π, π] range
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Apply turn radius limitation
        const maxTurn = this.turnRadius * (Math.PI / 180);
        if (Math.abs(angleDiff) > maxTurn) {
            // Apply the maximum turn in the correct direction
            angle = currentRadians + (angleDiff > 0 ? maxTurn : -maxTurn);
        }

        this.velocity.deg = angle * (180 / Math.PI);

        return this;
    }

    setNewSpeed(boids: Boid[]) {
        const nearbyBoids = this.getNearbyBoids(boids);
        let s = 0, w = 0;

        nearbyBoids.forEach(boid => {
            s += boid.velocity.speed * boid.influence;
            w += boid.influence;
        });

        let avgSpeed = s / w;

        this.velocity.speed = Math.min(avgSpeed, this.maxSpeed);

        return this;
    }

    setNewPosition() {
        let newX = this.position.x + Math.cos(this.velocity.deg * (Math.PI / 180)) * this.velocity.speed;
        let newY = this.position.y + Math.sin(this.velocity.deg * (Math.PI / 180)) * this.velocity.speed;

        // Clamp newX and newY to stay within the simulation area
        // Use fallback dimensions if DOM element is not available
        const simWidth = 248; // fallback width
        const simHeight = 210; // fallback height
        
        // Handle wrapping around the edges
        if (newX < 0) newX = simWidth + (newX % simWidth);
        if (newX >= simWidth) newX = newX % simWidth;
        if (newY < 0) newY = simHeight + (newY % simHeight);
        if (newY >= simHeight) newY = newY % simHeight;

        this.position.x = newX;
        this.position.y = newY;

        return this;
    }
} 

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

    // On simulation container change
    useEffect(() => {
        if (simulationRef.current) {
            createNewBoids();
        }
    }, [simulationRef.current]);

    // On number of boids change
    useEffect(() => {
        createNewBoids();
    }, [numBoids]);

    // On any of the base parameters change
    useEffect(() => {
        updateBoidsPreservePositionVelocity();
    }, [baseAttraction, baseRepulsion, baseInfluence, baseMaxSpeed, baseTurnRadius, baseViewDistance, variance]);

    // Create new boids
    function createNewBoids() {
        const newBoids = Array.from({ length: numBoids }, () => {
            const position = getRandomPosition();
            return new Boid(position, undefined, {
                baseAttraction,
                baseRepulsion,
                baseInfluence,
                baseMaxSpeed,
                baseTurnRadius,
                baseViewDistance,
                variance
            });
        });

        newBoids.forEach(boid => {
            boid.velocity = getRandomVelocity(boid.maxSpeed);
        });

        setBoids(newBoids);
    }

    function generateNewFrame() {
        let newBoids = boids;

        newBoids = boids.map(boid => {
            return boid.setNewRotation(boids);
        });

        newBoids = newBoids.map(boid => {
            return boid.setNewSpeed(newBoids);
        });

        newBoids = newBoids.map(boid => {
            return boid.setNewPosition();
        });

        setBoids(newBoids);
    }

    // Update boids with new parameters, preserving the existing position and velocity
    function updateBoidsPreservePositionVelocity() {
        setBoids(boids.map(boid => {
            return new Boid(
                boid.position,
                boid.velocity,
                {
                    baseAttraction,
                    baseRepulsion,
                    baseInfluence,
                    baseMaxSpeed,
                    baseTurnRadius,
                    baseViewDistance,
                    variance
                }
            );
        }));
    }

    // Get a random position within the simulation window
    function getRandomPosition() {
        const simulationWindow = simulationRef.current;
        const maxX = simulationWindow?.clientWidth || 248; // fallback width
        const maxY = simulationWindow?.clientHeight || 210; // fallback height

        const minSpacing = 20;
        const maxAttempts = 100;
        let attempt = 0;
        
        let genX = Math.floor(Math.random() * maxX);
        let genY = Math.floor(Math.random() * maxY);

        // While the position is too close to an existing boid, generate a new position
        while (
            attempt < maxAttempts &&
            boids.some(boid => {
                return (
                    minSpacing > Math.sqrt(
                        Math.pow(boid.position.x - genX, 2) + 
                        Math.pow(boid.position.y - genY, 2)
                    )
                )
            })
        ) {
            genX = Math.floor(Math.random() * maxX);
            genY = Math.floor(Math.random() * maxY);
            attempt++;
        }

        return {
            x: genX,
            y: genY
        }
    }

    // Get a random velocity
    function getRandomVelocity(maxSpeed: number) {
        return {
            deg: Math.random() * 360,
            speed: Math.random() * maxSpeed
        }
    }

    return (
        <ToolCard title="Boids">
            <div id="boidsContainer">
                <button onClick={generateNewFrame}>+1 Frame</button>
                <div id="boidsSimulation" ref={simulationRef}>
                    {boids.map((boid, index) => (
                        <div key={index} className="boid" style={{
                            left: boid.position.x - 5 + 'px',
                            top: boid.position.y - 5 +'px',
                            transform: `rotate(${boid.velocity.deg}deg)`
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