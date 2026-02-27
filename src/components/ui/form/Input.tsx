'use client';

import { useEffect, useRef, useState } from "react";


// Базовые пропсы для всех полей Textarea и Input
interface BaseInputProps {
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
}

// Пропсы для Input
interface InputFieldProps extends BaseInputProps {
    type: 'text' | 'number';
    multiline?: false;
    rows?: never;
}

// Пропсы для Textarea
interface TextareaFieldProps extends BaseInputProps {
    multiline: true;
    rows?: number;
    type?: never;
}

type FieldProps = InputFieldProps | TextareaFieldProps;


export default function Input({
    type = 'text',
    label,
    value = '',
    onChange,
    className = '',
    disabled = false,
    required = false,
    name,
    multiline = false,
    rows = 4
}: FieldProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {setInputValue(value)}, [value]);

    const handleFocus = () => {setIsFocused(true)};

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setIsFocused(false);
        if (onChange) {
            onChange(e);
        }
    };

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
        if (onChange) {
            onChange(e);
        }
    };

    const handleLabelClick = () => {inputRef.current?.focus()};
    const isActive = isFocused || inputValue.length > 0;

    // Общие классы для поля ввода
    const fieldClasses = `
        w-full px-4 py-3 
        border-2 rounded-lg 
        outline-none transition-all duration-300
        border-gray-200 focus:border-indigo-500
        ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
        text-gray-900
        focus:shadow-lg
        resize-none
    `;

    return (
        <div className={`relative w-full ${className}`}>
            {/* Контейнер для инпута */}
            <div className="relative">
                {multiline ? (
                    <textarea
                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                        value={inputValue}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        disabled={disabled}
                        required={required}
                        name={name}
                        rows={rows}
                        className={fieldClasses}
                    />
                ) : (
                    <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type={type}
                        value={inputValue}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        disabled={disabled}
                        required={required}
                        name={name}
                        className={fieldClasses}
                    />
                )}
                {/* Плавающая подсказка (лейбл) */}
                <label
                    onClick={handleLabelClick}
                    className={`
                        absolute left-3 transition-all duration-200 
                        pointer-events-none cursor-text
                        ${isActive 
                            ? '-top-2.5 text-xs bg-white px-1' 
                            : 'top-3 text-gray-500'
                        }
                        text-gray-700
                        ${disabled ? 'bg-gray-100' : 'bg-white'}
                        rounded
                    `}
                    style={{
                        transform: isActive ? 'translateY(0)' : 'translateY(0)',
                    }}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            </div>
        </div>
    )
}