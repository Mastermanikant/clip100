import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Room from './pages/Room';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <div className="min-h-screen flex flex-col selection:bg-primary selection:text-white transition-colors">
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                fontSize: '13px',
                                borderRadius: '12px',
                                padding: '12px 16px',
                            },
                        }}
                    />
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/room/:roomId" element={<Room />} />
                        <Route path="/r/:roomId" element={<Room />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/blog" element={<BlogList />} />
                        <Route path="/blog/:slug" element={<BlogPost />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
