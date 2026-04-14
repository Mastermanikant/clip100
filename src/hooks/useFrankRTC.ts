import { useState, useEffect, useRef, useCallback } from 'react';
import { Realtime } from 'ably';

interface Message {
  id: string;
  sender: 'me' | 'them';
  type: 'text' | 'file_offer' | 'file_progress';
  content: string;
  timestamp: Date;
  fileName?: string;
  fileSize?: number;
  progress?: number;
}

export function useFrankRTC(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const ablyRef = useRef<Realtime | null>(null);
  const channelRef = useRef<any | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  
  const clientId = useRef(Math.random().toString(36).substring(7));

  // Initialize Ably & WebRTC
  useEffect(() => {
    if (!roomId) return;

    // 1. Initialize Ably Signaling
    const ably = new Realtime({ authUrl: '/api/auth', clientId: clientId.current });
    ablyRef.current = ably;
    const channel = ably.channels.get(`franklink:${roomId.toLowerCase()}`);
    channelRef.current = channel as any;

    channel.presence.subscribe('enter', (msg) => {
      if (msg.clientId !== clientId.current) {
        // Someone joined, initiate WebRTC Offer
        initiateWebRTC(channel as any, true);
      }
    });

    channel.subscribe('signal', async (msg) => {
      if (msg.clientId === clientId.current) return; // Ignore own signals
      
      const data = msg.data;
      if (data.type === 'offer') {
        initiateWebRTC(channel as any, false, data.offer);
      } else if (data.type === 'answer' && peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      } else if (data.type === 'candidate' && peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch(e) { console.error('Error adding ICE candidate', e); }
      } else if (data.type === 'chat') {
        setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'them', type: 'text', content: data.text, timestamp: new Date() }]);
      }
    });

    channel.presence.enter();

    return () => {
      channel.presence.leave();
      ably.close();
      if (peerRef.current) peerRef.current.close();
    };
  }, [roomId]);

  const initiateWebRTC = async (channel: any, isInitiator: boolean, offer?: RTCSessionDescriptionInit) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    peerRef.current = peer;

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        channel.publish('signal', { type: 'candidate', candidate: event.candidate });
      }
    };

    if (isInitiator) {
      const dataChannel = peer.createDataChannel('frank-data');
      setupDataChannel(dataChannel);
      const newOffer = await peer.createOffer();
      await peer.setLocalDescription(newOffer);
      channel.publish('signal', { type: 'offer', offer: newOffer });
    } else {
      peer.ondatachannel = (event) => {
        setupDataChannel(event.channel);
      };
      if (offer) {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        channel.publish('signal', { type: 'answer', answer });
      }
    }
  };

  const setupDataChannel = (channel: RTCDataChannel) => {
    dataChannelRef.current = channel;
    channel.onopen = () => setIsConnected(true);
    channel.onclose = () => setIsConnected(false);
    
    // Handle incoming file buffers
    channel.onmessage = (event) => {
      // In a real prod environment, handle chunking here.
    };
  };

  const sendMessage = useCallback((text: string) => {
    if (!channelRef.current) return;
    
    // We send text via Ably for ultra-reliability, WebRTC DataChannel for huge files.
    channelRef.current.publish('signal', { type: 'chat', text });
    setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'me', type: 'text', content: text, timestamp: new Date() }]);
  }, []);

  return { isConnected, messages, sendMessage };
}
