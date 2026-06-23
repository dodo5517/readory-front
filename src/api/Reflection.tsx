import { fetchWithAuth } from '../utils/fetchWithAuth';

export interface Cluster {
  theme: string;
  summary: string;
  indices: number[];
  thin: boolean;
}

export interface ReflectionSection {
  heading: string;
  body: string;
}

export interface ComposeHandlers {
  onClustered?: (d: { tone: string; clusters: Cluster[] }) => void;
  onOutline?: (d: { title: string; tone: string; sections: { heading: string; clusterIndices: number[] }[] }) => void;
  onSection?: (d: ReflectionSection) => void;
  onDone?: (d: { reflectionId: number | null }) => void;
  onError?: (msg: string) => void;
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
    case 'clustered':
      handlers.onClustered?.(parsed);
      break;
    case 'outline':
      handlers.onOutline?.(parsed);
      break;
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
  bookId: number,
  handlers: ComposeHandlers,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await fetchWithAuth(`/reflection/compose?bookId=${bookId}`, {
      method: 'GET',
      headers: { 'Accept': 'text/event-stream' },
      signal,
    });

    if (!response.ok) {
      let msg = `요청 실패 (${response.status})`;
      try {
        const body = await response.json();
        msg = body?.message ?? msg;
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
