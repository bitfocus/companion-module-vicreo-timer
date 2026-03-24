# VICREO Timer

This module connects to the VICREO Timer local HTTP API and listens to the live `/api/events` SSE stream.

## Configuration

- API host/IP: `127.0.0.1` by default, but this can be any reachable VICREO Timer machine on your network
- Default port: `3892`
- The app must be running for the API and SSE stream to be available

## Included Controls

- Timer selection synced from the app's live selected timer id
- Timer start, pause, reset, show, hide, duplicate, move, delete, and keyboard input
- Timer creation and patch-style updates
- Pause all and reset all
- Output window visibility
- Display settings including blackout and colors
- Log add and clear

## Variables

The module publishes:

- Global state variables such as connection info, timer count, blackout, and output visibility
- Selected timer variables
- Slot variables for timers `1-20`, including title, value, running state, visibility, and connection details
