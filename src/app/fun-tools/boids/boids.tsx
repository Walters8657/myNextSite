import { useEffect, useState, useRef } from "react";
import ToolCard from "../../ui/toolCard/toolCard";
import './boids.scss';

class Boid {
    position: {
        x: number;
        y: number
    };
    heading: number;    

    constructor(position: {x: number, y: number}, heading: number) {
        this.position = position;
        this.heading = heading;
    }

    // Returns boids that are within a 240* arc and 50px radius
    getNearbyBoids(boids: Boid[]) {
        return boids.filter(boid => {
            // Skip self
            if (boid === this) return false;
            
            const distance = this.getDistance(this, boid);
            if (distance > 50) return false; // Too far away
            
            // Calculate angle to the boid relative to current heading
            const dx = boid.position.x - this.position.x;
            const dy = boid.position.y - this.position.y;
            const angleToBoid = Math.atan2(dy, dx) * (180 / Math.PI);
            
            // Calculate the angle difference from current heading
            let angleDiff = angleToBoid - this.heading;
            
            // Normalize angle difference to [-180, 180] range
            while (angleDiff > 180) angleDiff -= 360;
            while (angleDiff < -180) angleDiff += 360;
            
            // Check if boid is within the 240-degree vision cone
            return Math.abs(angleDiff) <= 120; // 240/2 = 120 degrees on each side
        });
    }

    setNewRotation(boids: Boid[]) {
        const nearbyBoids = this.getNearbyBoids(boids);
        let separationX = 0, separationY = 0;
        let alignmentX = 0, alignmentY = 0;
        let cohesionX = 0, cohesionY = 0;

        if (nearbyBoids.length > 0) {
            nearbyBoids.forEach(boid => {
                // Separation: avoid collision with nearby boids
                const distance = this.getDistance(this, boid);
                if (distance < 25) {
                    // Much stronger separation force, especially when very close
                    const separationForce = Math.max(0, (25 - distance) / 25); 
                    separationX += (this.position.x - boid.position.x) * separationForce;
                    separationY += (this.position.y - boid.position.y) * separationForce;
                }

                // Alignment: match velocity of nearby boids
                const boidRadians = boid.heading * (Math.PI / 180);
                alignmentX += Math.cos(boidRadians);
                alignmentY += Math.sin(boidRadians);

                // Cohesion: move toward center of nearby boids
                cohesionX += boid.position.x;
                cohesionY += boid.position.y;
            });

            // Normalize alignment and cohesion
            alignmentX /= nearbyBoids.length;
            alignmentY /= nearbyBoids.length;
            cohesionX /= nearbyBoids.length;
            cohesionY /= nearbyBoids.length;

            // Calculate desired direction by combining all forces
            const desiredX = separationX * 3.0 + alignmentX * 0.8 + (cohesionX - this.position.x) * 0.3;
            const desiredY = separationY * 3.0 + alignmentY * 0.8 + (cohesionY - this.position.y) * 0.3;

            // Calculate desired angle
            let desiredAngle = Math.atan2(desiredY, desiredX);
            
            // Convert current heading to radians for comparison
            const currentRadians = this.heading * (Math.PI / 180);
            
            // Calculate the shortest angular difference
            let angleDiff = desiredAngle - currentRadians;
            
            // Normalize to [-π, π] range
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            // Apply turn radius limitation
            const maxTurn = 2.5 * (Math.PI / 180);
            if (Math.abs(angleDiff) > maxTurn) {
                // Apply the maximum turn in the correct direction
                desiredAngle = currentRadians + (angleDiff > 0 ? maxTurn : -maxTurn);
            }

            this.heading = desiredAngle * (180 / Math.PI);
        }

        return this;
    }

    setNewPosition() {
        let speed = 1;
        let newX = this.position.x + Math.cos(this.heading * (Math.PI / 180)) * speed;
        let newY = this.position.y + Math.sin(this.heading * (Math.PI / 180)) * speed;

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

    getDistance(boid1: Boid, boid2: Boid) {
        return Math.sqrt(
            Math.pow(boid1.position.x - boid2.position.x, 2) + 
            Math.pow(boid1.position.y - boid2.position.y, 2)
        )
    }
} 

export default function Boids() {
    const [numBoids, setNumBoids] = useState<number>(25);
    const [isPaused, setIsPaused] = useState<boolean>(true);

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

    // On pause or resume change
    useEffect(() => {
        if (!isPaused) {
            const interval = setInterval(() => {
                generateNewFrame();
            }, 1000 / 60);
            return () => clearInterval(interval);
        }
    }, [isPaused]);

    // Create new boids
    function createNewBoids() {
        const newBoids = Array.from({ length: numBoids }, () => {
            const position = getRandomPosition();
            const heading = getRandomVelocity();
            return new Boid(position, heading);
        });

        setBoids(newBoids);
    }

    // Generate a new frame of the simulation
    function generateNewFrame() {
        let newBoids = boids;

        newBoids = boids.map(boid => {
            return boid.setNewRotation(newBoids);
        });

        newBoids = newBoids.map(boid => {
            return boid.setNewPosition();
        });

        setBoids(newBoids);
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
    function getRandomVelocity() {
        return Math.random() * 360
    }

    // Pause or resume the simulation
    function pauseResume() {
        setIsPaused(!isPaused);
    }

    return (
        <ToolCard title="Boids">
            <div id="boidsContainer">
                <button id="pauseBtn" onClick={pauseResume}>{isPaused ? 'Play' : 'Pause'}</button>
                <div id="boidsSimulation" ref={simulationRef}>
                    {boids.map((boid, index) => (
                        <div key={index} className="boid" style={{
                            left: boid.position.x - 5 + 'px',
                            top: boid.position.y - 5 +'px',
                            transform: `rotate(${boid.heading}deg)`
                        }}></div>
                    ))}
                </div>
                <span className="boidsInput">
                    <label htmlFor="numBoids">Number of Boids</label>
                    <input type="number" id="numBoids" value={numBoids} min={1} max={100} step={1} onChange={(e) => setNumBoids(parseInt(e.target.value))} />
                </span>
            </div>
        </ToolCard>
    );
}