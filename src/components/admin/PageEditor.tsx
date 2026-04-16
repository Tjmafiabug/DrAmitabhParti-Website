import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useState } from 'react';

interface Props {
  pageKey: 'about' | 'credentials';
  title: string;
  initialBodyJson?: unknown;
  initialBodyHtml?: string;
}

export default function PageEditor({ pageKey, title, initialBodyJson, initialBodyHtml }: Props) {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [err, setErr] = useState<string | null>(null);

  const initialContent = initialBodyJson
    ?? (initialBodyHtml && initialBodyHtml.trim() ? initialBodyHtml : { type: 'doc', content: [{ type: 'paragraph' }] });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
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
      if (res.status === 401) throw new Error('Your session expired. Please sign in again.');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? 'Save failed');
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 1500);
    } catch (e) {
      setErr((e as Error).message); setSaveState('error');
    }
  };

  const livePath = pageKey === 'about' ? '/about' : '/credentials';

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
            <ToolBtn active={editor.isActive('link')} onClick={() => { const url = window.prompt('Link URL'); if (url) editor.chain().focus().setLink({ href: url }).run(); else editor.chain().focus().unsetLink().run(); }}>Link</ToolBtn>
          </div>
        )}

        <div style={{ border: '1px solid var(--a-border-strong)', borderRadius: 4, borderTopLeftRadius: editor ? 0 : 4, borderTopRightRadius: editor ? 0 : 4, background: 'var(--a-surface)', padding: '1.25rem 1.5rem' }}>
          <EditorContent editor={editor} />
        </div>
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
