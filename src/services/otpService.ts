/**
 * Frontend OTP & Authentication Service
 * Handles API calls, Web OTP API auto-fill, real-time status polling, and multi-channel fallbacks.
 */

export interface OtpLogEntry {
  timestamp: string;
  phase: string;
  requestId: string;
  provider: string;
  latencyMs: number;
  deliveryStatus: string;
  errorCode: string | null;
  details?: string;
}

export interface OtpSendResponse {
  success: boolean;
  requestId: string;
  status: 'queued' | 'sending' | 'provider_accepted' | 'delivered' | 'failed';
  message: string;
  maskedPhone: string;
  channel: 'sms' | 'voice' | 'whatsapp' | 'email';
  expiresInSeconds: number;
  resendAvailableInSeconds: number;
  logs: OtpLogEntry[];
}

export interface OtpVerifyResponse {
  success: boolean;
  message: string;
  user?: {
    uid: string;
    phoneNumber: string;
    email?: string;
    displayName?: string;
    createdAt: string;
  };
  errorCode?: string;
  remainingAttempts?: number;
}

export interface OtpStatusResponse {
  success: boolean;
  requestId: string;
  status: 'queued' | 'sending' | 'provider_accepted' | 'delivered' | 'failed' | 'verified' | 'expired';
  channel: 'sms' | 'voice' | 'whatsapp' | 'email';
  provider: string;
  logs: OtpLogEntry[];
  deliveryTimeMs?: number;
  errorMessage?: string;
}

/**
 * 1. Request OTP via Backend Endpoint
 */
export async function sendOtpApi(
  phoneNumber: string, 
  channel: 'sms' | 'voice' | 'whatsapp' | 'email' = 'sms',
  emailAddress?: string
): Promise<OtpSendResponse> {
  const response = await fetch('/api/otp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber,
      channel,
      emailAddress,
      clientTimestamp: new Date().toISOString(),
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send verification code.');
  }
  return data;
}

/**
 * 2. Verify OTP via Backend Endpoint
 */
export async function verifyOtpApi(
  requestId: string,
  phoneNumber: string,
  otpCode: string
): Promise<OtpVerifyResponse> {
  const response = await fetch('/api/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestId,
      phoneNumber,
      otpCode,
      clientTimestamp: new Date().toISOString(),
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Verification failed.');
  }
  return data;
}

/**
 * 3. Poll Real-Time Delivery Status & Correlated Logs
 */
export async function pollOtpStatusApi(requestId: string): Promise<OtpStatusResponse> {
  const response = await fetch(`/api/otp/status?requestId=${encodeURIComponent(requestId)}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Could not fetch status.');
  }
  return data;
}

/**
 * 4. Fetch System-Wide OTP Diagnostics (Latency, Failover rate, Provider health)
 */
export async function fetchOtpDiagnosticsApi(): Promise<any> {
  const response = await fetch('/api/otp/diagnostics');
  return await response.json();
}

/**
 * 5. Web OTP API Auto-Fill Helper (Supported in Chrome Android & Web)
 */
export async function listenForWebOtp(onCodeReceived: (code: string) => void): Promise<(() => void) | null> {
  if (typeof window === 'undefined' || !('OTPCredential' in window)) {
    return null;
  }

  const ac = new AbortController();

  try {
    const otp: any = await (navigator.credentials as any).get({
      otp: { transport: ['sms'] },
      signal: ac.signal,
    });

    if (otp && otp.code) {
      onCodeReceived(otp.code);
    }
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      console.warn('Web OTP API notice:', err.message || err);
    }
  }

  return () => {
    ac.abort();
  };
}
