import type { SomeCompanionActionInputField } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { KEY_CHOICES, TIMER_TYPES } from './constants.js'
import { parseOptionalBoolean, parseOptionalNumber, parseOptionalString } from './utils.js'

function targetOptions(self: ModuleInstance): SomeCompanionActionInputField[] {
	const timerChoices = self.getTimerChoices()

	return [
		{
			type: 'dropdown',
			id: 'targetMode',
			label: 'Target timer mode',
			default: 'focused',
			choices: [
				{ id: 'focused', label: 'Selected timer' },
				{ id: 'slot', label: 'Timer slot' },
				{ id: 'id', label: 'Specific timer id' },
			],
		},
		{
			type: 'number',
			id: 'slot',
			label: 'Timer slot',
			default: 1,
			min: 1,
			max: 20,
		},
		{
			type: 'dropdown',
			id: 'timerId',
			label: 'Timer',
			default: timerChoices[0]?.id ?? '',
			choices: timerChoices,
		},
	]
}

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		focus_timer_slot: {
			name: 'Select timer slot in app',
			options: [
				{
					type: 'number',
					id: 'slot',
					label: 'Timer slot',
					default: 1,
					min: 1,
					max: 20,
				},
			],
			callback: async (event) => {
				self.focusTimerBySlot(Number(event.options.slot))
			},
		},
		select_timer: {
			name: 'Select timer in app',
			options: targetOptions(self),
			callback: async (event) => {
				const timer = self.resolveTimerFromOptions(event.options)
				if (!timer) return
				await self.sendTimerAction(timer.id, 'select')
				self.setFocusedTimerId(timer.id)
			},
		},
		timer_start: {
			name: 'Start timer',
			options: [],
			callback: async () => {
				const timer = self.getFocusedTimer()
				if (timer) await self.sendTimerAction(timer.id, 'start')
			},
		},
		timer_pause: {
			name: 'Pause timer',
			options: [],
			callback: async () => {
				const timer = self.getFocusedTimer()
				if (timer) await self.sendTimerAction(timer.id, 'pause')
			},
		},
		timer_reset: {
			name: 'Reset timer',
			options: [],
			callback: async () => {
				const timer = self.getFocusedTimer()
				if (timer) await self.sendTimerAction(timer.id, 'reset')
			},
		},
		timer_adjust_minutes: {
			name: 'Adjust active timer minutes',
			options: [
				{
					type: 'dropdown',
					id: 'minutes',
					label: 'Adjustment',
					default: 1,
					choices: [
						{ id: 1, label: '+1 minute' },
						{ id: -1, label: '-1 minute' },
					],
				},
			],
			callback: async (event) => {
				const timer = self.getFocusedTimer()
				if (!timer) return
				await self.sendTimerAction(timer.id, 'adjust-minutes', {
					minutes: Number(event.options.minutes),
				})
			},
		},
		timer_apply_preset: {
			name: 'Recall active timer preset',
			options: [
				{
					type: 'dropdown',
					id: 'index',
					label: 'Preset slot',
					default: 1,
					choices: [
						{ id: 1, label: 'Preset 1' },
						{ id: 2, label: 'Preset 2' },
						{ id: 3, label: 'Preset 3' },
						{ id: 4, label: 'Preset 4' },
					],
				},
			],
			callback: async (event) => {
				const timer = self.getFocusedTimer()
				if (!timer) return
				await self.sendTimerAction(timer.id, 'preset', {
					index: Number(event.options.index),
				})
			},
		},
		timer_save_preset: {
			name: 'Save active timer preset',
			options: [
				{
					type: 'dropdown',
					id: 'index',
					label: 'Preset slot',
					default: 1,
					choices: [
						{ id: 1, label: 'Preset 1' },
						{ id: 2, label: 'Preset 2' },
						{ id: 3, label: 'Preset 3' },
						{ id: 4, label: 'Preset 4' },
					],
				},
			],
			callback: async (event) => {
				const timer = self.getFocusedTimer()
				if (!timer) return
				await self.sendTimerAction(timer.id, 'save-preset', {
					index: Number(event.options.index),
				})
			},
		},
		timer_show: {
			name: 'Show timer on output',
			options: [],
			callback: async () => {
				const timer = self.getFocusedTimer()
				if (timer) await self.sendTimerAction(timer.id, 'show')
			},
		},
		timer_hide: {
			name: 'Hide timer from output',
			options: [],
			callback: async () => {
				const timer = self.getFocusedTimer()
				if (timer) await self.sendTimerAction(timer.id, 'hide')
			},
		},
		timer_duplicate: {
			name: 'Duplicate timer',
			options: [
				{
					type: 'textinput',
					id: 'title',
					label: 'New title (optional)',
					default: '',
				},
			],
			callback: async (event) => {
				const timer = self.getFocusedTimer()
				if (!timer) return
				await self.sendTimerAction(timer.id, 'duplicate', {
					title: parseOptionalString(event.options.title),
				})
			},
		},
		timer_move: {
			name: 'Move timer one step',
			options: [
				{
					type: 'dropdown',
					id: 'direction',
					label: 'Direction',
					default: 'up',
					choices: [
						{ id: 'up', label: 'Up' },
						{ id: 'down', label: 'Down' },
					],
				},
			],
			callback: async (event) => {
				const timer = self.getFocusedTimer()
				if (!timer) return
				await self.sendTimerAction(timer.id, 'move', {
					direction: event.options.direction,
				})
			},
		},
		timer_delete: {
			name: 'Delete timer',
			options: [],
			callback: async () => {
				const timer = self.getFocusedTimer()
				if (timer) await self.deleteTimer(timer.id)
			},
		},
		timer_key: {
			name: 'Send key to active timer',
			options: [
				{
					type: 'dropdown',
					id: 'key',
					label: 'Key',
					default: '1',
					choices: KEY_CHOICES,
				},
			],
			callback: async (event) => {
				const timer = self.getFocusedTimer()
				if (!timer) return
				await self.sendTimerAction(timer.id, 'key', {
					key: event.options.key,
				})
			},
		},
		timer_set_message: {
			name: 'Set message timer text',
			options: [
				{
					type: 'textinput',
					id: 'messageText',
					label: 'Message text',
					useVariables: true,
					default: '',
				},
				{
					type: 'checkbox',
					id: 'showOnOutput',
					label: 'Show on output',
					default: true,
				},
			],
			callback: async (event) => {
				const timer = self.getFocusedTimer()
				if (!timer) return
				await self.sendTimerAction(timer.id, 'set-message', {
					messageText: await self.parseVariablesInString(
						typeof event.options.messageText === 'string' ? event.options.messageText : '',
					),
					showOnOutput: Boolean(event.options.showOnOutput),
				})
			},
		},
		create_timer: {
			name: 'Create timer',
			options: [
				{
					type: 'dropdown',
					id: 'type',
					label: 'Type',
					default: 'countdown',
					choices: TIMER_TYPES,
				},
				{
					type: 'textinput',
					id: 'title',
					label: 'Title (optional)',
					default: '',
					useVariables: true,
				},
				{
					type: 'number',
					id: 'hours',
					label: 'Hours',
					default: 0,
					min: 0,
					max: 999,
				},
				{
					type: 'number',
					id: 'minutes',
					label: 'Minutes',
					default: 0,
					min: 0,
					max: 999,
				},
				{
					type: 'number',
					id: 'seconds',
					label: 'Seconds',
					default: 0,
					min: 0,
					max: 59,
				},
				{
					type: 'textinput',
					id: 'targetTime',
					label: 'Target time HH:MM',
					default: '',
				},
				{
					type: 'textinput',
					id: 'messageText',
					label: 'Message text',
					default: '',
					useVariables: true,
				},
			],
			callback: async (event) => {
				const title = await self.parseVariablesInString(
					typeof event.options.title === 'string' ? event.options.title : '',
				)
				const messageText = await self.parseVariablesInString(
					typeof event.options.messageText === 'string' ? event.options.messageText : '',
				)

				await self.createTimer({
					type: typeof event.options.type === 'string' ? event.options.type : 'countdown',
					title: parseOptionalString(title),
					hours: Number(event.options.hours),
					minutes: Number(event.options.minutes),
					seconds: Number(event.options.seconds),
					targetTime: parseOptionalString(event.options.targetTime),
					messageText: parseOptionalString(messageText),
				})
			},
		},
		update_timer: {
			name: 'Patch timer settings',
			options: [
				{
					type: 'textinput',
					id: 'title',
					label: 'Title',
					default: '',
					useVariables: true,
				},
				{
					type: 'textinput',
					id: 'targetTime',
					label: 'Target time HH:MM',
					default: '',
				},
				{
					type: 'textinput',
					id: 'messageText',
					label: 'Message text',
					default: '',
					useVariables: true,
				},
				{
					type: 'number',
					id: 'hours',
					label: 'Hours',
					default: 0,
					min: 0,
					max: 999,
				},
				{
					type: 'number',
					id: 'minutes',
					label: 'Minutes',
					default: 0,
					min: 0,
					max: 999,
				},
				{
					type: 'number',
					id: 'seconds',
					label: 'Seconds',
					default: 0,
					min: 0,
					max: 59,
				},
				{
					type: 'checkbox',
					id: 'stopAtZero',
					label: 'Stop at zero',
					default: false,
				},
				{
					type: 'checkbox',
					id: 'isCollapsed',
					label: 'Collapsed',
					default: false,
				},
				{
					type: 'checkbox',
					id: 'showOnOutput',
					label: 'Show on output',
					default: true,
				},
				{
					type: 'checkbox',
					id: 'showTitle',
					label: 'Show title',
					default: true,
				},
				{
					type: 'checkbox',
					id: 'showValue',
					label: 'Show value',
					default: true,
				},
				{
					type: 'checkbox',
					id: 'hideLeadingZeros',
					label: 'Hide leading zeros',
					default: false,
				},
			],
			callback: async (event) => {
				const timer = self.getFocusedTimer()
				if (!timer) return

				const title = await self.parseVariablesInString(
					typeof event.options.title === 'string' ? event.options.title : '',
				)
				const messageText = await self.parseVariablesInString(
					typeof event.options.messageText === 'string' ? event.options.messageText : '',
				)

				await self.updateTimer(timer.id, {
					title: parseOptionalString(title),
					targetTime: parseOptionalString(event.options.targetTime),
					messageText: parseOptionalString(messageText),
					hours: parseOptionalNumber(event.options.hours),
					minutes: parseOptionalNumber(event.options.minutes),
					seconds: parseOptionalNumber(event.options.seconds),
					stopAtZero: parseOptionalBoolean(event.options.stopAtZero),
					isCollapsed: parseOptionalBoolean(event.options.isCollapsed),
					view: {
						showOnOutput: parseOptionalBoolean(event.options.showOnOutput),
						showTitle: parseOptionalBoolean(event.options.showTitle),
						showValue: parseOptionalBoolean(event.options.showValue),
						hideLeadingZeros: parseOptionalBoolean(event.options.hideLeadingZeros),
					},
				})
			},
		},
		reorder_timers: {
			name: 'Reorder timers by id list',
			options: [
				{
					type: 'textinput',
					id: 'timerIds',
					label: 'Comma-separated timer ids',
					default: '',
					useVariables: true,
				},
			],
			callback: async (event) => {
				const timerIdsRaw = await self.parseVariablesInString(
					typeof event.options.timerIds === 'string' ? event.options.timerIds : '',
				)
				const timerIds = timerIdsRaw
					.split(',')
					.map((item) => item.trim())
					.filter(Boolean)
				await self.apiRequest('POST', '/api/timers/reorder', { timerIds })
			},
		},
		pause_all: {
			name: 'Pause all timers',
			options: [],
			callback: async () => {
				await self.apiRequest('POST', '/api/timers/actions/pause-all')
			},
		},
		reset_all: {
			name: 'Reset all timers',
			options: [],
			callback: async () => {
				await self.apiRequest('POST', '/api/timers/actions/reset-all')
			},
		},
		set_output_window_visibility: {
			name: 'Set output window visibility',
			options: [
				{
					type: 'dropdown',
					id: 'visible',
					label: 'Visible',
					default: 'true',
					choices: [
						{ id: 'true', label: 'Show output window' },
						{ id: 'false', label: 'Hide output window' },
					],
				},
			],
			callback: async (event) => {
				await self.apiRequest('POST', '/api/output-window', {
					visible: event.options.visible === 'true',
				})
			},
		},
		update_settings: {
			name: 'Update display settings',
			options: [
				{
					type: 'textinput',
					id: 'backgroundColor',
					label: 'Background color',
					default: '',
				},
				{
					type: 'textinput',
					id: 'foregroundColor',
					label: 'Foreground color',
					default: '',
				},
				{
					type: 'checkbox',
					id: 'blackout',
					label: 'Blackout',
					default: false,
				},
				{
					type: 'number',
					id: 'boxGap',
					label: 'Box gap',
					default: 32,
					min: 0,
					max: 96,
				},
			],
			callback: async (event) => {
				await self.apiRequest('PATCH', '/api/settings', {
					backgroundColor: parseOptionalString(event.options.backgroundColor),
					foregroundColor: parseOptionalString(event.options.foregroundColor),
					blackout: parseOptionalBoolean(event.options.blackout),
					boxGap: parseOptionalNumber(event.options.boxGap),
				})
			},
		},
		add_log: {
			name: 'Add log entry',
			options: [
				{
					type: 'textinput',
					id: 'message',
					label: 'Message',
					default: '',
					useVariables: true,
				},
			],
			callback: async (event) => {
				const message = await self.parseVariablesInString(
					typeof event.options.message === 'string' ? event.options.message : '',
				)
				await self.apiRequest('POST', '/api/logs', { message })
			},
		},
		clear_logs: {
			name: 'Clear logs',
			options: [],
			callback: async () => {
				await self.apiRequest('DELETE', '/api/logs')
			},
		},
		refresh_state: {
			name: 'Refresh state now',
			options: [],
			callback: async () => {
				await self.refreshState()
			},
		},
	})
}
