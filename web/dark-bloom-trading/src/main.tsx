import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import { AppProviders } from './context'
import App from './App.tsx'
import './index.css'


createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <App />
  </AppProviders>
);
