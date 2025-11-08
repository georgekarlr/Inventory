import React, { useEffect, useState } from 'react'
import Modal from '../common/Modal'
import ProductForm from './ProductForm'
import { Product, ProductFormData } from '../../types/inventory'
import { InventoryService } from '../../services/inventoryService'
import { Pencil } from 'lucide-react'

interface ProductEditModalProps {
  isOpen: boolean
  productId: number
  onClose: () => void
  onUpdated?: (product: Product) => void
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({ isOpen, productId, onClose, onUpdated }) => {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadProduct()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, productId])

  const loadProduct = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await InventoryService.getProductById(productId)
      if (result.success && result.data) {
        setProduct(result.data)
      } else {
        setError(result.message)
      }
    } catch (e) {
      setError('Failed to load product details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: ProductFormData) => {
    if (!product) return
    setSubmitLoading(true)
    setError('')
    try {
      const result = await InventoryService.updateProduct(product.product_id, data)
      if (!result.success) {
        throw new Error(result.message)
      }
      onUpdated?.(product)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update product')
      throw e
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="inline-flex items-center space-x-2">
          <Pencil className="h-5 w-5 text-green-600" />
          <span>Edit Product</span>
        </span>
      }
      description={product ? `Update details for ${product.name}` : 'Loading product details'}
      size="lg"
    >
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      ) : error || !product ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error || 'Product not found'}
        </div>
      ) : (
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={submitLoading}
          submitLabel="Update Product"
          allowUnitTypeEdit={true}
        />
      )}
    </Modal>
  )
}

export default ProductEditModal
