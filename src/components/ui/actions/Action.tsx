interface ActionProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}


export default function Action({
  children,
  onClick,
  className = ''
} : ActionProps){
  return (
    <div className={`${className} p-2 cursor-pointer duration-300 hover:bg-gray-300/20 rounded-md text-sm text-gray-700 flex items-center`} onClick={onClick}>
      {children}
    </div>
  )
}