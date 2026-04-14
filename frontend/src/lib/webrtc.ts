import { db } from './storage';

export interface SignalData {
  from: string;
  signal: any;
}

export class WebRTCManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel[]> = new Map();
  private isPro: boolean = false;
  private throttleDelay: number = 0; // ms between chunks

  constructor(
    private roomId: string, 
    private ablyClient: any,
    private ablyChannel: any,
    private onMessage: (msg: any) => void,
    isPro: boolean = false
  ) {
    this.isPro = isPro;
    this.throttleDelay = isPro ? 0 : 5; 
    this.setupSignaling();
  }

  private setupSignaling() {
    this.ablyChannel.subscribe('signal', async (message: any) => {
      const { from, signal } = message.data;
      if (from === this.ablyClient.auth.clientId) return;

      let pc = this.peerConnections.get(from);
      if (!pc) pc = this.createPeerConnection(from, false);

      if (signal.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.ablyChannel.publish('signal', { to: from, from: this.ablyClient.auth.clientId, signal: answer });
      } else if (signal.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
      } else if (signal.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    });

    // Notify others that I joined
    this.ablyChannel.publish('peer_joined', { socket_id: this.ablyClient.auth.clientId });
    
    this.ablyChannel.subscribe('peer_joined', (msg: any) => {
      if (msg.data.socket_id !== this.ablyClient.auth.clientId) {
        this.createPeerConnection(msg.data.socket_id, true);
      }
    });
  }

  private createPeerConnection(peerId: string, isInitiator: boolean): RTCPeerConnection {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    this.peerConnections.set(peerId, pc);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.ablyChannel.publish('signal', { to: peerId, from: this.ablyClient.auth.clientId, signal: { candidate: event.candidate } });
      }
    };

    if (isInitiator) {
      const channels = [
        pc.createDataChannel('data-0', { ordered: true }),
        pc.createDataChannel('data-1', { ordered: true }),
      ];
      this.setupDataChannels(peerId, channels);

      pc.createOffer().then(async (offer) => {
        await pc.setLocalDescription(offer);
        this.ablyChannel.publish('signal', { to: peerId, from: this.ablyClient.auth.clientId, signal: offer });
      });
    } else {
      pc.ondatachannel = (event) => {
        this.setupDataChannels(peerId, [event.channel]);
      };
    }

    return pc;
  }

  private setupDataChannels(peerId: string, channels: RTCDataChannel[]) {
    const existing = this.dataChannels.get(peerId) || [];
    this.dataChannels.set(peerId, [...existing, ...channels]);
    
    channels.forEach(channel => {
      channel.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chunk') {
          // Convert back from JSON array to ArrayBuffer
          const buffer = new Uint8Array(data.payload).buffer;
          await db.saveChunk(data.fileId, data.chunkIndex, buffer);
          this.onMessage({ type: 'progress', fileId: data.fileId, progress: data.progress });
        } else if (data.type === 'resume_request') {
          // Handle resume logic here
          console.log('Resume requested from chunk:', data.lastIndex);
        } else {
          this.onMessage(data);
        }
      };
    });
  }

  public async sendFile(file: File, onProgress: (p: number) => void) {
    const fileId = Math.random().toString(36).substring(7);
    const chunkSize = 16384; // 16KB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);

    await db.startNewFile({
      fileId,
      fileName: file.name,
      fileSize: file.size,
      totalChunks,
      lastChunkIndex: -1,
      mimeType: file.type
    });

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const chunk = await file.slice(start, end).arrayBuffer();
      
      const payload = {
        type: 'chunk',
        fileId,
        chunkIndex: i,
        payload: Array.from(new Uint8Array(chunk)), // Simplified for JSON
        progress: Math.round(((i + 1) / totalChunks) * 100)
      };

      this.dataChannels.forEach(channels => {
        const channel = channels.find(c => c.readyState === 'open');
        if (channel) channel.send(JSON.stringify(payload));
      });

      onProgress(payload.progress);

      // JUGAD: Speed throttling for free users
      if (this.throttleDelay > 0) {
        await new Promise(r => setTimeout(r, this.throttleDelay));
      }
    }
  }

  public sendData(data: any) {
    this.dataChannels.forEach(channels => {
      const channel = channels.find(c => c.readyState === 'open');
      if (channel) channel.send(JSON.stringify(data));
    });
  }

  public cleanup() {
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.ablyChannel.unsubscribe();
  }
}
