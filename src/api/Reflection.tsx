import { fetchWithAuth } from '../utils/fetchWithAuth';
import { unwrap } from '../utils/apiResponse';

export interface Cluster {
  theme: string;
  summary: string;
  indices: number[];
  thin: boolean;
}

export interface ReflectionSection {
  heading: string;
  body: string;
  closing?: string; // "true"면 맺음말 섹션
}

export interface ClusterResult {
  tone: string;
  clusters: Cluster[];
  title: string;
  sections: { heading: string; clusterIndices: number[] }[];
}

export interface ComposeHandlers {
  onSection?: (s: ReflectionSection) => void;
  onDone?: (d: { reflectionId: number | null }) => void;
  onError?: (msg: string) => void;
}

export interface ElicitClusterInput {
  theme: string;
  summary: string;
  thin: boolean;
}

export interface ElicitTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ElicitResponse {
  reply: string;
  fragment: string;
  theme: string;
  closing: boolean;
}

export interface DrawnPair {
  question: string;
  answer: string;
}

export async function clusterReflection(bookId: number): Promise<ClusterResult> {
  const res = await fetchWithAuth(`/reflection/cluster?bookId=${bookId}`, { method: 'POST' });
  return unwrap<ClusterResult>(res);
}

export async function elicit(params: {
  bookId: number;
  tone?: string;
  clusters: ElicitClusterInput[];
  history: ElicitTurn[];
}): Promise<ElicitResponse> {
  const res = await fetchWithAuth(`/reflection/elicit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return unwrap<ElicitResponse>(res);
}

export async function saveDrawn(bookId: number, pairs: DrawnPair[]): Promise<number> {
  const res = await fetchWithAuth(`/reflection/elicit/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookId, pairs }),
  });
  return unwrap<number>(res);
}

function parseAndDispatch(frame: string, handlers: ComposeHandlers): void {
  let eventType = '';
  const dataLines: string[] = [];

  for (const line of frame.split('\n')) {
    if (line.startsWith('event:')) {
      eventType = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (!eventType || !dataLines.length) return;

  let parsed: any;
  try {
    parsed = JSON.parse(dataLines.join('\n'));
  } catch {
    return;
  }

  switch (eventType) {
    case 'section':
      handlers.onSection?.(parsed);
      break;
    case 'done':
      handlers.onDone?.(parsed);
      break;
    case 'error':
      handlers.onError?.(parsed.message ?? '알 수 없는 오류');
      break;
  }
}

export async function composeReflection(
  body: {
    bookId: number;
    tone: string;
    clusters: Cluster[];
    sections: { heading: string; clusterIndices: number[] }[];
  },
  handlers: ComposeHandlers,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await fetchWithAuth(`/reflection/compose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      let msg = `요청 실패 (${response.status})`;
      try {
        const errBody = await response.json();
        msg = errBody?.message ?? msg;
      } catch {}
      handlers.onError?.(msg);
      return;
    }

    if (!response.body) {
      handlers.onError?.('스트림을 읽을 수 없습니다.');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split('\n\n');
        buffer = frames.pop() ?? '';

        for (const frame of frames) {
          if (frame.trim()) parseAndDispatch(frame, handlers);
        }
      }
      if (buffer.trim()) parseAndDispatch(buffer, handlers);
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      throw e;
    } finally {
      reader.releaseLock();
    }
  } catch (e: any) {
    if (e?.name === 'AbortError') return;
    handlers.onError?.(e?.message ?? '오류가 발생했습니다.');
  }
}
