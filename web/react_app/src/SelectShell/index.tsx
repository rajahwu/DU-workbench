import React, { useState } from 'react';
// Import your engine transition logic
import { transition } from '@du/phases';
import './style.css';

// Using your exact data payloads
const vesselData = {
  seraph: {
    id: 'seraph', label: 'Class I', name: 'Seraph', code: 'SIG-SER-001', subtitle: 'the burning ones',
    primaryHue: '#D4A843', lightBias: 85, darkBias: 15, resilience: 40, stealth: 20, biasText: 'LIGHT: HIGH',
    theology: 'Six-winged throne guardians. Their proximity to the source burns away impurity — or annihilates those too fragile to withstand it. In the Dudael Drop, a Seraph vessel channels light as both weapon and liability.',
    playstyle: 'High-light aggressive. Cards skew toward sanctified damage and purification effects. Vulnerable in deep Dark zones but devastating in Light-dominant encounters.',
    tags: ['SANCTIFIED', 'HIGH-LIGHT', 'PURIFIER'],
    assets: ['SIG_VesselSeraph_v01', 'ICN_VesselSeraph_v01', 'EMB_VesselSeraph_v01', 'CPT_VesselSeraph_v01']
  },
  shadow: {
    id: 'shadow', label: 'Class II', name: 'Shadow', code: 'SIG-SHD-001', subtitle: 'the hidden ones',
    primaryHue: '#7B4FA2', lightBias: 20, darkBias: 80, resilience: 60, stealth: 90, biasText: 'LIGHT: LOW',
    theology: 'Those who chose to dwell between the cracks. Shadow vessels operate in the negative space of the theological order — not fallen, but absent. In Dudael, they exploit blind spots in both Light and Dark systems.',
    playstyle: 'Stealth-oriented Dark specialist. Cards emphasize evasion, misdirection, and exploiting opponent positioning. Thrives in ambiguity, struggles in direct confrontation.',
    tags: ['QUARANTINE', 'HIGH-DARK', 'INFILTRATOR'],
    assets: ['SIG_VesselShadow_v01', 'ICN_VesselShadow_v01', 'EMB_VesselShadow_v01', 'CPT_VesselShadow_v01']
  },
  exile: {
    id: 'exile', label: 'Class III', name: 'Exile', code: 'SIG-EXL-001', subtitle: 'the displaced ones',
    primaryHue: '#8BA0B5', lightBias: 50, darkBias: 50, resilience: 70, stealth: 50, biasText: 'LIGHT: NEUTRAL',
    theology: 'Neither aligned nor condemned. Exile vessels were stripped of their original assignment and exist in a state of jurisdictional limbo. In Dudael, they adapt to whatever parity the Depth demands.',
    playstyle: 'Adaptive generalist. Cards can shift between Light and Dark depending on context. No ceiling advantage but no floor weakness — the balanced survivor.',
    tags: ['CONTAINMENT', 'NEUTRAL', 'ADAPTIVE'],
    assets: ['SIG_VesselExile_v01', 'ICN_VesselExile_v01', 'EMB_VesselExile_v01', 'CPT_VesselExile_v01']
  },
  penitent: {
    id: 'penitent', label: 'Class IV', name: 'Penitent', code: 'SIG-PEN-001', subtitle: 'the bowed ones',
    primaryHue: '#D4A04A', lightBias: 65, darkBias: 35, resilience: 80, stealth: 30, biasText: 'LIGHT: MED-HIGH',
    theology: 'Former transgressors seeking restoration through descent. The Penitent enters Dudael voluntarily as an act of atonement — the Drop is their liturgy. Each Depth cleared is a step toward rehabilitation.',
    playstyle: 'Endurance tank with Light lean. Cards emphasize absorption, sacrifice effects, and gradual Light accumulation. Slow but incredibly durable across long Depth runs.',
    tags: ['EVIDENCE', 'MED-LIGHT', 'ENDURANCE'],
    assets: ['SIG_VesselPenitent_v01', 'ICN_VesselPenitent_v01', 'EMB_VesselPenitent_v01', 'CPT_VesselPenitent_v01']
  },
  rebel: {
    id: 'rebel', label: 'Class V', name: 'Rebel', code: 'SIG-RBL-001', subtitle: 'the defiant ones',
    primaryHue: '#C04050', lightBias: 35, darkBias: 65, resilience: 50, stealth: 40, biasText: 'LIGHT: LOW-MED',
    theology: 'Those who rejected both the original order and the quarantine. Rebel vessels view Dudael not as containment but as a system to be broken. Their descent is not penance — it is siege.',
    playstyle: 'Aggressive Dark-leaning disruptor. Cards emphasize breaking enemy defenses, parity manipulation, and high-risk/high-reward plays. Glass cannon with momentum mechanics.',
    tags: ['BREACH', 'MED-DARK', 'DISRUPTOR'],
    assets: ['SIG_VesselRebel_v01', 'ICN_VesselRebel_v01', 'EMB_VesselRebel_v01', 'CPT_VesselRebel_v01']
  }
};

const svgTemplates = {
  seraph: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><radialGradient id="sg" cx="50%" cy="50%" r="35%"><stop offset="0%" stop-color="#D4A843" stop-opacity="0.3"/><stop offset="100%" stop-color="#D4A843" stop-opacity="0"/></radialGradient><filter id="gl"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="400" height="400" fill="transparent"/><line x1="200" y1="0" x2="200" y2="400" stroke="#1A1C24" stroke-width=".5"/><line x1="0" y1="200" x2="400" y2="200" stroke="#1A1C24" stroke-width=".5"/><circle cx="200" cy="200" r="150" fill="url(#sg)"/><circle cx="200" cy="200" r="140" fill="none" stroke="#2A2D38" stroke-width=".5"/><circle cx="200" cy="200" r="120" fill="none" stroke="#D4A843" stroke-width=".3" opacity=".3"/><circle cx="200" cy="200" r="100" fill="none" stroke="#D4A843" stroke-width=".8" opacity=".7"/><circle cx="200" cy="200" r="60" fill="none" stroke="#D4A843" stroke-width=".4" opacity=".5"/><g stroke="#D4A843" stroke-width=".6" opacity=".6" filter="url(#gl)"><line x1="200" y1="200" x2="200" y2="80"/><line x1="200" y1="200" x2="303.9" y2="140"/><line x1="200" y1="200" x2="303.9" y2="260"/><line x1="200" y1="200" x2="200" y2="320"/><line x1="200" y1="200" x2="96.1" y2="260"/><line x1="200" y1="200" x2="96.1" y2="140"/></g><polygon points="200,105 282,152.5 282,247.5 200,295 118,247.5 118,152.5" fill="none" stroke="#D4A843" stroke-width=".5" opacity=".4"/><g transform="translate(200,200)" filter="url(#gl)"><ellipse cx="0" cy="-15" rx="8" ry="30" fill="none" stroke="#D4A843" stroke-width="1" opacity=".8"/><ellipse cx="0" cy="-15" rx="8" ry="30" fill="none" stroke="#D4A843" stroke-width="1" opacity=".6" transform="rotate(60)"/><ellipse cx="0" cy="-15" rx="8" ry="30" fill="none" stroke="#D4A843" stroke-width="1" opacity=".6" transform="rotate(120)"/><ellipse cx="0" cy="-15" rx="8" ry="30" fill="none" stroke="#D4A843" stroke-width="1" opacity=".8" transform="rotate(180)"/><ellipse cx="0" cy="-15" rx="8" ry="30" fill="none" stroke="#D4A843" stroke-width="1" opacity=".6" transform="rotate(240)"/><ellipse cx="0" cy="-15" rx="8" ry="30" fill="none" stroke="#D4A843" stroke-width="1" opacity=".6" transform="rotate(300)"/><circle cx="0" cy="0" r="8" fill="#D4A843" fill-opacity=".15" stroke="#D4A843" stroke-width="1"/><circle cx="0" cy="0" r="3" fill="#D4A843" fill-opacity=".9"/></g></svg>`,
  shadow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><radialGradient id="sg" cx="50%" cy="50%" r="35%"><stop offset="0%" stop-color="#4A2D6B" stop-opacity=".35"/><stop offset="100%" stop-color="#4A2D6B" stop-opacity="0"/></radialGradient><filter id="gl"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="400" height="400" fill="transparent"/><line x1="200" y1="0" x2="200" y2="400" stroke="#1A1C24" stroke-width=".5"/><line x1="0" y1="200" x2="400" y2="200" stroke="#1A1C24" stroke-width=".5"/><circle cx="200" cy="200" r="150" fill="url(#sg)"/><circle cx="200" cy="200" r="140" fill="none" stroke="#2A2D38" stroke-width=".5"/><circle cx="200" cy="200" r="120" fill="none" stroke="#4A2D6B" stroke-width=".3" opacity=".3" stroke-dasharray="4 8"/><circle cx="200" cy="200" r="100" fill="none" stroke="#4A2D6B" stroke-width=".8" opacity=".7"/><circle cx="200" cy="200" r="60" fill="none" stroke="#4A2D6B" stroke-width=".4" opacity=".5"/><g stroke="#4A2D6B" stroke-width=".6" opacity=".5" filter="url(#gl)"><line x1="200" y1="200" x2="200" y2="80"/><line x1="200" y1="200" x2="270.7" y2="129.3" stroke-dasharray="3 5"/><line x1="200" y1="200" x2="320" y2="200"/><line x1="200" y1="200" x2="270.7" y2="270.7" stroke-dasharray="3 5"/><line x1="200" y1="200" x2="200" y2="320"/><line x1="200" y1="200" x2="129.3" y2="270.7" stroke-dasharray="3 5"/><line x1="200" y1="200" x2="80" y2="200"/><line x1="200" y1="200" x2="129.3" y2="129.3" stroke-dasharray="3 5"/></g><g stroke="#4A2D6B" stroke-width=".5" opacity=".4"><line x1="200" y1="115" x2="260" y2="140"/><line x1="285" y1="200" x2="260" y2="260"/><line x1="200" y1="285" x2="140" y2="260"/><line x1="115" y1="200" x2="140" y2="140"/></g><g transform="translate(200,200)" filter="url(#gl)"><circle cx="0" cy="0" r="22" fill="none" stroke="#7B4FA2" stroke-width=".8" opacity=".6"/><circle cx="-5" cy="0" r="18" fill="#4A2D6B" fill-opacity=".3" stroke="#7B4FA2" stroke-width=".6"/><circle cx="5" cy="0" r="16" fill="#0D0E12"/><circle cx="-2" cy="0" r="3" fill="#7B4FA2" fill-opacity=".4"/><circle cx="-2" cy="0" r="1.2" fill="#7B4FA2" fill-opacity=".8"/></g></svg>`,
  exile: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><radialGradient id="sg" cx="50%" cy="50%" r="35%"><stop offset="0%" stop-color="#6B7B8D" stop-opacity=".25"/><stop offset="100%" stop-color="#6B7B8D" stop-opacity="0"/></radialGradient><filter id="gl"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="400" height="400" fill="transparent"/><line x1="200" y1="0" x2="200" y2="400" stroke="#1A1C24" stroke-width=".5"/><line x1="0" y1="200" x2="400" y2="200" stroke="#1A1C24" stroke-width=".5"/><circle cx="200" cy="200" r="150" fill="url(#sg)"/><circle cx="200" cy="200" r="140" fill="none" stroke="#2A2D38" stroke-width=".5"/><circle cx="200" cy="200" r="120" fill="none" stroke="#6B7B8D" stroke-width=".3" opacity=".3"/><path d="M 200 100 A 100 100 0 0 1 296 168" fill="none" stroke="#6B7B8D" stroke-width=".8" opacity=".7"/><path d="M 287 240 A 100 100 0 0 1 113 240" fill="none" stroke="#6B7B8D" stroke-width=".8" opacity=".7"/><path d="M 104 168 A 100 100 0 0 1 190 100" fill="none" stroke="#6B7B8D" stroke-width=".8" opacity=".7"/><circle cx="200" cy="200" r="60" fill="none" stroke="#6B7B8D" stroke-width=".4" opacity=".5"/><g filter="url(#gl)"><rect x="158" y="158" width="84" height="84" fill="none" stroke="#6B7B8D" stroke-width=".6" opacity=".6" transform="rotate(12,200,200)"/><rect x="160" y="160" width="80" height="80" fill="none" stroke="#6B7B8D" stroke-width=".3" opacity=".2" stroke-dasharray="2 4"/></g><g stroke="#6B7B8D" stroke-width=".5" opacity=".4"><line x1="200" y1="200" x2="200" y2="90"/><line x1="200" y1="200" x2="310" y2="200"/><line x1="200" y1="200" x2="200" y2="310"/><line x1="200" y1="200" x2="90" y2="200"/></g><g transform="translate(200,200)" filter="url(#gl)"><circle cx="0" cy="0" r="12" fill="none" stroke="#8BA0B5" stroke-width=".6" opacity=".7"/><line x1="0" y1="-16" x2="0" y2="-8" stroke="#8BA0B5" stroke-width="1" opacity=".3"/><line x1="16" y1="0" x2="8" y2="0" stroke="#8BA0B5" stroke-width="1" opacity=".8"/><line x1="0" y1="16" x2="0" y2="8" stroke="#8BA0B5" stroke-width="1" opacity=".8"/><line x1="-16" y1="0" x2="-8" y2="0" stroke="#8BA0B5" stroke-width="1" opacity=".8"/><circle cx="2" cy="-1" r="2.5" fill="#8BA0B5" fill-opacity=".6"/></g></svg>`,
  penitent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><radialGradient id="sg" cx="50%" cy="50%" r="35%"><stop offset="0%" stop-color="#B8863B" stop-opacity=".28"/><stop offset="100%" stop-color="#B8863B" stop-opacity="0"/></radialGradient><filter id="gl"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="400" height="400" fill="transparent"/><line x1="200" y1="0" x2="200" y2="400" stroke="#1A1C24" stroke-width=".5"/><line x1="0" y1="200" x2="400" y2="200" stroke="#1A1C24" stroke-width=".5"/><circle cx="200" cy="200" r="150" fill="url(#sg)"/><circle cx="200" cy="200" r="140" fill="none" stroke="#2A2D38" stroke-width=".5"/><circle cx="200" cy="200" r="120" fill="none" stroke="#B8863B" stroke-width=".3" opacity=".25"/><circle cx="200" cy="200" r="100" fill="none" stroke="#B8863B" stroke-width=".8" opacity=".6"/><circle cx="200" cy="200" r="60" fill="none" stroke="#B8863B" stroke-width=".4" opacity=".4"/><g filter="url(#gl)"><polygon points="200,290 130,140 270,140" fill="none" stroke="#B8863B" stroke-width=".7" opacity=".6"/><polygon points="200,260 155,165 245,165" fill="none" stroke="#D4A04A" stroke-width=".4" opacity=".35"/><line x1="200" y1="100" x2="200" y2="295" stroke="#B8863B" stroke-width=".4" opacity=".5"/></g><g stroke="#B8863B" stroke-width=".4" opacity=".3"><line x1="160" y1="175" x2="240" y2="175"/><line x1="168" y1="205" x2="232" y2="205"/><line x1="176" y1="235" x2="224" y2="235"/></g><g transform="translate(200,200)" filter="url(#gl)"><path d="M 0,-18 C 10,-10 12,2 8,12 C 5,18 -5,18 -8,12 C -12,2 -10,-10 0,-18 Z" fill="#B8863B" fill-opacity=".12" stroke="#D4A04A" stroke-width=".7" opacity=".7"/><circle cx="0" cy="4" r="5" fill="none" stroke="#D4A04A" stroke-width=".5" opacity=".6"/><circle cx="0" cy="4" r="2" fill="#D4A04A" fill-opacity=".7"/></g></svg>`,
  rebel: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><radialGradient id="sg" cx="50%" cy="50%" r="35%"><stop offset="0%" stop-color="#8B2D3A" stop-opacity=".3"/><stop offset="100%" stop-color="#8B2D3A" stop-opacity="0"/></radialGradient><filter id="gl"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="400" height="400" fill="transparent"/><line x1="200" y1="0" x2="200" y2="400" stroke="#1A1C24" stroke-width=".5"/><line x1="0" y1="200" x2="400" y2="200" stroke="#1A1C24" stroke-width=".5"/><circle cx="200" cy="200" r="150" fill="url(#sg)"/><circle cx="200" cy="200" r="140" fill="none" stroke="#2A2D38" stroke-width=".5"/><circle cx="200" cy="200" r="120" fill="none" stroke="#8B2D3A" stroke-width=".3" opacity=".3"/><path d="M 200 100 A 100 100 0 0 1 290 230" fill="none" stroke="#8B2D3A" stroke-width=".8" opacity=".7"/><path d="M 280 250 A 100 100 0 0 1 110 230" fill="none" stroke="#8B2D3A" stroke-width=".8" opacity=".7"/><path d="M 108 215 A 100 100 0 0 1 195 100" fill="none" stroke="#8B2D3A" stroke-width=".8" opacity=".7"/><circle cx="200" cy="200" r="60" fill="none" stroke="#8B2D3A" stroke-width=".4" opacity=".5"/><g filter="url(#gl)"><polyline points="130,260 200,130 270,260" fill="none" stroke="#C04050" stroke-width=".8" opacity=".6"/><polyline points="155,240 200,160 245,240" fill="none" stroke="#8B2D3A" stroke-width=".5" opacity=".4"/><line x1="200" y1="130" x2="200" y2="85" stroke="#C04050" stroke-width=".5" opacity=".5"/><line x1="200" y1="130" x2="175" y2="95" stroke="#C04050" stroke-width=".3" opacity=".3"/><line x1="200" y1="130" x2="225" y2="95" stroke="#C04050" stroke-width=".3" opacity=".3"/></g><g transform="translate(200,200)" filter="url(#gl)"><path d="M 0,-15 A 15 15 0 0 1 13,7.5" fill="none" stroke="#C04050" stroke-width=".8" opacity=".7"/><path d="M 10,11 A 15 15 0 0 1 -13,7.5" fill="none" stroke="#C04050" stroke-width=".8" opacity=".7"/><path d="M -10,11 A 15 15 0 0 1 -3,-15" fill="none" stroke="#C04050" stroke-width=".8" opacity=".7"/><line x1="-8" y1="-8" x2="8" y2="8" stroke="#C04050" stroke-width="1.2" opacity=".8"/><line x1="8" y1="-8" x2="-8" y2="8" stroke="#C04050" stroke-width="1.2" opacity=".8"/><circle cx="0" cy="0" r="2" fill="#C04050" fill-opacity=".9"/></g></svg>`
};

export default function SelectShell() {
  const [activeVesselId, setActiveVesselId] = useState<keyof typeof vesselData>('seraph');
  const activeData = vesselData[activeVesselId];

  const handleLockVessel = () => {
    console.log(`Locking in vessel: ${activeData.name}`);

    // We get the active packet from storage (saved during 01_title exchange)
    const rawPacket = localStorage.getItem("dudael:active_packet");
    const packet = rawPacket ? JSON.parse(rawPacket) : { ts: Date.now(), user: { id: "guest", kind: "user" } };

    // Attach the selected identity data
    const updatedPacket = {
      ...packet,
      from: "02_select",
      to: "03_staging",
      player: {
        ...(packet.player || {}),
        vessel: activeVesselId,
      }
    };

    // Fire the engine transition
    transition("03_staging", updatedPacket);
  };

  return (
    <div className="vessel-registry-wrapper">
      <div className="registry-header">
        <div className="registry-title">
          Sinerine Forensic Archive
          <span>Vessel Classification Registry</span>
        </div>
        <div className="registry-meta">
          DOCUMENT: VESSEL-SIG-MASTER<br />
          VERSION: V-00 // INITIAL CLASSIFICATION<br />
          STATUS: ACTIVE CONTAINMENT
        </div>
      </div>

      <div className="vessel-grid">
        {Object.values(vesselData).map((vessel) => (
          <div
            key={vessel.id}
            className={`vessel-cell ${activeVesselId === vessel.id ? 'active' : ''}`}
            data-vessel={vessel.id}
            onClick={() => setActiveVesselId(vessel.id as keyof typeof vesselData)}
          >
            <div className="vessel-label">{vessel.label}</div>
            <div className="vessel-name">{vessel.name}</div>
            <div className="vessel-subtitle">{vessel.subtitle}</div>
            <div className="vessel-bias">{vessel.biasText}</div>
          </div>
        ))}
      </div>

      <div className="display-area">
        <div className="sigil-viewport">
          <div
            key={activeVesselId} // Forces re-render for animation trigger
            dangerouslySetInnerHTML={{ __html: svgTemplates[activeVesselId] }}
          />
        </div>

        <div className="data-panel">
          <div className="data-section">
            <div className="data-label">Classification</div>
            <div className="data-value">
              <strong style={{ color: activeData.primaryHue }}>{activeData.name}</strong> — {activeData.subtitle}<br />
              <span style={{ fontSize: '8px', color: '#3A3D48' }}>{activeData.code}</span>
            </div>
            <div style={{ marginTop: '8px' }}>
              {activeData.tags.map((t, idx) => (
                <span key={idx} className="classification-tag" style={{ borderColor: `${activeData.primaryHue}40`, color: `${activeData.primaryHue}90` }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="data-section">
            <div className="data-label">Spectral Analysis</div>
            <div className="stat-bar-container">
              <span className="stat-label">Light</span>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: `${activeData.lightBias}%`, background: activeData.primaryHue }} />
              </div>
              <span className="stat-value">{activeData.lightBias}</span>
            </div>
            <div className="stat-bar-container">
              <span className="stat-label">Dark</span>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: `${activeData.darkBias}%`, background: '#4A2D6B' }} />
              </div>
              <span className="stat-value">{activeData.darkBias}</span>
            </div>
            <div className="stat-bar-container">
              <span className="stat-label">Resilience</span>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: `${activeData.resilience}%`, background: '#6B7B8D' }} />
              </div>
              <span className="stat-value">{activeData.resilience}</span>
            </div>
            <div className="stat-bar-container">
              <span className="stat-label">Stealth</span>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: `${activeData.stealth}%`, background: '#3A3D48' }} />
              </div>
              <span className="stat-value">{activeData.stealth}</span>
            </div>
          </div>

          <div className="data-section">
            <div className="data-label">Theological Profile</div>
            <div className="theology-note">{activeData.theology}</div>
          </div>

          <div className="data-section">
            <div className="data-label">Playstyle Designation</div>
            <div className="data-value" style={{ fontSize: '10px', lineHeight: 1.8 }}>{activeData.playstyle}</div>
          </div>

          <button
            className="lock-button"
            style={{ borderColor: activeData.primaryHue, color: activeData.primaryHue }}
            onClick={handleLockVessel}
          >
            Lock Vessel
          </button>
        </div>
      </div>

      <div
        className="spectral-footer"
        style={{ background: `linear-gradient(90deg, transparent, ${activeData.primaryHue}60, ${activeData.primaryHue}, ${activeData.primaryHue}60, transparent)` }}
      />
    </div>
  );
}