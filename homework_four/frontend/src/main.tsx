import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/css/main.css';
import RootComponent from './RootComponent.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RootComponent />
    </StrictMode>
);