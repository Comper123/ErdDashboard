interface SwitchProps {
  label: string;
  value?: boolean;
  onChange?: (checked: boolean) => void;
  required?: boolean;
  name?: string;
}

export default function Switch({
  value,
  label,
  onChange,
  required,
  name
} : SwitchProps) {
  return (
    <div className={`flex items-center gap-3`}>
        <button
            type="button"
            onClick={() => onChange?.(!value)}
            className={`
                relative inline-flex items-center rounded-full
                transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-300
                w-10 h-5
                ${value ? 'bg-indigo-600' : 'bg-gray-300'}
                cursor-pointer hover:bg-indigo-500
            `}
        >
            <span
                className={`
                    inline-block transform rounded-full bg-white shadow
                    transition-transform duration-300 ease-in-out
                    w-4 h-4
                    ${value ? 'translate-x-4' : 'translate-x-1'}
                `}
            />
        </button>
        <span className={`text-sm font-medium text-gray-700`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </span>
    </div>
);
}