import React, { useId } from 'react';
import { Phone, CheckCircle2, AlertCircle } from 'lucide-react';

export interface PhoneNumberInputProps {
  value: string; // Raw 10 digits or E.164
  onChange: (cleanDigits: string, e164Number: string, isValid: boolean) => void;
  disabled?: boolean;
  language?: 'en' | 'te';
  error?: string;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Sanitizes input text into clean 10-digit Indian phone number
 * Strips non-digits, leading +91, 91, or leading 0.
 */
export function sanitizeIndianPhoneNumber(rawInput: string): {
  cleanDigits: string;
  e164: string;
  isValid: boolean;
  validationError?: string;
} {
  let cleaned = String(rawInput || '').replace(/\D/g, '');

  // Handle leading international/trunk prefixes:
  // e.g. 919876543210 (12 digits starting with 91) -> 9876543210
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.slice(2);
  }
  // e.g. 09876543210 (11 digits starting with 0) -> 9876543210
  else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }

  // Cap at 10 digits
  if (cleaned.length > 10) {
    cleaned = cleaned.slice(0, 10);
  }

  const e164 = cleaned ? `+91${cleaned}` : '';

  // Validation rules for India:
  // 1. Must be 10 digits
  // 2. First digit must be 6, 7, 8, or 9
  let isValid = false;
  let validationError: string | undefined = undefined;

  if (cleaned.length > 0 && !/^[6-9]/.test(cleaned)) {
    validationError = 'Indian mobile numbers must start with 6, 7, 8, or 9.';
  } else if (cleaned.length > 0 && cleaned.length < 10) {
    validationError = 'Please enter all 10 digits of your mobile number.';
  } else if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) {
    isValid = true;
  }

  return { cleanDigits: cleaned, e164, isValid, validationError };
}

/**
 * Formats 10-digit number into "XXXXX XXXXX" for readable display
 */
export function formatIndianPhoneNumberDisplay(digits: string): string {
  if (!digits) return '';
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
}

export default function PhoneNumberInput({
  value,
  onChange,
  disabled = false,
  language = 'en',
  error,
  autoFocus = false,
  className = '',
}: PhoneNumberInputProps) {
  const inputId = useId();
  const { cleanDigits, e164, isValid, validationError } = sanitizeIndianPhoneNumber(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = sanitizeIndianPhoneNumber(raw);
    onChange(sanitized.cleanDigits, sanitized.e164, sanitized.isValid);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const sanitized = sanitizeIndianPhoneNumber(pastedText);
    onChange(sanitized.cleanDigits, sanitized.e164, sanitized.isValid);
  };

  const displayValue = formatIndianPhoneNumberDisplay(cleanDigits);
  const activeError = error || (cleanDigits.length > 0 && cleanDigits.length === 10 && !isValid ? validationError : undefined);

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Accessible Label */}
      <label htmlFor={inputId} className="text-[11px] font-bold text-slate-200 block">
        {language === 'te' ? 'మొబైల్ ఫోన్ నంబర్' : 'Mobile Phone Number'}
      </label>

      {/* Input container */}
      <div
        className={`flex items-center h-12 rounded-xl border transition-all duration-200 px-3 bg-slate-950/45 shadow-sm ${
          activeError
            ? 'border-red-500/80 ring-2 ring-red-500/20'
            : isValid
            ? 'border-emerald-400/80 ring-1 ring-emerald-400/20'
            : 'border-white/20 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-950/70' : ''}`}
      >
        {/* Country Code & Flag Selector */}
        <div
          className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-white/15 select-none"
          title="India (+91)"
        >
          {/* Official Indian Tiranga Flag SVG */}
          <svg className="w-5 h-3.5 rounded-[2px] shadow-xs shrink-0" viewBox="0 0 900 600" aria-hidden="true">
            <rect width="900" height="200" fill="#FF9933" />
            <rect y="200" width="900" height="200" fill="#FFFFFF" />
            <rect y="400" width="900" height="200" fill="#138808" />
            <circle cx="450" cy="300" r="80" fill="none" stroke="#000080" strokeWidth="15" />
          </svg>
          <span className="text-xs font-black text-white tracking-wide">+91</span>
        </div>

        {/* Input Field */}
        <input
          id={inputId}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={displayValue}
          onChange={handleChange}
          onPaste={handlePaste}
          disabled={disabled}
          placeholder={language === 'te' ? 'మీ మొబైల్ నంబర్ నమోదు చేయండి' : 'Enter mobile number'}
          maxLength={11} // 10 digits + 1 space
          autoFocus={autoFocus}
          aria-label={language === 'te' ? '10 అంకెల మొబైల్ నంబర్' : '10-digit mobile number'}
          aria-invalid={!!activeError}
          className="w-full pl-3 bg-transparent text-sm font-black text-white outline-none tracking-wider placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal disabled:cursor-not-allowed"
        />

        {/* Trailing Icon Indicator */}
        <div className="shrink-0 pl-2">
          {isValid ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-label="Valid phone number" />
          ) : activeError ? (
            <AlertCircle className="w-4 h-4 text-red-400" aria-label="Invalid phone number" />
          ) : (
            <Phone className="w-4 h-4 text-slate-400" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Validation helper or error message */}
      <div className="flex items-center justify-between text-[10px] px-1 pt-0.5 min-h-[16px]">
        {activeError ? (
          <span className="text-red-300 font-semibold flex items-center gap-1">
            <span>•</span> {activeError}
          </span>
        ) : (
          <span className="text-slate-300 font-medium">
            {language === 'te' ? '10 అంకెల మొబైల్ నంబర్ (6-9 తో ప్రారంభం)' : '10-digit Indian mobile (starts with 6-9)'}
          </span>
        )}

        <span className={`font-mono font-bold ${cleanDigits.length === 10 ? 'text-emerald-300' : 'text-slate-400'}`}>
          {cleanDigits.length}/10
        </span>
      </div>
    </div>
  );
}
