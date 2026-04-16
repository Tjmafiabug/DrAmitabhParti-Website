import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef, useState } from 'react';

type Category = 'Essay' | 'Awareness' | 'Reflection';

interface ComposerProps {
  id?: string;
  initialTitle?: string;
  initialExcerpt?: string;
  initialCategory?: Category;
  initialBodyJson?: unknown;
  initialStatus?: 'draft' | 'published';
  initialSlug?: string;
  initialCoverImageUrl?: string | null;
  initialUpdatedAt?: string;
}

export default function Composer(props: ComposerProps) {
  const [title, setTitle] = useState(props.initialTitle ?? '');
  const [excerpt, setExcerpt] = useState(props.initialExcerpt ?? '');
  const [category, setCategory] = useState<Category>(props.initialCategory ?? 'Essay');
  const [status, setStatus] = useState<'draft' | 'published'>(props.initialStatus ?? 'draft');
  const [slug, setSlug] = useState(props.initialSlug ?? '');
  const [id, setId] = useState(props.id);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(props.initialCoverImageUrl ?? null);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(props.initialUpdatedAt);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const saveTimer = useRef<number | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto'] }),
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: props.initialBodyJson ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    editorProps: {
      attributes: { class: 'prose-article focus:outline-none min-h-[360px] max-w-none' },
    },
  });

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 96);

  useEffect(() => {
    if (!slug && title && !id) setSlug(slugify(title));
  }, [title, id, slug]);

  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => void save(false), 4000);
    };
    editor.on('update', handler);
    return () => { editor.off('update', handler); };
  }, [editor, title, excerpt, category, coverImageUrl]);

  const handleFetchError = async (res: Response): Promise<never> => {
    if (res.status === 401) throw new Error('Your session expired. Please sign in again.');
    const data = await res.json().catch(() => ({}));
    const err = new Error(data?.error?.message ?? `Request failed (${res.status})`);
    (err as any).conflict = res.status === 409;
    (err as any).server_updated_at = data?.server_updated_at;
    throw err;
  };

  const save = async (publish: boolean, options: { force?: boolean } = {}) => {
    if (!editor) return;
    if (!title.trim()) { setErrMsg('Title is required.'); setSaveState('error'); return; }
    if (!slug.trim()) { setErrMsg('Slug is required.'); setSaveState('error'); return; }

    setSaveState('saving'); setErrMsg(null);

    const payload: Record<string, unknown> = {
      id,
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      category,
      body_json: editor.getJSON(),
      body_html: editor.getHTML(),
      status: publish ? 'published' : status,
      cover_image_url: coverImageUrl,
    };
    if (id && !options.force) payload.expected_updated_at = updatedAt;

    try {
      const res = await fetch('/api/posts', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) await handleFetchError(res);
      const data = await res.json();
      if (!id && data.id) setId(data.id);
      if (data.updated_at) setUpdatedAt(data.updated_at);
      if (publish) { setStatus('published'); setPublishedUrl(`/writing/${payload.slug}`); }
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 1500);
    } catch (e) {
      const msg = (e as Error).message;
      const conflict = (e as any).conflict;
      setErrMsg(conflict ? `${msg} — click "Overwrite" to force your changes.` : msg);
      setSaveState('error');
    }
  };

  const uploadInlineImage = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { setErrMsg('Image too large (max 10 MB).'); return; }
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) await handleFetchError(res);
      const data = await res.json();
      editor?.chain().focus().setImage({ src: data.url, alt: file.name }).run();
    } catch (e) { setErrMsg((e as Error).message); }
  };

  const uploadCover = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { setErrMsg('Cover image too large (max 10 MB).'); return; }
    const fd = new FormData(); fd.append('file', file);
    setCoverUploading(true); setErrMsg(null);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) await handleFetchError(res);
      const data = await res.json();
      setCoverImageUrl(data.url);
    } catch (e) { setErrMsg((e as Error).message); }
    finally { setCoverUploading(false); }
  };

  const onPaste = async (e: React.ClipboardEvent) => {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith('image/'));
    if (item) {
      e.preventDefault();
      const file = item.getAsFile();
      if (file) await uploadInlineImage(file);
    }
  };

  const onDrop = async (e: React.DragEvent) => {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      e.preventDefault();
      await uploadInlineImage(file);
    }
  };

  const confirmDelete = async () => {
    if (!id) return;
    const ok = window.confirm(`Delete "${title}"? This cannot be undone.`);
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) await handleFetchError(res);
      window.location.href = '/admin';
    } catch (e) {
      setErrMsg((e as Error).message);
      setDeleting(false);
    }
  };

  return (
    <div onPaste={onPaste} onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>

      {/* Sticky action bar */}
      <div className="admin-actionbar">
        <a href="/admin" className="admin-btn admin-btn-ghost admin-btn-sm" style={{ paddingLeft: '0.4rem' }}>← Back</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="admin-meta">
            {saveState === 'saving' && 'Saving…'}
            {saveState === 'saved' && '✓ Saved'}
            {saveState === 'error' && <span style={{ color: 'var(--a-danger)' }}>Error</span>}
            {saveState === 'idle' && id && 'All changes saved'}
          </span>
          <button type="button" onClick={() => void save(false)} className="admin-btn admin-btn-secondary">Save draft</button>
          <button type="button" onClick={() => void save(true)} className="admin-btn admin-btn-primary">Publish</button>
        </div>
      </div>

      {errMsg && (
        <div className="admin-flash admin-flash-error">
          <span>{errMsg}</span>
          {errMsg?.includes('Overwrite') && (
            <button type="button" onClick={() => void save(status === 'published', { force: true })} className="admin-btn admin-btn-danger admin-btn-sm">Overwrite</button>
          )}
        </div>
      )}
      {publishedUrl && (
        <div className="admin-flash admin-flash-success">
          Live at <a href={publishedUrl} target="_blank" rel="noopener" style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>{publishedUrl}</a>
        </div>
      )}

      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Cover image */}
        <div className="admin-field">
          <label className="admin-label">Cover image <span className="admin-muted" style={{ fontWeight: 400 }}>(optional)</span></label>
          {coverImageUrl ? (
            <div style={{ position: 'relative' }}>
              <img src={coverImageUrl} alt="Cover" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 4, border: '1px solid var(--a-border)' }} />
              <button type="button" onClick={() => setCoverImageUrl(null)} className="admin-btn admin-btn-secondary admin-btn-sm" style={{ position: 'absolute', top: 8, right: 8 }}>Remove</button>
            </div>
          ) : (
            <label className="admin-card" style={{ display: 'block', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', borderStyle: 'dashed', borderColor: 'var(--a-border-strong)' }}>
              <p style={{ fontSize: '0.88rem', fontWeight: 500, marginBottom: 2 }}>{coverUploading ? 'Uploading…' : '+ Upload cover image'}</p>
              <p className="admin-help" style={{ margin: 0 }}>Up to 10 MB. Auto-resized and converted to WebP.</p>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadCover(f); e.target.value = ''; }} />
            </label>
          )}
        </div>

        {/* Title */}
        <div className="admin-field">
          <label htmlFor="post-title" className="admin-label">Title</label>
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="The title of your post"
            className="admin-input"
            style={{ fontSize: '1.05rem', fontWeight: 500, height: 44 }}
          />
        </div>

        {/* Excerpt */}
        <div className="admin-field">
          <label htmlFor="post-excerpt" className="admin-label">Excerpt <span className="admin-muted" style={{ fontWeight: 400 }}>(optional)</span></label>
          <textarea
            id="post-excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A one-line introduction shown in lists and at the top of the article."
            className="admin-textarea"
            rows={2}
          />
        </div>

        {/* Body */}
        <div className="admin-field">
          <label className="admin-label">Body</label>

          {editor && (
            <div className="admin-toolbar" style={{ marginBottom: 8, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
              <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></ToolBtn>
              <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></ToolBtn>
              <span style={{ width: 1, background: 'var(--a-border)' }} />
              <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolBtn>
              <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolBtn>
              <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</ToolBtn>
              <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</ToolBtn>
              <ToolBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>"</ToolBtn>
              <ToolBtn active={editor.isActive('link')} onClick={() => {
                const url = window.prompt('Link URL');
                if (url) editor.chain().focus().setLink({ href: url }).run();
                else editor.chain().focus().unsetLink().run();
              }}>Link</ToolBtn>
              <label className="admin-tool-btn" style={{ cursor: 'pointer' }}>
                Image
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadInlineImage(f); e.target.value = ''; }} />
              </label>
            </div>
          )}

          <div style={{ border: '1px solid var(--a-border-strong)', borderRadius: 4, borderTopLeftRadius: editor ? 0 : 4, borderTopRightRadius: editor ? 0 : 4, background: 'var(--a-surface)', padding: '1.25rem 1.5rem' }}>
            <EditorContent editor={editor} />
          </div>
          <p className="admin-help">Paste an image directly into the body, or drop a file anywhere in the composer.</p>
        </div>

        {/* Meta */}
        <div className="admin-section">
          <div className="admin-section-head">
            <h2>Metadata</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="admin-field" style={{ marginBottom: 0 }}>
              <label htmlFor="post-category" className="admin-label">Category</label>
              <select id="post-category" value={category} onChange={(e) => setCategory(e.target.value as Category)} className="admin-select">
                <option>Essay</option>
                <option>Awareness</option>
                <option>Reflection</option>
              </select>
            </div>
            <div className="admin-field" style={{ marginBottom: 0 }}>
              <label htmlFor="post-slug" className="admin-label">URL slug</label>
              <input id="post-slug" type="text" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} className="admin-input admin-mono" />
              <p className="admin-help">/writing/{slug || 'your-slug'}</p>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        {id && (
          <div className="admin-danger-zone">
            <h3>Delete post</h3>
            <p>Permanently remove this post. It will disappear from the public site immediately. This cannot be undone.</p>
            <button type="button" onClick={() => void confirmDelete()} disabled={deleting} className="admin-btn admin-btn-danger">
              {deleting ? 'Deleting…' : 'Delete post'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolBtn({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`admin-tool-btn ${active ? 'active' : ''}`}>
      {children}
    </button>
  );
}
