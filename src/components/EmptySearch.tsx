'use client';

import { SearchX } from "lucide-react"

interface EmptySearchProps{
    message?: string;
    helpMessage?: string;
}


export default function EmptySearch({
    message = 'По вашему запросу ничего не найдено',
    helpMessage = 'Попробуйте изменить параметры запроса'
}: EmptySearchProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] px-4 py-12">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-60 animate-pulse" />
                <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-full">
                    <SearchX className="w-12 h-12 text-blue-400" />
                </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                {message}
            </h3>
            
            <p className="text-sm text-gray-500 text-center max-w-sm">
                {helpMessage}
            </p>
        </div>
    )
}