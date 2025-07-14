import "./toolCard.scss"

interface ToolCardProps {
    children: React.ReactNode
}

const toolCard: React.FC<ToolCardProps> = ({children}) => {
    return (<div id="toolCard">
        {children}
    </div>)
}

export default toolCard;