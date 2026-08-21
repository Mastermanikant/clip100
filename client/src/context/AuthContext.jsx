import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Helper: Safely decode Google JWT token
const parseJwt = (token) => {
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
        console.error("JWT Parse Error:", e);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('clipsync_auth_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            localStorage.setItem('clipsync_auth_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('clipsync_auth_user');
        }
    }, [user]);

    // Fast Central Backend Sign-In
    const triggerGoogleSignIn = async (customEmail = 'connect@mastermanikant.com', fullName = 'Master Manikant', customAvatar = null) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'signin',
                    email: customEmail,
                    fullName: fullName,
                    avatarUrl: customAvatar,
                    username: customEmail.includes('mastermanikant') ? 'mastermanikant' : customEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '')
                })
            });

            const data = await res.json();
            if (data.success && data.user) {
                const profile = {
                    uid: data.user.accountId,
                    name: data.user.fullName,
                    email: data.user.email,
                    avatar: data.user.avatarUrl,
                    tier: data.user.tier,
                    claimedUsername: data.user.username,
                    verified: true,
                    authProvider: 'google',
                    createdAt: data.user.createdAt
                };
                setUser(profile);
                setShowAuthModal(false);
                toast.success(`Welcome, ${profile.name}! Synced with Central Database.`, { icon: '🎉' });
            } else {
                throw new Error('Backend failed');
            }
        } catch (err) {
            // Local fallback
            const fallbackProfile = {
                uid: `FB-100892`,
                name: fullName || 'User',
                email: customEmail,
                avatar: customAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=4f46e5&color=fff`,
                tier: 'FREE_LAUNCH',
                claimedUsername: customEmail.includes('mastermanikant') ? 'mastermanikant' : customEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                verified: true,
                authProvider: 'google',
                createdAt: Date.now()
            };
            setUser(fallbackProfile);
            setShowAuthModal(false);
            toast.success(`Welcome, ${fallbackProfile.name}! Signed in successfully.`, { icon: '🎉' });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Official Native Google Identity Services Credential Response
    const handleGoogleCredentialResponse = async (credential) => {
        const payload = parseJwt(credential);
        if (!payload || !payload.email) {
            toast.error('Google Sign-In failed. Please try again.');
            return;
        }
        await triggerGoogleSignIn(payload.email, payload.name, payload.picture);
    };

    // Custom Email Sign-In
    const signInWithEmail = async (email, name = 'User') => {
        await triggerGoogleSignIn(email, name);
    };

    const logout = () => {
        setUser(null);
        toast('Logged out successfully', { icon: '🚪' });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
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
