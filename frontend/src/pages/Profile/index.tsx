import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { LogOut, Shield, Mail, User } from 'lucide-react';
import { userApi } from '../../services/api';
import styles from './Profile.module.css';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('optiflow_token');
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      const userId = decoded.sub;

      if(userId) {
        const response = await userApi.get(`/users/${userId}`);
        setUser(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('optiflow_token');
    navigate('/login');
  };

  if (!user) return <div style={{padding:40, textAlign:'center', color:'#fff'}}>Carregando perfil...</div>;

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.cardBg}></div>
        
        <div className={styles.avatar}>{initials}</div>
        
        <h2 className={styles.name}>{user.name}</h2>
        <span className={styles.roleTag}>
          <Shield size={10} style={{marginRight:4, display:'inline'}}/>
          {user.role}
        </span>

        <div className={styles.infoGroup}>
          <label className={styles.label}>E-mail Corporativo</label>
          <div className={styles.value} style={{display:'flex', alignItems:'center', gap:8}}>
            <Mail size={14} color="#666"/> {user.email}
          </div>
        </div>

        <div className={styles.infoGroup}>
          <label className={styles.label}>ID do Usuário</label>
          <div className={styles.value} style={{display:'flex', alignItems:'center', gap:8}}>
            <User size={14} color="#666"/> {user.id}
          </div>
        </div>

        <div className={styles.infoGroup}>
          <label className={styles.label}>Membro Desde</label>
          <div className={styles.value}>
            {new Date(user.createdAt).toLocaleDateString('pt-BR', { 
              day: '2-digit', month: 'long', year: 'numeric' 
            })}
          </div>
        </div>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} style={{display:'inline', marginRight:8, verticalAlign:'middle'}}/>
          Encerrar Sessão
        </button>

      </div>
    </div>
  );
}