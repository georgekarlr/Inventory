import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import ProductCreateModal from '../../components/inventory/ProductCreateModal'
import { AlertCircle } from 'lucide-react'

const CreateProductPage: React.FC = () => {
  const { persona } = useAuth()
  const navigate = useNavigate()

  // Redirect if not admin
  useEffect(() => {
    if (persona && persona.type !== 'admin') {
      navigate('/dashboard')
    }
  }, [persona, navigate])

  const handleClose = () => {
    navigate('/inventory/products')
  }

  // Show access denied if not admin
  if (persona && persona.type !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">Only administrators can create products.</p>
        </div>
      </div>
    )
  }

  return (
    <ProductCreateModal
      isOpen={true}
      onClose={handleClose}
      onCreated={() => navigate('/inventory/products')}
    />
  )
}

export default CreateProductPage