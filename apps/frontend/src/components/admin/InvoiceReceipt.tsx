import React from 'react';
import { stores } from '@/data/stores';

interface InvoiceItem {
  medicine_name: string;
  batch_number: string;
  quantity: number;
  rate: number;
  gst_percent: number;
  gst_amount: number;
  amount: number;
}

export interface InvoiceData {
  invoice_no: string;
  patient_name?: string;
  patient_phone?: string;
  doctor_name?: string;
  items: InvoiceItem[];
  subtotal: number;
  gst_total: number;
  discount: number;
  net_amount: number;
  store_id: string;
  date: string;
  global_discount_name?: string;
  invoice_terms?: string;
}

interface InvoiceReceiptProps {
  invoice: InvoiceData;
  dbStores?: any[];
}

export default function InvoiceReceipt({ invoice, dbStores = [] }: InvoiceReceiptProps) {
  const allStores = dbStores.length > 0 ? dbStores : stores;
  const currentStore = allStores.find((s) => s.id === invoice.store_id) || allStores[0];

  return (
    <div className="hidden print:block bg-white w-full max-w-[210mm] mx-auto text-black font-sans relative print:absolute print:inset-0 print:m-0 print:w-screen">
      
      {/* Background Illustrative Pattern / Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.03]">
        <img 
          src="/websitelogo/jantamedicarelogo.webp" 
          alt="Watermark" 
          className="w-[180mm] h-auto object-contain"
        />
      </div>

      <div className="relative z-10 p-8 min-h-[285mm] flex flex-col">
        {/* Premium Header */}
        <div className="flex justify-between items-start border-b-[3px] border-primary-deep pb-6 mb-6">
          <div className="flex items-center gap-5">
            {/* Standard img tag guarantees it prints without Next.js lazy loading issues */}
            <img 
              src="/websitelogo/jantamedicarelogo.webp" 
              alt="Janta Medicare Logo" 
              className="w-20 h-20 object-contain"
            />
            <div>
              <h1 className="text-3xl font-black text-primary-deep tracking-tight">Janta Medicare LLP</h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-secondary-dark mb-1">
                Sirf Janta Kay Liye
              </p>
              <div className="mt-2 text-sm text-gray-700 leading-snug">
                <p className="font-bold text-gray-900">{currentStore.name}</p>
                <p className="max-w-[280px]">{currentStore.address}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black text-gray-200 uppercase tracking-widest">Invoice</h2>
            <div className="mt-3 text-sm space-y-1">
              <p><span className="text-gray-500 font-semibold">Invoice No:</span> <span className="font-bold text-gray-900">{invoice.invoice_no}</span></p>
              <p><span className="text-gray-500 font-semibold">Date:</span> <span className="font-medium text-gray-900">{new Date(invoice.date).toLocaleString()}</span></p>
            </div>
          </div>
        </div>

        {/* Patient & Doctor Info */}
        <div className="flex justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 text-sm">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Billed To</p>
            <p className="font-black text-lg text-gray-900">{invoice.patient_name || 'Cash Customer'}</p>
            {invoice.patient_phone && (
              <p className="text-gray-600 text-sm mt-0.5 font-medium">Ph: {invoice.patient_phone}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Prescribed By</p>
            <p className="font-black text-lg text-gray-900">{invoice.doctor_name || 'Self / OTC'}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="flex-1">
          <table className="w-full text-sm mb-8 border-collapse">
            <thead>
              <tr className="border-b-2 border-primary-deep text-left bg-gray-50/50">
                <th className="py-3 px-2 font-black text-gray-900 w-12">Sr.</th>
                <th className="py-3 px-2 font-black text-gray-900">Medicine / Item</th>
                <th className="py-3 px-2 font-black text-gray-900 text-center">Qty</th>
                <th className="py-3 px-2 font-black text-gray-900 text-right">Rate</th>
                <th className="py-3 px-2 font-black text-gray-900 text-right">GST</th>
                <th className="py-3 px-2 font-black text-gray-900 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-3 px-2 text-gray-500 font-medium">{idx + 1}</td>
                  <td className="py-3 px-2">
                    <p className="font-bold text-gray-900">{item.medicine_name}</p>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-0.5">Batch: {item.batch_number}</p>
                  </td>
                  <td className="py-3 px-2 text-center font-medium">{item.quantity}</td>
                  <td className="py-3 px-2 text-right">₹{Number(item.rate).toFixed(2)}</td>
                  <td className="py-3 px-2 text-right text-[11px] text-gray-600">
                    {item.gst_percent}%<br/>
                    (₹{(item.gst_amount * item.quantity).toFixed(2)})
                  </td>
                  <td className="py-3 px-2 text-right font-black text-gray-900">₹{Number(item.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-72 bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
            <div className="flex justify-between text-sm text-gray-600 font-medium">
              <span>Subtotal</span>
              <span>₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 font-medium">
              <span>GST Total</span>
              <span>₹{invoice.gst_total.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-bold">
                <span>{invoice.global_discount_name ? `Discount (${invoice.global_discount_name})` : 'Discount'}</span>
                <span>-₹{invoice.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-black pt-3 border-t-2 border-gray-800 mt-3 text-primary-deep">
              <span>Net Payable</span>
              <span>₹{invoice.net_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Footer with All Stores */}
        <div className="mt-auto border-t-2 border-primary-deep pt-6">
          <div className="text-center font-black text-secondary-dark tracking-widest uppercase mb-6 text-lg">
            Wish You A Speedy Recovery!
          </div>
          
          {/* List All Stores for Marketing/Contact */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {allStores.map(s => (
              <div key={s.id} className="text-[10px] text-gray-600 leading-tight">
                <p className="font-bold text-gray-900 mb-1 text-[11px] uppercase">{s.name.replace('Janta Medicare LLP - ', '')}</p>
                <p className="mb-1 truncate">{s.address}</p>
                {s.phone && <p><span className="font-semibold">Ph:</span> {s.phone}</p>}
                {(s.contact_numbers || []).map((p: any, i: number) => (
                  <p key={i}><span className="font-semibold">{p.label}:</span> {p.number}</p>
                ))}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-end border-t border-gray-200 pt-4 mt-2">
            <div className="text-[11px] text-gray-500 font-medium space-x-4">
              <span>🌐 www.jantamedicare.com</span>
              <span>✉️ info@jantamedicare.com</span>
            </div>
            <p className="text-[9px] text-gray-400 max-w-[250px] text-right leading-tight italic">
              {invoice.invoice_terms || "This is a computer generated invoice. Goods once sold cannot be returned. All disputes subject to Howrah jurisdiction."}
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          /* Hide next.js dev stuff or other elements if any */
          #__next-build-watcher, #__next-prerender-indicator {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
