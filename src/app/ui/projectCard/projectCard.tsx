'use client';

import './projectCard.scss'

export default function ProjectCard(props: {title: string, image: string, imageAlt: string, text: string, cardClass: string}) {   

    return (
        <div className={"projectCard " + props.cardClass}>
            <h2>{props.title}</h2>
            <img src={props.image} alt={props.imageAlt} />
            <p>{props.text}</p>
        </div>
    )
}