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

interface WidgetConfig {
  enabled: boolean;
  widgetId: string;
  tokenAuth: string;
}

const ENV_WIDGET_ID =
  process.env.NEXT_PUBLIC_MSG91_WIDGET_ID?.trim() || "366b426d6d35343439373933";
const ENV_TOKEN_AUTH = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH?.trim() || "";

let cachedConfig: WidgetConfig | null = ENV_TOKEN_AUTH
  ? { enabled: true, widgetId: ENV_WIDGET_ID, tokenAuth: ENV_TOKEN_AUTH }
  : null;
let configPromise: Promise<WidgetConfig> | null = null;
let loadPromise: Promise<void> | null = null;
let lastReqId: string | undefined;

function extractMsg91Error(err: any, fallback: string): string {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  return err?.message || err?.reason || err?.error || JSON.stringify(err) || fallback;
}

export async function resolveMsg91WidgetConfig(): Promise<WidgetConfig> {
  if (cachedConfig) return cachedConfig;
  if (configPromise) return configPromise;

  configPromise = fetch("/api/empanelment/otp/config", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((json) => {
      const cfg: WidgetConfig = {
        enabled: Boolean(json?.enabled && json?.widgetId && json?.tokenAuth),
        widgetId: json?.widgetId || ENV_WIDGET_ID,
        tokenAuth: json?.tokenAuth || "",
      };
      cachedConfig = cfg;
      return cfg;
    })
    .catch(() => {
      const cfg: WidgetConfig = { enabled: false, widgetId: ENV_WIDGET_ID, tokenAuth: "" };
      cachedConfig = cfg;
      return cfg;
    });

  return configPromise;
}

export async function isMsg91WidgetConfigured(): Promise<boolean> {
  const cfg = await resolveMsg91WidgetConfig();
  return cfg.enabled;
}

export async function initMsg91Widget(): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("MSG91 widget can only run in browser.");
  }
  const cfg = await resolveMsg91WidgetConfig();
  if (!cfg.enabled) {
    throw new Error("MSG91 widget tokenAuth is not configured.");
  }
  if (typeof window.sendOtp === "function" && typeof window.verifyOtp === "function") {
    return;
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const urls = [
      "https://verify.msg91.com/otp-provider.js",
      "https://verify.phone91.com/otp-provider.js",
    ];
    let idx = 0;

    const waitForMethods = () => {
      let elapsed = 0;
      const timer = setInterval(() => {
        if (typeof window.sendOtp === "function" && typeof window.verifyOtp === "function") {
          clearInterval(timer);
          resolve();
        } else if (elapsed >= 3000) {
          clearInterval(timer);
          loadPromise = null;
          reject(new Error("MSG91 OTP methods did not initialize in time."));
        }
        elapsed += 50;
      }, 50);
    };

    const attempt = () => {
      const script = document.createElement("script");
      script.src = urls[idx];
      script.async = true;
      script.onload = () => {
        if (typeof window.initSendOTP === "function") {
          window.initSendOTP({
            widgetId: cfg.widgetId,
            tokenAuth: cfg.tokenAuth,
            exposeMethods: true,
            success: () => {},
            failure: () => {},
          });
          waitForMethods();
        } else {
          loadPromise = null;
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
      (data: any) => {
        lastReqId = typeof data === "string" ? data : data?.message || data?.reqId;
        resolve();
      },
      (err: any) => {
        console.error("[MSG91 sendOtp error]", err);
        reject(new Error(extractMsg91Error(err, "Failed to send OTP via MSG91.")));
      }
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
      (err: any) => {
        console.error("[MSG91 verifyOtp error]", err);
        reject(new Error(extractMsg91Error(err, "Incorrect OTP.")));
      },
      lastReqId
    );
  });
}
