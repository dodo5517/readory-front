export interface ApiResponse<T> {
  success: boolean;
  code?: string;
  message?: string;
  data?: T;
}

export class ApiError extends Error {
  code?: string;
  status: number;
  constructor(message: string, code: string | undefined, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export async function unwrap<T>(res: Response): Promise<T> {
  const text = await res.text();
  const body: ApiResponse<T> | null = text ? JSON.parse(text) : null;

  if (!res.ok || (body && !body.success)) {
    throw new ApiError(
      body?.message ?? `요청 실패: ${res.status}`,
      body?.code,
      res.status
    );
  }
  return body?.data as T;
}

export async function unwrapVoid(res: Response): Promise<string | undefined> {
  const text = await res.text();
  const body: ApiResponse<unknown> | null = text ? JSON.parse(text) : null;
  if (!res.ok || (body && !body.success)) {
    throw new ApiError(
      body?.message ?? `요청 실패: ${res.status}`,
      body?.code,
      res.status
    );
  }
  return body?.message;
}
