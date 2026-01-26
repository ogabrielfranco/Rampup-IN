import React, { useState, useMemo, useDeferredValue, useEffect } from 'react';
import { AnalysisResult, Participant, IndividualScore, LayoutFormat, ConnectionType } from '../types';
import SeatingView from './SeatingView';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  CartesianGrid, LabelList
} from 'recharts';
import { Users, TrendingUp, Link, ArrowLeft, ArrowRight, FileSpreadsheet, Filter, Info, ChevronUp, ChevronDown, Flame, List, Target, PieChart, Layers, Search, Building2, User, X, Briefcase, ExternalLink, Network, LayoutTemplate, LayoutDashboard, Crown, Download, ChevronRight, FileText, Presentation, ShoppingCart, Truck, Handshake } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';
import { LOGO_URL } from '../App';

interface AnalysisViewProps {
  data: AnalysisResult;
  onReset: () => void;
  isDarkMode: boolean;
}

const ConnectionBadge = ({ type }: { type: ConnectionType }) => {
  const map = {
    buyer: { label: 'Compra', icon: ShoppingCart, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
    seller: { label: 'Venda', icon: Truck, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' },
    partner: { label: 'Parceria', icon: Handshake, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' }
  };
  const config = map[type] || map.partner;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border border-transparent shadow-sm ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const ITEMS_PER_PAGE = 20;

type SortField = 'score' | 'name';
type SortDirection = 'asc' | 'desc';

// Format Layout Name for display
const formatLayoutName = (layout: string) => {
  const map: Record<string, string> = {
    'teatro': 'Teatro',
    'sala_aula': 'Sala de Aula',
    'mesa_o': 'Mesa em O',
    'conferencia': 'Conferência',
    'mesa_u': 'Mesa em U',
    'mesa_t': 'Mesa em T',
    'recepcao': 'Recepção',
    'buffet': 'Buffet',
    'custom': 'Livre'
  };
  return map[layout] || layout;
};

const CustomTooltip = ({ active, payload, label, isDarkMode }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    const isScore = dataPoint.name === 'score';
    return (
      <div className={`p-4 rounded-xl shadow-2xl border backdrop-blur-md ${
        isDarkMode 
          ? 'bg-gray-900/95 border-gray-700 text-white' 
          : 'bg-white/95 border-gray-100 text-gray-900'
      }`}>
        <p className="font-bold text-sm mb-2 border-b pb-2 border-opacity-20 border-gray-500">{label}</p>
        <div className="flex items-center gap-3 text-sm">
          <span 
            className="w-3 h-3 rounded-full shadow-sm" 
            style={{ backgroundColor: dataPoint.color || dataPoint.payload.fill }}
          />
          <span className={`flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {isScore ? 'Índice (IN):' : 'Participantes:'}
          </span>
          <span className="font-bold font-mono text-lg">
            {dataPoint.value}{isScore ? '%' : ''}
          </span>
        </div>
        {isScore && (
          <p className={`text-xs mt-2 italic max-w-[200px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {dataPoint.payload.connections} conexões de alto valor
          </p>
        )}
      </div>
    );
  }
  return null;
};

const MetricCard = ({ title, value, subtext, icon: Icon, isDarkMode, accentColor, trend }: any) => (
  <div className={`relative overflow-hidden p-6 rounded-2xl border shadow-lg transition-all hover:shadow-xl group ${
    isDarkMode ? 'bg-chumbo-900 border-gray-800' : 'bg-white border-gray-100'
  }`}>
    <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${accentColor}`}></div>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <Icon className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
        </div>
        {trend && (
           <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.isPositive ? 'bg-emerald-50 text-emerald-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
             {trend.text}
           </span>
        )}
      </div>
      <div>
        <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
        <h3 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
        {subtext && <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{subtext}</p>}
      </div>
    </div>
  </div>
);

const AnalysisView: React.FC<AnalysisViewProps> = ({ data, onReset, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'list' | 'room'>('overview');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);
  
  // Track current layout selection for exports
  const [currentLayout, setCurrentLayout] = useState<LayoutFormat>(() => {
      return data.suggestedLayout;
  });

  // Filtering and Sorting State
  const [filterSegment, setFilterSegment] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const deferredSearchTerm = useDeferredValue(searchTerm); // Optimizes rendering for large lists
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination State
  const [listPage, setListPage] = useState(1);
  const [matchesPage, setMatchesPage] = useState(1);

  // OPTIMIZATION: Create a Map for O(1) participant lookup
  const participantMap = useMemo(() => {
    const map = new Map<string, Participant>();
    data.participants.forEach(p => map.set(p.id, p));
    return map;
  }, [data.participants]);

  // Reset pagination when filters change
  useEffect(() => {
    setListPage(1);
  }, [filterSegment, deferredSearchTerm, sortField, sortDirection]);

  useEffect(() => {
    setMatchesPage(1);
  }, [data]);

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedRows(newSet);
  };

  const handleLayoutChange = (layout: LayoutFormat) => {
      setCurrentLayout(layout);
  };

  // Build a comprehensive list of all recommended connections from the individual scores
  const allDerivedMatches = useMemo(() => {
    const matches: Array<{
      p1: Participant;
      p2: Participant;
      score: number;
      reason: string;
      type: ConnectionType;
      id: string; // Unique ID for key
    }> = [];

    data.individualScores.forEach(sourceScore => {
      const sourceParticipant = participantMap.get(sourceScore.participantId);
      if (sourceParticipant && sourceScore.recommendedConnections) {
        sourceScore.recommendedConnections.forEach(rec => {
          const targetParticipant = participantMap.get(rec.partnerId);
          if (targetParticipant) {
             matches.push({
               p1: sourceParticipant,
               p2: targetParticipant,
               score: rec.score,
               reason: rec.reason,
               type: rec.type,
               id: `${sourceParticipant.id}-${targetParticipant.id}`
             });
          }
        });
      }
    });

    // Sort by score descending
    return matches.sort((a, b) => b.score - a.score);
  }, [data.individualScores, participantMap]);

  // Processed Data for List View
  const processedList = useMemo(() => {
    let result = [...data.individualScores];

    // Search
    if (deferredSearchTerm) {
      const lowerTerm = deferredSearchTerm.toLowerCase();
      result = result.filter(score => {
         const p = participantMap.get(score.participantId);
         if (!p) return false;
         return p.name.toLowerCase().includes(lowerTerm) || p.company.toLowerCase().includes(lowerTerm);
      });
    }

    // Filter Segment
    if (filterSegment) {
      result = result.filter(score => {
        const p = participantMap.get(score.participantId);
        return p?.segment === filterSegment;
      });
    }

    // Sort
    result.sort((a, b) => {
      const pA = participantMap.get(a.participantId);
      const pB = participantMap.get(b.participantId);
      
      if (sortField === 'score') {
        return sortDirection === 'asc' ? a.score - b.score : b.score - a.score;
      } else {
        const nameA = pA?.name || '';
        const nameB = pB?.name || '';
        return sortDirection === 'asc' 
          ? nameA.localeCompare(nameB) 
          : nameB.localeCompare(nameA);
      }
    });

    return result;
  }, [data.individualScores, filterSegment, deferredSearchTerm, sortField, sortDirection, participantMap]);

  // Pagination Logic
  const paginatedList = processedList.slice(0, listPage * ITEMS_PER_PAGE);
  const hasMoreList = paginatedList.length < processedList.length;

  const paginatedMatches = allDerivedMatches.slice(0, matchesPage * ITEMS_PER_PAGE);
  const hasMoreMatches = paginatedMatches.length < allDerivedMatches.length;

  const uniqueSegments = useMemo(() => {
    return Array.from(new Set(data.participants.map(p => p.segment))).sort();
  }, [data.participants]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExportCSV = () => {
    const rows = allDerivedMatches.map(m => ({
        "Tipo": m.p1.isHost ? "HOST" : "CONVIDADO",
        "Nome (Origem)": m.p1.name,
        "Empresa (Origem)": m.p1.company,
        "Destino": m.p2.name,
        "Empresa Destino": m.p2.company,
        "Relação": m.type,
        "Score": m.score,
        "Motivo": m.reason
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Conexões");
    XLSX.writeFile(wb, "rampup_in_conexoes.xlsx");
  };

  const sortedIndividuals = useMemo(() => [...data.individualScores]
    .sort((a, b) => b.score - a.score)
    .map(score => {
      const p = participantMap.get(score.participantId);
      return {
        name: p?.name || 'Unknown',
        company: p?.company || 'Unknown',
        score: score.score,
        connections: score.potentialConnections
      };
    })
    .slice(0, 10), [data.individualScores, participantMap]);

  const sortedSegments = useMemo(() => [...data.segmentDistribution].sort((a, b) => b.value - a.value), [data.segmentDistribution]);
  const totalParticipants = data.participants.length;
  const isTargetMet = data.overallScore >= 75;

  // Chart Colors & Props
  const chartTextColor = isDarkMode ? '#D1D5DB' : '#4B5563'; 
  const chartGridColor = isDarkMode ? '#374151' : '#E5E7EB';
  const barColor = isDarkMode ? '#4ADE80' : '#10B981'; // Green instead of blue
  const barHighColor = isDarkMode ? '#68D391' : '#059669'; // Darker green for highlight

  return (
    <div className="animate-fade-in space-y-8 px-2 md:px-0">
      {/* Header / Navigation */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div>
          <button 
            onClick={onReset}
            className={`text-sm flex items-center mb-3 transition-colors font-medium ${isDarkMode ? 'text-gray-400 hover:text-verde-light' : 'text-gray-500 hover:text-emerald-600'}`}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Nova Análise
          </button>
          <div className="flex flex-col xl:flex-row xl:items-center gap-4">
            <h2 className={`text-2xl md:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard de Conexões</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportCSV}
                className={`self-start sm:self-auto flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border shadow-sm transition-all hover:-translate-y-0.5 ${
                  isDarkMode 
                    ? 'bg-chumbo-800 border-gray-700 text-verde-light hover:bg-chumbo-900' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Download className="w-3 h-3" />
                CSV/Excel
              </button>
            </div>
          </div>
          <p className={`text-sm md:text-base mt-2 max-w-2xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{data.summary}</p>
        </div>
        
        <div className={`flex p-1.5 rounded-xl self-start md:self-center overflow-x-auto max-w-full ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          {(['overview', 'matches', 'list', 'room'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? isDarkMode 
                    ? 'bg-chumbo-900 text-verde-light shadow-md' 
                    : 'bg-white text-emerald-600 shadow-sm' 
                  : isDarkMode
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'overview' && 'Visão Geral'}
              {tab === 'matches' && 'Top Conexões'}
              {tab === 'list' && 'Lista Completa'}
              {tab === 'room' && 'Mapa Sala'}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard 
                        title="Índice Geral (IN)" 
                        value={`${data.overallScore}%`} 
                        icon={TrendingUp}
                        isDarkMode={isDarkMode}
                        accentColor="bg-emerald-500"
                        trend={{ isPositive: isTargetMet, text: isTargetMet ? 'Alto Potencial' : 'Regular' }}
                    />
                    <MetricCard 
                        title="Participantes" 
                        value={totalParticipants} 
                        subtext={`${uniqueSegments.length} Segmentos`}
                        icon={Users}
                        isDarkMode={isDarkMode}
                        accentColor="bg-blue-500"
                    />
                    <MetricCard 
                        title="Conexões Chave" 
                        value={allDerivedMatches.filter(m => m.score >= 80).length} 
                        subtext="Acima de 80%"
                        icon={Link}
                        isDarkMode={isDarkMode}
                        accentColor="bg-purple-500"
                    />
                    <MetricCard 
                        title="Formato Ideal" 
                        value={formatLayoutName(currentLayout)} 
                        subtext="Layout sugerido"
                        icon={LayoutDashboard}
                        isDarkMode={isDarkMode}
                        accentColor="bg-orange-500"
                    />
                </div>

                {/* Analysis Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className={`p-6 md:p-8 rounded-2xl border shadow-lg transition-colors ${isDarkMode ? 'bg-chumbo-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <div>
                                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Top 10 Potencial</h3>
                                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Participantes com maior índice de conectividade</p>
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sortedIndividuals} layout="vertical">
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        width={120} 
                                        tick={{fontSize: 12, fill: chartTextColor, fontWeight: 500}} 
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24}>
                                        {sortedIndividuals.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.score > 80 ? barHighColor : barColor} />
                                        ))}
                                        <LabelList dataKey="score" position="right" formatter={(val: number) => `${val}%`} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className={`p-6 md:p-8 rounded-2xl border shadow-lg transition-colors ${isDarkMode ? 'bg-chumbo-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                        <h3 className="text-xl font-bold mb-6">Distribuição por Segmento</h3>
                        <div className="space-y-4">
                            {sortedSegments.slice(0, 6).map((s, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="truncate w-32">{s.name}</span>
                                        <span className="opacity-50">{s.value} pers.</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: `${(s.value / totalParticipants) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'matches' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                {paginatedMatches.map((match) => (
                    <div key={match.id} className={`p-5 rounded-xl border flex gap-5 transition-all hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${match.p1.isHost || match.p2.isHost ? 'ring-2 ring-amber-400/30' : ''}`}>
                        <div className="text-3xl font-bold w-20 shrink-0 flex flex-col items-center justify-center border-r pr-5">
                           {match.score}%
                           <span className="text-[10px] font-normal opacity-50 uppercase mt-1">Match</span>
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between gap-3 mb-2">
                              <div className="flex-1 truncate">
                                 <p className="font-bold text-sm truncate">{match.p1.name}</p>
                                 <p className="text-[10px] opacity-60 truncate">{match.p1.company}</p>
                              </div>
                              <ArrowRight className="w-4 h-4 opacity-20" />
                              <div className="flex-1 truncate text-right">
                                 <p className="font-bold text-sm truncate">{match.p2.name}</p>
                                 <p className="text-[10px] opacity-60 truncate">{match.p2.company}</p>
                              </div>
                           </div>
                           <div className="mb-2">
                             <ConnectionBadge type={match.type} />
                           </div>
                           <p className={`text-[11px] leading-relaxed p-3 rounded-lg italic ${isDarkMode ? 'bg-black/20 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                             "{match.reason}"
                           </p>
                        </div>
                    </div>
                ))}
                {hasMoreMatches && (
                    <div className="col-span-full text-center py-4">
                        <button 
                            onClick={() => setMatchesPage(prev => prev + 1)}
                            className={`px-6 py-2 rounded-lg font-bold text-sm border ${isDarkMode ? 'bg-gray-800 text-verde-light' : 'bg-white text-emerald-700'}`}
                        >
                            Carregar mais conexões
                        </button>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'list' && (
             <div className="space-y-4 animate-fade-in">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                   <div className={`flex-1 relative rounded-lg border focus-within:ring-1 focus-within:ring-emerald-500 ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                   }`}>
                      <Search className={`absolute left-3 top-3 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input 
                         type="text" 
                         placeholder="Buscar por nome ou empresa..."
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="w-full pl-10 pr-4 py-2.5 bg-transparent outline-none text-sm"
                      />
                   </div>
                   <div className="flex gap-2">
                       <button 
                         onClick={() => handleSort('score')}
                         className={`px-4 py-2 rounded-lg text-sm font-bold border flex items-center gap-2 ${
                            sortField === 'score' 
                             ? (isDarkMode ? 'bg-gray-700 text-verde-light' : 'bg-emerald-50 text-emerald-700')
                             : (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600')
                         }`}
                       >
                          Score {sortField === 'score' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}
                       </button>
                   </div>
                </div>

                {/* List Items */}
                <div className="grid grid-cols-1 gap-3">
                   {paginatedList.map((score, idx) => {
                      const p = participantMap.get(score.participantId);
                      if (!p) return null;
                      const isExpanded = expandedRows.has(p.id);

                      return (
                         <div 
                           key={score.participantId}
                           className={`rounded-xl border transition-all ${
                              isDarkMode 
                                ? 'bg-gray-800 border-gray-700' 
                                : 'bg-white border-gray-200'
                           } ${isExpanded ? 'ring-2 ring-emerald-500/50' : 'hover:shadow-sm'}`}
                         >
                            <div 
                              onClick={() => toggleRow(p.id)}
                              className="p-4 cursor-pointer flex items-center gap-4"
                            >
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm ${
                                  p.isHost 
                                  ? 'bg-amber-400 text-white'
                                  : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-emerald-100 text-emerald-700'
                               }`}>
                                  {p.isHost ? <Crown className="w-5 h-5" /> : ((listPage - 1) * ITEMS_PER_PAGE + idx + 1)}
                               </div>
                               <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                     <h4 className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{p.name}</h4>
                                     {p.isHost && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">HOST</span>}
                                  </div>
                                  <div className={`text-xs opacity-60 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{p.company} • {p.segment}</div>
                               </div>
                               <div className="text-right shrink-0">
                                  <div className={`text-xl font-bold font-mono ${isDarkMode ? 'text-verde-light' : 'text-emerald-600'}`}>
                                       {score.score}%
                                  </div>
                                  <div className="text-[10px] opacity-40 uppercase font-black tracking-tighter">Índice IN</div>
                               </div>
                               <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''} opacity-20`} />
                            </div>

                            {/* Expanded Connections Details */}
                            {isExpanded && (
                              <div className={`border-t px-4 py-4 ${isDarkMode ? 'bg-black/20' : 'bg-gray-50/50'}`}>
                                <h5 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2">Potenciais Sinergias</h5>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {score.recommendedConnections?.map((rec, i) => {
                                    const partner = participantMap.get(rec.partnerId);
                                    if (!partner) return null;
                                    return (
                                      <div key={i} className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                                         <div className="flex justify-between items-start mb-2">
                                            <div className="min-w-0">
                                              <p className="text-xs font-bold truncate">{partner.name}</p>
                                              <p className="text-[10px] opacity-50 truncate">{partner.company}</p>
                                            </div>
                                            <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rec.score >= 80 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{rec.score}%</div>
                                         </div>
                                         <div className="mb-2">
                                            <ConnectionBadge type={rec.type} />
                                         </div>
                                         <p className="text-[11px] leading-relaxed italic opacity-70">
                                              "{rec.reason}"
                                         </p>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                         </div>
                      );
                   })}
                   {hasMoreList && (
                       <div className="text-center py-4">
                           <button 
                               onClick={() => setListPage(prev => prev + 1)}
                               className={`px-6 py-2 rounded-lg font-bold text-sm border ${isDarkMode ? 'bg-gray-800 text-verde-light' : 'bg-white text-emerald-700'}`}
                           >
                               Carregar mais
                           </button>
                       </div>
                   )}
                </div>
             </div>
        )}

        {activeTab === 'room' && <SeatingView data={data} isDarkMode={isDarkMode} onLayoutChange={handleLayoutChange} />}
      </div>
    </div>
  );
};

export default AnalysisView;