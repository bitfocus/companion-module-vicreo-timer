import * as http from 'node:http'
import * as https from 'node:https'
import { InstanceBase, InstanceStatus, runEntrypoint, type SomeCompanionConfigField } from '@companion-module/base'
import { UpdateActions } from './actions.js'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { GetPresetDefinitions } from './presets.js'
import type { VicreoState, VicreoTimer } from './types.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateVariableDefinitions, UpdateVariableValues } from './variables.js'
import { getTimerSlotLabel } from './utils.js'

const EMPTY_STATE: VicreoState = {
	settings: {},
	selectedTimerId: null,
	timers: [],
	logs: [],
	outputWindow: { visible: false },
	server: {},
}

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig
	private reconnectTimer: NodeJS.Timeout | null = null
	private sseRequest: http.ClientRequest | null = null
	private isStoppingSse = false
	private apiState: VicreoState = structuredClone(EMPTY_STATE)
	private lastLoggedSelectedTimerId: string | null = null
	private sseDebugEventsRemaining = 5
	private timerChoicesSignature = ''

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
		this.updatePresets()
		this.timerChoicesSignature = this.getTimerChoicesSignature()
		await this.connect()
	}

	async destroy(): Promise<void> {
		this.stopSse()
		if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.stopSse()
		if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
		await this.connect()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	updatePresets(): void {
		this.setPresetDefinitions(GetPresetDefinitions(this))
	}

	getApiState(): VicreoState {
		return this.apiState
	}

	getTimerChoices(): Array<{ id: string; label: string }> {
		return this.apiState.timers.map((timer, index) => ({
			id: timer.id,
			label: getTimerSlotLabel(index + 1, timer),
		}))
	}

	getTimerById(id: string): VicreoTimer | undefined {
		return this.apiState.timers.find((timer) => timer.id === id)
	}

	getTimerBySlot(slot: number): VicreoTimer | undefined {
		return this.apiState.timers[slot - 1]
	}

	getTimerSlotById(id: string): number {
		const index = this.apiState.timers.findIndex((timer) => timer.id === id)
		return index >= 0 ? index + 1 : 0
	}

	getFocusedTimer(): VicreoTimer | undefined {
		return this.apiState.selectedTimerId ? this.getTimerById(this.apiState.selectedTimerId) : undefined
	}

	getFocusedTimerSlot(): number {
		return this.apiState.selectedTimerId ? this.getTimerSlotById(this.apiState.selectedTimerId) : 0
	}

	setFocusedTimerId(id: string): void {
		this.apiState.selectedTimerId = id
		this.refreshStateOnly()
	}

	focusTimerBySlot(slot: number): void {
		const timer = this.getTimerBySlot(slot)
		if (!timer) {
			this.log('warn', `Timer slot ${slot} does not exist`)
			return
		}

		void this.sendTimerAction(timer.id, 'select')
	}

	resolveTimerFromOptions(options: Record<string, unknown>): VicreoTimer | undefined {
		const targetMode = typeof options.targetMode === 'string' ? options.targetMode : 'focused'

		if (targetMode === 'slot') {
			return this.getTimerBySlot(Number(options.slot))
		}

		if (targetMode === 'id') {
			return typeof options.timerId === 'string' ? this.getTimerById(options.timerId) : undefined
		}

		const timer = this.getFocusedTimer()
		if (!timer) {
			this.log('warn', 'No selected timer is available')
		}
		return timer
	}

	async createTimer(payload: Record<string, unknown>): Promise<void> {
		await this.apiRequest('POST', '/api/timers', payload)
	}

	async updateTimer(id: string, payload: Record<string, unknown>): Promise<void> {
		const view = payload.view as Record<string, unknown> | undefined
		const body = {
			...payload,
			view: view && Object.values(view).some((value) => value !== undefined) ? view : undefined,
		}
		await this.apiRequest('PATCH', `/api/timers/${encodeURIComponent(id)}`, body)
	}

	async deleteTimer(id: string): Promise<void> {
		await this.apiRequest('DELETE', `/api/timers/${encodeURIComponent(id)}`)
	}

	async sendTimerAction(id: string, action: string, body?: Record<string, unknown>): Promise<void> {
		await this.apiRequest('POST', `/api/timers/${encodeURIComponent(id)}/${action}`, body)
	}

	private async connect(): Promise<void> {
		try {
			await this.refreshState()
			this.openSseStream().catch((error: unknown) => {
				if (this.isStoppingSse) return
				this.log('warn', `SSE stream ended: ${error instanceof Error ? error.message : String(error)}`)
				this.scheduleReconnect()
			})
		} catch (error) {
			this.updateStatus(InstanceStatus.ConnectionFailure)
			this.log(
				'error',
				`Initial VICREO Timer connection failed: ${error instanceof Error ? error.message : String(error)}`,
			)
			this.scheduleReconnect()
		}
	}

	private scheduleReconnect(): void {
		if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
		this.stopSse()
		this.reconnectTimer = setTimeout(
			() => {
				this.updateStatus(InstanceStatus.Connecting)
				void this.connect()
			},
			Math.max(1, this.config.reconnectInterval) * 1000,
		)
	}

	private stopSse(): void {
		this.isStoppingSse = true
		if (this.sseRequest) {
			this.sseRequest.destroy()
			this.sseRequest = null
		}
	}

	private async openSseStream(): Promise<void> {
		this.stopSse()
		this.isStoppingSse = false
		this.sseDebugEventsRemaining = 5

		await new Promise<void>((resolve, reject) => {
			const url = new URL(`${this.getBaseUrl()}/api/events`)
			const transport = url.protocol === 'https:' ? https : http
			const request = transport.request(
				url,
				{
					method: 'GET',
					headers: { Accept: 'text/event-stream' },
				},
				(response) => {
					if ((response.statusCode ?? 0) < 200 || (response.statusCode ?? 0) >= 300) {
						reject(new Error(`Unable to connect to SSE stream: ${response.statusCode}`))
						return
					}

					this.updateStatus(InstanceStatus.Ok)
					response.setEncoding('utf8')
					let buffer = ''
					let eventName = ''
					let dataLines: string[] = []

					response.on('data', (chunk: string) => {
						buffer += chunk

						while (buffer.includes('\n')) {
							const newlineIndex = buffer.indexOf('\n')
							const rawLine = buffer.slice(0, newlineIndex).replace(/\r$/, '')
							buffer = buffer.slice(newlineIndex + 1)

							if (rawLine === '') {
								if (eventName === 'state' && dataLines.length > 0) {
									try {
										const payload = JSON.parse(dataLines.join('\n')) as { state?: VicreoState }
										if (this.sseDebugEventsRemaining > 0) {
											const timerIds = payload.state?.timers?.map((timer) => timer.id) ?? []
											this.log(
												'debug',
												`SSE state ${6 - this.sseDebugEventsRemaining}/5: selectedTimerId=${payload.state?.selectedTimerId ?? 'null'} timers=${timerIds.join(', ') || '(none)'}`,
											)
											this.sseDebugEventsRemaining--
										}
										if (payload.state) this.applyState(payload.state)
									} catch (error) {
										this.log(
											'warn',
											`Failed to parse SSE payload: ${error instanceof Error ? error.message : String(error)}`,
										)
									}
								}

								eventName = ''
								dataLines = []
								continue
							}

							if (rawLine.startsWith('event:')) {
								eventName = rawLine.slice(6).trim()
							} else if (rawLine.startsWith('data:')) {
								dataLines.push(rawLine.slice(5).trimStart())
							}
						}
					})

					response.on('end', () => {
						this.sseRequest = null
						reject(new Error('SSE stream closed'))
					})

					response.on('error', (error) => {
						this.sseRequest = null
						reject(error)
					})
				},
			)

			this.sseRequest = request
			request.on('error', (error) => {
				this.sseRequest = null
				reject(error)
			})
			request.on('close', () => {
				this.sseRequest = null
				if (!this.isStoppingSse) {
					reject(new Error('SSE connection closed'))
				} else {
					resolve()
				}
			})
			request.end()
		})
	}

	getBaseUrl(): string {
		return `http://${this.config.host}:${this.config.port}`
	}

	async refreshState(): Promise<void> {
		const state = (await this.apiRequest('GET', '/api/state')) as VicreoState
		this.applyState(state)
	}

	async apiRequest(method: string, path: string, body?: Record<string, unknown>): Promise<unknown> {
		const response = await this.rawRequest(method, path, body)

		if (response.statusCode < 200 || response.statusCode >= 300) {
			throw new Error(`${method} ${path} failed: ${response.statusCode} ${response.body}`)
		}

		const contentType = response.headers['content-type'] || ''
		if (!String(contentType).includes('application/json')) return undefined
		return JSON.parse(response.body)
	}

	private async rawRequest(
		method: string,
		path: string,
		body?: Record<string, unknown>,
		headers?: Record<string, string>,
	): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
		const url = new URL(`${this.getBaseUrl()}${path}`)
		const transport = url.protocol === 'https:' ? https : http
		const payload = body ? JSON.stringify(body) : undefined

		return new Promise((resolve, reject) => {
			const request = transport.request(
				url,
				{
					method,
					headers: {
						...(payload ? { 'Content-Type': 'application/json' } : {}),
						...headers,
					},
				},
				(response) => {
					let responseBody = ''
					response.setEncoding('utf8')
					response.on('data', (chunk: string) => {
						responseBody += chunk
					})
					response.on('end', () => {
						resolve({
							statusCode: response.statusCode ?? 0,
							headers: response.headers,
							body: responseBody,
						})
					})
					response.on('error', reject)
				},
			)

			request.on('error', reject)
			if (payload) request.write(payload)
			request.end()
		})
	}

	private applyState(state: VicreoState): void {
		const nextSelectedTimerId = state.selectedTimerId ?? null
		const nextTimers = state.timers ?? []
		const selectedTimerExists =
			nextSelectedTimerId !== null ? nextTimers.some((timer) => timer.id === nextSelectedTimerId) : false

		if (nextSelectedTimerId !== this.lastLoggedSelectedTimerId) {
			this.log(
				'debug',
				`Selected timer update from API/SSE: ${nextSelectedTimerId ?? 'null'} (matched timer: ${selectedTimerExists ? 'yes' : 'no'})`,
			)
			this.lastLoggedSelectedTimerId = nextSelectedTimerId
		} else if (nextSelectedTimerId !== null && !selectedTimerExists) {
			this.log(
				'warn',
				`Selected timer id ${nextSelectedTimerId} was received but is not present in the timers array (${nextTimers.length} timers)`,
			)
		}

		this.apiState = {
			...structuredClone(EMPTY_STATE),
			...state,
			settings: state.settings ?? {},
			selectedTimerId: nextSelectedTimerId,
			timers: nextTimers,
			logs: state.logs ?? [],
			outputWindow: state.outputWindow ?? { visible: false },
			server: state.server ?? {},
		}

		const nextTimerChoicesSignature = this.getTimerChoicesSignature()
		const shouldRefreshDefinitions = nextTimerChoicesSignature !== this.timerChoicesSignature
		this.timerChoicesSignature = nextTimerChoicesSignature

		this.updateStatus(InstanceStatus.Ok)
		if (shouldRefreshDefinitions) {
			this.refreshDefinitions()
		}
		this.refreshStateOnly()
	}

	private refreshDefinitions(): void {
		this.updateActions()
		this.updatePresets()
	}

	private refreshStateOnly(): void {
		UpdateVariableValues(this)
		this.checkFeedbacks()
	}

	private getTimerChoicesSignature(): string {
		return this.apiState.timers.map((timer, index) => `${index + 1}:${timer.id}:${timer.title}`).join('|')
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
