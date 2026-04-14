# Plann.md - Next-Gen Transfer Platform (Updated)

## 1. Zero-Friction Room System
- **Joining**: QR code (existing) + **6-Digit Room Code** (Easy for PC-to-Mobile typing).
- **Security**: Optional **Room Password**.
    - If set: Password is hashed (SHA-256) on the client side before being sent to the signaling server.
    - Joining peers must provide the password to acquire the WebRTC signaling rights.

## 2. Advanced Storage Strategy
- **Online Sync (Default)**: Small text and metadata are stored in Redis with a 24h TTL.
- **Local-Only Mode (Toggle)**: 
    - No data touches the server (except signaling).
    - Data is stored exclusively in **IndexedDB** on the local device.
    - Transfer is strictly P2P.

## 3. Fast Transfer Optimization
- **Web Workers**: Move chunking and encryption to a background thread to keep UI at 60fps.
- **Parallel DataChannels**: Use 2-3 DataChannels simultaneously to maximize throughput on high-latency networks.

## 4. Components & Prompts
Updating the prompts in existing files to include:
- `crypto.ts`: Password hashing.
- `webrtc.ts`: Multi-channel support + Room code handling.
- `Room.tsx`: Password UI and Storage Toggle.
