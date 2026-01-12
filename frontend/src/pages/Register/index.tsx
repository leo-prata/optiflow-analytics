import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../services/api';
import styles from './Register.module.css';

export function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ANALYST'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // POST http://localhost:3000/users
      await userApi.post('/users', formData);
      
      // Sucesso!
      alert('Conta criada com sucesso! Faça login.');
      navigate('/login');

    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        setError('Este e-mail já está cadastrado.');
      } else {
        setError('Erro ao criar conta. Verifique os dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <div className={styles.logoCircle}><div className={styles.logoDot}></div></div>
          <h2 className={styles.title}>Criar Conta</h2>
          <p className={styles.subtitle}>Junte-se ao OptiFlow Analytics</p>
        </div>

        <form onSubmit={handleRegister}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Nome Completo</label>
            <input 
              name="name" type="text" className={styles.input} required 
              value={formData.name} onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>E-mail Corporativo</label>
            <input 
              name="email" type="email" className={styles.input} required 
              value={formData.email} onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Senha</label>
            <input 
              name="password" type="password" className={styles.input} required minLength={6}
              value={formData.password} onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Perfil de Acesso</label>
            <select name="role" className={styles.select} value={formData.role} onChange={handleChange}>
              <option value="ANALYST">Analista de Dados (Padrão)</option>
              <option value="MANAGER">Gestor (Visualizador)</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Criando...' : 'Cadastrar'}
          </button>
        </form>

        <div className={styles.linkText}>
          Já tem conta? <button onClick={() => navigate('/login')} className={styles.link}>Fazer Login</button>
        </div>
      </div>
    </div>
  );
}