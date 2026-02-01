"use client"

import { useCallback, useState } from "react";

import ToolCard from "@/app/ui/toolCard/toolCard";

import "./shortLinks.scss"
import { shortLinkDto } from "@/interfaces";

export default function shortLinks() {
    const [longLink, setLongLink] = useState<string | null>();
    const [newShortLink, setNewShortLink] = useState<string | null>();

    /** Updates long link text input */
    const handleLongLinkInput = useCallback((newLongLink: string): void => {
        setLongLink(newLongLink);
    }, [])

    /** Tries to get a unique slug and insert it. If no unique slug is generated, then it will return an error message in place of a short link. */
    const handleGenerateLink = useCallback(async (): Promise<void> => {
        let host = window.location.host;
        let newLinkSlug = await getUniqueSlug(5);
        let validUrl = await isUrlFetchable(longLink ?? '');
        
        if (!validUrl) {
            setNewShortLink("Invalid URL: https://www.example.com");
        } else if (newLinkSlug) {
            const data: shortLinkDto = {
                    slug: newLinkSlug,
                    longLink: longLink!
                };

            const result = await fetch("/api/shortLink", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            });

            setNewShortLink(host.concat("/ls/", newLinkSlug));
        } else {
            setNewShortLink("Error generating short link.");
        }
    }, [longLink, newShortLink]);

    /**
     * @param url - URL string to test
     * @returns true if url is fetchable, false if there are any errors
     */
    async function isUrlFetchable(url: string): Promise<boolean> {
        try {
            const response = await fetch(url, { method: 'HEAD', mode: 'no-cors'});

            console.log(response);

            return (response.ok || response.redirected || response.type == "opaque");
        } catch (e: any) {
            return false;
        }

    }

    /**
     * @returns Random 6 character alpha-numeric string
     */
    function generateLinkSlug(): string {
        let randomString = "";

        for(let i = 0; i < 6; i++) {
            let rand36 = randBase36();
            randomString = randomString.concat(rand36);
        }

        return randomString;
    } 

    /**
     * @param maxAttempts Maximum number of times to try and get a slug
     * @returns 6 character alpha-numeric string if unique string found, otherwise null
     */
    async function getUniqueSlug(maxAttempts: number): Promise<string | null> {
        let newLinkSlug = generateLinkSlug();
        let attempts = 0;

        while (attempts < maxAttempts && await isDuplicateSlug(newLinkSlug)) {
            newLinkSlug = generateLinkSlug();
            attempts++;
        }

        if (attempts == maxAttempts && await isDuplicateSlug(newLinkSlug)) {
            return null;
        }

        return newLinkSlug;
    }

    /**
     * @returns random base 36 number as a string
     */
    function randBase36(): string {
        let randomNum = Math.floor(Math.random() * 36);
        return randomNum.toString(36);
    }

    /**
     * @param slug - Slug to pull data for
     * @returns - True if short link has corresponding long link, otherwise returns false
     */
    async function isDuplicateSlug(slug: string) {
        const response = await fetch("api/shortLink/" + slug);

        let shortLinkPair : shortLinkDto = (await response.json()).shortLinks;

        return shortLinkPair.longLink ? true : false;
    }

    return (
        <ToolCard title="Short Links">
            <input 
                type="text" 
                id="longLink" 
                placeholder="https://www.example.com" 
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