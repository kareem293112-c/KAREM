import React, { useState, useMemo } from 'react';
import { Expense } from '../types';
import { Plus, Trash2, Search, AlertCircle, DollarSign, Calendar, TrendingDown, FileText, X, Edit2 } from 'lucide-react';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'motion/react';

interface ExpensesProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  lang: 'ar' | 'en';
  theme: 'light' | 'dark' | 'eye-care';
}

export default function Expenses({ expenses, onAddExpense, onEditExpense, onDeleteExpense, lang, theme }: ExpensesProps) {
  const t = translations[lang];

  // UI state
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);
  const [successToastMsg, setSuccessToastMsg] = useState('');
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => {
    // Current date/time in local timezone for the datetime-local input
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  });
  const [notes, setNotes] = useState('');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Start edit mode
  const handleStartEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setName(exp.name);
    setAmount(exp.amount.toString());
    
    // Convert store date (ISO string) to local datetime-local format
    const expDate = new Date(exp.date);
    const tzOffset = expDate.getTimezoneOffset() * 60000;
    const localISOTime = new Date(expDate.getTime() - tzOffset).toISOString().slice(0, 16);
    setDate(localISOTime);
    setNotes(exp.notes || '');
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingExpense(null);
    setName('');
    setAmount('');
    setNotes('');
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    setDate(new Date(now.getTime() - tzOffset).toISOString().slice(0, 16));
  };

  // Submit expense (Add or Edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || amount.trim() === '') {
      setErrorToast(t.expToastFillFields);
      return;
    }

    const valAmount = parseFloat(amount);
    if (isNaN(valAmount) || valAmount <= 0) {
      setErrorToast(lang === 'ar' ? 'يجب أن يكون المبلغ أكبر من صفر' : 'Amount must be greater than zero');
      return;
    }

    if (editingExpense) {
      // Edit mode
      const payload: Expense = {
        ...editingExpense,
        name: name.trim(),
        amount: valAmount,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        notes: notes.trim() || undefined,
      };

      onEditExpense(payload);
      setEditingExpense(null);
      setSuccessToastMsg(t.expToastEditSuccess);
    } else {
      // Add mode
      const payload: Expense = {
        id: `exp-${Date.now()}`,
        name: name.trim(),
        amount: valAmount,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        notes: notes.trim() || undefined,
      };

      onAddExpense(payload);
      setSuccessToastMsg(t.expToastSuccess);
    }

    // Reset Form
    setName('');
    setAmount('');
    setNotes('');
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    setDate(new Date(now.getTime() - tzOffset).toISOString().slice(0, 16));

    // Success banner feedback
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  // Safe delete
  const handleDeleteConfirm = () => {
    if (expenseToDelete) {
      onDeleteExpense(expenseToDelete.id);
      // If deleting the item currently being edited, cancel edit
      if (editingExpense && editingExpense.id === expenseToDelete.id) {
        handleCancelEdit();
      }
      setExpenseToDelete(null);
    }
  };

  // Calculate sum of expenses
  const totalExpensesSum = useMemo(() => {
    return expenses.reduce((acc, exp) => acc + exp.amount, 0);
  }, [expenses]);

  // Filtered list
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses;
    const q = searchQuery.toLowerCase();
    return expenses.filter(
      (exp) =>
        exp.name.toLowerCase().includes(q) ||
        (exp.notes && exp.notes.toLowerCase().includes(q))
    );
  }, [expenses, searchQuery]);

  // Theme adaptations
  const containerBgClass =
    theme === 'dark'
      ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
      : theme === 'eye-care'
      ? 'bg-[#fcf8f2] border-[#e6d0a7] text-[#433422]'
      : 'bg-slate-50 border-slate-100 text-slate-800';

  const cardBgClass =
    theme === 'dark'
      ? 'bg-zinc-900 border-zinc-800/80 text-zinc-200'
      : theme === 'eye-care'
      ? 'bg-[#fbf7f0] border-[#ebdcc3] text-[#4a3b2c]'
      : 'bg-white border-slate-200/60 text-slate-700';

  const inputClass =
    theme === 'dark'
      ? 'bg-zinc-850 border-zinc-700 text-zinc-100 focus:border-indigo-500 focus:ring-zinc-800'
      : theme === 'eye-care'
      ? 'bg-[#faf6ee] border-[#ebd9b9] text-[#433422] focus:border-amber-800 focus:ring-[#f5ebdb]'
      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-600 focus:ring-slate-100';

  const textPrimaryClass =
    theme === 'dark' ? 'text-zinc-100' : theme === 'eye-care' ? 'text-[#433422]' : 'text-slate-800';

  const textSecondaryClass =
    theme === 'dark' ? 'text-zinc-400' : theme === 'eye-care' ? 'text-[#877259]' : 'text-slate-500';

  const trBorderClass =
    theme === 'dark' ? 'border-zinc-800/60' : theme === 'eye-care' ? 'border-[#ebdcc3]/40' : 'border-slate-100';

  return (
    <div className="space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* 1. Header and quick description */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-black tracking-tight ${textPrimaryClass}`}>{t.tabExpenses}</h2>
          <p className={`text-xs mt-1.5 leading-relaxed font-medium max-w-2xl ${textSecondaryClass}`}>
            {t.expDesc}
          </p>
        </div>

        {/* Smart Box: Total Operational Expenses */}
        <div
          className={`px-5 py-4 rounded-2xl border flex items-center gap-4 shadow-sm w-full md:w-auto shrink-0 ${
            theme === 'dark'
              ? 'bg-zinc-900 border-zinc-800'
              : theme === 'eye-care'
              ? 'bg-[#faf2e4] border-[#dfca9e]'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="bg-rose-500/15 p-2.5 rounded-xl flex items-center justify-center text-rose-500">
            <TrendingDown className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className={`text-[11px] font-bold block ${textSecondaryClass}`}>{t.expTotalReport}</span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
              {totalExpensesSum.toLocaleString()} {t.currency}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Column grid (Form vs. List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Add New Expense (5 Columns) */}
        <div className="lg:col-span-5">
          <div className={`p-6 rounded-2xl border shadow-xs flex flex-col h-full ${cardBgClass}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-50 dark:bg-zinc-800 rounded-lg text-indigo-600 dark:text-indigo-400">
                {editingExpense ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <h3 className={`font-black text-base ${textPrimaryClass}`}>
                {editingExpense ? t.expEditTitle : t.expAddTitle}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col justify-between">
              <div className="space-y-4">
                {/* Material Name */}
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${textPrimaryClass}`}>
                    {t.expFieldName} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.expFieldNamePlaceholder}
                    className={`w-full text-sm font-medium px-4 py-3 rounded-xl border focus:outline-none focus:ring-4 transition duration-200 ${inputClass}`}
                    required
                  />
                </div>

                {/* Amount Paid */}
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${textPrimaryClass}`}>
                    {t.expFieldAmount} ({t.currency}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={t.expFieldAmountPlaceholder}
                    className={`w-full text-sm font-medium px-4 py-3 rounded-xl border font-mono focus:outline-none focus:ring-4 transition duration-200 ${inputClass}`}
                    required
                  />
                </div>

                {/* Date & Time */}
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${textPrimaryClass}`}>
                    {t.expFieldDate}
                  </label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full text-sm font-medium px-4 py-3 rounded-xl border font-mono focus:outline-none focus:ring-4 transition duration-200 ${inputClass}`}
                  />
                </div>

                {/* Optional Notes */}
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${textPrimaryClass}`}>
                    {lang === 'ar' ? 'ملاحظات وتفاصيل إضافية' : 'Additional Notes / Context'}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: تم السحب نقداً من الدرج بواسطة...' : 'e.g., Paid by cash withdrawal...'}
                    className={`w-full text-sm font-medium px-4 py-3 rounded-xl border focus:outline-none focus:ring-4 transition duration-200 ${inputClass}`}
                  />
                </div>
              </div>

              {/* Submit & Cancel buttons */}
              <div className="space-y-2 mt-6">
                {editingExpense && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-md shadow-indigo-100 dark:shadow-none hover:shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{t.expBtnCancel}</span>
                  </button>
                )}

                <button
                  type="submit"
                  className={
                    editingExpense
                      ? `w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                          theme === 'dark'
                            ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                            : theme === 'eye-care'
                            ? 'border-[#ebd9b9] text-[#877259] hover:bg-[#faf6ee]'
                            : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                        }`
                      : 'w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-md shadow-indigo-100 dark:shadow-none hover:shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2'
                  }
                >
                  {editingExpense ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{editingExpense ? t.expBtnSave : t.expBtnAdd}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Tabular List: List of Expenses (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className={`p-6 rounded-2xl border shadow-xs flex-grow flex flex-col ${cardBgClass}`}>
            
            {/* Table Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-zinc-850">
              <h3 className={`font-black text-base ${textPrimaryClass}`}>{t.expTableTitle}</h3>
              
              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'ar' ? 'ابحث باسم المادة...' : 'Search by item...'}
                  className={`w-full text-xs font-medium pl-9 pr-9 py-2.5 rounded-xl border focus:outline-none focus:ring-4 transition duration-200 ${inputClass}`}
                />
                <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
              </div>
            </div>

            {/* Expenses List */}
            <div className="overflow-x-auto flex-1 min-h-[300px]">
              {filteredExpenses.length === 0 ? (
                <div className={`flex flex-col items-center justify-center py-16 text-center ${textSecondaryClass}`}>
                  <FileText className="w-12 h-12 text-slate-200 dark:text-zinc-800 mb-3" />
                  <p className="text-sm font-semibold">{t.expNoExpenses}</p>
                </div>
              ) : (
                <table className="w-full text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  <thead>
                    <tr className={`text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 border-b ${trBorderClass}`}>
                      <th className="pb-3 text-start">{t.expTableHeaderName}</th>
                      <th className="pb-3 text-center">{t.expTableHeaderAmount}</th>
                      <th className="pb-3 text-center">{t.expTableHeaderActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                    <AnimatePresence initial={false}>
                      {filteredExpenses.map((exp) => {
                        const formattedTime = new Date(exp.date).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        const formattedDate = new Date(exp.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });

                        return (
                          <motion.tr
                            key={exp.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className={`group text-xs font-medium hover:bg-slate-50/40 dark:hover:bg-zinc-850/20 transition`}
                          >
                            {/* Details (Name, Date, Notes) */}
                            <td className="py-4 text-start">
                              <div>
                                <span className={`font-bold block ${textPrimaryClass}`}>{exp.name}</span>
                                <span className={`text-[10px] mt-0.5 block ${textSecondaryClass}`}>
                                  {formattedDate} - {formattedTime}
                                </span>
                                {exp.notes && (
                                  <span className="text-[10px] block font-semibold text-indigo-500/90 dark:text-indigo-400 mt-1">
                                    💬 {exp.notes}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Amount */}
                            <td className="py-4 text-center">
                              <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400 font-mono">
                                {exp.amount.toLocaleString()} {t.currency}
                              </span>
                            </td>

                            {/* Actions (Edit & Delete) */}
                            <td className="py-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(exp)}
                                  className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl transition cursor-pointer"
                                  title={lang === 'ar' ? 'تعديل المصروف' : 'Edit Expense'}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setExpenseToDelete(exp)}
                                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition cursor-pointer"
                                  title={lang === 'ar' ? 'حذف المصروف' : 'Delete Expense'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 3. Feedback Toasts/Banners */}
      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-6 left-6 z-50 bg-emerald-600 text-white rounded-2xl p-4 shadow-xl flex items-center gap-3 border border-emerald-500 animate-bounce">
          <AlertCircle className="w-6 h-6 text-emerald-100" />
          <div>
            <h4 className="font-bold">{lang === 'ar' ? 'تم حفظ المصروف!' : 'Expense Saved!'}</h4>
            <p className="text-xs text-emerald-100 mt-0.5">{successToastMsg || t.expToastSuccess}</p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorToast && (
        <div className="fixed top-6 left-6 z-50 bg-rose-600 text-white rounded-2xl p-4 shadow-xl flex items-center gap-3 border border-rose-500">
          <AlertCircle className="w-6 h-6 text-rose-100" />
          <div className="flex-grow">
            <h4 className="font-bold">{lang === 'ar' ? 'خطأ في الإدخال' : 'Input Error'}</h4>
            <p className="text-xs text-rose-100 mt-0.5">{errorToast}</p>
          </div>
          <button type="button" onClick={() => setErrorToast(null)} className="text-rose-100 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Delete Expense Confirmation Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-md overflow-hidden rounded-2xl shadow-2xl border transition-all duration-300 ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'
            }`}
          >
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-4">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className={`text-lg font-black ${textPrimaryClass}`}>{t.expDeleteConfirmTitle}</h3>
              <p className={`text-xs mt-2 font-semibold ${textSecondaryClass}`}>{t.expDeleteConfirmDesc}</p>
              
              <div className="bg-rose-50 dark:bg-zinc-950/50 p-3 rounded-xl border border-rose-100 dark:border-rose-950/40 font-bold text-xs mt-4 text-rose-700 dark:text-rose-400">
                {expenseToDelete.name}: {expenseToDelete.amount.toLocaleString()} {t.currency}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className={`p-4 px-6 flex justify-end gap-3 ${
              theme === 'dark' ? 'bg-zinc-950/25 border-t border-zinc-800' : 'bg-slate-50 border-t border-slate-100'
            }`}>
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  theme === 'dark'
                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                }`}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition hover:scale-[1.02] cursor-pointer"
              >
                {lang === 'ar' ? 'نعم، احذف المصروف' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
