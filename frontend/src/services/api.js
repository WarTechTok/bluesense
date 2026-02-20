export async function getLatestReading() {
  const res = await fetch("/api/readings/latest");
  return res.json();
}

export async function getHistory() {
  const res = await fetch("/api/readings/history");
  return res.json();
}
