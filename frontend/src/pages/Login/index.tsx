import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api'; // Importa nossa API configurada
import styles from './Login.module.css'; // Importa os estilos

export function Login() {
  const navigate = useNavigate();
  
  // Estados para controlar o formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Função chamada ao clicar em "Entrar"
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita recarregar a página
    setError('');
    setLoading(true);

    try {
      // Faz a requisição POST para http://localhost:3001/auth/login
      const response = await authApi.post('/auth/login', {
        email,
        password
      });

      // Se der certo:
      // 1. Salva o Token no navegador
      localStorage.setItem('optiflow_token', response.data.access_token);
      
      // 2. Redireciona para o Dashboard
      navigate('/dashboard');

    } catch (err) {
      setError('Credenciais inválidas. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <div className={styles.logoCircle}>
            <div className={styles.logoDot}></div>
          </div>
          <h2 className={styles.title}>Acessar Sistema</h2>
          <p className={styles.subtitle}>OptiFlow Analytics v1.0</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.inputGroup}>
            <label className={styles.label}>E-mail</label>
            <input 
              type="email" 
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Senha</label>
            <input 
              type="password" 
              className={styles.input} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#666' }}>
          Não tem conta?{' '}
          <span 
            onClick={() => navigate('/register')} 
            style={{ color: '#fff', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Cadastre-se
          </span>
        </div>
      </div>
    </div>
  );
}