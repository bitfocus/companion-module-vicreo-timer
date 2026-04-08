import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		timer_slot_focused: {
			name: 'Timer slot is selected in app',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 180, 0),
				color: combineRgb(0, 0, 0),
			},
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
			callback: (feedback) => {
				const slot = Number(feedback.options.slot)
				return self.getFocusedTimerSlot() === slot
			},
		},
		timer_slot_running: {
			name: 'Timer slot is running',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 160, 0),
				color: combineRgb(255, 255, 255),
			},
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
			callback: (feedback) => Boolean(self.getTimerBySlot(Number(feedback.options.slot))?.isRunning),
		},
		timer_slot_visible: {
			name: 'Timer slot is visible on second screen',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 110, 180),
				color: combineRgb(255, 255, 255),
			},
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
			callback: (feedback) => Boolean(self.getTimerBySlot(Number(feedback.options.slot))?.view?.showOnOutput),
		},
		output_window_visible: {
			name: 'Second screen is visible',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(90, 0, 150),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => Boolean(self.getApiState().outputWindow?.visible),
		},
		blackout_enabled: {
			name: 'Blackout is enabled',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 255, 255),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => Boolean(self.getApiState().settings.blackout),
		},
	})
}
