'use client'

interface ButtonProps {
    children: React.ReactNode;
    color?: 'indigo' | 'red';
    size?: 'third' | 'half' | 'full';
    position?: 'start' | 'center' | 'end';
}

export default function Button({
    children,
    color = 'indigo',
    size = 'third',
    position = 'end'
} : ButtonProps) {
    const colorThemes = {
        indigo: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
        red: 'bg-red-500'
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

    return <button className={`${colorThemes[color]} ${sizes[size]} ${positions[position]} border border-transparent py-2 rounded-lg`}>{children}</button>
}