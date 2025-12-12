import React, { useState, ChangeEvent } from 'react';
import { Upload, FileText, Play, Database, CheckCircle } from 'lucide-react';

interface InputViewProps {
  onAnalyze: (data: string) => void;
  isLoading: boolean;
  isDarkMode: boolean;
}

const DEMO_DATA = `Evento: Summit de Negócios Brasil 2025

1. João Silva, JS Marketing, Marketing Digital
2. Maria Souza, Souza Imóveis, Imobiliária
3. Carlos Pereira, TechDev Solutions, Desenvolvimento de Software
4. Ana Oliveira, Oliveira Doces Finos, Confeitaria e Buffet
5. Pedro Santos, Santos Engenharia, Construção Civil
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
22. Vanessa Lima, Estética Vanessa, Clínica de Estética
23. Rodrigo Faria, Faria Imóveis, Imobiliária Comercial
24. Patrícia Castro, Castro Idiomas, Escola de Inglês
25. Marcelo Ribeiro, Ribeiro Motors, Oficina Mecânica Premium
26. Aline Mendes, AM Design, Design Gráfico e Branding
27. Gustavo Henrique, GH Produções, Produção de Vídeo
28. Letícia Duarte, Duarte RH, Recrutamento e Seleção
29. André Vieira, Vieira Consultoria, Consultoria Empresarial
30. Mônica Santana, Santana Viagens, Agência de Turismo
31. Ricardo Pinto, Pinto & Filhos, Material de Construção
32. Cláudia Teixeira, Teixeira Psicologia, Psicologia Organizacional
33. Fernando Moura, Moura Café, Cafeteria Gourmet
34. Tatiane Ramos, Ramos Semijoias, Venda de Acessórios
35. Igor Santos, Santos Web, Criação de Sites
36. Larissa Campos, Campos Veterinária, Clínica Veterinária
37. Diego Moreira, Moreira Barber, Barbearia
38. Paula Nogueira, Nogueira Doces, Bolos Artísticos
39. Vinícius Azevedo, Azevedo Import, Importação
40. Sara Costa, Costa Coworking, Espaço de Coworking
41. Otávio Guimarães, Guimarães Têxtil, Indústria Têxtil
42. Helena Batista, Batista Clean, Limpeza Comercial
43. Cauã Freitas, Freitas Print, Gráfica Rápida
44. Isabela Matos, Matos Coaching, Coaching de Carreira
45. Samuel Lopes, Lopes Security, Segurança Eletrônica
46. Luana Correia, Correia Crafts, Artesanato de Luxo
47. Davi Araújo, Araújo Burger, Hamburgueria Artesanal
48. Lorena Soares, Soares Pilates, Studio de Pilates
49. Matheus Cunha, Cunha Invest, Assessoria de Investimentos
50. Bianca Neves, Neves Makeup, Maquiadora Profissional
51. Renan Sales, Sales Eletro, Instalações Elétricas`;

const InputView: React.FC<InputViewProps> = ({ onAnalyze, isLoading, isDarkMode }) => {
  const [inputText, setInputText] = useState('');
  const [activeMethod, setActiveMethod] = useState<'paste' | 'file'>('paste');

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInputText(text);
        setActiveMethod('paste'); // Switch to view content
      };
      reader.readAsText(file);
    }
  };

  const handleDemo = () => {
    setInputText(DEMO_DATA);
    setActiveMethod('paste');
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Container with stylized green tones */}
      <div className={`rounded-2xl shadow-xl overflow-hidden border-2 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-900 border-verde-light/40 shadow-[0_0_25px_rgba(74,222,128,0.1)]' 
          : 'bg-white border-gray-300 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
      }`}>
        {/* Header Area - Painted in Dark Green Tones as requested */}
        <div className={`p-10 text-center ${
           isDarkMode 
             ? 'bg-gradient-to-br from-green-900 via-emerald-900 to-gray-900' 
             : 'bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-900'
        }`}>
          <h1 className="text-3xl font-bold mb-2 tracking-tight text-white">Rampup IN</h1>
          <p className="text-emerald-100/90 font-medium">Inteligência Artificial para análise de networking</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Method Selection */}
          <div className={`flex justify-center p-1 rounded-lg w-fit mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100 border border-gray-200'}`}>
            <button
              onClick={() => setActiveMethod('paste')}
              className={`flex items-center px-6 py-2 rounded-md text-sm font-semibold transition-all ${
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
              className={`flex items-center px-6 py-2 rounded-md text-sm font-semibold transition-all ${
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

          {/* Input Area */}
          <div className="transition-all duration-300">
            {activeMethod === 'paste' ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <label className={`block text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-emerald-800/70'}`}>
                    Dados dos Participantes
                  </label>
                   <button 
                    onClick={handleDemo}
                    className={`text-xs font-medium flex items-center transition-colors px-3 py-1 rounded-full ${isDarkMode ? 'bg-gray-800 text-verde-light hover:bg-gray-700' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                  >
                    <Database className="w-3 h-3 mr-1.5" />
                    Carregar Exemplo
                  </button>
                </div>
                
                <div className={`relative rounded-xl border-2 transition-all ${
                   isDarkMode 
                      ? 'bg-gray-800 border-gray-700 focus-within:border-verde-light/50' 
                      : 'bg-white border-gray-300 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/20'
                }`}>
                  <textarea
                    className={`w-full h-64 p-5 bg-transparent border-none focus:ring-0 text-sm font-mono leading-relaxed resize-none ${
                      isDarkMode ? 'text-gray-200 placeholder-gray-600' : 'text-gray-800 placeholder-gray-400'
                    }`}
                    placeholder={`Cole aqui sua lista...\n\nExemplo:\nNome, Empresa, Segmento`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  {inputText && (
                    <div className={`absolute bottom-3 right-3 text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-500 shadow-sm border border-gray-200'}`}>
                      {inputText.split('\n').filter(l => l.trim()).length} linhas detectadas
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-all group ${
                  isDarkMode 
                  ? 'border-gray-700 hover:border-verde-light/50 hover:bg-gray-800' 
                  : 'border-gray-300 hover:border-emerald-500 hover:bg-gray-50'
                }`}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${
                  isDarkMode ? 'bg-gray-800 group-hover:bg-gray-700' : 'bg-gray-100 group-hover:bg-emerald-50'
                }`}>
                   <Upload className={`w-8 h-8 ${isDarkMode ? 'text-gray-400 group-hover:text-verde-light' : 'text-gray-400 group-hover:text-emerald-600'}`} />
                </div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Upload de Arquivo</h3>
                <p className={`text-sm mt-1 mb-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Suporta arquivos .CSV ou .TXT</p>
                
                <input 
                  type="file" 
                  accept=".csv,.txt"
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

          {/* Action Button - Stylized Green */}
          <button
            onClick={() => onAnalyze(inputText)}
            disabled={!inputText.trim() || isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center transition-all transform hover:scale-[1.01] active:scale-[0.99] ${
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
        
        {/* Footer info */}
        <div className={`px-8 py-4 text-center border-t ${isDarkMode ? 'bg-chumbo-950 border-gray-800 text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
          <div className="flex items-center justify-center gap-2 text-xs font-medium">
             <CheckCircle className="w-3 h-3" />
             <span>Análise Semântica</span>
             <span className="mx-1">•</span>
             <CheckCircle className="w-3 h-3" />
             <span>Matching Inteligente</span>
             <span className="mx-1">•</span>
             <CheckCircle className="w-3 h-3" />
             <span>Score Preditivo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputView;