import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Database, CheckCircle, XCircle, Terminal } from 'lucide-react';
import { dashboardApi } from '../../services/api';
import styles from './ProjectDetails.module.css';

interface ProjectDetail {
  id: string;
  filename: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  result?: any;
  logs?: string;
  createdAt: string;
}

export function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProjectDetails(id);
  }, [id]);

  const fetchProjectDetails = async (projectId: string) => {
    try {
      const response = await dashboardApi.get(`/results/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      alert('Projeto não encontrado ou erro de conexão.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const extractVariables = (resultJson: any) => {
    if (!resultJson) return [];
    
    const ignoredKeys = ['feasible', 'result', 'bounded', 'isIntegral'];
    
    return Object.entries(resultJson)
      .filter(([key]) => !ignoredKeys.includes(key))
      .map(([name, value]) => ({ name, value: Number(value) }));
  };

  if (loading) return <div style={{padding:40, color:'#fff', textAlign:'center'}}>Carregando dados da otimização...</div>;
  if (!project) return null;

  const variables = extractVariables(project.result);

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16}/> Voltar
          </button>
          <div style={{marginTop: 15}}>
            <span>DETALHES DA OTIMIZAÇÃO</span>
            <h1>{project.filename}</h1>
            <div style={{color: '#666', fontSize: 12, marginTop: 5}}>ID: {project.id}</div>
          </div>
        </div>
        
        <div style={{
          padding: '8px 16px', borderRadius: 20, fontWeight: 'bold', fontSize: 12,
          background: project.status === 'COMPLETED' ? 'rgba(204, 255, 0, 0.1)' : 'rgba(255, 77, 77, 0.1)',
          color: project.status === 'COMPLETED' ? 'var(--acid-lime)' : '#ff4d4d',
          border: '1px solid currentColor', display: 'flex', alignItems: 'center', gap: 6
        }}>
          {project.status === 'COMPLETED' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
          {project.status}
        </div>
      </div>

      <div className={styles.grid}>
        
        <div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span>Resultado Matemático</span>
              <Database size={16}/>
            </div>
            {project.status === 'COMPLETED' && project.result ? (
              <>
                <div className={styles.mainResult}>
                  {project.result.result.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div className={styles.mainLabel}>Lucro / Valor Otimizado Total</div>
              </>
            ) : (
              <div style={{color: '#888'}}>Nenhum resultado disponível (Falha ou Pendente).</div>
            )}
          </div>

          {project.status === 'COMPLETED' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span>Plano de Ação (Variáveis)</span>
                <FileText size={16}/>
              </div>
              <div style={{maxHeight: 300, overflowY: 'auto'}}>
                {variables.length > 0 ? variables.map((v, i) => (
                  <div key={i} className={`${styles.detailRow} ${styles.varRow}`}>
                    <span>{v.name}</span>
                    <span style={{color: '#fff'}}>{v.value} unidades</span>
                  </div>
                )) : (
                  <div style={{padding: 20, textAlign: 'center', color: '#666'}}>
                    O modelo retornou resultado 0 ou vazio.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span>Log de Execução</span>
              <Terminal size={16}/>
            </div>
            <div className={styles.logContainer}>
              <div className={styles.logLine}>[SYSTEM] Iniciando leitura do job...</div>
              <div className={styles.logLine}>[INFO] Criado em: {new Date(project.createdAt).toLocaleString()}</div>
              {project.logs ? (
                project.logs.split('\n').map((line, i) => (
                   <div key={i} className={styles.logLine}>{line}</div>
                ))
              ) : (
                <div className={styles.logLine}>[INFO] Nenhum log adicional registrado.</div>
              )}
               <div className={styles.logLine}>[SYSTEM] Processo finalizado.</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}