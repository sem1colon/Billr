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
  Layers,
  ArrowRight
} from 'lucide-react';
import { InvoiceItem } from '../types';
import { formatIndianCurrency } from '../utils/numberToWords';
import { useModalAccessibility } from '../utils/useModalAccessibility';
import { toIsoDateValue } from '../utils/invoiceFormatting';

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
  const dialogRef = useModalAccessibility(isOpen, onClose);
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
      setDate(initialItem.date ? (toIsoDateValue(initialItem.date) || '') : '');
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
      date: toIsoDateValue(date) || date.trim(),
      customer: customer.trim(),
    };

    onSave(item);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm" role="presentation">
        
        {/* Senior-Friendly Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="item-form-dialog-title"
          className="w-full sm:max-w-xl apple-glass-card rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden max-h-[92dvh] flex flex-col z-10"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 id="item-form-dialog-title" className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {initialItem ? 'Edit Line Item' : 'Add Product / Line Item'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Enter quantity, price and commission rate
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 apple-glass-btn rounded-full transition-all cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Form Content */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 pb-safe">
            
            {/* Description & Preset Chips */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                Product / Item Name *
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. SPIRIZYME ADV ULTI"
                className="w-full px-4 py-3 text-base font-semibold text-slate-900 apple-glass-input rounded-2xl focus:outline-none"
              />

              {/* Quick Presets */}
              <div className="pt-1">
                <span className="text-xs font-bold text-slate-500 block mb-1.5">Quick Presets (Tap to fill):</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_PRODUCTS.map((p) => (
                    <button
                      type="button"
                      key={p.name}
                      onClick={() => handleApplyPreset(p)}
                      className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 rounded-xl transition-all cursor-pointer active:scale-95 border border-slate-200"
                    >
                      + {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity, Unit & Unit Price Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity (Weight) *
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  required
                  value={qty}
                  onChange={(e) => handleQtyChange(parseFloat(e.target.value) || 0)}
                  placeholder="1000"
                  className="w-full px-3.5 py-3 text-base font-bold text-slate-900 apple-glass-input rounded-2xl focus:outline-none"
                />
              </div>

              {/* Unit of Measurement */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-3 text-base font-bold text-slate-900 apple-glass-input rounded-2xl focus:outline-none bg-white"
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
                  Unit Price (₹ / {unit})
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => handleUnitPriceChange(parseFloat(e.target.value) || 0)}
                  placeholder="550.00"
                  className="w-full px-3.5 py-3 text-base font-bold text-slate-900 apple-glass-input rounded-2xl focus:outline-none"
                />
              </div>
            </div>

            {/* Gross Product Value Reference Tag */}
            {unitPrice > 0 && (
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs sm:text-sm text-slate-600">
                <span className="font-medium">Total Product Value ({qty} {unit} × ₹{unitPrice}):</span>
                <span className="font-bold text-slate-900">{formatIndianCurrency(grossProductTotal)}</span>
              </div>
            )}

            {/* Commission Rate & Calculation Engine */}
            <div className="p-4 rounded-3xl bg-blue-50/50 border-2 border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-black text-slate-900">
                    Commission Rate & Value
                  </span>
                </div>

                {/* Calculation Mode Segmented Pill */}
                <div className="flex items-center bg-slate-200 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCommMode('PER_UNIT');
                      updateCalculations(qty, unitPrice, commissionRate, 'PER_UNIT');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      commMode === 'PER_UNIT' ? 'bg-white text-blue-700 shadow-sm font-black' : 'text-slate-600'
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
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      commMode === 'PERCENTAGE' ? 'bg-white text-blue-700 shadow-sm font-black' : 'text-slate-600'
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Commission Rate (₹/{unit})
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={commissionRate}
                      onChange={(e) => handleRateChange(parseFloat(e.target.value) || 0)}
                      placeholder="16.50"
                      className="w-full px-3.5 py-3 text-base font-bold text-blue-950 apple-glass-input rounded-2xl focus:outline-none"
                    />
                    {unitPrice > 0 && (
                      <span className="text-xs text-blue-700 font-semibold mt-1 block">
                        = {commissionPct}% of unit price
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Commission Percentage (%)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={commissionPct}
                      onChange={(e) => handlePctChange(parseFloat(e.target.value) || 0)}
                      placeholder="3.0"
                      className="w-full px-3.5 py-3 text-base font-bold text-blue-950 apple-glass-input rounded-2xl focus:outline-none"
                    />
                    <span className="text-xs text-blue-700 font-semibold mt-1 block">
                      = ₹{commissionRate.toFixed(2)} / {unit}
                    </span>
                  </div>
                )}

                {/* Taxable Commission Amount (Final) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Taxable Commission (₹)
                    </label>
                    {isManualAmount && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualAmount(false);
                          updateCalculations(qty, unitPrice, commissionRate, commMode);
                        }}
                        className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        Auto-calc
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={commissionAmount}
                    onChange={(e) => {
                      setIsManualAmount(true);
                      setCommissionAmount(parseFloat(e.target.value) || 0);
                    }}
                    className="w-full px-3.5 py-3 text-base font-black text-slate-900 apple-glass-input rounded-2xl focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 mt-1 block">
                    {qty} {unit} × ₹{commissionRate} = {formatIndianCurrency(qty * commissionRate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer / Party Name, HSN/SAC, Inv Ref & Date */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Client / Party / Customer Name
                </label>
                <input
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="e.g. RAVINDRA AND COMPANY LTD"
                  className="w-full px-3.5 py-2.5 text-base font-semibold text-slate-900 apple-glass-input rounded-2xl focus:outline-none"
                />
              </div>

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
                    className="w-full px-3.5 py-2.5 text-base font-semibold text-slate-900 apple-glass-input rounded-2xl focus:outline-none"
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
                    className="w-full px-3.5 py-2.5 text-base font-semibold text-slate-900 apple-glass-input rounded-2xl focus:outline-none"
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
                    className="w-full px-3.5 py-2.5 text-base font-semibold text-slate-900 apple-glass-input rounded-2xl focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 apple-glass-btn rounded-2xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-3 apple-btn-primary text-white text-xs sm:text-sm font-black rounded-2xl active:scale-[0.98] transition-all cursor-pointer shadow-md"
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
