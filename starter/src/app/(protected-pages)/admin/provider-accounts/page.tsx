'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import Spinner from '@/components/ui/Spinner'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { FormItem } from '@/components/ui/Form'
import {
    apiAdminCreateProviderAccount,
    apiAdminDeleteProviderAccount,
    apiAdminGetProviderAccounts,
    apiAdminUpdateProviderAccount,
} from '@/services/VpsService'
import type { ProviderAccount, ProviderName } from '@/@types/vps'

const { Tr, Th, Td, THead, TBody } = Table

const providerOptions: { value: ProviderName; label: string }[] = [
    { value: 'tencent', label: 'tencent' },
    { value: 'alibaba', label: 'alibaba' },
    { value: 'cloudeka', label: 'cloudeka' },
    { value: 'manual', label: 'manual' },
]

const notify = (title: string, type: 'success' | 'danger', msg: string) =>
    toast.push(
        <Notification title={title} type={type}>
            {msg}
        </Notification>,
    )

type FormState = {
    name: string
    provider: ProviderName
    regionDefault: string
    apiKey: string
    apiSecret: string
    isActive: boolean
}

const emptyForm: FormState = {
    name: '',
    provider: 'tencent',
    regionDefault: '',
    apiKey: '',
    apiSecret: '',
    isActive: true,
}

const AdminProviderAccountsPage = () => {
    const [list, setList] = useState<ProviderAccount[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState<FormState>(emptyForm)

    const load = () => {
        setLoading(true)
        apiAdminGetProviderAccounts()
            .then(setList)
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        load()
    }, [])

    const openCreate = () => {
        setEditId(null)
        setForm(emptyForm)
        setOpen(true)
    }

    const openEdit = (acc: ProviderAccount) => {
        setEditId(acc.id)
        setForm({
            name: acc.name,
            provider: acc.provider,
            regionDefault: acc.regionDefault || '',
            apiKey: '',
            apiSecret: '',
            isActive: acc.isActive,
        })
        setOpen(true)
    }

    const handleSave = async () => {
        if (!form.name.trim()) {
            notify('Validation', 'danger', 'Name is required.')
            return
        }
        const payload: Record<string, unknown> = {
            name: form.name.trim(),
            provider: form.provider,
            regionDefault: form.regionDefault || undefined,
            isActive: form.isActive,
        }
        // Only send credentials if provided (write-only).
        if (form.apiKey) payload.apiKey = form.apiKey
        if (form.apiSecret) payload.apiSecret = form.apiSecret

        try {
            setSaving(true)
            if (editId) {
                await apiAdminUpdateProviderAccount(editId, payload)
            } else {
                await apiAdminCreateProviderAccount(payload)
            }
            notify('Saved', 'success', 'Provider account saved.')
            setOpen(false)
            load()
        } catch {
            notify('Failed', 'danger', 'Could not save provider account.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await apiAdminDeleteProviderAccount(id)
            notify('Deleted', 'success', 'Provider account removed.')
            load()
        } catch {
            notify('Failed', 'danger', 'Could not delete (maybe in use).')
        }
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="mb-1">Provider Accounts</h3>
                    <p className="text-gray-500">
                        API accounts used to provision VPS
                    </p>
                </div>
                <Button variant="solid" onClick={openCreate}>
                    Add Account
                </Button>
            </div>
            <Card>
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner size={40} />
                    </div>
                ) : list.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        No provider accounts yet.
                    </div>
                ) : (
                    <Table>
                        <THead>
                            <Tr>
                                <Th>#</Th>
                                <Th>Name</Th>
                                <Th>Provider</Th>
                                <Th>Default Region</Th>
                                <Th>Active</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {list.map((a) => (
                                <Tr key={a.id}>
                                    <Td>{a.id}</Td>
                                    <Td className="font-semibold">{a.name}</Td>
                                    <Td className="capitalize">{a.provider}</Td>
                                    <Td>{a.regionDefault || '-'}</Td>
                                    <Td>{a.isActive ? 'Yes' : 'No'}</Td>
                                    <Td>
                                        <div className="flex gap-2">
                                            <Button
                                                size="xs"
                                                onClick={() => openEdit(a)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="xs"
                                                className="text-red-500"
                                                onClick={() =>
                                                    handleDelete(a.id)
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                )}
            </Card>

            <Dialog
                isOpen={open}
                onClose={() => setOpen(false)}
                onRequestClose={() => setOpen(false)}
            >
                <h5 className="mb-4">
                    {editId ? 'Edit' : 'Add'} Provider Account
                </h5>
                <FormItem label="Name">
                    <Input
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />
                </FormItem>
                <FormItem label="Provider">
                    <Select<{ value: ProviderName; label: string }>
                        options={providerOptions}
                        value={providerOptions.find(
                            (o) => o.value === form.provider,
                        )}
                        onChange={(opt) =>
                            opt && setForm({ ...form, provider: opt.value })
                        }
                    />
                </FormItem>
                <FormItem label="Default Region">
                    <Input
                        value={form.regionDefault}
                        placeholder="Jakarta"
                        onChange={(e) =>
                            setForm({ ...form, regionDefault: e.target.value })
                        }
                    />
                </FormItem>
                <FormItem
                    label="API Key"
                    extra={
                        editId ? 'Leave blank to keep existing' : undefined
                    }
                >
                    <Input
                        value={form.apiKey}
                        onChange={(e) =>
                            setForm({ ...form, apiKey: e.target.value })
                        }
                    />
                </FormItem>
                <FormItem
                    label="API Secret"
                    extra={
                        editId ? 'Leave blank to keep existing' : undefined
                    }
                >
                    <Input
                        value={form.apiSecret}
                        onChange={(e) =>
                            setForm({ ...form, apiSecret: e.target.value })
                        }
                    />
                </FormItem>
                <FormItem label="Active">
                    <Switcher
                        checked={form.isActive}
                        onChange={(checked) =>
                            setForm({ ...form, isActive: checked })
                        }
                    />
                </FormItem>
                <div className="flex justify-end gap-2 mt-2">
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
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

export default AdminProviderAccountsPage
