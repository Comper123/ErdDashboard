export interface ToolbarProps {
  children: React.ReactNode;
}


export interface ToolbarGroupProps {
  children: React.ReactNode;
}


export interface ToolbarButtonProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  as?: React.ElementType
}