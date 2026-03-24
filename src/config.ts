import { type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	port: number
	reconnectInterval: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'API Host / IP',
			width: 8,
			default: '127.0.0.1',
		},
		{
			type: 'number',
			id: 'port',
			label: 'API Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 3892,
		},
		{
			type: 'number',
			id: 'reconnectInterval',
			label: 'Reconnect Interval (seconds)',
			width: 4,
			min: 1,
			max: 60,
			default: 5,
		},
	]
}
