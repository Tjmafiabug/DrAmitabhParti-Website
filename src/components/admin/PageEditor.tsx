import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useState } from 'react';
import TiptapToolbar from './TiptapToolbar';
import { friendlyError, friendlyFetchError } from '../../lib/adminErrors';

type PageKey = 'about' | 'credentials' | 'privacy' | 'disclaimer' | 'not_found';

interface Props {
  pageKey: PageKey;
  title: string;
  livePath: string;
  initialBodyJson?: unknown;
  initialBodyHtml?: string;
}

export default function PageEditor({ pageKey, title, livePath, initialBodyJson, initialBodyHtml }: Props) {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [err, setErr] = useState<string | null>(null);

  const initialContent = initialBodyJson
    ?? (initialBodyHtml && initialBodyHtml.trim() ? initialBodyHtml : { type: 'doc', content: [{ type: 'paragraph' }] });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ allowBase64: false }),
      Link.configure({ openOnClick: false, protocols: ['http', 'https', 'mailto'] }),
      Placeholder.configure({ placeholder: 'Write…' }),
    ],
    content: initialContent,
    editorProps: { attributes: { class: 'prose-article focus:outline-none min-h-[320px] max-w-none' } },
  });

  const save = async () => {
    if (!editor) return;
    setSaveState('saving'); setErr(null);
    try {
      const res = await fetch(`/api/pages/${pageKey}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ body_json: editor.getJSON(), body_html: editor.getHTML() }),
      });
      if (!res.ok) throw await friendlyFetchError(res);
      await res.json();
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 1500);
    } catch (e) {
      setErr(friendlyError(e)); setSaveState('error');
    }
  };

  const uploadInlineImage = async (file: File, alt: string) => {
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw await friendlyFetchError(res);
      const data = await res.json();
      editor?.chain().focus().setImage({ src: data.url, alt: alt || file.name }).run();
    } catch (e) { setErr(friendlyError(e)); }
  };

  return (
    <div>
      <div className="admin-actionbar">
        <div>
          <div className="admin-meta" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem', marginBottom: 2 }}>Editing</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="admin-meta">
            {saveState === 'saving' && 'Saving…'}
            {saveState === 'saved' && '✓ Saved'}
            {saveState === 'error' && <span style={{ color: 'var(--a-danger)' }}>Error</span>}
          </span>
          <a href={livePath} target="_blank" rel="noopener" className="admin-btn admin-btn-secondary">View live ↗</a>
          <button type="button" onClick={() => void save()} className="admin-btn admin-btn-primary">Save</button>
        </div>
      </div>

      {err && <div className="admin-flash admin-flash-error">{err}</div>}

      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <TiptapToolbar editor={editor} onImageUpload={uploadInlineImage} />

        <div style={{ border: '1px solid var(--a-border-strong)', borderRadius: 4, borderTopLeftRadius: editor ? 0 : 4, borderTopRightRadius: editor ? 0 : 4, background: 'var(--a-surface)', padding: '1.25rem 1.5rem' }}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
