import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, FileText } from 'lucide-react';
import { dashboardApi } from '../../services/api';
import styles from './History.module.css';

interface Job {
  id: string;
  filename: string;
  status: string;
  createdAt: string;
  result?: { result: number };
}

export function History() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await dashboardApi.get('/results');
      setJobs(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.filename.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <span className={styles.subtitle}>REGISTROS</span>
          <h1 className={styles.title}>Histórico de Otimizações</h1>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchGroup}>
          <Search className={styles.searchIcon} size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome do arquivo ou ID..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className={styles.filterSelect}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Todos os Status</option>
          <option value="COMPLETED">Sucesso</option>
          <option value="FAILED">Falha</option>
          <option value="PENDING">Pendente</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <div className={`${styles.tableRow} ${styles.tableHeader}`}>
          <div style={{width: '15%'}}>Data</div>
          <div style={{width: '40%'}}>Arquivo</div>
          <div style={{width: '20%'}}>Status</div>
          <div style={{width: '25%', textAlign: 'right'}}>Resultado</div>
        </div>

        {loading ? (
          <div style={{padding:40, textAlign:'center', color:'#666'}}>Carregando histórico...</div>
        ) : filteredJobs.length === 0 ? (
          <div style={{padding:40, textAlign:'center', color:'#666'}}>Nenhum registro encontrado.</div>
        ) : (
          filteredJobs.map(job => (
            <div 
              key={job.id} 
              className={styles.tableRow}
              onClick={() => navigate(`/project/${job.id}`)}
            >
              <div style={{width: '15%', display:'flex', gap:6, alignItems:'center'}}>
                <Calendar size={14} color="#666"/>
                {new Date(job.createdAt).toLocaleDateString()}
              </div>
              <div style={{width: '40%', fontWeight:'bold', display:'flex', gap:8, alignItems:'center'}}>
                <FileText size={14} color="var(--cyan)"/>
                {job.filename}
              </div>
              <div style={{width: '20%'}}>
                <span className={`${styles.statusBadge} ${
                  job.status === 'COMPLETED' ? styles.success : 
                  job.status === 'FAILED' ? styles.failed : styles.pending
                }`}>
                  {job.status}
                </span>
              </div>
              <div style={{width: '25%', textAlign: 'right', fontFamily:'monospace', color: job.result ? '#fff' : '#666'}}>
                {job.result ? `R$ ${job.result.result.toLocaleString()}` : '-'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}