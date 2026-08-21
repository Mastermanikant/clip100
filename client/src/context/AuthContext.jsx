import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('clipsync_auth_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        if (user) {
            localStorage.setItem('clipsync_auth_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('clipsync_auth_user');
        }
    }, [user]);

    // Google Sign-In Handler
    const signInWithGoogle = (mockProfile) => {
        const profile = mockProfile || {
            uid: `g_${Date.now()}`,
            name: 'Master Manikant',
            email: 'connect@mastermanikant.com',
            avatar: 'https://ui-avatars.com/api/?name=Master+Manikant&background=4f46e5&color=fff',
            tier: 'FREE_LAUNCH',
            verified: true,
            createdAt: Date.now()
        };
        setUser(profile);
        setShowAuthModal(false);
        toast.success(`Welcome, ${profile.name}! Signed in with Google.`, { icon: '👋' });
    };

    // Email / FrankPass Sign-In Handler
    const signInWithEmail = (email, name = 'User') => {
        const profile = {
            uid: `em_${Date.now()}`,
            name: name,
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=fff`,
            tier: 'FREE_LAUNCH',
            verified: true,
            createdAt: Date.now()
        };
        setUser(profile);
        setShowAuthModal(false);
        toast.success(`Welcome, ${profile.name}! Signed in with Email.`, { icon: '👋' });
    };

    const logout = () => {
        setUser(null);
        toast('Logged out successfully', { icon: '🚪' });
    };

    return (
        <AuthContext.Provider value={{
            user,
            showAuthModal,
            setShowAuthModal,
            signInWithGoogle,
            signInWithEmail,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
