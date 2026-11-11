import { SiteContent } from '../types/content';
import { defaultContent } from '../data/defaultContent';
import { idbGet, idbSet } from './idb';

const STORAGE_KEY = 'elysian_romantic_content_v1';
const SESSION_KEY = 'elysian_admin_authenticated';
export const LETTER_DRAFT_KEY = 'elysian_letter_live_draft';
export const LETTER_REVISIONS_KEY = 'elysian_letter_revisions_v1';
export const LETTER_EMERGENCY_KEY = 'elysian_letter_emergency_backup';

export interface BackupItem {
  filename: string;
  timestamp: number;
  size: number;
  photoCount: number;
  letterParagraphCount: number;
  welcomeTitle: string;
}

export interface LetterRevision {
  timestamp: number;
  dateStr: string;
  paragraphs: { id: string; text: string }[];
  salutation?: string;
  signature?: string;
  signee?: string;
  wordCount: number;
}

export function hasCustomLetter(data: any): boolean {
  if (!data || !data.slideThree) return false;
  const paras = data.slideThree.paragraphs || [];
  const draftParas = data.slideThree.draftParagraphs || [];
  const check = (list: any[]) =>
    Array.isArray(list) &&
    list.some((p: any) => {
      const text = typeof p === 'string' ? p : p?.text;
      return (
        text &&
        text.trim().length > 0 &&
        !text.startsWith('[This is your personal letter') &&
        !text.startsWith('[Save your letter') &&
        !text.startsWith('[You can choose')
      );
    });
  return check(paras) || check(draftParas);
}

/**
 * Deep scanner that checks all browser storage (localStorage, sessionStorage, IndexedDB)
 * for any previously saved personal letter that might have been hidden by a server reset.
 */
export async function scanBrowserForRecoverableLetter(): Promise<{
  source: string;
  timestamp?: number;
  paragraphs: { id: string; text: string }[];
  salutation?: string;
  signature?: string;
  signee?: string;
} | null> {
  // 1. Check dedicated letter draft key
  try {
    const draft = localStorage.getItem(LETTER_DRAFT_KEY);
    if (draft) {
      const parsed = JSON.parse(draft);
      if (hasCustomLetter({ slideThree: parsed })) {
        return {
          source: 'Live Browser Draft',
          paragraphs: parsed.paragraphs || [],
          salutation: parsed.salutation,
          signature: parsed.signature,
          signee: parsed.signee,
        };
      }
    }
  } catch (_) {}

  // 2. Check letter revisions history
  try {
    const revs = localStorage.getItem(LETTER_REVISIONS_KEY);
    if (revs) {
      const list: LetterRevision[] = JSON.parse(revs);
      if (Array.isArray(list) && list.length > 0) {
        const best = list[0];
        if (best.paragraphs && best.paragraphs.length > 0) {
          return {
            source: `Revision History (${best.dateStr})`,
            timestamp: best.timestamp,
            paragraphs: best.paragraphs,
            salutation: best.salutation,
            signature: best.signature,
            signee: best.signee,
          };
        }
      }
    }
  } catch (_) {}

  // 3. Check emergency backup key
  try {
    const emerg = localStorage.getItem(LETTER_EMERGENCY_KEY);
    if (emerg) {
      const parsed = JSON.parse(emerg);
      if (hasCustomLetter({ slideThree: parsed })) {
        return {
          source: 'Emergency Browser Backup',
          paragraphs: parsed.paragraphs || [],
          salutation: parsed.salutation,
          signature: parsed.signature,
          signee: parsed.signee,
        };
      }
    }
  } catch (_) {}

  // 4. Scan all localStorage keys
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      const val = localStorage.getItem(k);
      if (!val || val.length < 30) continue;
      try {
        const parsed = JSON.parse(val);
        if (hasCustomLetter(parsed)) {
          return {
            source: `Browser Storage (${k})`,
            paragraphs: parsed.slideThree.paragraphs || [],
            salutation: parsed.slideThree.salutation,
            signature: parsed.slideThree.signature,
            signee: parsed.slideThree.signee,
          };
        }
      } catch (_) {}
    }
  } catch (_) {}

  // 5. Check IndexedDB
  try {
    const fromIdb = await idbGet<SiteContent>();
    if (hasCustomLetter(fromIdb)) {
      return {
        source: 'IndexedDB Local Cache',
        paragraphs: fromIdb?.slideThree.paragraphs || [],
        salutation: fromIdb?.slideThree.salutation,
        signature: fromIdb?.slideThree.signature,
        signee: fromIdb?.slideThree.signee,
      };
    }
  } catch (_) {}

  return null;
}

export async function fetchSiteContent(): Promise<SiteContent> {
  // Pre-inspect client storage for existing custom letter
  let clientHasLetter = false;
  let clientLetterData: any = null;

  try {
    const idbData = await idbGet<SiteContent>();
    if (hasCustomLetter(idbData)) {
      clientHasLetter = true;
      clientLetterData = idbData?.slideThree;
    }
  } catch (_) {}

  if (!clientHasLetter) {
    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (hasCustomLetter(parsed)) {
          clientHasLetter = true;
          clientLetterData = parsed.slideThree;
        }
      }
    } catch (_) {}
  }

  if (!clientHasLetter) {
    try {
      const draft = localStorage.getItem(LETTER_DRAFT_KEY);
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        if (hasCustomLetter({ slideThree: parsedDraft })) {
          clientHasLetter = true;
          clientLetterData = parsedDraft;
        }
      }
    } catch (_) {}
  }

  // 1. Try server first (authoritative database)
  try {
    const res = await fetch('/api/content', { credentials: 'same-origin' });
    if (res.ok) {
      const serverData = await res.json();
      if (serverData && serverData.global && serverData.welcome) {
        // CRITICAL PROTECTION: If client had a custom letter, but server returned placeholder text,
        // PRESERVE the client's letter and sync it back to server disk!
        if (clientHasLetter && clientLetterData && !hasCustomLetter(serverData)) {
          console.warn('[Storage] Preserved custom letter found in client storage!');
          serverData.slideThree = {
            ...serverData.slideThree,
            ...clientLetterData,
            paragraphs: clientLetterData.paragraphs || serverData.slideThree.paragraphs,
          };
          // Sync merged letter back to server database in background
          fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serverData),
          }).catch((e) => console.warn('Sync back error:', e));
        }

        // Cache in background: IndexedDB
        idbSet(serverData).catch((e) => console.warn('IDB cache warn:', e));

        // Cache in background: localStorage with try/catch
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
        } catch (_) {}

        // Cache dedicated letter draft
        if (serverData.slideThree) {
          try {
            localStorage.setItem(LETTER_DRAFT_KEY, JSON.stringify(serverData.slideThree));
          } catch (_) {}
        }

        return serverData;
      }
    }
  } catch (err) {
    console.warn('Server fetch error, falling back to local storage', err);
  }

  // 2. Fallback to IndexedDB
  try {
    const fromIdb = await idbGet<SiteContent>();
    if (fromIdb && fromIdb.global && fromIdb.welcome) {
      return fromIdb;
    }
  } catch (err) {
    console.warn('IndexedDB read failed:', err);
  }

  // 3. Fallback to localStorage
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      return {
        ...defaultContent,
        ...parsed,
        global: { ...defaultContent.global, ...(parsed.global || {}) },
        welcome: { ...defaultContent.welcome, ...(parsed.welcome || {}) },
        slideOne: { ...defaultContent.slideOne, ...(parsed.slideOne || {}) },
        slideTwo: { ...defaultContent.slideTwo, ...(parsed.slideTwo || {}) },
        slideThree: { ...defaultContent.slideThree, ...(parsed.slideThree || {}) },
      };
    }
  } catch (err) {
    console.error('Failed to read localStorage:', err);
  }

  return defaultContent;
}

export async function saveSiteContent(content: SiteContent): Promise<boolean> {
  // 1. Immediately cache in IndexedDB (no quota limitations)
  try {
    await idbSet(content);
  } catch (e) {
    console.warn('Failed to cache in IndexedDB:', e);
  }

  // 2. Try to save full content to localStorage as extra redundancy
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  } catch (_) {}

  // 3. ALWAYS save dedicated letter draft (small payload, NEVER fails quota!)
  if (content.slideThree) {
    try {
      localStorage.setItem(LETTER_DRAFT_KEY, JSON.stringify(content.slideThree));
      localStorage.setItem(LETTER_EMERGENCY_KEY, JSON.stringify(content.slideThree));

      // Append to revision history (keep last 20)
      const paras = content.slideThree.paragraphs || [];
      const wordCount = paras.reduce((acc, p) => acc + (p.text || '').split(/\s+/).filter(Boolean).length, 0);
      const newRev: LetterRevision = {
        timestamp: Date.now(),
        dateStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        paragraphs: paras,
        salutation: content.slideThree.salutation,
        signature: content.slideThree.signature,
        signee: content.slideThree.signee,
        wordCount,
      };
      const existingRevsRaw = localStorage.getItem(LETTER_REVISIONS_KEY);
      const existingRevs: LetterRevision[] = existingRevsRaw ? JSON.parse(existingRevsRaw) : [];
      const updatedRevs = [newRev, ...existingRevs.filter((r) => r.paragraphs?.[0]?.text !== paras[0]?.text)].slice(0, 20);
      localStorage.setItem(LETTER_REVISIONS_KEY, JSON.stringify(updatedRevs));
    } catch (e) {
      console.warn('Failed to save letter draft backup:', e);
    }
  }

  // 4. Push to server API (persisted to disk with automatic versioned backup)
  try {
    const res = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not sync to server database:', err);
    return false;
  }
}

export async function fetchBackups(): Promise<BackupItem[]> {
  try {
    const res = await fetch('/api/backups');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch backups:', err);
  }
  return [];
}

export async function restoreBackup(filename: string): Promise<SiteContent | null> {
  try {
    const res = await fetch('/api/backups/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename }),
    });
    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        // Cache restored data in IndexedDB & localStorage
        await idbSet(result.data);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
        } catch (_) {}
        return result.data;
      }
    }
  } catch (err) {
    console.error('Failed to restore backup:', err);
  }
  return null;
}

export async function importBackup(data: SiteContent): Promise<SiteContent | null> {
  try {
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        await idbSet(result.data);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
        } catch (_) {}
        return result.data;
      }
    }
  } catch (err) {
    console.error('Failed to import backup:', err);
  }
  return null;
}

const SITE_ACCESS_KEY = 'elysian_site_access_unlocked';

export function checkIsSiteUnlocked(): boolean {
  return sessionStorage.getItem(SITE_ACCESS_KEY) === 'true';
}

export function setSiteUnlocked(val: boolean): void {
  if (val) {
    sessionStorage.setItem(SITE_ACCESS_KEY, 'true');
  } else {
    sessionStorage.removeItem(SITE_ACCESS_KEY);
  }
}

export async function verifySitePassword(
  enteredPassword: string,
  expectedPassword: string,
  adminPin?: string
): Promise<boolean> {
  const cleanEntered = enteredPassword.trim();
  const cleanExpected = expectedPassword.trim();
  const cleanAdmin = (adminPin || '').trim();

  // Try server endpoint first
  try {
    const res = await fetch('/api/auth/verify-site-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: cleanEntered }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.valid) {
        setSiteUnlocked(true);
        return true;
      }
    }
  } catch (e) {
    // Network or server offline, fall through to client comparison
  }

  // Validate against configured sitePassword or adminPin
  const isValid = cleanEntered === cleanExpected || (cleanAdmin !== '' && cleanEntered === cleanAdmin);
  if (isValid) {
    setSiteUnlocked(true);
  }
  return isValid;
}

export function checkIsAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

export function setAuthenticated(val: boolean): void {
  if (val) {
    sessionStorage.setItem(SESSION_KEY, 'true');
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export async function verifyAdminPin(enteredPin: string, expectedPin: string): Promise<boolean> {
  // Try server endpoint
  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: enteredPin }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.valid) {
        setAuthenticated(true);
        return true;
      }
    }
  } catch (e) {
    // server not running or network issue, fallback to checking expectedPin
  }

  const isValid = enteredPin.trim() === expectedPin.trim();
  if (isValid) {
    setAuthenticated(true);
  }
  return isValid;
}

export function convertFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Compress/resize if very large image to save memory & localStorage
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // export as high-quality jpeg
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
