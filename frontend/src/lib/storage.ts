import Dexie, { Table } from 'dexie';

export interface Chunk {
  id?: number;
  fileId: string;
  chunkIndex: number;
  data: ArrayBuffer;
}

export interface FileMeta {
  fileId: string;
  fileName: string;
  fileSize: number;
  totalChunks: number;
  lastChunkIndex: number;
  mimeType: string;
}

export class FrankDropDB extends Dexie {
  chunks!: Table<Chunk>;
  meta!: Table<FileMeta>;

  constructor() {
    super('FrankDropDB');
    this.version(1).stores({
      chunks: '++id, fileId, chunkIndex',
      meta: 'fileId'
    });
  }

  async saveChunk(fileId: string, chunkIndex: number, data: ArrayBuffer) {
    await this.chunks.add({ fileId, chunkIndex, data });
    const meta = await this.meta.get(fileId);
    if (meta && chunkIndex > meta.lastChunkIndex) {
      await this.meta.update(fileId, { lastChunkIndex: chunkIndex });
    }
  }

  async getFileMeta(fileId: string): Promise<FileMeta | undefined> {
    return await this.meta.get(fileId);
  }

  async getFileProgress(fileId: string) {
    const meta = await this.meta.get(fileId);
    return meta ? meta.lastChunkIndex : -1;
  }

  async startNewFile(meta: FileMeta) {
    await this.meta.put(meta);
  }

  async assembleFile(fileId: string) {
    const meta = await this.meta.get(fileId);
    if (!meta) throw new Error('File metadata not found');

    const chunks = await this.chunks
      .where('fileId')
      .equals(fileId)
      .sortBy('chunkIndex');

    if (chunks.length < meta.totalChunks) {
      throw new Error(`Missing chunks: ${chunks.length}/${meta.totalChunks}`);
    }

    const blob = new Blob(chunks.map(c => c.data), { type: meta.mimeType });
    const url = URL.createObjectURL(blob);
    
    return { url, fileName: meta.fileName };
  }

  async cleanup(fileId: string) {
    await this.chunks.where('fileId').equals(fileId).delete();
    await this.meta.delete(fileId);
  }
}

export const db = typeof window !== 'undefined' ? new FrankDropDB() : null;
