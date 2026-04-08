# VICREO Timer

This module connects to the VICREO Timer HTTP API and listens to the live `/api/events` SSE stream.

## Configuration

Configure the module with:

- `API host / IP`: defaults to `127.0.0.1`, but can be any reachable VICREO Timer machine on your network
- `API port`: defaults to `3892`
- `Reconnect interval`: how often the module retries if the app is unavailable

The VICREO Timer app must be running for the REST API and SSE stream to be available.

## Actions

- Select a timer in the app
- Control the active timer: start, pause, reset, show, hide, duplicate, move, delete
- Send keypad input to the active timer
- Adjust the active timer by `+1 minute` or `-1 minute`
- Recall countdown preset slots `1-10` on the active timer
- Save the current countdown duration back into preset slots `1-10` on the active timer
- Set message timer text
- Create timers and apply patch-style timer updates
- Reorder timers by ID list
- Pause all timers and reset all timers
- Show or hide the output window
- Update display settings including blackout and colors
- Add log entries and clear logs

## Variables

The module publishes variables for:

- Global state such as connection info, timer count, blackout, and output visibility
- The currently selected timer, sourced from the app state / SSE stream, including display value plus separate `hours`, `minutes`, and `seconds`
- Selected countdown preset labels `1-10`
- Timer slots `1-20`, including timer id, title, display value, separate `hours`, `minutes`, `seconds`, running state, visibility, and related timer state

## Selection Model

- The app's `selectedTimerId` from `/api/state` and SSE is treated as the source of truth
- Active timer actions always operate on the currently selected timer in the VICREO Timer app
- Timer slot presets are used to select timers in the app

## Presets

Included preset categories:

- `Selected Timer`: start, pause, reset, show, hide, `+1 minute`, `-1 minute`
- `Selected Timer`: also includes recall preset `1-10` and save preset `1-10` for countdown timers
- `Selected Timer Variables`: display-only preset for `selected_timer_value`
- `Selected Timer Keypad`: digits `0-9`, `Backspace`, `Enter`, `Escape`
- `Timer Select`: select timer slots
- `Timer Variables`: display-only presets for timer slot `1-20` `hours`, `minutes`, and `seconds`
- `Global`: pause all, reset all, show output window, hide output window, blackout on, blackout off
