const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export async function recordPageView() {
  const response = await fetch(`${API_BASE_URL}/api/analytics/page-view`, {
    method: 'POST',
    keepalive: true
  });

  if (!response.ok) {
    throw new Error(`Unable to record website page view (${response.status})`);
  }
}
