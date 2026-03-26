import type { ModuleInstance } from './main.js'
import { MAX_TIMER_SLOTS } from './constants.js'
import { boolLabel, safeString } from './utils.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const variables = [
		{ variableId: 'api_port', name: 'API port' },
		{ variableId: 'timer_count', name: 'Timer count' },
		{ variableId: 'output_window_visible', name: 'Output window visible (YES/NO)' },
		{ variableId: 'blackout', name: 'Blackout enabled (YES/NO)' },
		{ variableId: 'selected_timer_slot', name: 'Selected timer slot number' },
		{ variableId: 'selected_timer_id', name: 'Selected timer id' },
		{ variableId: 'selected_timer_title', name: 'Selected timer title' },
		{ variableId: 'selected_timer_type', name: 'Selected timer type' },
		{ variableId: 'selected_timer_value', name: 'Selected timer display value' },
		{ variableId: 'selected_timer_running', name: 'Selected timer running (YES/NO)' },
		{ variableId: 'selected_timer_visible', name: 'Selected timer visible on output (YES/NO)' },
	]

	for (let preset = 1; preset <= 4; preset++) {
		variables.push({
			variableId: `selected_timer_preset_${preset}_label`,
			name: `Selected timer preset ${preset} label`,
		})
	}

	for (let slot = 1; slot <= MAX_TIMER_SLOTS; slot++) {
		variables.push({ variableId: `timer_${slot}_id`, name: `Timer ${slot} id` })
		variables.push({ variableId: `timer_${slot}_title`, name: `Timer ${slot} title` })
		variables.push({ variableId: `timer_${slot}_type`, name: `Timer ${slot} type` })
		variables.push({ variableId: `timer_${slot}_value`, name: `Timer ${slot} display value` })
		variables.push({ variableId: `timer_${slot}_running`, name: `Timer ${slot} running (YES/NO)` })
		variables.push({ variableId: `timer_${slot}_ended`, name: `Timer ${slot} ended (YES/NO)` })
		variables.push({ variableId: `timer_${slot}_visible`, name: `Timer ${slot} visible on output (YES/NO)` })
		variables.push({ variableId: `timer_${slot}_collapsed`, name: `Timer ${slot} collapsed (YES/NO)` })
		variables.push({ variableId: `timer_${slot}_connection_state`, name: `Timer ${slot} connection state` })
		variables.push({ variableId: `timer_${slot}_connection_message`, name: `Timer ${slot} connection message` })
		variables.push({ variableId: `timer_${slot}_target_time`, name: `Timer ${slot} target time` })
		variables.push({ variableId: `timer_${slot}_message`, name: `Timer ${slot} message text` })
		variables.push({ variableId: `timer_${slot}_cue`, name: `Timer ${slot} current cue or clip` })
	}

	self.setVariableDefinitions(variables)
}

export function UpdateVariableValues(self: ModuleInstance): void {
	const state = self.getApiState()
	const selected = self.getFocusedTimer()
	const selectedSlot = selected ? self.getTimerSlotById(selected.id) : 0
	const values: Record<string, string | number> = {
		api_port: state.server?.port ?? self.config.port,
		timer_count: state.timers.length,
		output_window_visible: boolLabel(Boolean(state.outputWindow?.visible)),
		blackout: boolLabel(Boolean(state.settings.blackout)),
		selected_timer_slot: selectedSlot,
		selected_timer_id: safeString(selected?.id),
		selected_timer_title: safeString(selected?.title),
		selected_timer_type: safeString(selected?.type),
		selected_timer_value: safeString(selected?.value),
		selected_timer_running: boolLabel(Boolean(selected?.isRunning)),
		selected_timer_visible: boolLabel(Boolean(selected?.view?.showOnOutput)),
	}

	for (let preset = 1; preset <= 4; preset++) {
		values[`selected_timer_preset_${preset}_label`] = safeString(selected?.presets?.[preset - 1]?.label)
	}

	for (let slot = 1; slot <= MAX_TIMER_SLOTS; slot++) {
		const timer = state.timers[slot - 1]
		values[`timer_${slot}_id`] = safeString(timer?.id)
		values[`timer_${slot}_title`] = safeString(timer?.title)
		values[`timer_${slot}_type`] = safeString(timer?.type)
		values[`timer_${slot}_value`] = safeString(timer?.value)
		values[`timer_${slot}_running`] = boolLabel(Boolean(timer?.isRunning))
		values[`timer_${slot}_ended`] = boolLabel(Boolean(timer?.ended))
		values[`timer_${slot}_visible`] = boolLabel(Boolean(timer?.view?.showOnOutput))
		values[`timer_${slot}_collapsed`] = boolLabel(Boolean(timer?.isCollapsed))
		values[`timer_${slot}_connection_state`] = safeString(timer?.connectionState)
		values[`timer_${slot}_connection_message`] = safeString(timer?.connectionMessage)
		values[`timer_${slot}_target_time`] = safeString(timer?.targetTime)
		values[`timer_${slot}_message`] = safeString(timer?.messageText)
		values[`timer_${slot}_cue`] = safeString(
			timer?.currentCueName || timer?.currentClipName || timer?.watchoutCueName || timer?.playheadCueName,
		)
	}

	self.setVariableValues(values)
}
