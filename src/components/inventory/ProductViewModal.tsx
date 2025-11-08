import React, { useEffect, useState } from 'react'
import Modal from '../common/Modal'
import { InventoryService } from '../../services/inventoryService'
import { Product } from '../../types/inventory'
import { Eye, Package, Tag, Calendar, User, Barcode } from 'lucide-react'

interface ProductViewModalProps {
  isOpen: boolean
  productId: number
  onClose: () => void
}

const ProductViewModal: React.FC<ProductViewModalProps> = ({ isOpen, productId, onClose }) => {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="inline-flex items-center space-x-2">
          <Eye className="h-5 w-5 text-blue-600" />
          <span>Product Details</span>
        </span>
      }
      description={product ? product.name : 'Loading product details'}
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
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-2 flex items-center space-x-2 text-gray-700">
                <Barcode className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">SKU</span>
              </div>
              <div className="text-gray-900">{product.sku}</div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-2 flex items-center space-x-2 text-gray-700">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Category</span>
              </div>
              <div className="text-gray-900">{product.category_name || '-'}</div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-2 flex items-center space-x-2 text-gray-700">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Unit Type</span>
              </div>
              <div className="text-gray-900">{product.unit_type || '-'}</div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-2 flex items-center space-x-2 text-gray-700">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Created By</span>
              </div>
              <div className="text-gray-900">{product.user_id}</div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 sm:col-span-2">
              <div className="mb-2 flex items-center space-x-2 text-gray-700">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Description</span>
              </div>
              <div className="text-gray-900">{product.description || '-'}</div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-2 flex items-center space-x-2 text-gray-700">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Created At</span>
              </div>
              <div className="text-gray-900">{new Date(product.created_at).toLocaleString()}</div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-2 flex items-center space-x-2 text-gray-700">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Updated At</span>
              </div>
              <div className="text-gray-900">{new Date(product.updated_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default ProductViewModal
