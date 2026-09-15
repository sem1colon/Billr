import React, { useRef, useState, useEffect } from 'react';
import { 
  PenTool, 
  Upload, 
  RotateCcw, 
  Check, 
  X, 
  Trash2,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { getDefaultSignatureDataUrl } from '../utils/signatureUtils';
import { saveSavedSignature, getDefaultOrSavedSignature, loadSavedSignature } from '../utils/storageUtils';
import { useModalAccessibility } from '../utils/useModalAccessibility';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSignatureUrl?: string;
  showSignature?: boolean;
  partnerName?: string;
  onSaveSignature: (signatureUrl: string, showSignature: boolean) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  currentSignatureUrl,
  showSignature = true,
  partnerName = 'R.S.N. Murthy',
  onSaveSignature,
}) => {
  const dialogRef = useModalAccessibility(isOpen, onClose);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeMode, setActiveMode] = useState<'draw' | 'upload' | 'default'>('default');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentSignatureUrl || '');
  const [visible, setVisible] = useState<boolean>(showSignature);
  const [inkColor, setInkColor] = useState<string>('#1e3a8a'); // Deep Blue

  useEffect(() => {
    if (isOpen) {
      const defaultSig = currentSignatureUrl || getDefaultOrSavedSignature();
      setPreviewUrl(defaultSig);
      setVisible(showSignature);
      setHasDrawn(false);
    }
  }, [isOpen, currentSignatureUrl, showSignature]);

  // Set up high-DPI canvas when switching to draw mode
  useEffect(() => {
    if (activeMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3;
      ctx.strokeStyle = inkColor;
    }
  }, [activeMode, inkColor]);

  // Helper to extract canvas point accurately on iPhone retina touch screens
  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Canvas drawing handlers with touch-action prevention
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e) {
      e.stopPropagation();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasPoint(e);
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);

    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if ('touches' in e) {
      e.stopPropagation();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      setPreviewUrl(canvasRef.current.toDataURL('image/png'));
    }
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
    setPreviewUrl('');
  };

  const handleSetToDefault = () => {
    const def = getDefaultSignatureDataUrl();
    setPreviewUrl(def);
    setActiveMode('default');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewUrl(event.target.result as string);
        setActiveMode('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const sigToSave = previewUrl || getDefaultOrSavedSignature();
    saveSavedSignature(sigToSave);
    onSaveSignature(sigToSave, visible);
    onClose();
  };

  const isOfficialDefault = previewUrl === getDefaultSignatureDataUrl();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200" role="presentation">
      <div 
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signature-dialog-title"
        className="apple-glass-card rounded-t-[32px] sm:rounded-[32px] max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                <span id="signature-dialog-title">Sign Invoice</span>
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {partnerName || 'R.S.N. Murthy'} &bull; Murthy Chemical Agencies
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Close signature dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Mode Switcher */}
          <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-2xl text-xs sm:text-sm font-semibold gap-1">
            <button
              type="button"
              onClick={() => { setActiveMode('default'); setPreviewUrl(currentSignatureUrl || getDefaultOrSavedSignature()); }}
              className={`py-2.5 px-1 text-center rounded-xl transition-all cursor-pointer ${
                activeMode === 'default'
                  ? 'bg-white text-blue-700 shadow font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Default Sign
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('draw')}
              className={`py-2.5 px-1 text-center rounded-xl transition-all cursor-pointer ${
                activeMode === 'draw'
                  ? 'bg-white text-blue-700 shadow font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Draw Finger
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('upload')}
              className={`py-2.5 px-1 text-center rounded-xl transition-all cursor-pointer ${
                activeMode === 'upload'
                  ? 'bg-white text-blue-700 shadow font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upload Photo
            </button>
          </div>

          {/* Mode 1: Default / Saved Signature Preview */}
          {activeMode === 'default' && (
            <div className="apple-glass-subtle rounded-2xl p-4 flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {isOfficialDefault ? 'Official Agency Signature' : 'Saved Default Signature'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Active Default ✓
                </span>
              </div>
              <div className="h-28 w-full bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center p-3 shadow-sm">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Default Partner Signature" 
                    className="max-h-24 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-sm text-slate-400">Loading signature...</span>
                )}
              </div>
              <p className="text-xs text-slate-600 text-center font-medium">
                {isOfficialDefault ? (
                  <>Verified signature of <strong>{partnerName || 'R.S.N. Murthy'}</strong> for Murthy Chemical Agencies.</>
                ) : (
                  <>Your custom edited signature is saved and set as default for all invoices.</>
                )}
              </p>
            </div>
          )}

          {/* Mode 2: Draw Custom Signature */}
          {activeMode === 'draw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  Draw with your finger:
                </span>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setInkColor('#1e3a8a')}
                      className={`w-7 h-7 rounded-full bg-blue-900 cursor-pointer ${inkColor === '#1e3a8a' ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
                      title="Royal Blue Ink"
                    />
                    <button
                      type="button"
                      onClick={() => setInkColor('#0f172a')}
                      className={`w-7 h-7 rounded-full bg-slate-900 cursor-pointer ${inkColor === '#0f172a' ? 'ring-2 ring-slate-400 ring-offset-2' : ''}`}
                      title="Black Ink"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCanvas}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-blue-300 rounded-2xl bg-white overflow-hidden touch-none flex items-center justify-center shadow-inner">
                <canvas
                  ref={canvasRef}
                  style={{ touchAction: 'none', width: '100%', height: '160px' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair bg-white select-none"
                />
              </div>
              <p className="text-xs text-slate-500 text-center">
                Tip: Draw your signature directly in the box above.
              </p>
            </div>
          )}

          {/* Mode 3: Upload Image */}
          {activeMode === 'upload' && (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white hover:bg-blue-50/40">
                <Upload className="w-9 h-9 text-blue-600 mb-2" />
                <span className="text-sm font-bold text-slate-800">Tap to upload signature photo</span>
                <span className="text-xs text-slate-500 mt-1">PNG or JPG with signature</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>

              {previewUrl && (
                <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-3">
                    <img src={previewUrl} alt="Uploaded signature" className="h-12 w-auto max-w-[140px] object-contain border p-1 rounded-lg" />
                    <span className="text-xs font-bold text-emerald-700">Photo Loaded ✓</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewUrl('')}
                    className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Persistent Default Notice */}
          <div className="flex items-start space-x-2.5 p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Auto-Remembered:</strong> Your saved signature is kept by default for all invoices until you edit it again.
            </span>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl apple-glass-subtle">
            <div className="flex items-center space-x-3">
              {visible ? <Eye className="w-5 h-5 text-emerald-600" /> : <EyeOff className="w-5 h-5 text-slate-400" />}
              <div>
                <p className="text-sm font-bold text-slate-800">Include Signature on Invoice</p>
                <p className="text-xs text-slate-500">Stamps partner signature on PDF copy</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer ${
                visible ? 'bg-blue-600' : 'bg-slate-300'
              }`}
              aria-label="Toggle signature visibility"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                  visible ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 pb-safe">
          <button
            type="button"
            onClick={handleSetToDefault}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 apple-glass-btn px-3.5 py-2.5 rounded-xl cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Official</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 apple-glass-btn rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 apple-btn-primary text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Save & Set Default</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
