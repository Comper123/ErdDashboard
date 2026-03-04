'use client'

interface ButtonProps {
    children: React.ReactNode;
    color?: 'indigo' | 'red' | 'gray' | 'outline';
    size?: 'third' | 'half' | 'full';
    type?: 'button' | 'submit'
    position?: 'start' | 'center' | 'end';
    onClick?: () => void;
    icon?: React.ReactNode 
}

export default function Button({
    children,
    color = 'indigo',
    size = 'third',
    position = 'end',
    type = 'submit',
    onClick = () => {},
    icon
} : ButtonProps) {
    const colorThemes = {
        indigo: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
        red: 'bg-red-400 text-white hover:bg-red-500 focus:ring-ref-500 font-semibold',
        gray: 'bg-gray-200 hover:bg-gray-300',
        outline: 'border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white'
    }

    const sizes = {
        full: 'w-full',
        half: 'w-1/2',
        third: 'w-1/3'
    }

    const positions = {
        start: 'mr-auto',
        center: 'mx-auto',
        end: 'ml-auto'
    }

    return <button className={`${colorThemes[color]} ${sizes[size]} ${positions[position]} border duration-300 border-transparent py-2 rounded-lg`}
        onClick={onClick} type={type}>
            {icon && (
                icon
            )}
            {children}</button>
}