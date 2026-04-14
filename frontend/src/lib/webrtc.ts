import { db } from './storage';

export interface SignalData {
  from: string;
  signal: RTCSessionDescriptionInit | RTCIceCandidateInit | { candidate: RTCIceCandidate };
}

export class WebRTCManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel[]> = new Map();
  private isPro: boolean = false;
  private throttleDelay: number = 0; // ms between chunks
  private channelIndex: number = 0;

  constructor(
    private roomId: string, 
    private ablyClient: any,
    private ablyChannel: any,
    private onMessage: (msg: any) => void,
    isPro: boolean = false
  ) {
    this.isPro = isPro;
    // PRO JUGAD: Faster transfer for paid users
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

  private generateFileId(file: File) {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }

  private setupDataChannels(peerId: string, channels: RTCDataChannel[]) {
    const existing = this.dataChannels.get(peerId) || [];
    this.dataChannels.set(peerId, [...existing, ...channels]);
    
    channels.forEach(channel => {
      channel.binaryType = 'arraybuffer';
      channel.onmessage = async (event) => {
        if (event.data instanceof ArrayBuffer) {
           // Binary Chunk JUGAD: We handle this based on current active transfer
           const active = (this as any).activeTransfer;
           if (active) {
             await db.saveChunk(active.fileId, active.currentIndex, event.data);
             active.currentIndex++;
             const progress = Math.round((active.currentIndex / active.totalChunks) * 100);
             this.onMessage({ type: 'progress', fileId: active.fileId, progress });
             
             if (active.currentIndex === active.totalChunks) {
               this.onMessage({ type: 'file_complete', fileId: active.fileId });
               (this as any).activeTransfer = null;
             }
           }
           return;
        }

        const data = JSON.parse(event.data);
        if (data.type === 'file_init') {
          const meta = await db.getFileMeta(data.fileId);
          const lastIndex = meta ? meta.lastChunkIndex : -1;
          
          (this as any).activeTransfer = { 
            fileId: data.fileId, 
            currentIndex: lastIndex + 1, 
            totalChunks: data.totalChunks 
          };

          this.sendData({ type: 'file_ready', fileId: data.fileId, lastIndex });
        } else if (data.type === 'file_ready') {
          // Sender side: Start from lastIndex + 1
          (this as any).resumeIndex = data.lastIndex + 1;
          (this as any).waitingForReady = false;
        } else {
          this.onMessage(data);
        }
      };
    });
  }

  public async sendFile(file: File, onProgress: (p: number) => void) {
    const fileId = this.generateFileId(file);
    const chunkSize = 16384 * (this.isPro ? 4 : 1);
    const totalChunks = Math.ceil(file.size / chunkSize);

    // Handshake: Inform receiver
    this.sendData({ type: 'file_init', fileId, totalChunks, fileName: file.name });
    
    // Wait for receiver to be ready (JUGAD: busy wait or promise)
    (this as any).waitingForReady = true;
    while ((this as any).waitingForReady) {
      await new Promise(r => setTimeout(r, 100));
    }

    const startChunk = (this as any).resumeIndex || 0;

    await db.startNewFile({
      fileId,
      fileName: file.name,
      fileSize: file.size,
      totalChunks,
      lastChunkIndex: startChunk - 1,
      mimeType: file.type
    });

    for (let i = startChunk; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const chunk = await file.slice(start, end).arrayBuffer();
      
      this.dataChannels.forEach(channels => {
        const openChannels = channels.filter(c => c.readyState === 'open');
        if (openChannels.length > 0) {
          const channel = openChannels[this.channelIndex % openChannels.length];
          channel.send(chunk);
          this.channelIndex++;
        }
      });

      onProgress(Math.round(((i + 1) / totalChunks) * 100));

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
