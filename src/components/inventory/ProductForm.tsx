import React, { useState, useEffect } from 'react'
import { Product, Category, ProductFormData } from '../../types/inventory'
import { InventoryService } from '../../services/inventoryService'
import { Package, FileText, Tag, AlertCircle, Boxes } from 'lucide-react'
import UnitTypeModal from './UnitTypeModal'

interface ProductFormProps {
  initialData?: Product | null
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
  allowUnitTypeEdit?: boolean
  requireUnitType?: boolean
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save Product',
  allowUnitTypeEdit = true,
  requireUnitType = false
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    description: '',
    unit_price: 0,
    supplier_id: null,
    category_id: null,
    unit_type: '',
    metadata: null
  })
  const [showUnitModal, setShowUnitModal] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadFormData()
  }, [])

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        description: initialData.description || '',
        unit_price: initialData.unit_price ?? 0,
        supplier_id: initialData.supplier_id ?? null,
        category_id: initialData.category_id || null,
        unit_type: initialData.unit_type || '',
        metadata: initialData.metadata || null
      })
    }
  }, [initialData])

  const loadFormData = async () => {
    setLoadingData(true)
    setError('')

    try {
      const categoriesResult = await InventoryService.getAllCategories()

      if (categoriesResult.success) {
        setCategories(categoriesResult.data || [])
      } else {
        setError(categoriesResult.message)
      }
    } catch (err) {
      setError('Failed to load form data')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Product name is required')
      return
    }

    if (!formData.sku.trim()) {
      setError('SKU is required')
      return
    }

    if (requireUnitType && !formData.unit_type.trim()) {
      setError('Unit type is required')
      return
    }

    try {
      await onSubmit(formData)
    } catch (err) {
      setError('Failed to save product')
    }
  }

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loadingData) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {initialData ? 'Edit Product' : 'Create New Product'}
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Pricing and supplier information is tracked when receiving stock.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product name"
              />
            </div>
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter SKU"
              />
            </div>
          </div>

          {/* Unit Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Type{requireUnitType ? ' *' : ''}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Boxes className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.unit_type}
                  readOnly
                  placeholder="Select unit type (e.g., pcs, box)"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              {allowUnitTypeEdit && (
                <button
                  type="button"
                  onClick={() => setShowUnitModal(true)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Choose
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">Used to describe how you count this product (e.g., pcs, box, kg).</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category_id || ''}
              onChange={(e) => handleInputChange('category_id', e.target.value ? parseInt(e.target.value) : null)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product description"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>

      {/* Unit Type Modal */}
      <UnitTypeModal
        isOpen={showUnitModal}
        onClose={() => setShowUnitModal(false)}
        initialValue={formData.unit_type}
        onSelect={(val) => setFormData(prev => ({ ...prev, unit_type: val }))}
      />
    </div>
  )
}

export default ProductForm
