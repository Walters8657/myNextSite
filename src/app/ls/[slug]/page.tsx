"use client";

import { useEffect, useState } from "react"

export default function Page(){
  const [url, setUrl] = useState<String | null>(null);

  useEffect (() => {
    setUrl(window.location.href ?? '');
  }, [window.location.href]);

  return <div>The short link '{url}' is not a valid short link.</div>
}