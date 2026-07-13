export interface OperationalEvent {
  readonly timestamp: string;
  readonly level: "info" | "warn" | "error";
  readonly event: "http.request.completed";
  readonly requestId: string;
  readonly method: string;
  readonly route: string;
  readonly statusCode: number;
  readonly durationMs: number;
}

export type OperationalEventSink = (event: OperationalEvent) => void;

export function serializeOperationalEvent(event: OperationalEvent): string {
  return JSON.stringify(event);
}
