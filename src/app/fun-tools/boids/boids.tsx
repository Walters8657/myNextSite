import { useEffect, useState, useRef } from "react";
import ToolCard from "../../ui/toolCard/toolCard";
import './boids.scss';



export default function Boids() {
    const [isPaused, setIsPaused] = useState<boolean>(true);
    const [numBoids, setNumBoids] = useState<number>(25);
    const [separationMultiplier, setSeparationMultiplier] = useState<number>(2.0);
    const [alignmentMultiplier, setAlignmentMultiplier] = useState<number>(3.0);
    const [cohesionMultiplier, setCohesionMultiplier] = useState<number>(1.0);
    const [turnRadiusMultiplier, setTurnRadiusMultiplier] = useState<number>(2.5);

    const [boids, setBoids] = useState<Boid[]>([]);

    const simulationRef = useRef<HTMLDivElement>(null);

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
    
                // Check if the boid is within a 240* arc
                return Math.abs(Math.atan2(dy, dx) * (180 / Math.PI) - this.heading) <= 120;
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
                    if (distance < 20) {
                        // Much stronger separation force, especially when very close
                        const separationForce = Math.max(0, (20 - distance) / 20); 
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
                const desiredX = separationX * separationMultiplier + alignmentX * alignmentMultiplier + (cohesionX - this.position.x) * cohesionMultiplier;
                const desiredY = separationY * separationMultiplier + alignmentY * alignmentMultiplier + (cohesionY - this.position.y) * cohesionMultiplier;
    
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
                const maxTurn = turnRadiusMultiplier * (Math.PI / 180);
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
            const simWidth = 248; // fallback width
            const simHeight = 210; // fallback height
            
            // Calculate the shortest distance considering wrapping
            let dx = Math.abs(boid1.position.x - boid2.position.x);
            let dy = Math.abs(boid1.position.y - boid2.position.y);
            
            // If the distance is more than half the canvas width/height, 
            // the shorter path is through wrapping
            if (dx > simWidth / 2) {
                dx = simWidth - dx;
            }
    
            if (dy > simHeight / 2) {
                dy = simHeight - dy;
            }
            
            return Math.sqrt(dx * dx + dy * dy);
        }
    } 

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
                <span className="boidsInput">
                    <label htmlFor="separationMultiplier">Separation Multiplier</label>
                    <input type="number" id="separationMultiplier" value={separationMultiplier} min={0} max={10} step={0.1} onChange={(e) => setSeparationMultiplier(parseFloat(e.target.value))} />
                </span>
                <span className="boidsInput">
                    <label htmlFor="alignmentMultiplier">Alignment Multiplier</label>
                    <input type="number" id="alignmentMultiplier" value={alignmentMultiplier} min={0} max={10} step={0.1} onChange={(e) => setAlignmentMultiplier(parseFloat(e.target.value))} />
                </span>
                <span className="boidsInput">
                    <label htmlFor="cohesionMultiplier">Cohesion Multiplier</label>
                    <input type="number" id="cohesionMultiplier" value={cohesionMultiplier} min={0} max={10} step={0.1} onChange={(e) => setCohesionMultiplier(parseFloat(e.target.value))} />
                </span>
                <span className="boidsInput">
                    <label htmlFor="turnRadiusMultiplier">Turn Radius Multiplier</label>
                    <input type="number" id="turnRadiusMultiplier" value={turnRadiusMultiplier} min={0} max={180} step={1} onChange={(e) => setTurnRadiusMultiplier(parseFloat(e.target.value))} />
                </span>
            </div>
        </ToolCard>
    );
}