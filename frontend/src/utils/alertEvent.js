export function isElevatedZoneStatus(zoneStatus) {
  const status = String(zoneStatus || '').toUpperCase();
  return status.includes('DANGER') || status.includes('WARNING') || status.includes('CRITICAL');
}

export function shouldAnnounceLiveEvent(event, previousZoneStatus) {
  if (!event) return false;
  if (event.type === 'ALERT') return true;
  if (!isElevatedZoneStatus(event.zone_status)) return false;
  return String(event.zone_status).toUpperCase() !== String(previousZoneStatus || '').toUpperCase();
}
