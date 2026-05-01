import { useState, useEffect, useCallback } from 'react';
import { catalogAPI } from '../services/api';
import { Alert, Spinner, Pagination, EmptyState, Modal, FormField } from '../components/UI';
import { Plus, Edit2, Trash2, BookOpen, Upload } from 'lucide-react';

const EMPTY_FORM = { title: '', author: '', isbn: '', publisher: '', year: '', edition: '', category: '', tags: '', format: 'physical', total_copies: 1, shelf: '', description: '', cover: '' };
const CATEGORIES = ['Programming', 'AI & ML', 'Algorithms', 'Databases', 'Networking', 'Systems', 'Mathematics', 'Physics', 'Chemistry', 'Literature', 'Other'];

function BookForm({ initial, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const update = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormField label="Title" ><input className="input-base" placeholder="Book title" value={form.title} onChange={update('title')} required /></FormField>
        <FormField label="Author"><input className="input-base" placeholder="Author name" value={form.author} onChange={update('author')} required /></FormField>
        <FormField label="ISBN"  ><input className="input-base" placeholder="9780000000000" value={form.isbn} onChange={update('isbn')} required /></FormField>
        <FormField label="Publisher"><input className="input-base" placeholder="Publisher" value={form.publisher} onChange={update('publisher')} /></FormField>
        <FormField label="Year"><input className="input-base" type="number" placeholder="2024" value={form.year} onChange={update('year')} /></FormField>
        <FormField label="Edition"><input className="input-base" placeholder="1st" value={form.edition} onChange={update('edition')} /></FormField>
        <FormField label="Category">
          <select className="input-base" value={form.category} onChange={update('category')} required>
            <option value="">Select…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="Format">
          <select className="input-base" value={form.format} onChange={update('format')}>
            <option value="physical">Physical</option>
            <option value="digital">Digital</option>
          </select>
        </FormField>
        <FormField label="Total Copies"><input className="input-base" type="number" min={1} value={form.total_copies} onChange={update('total_copies')} /></FormField>
        <FormField label="Shelf Location"><input className="input-base" placeholder="A-12" value={form.shelf} onChange={update('shelf')} /></FormField>
      </div>
      <FormField label="Tags (comma-separated)"><input className="input-base" placeholder="python, beginner, oop" value={form.tags} onChange={update('tags')} /></FormField>
      <FormField label="Cover Image URL"><input className="input-base" placeholder="https://..." value={form.cover} onChange={update('cover')} /></FormField>
      <FormField label="Description"><textarea className="input-base" rows={3} placeholder="Brief description…" value={form.description} onChange={update('description')} style={{ resize: 'vertical' }} /></FormField>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-gold" disabled={loading}>
          {loading ? <Spinner size={15} color="#0a0a0f" /> : initial?.id ? 'Save Changes' : 'Add Book'}
        </button>
      </div>
    </form>
  );
}

export default function CatalogManagement() {
  const [books, setBooks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, pageSize: 15 });
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(null); // null | 'add' | 'edit' | 'delete' | 'import'
  const [selected, setSelected]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert]         = useState(null);
  const [importText, setImportText] = useState('');
  const [importErrors, setImportErrors] = useState([]);

  const fetchBooks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await catalogAPI.getBooks({ search, page, pageSize: 15 });
      setBooks(res.data);
      setPagination({ page: res.page, totalPages: res.totalPages, total: res.total, pageSize: res.pageSize });
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { const t = setTimeout(() => fetchBooks(1), 300); return () => clearTimeout(t); }, [search]);

  async function handleAdd(form) {
    setSubmitting(true);
    try {
      const tags = typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags;
      await catalogAPI.createBook({ ...form, year: parseInt(form.year), total_copies: parseInt(form.total_copies), tags });
      setAlert({ type: 'success', msg: 'Book added successfully!' });
      setModal(null); fetchBooks(1);
    } catch (err) { setAlert({ type: 'error', msg: err?.response?.data?.detail || 'Failed to add book.' }); }
    finally { setSubmitting(false); }
  }

  async function handleEdit(form) {
    setSubmitting(true);
    try {
      const tags = typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags;
      await catalogAPI.updateBook(selected.id, { ...form, year: parseInt(form.year), total_copies: parseInt(form.total_copies), tags });
      setAlert({ type: 'success', msg: 'Book updated!' });
      setModal(null); fetchBooks(pagination.page);
    } catch (err) { setAlert({ type: 'error', msg: err?.response?.data?.detail || 'Failed to update.' }); }
    finally { setSubmitting(false); }
  }

  async function handleDelete() {
    setSubmitting(true);
    try {
      await catalogAPI.deleteBook(selected.id);
      setAlert({ type: 'success', msg: 'Book deleted.' });
      setModal(null); fetchBooks(pagination.page);
    } catch (err) { setAlert({ type: 'error', msg: err?.response?.data?.detail || 'Failed to delete.' }); }
    finally { setSubmitting(false); }
  }

  function handleImport() {
    setImportErrors([]);
    let rows;
    try { rows = JSON.parse(importText); }
    catch { setImportErrors([{ row: 0, msg: 'Invalid JSON format.' }]); return; }
    if (!Array.isArray(rows)) { setImportErrors([{ row: 0, msg: 'Must be a JSON array.' }]); return; }
    const errors = [];
    rows.forEach((r, i) => {
      if (!r.title)  errors.push({ row: i + 1, field: 'title',  msg: 'Required' });
      if (!r.author) errors.push({ row: i + 1, field: 'author', msg: 'Required' });
      if (!r.isbn)   errors.push({ row: i + 1, field: 'isbn',   msg: 'Required' });
    });
    if (errors.length) { setImportErrors(errors); return; }
    rows.forEach(r => catalogAPI.createBook({ ...EMPTY_FORM, ...r, tags: r.tags || [], total_copies: r.total_copies || 1 }));
    setAlert({ type: 'success', msg: `${rows.length} books imported!` });
    setModal(null); setImportText(''); fetchBooks(1);
  }

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="gold-line" />
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700 }}>Catalog Management</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>{pagination.total} resources in catalog</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-outline" onClick={() => setModal('import')}><Upload size={15} /> Bulk Import</button>
            <button className="btn-gold" onClick={() => setModal('add')}><Plus size={15} /> Add Book</button>
          </div>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <input className="input-base" placeholder="Search catalog…" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 20, maxWidth: 400 }} />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={28} /></div>
      ) : books.length === 0 ? (
        <EmptyState icon={BookOpen} title="No books found" subtitle="Add your first book or adjust the search." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table-base">
            <thead>
              <tr><th>Book</th><th>Category</th><th>Format</th><th>Copies</th><th>Shelf</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id}>
                  <td>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{book.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{book.author} · ISBN {book.isbn}</p>
                  </td>
                  <td><span className="badge badge-gold">{book.category}</span></td>
                  <td><span className={`badge ${book.format === 'digital' ? 'badge-blue' : 'badge-gray'}`}>{book.format}</span></td>
                  <td>
                    <span style={{ color: book.available_copies === 0 ? '#f87171' : 'var(--sage)', fontWeight: 600, fontSize: 14 }}>{book.available_copies}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}> / {book.total_copies}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{book.shelf}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-ghost" style={{ padding: '5px 8px' }} onClick={() => { setSelected({ ...book, tags: book.tags?.join(', ') }); setModal('edit'); }}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-danger" style={{ padding: '5px 8px' }} onClick={() => { setSelected(book); setModal('delete'); }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination {...pagination} onChange={fetchBooks} />

      {/* Add modal */}
      {modal === 'add' && (
        <Modal title="Add New Book" onClose={() => setModal(null)} wide>
          <BookForm onSubmit={handleAdd} onClose={() => setModal(null)} loading={submitting} />
        </Modal>
      )}

      {/* Edit modal */}
      {modal === 'edit' && selected && (
        <Modal title="Edit Book" onClose={() => setModal(null)} wide>
          <BookForm initial={selected} onSubmit={handleEdit} onClose={() => setModal(null)} loading={submitting} />
        </Modal>
      )}

      {/* Delete confirmation */}
      {modal === 'delete' && selected && (
        <Modal title="Delete Book" onClose={() => setModal(null)}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
            Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{selected.title}</strong>? This cannot be undone. Books with active loans cannot be deleted.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-outline" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-danger" onClick={handleDelete} disabled={submitting}>
              {submitting ? <Spinner size={14} color="#f87171" /> : 'Delete Book'}
            </button>
          </div>
        </Modal>
      )}

      {/* Bulk Import modal */}
      {modal === 'import' && (
        <Modal title="Bulk Import Books" onClose={() => { setModal(null); setImportErrors([]); setImportText(''); }} wide>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            Paste a JSON array of books. Each must have at least: <code style={{ color: 'var(--gold)' }}>title</code>, <code style={{ color: 'var(--gold)' }}>author</code>, <code style={{ color: 'var(--gold)' }}>isbn</code>.
          </p>
          <textarea
            className="input-base"
            rows={10}
            placeholder={'[\n  { "title": "Clean Code", "author": "Robert Martin", "isbn": "9780132350884", "category": "Programming", "format": "physical", "total_copies": 3 }\n]'}
            value={importText}
            onChange={e => setImportText(e.target.value)}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, resize: 'vertical', marginBottom: 12 }}
          />
          {importErrors.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 12, marginBottom: 12, maxHeight: 150, overflow: 'auto' }}>
              {importErrors.map((e, i) => (
                <p key={i} style={{ fontSize: 12, color: '#f87171' }}>Row {e.row}{e.field ? ` · ${e.field}` : ''}: {e.msg}</p>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-outline" onClick={() => { setModal(null); setImportErrors([]); setImportText(''); }}>Cancel</button>
            <button className="btn-gold" onClick={handleImport}><Upload size={14} /> Import</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
