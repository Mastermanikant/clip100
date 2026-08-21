// Cloudflare Pages Function: /api/auth
// Central User Database & Identity Synchronization Engine

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { action, email, username, fullName, avatarUrl, pin, accountId } = body;

        // In-memory fallback if D1 DB is initializing
        const globalStore = globalThis._clipSyncUsers || new Map();
        globalThis._clipSyncUsers = globalStore;

        // Initialize D1 Table if DB is bound
        if (env.DB) {
            try {
                await env.DB.prepare(`
                    CREATE TABLE IF NOT EXISTS users (
                        account_id TEXT PRIMARY KEY,
                        username TEXT UNIQUE,
                        email TEXT UNIQUE,
                        full_name TEXT,
                        avatar_url TEXT,
                        tier TEXT DEFAULT 'FREE_LAUNCH',
                        pin_hash TEXT,
                        active_rooms TEXT,
                        created_at INTEGER,
                        last_login INTEGER
                    )
                `).run();
            } catch (initErr) {
                console.error("D1 users init error:", initErr);
            }
        }

        // Action 1: Sign-In / Auto-Register (Google / Email)
        if (action === 'signin' || action === 'google_auth') {
            const cleanEmail = (email || 'connect@mastermanikant.com').trim().toLowerCase();
            const cleanName = fullName || (cleanEmail.includes('mastermanikant') ? 'Master Manikant' : cleanEmail.split('@')[0]);
            const cleanUsername = (username || cleanName).toLowerCase().replace(/[^a-z0-9_-]/g, '') || `user_${Date.now()}`;
            const avatar = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=4f46e5&color=fff`;

            let user = null;

            if (env.DB) {
                try {
                    // Check if user exists by email or username
                    const existing = await env.DB.prepare(
                        `SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1`
                    ).bind(cleanEmail, cleanUsername).first();

                    if (existing) {
                        // Update last login
                        await env.DB.prepare(
                            `UPDATE users SET last_login = ? WHERE account_id = ?`
                        ).bind(Date.now(), existing.account_id).run();

                        user = {
                            accountId: existing.account_id,
                            username: existing.username,
                            email: existing.email,
                            fullName: existing.full_name,
                            avatarUrl: existing.avatar_url,
                            tier: existing.tier,
                            createdAt: existing.created_at
                        };
                    } else {
                        // Create new permanent account
                        const newId = `FB-${Math.floor(100000 + Math.random() * 900000)}`;
                        const now = Date.now();

                        await env.DB.prepare(
                            `INSERT INTO users (account_id, username, email, full_name, avatar_url, tier, created_at, last_login)
                             VALUES (?, ?, ?, ?, ?, 'FREE_LAUNCH', ?, ?)`
                        ).bind(newId, cleanUsername, cleanEmail, cleanName, avatar, now, now).run();

                        user = {
                            accountId: newId,
                            username: cleanUsername,
                            email: cleanEmail,
                            fullName: cleanName,
                            avatarUrl: avatar,
                            tier: 'FREE_LAUNCH',
                            createdAt: now
                        };
                    }
                } catch (dbErr) {
                    console.error("D1 DB Query error:", dbErr);
                }
            }

            // In-Memory Fallback
            if (!user) {
                const existingMem = Array.from(globalStore.values()).find(u => u.email === cleanEmail);
                if (existingMem) {
                    user = existingMem;
                } else {
                    const newId = `FB-${Math.floor(100000 + Math.random() * 900000)}`;
                    user = {
                        accountId: newId,
                        username: cleanUsername,
                        email: cleanEmail,
                        fullName: cleanName,
                        avatarUrl: avatar,
                        tier: 'FREE_LAUNCH',
                        createdAt: Date.now()
                    };
                    globalStore.set(user.accountId, user);
                }
            }

            return new Response(JSON.stringify({ success: true, user }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Action 2: Check Username Availability (2-Tier High Speed)
        if (action === 'check_username') {
            const checkUser = (username || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
            if (!checkUser || checkUser.length < 3) {
                return new Response(JSON.stringify({ available: false, error: 'Username must be at least 3 characters' }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            let taken = false;
            if (env.DB) {
                try {
                    const exists = await env.DB.prepare(
                        `SELECT account_id FROM users WHERE username = ? LIMIT 1`
                    ).bind(checkUser).first();
                    taken = !!exists;
                } catch (e) {}
            }

            return new Response(JSON.stringify({ available: !taken, username: checkUser }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ error: 'Invalid action' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
