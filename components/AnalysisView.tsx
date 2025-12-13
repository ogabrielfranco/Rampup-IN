import React, { useState, useMemo, useDeferredValue } from 'react';
import { AnalysisResult, Participant, IndividualScore } from '../types';
import SeatingView from './SeatingView';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  CartesianGrid, LabelList
} from 'recharts';
import { Users, TrendingUp, Link, ArrowLeft, FileSpreadsheet, Filter, Info, ChevronUp, ChevronDown, Flame, List, Target, PieChart, Layers, Search, Building2, User, X, Briefcase, ExternalLink, Network, LayoutTemplate, LayoutDashboard } from 'lucide-react';

interface AnalysisViewProps {
  data: AnalysisResult;
  onReset: () => void;
  isDarkMode: boolean;
}

const COLORS = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#059669', '#047857', '#065F46', '#064E3B', '#68D391', '#9AE6B4'];
const DARK_COLORS = ['#4ADE80', '#68D391', '#81E6D9', '#4FD1C5', '#63B3ED', '#4299E1', '#90CDF4', '#F687B3', '#FBB6CE', '#FBD38D'];

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
        <div className={`p-6 border-b flex justify-between items-start ${isDarkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-emerald-50/30'}`}>
          <div className="flex items-center gap-4">
             <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${
                isDarkMode ? 'bg-gray-800 border border-gray-700 text-verde-light' : 'bg-white border-2 border-emerald-100 text-emerald-600 shadow-sm'
             }`}>
                {participant.name.substring(0,2).toUpperCase()}
             </div>
             <div>
               <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{participant.name}</h2>
               <div className="flex items-center gap-2 mt-1">
                 <Building2 className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                 <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{participant.company}</span>
                 <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{participant.segment}</span>
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
                     <div>
                       <div className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{rec.partner?.name}</div>
                       <div className={`text-sm flex items-center gap-1.5 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                         <Briefcase className="w-3 h-3" />
                         {rec.partner?.company}
                         <span className="text-xs opacity-50 mx-1">•</span>
                         <span className={`text-xs px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>{rec.partner?.segment}</span>
                       </div>
                     </div>
                     <div className={`text-sm font-bold px-2 py-1 rounded ${
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
  
  // Filtering and Sorting State
  const [filterSegment, setFilterSegment] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const deferredSearchTerm = useDeferredValue(searchTerm); // Optimizes rendering for large lists
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const getParticipant = (id: string): Participant | undefined => {
    return data.participants.find(p => p.id === id);
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

    // Pre-map participants for O(1) lookup
    const participantMap = new Map<string, Participant>();
    data.participants.forEach(p => participantMap.set(p.id, p));

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
  }, [data]);

  // Processed Data for List View
  const processedList = useMemo(() => {
    let result = [...data.individualScores];

    // Search
    if (deferredSearchTerm) {
      const lowerTerm = deferredSearchTerm.toLowerCase();
      result = result.filter(score => {
         const p = getParticipant(score.participantId);
         if (!p) return false;
         return p.name.toLowerCase().includes(lowerTerm) || p.company.toLowerCase().includes(lowerTerm);
      });
    }

    // Filter Segment
    if (filterSegment) {
      result = result.filter(score => {
        const p = getParticipant(score.participantId);
        return p?.segment === filterSegment;
      });
    }

    // Sort
    result.sort((a, b) => {
      const pA = getParticipant(a.participantId);
      const pB = getParticipant(b.participantId);

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
  }, [data.individualScores, filterSegment, deferredSearchTerm, sortField, sortDirection]);

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
      "Nome (Origem)", "Empresa (Origem)", "Segmento (Origem)", 
      "Nome (Destino)", "Empresa (Destino)", "Segmento (Destino)", 
      "Score de Conexão", "Motivo da Sinergia"
    ];
    
    let csvContent = headers.map(h => `"${h}"`).join(",") + "\n";

    data.individualScores.forEach(sourceScore => {
      const sourceParticipant = getParticipant(sourceScore.participantId);
      if (sourceParticipant) {
        // Check if there are recommendations
        if (sourceScore.recommendedConnections && sourceScore.recommendedConnections.length > 0) {
          sourceScore.recommendedConnections.forEach(conn => {
            const targetParticipant = getParticipant(conn.partnerId);
            if (targetParticipant) {
               const row = [
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
      const p = getParticipant(score.participantId);
      return {
        name: p?.name || 'Unknown',
        company: p?.company || 'Unknown',
        score: score.score,
        connections: score.potentialConnections
      };
    })
    .slice(0, 10), [data.individualScores]);

  const sortedSegments = useMemo(() => [...data.segmentDistribution].sort((a, b) => b.value - a.value), [data.segmentDistribution]);
  const totalParticipants = data.participants.length;
  
  const targetPercentage = 65;
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
    <div className="animate-fade-in space-y-8">
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
            <h2 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard de Conexões</h2>
            <button
              onClick={handleExportCSV}
              className={`self-start sm:self-auto flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border shadow-sm transition-all hover:-translate-y-0.5 ${
                isDarkMode 
                  ? 'bg-chumbo-800 border-gray-700 text-verde-light hover:bg-chumbo-900' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileSpreadsheet className="w-3 h-3" />
              Exportar para Planilha (CSV)
            </button>
          </div>
          <p className={`text-base mt-2 max-w-2xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{data.summary}</p>
        </div>
        
        <div className={`flex p-1.5 rounded-xl self-start md:self-center overflow-x-auto ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          {(['overview', 'matches', 'room', 'list'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? isDarkMode 
                    ? 'bg-chumbo-900 text-verde-light shadow-md' 
                    : 'bg-white text-emerald-600 shadow-sm' 
                  : isDarkMode
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab === 'overview' && 'Visão Geral'}
              {tab === 'matches' && 'Conexões'}
              {tab === 'room' && 'Mapa de Sala'}
              {tab === 'list' && 'Participantes'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top Metrics Cards - Modern Card Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard 
              title="Índice Geral (IN)"
              value={`${data.overallScore}%`}
              subtext={`Meta: ${targetPercentage}%`}
              icon={TrendingUp}
              isDarkMode={isDarkMode}
              accentColor={isTargetMet ? (isDarkMode ? 'bg-verde-neon' : 'bg-emerald-500') : (isDarkMode ? 'bg-yellow-400' : 'bg-yellow-500')}
              trend={{
                isPositive: isTargetMet,
                text: isTargetMet ? 'Meta Atingida' : 'Abaixo da Meta'
              }}
            />
            
            <MetricCard 
              title="Total de Participantes"
              value={data.participants.length}
              subtext="Empresários analisados"
              icon={Users}
              isDarkMode={isDarkMode}
              accentColor={isDarkMode ? 'bg-blue-400' : 'bg-gray-500'}
            />
            
            {/* Metric Changed: Suggested Layout */}
            <MetricCard 
              title="Estilo de Mapa Sugerido"
              value={formatLayoutName(data.suggestedLayout)}
              subtext="Melhor formato para interação"
              icon={LayoutDashboard}
              isDarkMode={isDarkMode}
              accentColor={isDarkMode ? 'bg-purple-400' : 'bg-indigo-500'}
            />
          </div>

          {/* Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Individuals Chart */}
            <div className={`p-8 rounded-2xl border shadow-lg transition-colors ${isDarkMode ? 'bg-chumbo-900 border-gray-800' : 'bg-white border-gray-100'}`}>
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
                  Ver Lista Completa
                </button>
              </div>
              <div className="h-[400px] w-full">
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

            {/* Segment Distribution - New Card Grid Layout */}
            <div className={`p-8 rounded-2xl border shadow-lg transition-colors ${isDarkMode ? 'bg-chumbo-900 border-gray-800' : 'bg-white border-gray-100'}`}>
              <div className="mb-8">
                 <div className="flex items-center gap-2">
                    <Layers className={`w-5 h-5 ${isDarkMode ? 'text-verde-light' : 'text-emerald-600'}`} />
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Distribuição por Segmento</h3>
                 </div>
                 <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Diversidade de nichos no evento</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
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

      {/* Matches Tab - Updated to show ALL connections */}
      {activeTab === 'matches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {allDerivedMatches.length > 0 ? (
            allDerivedMatches.map((match) => {
            const { p1, p2, score, reason, id } = match;
            const isHighMatch = score >= 90;

            return (
              <div key={id} className={`group p-6 rounded-2xl border shadow-sm hover:shadow-xl transition-all relative overflow-hidden ${
                isDarkMode 
                  ? 'bg-chumbo-900 border-gray-800 hover:bg-gray-800/80' 
                  : 'bg-white border-gray-100 hover:border-emerald-200'
              }`}>
                {/* Visual Indicator Line */}
                <div className={`absolute top-0 left-0 w-1.5 h-full transition-all group-hover:w-2.5 ${
                  isHighMatch 
                    ? (isDarkMode ? 'bg-verde-neon shadow-[0_0_15px_rgba(74,222,128,0.6)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]') 
                    : (isDarkMode ? 'bg-blue-400' : 'bg-gray-300')
                }`}></div>
                
                <div className="flex justify-between items-center mb-6 pl-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      isHighMatch 
                        ? (isDarkMode ? 'bg-green-900/60 text-verde-light border-green-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200') 
                        : (isDarkMode ? 'bg-blue-900/40 text-blue-300 border-blue-800' : 'bg-gray-100 text-gray-600 border-gray-200')
                    }`}>
                      {score}% Sinergia
                    </span>
                    {/* Fire Icon for > 90% */}
                    {isHighMatch && (
                      <div className="flex items-center gap-1 text-xs font-bold text-orange-500 animate-pulse-slow">
                        <Flame className="w-4 h-4 fill-current" />
                        <span>Hot Match</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-4 pl-3 relative">
                  {/* Connector Line */}
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[2px] ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-base truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{p1.name}</p>
                    <p className={`text-xs mt-1 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{p1.company}</p>
                    <p className={`text-xs mt-0.5 inline-block px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>{p1.segment}</p>
                  </div>
                  
                  <div className={`z-10 flex-shrink-0 p-2 rounded-full ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white border text-gray-400 shadow-sm'}`}>
                    <Link className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0 text-right">
                    <p className={`font-bold text-base truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{p2.name}</p>
                    <p className={`text-xs mt-1 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{p2.company}</p>
                    <p className={`text-xs mt-0.5 inline-block px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>{p2.segment}</p>
                  </div>
                </div>

                <div className={`mt-6 pt-4 ml-3 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-50'}`}>
                   <div className="flex gap-2 items-start">
                    <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`text-sm italic leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>"{reason}"</p>
                   </div>
                </div>
              </div>
            );
          })) : (
             <div className="col-span-full py-12 text-center text-gray-500">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Link className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Nenhuma conexão de alta relevância encontrada</h3>
                <p>Tente adicionar participantes de segmentos mais complementares.</p>
             </div>
          )}
        </div>
      )}

      {/* Room Map Tab */}
      {activeTab === 'room' && (
        <SeatingView data={data} isDarkMode={isDarkMode} />
      )}

      {/* List Tab */}
      {activeTab === 'list' && (
        <div className={`rounded-2xl shadow-xl border overflow-hidden animate-fade-in ${isDarkMode ? 'bg-chumbo-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          {/* Controls Bar */}
          <div className={`p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
               {/* Search Bar */}
               <div className={`relative flex-1 sm:min-w-[280px] group`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nome ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border outline-none focus:ring-2 transition-all ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-verde-light focus:ring-verde-light/20' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20'
                  }`}
                />
              </div>

              {/* Segment Filter */}
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                  <Filter className="h-4 w-4" />
                </div>
                <select 
                  value={filterSegment}
                  onChange={(e) => setFilterSegment(e.target.value)}
                  className={`block w-full pl-10 pr-8 py-2.5 text-sm rounded-xl border outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-verde-light focus:ring-verde-light/20' 
                      : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500/20'
                  }`}
                >
                  <option value="">Todos os Segmentos</option>
                  {uniqueSegments.map(seg => (
                    <option key={seg} value={seg}>{seg}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            <div className={`text-sm font-medium px-4 py-2 rounded-full border ${isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-600 border-gray-200'}`}>
              <span className="font-bold mr-1">{processedList.length}</span> resultados
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full text-left text-sm border-collapse`}>
              <thead>
                <tr className={`${isDarkMode ? 'bg-gray-900/80 text-gray-400' : 'bg-gray-50 text-gray-500'} text-xs uppercase tracking-wider font-semibold`}>
                  <th className="px-8 py-5 cursor-pointer hover:text-white transition" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1.5">
                      Empresário
                      {sortField === 'name' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="px-6 py-5">Empresa</th>
                  <th className="px-6 py-5">Segmento</th>
                  <th className="px-6 py-5 text-center cursor-pointer hover:text-white transition" onClick={() => handleSort('score')}>
                    <div className="flex items-center justify-center gap-1.5">
                      Score (IN)
                      {sortField === 'score' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="px-6 py-5 text-center">Classificação</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                {processedList.map((score, index) => {
                  const p = getParticipant(score.participantId);
                  if (!p) return null;
                  
                  // Generate initials
                  const initials = p.name
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr 
                      key={score.participantId} 
                      onClick={() => setSelectedParticipantId(score.participantId)}
                      className={`group transition-all duration-200 cursor-pointer ${
                        isDarkMode 
                          ? 'hover:bg-gray-800/60' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-colors ${
                              isDarkMode 
                                ? 'bg-gray-800 text-gray-300 border border-gray-700 group-hover:border-verde-light group-hover:text-verde-light' 
                                : 'bg-white text-gray-600 border border-gray-200 group-hover:border-emerald-200 group-hover:text-emerald-700'
                           }`}>
                             {initials}
                           </div>
                           <div className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                             {p.name}
                           </div>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Building2 className={`w-3.5 h-3.5 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{p.company}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                          isDarkMode 
                            ? 'bg-gray-800 text-gray-400 border-gray-700' 
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}>
                          {p.segment}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2 group/score relative">
                          <span className={`text-base font-bold font-mono ${
                            score.score > 80 
                              ? (isDarkMode ? 'text-verde-light' : 'text-emerald-600') 
                              : score.score < 50 
                                ? (isDarkMode ? 'text-red-400' : 'text-red-600') 
                                : (isDarkMode ? 'text-blue-400' : 'text-gray-600')
                          }`}>
                            {score.score}
                          </span>
                          
                          {/* Info Icon */}
                          <Info className={`w-4 h-4 opacity-0 group-hover/tr:opacity-30 group-hover/score:opacity-100 transition-opacity ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                          
                          {/* Tooltip */}
                          <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 rounded-xl shadow-xl border text-xs z-50 pointer-events-none opacity-0 group-hover/score:opacity-100 transition-all transform translate-y-2 group-hover/score:translate-y-0 ${
                            isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'
                          }`}>
                            <p className="font-semibold mb-1 border-b pb-1 border-opacity-10 border-current">Análise de Potencial</p>
                            {score.scoreReasoning || "Calculado com base na sinergia geral com os demais participantes."}
                            <div className={`absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent ${isDarkMode ? 'border-t-gray-800' : 'border-t-white'}`}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {score.score > 80 ? (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                            isDarkMode 
                              ? 'bg-green-900/30 text-verde-light border border-green-900' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            Alta Conexão
                          </span>
                        ) : score.score < 50 ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            isDarkMode 
                              ? 'bg-red-900/30 text-red-300 border border-red-900' 
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            Baixa
                          </span>
                        ) : (
                           <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                             isDarkMode 
                              ? 'bg-gray-800 text-gray-400 border border-gray-700' 
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                           }`}>
                            Média
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisView;