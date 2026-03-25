import {
	combineRgb,
	type CompanionButtonStepActions,
	type CompanionOptionValues,
	type CompanionPresetDefinitions,
} from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { MODULE_ID, PRESET_TIMER_BUTTONS } from './constants.js'

function step(actionId: string, options: CompanionOptionValues): CompanionButtonStepActions[] {
	return [
		{
			down: [{ actionId, options }],
			up: [],
		},
	]
}

export function GetPresetDefinitions(_self: ModuleInstance): CompanionPresetDefinitions {
	const presets: CompanionPresetDefinitions = {
		pause_all: {
			type: 'button',
			category: 'Global',
			name: 'Pause All',
			style: {
				text: 'PAUSE\\nALL',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(160, 120, 0),
			},
			steps: step('pause_all', {}),
			feedbacks: [],
		},
		reset_all: {
			type: 'button',
			category: 'Global',
			name: 'Reset All',
			style: {
				text: 'RESET\\nALL',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(120, 120, 120),
			},
			steps: step('reset_all', {}),
			feedbacks: [],
		},
		output_show: {
			type: 'button',
			category: 'Global',
			name: 'Show Output Window',
			style: {
				text: 'SHOW\\nOUTPUT',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 90, 180),
			},
			steps: step('set_output_window_visibility', { visible: 'true' }),
			feedbacks: [
				{
					feedbackId: 'output_window_visible',
					options: {},
					style: {
						bgcolor: combineRgb(0, 160, 90),
						color: combineRgb(255, 255, 255),
					},
				},
			],
		},
		output_hide: {
			type: 'button',
			category: 'Global',
			name: 'Hide Output Window',
			style: {
				text: 'HIDE\\nOUTPUT',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(110, 20, 20),
			},
			steps: step('set_output_window_visibility', { visible: 'false' }),
			feedbacks: [],
		},
		blackout_on: {
			type: 'button',
			category: 'Global',
			name: 'Blackout On',
			style: {
				text: 'BLACKOUT\\nON',
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: step('update_settings', {
				backgroundColor: '',
				foregroundColor: '',
				blackout: true,
				boxGap: 32,
			}),
			feedbacks: [
				{
					feedbackId: 'blackout_enabled',
					options: {},
					style: {
						bgcolor: combineRgb(255, 255, 255),
						color: combineRgb(0, 0, 0),
					},
				},
			],
		},
		blackout_off: {
			type: 'button',
			category: 'Global',
			name: 'Blackout Off',
			style: {
				text: 'BLACKOUT\\nOFF',
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(50, 50, 50),
			},
			steps: step('update_settings', {
				backgroundColor: '',
				foregroundColor: '',
				blackout: false,
				boxGap: 32,
			}),
			feedbacks: [],
		},
		focused_start: {
			type: 'button',
			category: 'Selected Timer',
			name: 'Start Selected Timer',
			style: {
				text: 'START',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 150, 0),
			},
			steps: step('timer_start', { targetMode: 'focused', slot: 1, timerId: '' }),
			feedbacks: [],
		},
		focused_pause: {
			type: 'button',
			category: 'Selected Timer',
			name: 'Pause Selected Timer',
			style: {
				text: 'PAUSE',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(170, 130, 0),
			},
			steps: step('timer_pause', { targetMode: 'focused', slot: 1, timerId: '' }),
			feedbacks: [],
		},
		focused_reset: {
			type: 'button',
			category: 'Selected Timer',
			name: 'Reset Selected Timer',
			style: {
				text: 'RESET',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(110, 110, 110),
			},
			steps: step('timer_reset', { targetMode: 'focused', slot: 1, timerId: '' }),
			feedbacks: [],
		},
		focused_show: {
			type: 'button',
			category: 'Selected Timer',
			name: 'Show Selected Timer',
			style: {
				text: 'SHOW',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 100, 170),
			},
			steps: step('timer_show', { targetMode: 'focused', slot: 1, timerId: '' }),
			feedbacks: [],
		},
		focused_hide: {
			type: 'button',
			category: 'Selected Timer',
			name: 'Hide Selected Timer',
			style: {
				text: 'HIDE',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(120, 30, 30),
			},
			steps: step('timer_hide', { targetMode: 'focused', slot: 1, timerId: '' }),
			feedbacks: [],
		},
		focused_plus_minute: {
			type: 'button',
			category: 'Selected Timer',
			name: '+1 Minute',
			style: {
				text: '+1\\nMIN',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 120, 180),
			},
			steps: step('timer_adjust_minutes', { minutes: 1 }),
			feedbacks: [],
		},
		focused_minus_minute: {
			type: 'button',
			category: 'Selected Timer',
			name: '-1 Minute',
			style: {
				text: '-1\\nMIN',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(120, 60, 20),
			},
			steps: step('timer_adjust_minutes', { minutes: -1 }),
			feedbacks: [],
		},
	}

	for (let preset = 1; preset <= 4; preset++) {
		presets[`focused_recall_preset_${preset}`] = {
			type: 'button',
			category: 'Selected Timer',
			name: `Recall Preset ${preset}`,
			style: {
				text: `\`P${preset}\\n\${$(${MODULE_ID}:selected_timer_preset_${preset}_label) || "Preset ${preset}"}\``,
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(60, 90, 170),
				textExpression: true,
			},
			steps: step('timer_apply_preset', { index: preset }),
			feedbacks: [],
		}

		presets[`focused_save_preset_${preset}`] = {
			type: 'button',
			category: 'Selected Timer',
			name: `Save Preset ${preset}`,
			style: {
				text: `SAVE\\nP${preset}`,
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(130, 70, 20),
			},
			steps: step('timer_save_preset', { index: preset }),
			feedbacks: [],
		}
	}

	for (let digit = 0; digit <= 9; digit++) {
		presets[`key_${digit}`] = {
			type: 'button',
			category: 'Selected Timer Keypad',
			name: `Digit ${digit}`,
			style: {
				text: String(digit),
				size: '30',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(40, 40, 40),
			},
			steps: step('timer_key', {
				key: String(digit),
			}),
			feedbacks: [],
		}
	}

	presets.key_backspace = {
		type: 'button',
		category: 'Selected Timer Keypad',
		name: 'Backspace',
		style: {
			text: 'BACK',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(130, 80, 0),
		},
		steps: step('timer_key', { key: 'Backspace' }),
		feedbacks: [],
	}

	presets.key_enter = {
		type: 'button',
		category: 'Selected Timer Keypad',
		name: 'Enter',
		style: {
			text: 'ENTER',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 130, 70),
		},
		steps: step('timer_key', { key: 'Enter' }),
		feedbacks: [],
	}

	presets.key_escape = {
		type: 'button',
		category: 'Selected Timer Keypad',
		name: 'Escape',
		style: {
			text: 'ESC',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(140, 30, 30),
		},
		steps: step('timer_key', { key: 'Escape' }),
		feedbacks: [],
	}

	for (let slot = 1; slot <= PRESET_TIMER_BUTTONS; slot++) {
		presets[`focus_slot_${slot}`] = {
			type: 'button',
			category: 'Timer Select',
			name: `Select Timer ${slot}`,
			style: {
				text: `T${slot}\\n$(${MODULE_ID}:timer_${slot}_title)`,
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(45, 45, 45),
			},
			steps: step('select_timer', { targetMode: 'slot', slot, timerId: '' }),
			feedbacks: [
				{
					feedbackId: 'timer_slot_focused',
					options: { slot },
					style: {
						bgcolor: combineRgb(255, 180, 0),
						color: combineRgb(0, 0, 0),
					},
				},
				{
					feedbackId: 'timer_slot_running',
					options: { slot },
					style: {
						bgcolor: combineRgb(0, 150, 0),
						color: combineRgb(255, 255, 255),
					},
				},
			],
		}
	}

	return presets
}
