import { useTheme } from './hooks/useTheme';
import PlannerPage from './pages/PlannerPage';
import LandingPage from './pages/LandingPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  
  if (!user) {
    return <LandingPage />;
  }
  
  return <PlannerPage theme={theme} onToggleTheme={toggle} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
