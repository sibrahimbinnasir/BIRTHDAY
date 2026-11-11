import React, { useRef, useState } from 'react';
import { SiteContent, GalleryPhoto } from '../../types/content';
import { convertFileToDataUrl } from '../../services/storage';
import {
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  RefreshCw,
  Plus,
  Eraser,
  CheckCircle,
} from 'lucide-react';

interface MemoriesEditorProps {
  content: SiteContent;
  onChange: (updated: SiteContent) => void;
}

export const MemoriesEditor: React.FC<MemoriesEditorProps> = ({ content, onChange }) => {
  const { slideTwo } = content;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingPhotoId, setReplacingPhotoId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleChange = (field: keyof typeof slideTwo, value: any) => {
    onChange({
      ...content,
      slideTwo: {
        ...slideTwo,
        [field]: value,
      },
    });
  };

  const handleUploadNewPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newPhotos: GalleryPhoto[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await convertFileToDataUrl(file);
        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          url: dataUrl,
          caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'New Memory',
          description: '',
          date: '',
          location: '',
        });
      }

      const updatedList = [...(slideTwo.photos || []), ...newPhotos];
      handleChange('photos', updatedList);
      showToast(`Uploaded ${newPhotos.length} photograph${newPhotos.length > 1 ? 's' : ''}`);
    } catch (err) {
      console.error('Failed to process uploaded photos:', err);
      showToast('Error uploading photo. Please check format and try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReplacePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingPhotoId) return;

    setUploading(true);
    try {
      const dataUrl = await convertFileToDataUrl(file);
      const updated = (slideTwo.photos || []).map((p) =>
        p.id === replacingPhotoId ? { ...p, url: dataUrl } : p
      );
      handleChange('photos', updated);
      showToast('Photograph replaced successfully');
    } catch (err) {
      console.error('Failed to replace photo:', err);
      showToast('Error replacing photograph');
    } finally {
      setUploading(false);
      setReplacingPhotoId(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const triggerReplace = (photoId: string) => {
    setReplacingPhotoId(photoId);
    replaceInputRef.current?.click();
  };

  const handleUpdatePhotoField = (
    id: string,
    field: keyof GalleryPhoto,
    value: string
  ) => {
    const updated = (slideTwo.photos || []).map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
    handleChange('photos', updated);
  };

  // Instant deletion without browser window.confirm (which fails in iframes)
  const handleDeletePhoto = (id: string) => {
    const updated = (slideTwo.photos || []).filter((p) => p.id !== id);
    handleChange('photos', updated);
    showToast('Photograph removed');
  };

  // Wipe caption, description, date and location for a photo
  const handleClearDetails = (id: string) => {
    const updated = (slideTwo.photos || []).map((p) =>
      p.id === id ? { ...p, caption: '', description: '', date: '', location: '' } : p
    );
    handleChange('photos', updated);
    showToast('Details cleared for this photo');
  };

  // Remove all photos / placeholders in one click
  const handleClearAllPhotos = () => {
    handleChange('photos', []);
    showToast('All photos and placeholders removed');
  };

  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    const list = [...(slideTwo.photos || [])];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    handleChange('photos', list);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-cormorant text-2xl font-medium text-[#fff7d6] mb-1">
          Slide 2 · Memories Gallery Manager
        </h3>
        <p className="font-sans-modern text-xs text-white/60">
          Upload your personal photographs, delete existing ones, or edit titles and stories.
        </p>
      </div>

      {/* Floating feedback toast */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-xs text-[#fff7d6] flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-[#e2be67]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleUploadNewPhotos}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplacePhoto}
        className="hidden"
      />

      {/* Slide Headings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
            Gallery Heading
          </label>
          <input
            type="text"
            value={slideTwo.heading}
            onChange={(e) => handleChange('heading', e.target.value)}
            placeholder="e.g. Our Cherished Moments"
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-white text-base font-cormorant focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
            Gallery Subtitle
          </label>
          <input
            type="text"
            value={slideTwo.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="e.g. A visual archive of our shared laughter"
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-white text-sm font-sans-modern focus:outline-none"
          />
        </div>
      </div>

      {/* Auto Scroll Speed Setting for Photos Gallery */}
      <div>
        <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
          Photos Auto-Scroll Speed
        </label>
        <div className="grid grid-cols-3 gap-2 max-w-sm">
          {[
            { label: 'Very Slow', val: 1 },
            { label: 'Gentle (Default)', val: 2 },
            { label: 'Standard', val: 3 },
          ].map((s) => (
            <button
              key={s.val}
              type="button"
              onClick={() => handleChange('autoScrollSpeed', s.val)}
              className={`py-2 px-3 rounded-lg text-xs font-sans-modern transition-all ${
                (slideTwo.autoScrollSpeed || 2) === s.val
                  ? 'bg-[#d4af37] text-black font-semibold shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Strip: Upload Photos + Delete All Placeholders */}
      <div className="p-4 rounded-xl bg-[#d4af37]/[0.08] border border-[#d4af37]/25 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-sans-modern font-semibold text-[#fff7d6]">
            Photo Gallery Actions
          </h4>
          <p className="text-xs text-white/60">
            Select pictures from your device or wipe initial placeholders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {slideTwo.photos && slideTwo.photos.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllPhotos}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-sans-modern transition-all"
              title="Delete all photos and clear gallery"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Photos</span>
            </button>
          )}

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e2be67] to-[#deb35e] text-[#12141d] font-semibold text-xs font-sans-modern hover:brightness-110 active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Processing Photos...' : 'Upload New Photos'}</span>
          </button>
        </div>
      </div>

      {/* Photos List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] font-medium">
            Current Photographs ({slideTwo.photos?.length || 0})
          </label>
          <span className="text-[11px] text-white/40">
            Click Delete to remove · Clear Details to wipe text
          </span>
        </div>

        {(!slideTwo.photos || slideTwo.photos.length === 0) ? (
          <div className="p-8 text-center rounded-xl bg-white/[0.02] border border-dashed border-white/15">
            <ImageIcon className="w-10 h-10 text-white/30 mx-auto mb-2" />
            <p className="text-sm text-white/60">No photos in gallery.</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Your First Photo</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {slideTwo.photos.map((photo, index) => (
              <div
                key={photo.id || index}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col md:flex-row gap-4 items-start"
              >
                {/* Photo Thumbnail + Replace */}
                <div className="relative w-full md:w-36 h-28 rounded-lg overflow-hidden bg-black/40 shrink-0 border border-white/10 group">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Memory photo'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => triggerReplace(photo.id)}
                    className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-[11px] text-white transition-opacity"
                    title="Replace with new photo"
                  >
                    <RefreshCw className="w-4 h-4 text-[#d4af37]" />
                    <span>Replace Image</span>
                  </button>
                </div>

                {/* Photo Fields & Actions */}
                <div className="flex-1 w-full space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#d4af37] font-medium">
                      Photo #{index + 1}
                    </span>

                    {/* Action buttons: Move up/down, Clear Details, and Delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMovePhoto(index, 'up')}
                        className="p-1.5 rounded hover:bg-white/10 disabled:opacity-20 text-white/70 hover:text-white"
                        title="Move photo earlier"
                        aria-label="Move photo earlier"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === slideTwo.photos.length - 1}
                        onClick={() => handleMovePhoto(index, 'down')}
                        className="p-1.5 rounded hover:bg-white/10 disabled:opacity-20 text-white/70 hover:text-white"
                        title="Move photo later"
                        aria-label="Move photo later"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Clear text details button */}
                      <button
                        type="button"
                        onClick={() => handleClearDetails(photo.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors"
                        title="Clear caption, description, date and location"
                      >
                        <Eraser className="w-3 h-3 text-[#d4af37]" />
                        <span className="hidden sm:inline">Clear Text</span>
                      </button>

                      {/* Prominent working delete button */}
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 border border-rose-500/20 text-xs font-sans-modern transition-colors active:scale-95"
                        title="Delete this photograph"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-white/40 uppercase mb-0.5">
                        Caption / Memory Title
                      </label>
                      <input
                        type="text"
                        value={photo.caption}
                        onChange={(e) =>
                          handleUpdatePhotoField(photo.id, 'caption', e.target.value)
                        }
                        placeholder="Caption (e.g. Our First Trip)"
                        className="w-full px-3 py-1.5 rounded-lg bg-black/30 border border-white/15 focus:border-[#d4af37] text-white text-xs font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-0.5">
                        Date / Moment
                      </label>
                      <input
                        type="text"
                        value={photo.date || ''}
                        onChange={(e) =>
                          handleUpdatePhotoField(photo.id, 'date', e.target.value)
                        }
                        placeholder="Date (e.g. Summer 2025)"
                        className="w-full px-3 py-1.5 rounded-lg bg-black/30 border border-white/15 focus:border-[#d4af37] text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-white/40 uppercase mb-0.5">
                        Description / Story
                      </label>
                      <textarea
                        rows={2}
                        value={photo.description || ''}
                        onChange={(e) =>
                          handleUpdatePhotoField(photo.id, 'description', e.target.value)
                        }
                        placeholder="Write your story or leave blank..."
                        className="w-full px-3 py-1.5 rounded-lg bg-black/30 border border-white/15 focus:border-[#d4af37] text-white text-xs leading-relaxed focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-0.5">
                        Location
                      </label>
                      <input
                        type="text"
                        value={photo.location || ''}
                        onChange={(e) =>
                          handleUpdatePhotoField(photo.id, 'location', e.target.value)
                        }
                        placeholder="Location (e.g. Paris)"
                        className="w-full px-3 py-1.5 rounded-lg bg-black/30 border border-white/15 focus:border-[#d4af37] text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
