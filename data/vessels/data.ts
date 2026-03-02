import { VesselId, VesselMechanics } from './vessels';

export type VesselData = {
    id: VesselId;
    label: string;
    name: string;
    code: string;
    subtitle: string;
    primaryHue: string;
    lightBias: number;   // for flavor text and potential UI use
    darkBias: number;    // for flavor text and potential UI use
    resilience: number;  // for flavor text and potential UI use
    stealth: number;     // for flavor text and potential UI use
    biasText: string;    // for flavor text and potential UI use
    theology: string;    // for flavor text and potential UI use
    playstyle: string;   // for flavor text and potential UI use
    tags: string[];      // for flavor text and potential UI use
    assets: string[];    // for flavor text and potential UI use
    mechanics?: VesselMechanics[]; // optional field for any specific mechanics or keywords associated with the vessel
}; // placeholder for any additional data we want to track per vessel in the packet

export type VesselDataRecordKey = 'seraph' | 'shadow' | 'exile' | 'penitent' | 'rebel';

const VESSEL_DATA: Record<VesselDataRecordKey, VesselData> = {
    seraph: {
        id: 'SERAPH', label: 'Class I', name: 'Seraph', code: 'SIG-SER-001', subtitle: 'the burning ones',
        primaryHue: '#D4A843', lightBias: 85, darkBias: 15, resilience: 40, stealth: 20, biasText: 'LIGHT: HIGH',
        theology: 'Six-winged throne guardians. Their proximity to the source burns away impurity — or annihilates those too fragile to withstand it. In the Dudael Drop, a Seraph vessel channels light as both weapon and liability.',
        playstyle: 'High-light aggressive. Cards skew toward sanctified damage and purification effects. Vulnerable in deep Dark zones but devastating in Light-dominant encounters.',
        tags: ['SANCTIFIED', 'HIGH-LIGHT', 'PURIFIER'],
        assets: ['SIG_VesselSeraph_v01', 'ICN_VesselSeraph_v01', 'EMB_VesselSeraph_v01', 'CPT_VesselSeraph_v01']
    },
    shadow: {
        id: 'SHADOW', label: 'Class II', name: 'Shadow', code: 'SIG-SHD-001', subtitle: 'the hidden ones',
        primaryHue: '#7B4FA2', lightBias: 20, darkBias: 80, resilience: 60, stealth: 90, biasText: 'LIGHT: LOW',
        theology: 'Those who chose to dwell between the cracks. Shadow vessels operate in the negative space of the theological order — not fallen, but absent. In Dudael, they exploit blind spots in both Light and Dark systems.',
        playstyle: 'Stealth-oriented Dark specialist. Cards emphasize evasion, misdirection, and exploiting opponent positioning. Thrives in ambiguity, struggles in direct confrontation.',
        tags: ['QUARANTINE', 'HIGH-DARK', 'INFILTRATOR'],
        assets: ['SIG_VesselShadow_v01', 'ICN_VesselShadow_v01', 'EMB_VesselShadow_v01', 'CPT_VesselShadow_v01']
    },
    exile: {
        id: 'EXILE', label: 'Class III', name: 'Exile', code: 'SIG-EXL-001', subtitle: 'the displaced ones',
        primaryHue: '#8BA0B5', lightBias: 50, darkBias: 50, resilience: 70, stealth: 50, biasText: 'LIGHT: NEUTRAL',
        theology: 'Neither aligned nor condemned. Exile vessels were stripped of their original assignment and exist in a state of jurisdictional limbo. In Dudael, they adapt to whatever parity the Depth demands.',
        playstyle: 'Adaptive generalist. Cards can shift between Light and Dark depending on context. No ceiling advantage but no floor weakness — the balanced survivor.',
        tags: ['CONTAINMENT', 'NEUTRAL', 'ADAPTIVE'],
        assets: ['SIG_VesselExile_v01', 'ICN_VesselExile_v01', 'EMB_VesselExile_v01', 'CPT_VesselExile_v01']
    },
    penitent: {
        id: 'PENITENT', label: 'Class IV', name: 'Penitent', code: 'SIG-PEN-001', subtitle: 'the bowed ones',
        primaryHue: '#D4A04A', lightBias: 65, darkBias: 35, resilience: 80, stealth: 30, biasText: 'LIGHT: MED-HIGH',
        theology: 'Former transgressors seeking restoration through descent. The Penitent enters Dudael voluntarily as an act of atonement — the Drop is their liturgy. Each Depth cleared is a step toward rehabilitation.',
        playstyle: 'Endurance tank with Light lean. Cards emphasize absorption, sacrifice effects, and gradual Light accumulation. Slow but incredibly durable across long Depth runs.',
        tags: ['EVIDENCE', 'MED-LIGHT', 'ENDURANCE'],
        assets: ['SIG_VesselPenitent_v01', 'ICN_VesselPenitent_v01', 'EMB_VesselPenitent_v01', 'CPT_VesselPenitent_v01']
    },
    rebel: {
        id: 'REBEL', label: 'Class V', name: 'Rebel', code: 'SIG-RBL-001', subtitle: 'the defiant ones',
        primaryHue: '#C04050', lightBias: 35, darkBias: 65, resilience: 50, stealth: 40, biasText: 'LIGHT: LOW-MED',
        theology: 'Those who rejected both the original order and the quarantine. Rebel vessels view Dudael not as containment but as a system to be broken. Their descent is not penance — it is siege.',
        playstyle: 'Aggressive Dark-leaning disruptor. Cards emphasize breaking enemy defenses, parity manipulation, and high-risk/high-reward plays. Glass cannon with momentum mechanics.',
        tags: ['BREACH', 'MED-DARK', 'DISRUPTOR'],
        assets: ['SIG_VesselRebel_v01', 'ICN_VesselRebel_v01', 'EMB_VesselRebel_v01', 'CPT_VesselRebel_v01']
    }
};

export { VESSEL_DATA };