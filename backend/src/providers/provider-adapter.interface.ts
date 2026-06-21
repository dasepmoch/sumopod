export interface CreateVpsPayload {
    vpsName: string
    region?: string
    operatingSystem?: string
    cpu: number
    ram: number
    storage: number
    providerAccount: {
        apiKey?: string | null
        apiSecret?: string | null
        regionDefault?: string | null
    }
}

export interface CreateVpsResult {
    ipAddress?: string
    username?: string
    password?: string
    externalId?: string
    raw?: unknown
}

export interface RebuildVpsPayload {
    externalId: string
    operatingSystem: string
}

export interface SuspendVpsPayload {
    externalId: string
}

export interface DeleteVpsPayload {
    externalId: string
}

export interface ProviderAdapter {
    createVps(payload: CreateVpsPayload): Promise<CreateVpsResult>
    rebuildVps?(payload: RebuildVpsPayload): Promise<unknown>
    suspendVps?(payload: SuspendVpsPayload): Promise<unknown>
    deleteVps?(payload: DeleteVpsPayload): Promise<unknown>
}
