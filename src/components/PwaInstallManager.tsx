import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISSED_KEY = "pwaDismissed";
const SESSION_SHOWN_KEY = "pwaInstallPromptShown";

const isAllowedInstallRoute = (path: string) =>
  path.startsWith("/admin") || path.startsWith("/vendor");

const getManifestForPath = (path: string) => {
  if (path.startsWith("/vendor")) {
    return "/manifest-vendor.json";
  }

  if (path.startsWith("/admin")) {
    return "/manifest-admin.json";
  }

  return null;
};

const getInstallTitle = (path: string) =>
  path.startsWith("/vendor") ? "SBF Vendor" : "SBF Admin";

const ensureThemeColorMeta = (value: string) => {
  let themeMeta = document.querySelector(
    'meta[name="theme-color"]',
  ) as HTMLMetaElement | null;

  if (!themeMeta) {
    themeMeta = document.createElement("meta");
    themeMeta.name = "theme-color";
    document.head.appendChild(themeMeta);
  }

  themeMeta.content = value;
};

const setManifestLink = (manifestPath: string | null) => {
  const existing = document.querySelector(
    'link[rel="manifest"]',
  ) as HTMLLinkElement | null;

  if (!manifestPath) {
    if (existing) {
      existing.remove();
    }
    return;
  }

  if (existing) {
    existing.href = manifestPath;
    return;
  }

  const link = document.createElement("link");
  link.rel = "manifest";
  link.href = manifestPath;
  document.head.appendChild(link);
};

const PwaInstallManager = () => {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const allowedRoute = useMemo(
    () => isAllowedInstallRoute(location.pathname),
    [location.pathname],
  );
  const installTitle = useMemo(
    () => getInstallTitle(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    const manifestPath = getManifestForPath(location.pathname);
    setManifestLink(manifestPath);
    ensureThemeColorMeta(manifestPath ? "#0f172a" : "#ffffff");
  }, [location.pathname]);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      setDeferredPrompt(promptEvent);

      const currentPath = window.location.pathname;
      const isAllowed = isAllowedInstallRoute(currentPath);
      const dismissed = localStorage.getItem(DISMISSED_KEY) === "true";
      const alreadyShownThisSession =
        sessionStorage.getItem(SESSION_SHOWN_KEY) === "true";

      if (!isAllowed || dismissed || alreadyShownThisSession) {
        setIsVisible(false);
        return;
      }

      setIsVisible(true);
      sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
    };

    const onAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      localStorage.removeItem(DISMISSED_KEY);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (!allowedRoute) {
      setIsVisible(false);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    const dismissed = localStorage.getItem(DISMISSED_KEY) === "true";
    const alreadyShownThisSession =
      sessionStorage.getItem(SESSION_SHOWN_KEY) === "true";

    if (dismissed || alreadyShownThisSession) {
      return;
    }

    setIsVisible(true);
    sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
  }, [allowedRoute, deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsVisible(false);

    if (result.outcome === "dismissed") {
      localStorage.setItem(DISMISSED_KEY, "true");
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  if (!allowedRoute || !isVisible) {
    return null;
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[95] bg-black/30 backdrop-blur-[1px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Install app"
        className="fixed inset-x-0 bottom-0 z-[100] mx-auto w-full max-w-xl rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-slate-900">
              Install {installTitle}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Add this panel to your home screen for faster access and offline
              loading.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-md px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Dismiss install popup"
          >
            Not now
          </button>
        </div>
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Install App
        </button>
      </div>
    </>
  );
};

export default PwaInstallManager;
