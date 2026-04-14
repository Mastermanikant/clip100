import { useState, useCallback, useRef, useEffect } from 'react';
import { Realtime, Types } from 'ably';
import { STUN_SERVERS, CHUNK_SIZE } from '@/lib/constants';

export interface Message {
  id: string;
  sender: 'me' | 'them';
  type: 'text' | 'file_offer' | 'file_progress';
  content: string;
  timestamp: number;
}

export interface FrankRTCOptions {
  roomId: string;
  ecosystem: string;
  onMessage?: (msg: Message) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export function useFrankRTC({ roomId, ecosystem, onMessage, onConnectionChange }: FrankRTCOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [peerCount, setPeerCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const ablyRef = useRef<Realtime | null>(null);
  const channelRef = useRef<Types.RealtimeChannelPromise | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const clientId = useRef(Math.random().toString(36).substring(7));

  useEffect(() => {
    if (!roomId) return;

    const ably = new Realtime({ authUrl: '/api/auth', clientId: clientId.current });
    ablyRef.current = ably;
    const channel = ably.channels.get(`frankdrop:${ecosystem}:${roomId.toLowerCase()}`);
    channelRef.current = channel;

    channel.presence.subscribe('enter', (msg) => {
      if (msg.clientId !== clientId.current) {
        initiateWebRTC(channel, true);
      }
      refreshPeers(channel);
    });

    channel.presence.subscribe('leave', () => {
      setIsConnected(false);
      onConnectionChange?.(false);
      refreshPeers(channel);
    });

    const refreshPeers = async (ch: Types.RealtimeChannelPromise) => {
       const members = await ch.presence.get();
       // Exclude self
       const count = members.filter(m => m.clientId !== clientId.current).length;
       setPeerCount(count);
    };

    channel.subscribe('signal', async (msg) => {
      if (msg.clientId === clientId.current) return;
      
      const data = msg.data;
      if (data.type === 'offer') {
        initiateWebRTC(channel, false, data.offer);
      } else if (data.type === 'answer' && peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      } else if (data.type === 'candidate' && peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch(e) {}
      } else if (data.type === 'chat') {
        const newMsg: Message = { id: Math.random().toString(), sender: 'them', type: 'text', content: data.text, timestamp: Date.now() };
        setMessages(prev => [...prev, newMsg]);
        onMessage?.(newMsg);
      }
    });

    channel.presence.enter();

    return () => {
      channel.presence.leave();
      ably.close();
      if (peerRef.current) peerRef.current.close();
    };
  }, [roomId, ecosystem]);

  const initiateWebRTC = async (channel: Types.RealtimeChannelPromise, isInitiator: boolean, offer?: RTCSessionDescriptionInit) => {
    const peer = new RTCPeerConnection({ iceServers: STUN_SERVERS });
    peerRef.current = peer;

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        channel.publish('signal', { type: 'candidate', candidate: event.candidate });
      }
    };

    if (isInitiator) {
      const dataChannel = peer.createDataChannel('frank-data', { ordered: true });
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
    channel.onopen = () => {
       setIsConnected(true);
       onConnectionChange?.(true);
    };
    channel.onclose = () => {
       setIsConnected(false);
       onConnectionChange?.(false);
    };
    
    channel.onmessage = (event) => {
       // Files chunk logic handled externally if needed, or by events
    };
  };

  const sendText = useCallback((text: string) => {
    if (!channelRef.current) return;
    
    channelRef.current.publish('signal', { type: 'chat', text });
    const newMsg: Message = { id: Math.random().toString(), sender: 'me', type: 'text', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, newMsg]);
  }, []);

  return { isConnected, peerCount, messages, sendText, dataChannel: dataChannelRef.current };
}
