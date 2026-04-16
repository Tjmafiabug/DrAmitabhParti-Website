import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';

interface Props {
  editor: Editor | null;
  /** Optional image upload callback. Receives the chosen File + an alt text the user supplied. */
  onImageUpload?: (file: File, alt: string) => Promise<void> | void;
  /** Top-toolbar on desktop, fixed-bottom on mobile. */
  stickyOnMobile?: boolean;
}

export default function TiptapToolbar({ editor, onImageUpload, stickyOnMobile = true }: Props) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const altInputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => { if (linkOpen) linkInputRef.current?.focus(); }, [linkOpen]);
  useEffect(() => { if (pendingImage) altInputRef.current?.focus(); }, [pendingImage]);

  if (!editor) return null;

  const openLinkDialog = () => {
    const current = (editor.getAttributes('link')?.href as string) ?? '';
    setLinkUrl(current);
    setLinkOpen(true);
  };
  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    setLinkOpen(false); setLinkUrl('');
  };
  const removeLink = () => { editor.chain().focus().unsetLink().run(); setLinkOpen(false); setLinkUrl(''); };

  const startImage = (file: File) => {
    setPendingImage(file);
    setImageAlt('');
  };
  const commitImage = async () => {
    if (!pendingImage || !onImageUpload) return;
    await onImageUpload(pendingImage, imageAlt.trim());
    setPendingImage(null);
    setImageAlt('');
  };
  const cancelImage = () => { setPendingImage(null); setImageAlt(''); };

  return (
    <div className={`admin-toolbar ${stickyOnMobile ? 'admin-toolbar-sticky-mobile' : ''}`}>
      <ToolBtn active={editor.isActive('bold')}   onClick={() => editor.chain().focus().toggleBold().run()}   aria-label="Bold"><strong>B</strong></ToolBtn>
      <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Italic"><em>I</em></ToolBtn>
      <Sep />
      <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="Heading 2">H2</ToolBtn>
      <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} aria-label="Heading 3">H3</ToolBtn>
      <ToolBtn active={editor.isActive('bulletList')}  onClick={() => editor.chain().focus().toggleBulletList().run()}  aria-label="Bulleted list">• List</ToolBtn>
      <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-label="Numbered list">1. List</ToolBtn>
      <ToolBtn active={editor.isActive('blockquote')}  onClick={() => editor.chain().focus().toggleBlockquote().run()}  aria-label="Quote">&ldquo;</ToolBtn>
      <ToolBtn active={editor.isActive('link')}        onClick={openLinkDialog} aria-label="Add or edit link">Link</ToolBtn>
      {onImageUpload && (
        <label className="admin-tool-btn" style={{ cursor: 'pointer' }} aria-label="Insert image">
          Image
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) startImage(f); e.target.value = ''; }} />
        </label>
      )}
      <Sep />
      <ToolBtn onClick={() => editor.chain().focus().undo().run()} aria-label="Undo">↶</ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().redo().run()} aria-label="Redo">↷</ToolBtn>

      {linkOpen && (
        <Popover onClose={() => setLinkOpen(false)}>
          <label className="admin-label">Link URL</label>
          <input ref={linkInputRef} className="admin-input" value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLink(); } if (e.key === 'Escape') setLinkOpen(false); }}
            placeholder="https://example.com" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: '0.5rem' }}>
            {editor.isActive('link') && <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={removeLink}>Remove</button>}
            <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setLinkOpen(false)}>Cancel</button>
            <button type="button" className="admin-btn admin-btn-primary admin-btn-sm" onClick={applyLink}>Apply</button>
          </div>
        </Popover>
      )}

      {pendingImage && (
        <Popover onClose={cancelImage}>
          <label className="admin-label">Describe this image for screen readers</label>
          <input ref={altInputRef} className="admin-input" value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void commitImage(); } if (e.key === 'Escape') cancelImage(); }}
            placeholder="e.g. A view of the Aravalli hills at dawn" />
          <p className="admin-help">Leave blank only if the image is purely decorative.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: '0.5rem' }}>
            <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={cancelImage}>Cancel</button>
            <button type="button" className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => void commitImage()}>Insert</button>
          </div>
        </Popover>
      )}
    </div>
  );
}

function ToolBtn({ active, onClick, children, ...rest }: { active?: boolean; onClick: () => void; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" onClick={onClick} className={`admin-tool-btn ${active ? 'active' : ''}`} {...rest}>
      {children}
    </button>
  );
}

function Sep() {
  return <span aria-hidden="true" style={{ width: 1, background: 'var(--a-border)', margin: '0 0.1rem' }} />;
}

function Popover({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" className="admin-popover"
         onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div className="admin-popover-backdrop" onClick={onClose} />
      <div className="admin-popover-panel">
        {children}
      </div>
    </div>
  );
}
