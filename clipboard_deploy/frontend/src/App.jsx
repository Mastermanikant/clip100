import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Room from './pages/Room';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-background text-white selection:bg-accent selection:text-white">
                <Toaster position="top-right" toastOptions={{
                    style: {
                        background: '#1E293B',
                        color: '#fff',
                        border: '1px solid #334155'
                    }
                }} />
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/room/:roomId" element={<Room />} />
                    <Route path="/r/:roomId" element={<Room />} /> {/* Short link support */}
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
