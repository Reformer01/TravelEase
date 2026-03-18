'use client';

// Firebase removed: these are intentionally no-ops kept only for legacy import compatibility.
export function setDocumentNonBlocking(): void {
  return;
}

export function addDocumentNonBlocking(): Promise<null> {
  return Promise.resolve(null);
}

export function updateDocumentNonBlocking(): void {
  return;
}

export function deleteDocumentNonBlocking(): void {
  return;
}