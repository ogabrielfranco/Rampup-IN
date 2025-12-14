import React, { useState, useMemo, useDeferredValue, useEffect } from 'react';
import { AnalysisResult, Participant, IndividualScore } from '../types';
import SeatingView from './SeatingView';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  CartesianGrid, LabelList
} from 'recharts';
import { Users, TrendingUp, Link, ArrowLeft, ArrowRight, FileSpreadsheet, Filter, Info, ChevronUp, ChevronDown, Flame, List, Target, PieChart, Layers, Search, Building2, User, X, Briefcase, ExternalLink, Network, LayoutTemplate, LayoutDashboard, Crown, Download, ChevronRight } from 'lucide-react';

interface AnalysisViewProps {
  data: AnalysisResult;
  onReset: () => void;
  isDarkMode: boolean;
}

const COLORS = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#059669', '#047857', '#065F46', '#064E3B', '#68D391', '#9AE6B4'];
const DARK_COLORS = ['#4ADE80', '#68D391', '#81E6D9', '#4FD1C5', '#63B3ED', '#4299E1', '#90CDF4', '#F687B3', '#FBB6CE', '#FBD38D'];
const ITEMS_PER_PAGE = 20;

type SortField = 'score' | 'name';
type SortDirection = 'asc' | 'desc';

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

const ParticipantModal = ({ 
  participantId, 
  data, 
  onClose, 
  isDarkMode 
}: { 
  participantId: string | null, 
  data: AnalysisResult, 
  onClose: () => void, 
  isDarkMode: boolean 
}) => {
  if (!participantId) return null;

  const participant = data.participants.find(p => p.id === participantId);
  const scoreData = data.individualScores.find(s => s.participantId === participantId);

  if (!participant || !scoreData) return null;

  // Get recommendations enriched with participant details
  const recommendations = (scoreData.recommendedConnections || [])
    .map(rec => {
      const partner = data.participants.find(p => p.id === rec.partnerId);
      return { ...rec, partner };
    })
    .filter(rec => rec.partner) // ensure partner exists
    .sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className={`w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b flex justify-between items-start ${
          isDarkMode ? 'border-gray-800 bg-gray-800/50' : participant.isHost ? 'bg-amber-50 border-amber-100' : 'border-gray-100 bg-emerald-50/30'
        }`}>
          <div className="flex items-center gap-4">
             <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0 ${
                participant.isHost
                ? 'bg-amber-400 text-white shadow-lg shadow-amber-500/30 border-2 border-white'
                : isDarkMode ? 'bg-gray-800 border border-gray-700 text-verde-light' : 'bg-white border-2 border-emerald-100 text-emerald-600 shadow-sm'
             }`}>
                {participant.isHost ? <Crown className="w-6 h-6" /> : participant.name.substring(0,2).toUpperCase()}
             </div>
             <div className="min-w-0">
               <h2 className={`text-lg md:text-xl font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                 {participant.name}
                 {participant.isHost && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 align-middle">HOST</span>}
               </h2>
               <div className="flex flex-wrap items-center gap-2 mt-1">
                 <Building2 className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                 <span className={`text-sm truncate max-w-[150px] ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{participant.company}</span>
                 <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{participant.segment}</span>
               </div>
             </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="mb-6">
             <div className="flex items-center justify-between mb-2">
                <h3 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Índice de Potencial (IN)</h3>
                <span className={`text-2xl font-bold font-mono ${isDarkMode ? 'text-verde-light' : 'text-emerald-600'}`}>{scoreData.score}</span>
             </div>
             <div className={`p-3 rounded-lg text-sm italic ${isDarkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-emerald-50/50 text-emerald-800'}`}>
               "{scoreData.scoreReasoning}"
             </div>
          </div>

          <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Link className="w-4 h-4" />
            Conexões Sugeridas ({recommendations.length})
          </h3>

          <div className="space-y-3">
            {recommendations.length > 0 ? (
              recommendations.map((rec, idx) => (
                <div key={idx} className={`p-4 rounded-xl border transition-all ${
                  isDarkMode 
                    ? 'bg-gray-800/30 border-gray-700 hover:border-verde-light/30' 
                    : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md'
                }`}>
                  <div className="flex justify-between items-start">
                     <div className="min-w-0 pr-2">
                       <div className={`font-bold truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                         {rec.partner?.name}
                         {rec.partner?.isHost && <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-1 rounded border border-amber-200">HOST</span>}
                       </div>
                       <div className={`text-sm flex flex-wrap items-center gap-1.5 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                         <Briefcase className="w-3 h-3 shrink-0" />
                         <span className="truncate max-w-[120px]">{rec.partner?.company}</span>
                         <span className="text-xs opacity-50 mx-1 hidden sm:inline">•</span>
                         <span className={`text-xs px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>{rec.partner?.segment}</span>
                       </div>
                     </div>
                     <div className={`text-sm font-bold px-2 py-1 rounded shrink-0 ${
                       rec.score >= 80 
                        ? (isDarkMode ? 'bg-green-900/40 text-verde-light' : 'bg-emerald-50 text-emerald-700')
                        : (isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600')
                     }`}>
                       {rec.score}%
                     </div>
                  </div>
                  <div className={`mt-3 text-xs pt-3 border-t ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-gray-500'}`}>
                     <span className="font-semibold mr-1">Motivo:</span> {rec.reason}
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Nenhuma conexão específica de alto valor encontrada, mas o networking geral é incentivado.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalysisView: React.FC<AnalysisViewProps> = ({ data, onReset, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'list' | 'room'>('overview');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
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

  // Build a comprehensive list of all recommended connections from the individual scores
  const allDerivedMatches = useMemo(() => {
    const matches: Array<{
      p1: Participant;
      p2: Participant;
      score: number;
      reason: string;
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
    const headers = [
      "Tipo", "Nome (Origem)", "Empresa (Origem)", "Segmento (Origem)", 
      "Nome (Destino)", "Empresa (Destino)", "Segmento (Destino)", 
      "Score de Conexão", "Motivo da Sinergia"
    ];
    
    let csvContent = headers.map(h => `"${h}"`).join(",") + "\n";

    data.individualScores.forEach(sourceScore => {
      const sourceParticipant = participantMap.get(sourceScore.participantId);
      if (sourceParticipant) {
        // Check if there are recommendations
        if (sourceScore.recommendedConnections && sourceScore.recommendedConnections.length > 0) {
          sourceScore.recommendedConnections.forEach(conn => {
            const targetParticipant = participantMap.get(conn.partnerId);
            if (targetParticipant) {
               const row = [
                 sourceParticipant.isHost ? "HOST" : "CONVIDADO",
                 sourceParticipant.name,
                 sourceParticipant.company,
                 sourceParticipant.segment,
                 targetParticipant.name,
                 targetParticipant.company,
                 targetParticipant.segment,
                 conn.score.toString(),
                 conn.reason
               ].map(field => `"${(field || '').replace(/"/g, '""')}"`); // Escape quotes in content
               csvContent += row.join(",") + "\n";
            }
          });
        } else {
            // Include participants with no high-value connections so they appear in the report
             const row = [
                 sourceParticipant.isHost ? "HOST" : "CONVIDADO",
                 sourceParticipant.name,
                 sourceParticipant.company,
                 sourceParticipant.segment,
                 "-",
                 "-",
                 "-",
                 "-",
                 "Sem conexões diretas de alta prioridade identificadas."
             ].map(field => `"${(field || '').replace(/"/g, '""')}"`);
             csvContent += row.join(",") + "\n";
        }
      }
    });

    // Add BOM for Excel UTF-8 compatibility
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "conexoes_rampup_in.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
  
  const targetPercentage = 70; // UPDATED to 70%
  const isTargetMet = data.overallScore >= targetPercentage;

  // Chart Colors & Props
  const chartTextColor = isDarkMode ? '#D1D5DB' : '#4B5563'; 
  const chartGridColor = isDarkMode ? '#374151' : '#E5E7EB';
  const barColor = isDarkMode ? '#4ADE80' : '#10B981'; // Green instead of blue
  const barHighColor = isDarkMode ? '#68D391' : '#059669'; // Darker green for highlight

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

  return (
    <div className="animate-fade-in space-y-8 px-2 md:px-0">
      {/* Modal for Participant Details */}
      <ParticipantModal 
        participantId={selectedParticipantId} 
        data={data} 
        onClose={() => setSelectedParticipantId(null)} 
        isDarkMode={isDarkMode} 
      />

      {/* Header / Navigation */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div>
          <button 
            onClick={onReset}
            className={`text-sm flex items-center mb-3 transition-colors font-medium ${isDarkMode ? 'text-gray-400 hover:text-verde-light' : 'text-gray-500 hover:text-emerald-600'}`}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Nova Análise
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className={`text-2xl md:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard de Conexões</h2>
            <button
              onClick={handleExportCSV}
              className={`self-start sm:self-auto flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border shadow-sm transition-all hover:-translate-y-0.5 ${
                isDarkMode 
                  ? 'bg-chumbo-800 border-gray-700 text-verde-light hover:bg-chumbo-900' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Download className="w-3 h-3" />
              Exportar Tabela (Excel/Sheets)
            </button>
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
              {tab === 'room' && 'Mapa de Sala'}
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
                        subtext={isTargetMet ? "Alta Sinergia Identificada" : "Sinergia Moderada (Meta: 70%)"}
                        icon={TrendingUp}
                        isDarkMode={isDarkMode}
                        accentColor="bg-emerald-500"
                        trend={{ isPositive: isTargetMet, text: isTargetMet ? 'Alto Potencial' : 'Regular' }}
                    />
                    <MetricCard 
                        title="Participantes" 
                        value={totalParticipants} 
                        subtext={`${uniqueSegments.length} Segmentos distintos`}
                        icon={Users}
                        isDarkMode={isDarkMode}
                        accentColor="bg-blue-500"
                    />
                    <MetricCard 
                        title="Conexões Chave" 
                        value={allDerivedMatches.filter(m => m.score >= 80).length} 
                        subtext="Matches acima de 80%"
                        icon={Link}
                        isDarkMode={isDarkMode}
                        accentColor="bg-purple-500"
                    />
                    <MetricCard 
                        title="Formato Ideal" 
                        value={formatLayoutName(data.suggestedLayout)} 
                        subtext="Baseado no perfil do grupo"
                        icon={LayoutTemplate}
                        isDarkMode={isDarkMode}
                        accentColor="bg-orange-500"
                    />
                </div>

                {/* Analysis Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top 10 Individuals Chart (Restored) */}
                    <div className={`p-6 md:p-8 rounded-2xl border shadow-lg transition-colors ${isDarkMode ? 'bg-chumbo-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <div>
                                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Top 10 Potencial</h3>
                                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Participantes com maior índice de conectividade</p>
                            </div>
                            <button 
                                onClick={() => setActiveTab('list')} 
                                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-all ${
                                    isDarkMode 
                                    ? 'bg-gray-800 text-verde-light hover:bg-gray-700' 
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                            >
                                <List className="w-3 h-3" />
                                Ver Lista
                            </button>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sortedIndividuals} layout="vertical" margin={{ top: 10, right: 50, left: 40, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={chartGridColor} opacity={0.3} />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        width={120} 
                                        tick={{fontSize: 12, fill: chartTextColor, fontWeight: 500}} 
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                                    <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24} animationDuration={1500}>
                                        {sortedIndividuals.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.score > 80 ? barHighColor : barColor} />
                                        ))}
                                        <LabelList 
                                            dataKey="score" 
                                            position="right" 
                                            formatter={(val: number) => `${val}%`} 
                                            fill={isDarkMode ? '#E5E7EB' : '#374151'}
                                            fontSize={12}
                                            fontWeight="bold"
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Segment Distribution Cards (Restored Grid Layout) */}
                    <div className={`p-6 md:p-8 rounded-2xl border shadow-lg transition-colors ${isDarkMode ? 'bg-chumbo-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                        <div className="mb-8">
                            <div className="flex items-center gap-2">
                                <Layers className={`w-5 h-5 ${isDarkMode ? 'text-verde-light' : 'text-emerald-600'}`} />
                                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Distribuição por Segmento</h3>
                            </div>
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Diversidade de nichos no evento</p>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                            {sortedSegments.map((segment, idx) => {
                                const percentage = Math.round((segment.value / totalParticipants) * 100);
                                return (
                                    <div 
                                        key={idx} 
                                        className={`p-4 rounded-xl border transition-all hover:scale-[1.02] flex flex-col justify-between h-28 ${
                                        isDarkMode 
                                            ? 'bg-gray-800/50 border-gray-700 hover:border-verde-light/50' 
                                            : 'bg-gray-50 border-gray-200 hover:border-emerald-300'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {segment.value}
                                            </span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600 border border-gray-200'
                                            }`}>
                                            {percentage}%
                                            </span>
                                        </div>
                                        <p className={`text-xs font-medium line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {segment.name}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'matches' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                {paginatedMatches.map((match, idx) => (
                    <div key={match.id} className={`p-4 rounded-xl border flex items-start gap-4 transition-all hover:shadow-md ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                        <div className={`text-2xl font-bold flex flex-col items-center justify-center w-16 shrink-0 ${
                             match.score >= 90 ? (isDarkMode ? 'text-verde-neon' : 'text-emerald-600') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
                        }`}>
                           {match.score}%
                           <span className="text-[9px] font-normal opacity-70">Sinergia</span>
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                 <p className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{match.p1.name}</p>
                                 <p className={`text-xs truncate opacity-70 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{match.p1.company}</p>
                              </div>
                              <ArrowRight className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                              <div className="flex-1 min-w-0 text-right">
                                 <p className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{match.p2.name}</p>
                                 <p className={`text-xs truncate opacity-70 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{match.p2.company}</p>
                              </div>
                           </div>
                           <p className={`text-xs italic p-2 rounded ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                             "{match.reason}"
                           </p>
                        </div>
                    </div>
                ))}
                {allDerivedMatches.length === 0 && (
                    <div className={`col-span-full py-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Nenhuma conexão forte encontrada automaticamente.
                    </div>
                )}
                {hasMoreMatches && (
                    <div className="col-span-full text-center py-4">
                        <button 
                            onClick={() => setMatchesPage(prev => prev + 1)}
                            className={`px-6 py-2 rounded-lg font-bold text-sm border transition-all ${
                                isDarkMode 
                                ? 'bg-gray-800 text-verde-light border-gray-700 hover:bg-gray-700' 
                                : 'bg-white text-emerald-700 border-gray-200 hover:bg-gray-50'
                            }`}
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
                       <select 
                           value={filterSegment}
                           onChange={(e) => setFilterSegment(e.target.value)}
                           className={`px-4 py-2 rounded-lg text-sm border outline-none ${
                               isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'
                           }`}
                       >
                           <option value="">Todos os Segmentos</option>
                           {uniqueSegments.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                       <button 
                         onClick={() => handleSort('score')}
                         className={`px-4 py-2 rounded-lg text-sm font-bold border flex items-center gap-2 ${
                            sortField === 'score' 
                             ? (isDarkMode ? 'bg-gray-700 text-verde-light border-gray-600' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                             : (isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-white text-gray-600 border-gray-200')
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
                           } ${isExpanded ? 'ring-2 ring-emerald-500/50' : 'hover:shadow-md'}`}
                         >
                            <div 
                              onClick={() => toggleRow(p.id)}
                              className="p-4 cursor-pointer flex items-center gap-4"
                            >
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                  p.isHost 
                                  ? 'bg-amber-400 text-white border border-white shadow'
                                  : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-emerald-100 text-emerald-700'
                               }`}>
                                  {p.isHost ? <Crown className="w-5 h-5" /> : ((listPage - 1) * ITEMS_PER_PAGE + idx + 1)}
                               </div>
                               <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                     <h4 className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{p.name}</h4>
                                     {p.isHost && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">HOST</span>}
                                  </div>
                                  <div className={`flex items-center gap-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                     <span className="truncate max-w-[150px] flex items-center gap-1"><Building2 className="w-3 h-3"/> {p.company}</span>
                                     <span className="hidden sm:inline text-xs">•</span>
                                     <span className="truncate max-w-[150px]">{p.segment}</span>
                                  </div>
                               </div>
                               <div className="text-right shrink-0 flex items-center gap-3">
                                  <div>
                                    <div className={`text-xl font-bold font-mono ${isDarkMode ? 'text-verde-light' : 'text-emerald-600'}`}>
                                       {score.score}
                                    </div>
                                    <div className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                       Índice IN
                                    </div>
                                  </div>
                                  <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''} ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                               </div>
                            </div>

                            {/* Expanded Connections Details */}
                            {isExpanded && (
                              <div className={`border-t px-4 py-4 ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
                                <h5 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <Link className="w-3 h-3" /> Potenciais Conexões ({score.recommendedConnections?.length || 0})
                                </h5>
                                
                                <div className="space-y-2">
                                  {score.recommendedConnections?.map((rec, i) => {
                                    const partner = participantMap.get(rec.partnerId);
                                    if (!partner) return null;
                                    return (
                                      <div key={i} className={`p-3 rounded-lg border flex items-start gap-3 ${
                                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                      }`}>
                                         <div className={`text-sm font-bold w-10 text-center shrink-0 py-1 rounded ${
                                           rec.score >= 80 
                                            ? (isDarkMode ? 'bg-green-900/30 text-verde-light' : 'bg-green-50 text-green-700')
                                            : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')
                                         }`}>
                                            {rec.score}%
                                         </div>
                                         <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                              <div>
                                                <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                  {partner.name}
                                                </p>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                  {partner.company} • {partner.segment}
                                                </p>
                                              </div>
                                            </div>
                                            <p className={`text-xs mt-1.5 italic ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                              "{rec.reason}"
                                            </p>
                                         </div>
                                      </div>
                                    )
                                  })}
                                  {(!score.recommendedConnections || score.recommendedConnections.length === 0) && (
                                    <div className="text-center text-xs opacity-50 py-2">Sem conexões diretas de alto valor identificadas.</div>
                                  )}
                                </div>
                              </div>
                            )}
                         </div>
                      );
                   })}
                   {processedList.length === 0 && (
                      <div className="py-12 text-center opacity-50">Nenhum participante encontrado com os filtros atuais.</div>
                   )}
                   {hasMoreList && (
                       <div className="text-center py-4">
                           <button 
                               onClick={() => setListPage(prev => prev + 1)}
                               className={`px-6 py-2 rounded-lg font-bold text-sm border transition-all ${
                                   isDarkMode 
                                   ? 'bg-gray-800 text-verde-light border-gray-700 hover:bg-gray-700' 
                                   : 'bg-white text-emerald-700 border-gray-200 hover:bg-gray-50'
                               }`}
                           >
                               Carregar mais participantes
                           </button>
                       </div>
                   )}
                </div>
             </div>
        )}

        {activeTab === 'room' && (
           <SeatingView data={data} isDarkMode={isDarkMode} />
        )}
      </div>
    </div>
  );
};

export default AnalysisView;