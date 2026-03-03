import { stopPropogation } from "@/lib/utils/propogation";

interface ActionProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  afterClick: () => void;
}


export default function Action({
  children,
  onClick,
  className = '',
  afterClick
} : ActionProps){
  return (
    <div className={`${className} p-2 cursor-pointer duration-300 hover:bg-gray-300/20 rounded-md text-sm text-gray-700 flex items-center`}
      onClick={(e) => {
        stopPropogation(e);
        onClick();
        afterClick();
      }}>
      {children}
    </div>
  )
}