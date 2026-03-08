const PREFIX = "[server]";

export function serverLogError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const code = error && typeof error === "object" && "code" in error ? (error as { code?: string }).code : undefined;
  const detail = code ? `${message} (code: ${code})` : message;
  console.error(`${PREFIX} ${context}:`, detail);
}

export function serverLog(message: string, meta?: Record<string, unknown>): void {
  if (Object.keys(meta ?? {}).length > 0) {
    console.error(`${PREFIX} ${message}`, meta);
  } else {
    console.error(`${PREFIX} ${message}`);
  }
}
