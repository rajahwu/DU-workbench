// DraftShell/index.tsx
//
// Entry point for the Draft phase.
// DraftLayout is the persistent frame — it owns the Outlet.
// Child routes (Approach → Offering → Reckoning) slot into the Outlet.
//
// Router config:
//
//   {
//     path: '04_draft',
//     element: <DraftLayout />,
//     children: [
//       { index: true,          element: <DraftRouter />   },
//       { path: 'approach',     element: <DraftApproach /> },
//       { path: 'offering',     element: <DraftOffering /> },
//       { path: 'reckoning',    element: <DraftReckoning /> },
//     ]
//   }
//
// Data flow:
//   Approach   → reads  runMeta (vessel, insight, parity)       → no writes
//   Offering   → reads  runMeta + cardPool                       → writes selectedCards to router state
//   Reckoning  → reads  router state (selectedCards) + runMeta  → writes packet + transitions to 05_level

export { default as DraftLayout } from './DraftLayout';
export { default as DraftRouter } from './DraftRouter';
export { default as DraftApproach } from './DraftApproach';
export { default as DraftOffering } from './DraftOffering';
export { default as DraftReckoning } from './DraftReckoning';
