import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Room from './Room';

const RESERVED_ROUTES = ['about', 'contact', 'privacy', 'terms', 'blog', 'room', 'r', 'link', 'l', 'u'];

const SmartRouter = () => {
    const { username } = useParams();

    if (!username || RESERVED_ROUTES.includes(username.toLowerCase())) {
        return <Navigate to="/" replace />;
    }

    return <Room roomType="custom_link" />;
};

export default SmartRouter;
