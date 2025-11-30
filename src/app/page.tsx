'use client';

import "./page.scss";
import { useEffect, useState, useCallback } from "react";
import ProjectCard from "./ui/projectCard/projectCard";
import { cardClass } from "./enums";

interface Project {
  title: string;
  image: string;
  imageAlt: string;
  text: string;
}

const projects: Project[] = [
  {
    title: "Cloud Music Suite",
    image: "./projectScreenShots/CMS1.png",
    imageAlt: "Cloud Music Suite homepage",
    text: "This platform was born out of my percussion instructors desire to have an online platform for music instruction. Cloud Music Suite's goal is to provide an all in one experience for everything an instructor could need."
  },
  {
    title: "Speedometer",
    image: "./projectScreenShots/Speedometer.png",
    imageAlt: "Speedometer layouts",
    text: "While not as in depth of an application as other projects, this Speedometer also taught me some key items about web development, most importantly, a design first approach."
  }
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handlers wrapped in useCallback for stability
  const nextSlide = useCallback(() => {
    setCurrentIndex((currentIndex + 1) % projects.length);
  }, [currentIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((currentIndex - 1 + projects.length) % projects.length);
  }, [currentIndex]);

  /** 
   * Will determine amount to shift based off of chosen elements width, project container width, and current elements current position 
   */
  function shiftElementsToChosen() {
    // Gets list of all the projectCards
    let projList = document.getElementsByClassName("projectCard");
    // Gets desired element
    let chosenElement = projList[currentIndex] as HTMLElement;
    // Project Container that will be scrolled inside
    let projectContainerWidth = document.getElementById("projects")?.offsetWidth ?? 0;

    // Where we want the left edge of the focused element to be
    let desiredPosition = (projectContainerWidth - (chosenElement.offsetWidth)) / 2;

    // Shifts the offset to the next neighbor
    let transformAmount = desiredPosition - chosenElement.offsetLeft;

    // Set each elements new offset and add and remove scaling as needed
    Array.from(projList).forEach(el => {
      let element = el as HTMLElement;

      let transform = `translateX(${transformAmount}px)` 

      if (element.className.includes("rightCard") || element.className.includes("leftCard")) {
        transform += ` scale(0.75)`
      }

      // Applies the transform
      element.style.transform = transform;
    });
  }

  useEffect(() => {
    shiftElementsToChosen();
    const handleResize = () => shiftElementsToChosen();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex]);

  return (
    <>
      <div id="projects">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.title.replace(" ", "_")}
            title={project.title}
            image={project.image}
            imageAlt={project.imageAlt}
            text={project.text}
            cardClass={
              index < currentIndex ? cardClass.left :
              index === currentIndex ? cardClass.center :
              cardClass.right
            }
          />
        ))}
        <span id="prevNextContainer">
          <button id="prevBtn" onClick={prevSlide} aria-label="Previous Project">
            <img src="/arrow.svg" alt="Left Arrow" />
          </button>
          <button id="nextBtn" onClick={nextSlide} aria-label="Next Project">
            <img src="/arrow.svg" alt="Right Arrow" />
          </button>
        </span>
      </div>
    </>
  );
}