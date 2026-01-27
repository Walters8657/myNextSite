"use client"

import { useCallback, useState } from "react";

import ToolCard from "@/app/ui/toolCard/toolCard";

import "./shortLinks.scss"

export default function shortLinks() {
    const [longLink, setLongLink] = useState<string | null>();
    const [newShortLink, setNewShortLink] = useState<string | null>();

    const handleLongLinkInput = useCallback((newLongLink: string): void => {
        setLongLink(newLongLink);
    }, [])

    const handleGenerateLink = useCallback(async (): Promise<void> => {
        let newLinkSlug = generateLinkSlug();
        let host = window.location.host;
        
        const result = await fetch("/api/shortLink", {
            method: "POST",
            body: JSON.stringify({
                slug: newLinkSlug,
                longLink: longLink
            }),
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            }
        });

        setNewShortLink(host.concat("/ls/", newLinkSlug));

    }, [longLink, newShortLink]);

    function generateLinkSlug(): string {
        let randomString = "";

        for(let i = 0; i < 6; i++) {
            let rand36 = randBase36();
            randomString = randomString.concat(rand36);
        }

        return randomString;
    } 

    function randBase36(): string {
        let randomNum = Math.floor(Math.random() * 36);
        return randomNum.toString(36);
    }

    function checkDuplicate(testString: string) {
        return '';
    }

    return (
        <ToolCard title="Short Links">
            <input 
                type="text" 
                id="longLink" 
                placeholder="Long Link" 
                onChange={e => handleLongLinkInput(e.target.value)} 
                value={longLink ?? ''}
            />
            <button 
                id="generateLinkSlug" 
                className="centerButton" 
                onClick={handleGenerateLink}
            >
                Generate Link
            </button>
            <input 
                type="text" 
                id="shortLink" 
                placeholder="mwdev.work/ls/shortLink" 
                value={newShortLink ?? ''} 
                readOnly
            />
        </ToolCard>
    )
}