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
    apiAdminCreateProduct,
    apiAdminDeleteProduct,
    apiAdminGetProducts,
    apiAdminGetProviderAccounts,
    apiAdminUpdateProduct,
} from '@/services/VpsService'
import { formatIDR } from '../../_shared/statusHelpers'
import type {
    AdminProduct,
    ProviderAccount,
    ProviderName,
    ProvisioningType,
} from '@/@types/vps'

const { Tr, Th, Td, THead, TBody } = Table

const provisioningOptions: { value: ProvisioningType; label: string }[] = [
    { value: 'manual', label: 'manual' },
    { value: 'api', label: 'api' },
    { value: 'stock', label: 'stock' },
]

const notify = (title: string, type: 'success' | 'danger', msg: string) =>
    toast.push(
        <Notification title={title} type={type}>
            {msg}
        </Notification>,
    )

type FormState = {
    name: string
    providerAccountId: number | null
    provider: ProviderName
    region: string
    cpu: string
    ram: string
    storage: string
    bandwidth: string
    transfer: string
    priceMonthly: string
    costMonthly: string
    osOptions: string
    provisioningType: ProvisioningType
    isActive: boolean
}

const emptyForm: FormState = {
    name: '',
    providerAccountId: null,
    provider: 'tencent',
    region: '',
    cpu: '1',
    ram: '1',
    storage: '20',
    bandwidth: '',
    transfer: '',
    priceMonthly: '0',
    costMonthly: '0',
    osOptions: '',
    provisioningType: 'manual',
    isActive: true,
}

const AdminProductsPage = () => {
    const [list, setList] = useState<AdminProduct[]>([])
    const [accounts, setAccounts] = useState<ProviderAccount[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState<FormState>(emptyForm)

    const load = () => {
        setLoading(true)
        Promise.all([apiAdminGetProducts(), apiAdminGetProviderAccounts()])
            .then(([products, accs]) => {
                setList(products)
                setAccounts(accs)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        load()
    }, [])

    const accountOptions = accounts.map((a) => ({
        value: a.id,
        label: `${a.name} (${a.provider})`,
        provider: a.provider,
    }))

    const openCreate = () => {
        setEditId(null)
        setForm(emptyForm)
        setOpen(true)
    }

    const openEdit = (p: AdminProduct) => {
        setEditId(p.id)
        setForm({
            name: p.name,
            providerAccountId: p.providerAccountId,
            provider: p.provider,
            region: p.region || '',
            cpu: String(p.cpu),
            ram: String(p.ram),
            storage: String(p.storage),
            bandwidth: p.bandwidth || '',
            transfer: p.transfer || '',
            priceMonthly: String(p.priceMonthly),
            costMonthly: String(p.costMonthly ?? 0),
            osOptions: p.osOptions || '',
            provisioningType: p.provisioningType,
            isActive: p.isActive,
        })
        setOpen(true)
    }

    const handleSave = async () => {
        if (!form.name.trim() || !form.providerAccountId) {
            notify('Validation', 'danger', 'Name and provider account required.')
            return
        }
        const payload = {
            name: form.name.trim(),
            providerAccountId: form.providerAccountId,
            provider: form.provider,
            region: form.region || undefined,
            cpu: Number(form.cpu),
            ram: Number(form.ram),
            storage: Number(form.storage),
            bandwidth: form.bandwidth || undefined,
            transfer: form.transfer || undefined,
            priceMonthly: Number(form.priceMonthly),
            costMonthly: Number(form.costMonthly),
            osOptions: form.osOptions || undefined,
            provisioningType: form.provisioningType,
            isActive: form.isActive,
        }
        try {
            setSaving(true)
            if (editId) {
                await apiAdminUpdateProduct(editId, payload)
            } else {
                await apiAdminCreateProduct(payload)
            }
            notify('Saved', 'success', 'Product saved.')
            setOpen(false)
            load()
        } catch {
            notify('Failed', 'danger', 'Could not save product.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await apiAdminDeleteProduct(id)
            notify('Deleted', 'success', 'Product removed.')
            load()
        } catch {
            notify('Failed', 'danger', 'Could not delete (maybe in use).')
        }
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="mb-1">Products</h3>
                    <p className="text-gray-500">VPS plans sold to customers</p>
                </div>
                <Button variant="solid" onClick={openCreate}>
                    Add Product
                </Button>
            </div>
            <Card>
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner size={40} />
                    </div>
                ) : list.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        No products yet.
                    </div>
                ) : (
                    <Table>
                        <THead>
                            <Tr>
                                <Th>#</Th>
                                <Th>Name</Th>
                                <Th>Spec</Th>
                                <Th>Provider Account</Th>
                                <Th>Price</Th>
                                <Th>Type</Th>
                                <Th>Active</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {list.map((p) => (
                                <Tr key={p.id}>
                                    <Td>{p.id}</Td>
                                    <Td className="font-semibold">{p.name}</Td>
                                    <Td>
                                        {p.cpu} vCPU / {p.ram} GB / {p.storage}{' '}
                                        GB
                                    </Td>
                                    <Td>{p.providerAccount?.name || '-'}</Td>
                                    <Td>{formatIDR(p.priceMonthly)}</Td>
                                    <Td className="capitalize">
                                        {p.provisioningType}
                                    </Td>
                                    <Td>{p.isActive ? 'Yes' : 'No'}</Td>
                                    <Td>
                                        <div className="flex gap-2">
                                            <Button
                                                size="xs"
                                                onClick={() => openEdit(p)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="xs"
                                                className="text-red-500"
                                                onClick={() =>
                                                    handleDelete(p.id)
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
                width={640}
                onClose={() => setOpen(false)}
                onRequestClose={() => setOpen(false)}
            >
                <h5 className="mb-4">{editId ? 'Edit' : 'Add'} Product</h5>
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                    <FormItem label="Name">
                        <Input
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        />
                    </FormItem>
                    <FormItem label="Provider Account">
                        <Select<{
                            value: number
                            label: string
                            provider: ProviderName
                        }>
                            options={accountOptions}
                            value={accountOptions.find(
                                (o) => o.value === form.providerAccountId,
                            )}
                            onChange={(opt) =>
                                opt &&
                                setForm({
                                    ...form,
                                    providerAccountId: opt.value,
                                    provider: opt.provider,
                                })
                            }
                        />
                    </FormItem>
                    <div className="grid grid-cols-2 gap-4">
                        <FormItem label="Region">
                            <Input
                                value={form.region}
                                placeholder="Jakarta"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        region: e.target.value,
                                    })
                                }
                            />
                        </FormItem>
                        <FormItem label="Provisioning Type">
                            <Select<{
                                value: ProvisioningType
                                label: string
                            }>
                                options={provisioningOptions}
                                value={provisioningOptions.find(
                                    (o) => o.value === form.provisioningType,
                                )}
                                onChange={(opt) =>
                                    opt &&
                                    setForm({
                                        ...form,
                                        provisioningType: opt.value,
                                    })
                                }
                            />
                        </FormItem>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <FormItem label="CPU (vCPU)">
                            <Input
                                type="number"
                                value={form.cpu}
                                onChange={(e) =>
                                    setForm({ ...form, cpu: e.target.value })
                                }
                            />
                        </FormItem>
                        <FormItem label="RAM (GB)">
                            <Input
                                type="number"
                                value={form.ram}
                                onChange={(e) =>
                                    setForm({ ...form, ram: e.target.value })
                                }
                            />
                        </FormItem>
                        <FormItem label="Storage (GB)">
                            <Input
                                type="number"
                                value={form.storage}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        storage: e.target.value,
                                    })
                                }
                            />
                        </FormItem>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormItem label="Bandwidth">
                            <Input
                                value={form.bandwidth}
                                placeholder="30 Mbps"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        bandwidth: e.target.value,
                                    })
                                }
                            />
                        </FormItem>
                        <FormItem label="Transfer">
                            <Input
                                value={form.transfer}
                                placeholder="1.02 TB"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        transfer: e.target.value,
                                    })
                                }
                            />
                        </FormItem>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormItem label="Price / month (IDR)">
                            <Input
                                type="number"
                                value={form.priceMonthly}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        priceMonthly: e.target.value,
                                    })
                                }
                            />
                        </FormItem>
                        <FormItem label="Cost / month (IDR)">
                            <Input
                                type="number"
                                value={form.costMonthly}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        costMonthly: e.target.value,
                                    })
                                }
                            />
                        </FormItem>
                    </div>
                    <FormItem
                        label="OS Options"
                        extra="Comma separated, e.g. Ubuntu 22.04,Debian 12"
                    >
                        <Input
                            value={form.osOptions}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    osOptions: e.target.value,
                                })
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
                </div>
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

export default AdminProductsPage
