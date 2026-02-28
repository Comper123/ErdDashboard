interface ActionProps {
    children: React.ReactNode;
    onClick: () => void;
}


export default function Action({
    children,
    onClick
} : ActionProps){

    return (
        <div className="" onClick={onClick}>
            {children}
        </div>
    )
}