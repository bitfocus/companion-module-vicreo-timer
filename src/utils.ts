import type { VicreoTimer } from './types.js'

export function boolLabel(value: boolean | undefined): string {
	return value ? 'YES' : 'NO'
}

export function safeString(value: unknown): string {
	if (value === null || value === undefined) return ''
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		return String(value)
	}
	return ''
}

export function parseOptionalNumber(value: unknown): number | undefined {
	if (value === '' || value === null || value === undefined) return undefined
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : undefined
}

export function parseOptionalString(value: unknown): string | undefined {
	const parsed = safeString(value).trim()
	return parsed.length > 0 ? parsed : undefined
}

export function parseOptionalBoolean(value: unknown): boolean | undefined {
	if (typeof value === 'boolean') return value
	if (value === 'true' || value === '1' || value === 1) return true
	if (value === 'false' || value === '0' || value === 0) return false
	return undefined
}

export interface TimerValueComponents {
	hours: string
	minutes: string
	seconds: string
}

export function parseTimerValueComponents(value: unknown): TimerValueComponents {
	const raw = safeString(value).trim()
	if (!raw) return { hours: '', minutes: '', seconds: '' }

	const match = raw.match(/^[+-]?(\d+):(\d+)(?::(\d+))?(?:\.\d+)?$/)
	if (!match) return { hours: '', minutes: '', seconds: '' }

	if (match[3] !== undefined) {
		return {
			hours: match[1],
			minutes: match[2],
			seconds: match[3],
		}
	}

	return {
		hours: '0',
		minutes: match[1],
		seconds: match[2],
	}
}

export function getTimerSlotLabel(slot: number, timer?: VicreoTimer): string {
	if (!timer) return `Slot ${slot}`
	return `Slot ${slot}: ${timer.title || timer.id}`
}
