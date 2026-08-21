import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './styles/global.less';

// Gates every scroll-reveal rule. Without it the sections are simply visible,
// which is the correct fallback when the bundle never runs.
document.documentElement.classList.add('js');

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element');

createRoot(container).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
);
