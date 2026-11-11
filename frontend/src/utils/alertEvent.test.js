import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isElevatedZoneStatus, shouldAnnounceLiveEvent } from './alertEvent.js';

describe('isElevatedZoneStatus', () => {
  it('treats danger and warning as elevated', () => {
    assert.equal(isElevatedZoneStatus('🟢 SAFE'), false);
    assert.equal(isElevatedZoneStatus('🟡 WARNING'), true);
    assert.equal(isElevatedZoneStatus('🔴 DANGER: EVACUATE'), true);
    assert.equal(isElevatedZoneStatus(undefined), false);
  });
});

describe('shouldAnnounceLiveEvent', () => {
  it('does not announce routine safe telemetry ticks', () => {
    const tick = { tilt: 4.1, vibration: 2.2, risk_score: 12, zone_status: '🟢 SAFE' };
    assert.equal(shouldAnnounceLiveEvent(tick, null), false);
    assert.equal(shouldAnnounceLiveEvent(tick, '🟢 SAFE'), false);
  });

  it('announces only when elevated status first appears or changes', () => {
    const warning = { tilt: 20, vibration: 8, risk_score: 70, zone_status: '🟡 WARNING' };
    const danger = { tilt: 40, vibration: 12, risk_score: 91, zone_status: '🔴 DANGER: EVACUATE' };
    assert.equal(shouldAnnounceLiveEvent(warning, '🟢 SAFE'), true);
    assert.equal(shouldAnnounceLiveEvent(warning, '🟡 WARNING'), false);
    assert.equal(shouldAnnounceLiveEvent(danger, '🟡 WARNING'), true);
  });

  it('always announces explicit ALERT events from the simulator', () => {
    assert.equal(shouldAnnounceLiveEvent({ type: 'ALERT', node_id: 'NODE-04', risk: 'HIGH' }, null), true);
  });
});
