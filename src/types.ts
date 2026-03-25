export interface VicreoTimerView {
	showOnOutput?: boolean
	showTitle?: boolean
	showValue?: boolean
	hideLeadingZeros?: boolean
	showQlabPlayhead?: boolean
}

export interface VicreoTimerPreset {
	durationMs?: number
	isCustom?: boolean
	label?: string
}

export interface VicreoTimer {
	id: string
	type: string
	title: string
	value: string
	isRunning: boolean
	isCollapsed?: boolean
	ended?: boolean
	targetTime?: string
	messageText?: string
	connectionState?: string
	connectionMessage?: string
	currentCueName?: string
	playheadCueName?: string
	currentClipName?: string
	currentTimelineName?: string
	watchoutCueName?: string
	watchoutTimelineName?: string
	presets?: VicreoTimerPreset[]
	view: VicreoTimerView
}

export interface VicreoSettings {
	backgroundColor?: string
	foregroundColor?: string
	backgroundImage?: string
	blackout?: boolean
	boxGap?: number
}

export interface VicreoState {
	settings: VicreoSettings
	selectedTimerId?: string | null
	timers: VicreoTimer[]
	logs: Array<Record<string, unknown>>
	outputWindow?: {
		visible?: boolean
	}
	server?: {
		baseUrl?: string
		host?: string
		port?: number
	}
}
