import type { DropdownChoice } from '@companion-module/base'

export const MODULE_ID = 'vicreo-timer'
export const MAX_TIMER_SLOTS = 20
export const PRESET_TIMER_BUTTONS = 8
export const TIMER_PRESET_SLOTS = 10

export const TIMER_TYPES: DropdownChoice[] = [
	{ id: 'countdown', label: 'Countdown' },
	{ id: 'current-time', label: 'Current time' },
	{ id: 'count-up', label: 'Count up' },
	{ id: 'countdown-to-time', label: 'Countdown to time' },
	{ id: 'qlab', label: 'QLab' },
	{ id: 'pixera', label: 'Pixera' },
	{ id: 'watchout', label: 'Watchout' },
	{ id: 'message', label: 'Message' },
]

export const KEY_CHOICES: DropdownChoice[] = [
	...Array.from({ length: 10 }, (_, index) => ({
		id: String(index),
		label: `Digit ${index}`,
	})),
	{ id: 'Backspace', label: 'Backspace' },
	{ id: 'Enter', label: 'Enter' },
	{ id: 'Escape', label: 'Escape' },
]
