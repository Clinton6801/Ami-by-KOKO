/**
 * Offline progress queue.
 * When a child completes a letter/tracing while offline, progress is stored
 * in localStorage. When connection restores, the queue is flushed to the API.
 */

const QUEUE_KEY = "ami_offline_progress_queue";

export interface QueuedProgress {
  childId: string;
  language: string;
  letter: string;
  subject: string;
  mastered: boolean;
  timestamp: string;
}

/** Add a progress item to the offline queue */
export function queueProgress(item: QueuedProgress): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getQueue();
    // Deduplicate — keep latest for same child+language+letter
    const filtered = existing.filter(
      q => !(q.childId === item.childId && q.language === item.language && q.letter === item.letter)
    );
    filtered.push(item);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  } catch {
    // localStorage may be full — silently skip
  }
}

/** Get all queued items */
export function getQueue(): QueuedProgress[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedProgress[]) : [];
  } catch {
    return [];
  }
}

/** Clear the queue */
export function clearQueue(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(QUEUE_KEY);
}

/** Flush the queue to the API when back online */
export async function flushQueue(
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  const queue = getQueue();
  if (queue.length === 0) return;

  let done = 0;
  const failed: QueuedProgress[] = [];

  for (const item of queue) {
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: item.childId,
          language: item.language,
          letter: item.letter,
          subject: item.subject,
          patch: { mastered: item.mastered },
        }),
      });
      if (!res.ok) failed.push(item);
    } catch {
      failed.push(item);
    }
    done++;
    onProgress?.(done, queue.length);
  }

  // Keep only failed items in the queue
  if (failed.length > 0) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
  } else {
    clearQueue();
  }
}
