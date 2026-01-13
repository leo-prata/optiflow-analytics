import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderPlus, 
  Settings, 
  LogOut, 
  History,
  UserCircle
} from 'lucide-react';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('Deseja realmente sair do sistema?')) {
      localStorage.removeItem('optiflow_token');
      navigate('/login');
    }
  };

  return (
    <aside className={styles.container}>
      <div className={styles.logo}>
        <div className={styles.logoDot}></div>
      </div>

      <nav className={styles.navGroup}>
        
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          data-title="Dashboard"
        >
          <LayoutDashboard size={20} />
        </NavLink>

        <NavLink 
          to="/new" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          data-title="Novo Projeto"
        >
          <FolderPlus size={20} />
        </NavLink>

        <NavLink 
          to="/history" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          data-title="Histórico"
        >
          <History size={20} />
        </NavLink>

      </nav>

      <div className={styles.footer}>
        <div className={styles.divider}></div>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          data-title="Meu Perfil"
        >
          <UserCircle size={20} />
        </NavLink>

        <button 
          onClick={handleLogout} 
          className={`${styles.navItem} ${styles.logoutBtn}`}
          data-title="Sair (Logout)"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}