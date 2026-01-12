import { useState, useRef } from 'react';
import Papa from 'papaparse'; 
import { UploadCloud, ArrowRight, FileText, Table as TableIcon, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { importApi } from '../../services/api';
import styles from './NewProject.module.css';

type ColumnRole = 'IGNORE' | 'LABEL' | 'OBJECTIVE' | 'CONSTRAINT_LE' | 'CONSTRAINT_GE' | 'CONSTRAINT_EQ';

interface MappingState {
  role: ColumnRole;
  limit?: string;
}

export function NewProject() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const [mapping, setMapping] = useState<Record<string, MappingState>>({});
  const [direction, setDirection] = useState<'max' | 'min'>('max');
  const [forceInteger, setForceInteger] = useState(true);
  
  const [loading, setLoading] = useState(false);

  const isConstraint = (role: ColumnRole) => {
    return ['CONSTRAINT_LE', 'CONSTRAINT_GE', 'CONSTRAINT_EQ'].includes(role);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      Papa.parse(selectedFile, {
        preview: 6,
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const extractedHeaders = results.data[0] as string[];
            const dataRows = results.data.slice(1); 
            
            setHeaders(extractedHeaders);
            setPreviewData(dataRows);

            const initialMap: Record<string, MappingState> = {};
            extractedHeaders.forEach(h => {
              const lower = h.toLowerCase();
              let role: ColumnRole = 'IGNORE';
              
              if (lower.includes('produto') || lower.includes('item') || lower.includes('nome')) role = 'LABEL';
              else if (lower.includes('lucro') || lower.includes('preço') || lower.includes('custo')) role = 'OBJECTIVE';
              
              initialMap[h] = { role, limit: '' };
            });
            setMapping(initialMap);
            setStep(2);
          }
        },
        error: (err) => {
          alert('Erro ao ler CSV: ' + err.message);
        }
      });
    }
  };

  const updateMapping = (header: string, field: keyof MappingState, value: string) => {
    setMapping(prev => ({
      ...prev,
      [header]: { ...prev[header], [field]: value }
    }));
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const config = {
        direction: direction,
        variableNameColumn: '',
        objectiveColumn: '',
        constraints: [] as any[],
        integerVariables: [] as string[]
      };

      Object.entries(mapping).forEach(([header, state]) => {
        if (state.role === 'LABEL') {
          config.variableNameColumn = header;
        } 
        else if (state.role === 'OBJECTIVE') {
          config.objectiveColumn = header;
        } 
        else if (isConstraint(state.role)) {
          if (!state.limit || isNaN(parseFloat(state.limit))) {
             throw new Error(`A coluna "${header}" é uma restrição, mas não tem um limite válido definido.`);
          }
          
          let operator = '<=';
          if (state.role === 'CONSTRAINT_GE') operator = '>=';
          if (state.role === 'CONSTRAINT_EQ') operator = '=';

          config.constraints.push({ 
            csvColumn: header, 
            operator: operator, 
            rhs: parseFloat(state.limit) 
          });
        }
      });

      if (!config.variableNameColumn) throw new Error('Selecione uma coluna Identificadora (ex: Produto).');
      if (!config.objectiveColumn) throw new Error('Selecione uma coluna de Objetivo (ex: Lucro).');
      if (config.constraints.length === 0) throw new Error('Defina pelo menos uma restrição.');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('config', JSON.stringify(config));

      await importApi.post('/document/upload', formData);

      setTimeout(() => navigate('/dashboard'), 500);

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || 'Erro desconhecido';
      alert(`Erro na validação: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>NOVO PROJETO</span>
        <h1 className={styles.title}>{step === 1 ? 'Pipeline de Dados' : 'Configuração do Modelo'}</h1>
      </div>

      <div className={styles.stepper}>
        <div className={styles.stepLine}></div>
        <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`}>1</div>
        <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`}>2</div>
        <div className={styles.step}>3</div>
      </div>

      {step === 1 && (
        <div className={styles.uploadZone} onClick={() => fileInputRef.current?.click()}>
          <div className={styles.uploadIcon}><UploadCloud size={32} /></div>
          <div style={{ fontSize: 18, marginBottom: 8 }}>Clique para selecionar CSV</div>
          <div style={{ fontSize: 12, color: '#666' }}>Suporta arquivos até 5MB</div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" hidden />
        </div>
      )}

      {step === 2 && (
        <>
          <div className={styles.configZone}>
             <div className={styles.radioGroup}>
                <div 
                  className={`${styles.radioOption} ${direction === 'max' ? styles.selected : ''}`}
                  onClick={() => setDirection('max')}
                >
                  {direction === 'max' ? <CheckCircle2 size={14}/> : <Circle size={14}/>} Maximizar
                </div>
                <div 
                  className={`${styles.radioOption} ${direction === 'min' ? styles.selected : ''}`}
                  onClick={() => setDirection('min')}
                >
                  {direction === 'min' ? <CheckCircle2 size={14}/> : <Circle size={14}/>} Minimizar
                </div>
             </div>
             
             <div className={styles.radioGroup} onClick={() => setForceInteger(!forceInteger)}>
                <div className={`${styles.radioOption} ${forceInteger ? styles.selected : ''}`}>
                  {forceInteger ? <CheckCircle2 size={14}/> : <Circle size={14}/>} 
                  Solução Inteira
                </div>
             </div>
          </div>

          <div className={styles.previewContainer}>
            <table className={styles.previewTable}>
              <thead>
                <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i} className={row.includes('RECURSOS_DISPONIVEIS') ? styles.highlightRow : ''}>
                    {(row as string[]).map((cell, j) => <td key={j}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.mappingContainer}>
            <div className={styles.mappingHeader}>
              <span style={{width: '30%'}}>Coluna no CSV</span>
              <span style={{width: '65%'}}>Configuração</span>
            </div>

            {headers.map((header) => (
              <div key={header} className={styles.mappingRow}>
                <div className={styles.colSource}>
                  <div className={styles.colIcon}><FileText size={12}/></div>
                  <span title={header}>{header}</span>
                </div>
                
                <div className={styles.arrowIcon}><ArrowRight size={16}/></div>
                
                <div className={styles.colControls}>
                  <select 
                    className={styles.selectBox}
                    value={mapping[header].role}
                    onChange={(e) => updateMapping(header, 'role', e.target.value)}
                    style={{ width: '60%' }}
                  >
                    <option value="IGNORE">Ignorar</option>
                    <option value="LABEL">Identificador (Nome)</option>
                    <option value="OBJECTIVE" style={{color: '#ccff00'}}>★ Objetivo</option>
                    <option value="CONSTRAINT_LE">Restrição (Menor ou Igual)</option>
                    <option value="CONSTRAINT_GE">Restrição (Maior ou Igual)</option>
                    <option value="CONSTRAINT_EQ">Restrição (Igual)</option>
                  </select>

                  {isConstraint(mapping[header].role) && (
                    <input 
                      type="number" 
                      className={styles.limitInput} 
                      placeholder="Limite"
                      value={mapping[header].limit}
                      onChange={(e) => updateMapping(header, 'limit', e.target.value)}
                    />
                  )}
                </div>
              </div>
            ))}

            <div style={{marginTop: 20, fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 8}}>
              <AlertCircle size={14} />
              <span>Nota: Linhas com valores totais (ex: RECURSOS) não afetam a solução se tiverem lucro 0.</span>
            </div>

            <button className={styles.btnAction} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Processando...' : 'Iniciar Otimização'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}