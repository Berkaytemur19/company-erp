import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export const useAuth = () => {
  const { user, setUser, logout: storeLogout } = useAuthStore();

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (email, password, first_name, last_name) => {
    const res = await api.post('/auth/register', { email, password, first_name, last_name });
    return res.data;
  };

  const logout = () => {
    storeLogout();
  };

  return { user, login, register, logout };
};
