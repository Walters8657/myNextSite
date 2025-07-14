import "./navbar.scss"

export default function Navbar() {
    return (
        <header id="indexHeader">
            <span>
                <img id="headerLogoImg" src="/me.png" alt="Personal Logo" />
                <h1>Michael Walters</h1>
                <p>Web Developer & Software Engineer</p>
            </span>
            <nav>
                <ul>
                    <li id="homeLink" className="cursorHover"><a href="/">Home</a></li>
                    <li> | </li>           
                    <li id="resumeLink" className="cursorHover"><a href="/resume">Resume</a></li>
                    <li> | </li>
                    <li id="funToolsLink" className="cursorHover"><a href="fun-tools">Fun Tools</a></li>
                </ul>
            </nav>
        </header>
    )
}