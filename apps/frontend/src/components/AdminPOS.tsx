"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Plus, Search, Trash2, Save, Printer, ArrowRight } from "lucide-react";
import { showToast } from "./Toast";
import InvoiceReceipt, { InvoiceData } from "./admin/InvoiceReceipt";

export default function AdminPOS({ globalSettings = {}, dbStores = [] }: { globalSettings?: Record<string, string>, dbStores?: any[] }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const [cart, setCart] = useState<any[]>([]);
  const [patientPhone, setPatientPhone] = useState("");
  const [patientName, setPatientName] = useState("");
  const [fetchingPatient, setFetchingPatient] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [manualDiscount, setManualDiscount] = useState("0");
  
  const [checkingOut, setCheckingOut] = useState(false);
  const [invoiceSuccess, setInvoiceSuccess] = useState<InvoiceData | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-search (debounce) as user types
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Keep focus on search input for physical barcode scanners and handle Enter key for exact match
  useEffect(() => {
    if (patientPhone.length === 10) {
      setFetchingPatient(true);
      fetch(`/api/admin/patients/search?phone=${patientPhone}`)
        .then(res => res.json())
        .then(data => {
           if (data.ok && data.name) {
               setPatientName(data.name);
               showToast("Returning customer found!");
           }
        })
        .finally(() => setFetchingPatient(false));
    }
  }, [patientPhone]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // If not typing in another input, focus search
        if (e.target instanceof HTMLInputElement && e.target !== searchInputRef.current) return;
        if (e.key === 'Enter' && query) {
            handleSearch(query, true);
        }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [query]);

  const handleSearch = async (searchStr: string = query, isEnterKey: boolean = false) => {
    if (!searchStr.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/medicine-batches?query=${encodeURIComponent(searchStr)}`);
      const data = await res.json();
      
      if (isEnterKey && data.items?.length === 1 && data.items[0].barcode === searchStr) {
         // Auto add if it's an exact barcode match and user hit enter (like a scanner does)
         addToCart(data.items[0]);
         setQuery("");
         setSearchResults([]);
      } else {
         setSearchResults(data.items || []);
      }
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (batch: any) => {
    if (batch.stock <= 0) {
        showToast("Out of stock!", "error");
        return;
    }
    
    const existing = cart.find(item => item.batch_id === batch.id);
    if (existing && existing.quantity >= batch.stock) {
        showToast(`Only ${batch.stock} in stock!`, "error");
        return;
    }

    setCart(prev => {
        const existingItem = prev.find(item => item.batch_id === batch.id);
        if (existingItem) {
            return prev.map(item => 
                item.batch_id === batch.id 
                    ? { ...item, quantity: item.quantity + 1, amount: (item.quantity + 1) * item.rate * (1 + item.gst_percent / 100) }
                    : item
            );
        }
        
        const rate = Number(batch.selling_price) || 0;
        const gst_percent = Number(batch.gst) || 0;
        const gst_amount = (rate * gst_percent) / 100;
        
        return [...prev, {
            batch_id: batch.id,
            medicine_name: batch.medicine_name,
            batch_number: batch.batch_number,
            quantity: 1,
            rate: rate,
            gst_percent: gst_percent,
            gst_amount: gst_amount,
            amount: rate + gst_amount,
            max_stock: batch.stock
        }];
    });
    setQuery("");
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  const removeFromCart = (batch_id: number) => {
    setCart(prev => prev.filter(item => item.batch_id !== batch_id));
  };

  const updateQuantity = (batch_id: number, qty: number) => {
    const existing = cart.find(item => item.batch_id === batch_id);
    if (existing && qty > existing.max_stock) {
        showToast(`Only ${existing.max_stock} in stock!`, "error");
        qty = existing.max_stock;
    }

    setCart(prev => prev.map(item => {
        if (item.batch_id === batch_id) {
            return {
                ...item,
                quantity: qty,
                amount: qty * item.rate * (1 + item.gst_percent / 100)
            };
        }
        return item;
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
  const gstTotal = cart.reduce((sum, item) => sum + (item.gst_amount * item.quantity), 0);
  
  let globalDiscountAmount = 0;
  let globalDiscountActive = false;
  if (globalSettings.global_discount_active === "true") {
      const now = new Date();
      const start = globalSettings.global_discount_start ? new Date(globalSettings.global_discount_start) : null;
      const end = globalSettings.global_discount_end ? new Date(globalSettings.global_discount_end) : null;
      
      const isAfterStart = !start || now >= start;
      const isBeforeEnd = !end || now <= end;
      
      if (isAfterStart && isBeforeEnd) {
          globalDiscountActive = true;
          const percent = Number(globalSettings.global_discount_percent) || 0;
          globalDiscountAmount = (subtotal * percent) / 100;
      }
  }

  const totalDiscount = Number(manualDiscount) + globalDiscountAmount;
  const netAmount = subtotal + gstTotal - totalDiscount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckingOut(true);
    try {
        const res = await fetch("/api/admin/pos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                patient_name: patientName,
                patient_phone: patientPhone,
                doctor_name: doctorName,
                discount: totalDiscount,
                items: cart
            })
        });
        const data = await res.json();
        if (res.ok) {
            showToast("Invoice generated successfully!");
            setInvoiceSuccess({
                invoice_no: data.invoice_no,
                store_id: data.store_id,
                date: data.date,
                patient_name: patientName,
                doctor_name: doctorName,
                items: [...cart],
                subtotal,
                gst_total: gstTotal,
                discount: totalDiscount,
                net_amount: netAmount,
                global_discount_name: globalDiscountActive ? globalSettings.global_discount_name : undefined,
                invoice_terms: globalSettings.invoice_terms
            });
            setCart([]);
            setPatientName("");
            setPatientPhone("");
            setDoctorName("");
            setManualDiscount("0");
        } else {
            showToast(data.error || "Checkout failed", "error");
        }
    } catch (e) {
        showToast("Checkout failed", "error");
    } finally {
        setCheckingOut(false);
    }
  };

  if (invoiceSuccess) {
      return (
          <>
            <div className="card text-center py-16 animate-fade-up print:hidden">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Printer className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Invoice Generated</h2>
                <p className="text-muted mb-8">Invoice No: <span className="font-mono font-bold text-foreground">{invoiceSuccess.invoice_no}</span></p>
                <div className="flex justify-center gap-4">
                    <button className="btn btn-outline" onClick={() => window.print()}>Print Receipt</button>
                    <button className="btn btn-primary" onClick={() => setInvoiceSuccess(null)}>New Bill</button>
                </div>
            </div>
            
            <InvoiceReceipt invoice={invoiceSuccess} dbStores={dbStores} />
          </>
      );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        {/* Left Side: Search & Results */}
        <div className="lg:col-span-2 space-y-6">
            <div className="card">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Scan Barcode or Search by Name..."
                            className="input !max-w-full"
                        />
                    </div>
                    <button onClick={() => handleSearch(query)} disabled={loading} className="btn btn-primary">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                    </button>
                </div>

                {searchResults.length > 0 && (
                    <div className="mt-4 border border-line rounded-xl divide-y divide-line max-h-96 overflow-y-auto">
                        {searchResults.map(b => (
                            <div key={b.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div>
                                    <p className="font-bold">{b.medicine_name}</p>
                                    <p className="text-xs text-muted">Batch: {b.batch_number} | Stock: {b.stock} | Exp: {b.expiry_date}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="font-bold text-secondary-dark">₹{b.selling_price}</p>
                                    <button 
                                        onClick={() => addToCart(b)}
                                        disabled={b.stock <= 0}
                                        className="btn btn-sm btn-outline text-primary border-primary hover:bg-primary hover:text-white"
                                    >
                                        <Plus className="h-4 w-4" /> Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cart Table */}
            <div className="card">
                <h3 className="font-bold text-lg mb-4">Current Bill</h3>
                <div className="table-shell overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th className="text-center">Qty</th>
                                <th className="text-right">Rate</th>
                                <th className="text-right">GST</th>
                                <th className="text-right">Amount</th>
                                <th className="w-16 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.length === 0 ? (
                                <tr><td colSpan={6} className="text-center text-muted py-8">Cart is empty. Scan an item to start.</td></tr>
                            ) : (
                                cart.map(item => (
                                    <tr key={item.batch_id}>
                                        <td>
                                            <span className="font-semibold">{item.medicine_name}</span>
                                            <br/><span className="text-xs text-muted">Batch: {item.batch_number}</span>
                                        </td>
                                        <td className="text-center w-32">
                                            <input 
                                                type="number" 
                                                min="1"
                                                max={item.max_stock}
                                                value={item.quantity} 
                                                onChange={(e) => updateQuantity(item.batch_id, Number(e.target.value))}
                                                className="admin-input !w-16 text-center !p-1"
                                            />
                                        </td>
                                        <td className="text-right">₹{item.rate.toFixed(2)}</td>
                                        <td className="text-right text-xs text-muted">
                                            {item.gst_percent}% <br/>(₹{(item.gst_amount * item.quantity).toFixed(2)})
                                        </td>
                                        <td className="text-right font-bold">₹{item.amount.toFixed(2)}</td>
                                        <td className="w-10 text-center">
                                            <button onClick={() => removeFromCart(item.batch_id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors" title="Remove Item">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Right Side: Checkout Summary */}
        <div className="space-y-6">
            <div className="card bg-slate-50 border-primary/20">
                <h3 className="font-bold text-lg mb-4">Patient Details</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-muted uppercase">Mobile Number (Optional)</label>
                        <div className="relative">
                            <input 
                                type="tel" 
                                maxLength={10}
                                value={patientPhone} 
                                onChange={e => setPatientPhone(e.target.value.replace(/\D/g, ''))} 
                                className="admin-input w-full bg-white" 
                                placeholder="10-digit number" 
                            />
                            {fetchingPatient && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-muted uppercase">Patient Name (Optional)</label>
                        <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} className="admin-input w-full bg-white" placeholder="Name" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-muted uppercase">Doctor Name (For Rx)</label>
                        <input type="text" value={doctorName} onChange={e => setDoctorName(e.target.value)} className="admin-input w-full bg-white" placeholder="Dr. Name" />
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 className="font-bold text-lg mb-4">Bill Summary</h3>
                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-muted">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted">
                        <span>GST</span>
                        <span>₹{gstTotal.toFixed(2)}</span>
                    </div>
                    
                    {globalDiscountActive && (
                        <div className="flex justify-between items-center text-secondary-dark font-bold bg-secondary-soft/30 p-2 rounded-lg my-2">
                            <span>{globalSettings.global_discount_name} (-{globalSettings.global_discount_percent}%)</span>
                            <span>-₹{globalDiscountAmount.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center text-muted">
                        <span>Manual Discount (₹)</span>
                        <input 
                            type="number" 
                            value={manualDiscount} 
                            onChange={e => setManualDiscount(e.target.value)} 
                            className="admin-input !w-24 text-right !p-1"
                        />
                    </div>
                    <hr className="my-2 border-line" />
                    <div className="flex justify-between text-xl font-black text-secondary-dark">
                        <span>NET PAYABLE</span>
                        <span>₹{netAmount.toFixed(2)}</span>
                    </div>
                </div>

                <button 
                    onClick={handleCheckout} 
                    disabled={cart.length === 0 || checkingOut}
                    className="btn btn-green w-full py-4 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                    {checkingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : "COMPLETE BILL"}
                    {!checkingOut && <ArrowRight className="h-5 w-5" />}
                </button>
            </div>
        </div>
    </div>
  );
}
