import React, { useState } from 'react';
import { Upload, Play, Database, CheckCircle, UserCircle, Users, Calendar, Clock, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

interface HostInputViewProps {
  onAnalyze: (hostsData: string, participantsData: string) => void;
  isLoading: boolean;
  isDarkMode: boolean;
  onBack: () => void;
}

const DEMO_HOST = `Host 1: Luiza Trajano, Magalu, Varejo e E-commerce
Host 2: Caito Maia, Chilli Beans, Ótica, Franquias e Moda`;

const DEMO_PARTICIPANTS = `1. João Silva, Construtora Silva, Construção Civil
2. Maria Souza, Souza Transportes, Logística
3. Carlos Pereira, TechDev Solutions, Desenvolvimento de Software
4. Ana Oliveira, Oliveira Doces Finos, Confeitaria e Buffet
5. Pedro Santos, Santos Engenharia, Engenharia Civil
6. Lucia Costa, Costa Contabilidade, Contabilidade
7. Marcos Lima, Lima Shop, E-commerce de Eletrônicos
8. Fernanda Rocha, Rocha & Associados, Jurídico Trabalhista
9. Roberto Almeida, Almeida Seguros, Corretora de Seguros
10. Juliana Dias, Finanças 360, Consultoria Financeira
11. Eduardo Mello, Mello Ads, Gestão de Tráfego Pago
12. Sofia Nunes, Nunes Odonto, Clínica Odontológica
13. Rafael Torres, Torres Fitness, Academia
14. Beatriz Gomes, Studio Bea, Arquitetura e Interiores
15. Lucas Martins, Martins Log, Logística e Transporte
16. Gabriela Ferreira, Gabi Modas, Varejo de Moda Feminina
17. Felipe Barbosa, Barbosa Tech, Suporte de TI
18. Renata Carvalho, Carvalho Eventos, Cerimonialista
19. Thiago Rodrigues, Rodrigues Solar, Energia Solar
20. Camila Alves, NutriVida, Nutrição Clínica
21. Bruno Cardoso, Cardoso Automação, Automação Residencial
22. Vanessa Lima, Estética Vanessa, Clínica de Estética`;

const HostInputView: React.FC<HostInputViewProps> = ({ onAnalyze, isLoading, isDarkMode, onBack }) => {
  const [hostsText, setHostsText] = useState('');
  const [participantsText, setParticipantsText] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');

  const handleDemo = () => {
    setEventName('Masterclass de Varejo & Franquias');
    setEventDate('2025-10-25');
    setEventTime('19:00');
    setHostsText(DEMO_HOST);
    setParticipantsText(DEMO_PARTICIPANTS);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.name.split('.').pop()?.toLowerCase();

      if (fileType === 'xlsx' || fileType === 'xls') {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const csvText = XLSX.utils.sheet_to_csv(worksheet);
          setParticipantsText(csvText);
        };
        reader.readAsArrayBuffer(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setParticipantsText(text);
        };
        reader.readAsText(file);
      }
    }
  };

  const handleAnalyzeClick = () => {
    // Combine context into the host data string for the AI
    const contextHeader = `CONTEXTO DA AGENDA:
Evento: ${eventName || 'N/A'}
Data: ${eventDate || 'N/A'}
Horário: ${eventTime || 'N/A'}
--------------------------------`;
    
    const finalHostsData = `${contextHeader}\n\n${hostsText}`;
    onAnalyze(finalHostsData, participantsText);
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in px-2 md:px-0">
      <div className="mb-4 md:mb-6">
        <button 
          onClick={onBack}
          className={`text-sm font-medium hover:underline flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
        >
          &larr; Voltar para seleção
        </button>
      </div>

      <div className={`rounded-2xl shadow-xl overflow-hidden border-2 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-900 border-blue-400/30 shadow-[0_0_25px_rgba(96,165,250,0.1)]' 
          : 'bg-white border-gray-300 shadow-[0_0_30px_rgba(59,130,246,0.1)]'
      }`}>
        {/* Header Area - Blue Tones for Host Mode */}
        <div className={`p-6 md:p-8 text-center ${
           isDarkMode 
             ? 'bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900' 
             : 'bg-gradient-to-br from-blue-800 via-indigo-700 to-blue-900'
        }`}>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight text-white">Análise de Host</h1>
          <p className="text-blue-100/90 text-sm md:text-base font-medium">Descubra as melhores oportunidades para você ou sua empresa</p>
        </div>

        <div className="p-5 md:p-8 space-y-6 md:space-y-8">
          <div className="flex justify-end">
             <button 
                onClick={handleDemo}
                className={`text-xs font-medium flex items-center transition-colors px-3 py-1 rounded-full ${isDarkMode ? 'bg-gray-800 text-blue-300 hover:bg-gray-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
              >
                <Database className="w-3 h-3 mr-1.5" />
                Carregar Exemplo (Luiza Trajano & Caito Maia)
              </button>
          </div>

          {/* Agenda Details Section */}
          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
             <h3 className={`text-sm font-bold uppercase mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <FileText className="w-4 h-4" /> Detalhes da Agenda
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                   <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nome da Agenda / Evento</label>
                   <input 
                      type="text" 
                      placeholder="Ex: Jantar de Negócios"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                         isDarkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                   />
                </div>
                <div>
                   <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Data</label>
                   <div className="relative">
                      <Calendar className={`absolute left-3 top-2.5 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input 
                         type="date" 
                         value={eventDate}
                         onChange={(e) => setEventDate(e.target.value)}
                         className={`w-full pl-10 pr-3 py-2 rounded-lg text-sm border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                            isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                         }`}
                      />
                   </div>
                </div>
                <div>
                   <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Horário</label>
                   <div className="relative">
                      <Clock className={`absolute left-3 top-2.5 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input 
                         type="time" 
                         value={eventTime}
                         onChange={(e) => setEventTime(e.target.value)}
                         className={`w-full pl-10 pr-3 py-2 rounded-lg text-sm border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                            isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                         }`}
                      />
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Input 1: Hosts */}
            <div className="space-y-3">
               <div className="flex items-center gap-2">
                 <UserCircle className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`} />
                 <label className={`block text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                   Dados do(s) Host(s)
                 </label>
               </div>
               <div className={`relative rounded-xl border-2 transition-all h-full ${
                   isDarkMode 
                      ? 'bg-gray-800 border-gray-700 focus-within:border-blue-400/50' 
                      : 'bg-white border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20'
                }`}>
                  <textarea
                    className={`w-full h-40 md:h-64 p-4 md:p-5 bg-transparent border-none focus:ring-0 text-sm font-mono leading-relaxed resize-none ${
                      isDarkMode ? 'text-gray-200 placeholder-gray-600' : 'text-gray-800 placeholder-gray-400'
                    }`}
                    placeholder={`Insira aqui os dados do anfitrião.\n\nExemplo:\nRoberto, Minha Empresa, Consultoria`}
                    value={hostsText}
                    onChange={(e) => setHostsText(e.target.value)}
                  />
               </div>
            </div>

            {/* Input 2: Participants */}
            <div className="space-y-3">
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <Users className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`} />
                   <label className={`block text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                     Lista de Convidados
                   </label>
                 </div>
                 <div className="relative overflow-hidden">
                    <input 
                      type="file" 
                      accept=".csv,.txt,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    <button className={`text-xs flex items-center hover:underline ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                      <Upload className="w-3 h-3 mr-1" /> Importar
                    </button>
                 </div>
               </div>
               
               <div className={`relative rounded-xl border-2 transition-all h-full ${
                   isDarkMode 
                      ? 'bg-gray-800 border-gray-700 focus-within:border-blue-400/50' 
                      : 'bg-white border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20'
                }`}>
                  <textarea
                    className={`w-full h-40 md:h-64 p-4 md:p-5 bg-transparent border-none focus:ring-0 text-sm font-mono leading-relaxed resize-none ${
                      isDarkMode ? 'text-gray-200 placeholder-gray-600' : 'text-gray-800 placeholder-gray-400'
                    }`}
                    placeholder={`Cole a lista de empresários...\n\nExemplo:\nNome, Empresa, Segmento`}
                    value={participantsText}
                    onChange={(e) => setParticipantsText(e.target.value)}
                  />
                  {participantsText && (
                    <div className={`absolute bottom-3 right-3 text-[10px] md:text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-500 shadow-sm border border-gray-200'}`}>
                      {participantsText.split('\n').filter(l => l.trim()).length} linhas
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAnalyzeClick}
            disabled={!hostsText.trim() || !participantsText.trim() || isLoading}
            className={`w-full py-3.5 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-xl flex items-center justify-center transition-all transform hover:scale-[1.01] active:scale-[0.99] ${
              !hostsText.trim() || !participantsText.trim() || isLoading
                ? isDarkMode ? 'bg-gray-800 text-gray-600 cursor-not-allowed shadow-none' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200'
                : isDarkMode 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:to-indigo-400 shadow-blue-500/20' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30'
            }`}
          >
            {isLoading ? (
              <>
                <div className={`animate-spin rounded-full h-5 w-5 border-b-2 mr-3 ${isDarkMode ? 'border-white' : 'border-white'}`}></div>
                Processando Análise...
              </>
            ) : (
              <>
                <Play className={`w-5 h-5 mr-2 fill-current`} />
                Gerar Índice de Negócios do Host
              </>
            )}
          </button>
        </div>
        
        {/* Footer info */}
        <div className={`px-4 md:px-8 py-4 text-center border-t ${isDarkMode ? 'bg-chumbo-950 border-gray-800 text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] md:text-xs font-medium">
             <div className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Foco no Host</div>
             <span className="hidden sm:inline mx-1">•</span>
             <div className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Oportunidades Diretas</div>
             <span className="hidden sm:inline mx-1">•</span>
             <div className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Priorização Estratégica</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostInputView;