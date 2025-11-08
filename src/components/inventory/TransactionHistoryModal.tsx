import React, { useEffect, useMemo, useState } from 'react'
import { InventoryService } from '../../services/inventoryService'
import { Transaction, TransactionFilters, TransactionType } from '../../types/inventory'
import {
  X,
  FileText,
  AlertCircle,
  Search,
  Calendar,
  ArrowRightLeft,
  Plus,
  Minus,
  RotateCcw,
  Truck,
  DollarSign
} from 'lucide-react'

interface TransactionHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  locationId?: number
  productId?: number
  title?: string
  subtitle?: string
  initialFilters?: Partial<Pick<TransactionFilters, 'start_date' | 'end_date' | 'transaction_types'>>
}

const ALL_TYPES: TransactionType[] = [
  'PURCHASE_RECEIPT',
  'SALE',
  'RETURN',
  'TRANSFER_OUT',
  'TRANSFER_IN',
  'ADJUSTMENT_ADD',
  'ADJUSTMENT_SUB',
  'INITIAL_STOCK'
]

const typeBadge = (type: TransactionType) => {
  const base = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium'
  switch (type) {
    case 'PURCHASE_RECEIPT':
      return `${base} bg-blue-100 text-blue-800`
    case 'SALE':
      return `${base} bg-green-100 text-green-800`
    case 'RETURN':
      return `${base} bg-yellow-100 text-yellow-800`
    case 'TRANSFER_OUT':
      return `${base} bg-orange-100 text-orange-800`
    case 'TRANSFER_IN':
      return `${base} bg-teal-100 text-teal-800`
    case 'ADJUSTMENT_ADD':
      return `${base} bg-indigo-100 text-indigo-800`
    case 'ADJUSTMENT_SUB':
      return `${base} bg-rose-100 text-rose-800`
    case 'INITIAL_STOCK':
      return `${base} bg-gray-100 text-gray-800`
  }
}

const typeIcon = (type: TransactionType) => {
  switch (type) {
    case 'PURCHASE_RECEIPT':
      return <Truck className="h-4 w-4" />
    case 'SALE':
      return <DollarSign className="h-4 w-4" />
    case 'RETURN':
      return <RotateCcw className="h-4 w-4" />
    case 'TRANSFER_OUT':
      return <ArrowRightLeft className="h-4 w-4" />
    case 'TRANSFER_IN':
      return <ArrowRightLeft className="h-4 w-4" />
    case 'ADJUSTMENT_ADD':
      return <Plus className="h-4 w-4" />
    case 'ADJUSTMENT_SUB':
      return <Minus className="h-4 w-4" />
    case 'INITIAL_STOCK':
      return <FileText className="h-4 w-4" />
  }
}

const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  locationId,
  productId,
  title,
  subtitle,
  initialFilters
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState<Pick<TransactionFilters, 'start_date' | 'end_date' | 'transaction_types'>>({
    start_date: initialFilters?.start_date ?? null,
    end_date: initialFilters?.end_date ?? null,
    transaction_types: initialFilters?.transaction_types ?? []
  })

  useEffect(() => {
    if (isOpen) {
      // Load when opened
      fetchTransactions()
    } else {
      // Reset between opens to keep UX predictable
      setTransactions([])
      setError('')
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, locationId, productId])

  useEffect(() => {
    if (!isOpen) return
    fetchTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.start_date, filters.end_date, JSON.stringify(filters.transaction_types)])

  const fetchTransactions = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await InventoryService.getAllTransactions({
        start_date: filters.start_date || null,
        end_date: filters.end_date || null,
        transaction_types: filters.transaction_types.length ? filters.transaction_types : null as any,
        product_id: typeof productId === 'number' ? productId : null,
        location_id: typeof locationId === 'number' ? locationId : null
      })
      if (res.success) {
        setTransactions(res.data || [])
      } else {
        setError(res.message)
      }
    } catch (e) {
      setError('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const close = () => {
    onClose()
  }

  const empty = !loading && !error && transactions.length === 0

  // Simple CSV export of current list
  const csv = useMemo(() => {
    if (!transactions.length) return ''
    const header = ['Date', 'Type', 'Product', 'SKU', 'Quantity', 'Location', 'Lot', 'Reference', 'User', 'Notes']
    const rows = transactions.map(t => [
      new Date(t.created_at).toLocaleString(),
      t.transaction_type,
      t.product_name,
      t.product_sku,
      t.quantity_change,
      t.location_name,
      t.batch_lot_number || '',
      t.reference_id || '',
      t.user_email || '',
      (t.notes || '').replace(/\n|\r/g, ' ')
    ])
    return [header, ...rows].map(r => r.map(String).map(s => '"' + s.replace(/"/g, '""') + '"').join(',')).join('\n')
  }, [transactions])

  const downloadCsv = () => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const parts: string[] = ['transactions']
    if (typeof productId === 'number') parts.push(`product_${productId}`)
    if (typeof locationId === 'number') parts.push(`location_${locationId}`)
    a.download = parts.join('_') + '.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" onClick={close} aria-hidden="true" />

      {/* Panel */}
      <div className="relative mt-10 mb-6 w-[95vw] max-w-5xl bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title || 'Transaction History'}</h3>
            <p className="text-sm text-gray-600 mt-0.5">{subtitle || 'Recent inventory movements for this location'}</p>
          </div>
          <button aria-label="Close" onClick={close} className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={filters.start_date || ''}
                onChange={e => setFilters(f => ({ ...f, start_date: e.target.value || null }))}
                className="w-full rounded-md border-gray-300 text-sm"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="date"
                value={filters.end_date || ''}
                onChange={e => setFilters(f => ({ ...f, end_date: e.target.value || null }))}
                className="w-full rounded-md border-gray-300 text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {ALL_TYPES.map(t => (
                <label key={t} className="inline-flex items-center gap-1 text-xs text-gray-700 bg-white border border-gray-200 rounded px-2 py-1">
                  <input
                    type="checkbox"
                    checked={filters.transaction_types.includes(t)}
                    onChange={e => {
                      const checked = e.target.checked
                      setFilters(f => ({
                        ...f,
                        transaction_types: checked
                          ? [...f.transaction_types, t]
                          : f.transaction_types.filter(x => x !== t)
                      }))
                    }}
                  />
                  <span>{t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setFilters({ start_date: null, end_date: null, transaction_types: [] })}
                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-md border border-gray-200 bg-white"
              >
                Clear Filters
              </button>
              <button
                onClick={downloadCsv}
                className="text-sm text-white bg-gray-700 hover:bg-gray-800 px-3 py-1.5 rounded-md inline-flex items-center gap-2"
              >
                <FileText className="h-4 w-4" /> Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Loading transactions...
            </div>
          )}

          {error && (
            <div className="m-5 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {empty && (
            <div className="p-8 text-center text-gray-600">
              <Search className="h-6 w-6 mx-auto mb-3 text-gray-400" />
              No transactions found for the selected filters.
            </div>
          )}

          {!loading && !error && transactions.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <li key={t.transaction_id} className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50">
                  <div className="mt-0.5 h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                    {typeIcon(t.transaction_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-medium text-gray-900 truncate">{t.product_name}</span>
                      <span className="text-xs text-gray-500">SKU: {t.product_sku}</span>
                      <span className={typeBadge(t.transaction_type)}>{t.transaction_type.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600 flex flex-wrap items-center gap-3">
                      <span>{new Date(t.created_at).toLocaleString()}</span>
                      {t.batch_lot_number && (
                        <span className="text-gray-500">Lot: {t.batch_lot_number}</span>
                      )}
                      {t.reference_id && (
                        <span className="text-gray-500">Ref: {t.reference_id}</span>
                      )}
                      {t.user_email && (
                        <span className="text-gray-500">By: {t.user_email}</span>
                      )}
                    </div>
                    {t.notes && (
                      <p className="mt-2 text-sm text-gray-700">{t.notes}</p>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0 text-right">
                    <div className={`text-sm font-semibold ${t.quantity_change >= 0 ? 'text-green-700' : 'text-rose-700'}`}>
                      {t.quantity_change >= 0 ? '+' : ''}{t.quantity_change}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 bg-white flex items-center justify-between">
          <div className="text-xs text-gray-500">{transactions.length} record{transactions.length === 1 ? '' : 's'}</div>
          <div className="flex items-center gap-2">
            <button onClick={close} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionHistoryModal
