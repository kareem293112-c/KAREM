import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { Calendar, User, Search, Trash2, ChevronDown, ChevronUp, FileText, CheckCircle, TrendingUp, DollarSign, PackageOpen, Undo2, Printer } from 'lucide-react';
import { translations } from '../translations';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onPrintTransaction: (tx: Transaction, received: number) => void;
  lang: 'ar' | 'en';
  theme: 'light' | 'dark' | 'eye-care';
}

export default function TransactionHistory({ transactions, onDeleteTransaction, onPrintTransaction, lang, theme }: TransactionHistoryProps) {
  const t = translations[lang];

  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  // Expanded transactions map to display detailed rows
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(lang === 'ar' ? 'الكل' : 'All'); // 'الكل', 'اليوم', 'أمس', 'آخر_7_أيام', 'هذا_الشهر', 'مخصص'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Toggle expand transaction details row
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Check if a date falls within filtered period
  const filterByDateRange = (txDateStr: string) => {
    const txDate = new Date(txDateStr);
    const today = new Date();
    
    // Set hours to 0 to compare days properly
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    
    const startOf7DaysAgo = new Date(startOfToday);
    startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 7);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Normalize comparison based on mapped values
    const filterType = dateFilter;

    if (filterType === 'اليوم' || filterType === 'Today') {
      return txDate >= startOfToday;
    } else if (filterType === 'أمس' || filterType === 'Yesterday') {
      return txDate >= startOfYesterday && txDate < startOfToday;
    } else if (filterType === 'آخر_7_أيام' || filterType === 'Last 7 Days') {
      return txDate >= startOf7DaysAgo;
    } else if (filterType === 'هذا_الشهر' || filterType === 'This Month') {
      return txDate >= startOfMonth;
    } else if (filterType === 'مخصص' || filterType === 'Custom Range') {
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999); // include entire end day
        return txDate >= start && txDate <= end;
      }
      return true;
    } else {
      return true;
    }
  };

  // Filter Transactions based on search query & selected dates
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tx.items.some((item) => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDate = filterByDateRange(tx.date);

      return matchSearch && matchDate;
    });
  }, [transactions, searchQuery, dateFilter, customStartDate, customEndDate]);

  // Aggregate stats for the filtered period (for custom reports)
  const filteredTotals = useMemo(() => {
    let sales = 0;
    let cost = 0;
    let profit = 0;
    
    filteredTransactions.forEach((tx) => {
      sales += tx.totalAmount;
      cost += tx.totalCost;
      profit += tx.totalProfit;
    });

    const margin = sales > 0 ? (profit / sales) * 100 : 0;

    return {
      sales,
      cost,
      profit,
      margin,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Theme styling helpers
  const cardBgClass = 
    theme === 'dark' 
      ? 'bg-zinc-900 border-zinc-800' 
      : theme === 'eye-care' 
      ? 'bg-[#f7eedc] border-[#dfca9e]' 
      : 'bg-white border-slate-100';

  const textPrimaryClass = 
    theme === 'dark' 
      ? 'text-zinc-100' 
      : theme === 'eye-care' 
      ? 'text-[#433422]' 
      : 'text-slate-800';

  const textSecondaryClass = 
    theme === 'dark' 
      ? 'text-zinc-400' 
      : theme === 'eye-care' 
      ? 'text-[#786144]' 
      : 'text-slate-400';

  const textTertiaryClass = 
    theme === 'dark' 
      ? 'text-zinc-500' 
      : theme === 'eye-care' 
      ? 'text-[#90795e]' 
      : 'text-slate-500';

  const borderClass = 
    theme === 'dark' 
      ? 'border-zinc-800' 
      : theme === 'eye-care' 
      ? 'border-[#dfca9e]' 
      : 'border-slate-100';

  const inputClass = 
    theme === 'dark' 
      ? 'bg-zinc-800 text-zinc-100 border-zinc-700 focus:border-indigo-400 focus:bg-zinc-850' 
      : theme === 'eye-care' 
      ? 'bg-[#faf5ea] text-[#433422] border-[#dfca9e] focus:border-[#433422]' 
      : 'bg-slate-50 text-slate-800 border-slate-200 focus:border-indigo-500 focus:bg-white';

  const summaryBgClass = 
    theme === 'dark' 
      ? 'bg-zinc-950 border-zinc-850 text-white' 
      : theme === 'eye-care' 
      ? 'bg-[#ebdcc3] border-[#dfca9e] text-[#433422]' 
      : 'bg-slate-800 text-white';

  const drawerBgClass = 
    theme === 'dark' 
      ? 'bg-zinc-950/60 border-zinc-800/80' 
      : theme === 'eye-care' 
      ? 'bg-[#faf2e4] border-[#dfca9e]' 
      : 'bg-slate-50 border-slate-100/80';

  const dividerClass = 
    theme === 'dark' 
      ? 'divide-zinc-800' 
      : theme === 'eye-care' 
      ? 'divide-[#dfca9e]' 
      : 'divide-slate-100';

  const localeCode = lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US';

  // Filters mapping array for tabs
  const filterTabs = [
    { key: lang === 'ar' ? 'الكل' : 'All', label: lang === 'ar' ? 'الكل' : 'All' },
    { key: lang === 'ar' ? 'اليوم' : 'Today', label: lang === 'ar' ? 'اليوم' : 'Today' },
    { key: lang === 'ar' ? 'أمس' : 'Yesterday', label: lang === 'ar' ? 'أمس' : 'Yesterday' },
    { key: lang === 'ar' ? 'آخر_7_أيام' : 'Last 7 Days', label: lang === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days' },
    { key: lang === 'ar' ? 'هذا_الشهر' : 'This Month', label: lang === 'ar' ? 'هذا الشهر' : 'This Month' },
    { key: lang === 'ar' ? 'مخصص' : 'Custom Range', label: lang === 'ar' ? 'فترة مخصصة' : 'Custom Range' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Filter Control Panel */}
      <div className={`rounded-2xl p-6 border shadow-sm space-y-4 ${cardBgClass}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className={`text-lg font-bold ${textPrimaryClass}`}>{t.txTitle}</h3>
            <p className={`text-xs ${textSecondaryClass}`}>{t.txDesc}</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs ${textSecondaryClass}`}>{lang === 'ar' ? 'تصفية الفترة:' : 'Period:'}</span>
            <div className={`inline-flex rounded-lg p-1 ${theme === 'dark' ? 'bg-zinc-950' : theme === 'eye-care' ? 'bg-[#ebdcc3]' : 'bg-slate-100'}`}>
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setDateFilter(tab.key)}
                  type="button"
                  className={`text-[11px] font-bold px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                    dateFilter === tab.key
                      ? 'bg-indigo-600 text-white shadow-sm dark:bg-indigo-500'
                      : `${theme === 'dark' ? 'text-zinc-400 hover:bg-zinc-800' : theme === 'eye-care' ? 'text-[#786144] hover:bg-[#f3e5ca]' : 'text-slate-600 hover:bg-slate-200/50'}`
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Date Inputs if 'مخصص' is active */}
        {(dateFilter === 'مخصص' || dateFilter === 'Custom Range') && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border max-w-lg ${
            theme === 'dark' ? 'bg-zinc-950 border-zinc-850' : theme === 'eye-care' ? 'bg-[#ebdcc3] border-[#dfca9e]' : 'bg-slate-50 border-slate-100'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${textSecondaryClass}`}>{lang === 'ar' ? 'من:' : 'From:'}</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className={`border rounded-lg p-1.5 text-xs focus:outline-none ${
                  theme === 'dark' ? 'bg-zinc-800 text-white border-zinc-750' : theme === 'eye-care' ? 'bg-[#faf5ea] text-[#433422] border-[#dfca9e]' : 'bg-white text-slate-800 border-slate-200'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${textSecondaryClass}`}>{lang === 'ar' ? 'إلى:' : 'To:'}</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className={`border rounded-lg p-1.5 text-xs focus:outline-none ${
                  theme === 'dark' ? 'bg-zinc-800 text-white border-zinc-750' : theme === 'eye-care' ? 'bg-[#faf5ea] text-[#433422] border-[#dfca9e]' : 'bg-white text-slate-800 border-slate-200'
                }`}
              />
            </div>
          </div>
        )}

        {/* Search Bar Input */}
        <div className="relative max-w-xl">
          <input
            type="text"
            placeholder={t.txSearchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs rounded-xl px-4 py-3.5 focus:outline-none transition ${inputClass} ${
              lang === 'ar' ? 'pr-10' : 'pl-10'
            }`}
          />
          <Search className={`w-4.5 h-4.5 text-slate-400 absolute top-3.5 ${lang === 'ar' ? 'right-3.5' : 'left-3.5'}`} />
        </div>
      </div>

      {/* 2. Dynamic Report Statistics Bar for the Selected Period */}
      <div className={`rounded-2xl p-6 shadow-md grid grid-cols-2 md:grid-cols-4 gap-6 ${summaryBgClass}`}>
        
        <div>
          <p className={`${theme === 'eye-care' ? 'text-[#786144]' : 'text-slate-400'} text-xs font-semibold mb-1`}>{lang === 'ar' ? 'عدد عمليات الفترة' : 'Invoices Period'}</p>
          <div className="text-2xl font-bold tracking-tight">
            {filteredTotals.count} <span className={`text-xs ${theme === 'eye-care' ? 'text-[#786144]' : 'text-slate-400'}`}>{lang === 'ar' ? 'فاتورة' : 'invoices'}</span>
          </div>
        </div>

        <div>
          <p className={`${theme === 'eye-care' ? 'text-[#786144]' : 'text-slate-400'} text-xs font-semibold mb-1`}>{lang === 'ar' ? 'مبيعات الفترة' : 'Sales Period'}</p>
          <div className="text-2xl font-bold text-emerald-400 dark:text-emerald-300 tracking-tight">
            {filteredTotals.sales.toLocaleString(localeCode, { maximumFractionDigits: 1 })} <span className={`text-xs ${theme === 'eye-care' ? 'text-[#786144]' : 'text-slate-400'}`}>{t.currency}</span>
          </div>
        </div>

        <div>
          <p className={`${theme === 'eye-care' ? 'text-[#786144]' : 'text-slate-400'} text-xs font-semibold mb-1`}>{lang === 'ar' ? 'تكلفة الفترة' : 'Cost Period'}</p>
          <div className="text-2xl font-bold text-amber-500 dark:text-amber-400 tracking-tight">
            {filteredTotals.cost.toLocaleString(localeCode, { maximumFractionDigits: 1 })} <span className={`text-xs ${theme === 'eye-care' ? 'text-[#786144]' : 'text-slate-400'}`}>{t.currency}</span>
          </div>
        </div>

        <div>
          <p className={`${theme === 'eye-care' ? 'text-[#786144]' : 'text-slate-400'} text-xs font-semibold mb-1`}>{lang === 'ar' ? 'صافي أرباح الفترة' : 'Net Profits Period'}</p>
          <div className="text-2xl font-bold text-sky-400 dark:text-sky-300 tracking-tight flex items-center gap-1.5 flex-wrap">
            {filteredTotals.profit >= 0 ? '+' : ''}
            {filteredTotals.profit.toLocaleString(localeCode, { maximumFractionDigits: 1 })} 
            <span className={`text-xs ${theme === 'eye-care' ? 'text-[#786144]' : 'text-slate-400'}`}>{t.currency}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : theme === 'eye-care' ? 'bg-[#faf2e4] text-[#433422]' : 'bg-slate-700 text-slate-100'
            }`}>
              {filteredTotals.margin.toFixed(0)}% {lang === 'ar' ? 'هامش' : 'margin'}
            </span>
          </div>
        </div>

      </div>

      {/* 3. Ledger table listing */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${cardBgClass}`}>
        {filteredTransactions.length === 0 ? (
          <div className={`text-center py-16 flex flex-col items-center justify-center ${textSecondaryClass}`}>
            <PackageOpen className="w-16 h-16 text-slate-200 dark:text-zinc-800 mb-4" />
            <p className="text-sm font-semibold">{t.txNoTransactions}</p>
          </div>
        ) : (
          <div className={`divide-y ${dividerClass}`}>
            {filteredTransactions.map((tx) => {
              const isExpanded = !!expandedIds[tx.id];
              const transactionDate = new Date(tx.date);
              
              return (
                <div key={tx.id} className={`p-5 transition ${
                  theme === 'dark' ? 'hover:bg-zinc-800/10' : theme === 'eye-care' ? 'hover:bg-[#f3e5ca]/20' : 'hover:bg-slate-50/30'
                }`}>
                  {/* Ledger Row Header */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl text-slate-600 dark:text-zinc-300 hidden sm:block">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold text-sm sm:text-base ${textPrimaryClass}`}>{tx.customerName}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            theme === 'dark' ? 'bg-zinc-850 text-zinc-400' : theme === 'eye-care' ? 'bg-[#ebdcc3] text-[#433422]' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {tx.items.reduce((acc, i) => acc + i.quantity, 0)} {lang === 'ar' ? 'منتجات' : 'items'}
                          </span>
                        </div>
                        <div className={`flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs ${textSecondaryClass}`}>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                            {transactionDate.toLocaleDateString(localeCode, { dateStyle: 'medium' })}
                            {' - '}
                            {transactionDate.toLocaleTimeString(localeCode, { timeStyle: 'short' })}
                          </span>
                          {tx.notes && <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded text-[10px]">{tx.notes}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Monetary aggregate */}
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className={lang === 'ar' ? 'text-left lg:text-right' : 'text-right lg:text-left'}>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-400">{lang === 'ar' ? 'قيمة البيع' : 'Sale Value'}</div>
                        <div className={`font-extrabold ${textPrimaryClass}`}>{tx.totalAmount.toLocaleString(localeCode, { maximumFractionDigits: 1 })} {t.currency}</div>
                      </div>

                      <div className={lang === 'ar' ? 'text-left lg:text-right' : 'text-right lg:text-left'}>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-400">{lang === 'ar' ? 'الأرباح المحتسبة' : 'Profit Yield'}</div>
                        <div className={`font-mono font-extrabold ${tx.totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {tx.totalProfit >= 0 ? '+' : ''}{tx.totalProfit.toLocaleString(localeCode, { maximumFractionDigits: 1 })} {t.currency}
                        </div>
                      </div>

                      {/* Expand / delete buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleExpand(tx.id)}
                          type="button"
                          className={`rounded-lg p-2 transition flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                            theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300' : theme === 'eye-care' ? 'bg-[#ebdcc3] hover:bg-[#f3e5ca] text-[#433422]' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          {lang === 'ar' ? 'تفاصيل الفاتورة' : 'Details'}
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        
                        <button
                          onClick={() => setTransactionToDelete(tx.id)}
                          type="button"
                          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                          title={lang === 'ar' ? 'حذف الفاتورة وإرجاع الكمية للمخزن' : 'Undo invoice & return stock'}
                        >
                          <Undo2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Expanded receipt products drawer */}
                  {isExpanded && (
                    <div className={`mt-4 rounded-xl p-4 border animate-fade-in text-xs space-y-3 ${drawerBgClass}`}>
                      <h5 className={`font-bold border-b pb-2 flex items-center gap-1.5 ${theme === 'dark' ? 'text-zinc-300 border-zinc-800' : theme === 'eye-care' ? 'text-[#433422] border-[#dfca9e]' : 'text-slate-600 border-slate-200'}`}>
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        {lang === 'ar' ? 'المنتجات المسجلة في الفاتورة:' : 'Registered products in this invoice:'}
                      </h5>
                      
                      <div className={`divide-y ${theme === 'dark' ? 'divide-zinc-900' : theme === 'eye-care' ? 'divide-[#dfca9e]' : 'divide-slate-100'}`}>
                        {tx.items.map((item, index) => {
                          const itemTotalCost = item.costPrice * item.quantity;
                          const itemTotalSale = item.sellingPrice * item.quantity;
                          const itemProfit = itemTotalSale - itemTotalCost;
                          
                          return (
                            <div key={index} className="py-2.5 flex justify-between items-center flex-wrap gap-2 first:pt-0 last:pb-0">
                              <div>
                                <span className={`font-bold text-sm ${textPrimaryClass}`}>{item.productName}</span>
                                <span className="text-slate-400 dark:text-zinc-400 mx-2">({item.quantity} × {item.sellingPrice.toLocaleString(localeCode)} {t.currency})</span>
                              </div>
                              <div className="flex gap-4 text-[11px] flex-wrap">
                                <span className={textSecondaryClass}>{lang === 'ar' ? 'تكلفة عليك:' : 'Cost Price:'} {itemTotalCost.toLocaleString(localeCode, { maximumFractionDigits: 1 })} {t.currency}</span>
                                <span className={textPrimaryClass}>{lang === 'ar' ? 'مبيعات:' : 'Retail Sale:'} {itemTotalSale.toLocaleString(localeCode, { maximumFractionDigits: 1 })} {t.currency}</span>
                                <span className={`font-bold ${itemProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                  {lang === 'ar' ? 'ربح:' : 'Profit:'} {itemProfit.toLocaleString(localeCode, { maximumFractionDigits: 1 })} {t.currency}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className={`pt-2 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        theme === 'dark' ? 'border-zinc-800' : theme === 'eye-care' ? 'border-[#dfca9e]' : 'border-slate-200'
                      }`}>
                        <div className={`flex flex-wrap gap-4 text-[11px] font-bold ${
                          theme === 'dark' ? 'text-zinc-300' : theme === 'eye-care' ? 'text-[#433422]' : 'text-slate-500'
                        }`}>
                          <span>{t.posTotalAmount}: {tx.totalAmount.toLocaleString(localeCode, { maximumFractionDigits: 1 })} {t.currency}</span>
                          <span>{t.posTotalCost}: {tx.totalCost.toLocaleString(localeCode, { maximumFractionDigits: 1 })} {t.currency}</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{t.posNetProfit}: {tx.totalProfit.toLocaleString(localeCode, { maximumFractionDigits: 1 })} {t.currency}</span>
                        </div>
                        
                        <button
                          onClick={() => onPrintTransaction(tx, tx.totalAmount)}
                          type="button"
                          className="px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700 shadow-sm"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'طباعة الفاتورة' : 'Print Invoice'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal for Transaction Cancel/Deletion */}
      {transactionToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className={`rounded-2xl max-w-md w-full p-6 shadow-2xl border animate-scale-up ${cardBgClass} ${
            lang === 'ar' ? 'text-right' : 'text-left'
          }`}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-4 animate-bounce">
                <Undo2 className="h-6 w-6" />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${textPrimaryClass}`}>{lang === 'ar' ? 'تأكيد إلغاء وحذف الفاتورة' : 'Confirm Invoice Cancellation'}</h3>
              <p className={`text-sm mb-6 leading-relaxed ${textSecondaryClass}`}>
                {lang === 'ar' 
                  ? 'تنبيه: هل أنت متأكد من رغبتك في إلغاء هذه العملية وحذف الفاتورة وإرجاع الكميات المبيعة إلى مخزن المنتجات؟' 
                  : 'Are you sure you want to cancel this sale? The invoice will be deleted, and all quantities will be put back into inventory.'
                }
                <br />
                <span className="text-rose-600 dark:text-rose-400 font-bold">{lang === 'ar' ? 'لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.' : 'This action is permanent and cannot be undone.'}</span>
              </p>
            </div>
            <div className={`flex gap-3 ${lang === 'ar' ? 'flex-col sm:flex-row-reverse' : 'flex-col sm:flex-row'}`}>
              <button
                type="button"
                onClick={() => {
                  onDeleteTransaction(transactionToDelete);
                  setTransactionToDelete(null);
                }}
                className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2.5 bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition cursor-pointer"
              >
                {lang === 'ar' ? 'نعم، احذف الفاتورة وأرجع المخزون' : 'Confirm & Restore Stock'}
              </button>
              <button
                type="button"
                onClick={() => setTransactionToDelete(null)}
                className={`w-full inline-flex justify-center rounded-xl border shadow-sm px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
                  theme === 'dark' ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {lang === 'ar' ? 'إلغاء التراجع' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
