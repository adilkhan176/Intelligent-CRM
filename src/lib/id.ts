// crypto.randomUUID() only exists in secure contexts (https, or localhost).
// Loading this app over plain http://<lan-ip> — e.g. from a phone on the
// same Wi-Fi — is not a secure context, so avoid it entirely here; these
// ids only need to be unique within the demo session, not cryptographic.
export function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
