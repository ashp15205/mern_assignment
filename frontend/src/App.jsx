import { useTheme } from './hooks/useTheme';
import PlannerPage from './pages/PlannerPage';

export default function App() {
  const { theme, toggle } = useTheme();
  return <PlannerPage theme={theme} onToggleTheme={toggle} />;
}
