import React, { useMemo, useState } from 'react'
import Modal from '../common/Modal'
import { Ruler, Search, Check, FlaskRound, Weight, Boxes, Package, Droplet, Hash } from 'lucide-react'

interface UnitTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (unitType: string) => void
  initialValue?: string
}

const presetGroups: { label: string; icon: React.ReactNode; units: string[] }[] = [
  { label: 'Count', icon: <Hash className="h-4 w-4" />, units: ['pcs', 'each', 'pair', 'dozen', 'pack', 'box', 'case'] },
  { label: 'Weight', icon: <Weight className="h-4 w-4" />, units: ['kg', 'g', 'lb', 'oz'] },
  { label: 'Volume', icon: <Droplet className="h-4 w-4" />, units: ['L', 'mL', 'fl oz', 'gal'] },
  { label: 'Length', icon: <Ruler className="h-4 w-4" />, units: ['m', 'cm', 'mm', 'ft', 'in'] },
]

const UnitTypeModal: React.FC<UnitTypeModalProps> = ({ isOpen, onClose, onSelect, initialValue }) => {
  const [query, setQuery] = useState('')
  const [custom, setCustom] = useState(initialValue || '')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return presetGroups
    return presetGroups
      .map(g => ({ ...g, units: g.units.filter(u => u.toLowerCase().includes(q)) }))
      .filter(g => g.units.length > 0)
  }, [query])

  const handleSelect = (u: string) => {
    onSelect(u)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Unit Type"
      description="Choose a standard unit or add your own custom unit."
      size="md"
    >
      <div className="space-y-5">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search units (e.g., kg, box, mL)"
            className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Presets */}
        <div className="space-y-4">
          {filtered.map(group => (
            <div key={group.label}>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                {group.icon}
                <span className="font-medium">{group.label}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.units.map(u => (
                  <button
                    key={u}
                    onClick={() => handleSelect(u)}
                    className="px-3 py-1.5 rounded-full border border-gray-300 hover:border-blue-500 hover:text-blue-600 text-sm"
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Custom */}
        <div className="pt-3 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Custom unit</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g., bundle, tray, roll"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => custom.trim() && handleSelect(custom.trim())}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={!custom.trim()}
            >
              Use
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">Keep it short and consistent, e.g., pcs, pack, tray.</p>
        </div>
      </div>
    </Modal>
  )
}

export default UnitTypeModal
