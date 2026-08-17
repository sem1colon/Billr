import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  Calculator, 
  Package, 
  DollarSign, 
  Percent, 
  Hash, 
  Calendar,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { InvoiceItem } from '../types';
import { formatIndianCurrency } from '../utils/numberToWords';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InvoiceItem) => void;
  initialItem?: InvoiceItem | null;
}

const PRESET_PRODUCTS = [
  { name: 'SPIRIZYME ADV ULTI', defaultUnitPrice: 550, defaultCommRate: 16.50, unit: 'kg' },
  { name: 'FORTIVA REVO X', defaultUnitPrice: 1965, defaultCommRate: 58.95, unit: 'kg' },
  { name: 'EFFYGREN', defaultUnitPrice: 2800, defaultCommRate: 84.00, unit: 'kg' },
  { name: 'EFFYMOLL+', defaultUnitPrice: 2700, defaultCommRate: 780.00, unit: 'kg' },
  { name: 'RM-20', defaultUnitPrice: 26000, defaultCommRate: 780.00, unit: 'kg' },
  { name: 'ALCOHOL ACTIVE DR', defaultUnitPrice: 640, defaultCommRate: 19.20, unit: 'kg' },
];

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  const [description, setDescription] = useState('');
  const [hsnSacCode, setHsnSacCode] = useState('998311');
  const [qty, setQty] = useState<number>(1000);
  const [unit, setUnit] = useState('kg');
  const [unitPrice, setUnitPrice] = useState<number>(550);
  const [commMode, setCommMode] = useState<'PER_UNIT' | 'PERCENTAGE'>('PER_UNIT');
  const [commissionRate, setCommissionRate] = useState<number>(16.50); // ₹/unit or %
  const [commissionPct, setCommissionPct] = useState<number>(3.0);
  const [commissionAmount, setCommissionAmount] = useState<number>(16500);
  const [invNo, setInvNo] = useState('');
  const [date, setDate] = useState('');
  const [customer, setCustomer] = useState('');
  const [isManualAmount, setIsManualAmount] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setDescription(initialItem.description);
      setHsnSacCode(initialItem.hsnSacCode || '998311');
      setQty(initialItem.qty);
      setUnit(initialItem.unit || 'kg');
      const uPrice = initialItem.unitPrice ?? 0;
      setUnitPrice(uPrice);
      setCommissionRate(initialItem.commissionRate);
      
      if (uPrice > 0 && initialItem.commissionRate > 0) {
        setCommissionPct(Number(((initialItem.commissionRate / uPrice) * 100).toFixed(2)));
      }
      
      setCommissionAmount(initialItem.commissionAmount);
      setInvNo(initialItem.invNo || '');
      setDate(initialItem.date || '');
      setCustomer(initialItem.customer || '');
      setIsManualAmount(false);
    } else {
      setDescription('SPIRIZYME ADV ULTI');
      setHsnSacCode('998311');
      setQty(1000);
      setUnit('kg');
      setUnitPrice(550);
      setCommMode('PER_UNIT');
      setCommissionRate(16.50);
      setCommissionPct(3.0);
      setCommissionAmount(16500);
      setInvNo('');
      setDate(new Date().toISOString().split('T')[0]);
      setCustomer('');
      setIsManualAmount(false);
    }
  }, [initialItem, isOpen]);

  // Recalculations
  const updateCalculations = (
    newQty: number,
    newUnitPrice: number,
    newRate: number,
    mode: 'PER_UNIT' | 'PERCENTAGE'
  ) => {
    let effectiveRate = newRate;
    let computedPct = commissionPct;

    if (mode === 'PERCENTAGE') {
      computedPct = newRate;
      effectiveRate = Number(((newUnitPrice * newRate) / 100).toFixed(4));
    } else {
      if (newUnitPrice > 0) {
        computedPct = Number(((newRate / newUnitPrice) * 100).toFixed(2));
      }
    }

    setCommissionPct(computedPct);
    setCommissionRate(effectiveRate);

    if (!isManualAmount) {
      const totalComm = Number((newQty * effectiveRate).toFixed(2));
      setCommissionAmount(totalComm);
    }
  };

  const handleQtyChange = (val: number) => {
    setQty(val);
    updateCalculations(val, unitPrice, commissionRate, commMode);
  };

  const handleUnitPriceChange = (val: number) => {
    setUnitPrice(val);
    if (commMode === 'PERCENTAGE') {
      updateCalculations(qty, val, commissionPct, 'PERCENTAGE');
    } else {
      updateCalculations(qty, val, commissionRate, 'PER_UNIT');
    }
  };

  const handleRateChange = (val: number) => {
    setCommissionRate(val);
    updateCalculations(qty, unitPrice, val, 'PER_UNIT');
  };

  const handlePctChange = (val: number) => {
    setCommissionPct(val);
    updateCalculations(qty, unitPrice, val, 'PERCENTAGE');
  };

  const handleApplyPreset = (preset: typeof PRESET_PRODUCTS[0]) => {
    setDescription(preset.name);
    setUnitPrice(preset.defaultUnitPrice);
    setCommissionRate(preset.defaultCommRate);
    setUnit(preset.unit);
    const pct = Number(((preset.defaultCommRate / preset.defaultUnitPrice) * 100).toFixed(2));
    setCommissionPct(pct);
    const totalComm = Number((qty * preset.defaultCommRate).toFixed(2));
    setCommissionAmount(totalComm);
    setIsManualAmount(false);
  };

  const grossProductTotal = Number((qty * unitPrice).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const item: InvoiceItem = {
      id: initialItem ? initialItem.id : `item-${Date.now()}`,
      description: description.trim(),
      hsnSacCode: hsnSacCode.trim() || '998311',
      qty: Number(qty) || 1,
      unit: unit.trim() || 'kg',
      unitPrice: unitPrice > 0 ? unitPrice : undefined,
      productAmount: grossProductTotal > 0 ? grossProductTotal : undefined,
      commissionType: commMode,
      commissionRate: Number(commissionRate) || 0,
      commissionAmount: Number(commissionAmount) || 0,
      invNo: invNo.trim(),
      date: date.trim(),
      customer: customer.trim(),
    };

    onSave(item);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-md">
        
        {/* Apple Liquid Glass Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="w-full sm:max-w-xl bg-white/90 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-white/80 overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Specular Rim Light */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] bg-white/40">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-bold border border-blue-500/20">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {initialItem ? 'Edit Line Item' : 'Add Commission Service & Product'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Quantity, Unit Price & Commission Calculation
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-black/[0.05] rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            
            {/* Description & Preset Chips */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Product / Service Description *
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. SPIRIZYME ADV ULTI (Bio Agro Energy Pvt Ltd)"
                className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white/80 border border-black/[0.08] rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none shadow-inner transition-all"
              />

              {/* Quick Apple Liquid Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-bold text-slate-400">Presets:</span>
                {PRESET_PRODUCTS.map((p) => (
                  <button
                    type="button"
                    key={p.name}
                    onClick={() => handleApplyPreset(p)}
                    className="text-[11px] font-semibold px-2.5 py-1 bg-black/[0.03] hover:bg-blue-500/10 hover:text-blue-700 text-slate-700 rounded-xl border border-black/[0.06] transition-all"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity, Unit & Unit Price Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity / Weight *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={qty}
                    onChange={(e) => handleQtyChange(parseFloat(e.target.value) || 0)}
                    placeholder="1000"
                    className="w-full px-3 py-2 text-sm font-bold text-slate-900 bg-white/80 border border-black/[0.08] rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none shadow-inner"
                  />
                </div>
              </div>

              {/* Unit of Measurement */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold text-slate-900 bg-white/80 border border-black/[0.08] rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-inner"
                >
                  <option value="kg">kg (Kilograms)</option>
                  <option value="Lot">Lot / Lumpsum</option>
                  <option value="Nos">Nos (Units)</option>
                  <option value="MT">MT (Metric Ton)</option>
                  <option value="Ltr">Ltr (Liters)</option>
                  <option value="Bags">Bags</option>
                </select>
              </div>

              {/* Unit Price (Sales Rate per kg) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Unit Price (₹ per {unit})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => handleUnitPriceChange(parseFloat(e.target.value) || 0)}
                    placeholder="550.00"
                    className="w-full px-3 py-2 text-sm font-bold text-slate-900 bg-white/80 border border-black/[0.08] rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Gross Product Value Reference Tag */}
            {unitPrice > 0 && (
              <div className="px-3.5 py-2 bg-black/[0.02] border border-black/[0.06] rounded-2xl flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium">Gross Product Value ({qty} {unit} × ₹{unitPrice}):</span>
                <span className="font-bold text-slate-900">{formatIndianCurrency(grossProductTotal)}</span>
              </div>
            )}

            {/* Commission Rate & Calculation Engine */}
            <div className="p-4 rounded-3xl bg-blue-500/[0.04] border border-blue-500/15 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-extrabold text-blue-950">
                    Commission Rate & Value
                  </span>
                </div>

                {/* Calculation Mode Segmented Pill */}
                <div className="flex items-center bg-black/[0.04] p-0.5 rounded-xl border border-black/[0.06]">
                  <button
                    type="button"
                    onClick={() => {
                      setCommMode('PER_UNIT');
                      updateCalculations(qty, unitPrice, commissionRate, 'PER_UNIT');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      commMode === 'PER_UNIT'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ₹ per {unit}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCommMode('PERCENTAGE');
                      updateCalculations(qty, unitPrice, commissionPct, 'PERCENTAGE');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      commMode === 'PERCENTAGE'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    % of Price
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Rate Input */}
                {commMode === 'PER_UNIT' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Commission Rate (₹/{unit})
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={commissionRate}
                      onChange={(e) => handleRateChange(parseFloat(e.target.value) || 0)}
                      placeholder="16.50"
                      className="w-full px-3 py-2 text-sm font-bold text-blue-900 bg-white border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
                    />
                    {unitPrice > 0 && (
                      <span className="text-[10px] text-blue-600 font-semibold mt-0.5 block">
                        Equivalent to {commissionPct}% of unit price
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Commission Percentage (%)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={commissionPct}
                      onChange={(e) => handlePctChange(parseFloat(e.target.value) || 0)}
                      placeholder="3.0"
                      className="w-full px-3 py-2 text-sm font-bold text-blue-900 bg-white border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
                    />
                    <span className="text-[10px] text-blue-600 font-semibold mt-0.5 block">
                      = ₹{commissionRate.toFixed(2)} / {unit}
                    </span>
                  </div>
                )}

                {/* Taxable Commission Amount (Final) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Taxable Commission (₹)
                    </label>
                    {isManualAmount && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualAmount(false);
                          updateCalculations(qty, unitPrice, commissionRate, commMode);
                        }}
                        className="text-[10px] text-blue-600 hover:underline font-semibold"
                      >
                        Auto-calc
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={commissionAmount}
                    onChange={(e) => {
                      setIsManualAmount(true);
                      setCommissionAmount(parseFloat(e.target.value) || 0);
                    }}
                    className="w-full px-3 py-2 text-sm font-black text-slate-900 bg-white border border-blue-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {qty} {unit} × ₹{commissionRate} = {formatIndianCurrency(qty * commissionRate)}
                  </span>
                </div>
              </div>
            </div>

            {/* HSN/SAC, Customer, Inv Ref & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  HSN / SAC Code
                </label>
                <input
                  type="text"
                  value={hsnSacCode}
                  onChange={(e) => setHsnSacCode(e.target.value)}
                  placeholder="998311"
                  className="w-full px-3 py-2 text-sm font-semibold text-slate-900 bg-white/80 border border-black/[0.08] rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reference Inv No
                </label>
                <input
                  type="text"
                  value={invNo}
                  onChange={(e) => setInvNo(e.target.value)}
                  placeholder="800086408"
                  className="w-full px-3 py-2 text-sm font-semibold text-slate-900 bg-white/80 border border-black/[0.08] rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supply Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-semibold text-slate-900 bg-white/80 border border-black/[0.08] rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-3 border-t border-black/[0.06] flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-black/[0.04] rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-2xl shadow-[0_4px_16px_rgba(37,99,235,0.3)] active:scale-[0.98] transition-all"
              >
                <Check className="w-4 h-4" />
                <span>{initialItem ? 'Save Item' : 'Add Line Item'}</span>
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
