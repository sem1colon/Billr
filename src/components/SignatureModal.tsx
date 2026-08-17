import React, { useRef, useState, useEffect } from 'react';
import { 
  PenTool, 
  Upload, 
  RotateCcw, 
  Check, 
  X, 
  Sparkles, 
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { getDefaultSignatureDataUrl } from '../utils/signatureUtils';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSignatureUrl?: string;
  showSignature?: boolean;
  partnerName: string;
  onSaveSignature: (signatureUrl: string, showSignature: boolean) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  currentSignatureUrl,
  showSignature = true,
  partnerName,
  onSaveSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeMode, setActiveMode] = useState<'draw' | 'upload' | 'default'>('default');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentSignatureUrl || '');
  const [visible, setVisible] = useState<boolean>(showSignature);
  const [inkColor, setInkColor] = useState<string>('#1e3a8a'); // Deep Blue

  useEffect(() => {
    if (isOpen) {
      const defaultSig = currentSignatureUrl || getDefaultSignatureDataUrl();
      setPreviewUrl(defaultSig);
      setVisible(showSignature);
      setHasDrawn(false);
    }
  }, [isOpen, currentSignatureUrl, showSignature]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);

    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    onSaveSignature(previewUrl || getDefaultSignatureDataUrl(), visible);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white/90 backdrop-blur-2xl rounded-3xl max-w-lg w-full shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-white/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular Rim Light */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-white/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-700 border border-blue-500/20">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Authorized Signatory Signature
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {partnerName || 'R.S.N. Murthy'} &bull; Murthy Chemical Agencies
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/[0.05] text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-black/[0.03] rounded-2xl text-xs font-semibold border border-black/[0.04]">
            <button
              onClick={() => { setActiveMode('default'); handleSetToDefault(); }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                activeMode === 'default'
                  ? 'bg-white text-blue-700 shadow-xs font-bold border border-black/[0.04]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Official Signature
            </button>
            <button
              onClick={() => setActiveMode('draw')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                activeMode === 'draw'
                  ? 'bg-white text-blue-700 shadow-xs font-bold border border-black/[0.04]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Draw Custom
            </button>
            <button
              onClick={() => setActiveMode('upload')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                activeMode === 'upload'
                  ? 'bg-white text-blue-700 shadow-xs font-bold border border-black/[0.04]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upload File
            </button>
          </div>

          {/* Mode 1: Default Official Signature Preview */}
          {activeMode === 'default' && (
            <div className="border border-black/[0.06] rounded-2xl p-4 bg-white/60 flex flex-col items-center justify-center space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Official Pre-Configured Signature
              </span>
              <div className="h-24 w-full bg-white border border-black/[0.06] rounded-2xl flex items-center justify-center p-2 shadow-inner">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Default Partner Signature" 
                    className="max-h-20 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Loading signature...</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 text-center font-medium">
                Stylized blue-ink signature for <strong>{partnerName || 'R.S.N. Murthy'}</strong> on behalf of Murthy Chemical Agencies.
              </p>
            </div>
          )}

          {/* Mode 2: Draw Custom Signature */}
          {activeMode === 'draw' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Draw with Mouse or Touch
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-500">Ink Color:</span>
                  <button
                    onClick={() => setInkColor('#1e3a8a')}
                    className={`w-5 h-5 rounded-full bg-blue-900 ${inkColor === '#1e3a8a' ? 'ring-2 ring-blue-400' : ''}`}
                    title="Royal Blue"
                  />
                  <button
                    onClick={() => setInkColor('#0f172a')}
                    className={`w-5 h-5 rounded-full bg-slate-900 ${inkColor === '#0f172a' ? 'ring-2 ring-slate-400' : ''}`}
                    title="Black"
                  />
                  <button
                    onClick={handleClearCanvas}
                    className="p-1 rounded-md text-xs text-red-600 hover:bg-red-50 flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-black/[0.1] rounded-2xl bg-white overflow-hidden touch-none flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={440}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-36 cursor-crosshair bg-white"
                />
              </div>
            </div>
          )}

          {/* Mode 3: Upload Image */}
          {activeMode === 'upload' && (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-black/[0.1] hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/50 hover:bg-blue-50/40">
                <Upload className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-xs font-bold text-slate-800">Click to upload signature image</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Supports PNG, JPG (transparent background recommended)</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>

              {previewUrl && (
                <div className="p-3 bg-white border border-black/[0.08] rounded-xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center space-x-3">
                    <img src={previewUrl} alt="Uploaded signature" className="h-10 w-auto max-w-[120px] object-contain border p-1 rounded" />
                    <span className="text-xs font-semibold text-slate-700">Signature Loaded</span>
                  </div>
                  <button
                    onClick={() => setPreviewUrl('')}
                    className="text-xs text-red-600 font-semibold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/60 border border-black/[0.06] shadow-2xs">
            <div className="flex items-center space-x-2.5">
              {visible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              <div>
                <p className="text-xs font-bold text-slate-800">Display Signature on Invoice & PDF</p>
                <p className="text-[11px] text-slate-500">Automatically stamps the signature above partner name</p>
              </div>
            </div>
            <button
              onClick={() => setVisible(!visible)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                visible ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  visible ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/[0.06] bg-white/40 flex items-center justify-between">
          <button
            onClick={handleSetToDefault}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-black/[0.05] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Signature</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
