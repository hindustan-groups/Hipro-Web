"use client";

declare global {
  interface Window {
    initSendOTP?: (config: Record<string, any>) => void;
    sendOtp?: (
      identifier: string,
      success?: (data: any) => void,
      failure?: (error: any) => void
    ) => void;
    verifyOtp?: (
      otp: string | number,
      success?: (data: any) => void,
      failure?: (error: any) => void,
      reqId?: string
    ) => void;
    retryOtp?: (
      channel: string | null,
      success?: (data: any) => void,
      failure?: (error: any) => void,
      reqId?: string
    ) => void;
  }
}

const WIDGET_ID =
  process.env.NEXT_PUBLIC_MSG91_WIDGET_ID?.trim() || "366b426d6d35343439373933";
const TOKEN_AUTH = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH?.trim() || "";

let loadPromise: Promise<void> | null = null;

export function isMsg91WidgetConfigured(): boolean {
  return Boolean(WIDGET_ID && TOKEN_AUTH);
}

export function initMsg91Widget(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("MSG91 widget can only run in browser."));
  }
  if (!isMsg91WidgetConfigured()) {
    return Promise.reject(new Error("MSG91 widget tokenAuth is not configured."));
  }
  if (typeof window.sendOtp === "function" && typeof window.verifyOtp === "function") {
    return Promise.resolve();
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const urls = [
      "https://verify.msg91.com/otp-provider.js",
      "https://verify.phone91.com/otp-provider.js",
    ];
    let idx = 0;

    const attempt = () => {
      const script = document.createElement("script");
      script.src = urls[idx];
      script.async = true;
      script.onload = () => {
        if (typeof window.initSendOTP === "function") {
          window.initSendOTP({
            widgetId: WIDGET_ID,
            tokenAuth: TOKEN_AUTH,
            exposeMethods: true,
            success: () => {},
            failure: () => {},
          });
          // Give widget script a tick to expose sendOtp / verifyOtp
          setTimeout(() => resolve(), 150);
        } else {
          reject(new Error("MSG91 initSendOTP not available after script load."));
        }
      };
      script.onerror = () => {
        idx += 1;
        if (idx < urls.length) {
          attempt();
        } else {
          loadPromise = null;
          reject(new Error("Failed to load MSG91 OTP script."));
        }
      };
      document.head.appendChild(script);
    };

    attempt();
  });

  return loadPromise;
}

export async function sendWidgetOtp(phone10Digits: string): Promise<void> {
  await initMsg91Widget();
  return new Promise((resolve, reject) => {
    if (typeof window.sendOtp !== "function") {
      reject(new Error("MSG91 sendOtp method is not ready."));
      return;
    }
    window.sendOtp(
      `91${phone10Digits}`,
      () => resolve(),
      (err: any) => reject(new Error(err?.message || "Failed to send OTP via MSG91."))
    );
  });
}

export async function verifyWidgetOtp(otp: string): Promise<string> {
  await initMsg91Widget();
  return new Promise((resolve, reject) => {
    if (typeof window.verifyOtp !== "function") {
      reject(new Error("MSG91 verifyOtp method is not ready."));
      return;
    }
    window.verifyOtp(
      otp,
      (data: any) => {
        const token =
          (typeof data === "string" ? data : null) ||
          data?.["access-token"] ||
          data?.accessToken ||
          data?.token ||
          data?.message;
        if (!token || typeof token !== "string") {
          reject(new Error("MSG91 did not return an access-token."));
          return;
        }
        resolve(token);
      },
      (err: any) => reject(new Error(err?.message || "Incorrect OTP."))
    );
  });
}
