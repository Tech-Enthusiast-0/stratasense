const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const request = async (path, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...(options.headers || {}) }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

export const getApiBaseUrl = () => BASE_URL;
export const getLiveStatus = () => request('/api/live-status');
export const getSensors = () => request('/api/sensors');
export const getSensor = (id) => request(`/api/sensors/${encodeURIComponent(id)}`);
export const getZones = () => request('/api/zones');
export const getZone = (id) => request(`/api/zones/${encodeURIComponent(id)}`);
export const getAlerts = () => request('/api/alerts');
export const healthCheck = () => request('/api/health');

export const getNASAData = async () => {
  try {
    const res = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    const allowedCategories = ['landslides', 'earthquakes'];
    const filteredEvents = data.events.filter(event => 
      event.categories.some(cat => allowedCategories.includes(cat.id))
    );
    
    return filteredEvents
      .sort((a, b) => {
        const dateA = new Date(a.geometry?.[0]?.date || 0);
        const dateB = new Date(b.geometry?.[0]?.date || 0);
        return dateB - dateA;
      })
      .slice(0, 5);
  } catch (error) {
    console.error('Failed to fetch NASA data:', error);
    return [];
  }
};
