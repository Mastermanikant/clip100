import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import GoogleAuthModal from './components/GoogleAuthModal';
import Landing from './pages/Landing';
import Room from './pages/Room';
import BurnNote from './pages/BurnNote';
import SmartRouter from './pages/SmartRouter';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
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

                        {/* Google & Email Authentication Modal */}
                        <GoogleAuthModal />

                        <Routes>
                            <Route path="/" element={<Landing />} />
                            
                            {/* 🔥 One-Time Burn After Reading Route */}
                            <Route path="/burn/:secretId" element={<BurnNote />} />

                            {/* Ephemeral Quick Rooms */}
                            <Route path="/room/:roomId" element={<Room roomType="ephemeral" />} />
                            <Route path="/r/:roomId" element={<Room roomType="ephemeral" />} />
                            
                            {/* 30-Day Custom Links */}
                            <Route path="/link/:customSlug" element={<Room roomType="custom_link" />} />
                            <Route path="/l/:customSlug" element={<Room roomType="custom_link" />} />
                            
                            {/* Permanent User Accounts / Cloud Diary */}
                            <Route path="/u/:username" element={<Room roomType="diary" />} />

                            {/* Brand & Ecosystem Suite */}
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/terms" element={<Terms />} />
                            <Route path="/blog" element={<BlogList />} />
                            <Route path="/blog/:slug" element={<BlogPost />} />

                            {/* Top-level custom vanity path fallback (e.g. /mastermanikant) */}
                            <Route path="/:username" element={<SmartRouter />} />
                        </Routes>
                    </div>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
