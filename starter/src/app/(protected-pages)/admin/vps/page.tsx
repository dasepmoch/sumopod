'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import Spinner from '@/components/ui/Spinner'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { FormItem } from '@/components/ui/Form'
import {
    apiAdminGetVps,
    apiAdminUpdateVps,
    apiAdminUpdateVpsStatus,
} from '@/services/VpsService'
import { VpsStatusTag } from '../../_shared/StatusTag'
import { formatDate } from '../../_shared/statusHelpers'
import type { VpsInstance, VpsStatus } from '@/@types/vps'

const { Tr, Th, Td, THead, TBody } = Table

const statusOptions: { value: VpsStatus; label: string }[] = [
    { value: 'provisioning', label: 'provisioning' },
    { value: 'active', label: 'active' },
    { value: 'suspended', label: 'suspended' },
    { value: 'expired', label: 'expired' },
    { value: 'terminated', label: 'terminated' },
]

const notify = (title: string, type: 'success' | 'danger', msg: string) =>
    toast.push(
        <Notification title={title} type={type}>
            {msg}
        </Notification>,
    )

const toDateInput = (value?: string | null) => {
    if (!value) return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 10)
}

const AdminVpsPage = () => {
    const [list, setList] = useState<VpsInstance[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<VpsInstance | null>(null)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        ipAddress: '',
        username: '',
        password: '',
        operatingSystem: '',
        expiredAt: '',
    })

    const load = () => {
        setLoading(true)
        apiAdminGetVps()
            .then(setList)
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        load()
    }, [])

    const openEdit = (vps: VpsInstance) => {
        setEditing(vps)
        setForm({
            ipAddress: vps.ipAddress || '',
            username: vps.username || '',
            password: vps.password || '',
            operatingSystem: vps.operatingSystem || '',
            expiredAt: toDateInput(vps.expiredAt),
        })
    }

    const handleSave = async () => {
        if (!editing) return
        try {
            setSaving(true)
            await apiAdminUpdateVps(editing.id, {
                ipAddress: form.ipAddress || undefined,
                username: form.username || undefined,
                password: form.password || undefined,
                operatingSystem: form.operatingSystem || undefined,
                expiredAt: form.expiredAt
                    ? new Date(form.expiredAt).toISOString()
                    : undefined,
            })
            notify('Saved', 'success', 'VPS details updated.')
            setEditing(null)
            load()
        } catch {
            notify('Failed', 'danger', 'Could not update VPS.')
        } finally {
            setSaving(false)
        }
    }

    const handleStatus = async (id: number, status: VpsStatus) => {
        try {
            await apiAdminUpdateVpsStatus(id, status)
            notify('Updated', 'success', `Status changed to ${status}.`)
            load()
        } catch {
            notify(
                'Failed',
                'danger',
                'Invalid status transition or server error.',
            )
        }
    }

    return (
        <div>
            <div className="mb-6">
                <h3 className="mb-1">VPS Instances</h3>
                <p className="text-gray-500">
                    Fill connection details and manage status
                </p>
            </div>
            <Card>
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner size={40} />
                    </div>
                ) : list.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        No VPS instances yet.
                    </div>
                ) : (
                    <Table>
                        <THead>
                            <Tr>
                                <Th>#</Th>
                                <Th>VPS Name</Th>
                                <Th>Owner</Th>
                                <Th>IP</Th>
                                <Th>Provider</Th>
                                <Th>Status</Th>
                                <Th>Expired</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {list.map((v) => (
                                <Tr key={v.id}>
                                    <Td>{v.id}</Td>
                                    <Td className="font-semibold">
                                        {v.vpsName}
                                    </Td>
                                    <Td>{v.user?.email || v.userId}</Td>
                                    <Td>{v.ipAddress || '-'}</Td>
                                    <Td className="capitalize">{v.provider}</Td>
                                    <Td>
                                        <div className="w-40">
                                            <Select<{
                                                value: VpsStatus
                                                label: string
                                            }>
                                                size="sm"
                                                options={statusOptions}
                                                value={statusOptions.find(
                                                    (o) =>
                                                        o.value === v.status,
                                                )}
                                                onChange={(opt) =>
                                                    opt &&
                                                    handleStatus(
                                                        v.id,
                                                        opt.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </Td>
                                    <Td>{formatDate(v.expiredAt)}</Td>
                                    <Td>
                                        <Button
                                            size="xs"
                                            variant="solid"
                                            onClick={() => openEdit(v)}
                                        >
                                            Edit details
                                        </Button>
                                    </Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                )}
            </Card>

            <Dialog
                isOpen={Boolean(editing)}
                onClose={() => setEditing(null)}
                onRequestClose={() => setEditing(null)}
            >
                <h5 className="mb-4">Edit VPS Details</h5>
                <FormItem label="IP Address">
                    <Input
                        value={form.ipAddress}
                        placeholder="103.10.20.30"
                        onChange={(e) =>
                            setForm({ ...form, ipAddress: e.target.value })
                        }
                    />
                </FormItem>
                <FormItem label="Username">
                    <Input
                        value={form.username}
                        placeholder="root"
                        onChange={(e) =>
                            setForm({ ...form, username: e.target.value })
                        }
                    />
                </FormItem>
                <FormItem label="Password">
                    <Input
                        value={form.password}
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                    />
                </FormItem>
                <FormItem label="Operating System">
                    <Input
                        value={form.operatingSystem}
                        placeholder="Ubuntu 22.04"
                        onChange={(e) =>
                            setForm({
                                ...form,
                                operatingSystem: e.target.value,
                            })
                        }
                    />
                </FormItem>
                <FormItem label="Expired Date">
                    <Input
                        type="date"
                        value={form.expiredAt}
                        onChange={(e) =>
                            setForm({ ...form, expiredAt: e.target.value })
                        }
                    />
                </FormItem>
                <div className="flex justify-end gap-2 mt-2">
                    <Button onClick={() => setEditing(null)}>Cancel</Button>
                    <Button
                        variant="solid"
                        loading={saving}
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default AdminVpsPage
