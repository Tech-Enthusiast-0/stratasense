import { useState, useEffect } from 'react';
import { getNASAData } from '../services/api';
import { Globe } from 'lucide-react';

export default function NasaWidget() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getNASAData();
      setEvents(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <section className="card">
      <div className="panel-head">
        <div>
          <span className="eyebrow">GLOBAL HAZARDS</span>
          <h2>NASA EONET API</h2>
        </div>
        <Globe size={20} className="text-blue-400" />
      </div>
      {loading ? (
        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
          Syncing with NASA satellites...
        </div>
      ) : events.length === 0 ? (
        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
          No active landslides or earthquakes reported.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {events.map((event) => (
            <div key={event.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{event.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#aaa', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ textTransform: 'capitalize' }}>{event.categories[0]?.title}</span>
                <span>{new Date(event.geometry?.[0]?.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
