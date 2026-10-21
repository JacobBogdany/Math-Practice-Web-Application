import { BrowserRouter } from 'react-router-dom';
import { AppSettingsProvider } from '../context/AppSettingsProvider';
import { AppRoutes } from './AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AppSettingsProvider>
        <AppRoutes />
      </AppSettingsProvider>
    </BrowserRouter>
  );
}

export default App;
