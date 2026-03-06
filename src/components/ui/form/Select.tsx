import { useEffect, useRef, useState } from "react";

interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }> | string[];
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  placeholder?: string;
  inputSize?: 'base' | 'small';
}

export default function Select({
  label,
  value = '',
  onChange,
  options = [],
  className = '',
  disabled = false,
  required = false,
  name,
  placeholder = 'Не выбран',
  inputSize = 'base'

} : SelectProps){
  const [isFocused, setIsFocused] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  const handleLabelClick = () => {
    selectRef.current?.focus();
  };

  const selectSizes = {
    small: 'py-2 text-sm',
    base: 'py-3 text-base'
  };

  // Нормализуем options в единый формат
  const normalizedOptions = options.map(option => {
    if (typeof option === 'string') {
      return { value: option, label: option };
    }
    return option;
  });

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <select
          ref={selectRef}
          value={selectedValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          name={name}
          className={`
              w-full ${selectSizes[inputSize]} pl-3 pr-10
              border-2 rounded-lg appearance-none
              outline-none transition-all duration-300
              ${isFocused ? 'border-indigo-500' : 'border-gray-200'}
              ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white cursor-pointer'}
              text-gray-900
              focus:border-indigo-500 focus:shadow-lg
          `}
      >
          <option value="">{placeholder}</option>
          {normalizedOptions.map((option) => (
              <option key={option.value} value={option.value}>
                  {option.label}
              </option>
          ))}
        </select>

        {/* Кастомная стрелка */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg 
                className={`w-4 h-4 transition-colors ${disabled ? 'text-gray-300' : 'text-gray-400'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>

        {/* Плавающий лейбл */}
        <label
            onClick={handleLabelClick}
            className={`
                absolute left-3 transition-all duration-200 
                pointer-events-none cursor-text
                ${selectedValue
                    ? '-top-2.5 text-xs bg-white px-1' 
                    : ` text-gray-500 ${inputSize === 'base' ? 'text-base top-3' : 'text-sm top-2'}`
                }
                text-gray-700
                ${disabled ? 'bg-gray-100' : 'bg-white'}
                rounded
            `}
        >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
  </div>
  )
}