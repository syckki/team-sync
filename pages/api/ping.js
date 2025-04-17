/**
 * Simple API endpoint for connectivity checks
 * Returns a 200 OK response with the current server timestamp
 */
export default function ping(req, res) {
  res.status(200).json({ 
    timestamp: Date.now(),
    status: 'ok'
  });
}
