import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'website-content.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const MASTER_BACKUP_FILE = path.join(DATA_DIR, 'permanent-master-content.json');

// Ensure data folder and backup folder exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Detect if slideThree contains actual user custom letter (not default placeholders)
function hasCustomLetter(data: any): boolean {
  if (!data?.slideThree) return false;
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

// Detect if a content payload contains actual user custom content (not default placeholder text)
function isUserCustomized(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  const isDefaultHeading = !data.welcome?.heading || data.welcome?.heading === 'A Celebration of You';
  const isDefaultSlideOne = !data.slideOne?.heading || (data.slideOne?.heading === "Why You're Special" &&
    data.slideOne?.paragraphs?.[0]?.includes('[Write your personal'));
  const hasPhotos = Array.isArray(data.slideTwo?.photos) && data.slideTwo.photos.length > 0;
  const hasLetter = hasCustomLetter(data);
  return !isDefaultHeading || !isDefaultSlideOne || hasPhotos || hasLetter;
}

// Helper to save a versioned backup and prune to latest 50
function saveBackup(data: any, label = 'auto'): string | null {
  try {
    if (!data) return null;
    const timestamp = Date.now();
    const backupFilename = `backup-${timestamp}-${label}.json`;
    const backupPath = path.join(BACKUP_DIR, backupFilename);
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf-8');

    // Prune old backups, keep last 50
    const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.json'));
    if (files.length > 50) {
      files.sort(); // timestamps sort chronologically
      const toDelete = files.slice(0, files.length - 50);
      for (const f of toDelete) {
        try {
          fs.unlinkSync(path.join(BACKUP_DIR, f));
        } catch (_) {}
      }
    }
    return backupFilename;
  } catch (err) {
    console.error('Failed to create backup:', err);
    return null;
  }
}

// Initialize Master Recovery Backup
const recoveryMasterFile = path.join(BACKUP_DIR, 'MASTER-RECOVERED-USER-CONTENT.json');
if (!fs.existsSync(MASTER_BACKUP_FILE) && fs.existsSync(recoveryMasterFile)) {
  try {
    fs.copyFileSync(recoveryMasterFile, MASTER_BACKUP_FILE);
  } catch (_) {}
}

// On startup: Ensure DATA_FILE is intact and contains user custom messages and letter
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!isUserCustomized(parsed) && fs.existsSync(MASTER_BACKUP_FILE)) {
      console.log('[Server Startup] Restoring user content from permanent master backup');
      fs.copyFileSync(MASTER_BACKUP_FILE, DATA_FILE);
    } else {
      // If DATA_FILE has a custom letter, ensure MASTER_BACKUP_FILE preserves it
      if (hasCustomLetter(parsed) && fs.existsSync(MASTER_BACKUP_FILE)) {
        try {
          const masterRaw = fs.readFileSync(MASTER_BACKUP_FILE, 'utf-8');
          const masterParsed = JSON.parse(masterRaw);
          masterParsed.slideThree = parsed.slideThree;
          fs.writeFileSync(MASTER_BACKUP_FILE, JSON.stringify(masterParsed, null, 2), 'utf-8');
        } catch (_) {}
      } else if (!hasCustomLetter(parsed) && fs.existsSync(MASTER_BACKUP_FILE)) {
        // If MASTER_BACKUP_FILE has a custom letter, restore slideThree into DATA_FILE
        try {
          const masterRaw = fs.readFileSync(MASTER_BACKUP_FILE, 'utf-8');
          const masterParsed = JSON.parse(masterRaw);
          if (hasCustomLetter(masterParsed)) {
            parsed.slideThree = masterParsed.slideThree;
            fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
          }
        } catch (_) {}
      }
      saveBackup(parsed, 'startup');
      if (isUserCustomized(parsed)) {
        fs.writeFileSync(MASTER_BACKUP_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
      }
    }
  } catch (err) {
    console.error('Failed to check startup data:', err);
    if (fs.existsSync(MASTER_BACKUP_FILE)) {
      fs.copyFileSync(MASTER_BACKUP_FILE, DATA_FILE);
    }
  }
} else if (fs.existsSync(MASTER_BACKUP_FILE)) {
  fs.copyFileSync(MASTER_BACKUP_FILE, DATA_FILE);
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '50mb' }));

  // Helper to read data with multi-layer fallback
  const getContent = () => {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {
        console.error('Error reading data file:', e);
      }
    }
    if (fs.existsSync(MASTER_BACKUP_FILE)) {
      try {
        const raw = fs.readFileSync(MASTER_BACKUP_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (_) {}
    }
    return null;
  };

  // API endpoints
  app.get('/api/content', (req, res) => {
    const data = getContent();
    if (data) {
      res.json(data);
    } else {
      res.status(500).json({ error: 'Database initializing' });
    }
  });

  app.post('/api/content', (req, res) => {
    try {
      const incoming = req.body;
      if (!incoming || typeof incoming !== 'object') {
        return res.status(400).json({ error: 'Invalid content payload' });
      }

      const existing = getContent();

      // Server-Side Anti-Wipe Protection:
      // If existing database has user custom content, and incoming content has default placeholders
      // (and it is NOT an explicit user reset), protect the custom content!
      let finalContent = incoming;
      if (existing && isUserCustomized(existing) && !incoming.forceReset) {
        if (!isUserCustomized(incoming)) {
          console.warn('[Server Guard] Blocked attempt to overwrite custom user content with defaults!');
          finalContent = {
            ...incoming,
            welcome: isUserCustomized({ welcome: incoming.welcome }) ? incoming.welcome : existing.welcome,
            slideOne: isUserCustomized({ slideOne: incoming.slideOne }) ? incoming.slideOne : existing.slideOne,
            slideTwo: {
              ...incoming.slideTwo,
              photos: (incoming.slideTwo?.photos && incoming.slideTwo.photos.length > 0)
                ? incoming.slideTwo.photos
                : existing.slideTwo?.photos || [],
            },
            slideThree: hasCustomLetter(incoming)
              ? incoming.slideThree
              : (hasCustomLetter(existing) ? existing.slideThree : incoming.slideThree),
          };
        }
      }

      // Safeguard: If existing had a custom letter, never allow a default placeholder payload to erase it
      if (existing && !incoming.forceReset) {
        if (!hasCustomLetter(finalContent) && hasCustomLetter(existing)) {
          console.warn('[Server Guard] Preserved existing custom letter against default placeholder payload');
          finalContent.slideThree = existing.slideThree;
        }
      }

      // Check existing content and save an automatic backup before overwriting
      if (existing) {
        saveBackup(existing, 'save');
      }

      // Safe atomic write using a temp file
      const tempFile = `${DATA_FILE}.tmp-${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(finalContent, null, 2), 'utf-8');
      fs.renameSync(tempFile, DATA_FILE);

      // Keep master permanent backup updated if custom
      if (isUserCustomized(finalContent)) {
        try {
          fs.writeFileSync(MASTER_BACKUP_FILE, JSON.stringify(finalContent, null, 2), 'utf-8');
        } catch (_) {}
      }

      console.log(`[Storage] Saved content successfully at ${new Date().toISOString()}`);
      res.json({ success: true, timestamp: Date.now(), data: finalContent });
    } catch (err: any) {
      console.error('Failed to write content:', err);
      res.status(500).json({ error: 'Failed to write content to storage' });
    }
  });

  // Backups endpoint: list available backups
  app.get('/api/backups', (req, res) => {
    try {
      if (!fs.existsSync(BACKUP_DIR)) {
        return res.json([]);
      }
      const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.json'));
      const list = files.map((filename) => {
        const stat = fs.statSync(path.join(BACKUP_DIR, filename));
        let photoCount = 0;
        let letterParagraphCount = 0;
        let welcomeTitle = '';
        let hasCustomContent = false;
        try {
          const raw = fs.readFileSync(path.join(BACKUP_DIR, filename), 'utf-8');
          const data = JSON.parse(raw);
          photoCount = data?.slideTwo?.photos?.length || 0;
          letterParagraphCount = data?.slideThree?.paragraphs?.length || 0;
          welcomeTitle = data?.welcome?.heading || '';
          hasCustomContent = isUserCustomized(data);
        } catch (_) {}

        return {
          filename,
          timestamp: stat.mtimeMs,
          size: stat.size,
          photoCount,
          letterParagraphCount,
          welcomeTitle,
          hasCustomContent,
        };
      });
      list.sort((a, b) => b.timestamp - a.timestamp);
      res.json(list);
    } catch (err) {
      console.error('Failed to read backups:', err);
      res.status(500).json({ error: 'Failed to read backups' });
    }
  });

  // Restore backup endpoint
  app.post('/api/backups/restore', (req, res) => {
    try {
      const { filename } = req.body;
      if (!filename || typeof filename !== 'string') {
        return res.status(400).json({ error: 'Invalid backup filename' });
      }
      const safeFilename = path.basename(filename);
      const targetBackup = path.join(BACKUP_DIR, safeFilename);

      if (!fs.existsSync(targetBackup)) {
        return res.status(404).json({ error: 'Backup file not found' });
      }

      // Save a backup of current before restoring
      const current = getContent();
      if (current) {
        saveBackup(current, 'pre-restore');
      }

      // Copy backup to DATA_FILE and MASTER_BACKUP_FILE
      const backupData = fs.readFileSync(targetBackup, 'utf-8');
      const parsed = JSON.parse(backupData);

      const tempFile = `${DATA_FILE}.tmp-${Date.now()}`;
      fs.writeFileSync(tempFile, backupData, 'utf-8');
      fs.renameSync(tempFile, DATA_FILE);

      if (isUserCustomized(parsed)) {
        fs.writeFileSync(MASTER_BACKUP_FILE, backupData, 'utf-8');
      }

      console.log(`[Storage] Restored from backup: ${safeFilename}`);
      res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error('Failed to restore backup:', err);
      res.status(500).json({ error: 'Failed to restore backup' });
    }
  });

  // Import backup endpoint with schema validation
  app.post('/api/import', (req, res) => {
    try {
      const payload = req.body;
      if (!payload || !payload.welcome || !payload.slideOne || !payload.slideTwo || !payload.slideThree) {
        return res.status(400).json({ error: 'Invalid backup format. Must contain all slides and settings.' });
      }

      const current = getContent();
      if (current) {
        saveBackup(current, 'pre-import');
      }

      const tempFile = `${DATA_FILE}.tmp-${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tempFile, DATA_FILE);

      if (isUserCustomized(payload)) {
        fs.writeFileSync(MASTER_BACKUP_FILE, JSON.stringify(payload, null, 2), 'utf-8');
      }

      console.log(`[Storage] Imported backup successfully`);
      res.json({ success: true, data: payload });
    } catch (err: any) {
      console.error('Failed to import backup:', err);
      res.status(500).json({ error: 'Failed to import backup' });
    }
  });

  // Direct JSON export endpoint
  app.get('/api/export', (req, res) => {
    const data = getContent();
    if (data) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="elysian-gift-content-${Date.now()}.json"`
      );
      res.send(JSON.stringify(data, null, 2));
    } else {
      res.status(404).json({ error: 'No content available to export' });
    }
  });

  app.post('/api/auth/verify', (req, res) => {
    const { pin } = req.body;
    const data = getContent();
    const currentPin = data?.global?.adminPin || '1211';
    if (pin && pin.trim() === currentPin.trim()) {
      res.json({ valid: true });
    } else {
      res.status(401).json({ valid: false, message: 'Invalid PIN' });
    }
  });

  app.post('/api/auth/verify-site-password', (req, res) => {
    const { password } = req.body;
    const data = getContent();
    const currentPassword = (data?.global?.sitePassword || data?.global?.adminPin || '1211').trim();
    const adminPin = (data?.global?.adminPin || '1211').trim();
    const cleanPassword = (password || '').trim();

    if (cleanPassword && (cleanPassword === currentPassword || cleanPassword === adminPin)) {
      res.json({ valid: true });
    } else {
      res.status(401).json({ valid: false, message: 'Invalid password' });
    }
  });

  // Vite integration
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});
