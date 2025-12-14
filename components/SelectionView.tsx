import React from 'react';
import { Users, UserCircle, ArrowRight } from 'lucide-react';
import { AppMode } from '../types';

interface SelectionViewProps {
  onSelectMode: (mode: AppMode) => void;
  isDarkMode: boolean;
}

const SelectionView: React.FC<SelectionViewProps> = ({ onSelectMode, isDarkMode }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in px-2 md:px-0">
      <div className="text-center mb-8 md:mb-12 mt-4 md:mt-0">
        <h1 className={`text-2xl md:text-4xl font-bold mb-3 md:mb-4 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          O que você deseja analisar hoje?
        </h1>
        <p className={`text-sm md:text-lg px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Selecione o tipo de inteligência de networking que você precisa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Option 1: General Networking */}
        <button
          onClick={() => onSelectMode('GENERAL')}
          className={`group relative p-6 md:p-8 rounded-2xl border-2 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
            isDarkMode
              ? 'bg-gray-900 border-gray-800 hover:border-verde-light/50 hover:bg-gray-800'
              : 'bg-white border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/30'
          }`}
        >
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-4 md:mb-6 transition-colors ${
            isDarkMode ? 'bg-gray-800 text-verde-light group-hover:bg-verde-neon group-hover:text-black' : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
          }`}>
            <Users className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <h3 className={`text-xl md:text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Networking Geral
          </h3>
          <p className={`mb-4 md:mb-6 text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Analise uma lista única de participantes para descobrir sinergias entre todos, formar mesas ideais e medir a temperatura geral do evento.
          </p>
          <div className={`flex items-center text-sm font-bold ${
            isDarkMode ? 'text-verde-light' : 'text-emerald-600'
          }`}>
            Selecionar <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        {/* Option 2: Host Analysis */}
        <button
          onClick={() => onSelectMode('HOST')}
          className={`group relative p-6 md:p-8 rounded-2xl border-2 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
            isDarkMode
              ? 'bg-gray-900 border-gray-800 hover:border-blue-400/50 hover:bg-gray-800'
              : 'bg-white border-gray-200 hover:border-blue-500 hover:bg-blue-50/30'
          }`}
        >
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-4 md:mb-6 transition-colors ${
            isDarkMode ? 'bg-gray-800 text-blue-400 group-hover:bg-blue-400 group-hover:text-black' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
          }`}>
            <UserCircle className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <h3 className={`text-xl md:text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Análise do Host
          </h3>
          <p className={`mb-4 md:mb-6 text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Foque no anfitrião. Insira o perfil do Host (ou Hosts) e uma lista de convidados para descobrir quem são os alvos mais valiosos para o negócio dele.
          </p>
          <div className={`flex items-center text-sm font-bold ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            Selecionar <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default SelectionView;