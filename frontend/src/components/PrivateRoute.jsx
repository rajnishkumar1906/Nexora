import { Navigate } from 'react-router-dom';
import { useNexora } from '../context/NexoraContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useNexora();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;