/**
 * Simple ping endpoint for connection testing
 * Used to verify network connectivity from the client
 */
export default function handler(req, res) {
  res.status(200).json({ success: true, timestamp: Date.now() });
}