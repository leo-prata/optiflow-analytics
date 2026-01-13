import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Activity, Clock, Plus, Database, AlertCircle 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { dashboardApi } from '../../services/api';
import styles from './Dashboard.module.css';

interface Project {
  id: string;
  filename: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  result?: {
    feasible: boolean;
    result: number;
    time?: number;
  }; 
  logs?: string;
  createdAt: string;
}

const COLORS = {
  success: '#ccff00',
  pending: '#00f0ff',
  failed: '#ff4d4d',
  bg: '#111',
  grid: '#333'
};

export function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [chartData, setChartData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    try {
      const response = await dashboardApi.get('/results');
      const data: Project[] = response.data;
      
      setProjects(data);
      processAnalytics(data);
    } catch (error) {
      console.error("Erro ao buscar dados reais:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (data: Project[]) => {
    const completed = data
      .filter(p => p.status === 'COMPLETED' && p.result)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(p => ({
        name: `#${p.id.slice(0, 4)}`,
        lucro: p.result?.result || 0,
        data: new Date(p.createdAt).toLocaleDateString()
      }));
    setChartData(completed);

    const stats = {
      completed: data.filter(p => p.status === 'COMPLETED').length,
      pending: data.filter(p => p.status === 'PENDING').length,
      failed: data.filter(p => p.status === 'FAILED').length,
    };
    setStatusData([
      { name: 'Sucesso', value: stats.completed, color: COLORS.success },
      { name: 'Processando', value: stats.pending, color: COLORS.pending },
      { name: 'Falha', value: stats.failed, color: COLORS.failed },
    ]);
  };

  const totalProfit = projects.reduce((acc, curr) => acc + (curr.result?.result || 0), 0);
  const successRate = projects.length > 0 
    ? Math.round((projects.filter(p => p.status === 'COMPLETED').length / projects.length) * 100) 
    : 0;

  return (
    <div className={styles.container}>
      
      <header className={styles.header}>
        <div>
          <span className={styles.subTitle}>ANÁLISE DE DADOS EM TEMPO REAL</span>
          <h1 className={styles.pageTitle}>Dashboard Analítico</h1>
        </div>
      </header>

      <div className={styles.kpiGrid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Valor Otimizado Acumulado</div>
          <div className={styles.cardValue} style={{ color: COLORS.success }}>
            {totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className={styles.cardTrend}>
            <Database size={14} style={{ color: COLORS.success }}/> 
            <span style={{color: '#888', marginLeft: 5}}>Extraído do PostgreSQL</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>Taxa de Sucesso</div>
          <div className={styles.cardValue} style={{ color: COLORS.pending }}>
            {successRate}%
          </div>
          <div className={styles.cardTrend}>
            <Activity size={14} style={{ color: COLORS.pending }}/>
            <span style={{color: '#888', marginLeft: 5}}>Saúde do Sistema</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>Total de Otimizações</div>
          <div className={styles.cardValue} style={{ color: '#fff' }}>{projects.length}</div>
          <div className={styles.cardTrend}>
            <Clock size={14} color="#fff"/>
            <span style={{color: '#888', marginLeft: 5}}>Última atualização: Agora</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 30 }}>
        
        <div className={styles.card} style={{ height: 350 }}>
          <div className={styles.cardLabel}>Tendência de Otimização (Histórico de Resultados)</div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
              <XAxis dataKey="name" stroke="#666" tick={{fontSize: 10}} />
              <YAxis stroke="#666" tick={{fontSize: 10}} />
              <Tooltip 
                contentStyle={{backgroundColor: '#000', borderColor: '#333', color: '#fff'}}
                itemStyle={{color: COLORS.success}}
              />
              <Area 
                type="monotone" 
                dataKey="lucro" 
                stroke={COLORS.success} 
                fillOpacity={1} 
                fill="url(#colorLucro)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.card} style={{ height: 350 }}>
          <div className={styles.cardLabel}>Distribuição de Status</div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333'}} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>Log de Execuções (Banco de Dados)</div>
        
        <div className={styles.listHeader}>
          <div className={styles.colId}>ID</div>
          <div className={styles.colName}>Arquivo</div>
          <div className={styles.colStatus}>Status</div>
          <div className={styles.colResult}>Resultado</div>
          <div className={styles.colDate}>Criado em</div>
        </div>

        {loading ? (
          <div style={{padding: 40, textAlign: 'center', color: '#666'}}>Carregando dados reais...</div>
        ) : projects.length === 0 ? (
          <div style={{padding: 40, textAlign: 'center', color: '#666', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
             <AlertCircle size={32} />
             <span>Nenhum dado encontrado no banco. Faça um upload!</span>
          </div>
        ) : (
          projects.map((proj) => (
            <div 
                key={proj.id} 
                className={styles.dataRow}
                onClick={() => navigate(`/project/${proj.id}`)}
                style={{ cursor: 'pointer' }}
            >
              <div className={styles.colId}>#{proj.id}</div>
              <div className={styles.colName}>{proj.filename}</div>
              
              <div className={styles.colStatus}>
                <span className={`${styles.tag} ${
                  proj.status === 'COMPLETED' ? styles.tagSuccess : 
                  proj.status === 'FAILED' ? styles.tagFailed : styles.tagPending
                }`}>
                  {proj.status === 'COMPLETED' ? 'SUCESSO' : 
                   proj.status === 'FAILED' ? 'FALHA' : 'FILA'}
                </span>
              </div>

              <div className={styles.colResult}>
                {proj.result ? proj.result.result.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
              </div>
              
              <div className={styles.colDate}>
                {new Date(proj.createdAt).toLocaleString('pt-BR')}
              </div>
            </div>
          ))
        )}
      </div>

      <button className={styles.fab} onClick={() => navigate('/new')} title="Novo Projeto">
        <Plus size={28} />
      </button>

    </div>
  );
}