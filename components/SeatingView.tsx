import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AnalysisResult, LayoutFormat, Participant, IndividualScore } from '../types';
import { LayoutDashboard, Users, User, ArrowRight, Grid, Monitor, Disc, Rows, RectangleHorizontal, Magnet, AlignJustify, Save, Filter, ChevronDown, Check, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';

interface SeatingViewProps {
  data: AnalysisResult;
  isDarkMode: boolean;
}

const LAYOUT_OPTIONS: { id: LayoutFormat; label: string; icon: any; description: string }[] = [
  { id: 'buffet', label: 'Buffet / Banquete', icon: Disc, description: 'Mesas redondas para 6-8 pessoas. Ideal para networking intenso.' },
  { id: 'mesa_u', label: 'Mesa em U', icon: Magnet, description: 'Formato de U. Todos se veem, bom para debates centrais.' },
  { id: 'conferencia', label: 'Conferência', icon: RectangleHorizontal, description: 'Mesa única retangular. Ideal para diretoria ou grupos menores.' },
  { id: 'mesa_o', label: 'Mesa em O', icon: LayoutDashboard, description: 'Quadrado vazado. Similar ao U, mas fechado.' },
  { id: 'teatro', label: 'Teatro', icon: Rows, description: 'Fileiras de cadeiras. Foco no palestrante.' },
  { id: 'sala_aula', label: 'Sala de Aula', icon: Monitor, description: 'Fileiras com mesas. Foco em aprendizado.' },
  { id: 'recepcao', label: 'Recepção', icon: Users, description: 'Mesas de apoio e circulação livre.' },
  { id: 'mesa_t', label: 'Mesa em T', icon: AlignJustify, description: 'Formato T. Bom para painéis com destaque principal.' },
];

interface SeatCardProps {
  p: Participant;
  idx: number;
  isDarkMode: boolean;
  isDimmed: boolean;
  score?: number;
}

const SeatCard: React.FC<SeatCardProps> = ({ p, idx, isDarkMode, isDimmed, score }) => (
  <div className={`flex items-center gap-2 p-2 rounded-lg border w-full mb-2 transition-opacity duration-300 ${
     isDimmed ? 'opacity-30 grayscale' : 'opacity-100'
  } ${
     isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
  }`}>
     <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
        isDarkMode ? 'bg-gray-800 text-verde-light' : 'bg-emerald-100 text-emerald-700'
     }`}>{idx}</div>
     <div className="min-w-0">
       <div className={`text-xs font-bold truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{p.name}</div>
       <div className="flex items-center gap-2">
          <div className={`text-[10px] truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{p.company}</div>
          {score !== undefined && (
            <div className={`text-[9px] font-bold px-1 rounded ${score >= 80 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              IN: {score}
            </div>
          )}
       </div>
     </div>
  </div>
);

const SeatingView: React.FC<SeatingViewProps> = ({ data, isDarkMode }) => {
  // Load saved layout or use suggested
  const [selectedLayout, setSelectedLayout] = useState<LayoutFormat>(() => {
    const saved = localStorage.getItem('rampup_saved_layout');
    return (saved as LayoutFormat) || data.suggestedLayout;
  });

  const [filterSegment, setFilterSegment] = useState<string>('');
  const [minScore, setMinScore] = useState<number>(0);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Helper to get participant object
  const getParticipant = (id: string) => data.participants.find(p => p.id === id);
  const getScore = (id: string) => data.individualScores.find(s => s.participantId === id)?.score || 0;

  // Flatten groups for linear layouts (U, O, Conference, Theater)
  // We keep the clustering logic by placing groups adjacent to each other in the linear list
  // This ensures that p[0] is highly compatible with p[1], etc.
  const linearParticipants = useMemo(() => {
    return data.seatingGroups.flatMap(group => group.map(id => getParticipant(id))).filter(Boolean) as Participant[];
  }, [data]);

  const uniqueSegments = useMemo(() => {
    return Array.from(new Set(data.participants.map(p => p.segment))).sort();
  }, [data.participants]);

  const checkVisibility = (p: Participant) => {
    const score = getScore(p.id);
    const matchesSegment = filterSegment ? p.segment === filterSegment : true;
    const matchesScore = score >= minScore;
    return matchesSegment && matchesScore;
  };

  const handleSaveLayout = () => {
    localStorage.setItem('rampup_saved_layout', selectedLayout);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleDownloadImage = async () => {
    if (!mapRef.current) return;
    
    try {
      const canvas = await html2canvas(mapRef.current, {
        scale: 2, // High definition
        backgroundColor: isDarkMode ? '#1a202c' : '#ffffff', // Explicit background color to prevent transparency issues
        useCORS: true,
        logging: false
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `mapa_sala_${selectedLayout}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to save image", err);
    }
  };

  const renderVisualMap = () => {
    switch (selectedLayout) {
      case 'buffet':
      case 'recepcao':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {data.seatingGroups.map((group, groupIdx) => (
              <div key={groupIdx} className={`relative p-6 rounded-full border-2 aspect-square flex flex-col items-center justify-center ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-emerald-200 shadow-sm'
              }`}>
                {/* Table Graphic */}
                <div className={`absolute inset-4 rounded-full border-4 opacity-20 ${isDarkMode ? 'border-gray-500' : 'border-emerald-500'}`}></div>
                <div className={`absolute -top-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? 'bg-gray-700 text-verde-light' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Mesa {groupIdx + 1}
                </div>
                
                {/* Participants */}
                <div className="relative z-10 w-full space-y-2 max-h-[80%] overflow-y-auto custom-scrollbar px-4 text-center">
                  {group.map(id => {
                    const p = getParticipant(id);
                    if (!p) return null;
                    const visible = checkVisibility(p);
                    return (
                      <div key={id} className={`group/p relative transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-20'}`}>
                        <div className={`text-xs font-medium truncate py-1 px-2 rounded cursor-help transition-colors ${
                          isDarkMode ? 'bg-gray-700/80 text-gray-200 hover:bg-gray-600' : 'bg-gray-50 text-gray-700 hover:bg-emerald-50'
                        }`}>
                          {p.name}
                        </div>
                        {/* Hover Tooltip */}
                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max max-w-[150px] p-2 rounded text-[10px] hidden group-hover/p:block z-20 shadow-lg ${
                           isDarkMode ? 'bg-black text-white' : 'bg-gray-800 text-white'
                        }`}>
                          {p.company} • {p.segment} • IN: {getScore(p.id)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );

      case 'conferencia':
        return (
           <div className="flex justify-center py-10 overflow-x-auto">
             <div className={`relative min-w-[300px] w-full max-w-4xl rounded-xl border-4 flex flex-wrap content-center justify-center p-8 gap-4 ${
               isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-emerald-50/50 border-emerald-800/20'
             }`}>
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-emerald-800 text-white'}`}>Mesa Principal</div>
                
                {linearParticipants.map((p, idx) => {
                  const visible = checkVisibility(p);
                  return (
                  <div key={p.id} className={`flex flex-col items-center w-24 p-2 rounded border transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-20'} ${
                    isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
                  }`}>
                    <div className={`w-8 h-8 rounded-full mb-1 flex items-center justify-center text-xs font-bold ${
                      isDarkMode ? 'bg-gray-800 text-verde-light' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`text-[10px] text-center font-medium leading-tight line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {p.name}
                    </span>
                    <span className={`text-[9px] text-center opacity-60 line-clamp-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{p.company}</span>
                  </div>
                )})}
             </div>
           </div>
        );

      case 'mesa_u':
        const uTotal = linearParticipants.length;
        const uSideCount = Math.floor((uTotal - Math.floor(uTotal/2.5)) / 2); // Sides have fewer people usually
        const uTopCount = uTotal - (uSideCount * 2);
        
        const leftSide = linearParticipants.slice(0, uSideCount);
        const topSide = linearParticipants.slice(uSideCount, uSideCount + uTopCount);
        const rightSide = linearParticipants.slice(uSideCount + uTopCount);

        return (
          <div className="flex justify-center p-4">
             <div className="flex gap-4 items-start max-w-5xl w-full">
                {/* Left Side (Vertical) */}
                <div className="flex flex-col w-1/4 pt-16">
                   {leftSide.map((p, i) => <SeatCard key={p.id} p={p} idx={i + 1} isDarkMode={isDarkMode} isDimmed={!checkVisibility(p)} score={getScore(p.id)} />)}
                </div>

                {/* Center (Top + Void) */}
                <div className="flex flex-col w-2/4">
                   {/* Top Horizontal */}
                   <div className="flex flex-wrap justify-center gap-2 mb-8">
                      {topSide.map((p, i) => {
                         const visible = checkVisibility(p);
                         return (
                        <div key={p.id} className={`flex flex-col items-center w-20 p-1.5 rounded border transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-20'} ${
                          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
                        }`}>
                          <span className={`text-[9px] font-bold text-center leading-tight ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{p.name}</span>
                        </div>
                      )})}
                   </div>
                   {/* The Void of the U */}
                   <div className={`h-full min-h-[200px] border-l-4 border-b-4 border-r-4 rounded-b-xl opacity-20 ${
                      isDarkMode ? 'border-gray-500 bg-gray-800/20' : 'border-emerald-600 bg-emerald-100/20'
                   }`}>
                     <div className="h-full flex items-center justify-center text-sm font-bold opacity-50 uppercase tracking-widest">Área Central</div>
                   </div>
                </div>

                {/* Right Side (Vertical) */}
                <div className="flex flex-col w-1/4 pt-16">
                   {rightSide.map((p, i) => <SeatCard key={p.id} p={p} idx={uSideCount + uTopCount + i + 1} isDarkMode={isDarkMode} isDimmed={!checkVisibility(p)} score={getScore(p.id)} />)}
                </div>
             </div>
          </div>
        );

      case 'mesa_t':
        const tTotal = linearParticipants.length;
        const tTopCount = Math.max(4, Math.ceil(tTotal * 0.4)); 
        const tLegCount = tTotal - tTopCount;

        const tTop = linearParticipants.slice(0, tTopCount);
        const tLeg = linearParticipants.slice(tTopCount);

        return (
          <div className="flex flex-col items-center p-4 min-h-[600px]">
             {/* Top Bar */}
             <div className={`flex flex-wrap justify-center gap-2 p-4 rounded-xl border-2 mb-4 relative z-10 ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-emerald-50/50 border-emerald-200'
             }`}>
                {tTop.map((p, idx) => {
                   const visible = checkVisibility(p);
                   return (
                   <div key={p.id} className={`w-24 p-2 rounded border text-center transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-20'} ${
                      isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
                   }`}>
                      <div className={`w-6 h-6 mx-auto rounded-full mb-1 flex items-center justify-center text-[10px] font-bold ${
                         isDarkMode ? 'bg-gray-800 text-verde-light' : 'bg-emerald-100 text-emerald-700'
                      }`}>{idx + 1}</div>
                      <span className={`text-[10px] font-bold block truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{p.name}</span>
                   </div>
                )})}
             </div>

             {/* Vertical Leg */}
             <div className={`flex flex-col items-center gap-2 p-4 rounded-b-xl border-x-2 border-b-2 -mt-6 pt-8 ${
                 isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-emerald-50/30 border-emerald-200'
             }`}>
                {tLeg.map((p, idx) => (
                  <div key={p.id} className="w-[300px]">
                     <SeatCard p={p} idx={tTopCount + idx + 1} isDarkMode={isDarkMode} isDimmed={!checkVisibility(p)} score={getScore(p.id)} />
                  </div>
                ))}
             </div>
          </div>
        );

      case 'mesa_o':
        const qTotal = linearParticipants.length;
        const oSides = Math.floor(qTotal / 4);
        const oTop = Math.ceil((qTotal - (oSides * 2)) / 2);
        const oBottom = qTotal - (oSides * 2) - oTop;

        return (
           <div className="max-w-4xl mx-auto aspect-square relative p-16">
             <div className={`absolute inset-24 border-8 rounded-xl opacity-20 ${isDarkMode ? 'border-gray-500' : 'border-emerald-600'}`}></div>
             
             {/* Top Row */}
             <div className="absolute top-0 left-0 right-0 flex justify-center gap-1 px-16 h-20 items-end">
               {linearParticipants.slice(0, oTop).map((p, i) => {
                  const visible = checkVisibility(p);
                  return (
                 <div key={p.id} className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold cursor-help transition-all hover:scale-110 z-10 ${visible ? 'opacity-100' : 'opacity-20'} ${
                    isDarkMode ? 'bg-gray-800 text-white border border-gray-600' : 'bg-white text-emerald-800 border border-emerald-200 shadow'
                 }`} title={`${p.name} - ${p.company}`}>T{i+1}</div>
               )})}
             </div>
             
             {/* Right Column */}
             <div className="absolute top-0 bottom-0 right-0 flex flex-col justify-center gap-1 py-16 w-20 items-start pl-2">
               {linearParticipants.slice(oTop, oTop + oSides).map((p, i) => {
                  const visible = checkVisibility(p);
                  return (
                 <div key={p.id} className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold cursor-help transition-all hover:scale-110 z-10 ${visible ? 'opacity-100' : 'opacity-20'} ${
                    isDarkMode ? 'bg-gray-800 text-white border border-gray-600' : 'bg-white text-emerald-800 border border-emerald-200 shadow'
                 }`} title={`${p.name} - ${p.company}`}>R{i+1}</div>
               )})}
             </div>

             {/* Bottom Row */}
             <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 px-16 h-20 items-start">
               {linearParticipants.slice(oTop + oSides, oTop + oSides + oBottom).map((p, i) => {
                  const visible = checkVisibility(p);
                  return (
                 <div key={p.id} className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold cursor-help transition-all hover:scale-110 z-10 ${visible ? 'opacity-100' : 'opacity-20'} ${
                    isDarkMode ? 'bg-gray-800 text-white border border-gray-600' : 'bg-white text-emerald-800 border border-emerald-200 shadow'
                 }`} title={`${p.name} - ${p.company}`}>B{i+1}</div>
               )})}
             </div>

              {/* Left Column */}
              <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-center gap-1 py-16 w-20 items-end pr-2">
               {linearParticipants.slice(oTop + oSides + oBottom).map((p, i) => {
                  const visible = checkVisibility(p);
                  return (
                 <div key={p.id} className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold cursor-help transition-all hover:scale-110 z-10 ${visible ? 'opacity-100' : 'opacity-20'} ${
                    isDarkMode ? 'bg-gray-800 text-white border border-gray-600' : 'bg-white text-emerald-800 border border-emerald-200 shadow'
                 }`} title={`${p.name} - ${p.company}`}>L{i+1}</div>
               )})}
             </div>
             
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <p className={`text-center text-sm font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Mesa em O<br/><span className="text-xs">Passe o mouse para ver os nomes</span>
               </p>
             </div>
           </div>
        );

      default: // Teatro, Sala de Aula (fallback to grid)
        return (
          <div className="space-y-6">
             {/* Stage Area */}
             <div className={`w-2/3 mx-auto h-12 rounded-t-3xl flex items-center justify-center mb-8 border-t-2 border-x-2 ${
                isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-500'
             }`}>
               <span className="text-xs font-bold uppercase tracking-widest">Palco / Tela</span>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
               {linearParticipants.map((p, idx) => {
                 const visible = checkVisibility(p);
                 return (
                 <div key={p.id} className={`p-3 rounded-lg border text-center transition-all hover:scale-105 ${visible ? 'opacity-100' : 'opacity-20'} ${
                   isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-verde-light' : 'bg-white border-gray-200 hover:border-emerald-300 shadow-sm'
                 }`}>
                   <div className={`mx-auto w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold mb-2 ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'
                   }`}>
                     {idx + 1}
                   </div>
                   <p className={`text-xs font-bold leading-tight line-clamp-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{p.name}</p>
                   <p className={`text-[10px] mt-1 opacity-70 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{p.company}</p>
                   <p className={`text-[9px] mt-1 font-mono ${isDarkMode ? 'text-verde-light' : 'text-emerald-600'}`}>IN: {getScore(p.id)}</p>
                 </div>
               )})}
             </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Controls Header */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-chumbo-900 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <LayoutDashboard className="w-5 h-5" />
              Configuração da Sala
            </h3>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Formato sugerido: <span className="font-bold text-emerald-500">{LAYOUT_OPTIONS.find(l => l.id === data.suggestedLayout)?.label}</span>
            </p>
          </div>
          
          <div className="w-full md:w-auto flex flex-col gap-3">
             <div className="flex items-center gap-2">
                <button
                   onClick={handleSaveLayout}
                   className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border shadow-sm transition-all ${
                      isDarkMode 
                      ? 'bg-chumbo-800 border-gray-700 text-verde-light hover:bg-chumbo-900' 
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                   }`}
                >
                   {showSavedToast ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                   {showSavedToast ? 'Salvo!' : 'Salvar Layout'}
                </button>
                <button
                   onClick={handleDownloadImage}
                   className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border shadow-sm transition-all ${
                      isDarkMode 
                      ? 'bg-chumbo-800 border-gray-700 text-verde-light hover:bg-chumbo-900' 
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                   }`}
                >
                   <ImageIcon className="w-3 h-3" />
                   Salvar Imagem (PNG)
                </button>
             </div>
          </div>
        </div>

        {/* Filters & Layout Selector */}
        <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Layout Buttons */}
              <div className="md:col-span-3">
                <label className={`block text-xs font-bold uppercase mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Escolher Formato
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                  {LAYOUT_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedLayout(option.id)}
                      title={option.description}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                        selectedLayout === option.id
                          ? isDarkMode 
                            ? 'bg-verde-neon text-black border-verde-neon' 
                            : 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105'
                          : isDarkMode
                            ? 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <option.icon className="w-4 h-4 mb-1" />
                      <span className="text-[9px] font-bold text-center leading-none">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="relative">
                    <label className={`block text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                       Filtrar por Segmento
                    </label>
                    <div className="relative">
                        <select 
                           value={filterSegment}
                           onChange={(e) => setFilterSegment(e.target.value)}
                           className={`block w-full pl-3 pr-8 py-2 text-sm rounded-lg border outline-none focus:ring-1 transition-all appearance-none cursor-pointer ${
                              isDarkMode 
                              ? 'bg-gray-800 border-gray-700 text-white focus:border-verde-light' 
                              : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
                           }`}
                        >
                           <option value="">Todos os Segmentos</option>
                           {uniqueSegments.map(seg => (
                              <option key={seg} value={seg}>{seg}</option>
                           ))}
                        </select>
                        <ChevronDown className={`absolute right-3 top-2.5 w-4 h-4 pointer-events-none ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    </div>
                  </div>

                  <div>
                     <label className={`block text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Score Mínimo (IN): {minScore}
                     </label>
                     <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={minScore} 
                        onChange={(e) => setMinScore(Number(e.target.value))}
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                           isDarkMode ? 'bg-gray-700 accent-verde-neon' : 'bg-gray-200 accent-emerald-500'
                        }`}
                     />
                  </div>
              </div>
           </div>
        </div>
      </div>

      {/* Visualizer Area */}
      <div ref={mapRef} className={`p-8 rounded-2xl border min-h-[500px] ${
        isDarkMode ? 'bg-chumbo-800/50 border-gray-800' : 'bg-gray-50 border-gray-200'
      }`}>
         <div className="flex justify-between items-center mb-8">
            <h4 className={`font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Visualização do Mapa</h4>
            <div className="flex gap-4 text-xs">
               <div className="flex items-center gap-1">
                 <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-white border'}`}></div>
                 <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Assento</span>
               </div>
               <div className="flex items-center gap-1">
                 <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'border-2 border-gray-500' : 'border-2 border-emerald-500'}`}></div>
                 <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Mesa/Estrutura</span>
               </div>
            </div>
         </div>

         {renderVisualMap()}
         
         <div className={`mt-8 text-center text-xs italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
           * A distribuição dos assentos prioriza agrupar participantes com alta afinidade comercial conforme análise da IA.
           {(filterSegment || minScore > 0) && (
              <span className="block mt-1 font-bold text-yellow-500">
                 Visualização filtrada: Participantes fora dos critérios estão esmaecidos.
              </span>
           )}
         </div>
      </div>
    </div>
  );
};

export default SeatingView;