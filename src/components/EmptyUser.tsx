import { Clock, LogIn, Home, ShieldAlert, Timer, Lock } from 'lucide-react';

export default function EmptyUser() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-indigo-100">
        {/* Верхний акцент */}
        <div className="h-2 bg-gradient-to-r from-indigo-400 to-indigo-600"></div>
        
        <div className="p-8">
          {/* Иконка с эффектом */}
          <div className="relative flex justify-center mb-8">
            {/* Фоновое свечение */}
            <div className="absolute inset-0 bg-indigo-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            
            {/* Основная иконка */}
            <div className="relative bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full p-6 shadow-xl">
              <div className="relative">
                <ShieldAlert className="w-20 h-20 text-indigo-600" strokeWidth={1.5} />
                <div className="absolute -top-2 -right-2">
                  <span className="flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-indigo-500"></span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Заголовок */}
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent mb-2">
            Сессия истекла
          </h2>

          {/* Описание */}
          <p className="text-indigo-600 text-center mb-1 font-medium">
            Ваша сессия безопасности истекла
          </p>
          <p className="text-indigo-400 text-sm text-center mb-6">
            Пожалуйста, войдите снова чтобы продолжить работу
          </p>

          {/* Информационный блок */}
          <div className="bg-indigo-50 rounded-xl p-4 mb-8 border border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-2 shadow-sm">
                <Lock className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-900">Безопасность данных</p>
                <p className="text-xs text-indigo-600">Автоматическое завершение сессии</p>
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '/login'}
              className="group w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-[1.02]"
            >
              <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Войти снова
            </button>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="group w-full bg-white hover:bg-indigo-50 text-indigo-700 font-semibold py-4 px-4 rounded-xl transition-all duration-300 border-2 border-indigo-200 hover:border-indigo-300 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Вернуться на главную
            </button>
          </div>

          {/* Дополнительная информация */}
          <div className="flex items-center justify-center gap-3 mt-8 text-xs">
            <div className="flex items-center gap-1 text-indigo-400">
              <Clock className="w-4 h-4" />
              <span>15 мин бездействия</span>
            </div>
            <span className="text-indigo-200">•</span>
            <div className="flex items-center gap-1 text-indigo-400">
              <Lock className="w-4 h-4" />
              <span>Защищено</span>
            </div>
          </div>

          {/* Декоративные элементы */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
        </div>
      </div>
      
      {/* Фоновые декоративные элементы */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
    </div>
  );
}