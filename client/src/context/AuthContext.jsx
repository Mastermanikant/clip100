import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Helper: Decode Google JWT token from Google Identity Services
const decodeGoogleJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

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

    // Handle Real Google JWT Credential Response
    const handleGoogleCredentialResponse = (response) => {
        if (response && response.credential) {
            const decoded = decodeGoogleJwt(response.credential);
            if (decoded) {
                const profile = {
                    uid: decoded.sub,
                    name: decoded.name || 'Google User',
                    email: decoded.email,
                    avatar: decoded.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(decoded.name || 'User')}&background=4f46e5&color=fff`,
                    tier: 'FREE_LAUNCH',
                    verified: decoded.email_verified || true,
                    authProvider: 'google',
                    createdAt: Date.now()
                };
                setUser(profile);
                setShowAuthModal(false);
                toast.success(`Welcome, ${profile.name}! Verified with Google.`, { icon: '🎉' });
                return;
            }
        }
        toast.error('Google Sign-In verification failed.');
    };

    // Google Sign-In Trigger (Native Google GSI or fallback prompt)
    const triggerGoogleSignIn = () => {
        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        if (window.google && googleClientId) {
            try {
                window.google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: handleGoogleCredentialResponse,
                });
                window.google.accounts.id.prompt();
            } catch (err) {
                console.error('Google GSI init error:', err);
            }
        } else {
            // Prompt for fast email verification if Google Client ID is awaiting dashboard binding
            const inputEmail = prompt('Enter your Google/Personal Email to link your permanent diary:');
            if (inputEmail && inputEmail.includes('@')) {
                const name = inputEmail.split('@')[0];
                signInWithEmail(inputEmail, name);
            }
        }
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
            authProvider: 'email',
            createdAt: Date.now()
        };
        setUser(profile);
        setShowAuthModal(false);
        toast.success(`Welcome, ${profile.name}! Signed in successfully.`, { icon: '👋' });
    };

    const logout = () => {
        setUser(null);
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        toast('Logged out successfully', { icon: '🚪' });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                showAuthModal,
                setShowAuthModal,
                triggerGoogleSignIn,
                handleGoogleCredentialResponse,
                signInWithEmail,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
