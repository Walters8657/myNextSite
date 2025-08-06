import type { Metadata } from "next";
import "./globals.scss";

import Navbar from "@/app/ui/navbar/navbar";
import Footer from "./ui/footer/footer";

export const metadata: Metadata = {
  title: "Michael Walters Development",
  description: "Michael Walters Portfolio and Resume",
  keywords: "HTML, CSS, JavaScript, Web Development, Full Stack Development, Software Engineer",
  authors: [{name: "Michael Walters", url: "https://github.com/Walters8657"}],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Michael Walters Development</title>
    
        <link rel="preload" as="style" type="text/css" href="//fonts.googleapis.com/css?family=Ubuntu" />
    
        <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Ubuntu" />
    
        <meta name="theme-color" content="#1b1d1e" />
    
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </head>
      <body>
        <div className="layout-container">
          <Navbar />
          <div id="rootContent">
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
