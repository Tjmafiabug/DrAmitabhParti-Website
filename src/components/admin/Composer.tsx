import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef, useState } from 'react';

type Category = 'Essay' | 'Awareness' | 'Reflection';

interface ComposerProps {
  id?: string;          // post id if editing
  initialTitle?: string;
  initialExcerpt?: string;
  initialCategory?: Category;
  initialBodyJson?: unknown;
  initialStatus?: 'draft' | 'published';
  initialSlug?: string;
}

export default function Composer(props: ComposerProps) {
  const [title, setTitle] = useState(props.initialTitle ?? '');
  const [excerpt, setExcerpt] = useState(props.initialExcerpt ?? '');
  const [category, setCategory] = useState<Category>(props.initialCategory ?? 'Essay');
  const [status, setStatus] = useState<'draft' | 'published'>(props.initialStatus ?? 'draft');
  const [slug, setSlug] = useState(props.initialSlug ?? '');
  const [id, setId] = useState(props.id);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const saveTimer = useRef<number | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto'] }),
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: props.initialBodyJson ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    editorProps: {
      attributes: {
        class: 'prose-article focus:outline-none min-h-[320px] max-w-none',
      },
    },
  });

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 96);

  useEffect(() => {
    if (!slug && title && !id) setSlug(slugify(title));
  }, [title, id, slug]);

  // Auto-save drafts every 4 s when there are unsaved changes
  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => void save(false), 4000);
    };
    editor.on('update', handler);
    return () => { editor.off('update', handler); };
  }, [editor, title, excerpt, category]);

  const save = async (publish: boolean) => {
    if (!editor) return;
    if (!title.trim()) { setErrMsg('Title is required.'); setSaveState('error'); return; }
    if (!slug.trim()) { setErrMsg('Slug is required.'); setSaveState('error'); return; }

    setSaveState('saving'); setErrMsg(null);

    const payload = {
      id,
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      category,
      body_json: editor.getJSON(),
      body_html: editor.getHTML(),
      status: publish ? 'published' : status,
    };

    try {
      const res = await fetch('/api/posts', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? 'Save failed');
      if (!id && data.id) setId(data.id);
      if (publish) {
        setStatus('published');
        setPublishedUrl(`/writing/${payload.slug}`);
      }
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 1500);
    } catch (e) {
      setErrMsg((e as Error).message);
      setSaveState('error');
    }
  };

  const uploadImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { setErrMsg('Image too large (max 5 MB).'); return; }
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? 'Upload failed');
      editor?.chain().focus().setImage({ src: data.url, alt: file.name }).run();
    } catch (e) {
      setErrMsg((e as Error).message);
    }
  };

  const onPaste = async (e: React.ClipboardEvent) => {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith('image/'));
    if (item) {
      e.preventDefault();
      const file = item.getAsFile();
      if (file) await uploadImage(file);
    }
  };

  const onDrop = async (e: React.DragEvent) => {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      e.preventDefault();
      await uploadImage(file);
    }
  };

  return (
    <div onPaste={onPaste} onDrop={onDrop} onDragOver={(e) => e.preventDefault()} className="max-w-[700px] mx-auto">

      {/* Top bar */}
      <div className="sticky top-[69px] bg-[var(--color-surface)] z-30 flex items-center justify-between gap-4 py-4 mb-6 border-b border-[var(--color-outline-variant)]/30">
        <a href="/admin" className="font-[var(--font-label)] text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)]">← Back to posts</a>
        <div className="flex items-center gap-4">
          <span className="meta">
            {saveState === 'saving' && 'Saving…'}
            {saveState === 'saved' && '✓ Saved'}
            {saveState === 'error' && <span style={{ color: 'var(--color-accent)' }}>Error</span>}
            {saveState === 'idle' && (id ? 'All changes saved' : '')}
          </span>
          <button type="button" onClick={() => void save(false)} className="px-4 py-2 text-[0.72rem] uppercase tracking-[0.2em] font-[var(--font-label)] border border-[var(--color-outline-variant)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors">Save draft</button>
          <button type="button" onClick={() => void save(true)} className="px-5 py-2 text-[0.72rem] uppercase tracking-[0.2em] font-[var(--font-label)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-on-primary-container)] transition-colors">Publish</button>
        </div>
      </div>

      {errMsg && (
        <div className="mb-4 p-3 border-l-2 text-[0.88rem]" style={{ background: 'rgba(154,74,46,0.06)', borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}>{errMsg}</div>
      )}
      {publishedUrl && (
        <div className="mb-4 p-3 border-l-2 text-[0.88rem]" style={{ background: 'rgba(111,90,75,0.06)', borderColor: 'var(--color-primary)' }}>
          Live at <a href={publishedUrl} target="_blank" rel="noopener" className="link-editorial">{publishedUrl}</a>
        </div>
      )}

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full text-[2.4rem] leading-[1.1] font-[var(--font-headline)] bg-transparent border-0 focus:outline-none placeholder:text-[var(--color-on-surface-variant)]/40 mb-2"
      />

      {/* Excerpt */}
      <input
        type="text"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Optional subtitle or excerpt"
        className="w-full text-[1.15rem] italic font-[var(--font-headline)] bg-transparent border-0 focus:outline-none placeholder:text-[var(--color-on-surface-variant)]/40 mb-6 text-[var(--color-on-surface-variant)]"
      />

      <hr className="mb-8" style={{ borderColor: 'var(--color-outline-variant)', opacity: 0.4 }} />

      {/* Body editor */}
      <EditorContent editor={editor} />

      {/* Minimal toolbar (bottom) */}
      {editor && (
        <div className="mt-8 pt-6 border-t border-[var(--color-outline-variant)]/30 flex flex-wrap items-center gap-2">
          <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolBtn>
          <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><span style={{ fontStyle: 'italic' }}>I</span></ToolBtn>
          <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolBtn>
          <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolBtn>
          <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</ToolBtn>
          <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</ToolBtn>
          <ToolBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>“ Quote”</ToolBtn>
          <ToolBtn active={editor.isActive('link')} onClick={() => {
            const url = window.prompt('Link URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
            else editor.chain().focus().unsetLink().run();
          }}>Link</ToolBtn>
          <label className="px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.15em] font-[var(--font-label)] border border-[var(--color-outline-variant)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer">
            Image
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadImage(f); e.target.value = ''; }} />
          </label>
        </div>
      )}

      {/* Footer: meta */}
      <details className="mt-10 border-t border-[var(--color-outline-variant)]/30 pt-5">
        <summary className="label cursor-pointer select-none">More options</summary>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="block">
            <span className="label mb-2 block">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="w-full px-3 py-2 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:outline-none">
              <option>Essay</option>
              <option>Awareness</option>
              <option>Reflection</option>
            </select>
          </label>
          <label className="block">
            <span className="label mb-2 block">Slug</span>
            <input type="text" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} className="w-full px-3 py-2 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:outline-none font-mono text-[0.9rem]" />
          </label>
        </div>
      </details>
    </div>
  );
}

function ToolBtn({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.15em] font-[var(--font-label)] border transition-colors ${
        active
          ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[rgba(111,90,75,0.08)]'
          : 'border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
      }`}
    >
      {children}
    </button>
  );
}
