import React, { useState, useEffect } from 'react';
import { Delete, X, ShieldAlert, Languages, Keyboard, Trash2 } from 'lucide-react';

interface VirtualKeyboardProps {
  lang: 'ar' | 'en';
  theme: 'light' | 'dark' | 'eye-care';
  isOpen: boolean;
  onClose: () => void;
  targetInput: HTMLInputElement | null;
}

export default function VirtualKeyboard({ lang, theme, isOpen, onClose, targetInput }: VirtualKeyboardProps) {
  const [layoutLang, setLayoutLang] = useState<'ar' | 'en'>(lang);

  // Sync keyboard layout with system language when keyboard opens
  useEffect(() => {
    if (isOpen) {
      setLayoutLang(lang);
    }
  }, [isOpen, lang]);

  if (!isOpen) return null;

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  
  const arKeys = [
    ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
    ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط', 'ذ'],
    ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ', 'أ', 'إ']
  ];

  const enKeys = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  const handleKeyPress = (key: string) => {
    const input = targetInput || (document.activeElement as HTMLInputElement);
    if (!input || (input.tagName !== 'INPUT' && input.tagName !== 'TEXTAREA')) {
      return;
    }

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const text = input.value;
    let newValue = text;

    if (key === 'Backspace') {
      if (start === end) {
        newValue = text.slice(0, Math.max(0, start - 1)) + text.slice(start);
      } else {
        newValue = text.slice(0, start) + text.slice(end);
      }
    } else if (key === 'Clear') {
      newValue = '';
    } else if (key === 'Space') {
      newValue = text.slice(0, start) + ' ' + text.slice(end);
    } else {
      newValue = text.slice(0, start) + key + text.slice(end);
    }

    // Set value programmatically in a way that React's value tracker intercepts correctly
    try {
      const prototype = input.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
      if (nativeSetter) {
        nativeSetter.call(input, newValue);
      } else {
        input.value = newValue;
      }
    } catch (e) {
      input.value = newValue;
    }

    // Dispatch input & change events so React state hooks (useState/onChange) receive the update immediately
    const inputEvent = new Event('input', { bubbles: true });
    input.dispatchEvent(inputEvent);

    const changeEvent = new Event('change', { bubbles: true });
    input.dispatchEvent(changeEvent);

    // Maintain focus and set cursor position correctly
    setTimeout(() => {
      input.focus();
      let newCursorPos = start;
      if (key === 'Backspace') {
        newCursorPos = Math.max(0, start - (start === end ? 1 : 0));
      } else if (key === 'Clear') {
        newCursorPos = 0;
      } else if (key === 'Space') {
        newCursorPos = start + 1;
      } else {
        newCursorPos = start + key.length;
      }
      try {
        input.setSelectionRange(newCursorPos, newCursorPos);
      } catch (e) {
        // Ignore errors on input types that do not support selection ranges (e.g., number, email)
      }
    }, 0);
  };

  // Styling helpers
  const keyboardBgClass =
    theme === 'dark'
      ? 'bg-zinc-950/95 border-zinc-850 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]'
      : theme === 'eye-care'
      ? 'bg-[#eedebc]/95 border-[#dfca9e] shadow-[0_25px_50px_-12px_rgba(67,52,34,0.3)]'
      : 'bg-white/95 border-slate-200/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]';

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
      : 'text-slate-500';

  const keyBgClass =
    theme === 'dark'
      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 active:bg-zinc-650 border-zinc-700'
      : theme === 'eye-care'
      ? 'bg-[#faf5ea] hover:bg-[#ebdcc3] text-[#433422] active:bg-[#dfca9e] border-[#dfca9e]'
      : 'bg-slate-50 hover:bg-slate-200 text-slate-800 active:bg-slate-300 border-slate-200';

  const fnKeyBgClass =
    theme === 'dark'
      ? 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800'
      : theme === 'eye-care'
      ? 'bg-[#ebdcc3] hover:bg-[#dfca9e] text-[#433422] border-[#dfca9e]'
      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200';

  const currentKeys = layoutLang === 'ar' ? arKeys : enKeys;

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-2xl p-4 rounded-3xl border backdrop-blur-md transition-all duration-300 animate-scale-up ${keyboardBgClass}`}
      dir={layoutLang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Keyboard Header */}
      <div className="flex items-center justify-between mb-3 px-2 border-b pb-2 border-dashed border-zinc-700/20">
        <div className="flex items-center gap-1.5">
          <Keyboard className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className={`text-xs font-black tracking-tight ${textPrimaryClass}`}>
            {layoutLang === 'ar' ? 'لوحة المفاتيح الافتراضية' : 'Virtual Keyboard'}
          </span>
          {targetInput && (
            <span className="text-[10px] opacity-75 bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
              {layoutLang === 'ar' ? 'نشط 🟢' : 'Active 🟢'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Language Toggle */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setLayoutLang(prev => (prev === 'ar' ? 'en' : 'ar'))}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${fnKeyBgClass}`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{layoutLang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-rose-500 hover:text-white transition cursor-pointer text-slate-400"
            title={layoutLang === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Keyboard Body */}
      <div className="space-y-1.5 font-sans select-none">
        {/* Numbers Row */}
        <div className="flex justify-center gap-1">
          {numbers.map(num => (
            <button
              key={num}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleKeyPress(num)}
              className={`flex-1 max-w-[50px] aspect-[4/3] rounded-xl border text-sm font-bold flex items-center justify-center cursor-pointer transition active:scale-95 shadow-sm ${keyBgClass}`}
              style={{ contentVisibility: 'auto' }}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Character Rows */}
        {currentKeys.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map(key => (
              <button
                key={key}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleKeyPress(key)}
                className={`flex-1 rounded-xl border text-sm font-semibold flex items-center justify-center cursor-pointer transition active:scale-95 shadow-sm ${keyBgClass}`}
                style={{
                  height: '42px',
                  minWidth: '24px',
                  contentVisibility: 'auto'
                }}
              >
                {key}
              </button>
            ))}
          </div>
        ))}

        {/* Action Controls Row */}
        <div className="flex justify-center gap-1 pt-1">
          {/* Clear Button */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleKeyPress('Clear')}
            className={`px-4 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow-sm ${fnKeyBgClass} hover:bg-rose-500/10 hover:text-rose-500`}
            style={{ height: '42px', minWidth: '85px' }}
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>{layoutLang === 'ar' ? 'مسح الكل' : 'Clear'}</span>
          </button>

          {/* Space bar */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleKeyPress('Space')}
            className={`flex-1 rounded-xl border text-xs font-bold flex items-center justify-center transition active:scale-95 cursor-pointer shadow-sm ${keyBgClass}`}
            style={{ height: '42px' }}
          >
            {layoutLang === 'ar' ? 'مسافة' : 'Space'}
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleKeyPress('Backspace')}
            className={`px-4 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow-sm ${fnKeyBgClass}`}
            style={{ height: '42px', minWidth: '85px' }}
          >
            <Delete className="w-4 h-4 shrink-0" />
            <span>{layoutLang === 'ar' ? 'تراجع' : 'Backspace'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
