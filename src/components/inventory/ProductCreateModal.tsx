import React, { useState } from 'react'
import Modal from '../common/Modal'
import ProductForm from './ProductForm'
import { ProductFormData } from '../../types/inventory'
import { InventoryService } from '../../services/inventoryService'
import { PackagePlus } from 'lucide-react'

interface ProductCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: () => void
}

const ProductCreateModal: React.FC<ProductCreateModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (data: ProductFormData) => {
    setLoading(true)
    setError('')
    try {
      const result = await InventoryService.createProduct(data)
      if (!result.success) {
        throw new Error(result.message)
      }
      onCreated?.()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create product')
      throw e
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="inline-flex items-center space-x-2">
          <PackagePlus className="h-5 w-5 text-blue-600" />
          <span>Create Product</span>
        </span>
      }
      description="Add a new product to your catalog"
      size="lg"
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <ProductForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={loading}
        submitLabel="Create Product"
        requireUnitType
      />
    </Modal>
  )
}

export default ProductCreateModal
