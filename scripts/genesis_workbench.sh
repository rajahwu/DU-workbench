#!/bin/bash

# ==============================================================================
# RADIANT SYSTEMS - WORKBENCH GENESIS SCRIPT
# Blackout Protocol / Cathedral Mode
# Architecture: Parallel Subsystem with Runtime-Agnostic Cartridges
# ==============================================================================

WORKBENCH_DIR="./workbench"

echo "🔔 Initiating Blackout Protocol..."
echo "⏳ Constructing Cathedral Architecture at $WORKBENCH_DIR"

# 1. Core Engine (The Source of Truth)
mkdir -p "$WORKBENCH_DIR/game/core"
mkdir -p "$WORKBENCH_DIR/game/systems"
mkdir -p "$WORKBENCH_DIR/game/cartridges/01_dudael_9pad" # The SNES Cartridges
mkdir -p "$WORKBENCH_DIR/game/interfaces" # Standardized inputs/outputs

# 2. The Spine (Phase Logic & The Hourglass)
mkdir -p "$WORKBENCH_DIR/phases/01_title"
mkdir -p "$WORKBENCH_DIR/phases/02_select"
mkdir -p "$WORKBENCH_DIR/phases/03_staging"
mkdir -p "$WORKBENCH_DIR/phases/04_draft"
mkdir -p "$WORKBENCH_DIR/phases/05_level" # The Cartridge Slot
mkdir -p "$WORKBENCH_DIR/phases/06_door"
mkdir -p "$WORKBENCH_DIR/phases/07_drop"
mkdir -p "$WORKBENCH_DIR/phases/hourglass_router" # Controls the 9-House Descent/Ascent

# 3. Parallel Subsystems (The Consumers)
mkdir -p "$WORKBENCH_DIR/web/react_app"
mkdir -p "$WORKBENCH_DIR/cli/terminal_app"
mkdir -p "$WORKBENCH_DIR/api/routes"

# 4. Infrastructure & Data (The Support)
mkdir -p "$WORKBENCH_DIR/config/environments"
mkdir -p "$WORKBENCH_DIR/db/schema"
mkdir -p "$WORKBENCH_DIR/db/migrations"
mkdir -p "$WORKBENCH_DIR/data/lore"
mkdir -p "$WORKBENCH_DIR/data/entities" # Sigils, Vessels, Guides

# 5. Populate initial .gitkeeps to preserve structure
find "$WORKBENCH_DIR" -type d -empty -exec touch {}/.gitkeep \;

# 6. Generate the Root Readme / Ledger
cat <<EOT >> "$WORKBENCH_DIR/README.md"
# Radiant Systems: Relic Master Engineer Workbench
**Status:** Blackout Protocol Active
**Architecture:** Parallel Subsystems + Cartridge Engine
**Core Principle:** Nothing Doing Everything.

## Directory Map
- \`/game\`: The engine, systems, and runtime-agnostic cartridges.
- \`/phases\`: The spine. The phase loop logic and Hourglass router.
- \`/web\`, \`/cli\`, \`/api\`: The parallel consumers. 
- \`/config\`, \`/db\`, \`/data\`: Infrastructure and static entities.
EOT

echo "✅ Workbench lattice constructed."
echo "🎵 'I don't know what you came to do, but I came to praise the Lord.'"
