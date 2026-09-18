import React from 'react';
import {
  ArrowRight,
  Download,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  History,
  LockKeyhole,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { InvoiceData } from '../types';
import { formatIndianCurrency } from '../utils/numberToWords';
import { InvoiceHistoryEntry } from '../utils/storageUtils';
import { BillrLogo } from './BillrLogo';

interface HomeDashboardViewProps {
  invoiceData: InvoiceData;
  hasSavedDraft: boolean;
  history: InvoiceHistoryEntry[];
  lastSavedTimestamp: string | null;
  onResumeDraft: () => void;
  onStartNewInvoice: () => void;
  onImport: () => void;
  onLoadSample: () => void;
  onExportBackup: () => void;
  onClearData: () => void;
}

function formatSavedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  invoiceData,
  hasSavedDraft,
  history,
  lastSavedTimestamp,
  onResumeDraft,
  onStartNewInvoice,
  onImport,
  onLoadSample,
  onExportBackup,
  onClearData,
}) => {
  const draftTotal = invoiceData.items.reduce((sum, item) => sum + item.commissionAmount, 0);

  return (
    <div className="home-desk mx-auto max-w-6xl space-y-5 sm:space-y-6">
      <section className="home-start apple-glass-card relative overflow-hidden p-5 sm:p-8">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-center">
          <div>
            <BillrLogo size="lg" />
            <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">Make an invoice.</h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">Bring in your existing invoice data or create a new one from scratch.</p>
            <div className="mt-6 grid max-w-md gap-3 sm:grid-cols-2">
              <button type="button" onClick={onImport} className="group flex min-h-24 flex-col items-start justify-between rounded-2xl bg-blue-700 p-4 text-left text-white shadow-lg shadow-blue-700/20 transition-transform hover:-translate-y-0.5 hover:bg-blue-800">
                <FileSpreadsheet className="h-5 w-5 text-blue-100" />
                <span className="flex w-full items-center justify-between text-sm font-extrabold">Import invoice data <ArrowRight className="h-4 w-4 text-blue-200 transition-transform group-hover:translate-x-1" /></span>
              </button>
              <button type="button" onClick={onStartNewInvoice} className="group flex min-h-24 flex-col items-start justify-between rounded-2xl border border-slate-200 bg-white/85 p-4 text-left text-slate-900 shadow-sm transition-transform hover:-translate-y-0.5 hover:border-blue-200">
                <FilePlus2 className="h-5 w-5 text-blue-700" />
                <span className="flex w-full items-center justify-between text-sm font-extrabold">Create new invoice <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" /></span>
              </button>
            </div>
          </div>

          <div className="invoice-paper mx-auto w-full max-w-xs rotate-2 rounded-sm p-5 shadow-xl shadow-slate-900/15">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div><FileText className="h-5 w-5 text-blue-700" /><p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Tax invoice</p></div>
              <span className="text-[10px] font-bold text-slate-400">#{hasSavedDraft && invoiceData.invoiceNumber ? invoiceData.invoiceNumber : '—'}</span>
            </div>
            <div className="space-y-2.5 py-4">
              <span className="block h-2.5 w-4/5 rounded-full bg-slate-200" />
              <span className="block h-2 w-3/5 rounded-full bg-slate-100" />
              <span className="mt-4 block h-2 w-full rounded-full bg-slate-100" />
              <span className="block h-2 w-full rounded-full bg-slate-100" />
              <span className="block h-2 w-2/3 rounded-full bg-slate-100" />
            </div>
            <div className="flex items-end justify-between border-t border-slate-200 pt-4"><span className="text-[10px] font-bold text-slate-400">{hasSavedDraft ? `${invoiceData.items.length} line items` : 'Ready for your details'}</span><strong className="text-base text-slate-900">{hasSavedDraft ? formatIndianCurrency(draftTotal) : '₹ —'}</strong></div>
          </div>
        </div>
        <div className="home-start-scribble pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-[28px] border-blue-100/60" aria-hidden="true" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="apple-glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">Current draft</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">{hasSavedDraft ? invoiceData.invoiceNumber : 'No draft yet'}</h2>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${hasSavedDraft ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-slate-100 text-slate-600'}`}>
              {hasSavedDraft ? 'Saved locally' : 'Ready to start'}
            </span>
          </div>
          {hasSavedDraft ? (
            <>
              <div className="mt-5 grid grid-cols-3 gap-3 border-y border-slate-200/80 py-4 text-sm">
                <div><span className="block text-xs text-slate-500">Items</span><strong>{invoiceData.items.length}</strong></div>
                <div><span className="block text-xs text-slate-500">Taxable</span><strong>{formatIndianCurrency(draftTotal)}</strong></div>
                <div><span className="block text-xs text-slate-500">Updated</span><strong>{lastSavedTimestamp ? formatSavedAt(lastSavedTimestamp) : 'Recently'}</strong></div>
              </div>
              <button type="button" onClick={onResumeDraft} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-blue-700 hover:bg-blue-50">
                Resume draft <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-5">
              <p className="text-sm font-semibold text-slate-800">Start with a workbook or a blank invoice.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={onImport} className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"><FileSpreadsheet className="h-4 w-4" />Import workbook</button>
                <button type="button" onClick={onStartNewInvoice} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"><FilePlus2 className="h-4 w-4" />Blank invoice</button>
              </div>
            </div>
          )}
        </div>

        <div className="apple-glass-card p-5 sm:p-6">
          <div className="flex items-center gap-2"><History className="h-4 w-4 text-blue-600" /><h2 className="text-sm font-black text-slate-950">Recent invoices</h2></div>
          {history.length > 0 ? (
            <div className="mt-4 divide-y divide-slate-200/80">
              {history.slice(0, 4).map(entry => (
                <div key={entry.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0"><p className="truncate font-bold text-slate-800">{entry.invoiceNumber}</p><p className="text-xs text-slate-500">{formatSavedAt(entry.savedAt)} · {entry.itemCount} items</p></div>
                  <strong className="shrink-0 text-xs text-slate-800">{formatIndianCurrency(entry.total)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-500">Invoices you export will appear here for quick reference.</p>
          )}
          <button type="button" onClick={onLoadSample} className="mt-3 inline-flex min-h-11 items-center rounded-xl px-3 text-xs font-bold text-blue-700 hover:bg-blue-50">Open reference sample</button>
        </div>
      </section>

      <section className="apple-glass-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /><div><h2 className="text-sm font-black text-slate-950">Stored on this device</h2><p className="mt-1 text-xs leading-5 text-slate-600">Your drafts and signatures stay in this browser.</p></div></div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button type="button" onClick={onExportBackup} className="inline-flex items-center gap-2 rounded-lg apple-glass-btn px-3 py-2 text-xs font-bold"><Download className="h-4 w-4" />Backup data</button>
            <button type="button" onClick={onClearData} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700"><Trash2 className="h-4 w-4" />Clear local data</button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />Stored locally on this device</div>
      </section>
    </div>
  );
};
