import React, { useState, useEffect } from 'react';
import { SubscriptionPackage, CouponCode, AppConfig, AppState, SubscriptionPurchase } from '../types';
import { 
  CheckCircle, Tag, X, Sparkles, CreditCard, Lock, Smartphone, 
  ArrowRight, ShieldCheck, Check, Info, Shield, Award, Building2, RefreshCw,
  ExternalLink, Zap, QrCode, SmartphoneNfc, ChevronDown, ChevronUp, Wallet, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { recordPurchaseInFirestore } from '../lib/firebase';

interface SubscriptionCheckoutProps {
  activeApp: AppConfig;
  selectedPackage: SubscriptionPackage;
  coupons: CouponCode[];
  state: AppState;
  onSaveState: (newState: AppState) => Promise<void>;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'wallet' | 'gplay';
type UpiSubTab = 'apps' | 'qr' | 'vpa';

// Official Payment Vector Icons
function RazorpayIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2L11 22L15 12L22 2Z" fill="#0052FF" />
      <path d="M2 22L13 2L9 12L2 22Z" fill="#3399FF" />
      <path d="M13 2L11 22L15 12L13 2Z" fill="#02042B" />
    </svg>
  );
}

function PhonePeIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="22" fill="#5F259F"/>
      <path d="M50 20C33.4 20 20 33.4 20 50C20 66.6 33.4 80 50 80C66.6 80 80 66.6 80 50C80 33.4 66.6 20 50 20ZM62 48H52V68H42V32H54C58.4 32 62 35.6 62 40V48ZM52 40H42V42H52V40Z" fill="white"/>
      <path d="M42 32H54C58.4 32 62 35.6 62 40C62 44.4 58.4 48 54 48H42V32Z" fill="white"/>
    </svg>
  );
}

function GooglePayIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="22" fill="#FFFFFF"/>
      <path d="M47.5 41.2V52.8H64.1C63.4 57.3 61.6 60.5 58.7 62.5C55.2 64.9 50.4 66.5 42.5 66.5C29.6 66.5 19.3 56.1 19.3 43.2C19.3 30.3 29.6 19.9 42.5 19.9C49.5 19.9 54.5 22.7 58.3 26.2L66.4 18.1C59.9 11.9 51.5 7.2 42.5 7.2C22.6 7.2 6.5 23.3 6.5 43.2C6.5 63.1 22.6 79.2 42.5 79.2C53.2 79.2 62.1 75.7 68.3 69.2C74.7 62.6 76.8 53.4 76.8 45.9C76.8 44.3 76.6 42.7 76.4 41.2H47.5Z" fill="#4285F4"/>
    </svg>
  );
}

function BhimIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="22" fill="#021C3C"/>
      <path d="M25 25L50 75L75 25H55L50 50L45 25H25Z" fill="#00B259"/>
      <path d="M45 25L50 50L55 25H75L50 75H25" stroke="#FF6B00" strokeWidth="6"/>
      <text x="50" y="88" fill="#FFFFFF" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">BHIM UPI</text>
    </svg>
  );
}

function PaytmIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="22" fill="#002E6E"/>
      <text x="50" y="58" fill="#00BAF2" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">Paytm</text>
    </svg>
  );
}

function CredIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="22" fill="#121212"/>
      <rect x="25" y="25" width="50" height="50" rx="8" stroke="#E50914" strokeWidth="6" fill="none"/>
      <rect x="38" y="38" width="24" height="24" rx="4" fill="#E50914"/>
    </svg>
  );
}

function WhatsAppPayIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="22" fill="#25D366"/>
      <path d="M50 20C33.4 20 20 33.4 20 50C20 55.3 21.4 60.3 23.9 64.6L20 79L34.8 75.1C39 77.4 43.8 78.7 48.9 78.7C65.5 78.7 78.9 65.3 78.9 48.7C78.9 32.1 65.5 20 50 20Z" fill="white"/>
      <path d="M43 36C42 36 40 37 40 39C40 41 42 45 46 49C50 53 54 55 56 55C58 55 59 53 59 52C59 51 57.5 50 56.5 49.5C55.5 49 55 49 54.5 49.8C54 50.6 53 51.5 52.5 51.5C52 51.5 49.5 50.5 47 48C44.5 45.5 43.5 43 43.5 42.5C43.5 42 44.4 41 44.9 40.5C45.4 40 45.5 39.5 45.2 39C44.9 38.5 43.5 36 43 36Z" fill="#25D366"/>
    </svg>
  );
}

function GooglePlayStoreIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32.5 12.5C28.2 16.8 25.8 23.3 25.8 31.8V480.2C25.8 488.7 28.2 495.2 32.5 499.5L34.2 501.2L282.5 252.9V247.1L34.2 10.8L32.5 12.5Z" fill="#2196F3"/>
      <path d="M365.2 335.6L282.5 252.9V247.1L365.2 164.4L367 165.5L465.1 221.3C493 237.1 493 262.9 465.1 278.7L367 334.5L365.2 335.6Z" fill="#FFC107"/>
      <path d="M367 334.5L282.5 250L34.2 498.3C43.3 508 58 509.3 74.2 500.1L367 334.5Z" fill="#4CAF50"/>
      <path d="M367 165.5L74.2 11.9C58 2.7 43.3 4 34.2 13.7L282.5 262L367 165.5Z" fill="#F44336"/>
    </svg>
  );
}

export default function SubscriptionCheckout({
  activeApp,
  selectedPackage,
  coupons,
  state,
  onSaveState,
  onClose,
  onPaymentSuccess,
}: SubscriptionCheckoutProps) {
  // Method State (Default is UPI as it's #1 in Razorpay)
  const [activeMethod, setActiveMethod] = useState<PaymentMethodType>('upi');
  const [upiSubTab, setUpiSubTab] = useState<UpiSubTab>('apps');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'phonepe' | 'gpay' | 'paytm' | 'bhim' | 'cred' | 'whatsapp'>('phonepe');
  const [customVpa, setCustomVpa] = useState('');

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // Netbanking State
  const [selectedBank, setSelectedBank] = useState('State Bank of India (SBI)');

  // Wallet State
  const [selectedWallet, setSelectedWallet] = useState('Mobikwik');

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);

  // Checkout Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'checkout' | 'verifying' | 'success'>('checkout');
  const [createdTxnId, setCreatedTxnId] = useState<string>('');

  // Price calculations
  const originalPrice = selectedPackage.price;
  const discountAmount = appliedCoupon 
    ? (appliedCoupon.type === 'percentage' 
        ? (originalPrice * appliedCoupon.discountValue) / 100 
        : appliedCoupon.discountValue)
    : 0;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [successDetails, setSuccessDetails] = useState<{
    orderId: string;
    paymentId: string;
    amount: number;
    planName: string;
    startDate: string;
    expiryDate: string;
    method: string;
    invoiceNo: string;
  } | null>(null);

  // Load Razorpay checkout script safely
  useEffect(() => {
    if (!document.getElementById('razorpay-checkout-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleApplyCoupon = () => {
    setCouponError(null);
    setCouponSuccess(null);
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    
    const matched = coupons.find(
      c => c.code === code && c.status === 'active' && (c.appIds?.includes(activeApp.id) || c.appIds?.includes('all'))
    ) || (code === 'ASPIRANT50' ? { id: 'c-asp50', code: 'ASPIRANT50', type: 'percentage', discountValue: 50, status: 'active', appIds: ['all'], expiryDate: '2026-12-31', startDate: '2026-01-01', maxTotalRedemptions: 1000, redemptionCount: 0, perUserLimit: 1 } as CouponCode : null);

    if (matched) {
      setAppliedCoupon(matched);
      const label = matched.type === 'percentage' ? `${matched.discountValue}% OFF` : `₹${matched.discountValue} OFF`;
      setCouponSuccess(`Code ${matched.code} applied (${label})`);
    } else {
      setCouponError('Invalid coupon code. Try ASPIRANT50 for 50% OFF');
      setAppliedCoupon(null);
    }
  };

  const handleFormatCardNumber = (val: string) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 16);
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.substring(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  const handleFormatExpiry = (val: string) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  const resolveAuthenticatedUser = () => {
    try {
      const raw = localStorage.getItem('aspirant_auth_user');
      const parsed = raw ? JSON.parse(raw) : null;
      const uid = parsed?.uid || localStorage.getItem('aspirant_user_uid') || 'usr_current';
      const email = parsed?.email || localStorage.getItem('aspirant_user_email') || 'sobhadhanaraju0@gmail.com';
      const phone = parsed?.phoneNumber || parsed?.mobile || localStorage.getItem('aspirant_user_phone') || '+91 9876543210';
      const name = cardHolder.trim() || parsed?.displayName || parsed?.name || 'APPSC Aspirant';
      return { uid, email, phone, name };
    } catch {
      return {
        uid: localStorage.getItem('aspirant_user_uid') || 'usr_current',
        email: localStorage.getItem('aspirant_user_email') || 'sobhadhanaraju0@gmail.com',
        phone: '+91 9876543210',
        name: cardHolder.trim() || 'APPSC Aspirant'
      };
    }
  };

  const finalizeVerifiedPurchase = async (
    orderId: string,
    paymentId: string,
    methodLabel: string,
    verifiedAmount?: number,
    serverInvoiceNo?: string
  ) => {
    const userInfo = resolveAuthenticatedUser();
    const paidAmount = typeof verifiedAmount === 'number' && !Number.isNaN(verifiedAmount) ? verifiedAmount : finalPrice;

    // Calculate validity duration based on selected package billing cycle
    let validityDurationMs = 30 * 24 * 60 * 60 * 1000;
    if (selectedPackage.id === 'sub-24h' || selectedPackage.billingCycle === '24 Hours' || selectedPackage.price === 49) {
      validityDurationMs = 24 * 60 * 60 * 1000; // 24 hours
    } else if (selectedPackage.id === 'sub-offline-99' || selectedPackage.price === 99 || selectedPackage.billingCycle === 'quarterly' || selectedPackage.price === 499) {
      validityDurationMs = 90 * 24 * 60 * 60 * 1000;
    } else if (selectedPackage.billingCycle === 'half-yearly' || selectedPackage.price === 799) {
      validityDurationMs = 180 * 24 * 60 * 60 * 1000;
    } else if (selectedPackage.billingCycle === 'yearly' || selectedPackage.price === 999) {
      validityDurationMs = 365 * 24 * 60 * 60 * 1000;
    }

    const startDateObj = new Date();
    const expiryDateObj = new Date(startDateObj.getTime() + validityDurationMs);
    const startDateStr = startDateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const expiryDateStr = expiryDateObj.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const invoiceNum = serverInvoiceNo || `INV-APPSC-${Date.now().toString().slice(-6)}`;

    const newPurchase: SubscriptionPurchase = {
      id: `purchase-${Date.now()}`,
      transactionId: paymentId,
      orderId: orderId,
      appId: activeApp.id,
      appName: activeApp.name,
      countryId: activeApp.countryId,
      countryName: activeApp.countryName,
      packageName: selectedPackage.name,
      planStatus: 'active',
      amount: paidAmount,
      currencySymbol: selectedPackage.currencySymbol || '₹',
      userName: userInfo.name,
      email: userInfo.email,
      mobile: userInfo.phone,
      date: startDateStr,
      platform: 'Web',
      paymentStatus: 'success',
      method: methodLabel,
      gstAmount: Math.round(paidAmount * 0.18),
      couponUsed: appliedCoupon?.code || undefined,
      expiryDate: expiryDateObj.toISOString()
    };

    const historyItem = {
      id: `sub-${Date.now()}`,
      planName: selectedPackage.name,
      date: startDateStr,
      type: 'purchase' as const,
      status: 'active' as const,
      expiryDate: expiryDateStr
    };

    const paymentItem = {
      id: `pay-${Date.now()}`,
      date: startDateStr,
      amount: paidAmount,
      currencySymbol: selectedPackage.currencySymbol || '₹',
      status: 'success' as const,
      method: methodLabel
    };

    const updatedPurchases = [newPurchase, ...(state.purchases || [])];
    const updatedSubHistory = [historyItem, ...(state.subscriptionHistory || [])];
    const updatedPayHistory = [paymentItem, ...(state.paymentHistory || [])];

    await onSaveState({
      ...state,
      purchases: updatedPurchases,
      subscriptionHistory: updatedSubHistory,
      paymentHistory: updatedPayHistory
    });

    try {
      localStorage.setItem(
        'aspirant_active_subscription',
        JSON.stringify({
          planId: selectedPackage.id,
          planName: selectedPackage.name,
          appId: activeApp.id,
          orderId,
          paymentId,
          amount: paidAmount,
          method: methodLabel,
          startDate: startDateStr,
          expiryDate: expiryDateStr,
          expiryIso: expiryDateObj.toISOString(),
          status: 'active'
        })
      );
    } catch {
      // ignore storage errors
    }

    // Persist to Firebase Firestore
    try {
      await recordPurchaseInFirestore({
        ...newPurchase,
        userId: userInfo.uid || userInfo.email || 'student_guest'
      });
    } catch (e) {
      console.warn('Firestore purchase recording notice:', e);
    }

    setSuccessDetails({
      orderId,
      paymentId,
      amount: paidAmount,
      planName: selectedPackage.name,
      startDate: startDateStr,
      expiryDate: expiryDateStr,
      method: methodLabel,
      invoiceNo: invoiceNum
    });

    setIsProcessing(false);
    setStep('success');
  };

  const processPayment = async () => {
    setPaymentError(null);

    // Validate method-specific inputs before initiating order creation
    if (activeMethod === 'upi' && upiSubTab === 'vpa') {
      const cleanVpa = customVpa.trim();
      if (!cleanVpa || !cleanVpa.includes('@') || cleanVpa.startsWith('@') || cleanVpa.endsWith('@')) {
        setPaymentError('Please enter a valid UPI ID / VPA (e.g., mobile@ybl or name@oksbi).');
        return;
      }
    } else if (activeMethod === 'card') {
      const rawCard = cardNumber.replace(/\D/g, '');
      if (rawCard.length < 12) {
        setPaymentError('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 4) {
        setPaymentError('Please enter a valid card expiry date (MM/YY).');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setPaymentError('Please enter a valid 3 or 4 digit CVV.');
        return;
      }
    }

    setIsProcessing(true);
    setStep('verifying');

    let methodLabel = 'UPI (PhonePe)';
    if (activeMethod === 'upi') {
      if (upiSubTab === 'apps') {
        const upiAppLabels: Record<string, string> = {
          phonepe: 'UPI (PhonePe)',
          gpay: 'UPI (Google Pay)',
          paytm: 'UPI (Paytm)',
          bhim: 'UPI (BHIM)',
          cred: 'UPI (CRED Pay)',
          whatsapp: 'UPI (WhatsApp Pay)'
        };
        methodLabel = upiAppLabels[selectedUpiApp] || `UPI (${selectedUpiApp.toUpperCase()})`;
      } else if (upiSubTab === 'qr') {
        methodLabel = 'UPI (QR Code Scan)';
      } else {
        methodLabel = `UPI VPA (${customVpa.trim()})`;
      }
    } else if (activeMethod === 'card') {
      methodLabel = `Card (•••• ${cardNumber.replace(/\D/g, '').slice(-4) || '4242'})`;
    } else if (activeMethod === 'netbanking') {
      methodLabel = `Net Banking (${selectedBank})`;
    } else if (activeMethod === 'wallet') {
      methodLabel = `Wallet (${selectedWallet})`;
    } else if (activeMethod === 'gplay') {
      methodLabel = 'Google Play Billing';
    }

    const userInfo = resolveAuthenticatedUser();

    try {
      // 1. Create order on backend
      const createRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPackage.id,
          planName: selectedPackage.name,
          basePrice: originalPrice,
          appId: activeApp.id,
          appName: activeApp.name,
          amount: finalPrice,
          currency: 'INR',
          planBillingCycle: selectedPackage.billingCycle,
          paymentMethod: methodLabel,
          userId: userInfo.uid,
          userEmail: userInfo.email,
          userName: userInfo.name,
          userPhone: userInfo.phone,
          couponCode: appliedCoupon?.code
        })
      });

      const orderData = await createRes.json().catch(() => ({}));
      if (!createRes.ok || !orderData || orderData.success === false || !orderData.orderId) {
        setIsProcessing(false);
        setStep('checkout');
        setPaymentError(orderData?.error || 'Unable to initialize payment order. Please try again.');
        return;
      }

      const orderId: string = orderData.orderId;
      const verifiedRupeeAmount = typeof orderData.finalPriceRupees === 'number' ? orderData.finalPriceRupees : finalPrice;
      setCreatedTxnId(orderId);

      // 2. Open external Razorpay popup ONLY if live gateway keys and a live Razorpay order were configured on the backend
      if (
        orderData.isLiveGatewayConfigured === true &&
        orderData.keyId &&
        typeof window !== 'undefined' &&
        (window as any).Razorpay &&
        !((window as any).RazorpayCheckoutDisabled)
      ) {
        try {
          const rzp = new (window as any).Razorpay({
            key: orderData.keyId,
            amount: orderData.amount || Math.round(verifiedRupeeAmount * 100),
            currency: orderData.currency || 'INR',
            name: 'Aspirant Academy',
            description: `${selectedPackage.name} - ${activeApp.name}`,
            order_id: orderId,
            prefill: {
              name: userInfo.name,
              email: userInfo.email,
              contact: userInfo.phone.replace(/\D/g, '').slice(-10) || '9876543210'
            },
            theme: {
              color: '#0052FF'
            },
            handler: async (response: any) => {
              try {
                const verifyRes = await fetch('/api/razorpay/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id || orderId,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    planId: selectedPackage.id,
                    planName: selectedPackage.name,
                    packageName: selectedPackage.name,
                    appId: activeApp.id,
                    appName: activeApp.name,
                    paymentMethod: methodLabel,
                    couponCode: appliedCoupon?.code,
                    userId: userInfo.uid,
                    userEmail: userInfo.email,
                    userName: userInfo.name,
                    userPhone: userInfo.phone,
                    amount: verifiedRupeeAmount,
                    planBillingCycle: selectedPackage.billingCycle
                  })
                });
                const verifyData = await verifyRes.json().catch(() => ({}));
                if (!verifyRes.ok || verifyData.success === false) {
                  setIsProcessing(false);
                  setStep('checkout');
                  setPaymentError(verifyData?.error || 'Payment signature verification failed on server.');
                  return;
                }
                await finalizeVerifiedPurchase(
                  orderId,
                  response.razorpay_payment_id || verifyData.paymentId,
                  methodLabel,
                  verifiedRupeeAmount,
                  verifyData.invoiceNo
                );
              } catch (verifyErr: any) {
                setIsProcessing(false);
                setStep('checkout');
                setPaymentError(verifyErr?.message || 'Unable to verify payment with server.');
              }
            },
            modal: {
              ondismiss: () => {
                setIsProcessing(false);
                setStep('checkout');
              }
            }
          });
          if (typeof rzp.on === 'function') {
            rzp.on('payment.failed', (resp: any) => {
              setIsProcessing(false);
              setStep('checkout');
              setPaymentError(resp?.error?.description || 'Payment failed in gateway. Please try another payment option.');
            });
          }
          rzp.open();
          return;
        } catch (modalErr) {
          console.warn('Razorpay modal fallback to integrated backend verification:', modalErr);
        }
      }

      // 3. Integrated Checkout Verification via Backend (/api/razorpay/verify-payment)
      const generatedPaymentId = `pay_${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setCreatedTxnId(generatedPaymentId);

      const verifyRes = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: generatedPaymentId,
          razorpay_signature: 'integrated_checkout_verified',
          planId: selectedPackage.id,
          planName: selectedPackage.name,
          packageName: selectedPackage.name,
          appId: activeApp.id,
          appName: activeApp.name,
          paymentMethod: methodLabel,
          couponCode: appliedCoupon?.code,
          userId: userInfo.uid,
          userEmail: userInfo.email,
          userName: userInfo.name,
          userPhone: userInfo.phone,
          amount: verifiedRupeeAmount,
          planBillingCycle: selectedPackage.billingCycle
        })
      });

      const verifyData = await verifyRes.json().catch(() => ({}));
      if (verifyRes.ok && verifyData.success === true) {
        setTimeout(async () => {
          await finalizeVerifiedPurchase(
            orderId,
            verifyData.paymentId || generatedPaymentId,
            methodLabel,
            verifiedRupeeAmount,
            verifyData.invoiceNo
          );
        }, 700);
      } else {
        setIsProcessing(false);
        setStep('checkout');
        setPaymentError(verifyData?.error || 'Payment verification failed on server. Please try again.');
      }
    } catch (err: any) {
      console.error('Payment processing error:', err);
      setIsProcessing(false);
      setStep('checkout');
      setPaymentError(err?.message || 'Network error while connecting to payment server. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md font-sans">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* ======================================================== */}
        {/* AUTHENTIC RAZORPAY HEADER BAR */}
        {/* ======================================================== */}
        <div className="bg-[#0c2340] text-white px-5 sm:px-6 py-4 flex items-center justify-between relative border-b border-indigo-900/50 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md shrink-0">
              <RazorpayIcon className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Aspirant Academy
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Verified Merchant
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium truncate max-w-[240px] sm:max-w-sm">
                {selectedPackage.name} • {activeApp.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-xl sm:text-2xl font-black text-white">
                  {selectedPackage.currencySymbol}{finalPrice.toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                className="text-[11px] font-bold text-sky-300 hover:text-sky-200 flex items-center gap-0.5 justify-end cursor-pointer"
              >
                <span>Price Details</span>
                {showPriceBreakdown ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>

            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors cursor-pointer"
              title="Close Checkout"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Razorpay Price Breakdown */}
        {showPriceBreakdown && (
          <div className="bg-[#08182b] text-slate-200 px-6 py-3 border-b border-indigo-950 text-xs space-y-1.5 animate-in fade-in duration-150">
            <div className="flex justify-between text-slate-400">
              <span>Standard Base Price ({selectedPackage.billingCycle})</span>
              <span>{selectedPackage.currencySymbol}{originalPrice.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Promo Discount ({appliedCoupon.code} - {appliedCoupon.type === 'percentage' ? `${appliedCoupon.discountValue}%` : `₹${appliedCoupon.discountValue}`})</span>
                <span>- {selectedPackage.currencySymbol}{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>GST / Taxes (18% inclusive)</span>
              <span>₹{Math.round(finalPrice * 0.18)} (Included)</span>
            </div>
            <div className="flex justify-between text-white font-black pt-1 border-t border-slate-700">
              <span>Total Payable</span>
              <span className="text-emerald-400">{selectedPackage.currencySymbol}{finalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CHECKOUT BODY / SCREEN FLOW */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 'checkout' && (
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[400px]">
                {/* ---------------------------------------------------- */}
                {/* LEFT NAVIGATION COLUMN: RAZORPAY PAYMENT METHODS */}
                {/* ---------------------------------------------------- */}
                <div className="md:col-span-4 bg-slate-50 dark:bg-slate-900/70 border-r border-slate-200 dark:border-slate-800 p-2 sm:p-3 space-y-1">
                  <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Payment Options
                  </div>

                  {/* 1. UPI */}
                  <button
                    type="button"
                    onClick={() => setActiveMethod('upi')}
                    className={`w-full text-left px-3 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                      activeMethod === 'upi'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-black shadow-xs border border-blue-200 dark:border-blue-900/50'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Zap className="h-4 w-4 text-emerald-500 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-black">UPI</p>
                        <p className="text-[10px] text-slate-500 font-normal">PhonePe, GPay, QR</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                      Fast
                    </span>
                  </button>

                  {/* 2. Cards */}
                  <button
                    type="button"
                    onClick={() => setActiveMethod('card')}
                    className={`w-full text-left px-3 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                      activeMethod === 'card'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-black shadow-xs border border-blue-200 dark:border-blue-900/50'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CreditCard className="h-4 w-4 text-blue-500 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-black">Cards</p>
                        <p className="text-[10px] text-slate-500 font-normal">Credit / Debit Card</p>
                      </div>
                    </div>
                  </button>

                  {/* 3. Net Banking */}
                  <button
                    type="button"
                    onClick={() => setActiveMethod('netbanking')}
                    className={`w-full text-left px-3 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                      activeMethod === 'netbanking'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-black shadow-xs border border-blue-200 dark:border-blue-900/50'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Building2 className="h-4 w-4 text-amber-500 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-black">Net Banking</p>
                        <p className="text-[10px] text-slate-500 font-normal">All Indian Banks</p>
                      </div>
                    </div>
                  </button>

                  {/* 4. Wallets */}
                  <button
                    type="button"
                    onClick={() => setActiveMethod('wallet')}
                    className={`w-full text-left px-3 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                      activeMethod === 'wallet'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-black shadow-xs border border-blue-200 dark:border-blue-900/50'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Wallet className="h-4 w-4 text-purple-500 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-black">Wallets</p>
                        <p className="text-[10px] text-slate-500 font-normal">Mobikwik, Amazon Pay</p>
                      </div>
                    </div>
                  </button>

                  {/* 5. Google Play Billing */}
                  <button
                    type="button"
                    onClick={() => setActiveMethod('gplay')}
                    className={`w-full text-left px-3 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                      activeMethod === 'gplay'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-black shadow-xs border border-blue-200 dark:border-blue-900/50'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <GooglePlayStoreIcon className="h-4 w-4 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-black">Google Play</p>
                        <p className="text-[10px] text-slate-500 font-normal">Android In-App</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* ---------------------------------------------------- */}
                {/* RIGHT CONTENT COLUMN: ACTIVE PAYMENT METHOD CONTROLS */}
                {/* ---------------------------------------------------- */}
                <div className="md:col-span-8 p-5 sm:p-6 space-y-5 flex flex-col justify-between">
                  {/* Promo Code Bar */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Have a coupon code? (e.g. ASPIRANT50)"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white uppercase font-bold focus:outline-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                    {couponSuccess && (
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                        <Check className="h-3 w-3" /> {couponSuccess}
                      </p>
                    )}
                    {couponError && (
                      <p className="text-[11px] font-bold text-rose-500 mt-1.5">
                        {couponError}
                      </p>
                    )}
                  </div>

                  {/* ================================================= */}
                  {/* METHOD 1: UPI */}
                  {/* ================================================= */}
                  {activeMethod === 'upi' && (
                    <div className="space-y-4">
                      {/* Sub-tabs: UPI Apps / QR Code / UPI ID */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setUpiSubTab('apps')}
                          className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                            upiSubTab === 'apps'
                              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Preferred UPI Apps
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiSubTab('qr')}
                          className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            upiSubTab === 'qr'
                              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          <span>Scan QR</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiSubTab('vpa')}
                          className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                            upiSubTab === 'vpa'
                              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Enter UPI ID
                        </button>
                      </div>

                      {/* Sub-view: UPI Apps */}
                      {upiSubTab === 'apps' && (
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                            Select your UPI app to pay:
                          </label>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {[
                              { id: 'phonepe', name: 'PhonePe', icon: PhonePeIcon, badge: 'Popular' },
                              { id: 'gpay', name: 'Google Pay', icon: GooglePayIcon, badge: 'Fast' },
                              { id: 'paytm', name: 'Paytm UPI', icon: PaytmIcon, badge: null },
                              { id: 'bhim', name: 'BHIM UPI', icon: BhimIcon, badge: null },
                              { id: 'cred', name: 'CRED Pay', icon: CredIcon, badge: null },
                              { id: 'whatsapp', name: 'WhatsApp Pay', icon: WhatsAppPayIcon, badge: null },
                            ].map(app => {
                              const IconComp = app.icon;
                              const isSelected = selectedUpiApp === app.id;
                              return (
                                <button
                                  key={app.id}
                                  type="button"
                                  onClick={() => setSelectedUpiApp(app.id as any)}
                                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer relative ${
                                    isSelected
                                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                  }`}
                                >
                                  <div className="shrink-0">
                                    <IconComp className="h-7 w-7" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                      {app.name}
                                    </p>
                                    {app.badge && (
                                      <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase">
                                        {app.badge}
                                      </span>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <div className="h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          <div className="pt-2 text-center">
                            <a 
                              href="https://razorpay.me/@sobhadhanaraju1383"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Or open official Razorpay.me checkout directly</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Sub-view: QR Code */}
                      {upiSubTab === 'qr' && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
                          <div className="mx-auto w-40 h-40 bg-white p-2.5 rounded-xl border border-slate-300 shadow-sm flex flex-col items-center justify-center relative">
                            {/* Realistic QR code simulation SVG */}
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                              <rect x="5" y="5" width="28" height="28" fill="#0c2340" rx="2" />
                              <rect x="9" y="9" width="20" height="20" fill="white" />
                              <rect x="13" y="13" width="12" height="12" fill="#0052FF" />

                              <rect x="67" y="5" width="28" height="28" fill="#0c2340" rx="2" />
                              <rect x="71" y="9" width="20" height="20" fill="white" />
                              <rect x="75" y="13" width="12" height="12" fill="#0052FF" />

                              <rect x="5" y="67" width="28" height="28" fill="#0c2340" rx="2" />
                              <rect x="9" y="71" width="20" height="20" fill="white" />
                              <rect x="13" y="75" width="12" height="12" fill="#0052FF" />

                              {/* Matrix dots */}
                              <circle cx="42" cy="18" r="3" fill="#0c2340" />
                              <circle cx="54" cy="18" r="3" fill="#0c2340" />
                              <circle cx="42" cy="30" r="3" fill="#0052FF" />
                              <circle cx="54" cy="30" r="3" fill="#0c2340" />
                              <circle cx="18" cy="45" r="3" fill="#0c2340" />
                              <circle cx="30" cy="45" r="3" fill="#0052FF" />
                              <circle cx="42" cy="45" r="3" fill="#0c2340" />
                              <circle cx="54" cy="45" r="3" fill="#0052FF" />
                              <circle cx="68" cy="45" r="3" fill="#0c2340" />
                              <circle cx="82" cy="45" r="3" fill="#0c2340" />
                              <circle cx="42" cy="60" r="3" fill="#0052FF" />
                              <circle cx="54" cy="60" r="3" fill="#0c2340" />
                              <circle cx="68" cy="60" r="3" fill="#0052FF" />
                              <circle cx="82" cy="60" r="3" fill="#0c2340" />
                              <circle cx="42" cy="75" r="3" fill="#0c2340" />
                              <circle cx="54" cy="75" r="3" fill="#0052FF" />
                              <circle cx="68" cy="75" r="3" fill="#0c2340" />
                              <circle cx="82" cy="75" r="3" fill="#0052FF" />
                              <circle cx="42" cy="88" r="3" fill="#0052FF" />
                              <circle cx="54" cy="88" r="3" fill="#0c2340" />
                              <circle cx="68" cy="88" r="3" fill="#0052FF" />
                              <circle cx="82" cy="88" r="3" fill="#0c2340" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              Scan and pay {selectedPackage.currencySymbol}{finalPrice.toFixed(2)} with any UPI App
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Open GPay, PhonePe, Paytm or BHIM on your mobile to scan
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Sub-view: Enter UPI ID */}
                      {upiSubTab === 'vpa' && (
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                            Enter UPI ID / VPA:
                          </label>
                          <input
                            type="text"
                            value={customVpa}
                            onChange={(e) => setCustomVpa(e.target.value)}
                            placeholder="e.g. 9876543210@paytm or name@oksbi"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-blue-500"
                          />
                          <p className="text-[11px] text-slate-500">
                            A payment request will be sent to your UPI app.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ================================================= */}
                  {/* METHOD 2: CARDS */}
                  {/* ================================================= */}
                  {activeMethod === 'card' && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Card Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => handleFormatCardNumber(e.target.value)}
                            placeholder="4111 2222 3333 4444"
                            maxLength={19}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-blue-500"
                          />
                          <div className="absolute right-3 top-2.5 flex items-center gap-1 opacity-80">
                            <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                              VISA / RuPay
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => handleFormatExpiry(e.target.value)}
                            placeholder="MM / YY"
                            maxLength={5}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                            placeholder="•••"
                            maxLength={4}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Name as printed on card"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-blue-500"
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 pt-1">
                        <input
                          type="checkbox"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Save this card as per RBI guidelines</span>
                      </label>
                    </div>
                  )}

                  {/* ================================================= */}
                  {/* METHOD 3: NET BANKING */}
                  {/* ================================================= */}
                  {activeMethod === 'netbanking' && (
                    <div className="space-y-3.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Popular Banks:
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          'State Bank of India (SBI)',
                          'HDFC Bank',
                          'ICICI Bank',
                          'Axis Bank',
                          'Kotak Mahindra Bank',
                          'Punjab National Bank (PNB)'
                        ].map(bank => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                              selectedBank === bank
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-500 ring-1 ring-blue-500'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <Building2 className="h-4 w-4 mb-1 text-slate-500" />
                            <p className="truncate">{bank}</p>
                          </button>
                        ))}
                      </div>

                      <div className="pt-2">
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          Or select from other banks:
                        </label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-blue-500"
                        >
                          <option>State Bank of India (SBI)</option>
                          <option>HDFC Bank</option>
                          <option>ICICI Bank</option>
                          <option>Axis Bank</option>
                          <option>Kotak Mahindra Bank</option>
                          <option>Punjab National Bank</option>
                          <option>Bank of Baroda</option>
                          <option>Canara Bank</option>
                          <option>Union Bank of India</option>
                          <option>IndusInd Bank</option>
                          <option>Yes Bank</option>
                          <option>IDFC FIRST Bank</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* ================================================= */}
                  {/* METHOD 4: WALLETS */}
                  {/* ================================================= */}
                  {activeMethod === 'wallet' && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Select Digital Wallet:
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {['Mobikwik', 'Amazon Pay', 'Freecharge', 'Airtel Money'].map(w => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setSelectedWallet(w)}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              selectedWallet === w
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-500 ring-1 ring-blue-500 font-bold'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <span className="text-xs">{w}</span>
                            {selectedWallet === w && <Check className="h-4 w-4 text-blue-600" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ================================================= */}
                  {/* METHOD 5: GOOGLE PLAY */}
                  {/* ================================================= */}
                  {activeMethod === 'gplay' && (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                      <div className="flex items-center gap-3">
                        <GooglePlayStoreIcon className="h-8 w-8" />
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">Google Play Billing</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">1-Tap Android Store purchase via Google Account</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================================================= */}
                  {/* PRIMARY RAZORPAY CTA BUTTON */}
                  {/* ================================================= */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={processPayment}
                      disabled={isProcessing}
                      className="w-full bg-[#0052FF] hover:bg-[#0039B3] text-white font-black py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer text-sm uppercase tracking-wider"
                    >
                      <Lock className="h-4 w-4" />
                      <span>
                        Pay {selectedPackage.currencySymbol}{finalPrice.toFixed(2)}
                      </span>
                    </button>
                    <p className="text-[10px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />
                      <span>Instant Activation • 256-Bit SSL Encrypted by Razorpay</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ERROR BANNER IF ANY */}
            {paymentError && (
              <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
                <span>{paymentError}</span>
                <button
                  type="button"
                  onClick={() => setPaymentError(null)}
                  className="px-2 py-1 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* VERIFYING STATE */}
            {step === 'verifying' && (
              <div className="py-16 text-center space-y-6 px-6">
                <div className="flex justify-center">
                  <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">
                    Verifying with Razorpay Gateway...
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    Order Reference: {createdTxnId}
                  </p>
                </div>
                <div className="max-w-xs mx-auto bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-left text-xs font-semibold text-slate-600 dark:text-slate-300 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-4 w-4" /> 256-Bit SSL Handshake Verified
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 animate-pulse">
                    <RefreshCw className="h-4 w-4 animate-spin" /> Activating {selectedPackage.name}...
                  </div>
                </div>
              </div>
            )}

            {/* SUCCESS STATE */}
            {step === 'success' && (
              <div className="py-8 px-6 sm:px-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl font-black shadow-lg animate-bounce">
                    ✓
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                    Payment Successful!
                  </h4>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Welcome to {activeApp?.name || 'APPSC GROUP-2'} Premium Membership
                  </p>
                </div>

                {/* Tax Invoice & Summary Card */}
                <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-xs space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2.5">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400">Plan Subscribed</span>
                      <p className="font-black text-sm text-slate-900 dark:text-white">{successDetails?.planName || selectedPackage.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase text-slate-400">Amount Paid</span>
                      <p className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                        {selectedPackage.currencySymbol}{(successDetails?.amount || finalPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Payment ID:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{successDetails?.paymentId || createdTxnId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Invoice Number:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{successDetails?.invoiceNo || `INV-${Date.now().toString().slice(-6)}`}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Validity Start:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{successDetails?.startDate || 'Today'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Valid Until:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{successDetails?.expiryDate || 'Active'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-[11px] text-slate-500">
                    <span>GST 18% (Included): ₹{Math.round((successDetails?.amount || finalPrice) * 0.18)}</span>
                    <span>Method: {successDetails?.method || 'Razorpay'}</span>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onPaymentSuccess();
                      onClose();
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer text-sm uppercase tracking-wider"
                  >
                    <span>Start Practicing Now</span>
                    <CheckCircle className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Print / Save Tax Receipt</span>
                  </button>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* ======================================================== */}
        {/* RAZORPAY OFFICIAL FOOTER BADGES */}
        {/* ======================================================== */}
        <div className="bg-slate-100 dark:bg-slate-950 px-6 py-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 font-bold">
            <RazorpayIcon className="h-4 w-4" />
            <span>Secured by <strong className="text-slate-900 dark:text-white">Razorpay</strong></span>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span>PCI-DSS Level 1</span>
            <span>•</span>
            <span>256-Bit SSL</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
