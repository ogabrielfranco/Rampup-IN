import React, { useState, ChangeEvent } from 'react';
import { Upload, FileText, Play, Database, CheckCircle, Calendar, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';
import { LOGO_URL } from '../App';

interface InputViewProps {
  onAnalyze: (data: string) => void;
  isLoading: boolean;
  isDarkMode: boolean;
  onBack: () => void;
}

const DEMO_DATA = `Evento: Rampup Talks 2026

Nome	EMPRESA	Segmento
Aliriana Frota lima	Frota Cavalcante odontologia	Saude
Andre Souza	Simplifica Gestão	CRM SAAS
ANDRE COSTA MATOS LIMA	Lithos	Saude
Carla Matos	Vsm	Comunicação
Carlos Mororó	Grupo CAMARMO	Recrutamento e Carreira
David Girao	Betania	Indústria
DEILIANE ALMEIDA	UNIMED FORTALEZA	Plano de SAÚDE
Diego Mourão Silva	escandi branding	Empresa Branding
Drayton Jaime	LIDE	Grupo de Acesso a Empresários do Pernambuco
Eduardo Hamdan	Gomes de Matos	Consultoria e Gestão
Eduardo Gomes	Gomes de Matos	Consultoria e Gestão
Fabio Ozorio	FABIO OZORIO ADVOGADOS ASSOCIADOS	Advocacia
Flavia Falcão	Inovar Marketing Olfativo	Marketing Olfativo
Flavio Sobral	Brasterra	Investimento Imobiliario
FRANCISO ALDAIRTON RIBEIRO	ALDAIRTON CARVALHO SOCIEDADE DE ADVGADOS	ADVOCACIA
Graziele Nobre	Grupo Camarmo	Serviços
Helaine Tahim	FORTES TECNOLOGIA	TECNOLOGIA E SISTEMAS
Hueliton Sampaio	Profectum | Nexo	TI
Hueliton Sampaio	Profectum	Tecnologia
JANSEN ARAUJO	Compasso Comunicação e Marketing	Midia Exterior
Jelena Todorovic	Basquete Cearense	Esportes
Jonathan Magalhães	JONMAG	Investimentos e Renda Passiva
Jorge Cysne	FORTES TECNOLOGIA	TECNOLOGIA
Jorio da Escossia	Jorío da Escossia	Saúde odontológica
José Neto	Polo empresarial Porto do Pecém	Loteamento para Industria
Lucas Uchoa	Somapay	BANCO. E FOLHA DE PAGAMENTO
Luis Nunes	Brasterra	Construção
Marcus Candeai	Goener	Energia
Mariana Matos	Unimed Fortaleza	Saúde
MARLYSON NOBRE	NOBRECON	CONTABILIDADE
Nayana Branco	SOMAPAY	BANCO. E FOLHA DE PAGAMENTO
PAULO OLIVEIRA	Inovar Marketing Olfativo	Marketing Olfativo
Paulo César Baltazar Viana Filho	Grupo Protemaxi	Facilities e Segurança
Ramon Pessoa	R7	Treinamentos Time Comercial
Roberto Araújo	Iniciativa assessoria e consultoria Empresarial	Assessoria e consultoria Empresarial
Rodrigo Cunha	Romazi	Indústria Tomadas
Samir Bayde	NEOTECH	Construção Modular
Samuel Cavalcante Benevides pessoa	Frota Cavalcante odontologia	Saude
Sayde Bayde	HOWBE	TECNOLOGIA
Sergio Rolim	SAL ENERGIA	Energia por assinatura
Thalis Braga	Basquete Cearense	Esporte
Victor Fernandes	Yellow Energy	Energia por assinatura
victor maia	Comercial Maia	Distribuidora de material para construção`;

const InputView: React.FC<InputViewProps> = ({ onAnalyze, isLoading, isDarkMode, onBack }) => {
  const [inputText, setInputText] = useState('');
  const [activeMethod, setActiveMethod] = useState<'paste' | 'file'>('paste');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
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
          setInputText(csvText);
          setActiveMethod('paste');
        };
        reader.readAsArrayBuffer(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setInputText(text);
          setActiveMethod('paste');
        };
        reader.readAsText(file);
      }
    }
  };

  const handleDemo = () => {
    setEventName('Rampup Talks 2026');
    setEventDate('2026-01-29');
    setEventTime('18:00');
    setInputText(DEMO_DATA);
    setActiveMethod('paste');
  };

  const handleAnalyzeClick = () => {
    const contextHeader = `CONTEXTO DA AGENDA:
Evento: ${eventName || 'N/A'}
Data: ${eventDate || 'N/A'}
Horário: ${eventTime || 'N/A'}
--------------------------------`;
    
    const finalData = `${contextHeader}\n\n${inputText}`;
    onAnalyze(finalData);
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in px-2 md:px-0">
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
          ? 'bg-gray-900 border-verde-light/40 shadow-[0_0_25px_rgba(74,222,128,0.1)]' 
          : 'bg-white border-gray-300 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
      }`}>
        <div className={`p-6 md:p-10 text-center ${
           isDarkMode 
             ? 'bg-gradient-to-br from-green-900 via-emerald-900 to-gray-900' 
             : 'bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-900'
        }`}>
          <div className="flex flex-col items-center justify-center mb-4">
             <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm mb-3">
               <img 
                 src={LOGO_URL} 
                 alt="Rampup Business" 
                 className="h-8 md:h-10 w-auto brightness-0 invert" 
               />
             </div>
             <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Rampup IN</h1>
          </div>
          <p className="text-emerald-100/90 text-sm md:text-base font-medium">Inteligência Artificial para análise de networking</p>
        </div>

        <div className="p-5 md:p-8 space-y-6 md:space-y-8">
          <div className="flex justify-end">
             <button 
                onClick={handleDemo}
                className={`text-xs font-medium flex items-center transition-colors px-3 py-1 rounded-full ${isDarkMode ? 'bg-gray-800 text-verde-light hover:bg-gray-700' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
              >
                <Database className="w-3 h-3 mr-1.5" />
                Carregar Exemplo
              </button>
          </div>

          {/* Agenda Details Section */}
          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
             <h3 className={`text-sm font-bold uppercase mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <FileText className="w-4 h-4" /> Detalhes da Agenda
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                   <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nome da Agenda / Evento</label>
                   <input 
                      type="text" 
                      placeholder="Ex: Almoço de Networking"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
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
                         className={`w-full pl-10 pr-3 py-2 rounded-lg text-sm border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
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
                         className={`w-full pl-10 pr-3 py-2 rounded-lg text-sm border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
                            isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                         }`}
                      />
                   </div>
                </div>
             </div>
          </div>

          <div className={`flex justify-center p-1 rounded-lg w-full max-w-xs mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100 border border-gray-200'}`}>
            <button
              onClick={() => setActiveMethod('paste')}
              className={`flex-1 flex justify-center items-center px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                activeMethod === 'paste' 
                  ? isDarkMode 
                    ? 'bg-chumbo-900 text-verde-light shadow-sm' 
                    : 'bg-white text-emerald-700 shadow-sm ring-1 ring-gray-200' 
                  : isDarkMode
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Lista
            </button>
            <button
              onClick={() => setActiveMethod('file')}
              className={`flex-1 flex justify-center items-center px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                activeMethod === 'file' 
                  ? isDarkMode 
                    ? 'bg-chumbo-900 text-verde-light shadow-sm' 
                    : 'bg-white text-emerald-700 shadow-sm ring-1 ring-gray-200' 
                  : isDarkMode
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Arquivo
            </button>
          </div>

          <div className="transition-all duration-300">
            {activeMethod === 'paste' ? (
              <div className="space-y-3">
                <label className={`block text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-emerald-800/70'}`}>
                  Dados dos Participantes
                </label>
                <div className={`relative rounded-xl border-2 transition-all ${
                   isDarkMode 
                      ? 'bg-gray-800 border-gray-700 focus-within:border-verde-light/50' 
                      : 'bg-white border-gray-300 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/20'
                }`}>
                  <textarea
                    className={`w-full h-48 md:h-64 p-4 md:p-5 bg-transparent border-none focus:ring-0 text-sm font-mono leading-relaxed resize-none ${
                      isDarkMode ? 'text-gray-200 placeholder-gray-600' : 'text-gray-800 placeholder-gray-400'
                    }`}
                    placeholder={`Cole aqui sua lista...\n\nExemplo:\nNome, Empresa, Segmento`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  {inputText && (
                    <div className={`absolute bottom-3 right-3 text-[10px] md:text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-500 shadow-sm border border-gray-200'}`}>
                      {inputText.split('\n').filter(l => l.trim()).length} linhas detectadas
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all group ${
                  isDarkMode 
                  ? 'border-gray-700 hover:border-verde-light/50 hover:bg-gray-800' 
                  : 'border-gray-300 hover:border-emerald-500 hover:bg-gray-50'
                }`}>
                <div className={`w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${
                  isDarkMode ? 'bg-gray-800 group-hover:bg-gray-700' : 'bg-gray-100 group-hover:bg-emerald-50'
                }`}>
                   <Upload className={`w-6 h-6 md:w-8 md:h-8 ${isDarkMode ? 'text-gray-400 group-hover:text-verde-light' : 'text-gray-400 group-hover:text-emerald-600'}`} />
                </div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Upload de Arquivo</h3>
                <p className={`text-sm mt-1 mb-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Suporta arquivos .XLSX, .CSV ou .TXT</p>
                
                <input 
                  type="file" 
                  accept=".csv,.txt,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden" 
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload" 
                  className={`inline-flex items-center px-6 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition transform active:scale-95 ${
                    isDarkMode 
                    ? 'bg-verde-neon text-black hover:bg-verde-light' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'
                  }`}
                >
                  Selecionar do Computador
                </label>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyzeClick}
            disabled={!inputText.trim() || isLoading}
            className={`w-full py-3.5 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-xl flex items-center justify-center transition-all transform hover:scale-[1.01] active:scale-[0.99] ${
              !inputText.trim() || isLoading
                ? isDarkMode ? 'bg-gray-800 text-gray-600 cursor-not-allowed shadow-none' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200'
                : isDarkMode 
                  ? 'bg-gradient-to-r from-verde-neon to-green-400 text-black hover:to-verde-light shadow-verde-neon/20' 
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/30'
            }`}
          >
            {isLoading ? (
              <>
                <div className={`animate-spin rounded-full h-5 w-5 border-b-2 mr-3 ${isDarkMode ? 'border-black' : 'border-white'}`}></div>
                Processando...
              </>
            ) : (
              <>
                <Play className={`w-5 h-5 mr-2 fill-current`} />
                Gerar Análise
              </>
            )}
          </button>
        </div>
        
        <div className={`px-4 md:px-8 py-4 text-center border-t ${isDarkMode ? 'bg-chumbo-950 border-gray-800 text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] md:text-xs font-medium">
             <div className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Análise Semântica</div>
             <span className="hidden sm:inline mx-1">•</span>
             <div className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Matching Inteligente</div>
             <span className="hidden sm:inline mx-1">•</span>
             <div className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Score Preditivo</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputView;