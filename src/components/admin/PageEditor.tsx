import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useState } from 'react';

interface Props {
  pageKey: 'about' | 'credentials';
  title: string;
  initialBodyJson?: unknown;
}

export default function PageEditor({ pageKey, title, initialBodyJson }: Props) {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [err, setErr] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, protocols: ['http', 'https', 'mailto'] }),
      Placeholder.configure({ placeholder: 'Write…' }),
    ],
    content: initialBodyJson ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    editorProps: { attributes: { class: 'prose-article focus:outline-none min-h-[280px] max-w-none' } },
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
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? 'Save failed');
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 1500);
    } catch (e) {
      setErr((e as Error).message); setSaveState('error');
    }
  };

  return (
    <div className="max-w-[700px] mx-auto">
      <div className="sticky top-[69px] bg-[var(--color-surface)] z-30 flex items-center justify-between gap-4 py-4 mb-6 border-b border-[var(--color-outline-variant)]/30">
        <div>
          <p className="label">Editing</p>
          <h1 className="font-[var(--font-headline)] text-[1.6rem] leading-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="meta">
            {saveState === 'saving' && 'Saving…'}
            {saveState === 'saved' && '✓ Saved'}
            {saveState === 'error' && <span style={{ color: 'var(--color-accent)' }}>Error</span>}
          </span>
          <a href={pageKey === 'about' ? '/about' : '/credentials'} target="_blank" rel="noopener" className="px-4 py-2 text-[0.72rem] uppercase tracking-[0.2em] font-[var(--font-label)] border border-[var(--color-outline-variant)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors">View live ↗</a>
          <button type="button" onClick={() => void save()} className="px-5 py-2 text-[0.72rem] uppercase tracking-[0.2em] font-[var(--font-label)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-on-primary-container)] transition-colors">Save</button>
        </div>
      </div>

      {err && <div className="mb-4 p-3 border-l-2 text-[0.88rem]" style={{ background: 'rgba(154,74,46,0.06)', borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}>{err}</div>}

      <EditorContent editor={editor} />

      {editor && (
        <div className="mt-8 pt-6 border-t border-[var(--color-outline-variant)]/30 flex flex-wrap items-center gap-2">
          <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolBtn>
          <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><span style={{ fontStyle: 'italic' }}>I</span></ToolBtn>
          <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolBtn>
          <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolBtn>
          <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</ToolBtn>
          <ToolBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>“ Quote”</ToolBtn>
          <ToolBtn active={editor.isActive('link')} onClick={() => { const url = window.prompt('Link URL'); if (url) editor.chain().focus().setLink({ href: url }).run(); else editor.chain().focus().unsetLink().run(); }}>Link</ToolBtn>
        </div>
      )}
    </div>
  );
}

function ToolBtn({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.15em] font-[var(--font-label)] border transition-colors ${active ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[rgba(111,90,75,0.08)]' : 'border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'}`}>{children}</button>
  );
}
