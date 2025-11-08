import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProductViewModal from '../../components/inventory/ProductViewModal'

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const handleClose = () => {
    navigate('/inventory/products')
  }

  const id = productId ? parseInt(productId) : 0

  return (
    <ProductViewModal
      isOpen={true}
      productId={id}
      onClose={handleClose}
    />
  )
}

export default ProductDetailPage