import { useNavigate } from 'react-router';
import { getRunMeta } from '@du/phases';

// DraftApproach — Stage 4A
// The keepers emerge. Mood is set. No card action yet.
// Player reads the room, sees their current parity and vessel,
// then proceeds to the Offering.

export default function DraftApproach() {
    const navigate = useNavigate();
    const runMeta = getRunMeta();

    const vessel = runMeta?.identity?.vessel ?? 'unknown';
    const light  = runMeta?.alignment?.light ?? 0;
    const dark   = runMeta?.alignment?.dark  ?? 0;

    // Keeper tone shifts based on parity state —
    // the attentive player learns to read this over runs.
    const keeperLine = (() => {
        if (dark - light >= 3)  return 'Something below has been listening for you specifically.';
        if (light - dark >= 3)  return 'Something here remembers the upper rings.';
        return 'The Keepers present their offerings.';
    })();

    // Vessel-specific Approach note
    const vesselNote = (() => {
        switch (vessel?.toUpperCase()) {
            case 'PENITENT': return runMeta?.insight && runMeta?.insight > 0
                ? `Insight: ${runMeta?.insight ? runMeta.insight : 0} — your study has sharpened your sight.`
                : 'Reading in the Locker Room sharpens what you see here.';
            case 'REBEL': return dark - light >= 3
                ? 'Instability active. Dark doors will be cheaper. Mistakes will cost more.'
                : 'High Dark start. The Smuggler\'s offerings will reflect that.';
            default: return null;
        }
    })();

    return (
        <>
            <div className="content-area">

                {/* Keeper silhouettes */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '24px 16px 8px' }}>
                    {/* Surveyor */}
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{
                            width: 48, height: 80,
                            background: '#D4A84320',
                            border: '1px solid #D4A84340',
                            margin: '0 auto 8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: 24 }}>☀</span>
                        </div>
                        <div style={{ fontSize: 8, letterSpacing: 2, color: '#D4A843', textTransform: 'uppercase' }}>
                            Surveyor
                        </div>
                    </div>

                    {/* Center — keeper line */}
                    <div style={{ flex: 2, textAlign: 'center', padding: '0 12px' }}>
                        <div className="theology-line" style={{ fontSize: 11 }}>
                            {keeperLine}
                        </div>
                    </div>

                    {/* Smuggler */}
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{
                            width: 48, height: 80,
                            background: '#7B4FA220',
                            border: '1px solid #7B4FA240',
                            margin: '0 auto 8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: 24 }}>◆</span>
                        </div>
                        <div style={{ fontSize: 8, letterSpacing: 2, color: '#7B4FA2', textTransform: 'uppercase' }}>
                            Smuggler
                        </div>
                    </div>
                </div>

                {/* Vessel note — only shown when relevant */}
                {vesselNote && (
                    <div style={{
                        margin: '8px 0',
                        padding: '8px 12px',
                        background: '#13141A',
                        border: '1px solid #1E2028',
                        fontSize: 9,
                        color: '#4A4D58',
                        letterSpacing: 1,
                        textAlign: 'center'
                    }}>
                        {vesselNote}
                    </div>
                )}

                {/* Current parity state */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 24,
                    padding: '12px 0',
                    fontSize: 10,
                    color: '#2A2D38'
                }}>
                    <span>
                        <span className="parity-dot light" style={{ marginRight: 6 }}></span>
                        Light {light}
                    </span>
                    <span style={{ color: '#1E2028' }}>—</span>
                    <span>
                        <span className="parity-dot dark" style={{ marginRight: 6 }}></span>
                        Dark {dark}
                    </span>
                </div>

            </div>

            <div className="bottom-action">
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('../offering', { relative: 'path', replace: true })}
                >
                    Proceed to Offering
                </button>
            </div>
        </>
    );
}
