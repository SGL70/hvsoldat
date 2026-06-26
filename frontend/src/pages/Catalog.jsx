import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

function imgSrc(item) {
  if (!item.image_path) return null;
  return `/img/${item.image_path}`;
}

function ArticleNumber({ value }) {
  if (!value) return <span className="text-gray-300">—</span>;
  return <span className="font-mono text-xs tracking-wider text-military-steel">{value}</span>;
}

function GridCard({ item, canEdit, onEdit, onDelete }) {
  const src = imgSrc(item);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
      <div className="bg-gray-50 aspect-[4/3] flex items-center justify-center overflow-hidden">
        {src
          ? <img src={src} alt={item.name} className="w-full h-full object-cover" />
          : <span className="text-4xl text-gray-200">📦</span>
        }
      </div>
      <div className="p-3 flex flex-col flex-1">
        <ArticleNumber value={item.article_number} />
        <h3 className="text-sm font-semibold text-gray-900 mt-1 leading-snug">{item.name}</h3>
        {item.part_of_article && (
          <p className="text-xs text-gray-400 mt-0.5">Ingår i: {item.part_of_article}</p>
        )}
        {item.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">Antal: {item.quantity}</span>
          {item.category && (
            <span className="text-xs badge bg-gray-100 text-gray-500">{item.category}</span>
          )}
        </div>
      </div>
      {canEdit && (
        <div className="px-3 pb-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(item)}
                  className="flex-1 text-xs py-1 rounded border border-military-steel text-military-steel hover:bg-military-steel hover:text-white transition-colors">
            Redigera
          </button>
          <button onClick={() => onDelete(item)}
                  className="text-xs px-2 py-1 rounded border border-red-300 text-red-400 hover:bg-red-50 transition-colors">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function ListRow({ item, canEdit, onEdit, onDelete }) {
  const src = imgSrc(item);
  return (
    <li className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 group">
      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
        {src
          ? <img src={src} alt="" className="w-full h-full object-cover" />
          : <span className="text-xl text-gray-300">📦</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">{item.name}</span>
          <ArticleNumber value={item.article_number} />
        </div>
        {item.part_of_article && (
          <span className="text-xs text-gray-400">Ingår i: {item.part_of_article} · </span>
        )}
        {item.description && (
          <span className="text-xs text-gray-500 truncate">{item.description}</span>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {item.category && (
          <span className="text-xs badge bg-gray-100 text-gray-500 hidden sm:inline">{item.category}</span>
        )}
        <span className="text-xs text-gray-400 w-16 text-right">× {item.quantity}</span>
        {canEdit && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(item)}
                    className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-500 hover:border-military-steel hover:text-military-steel transition-colors">
              Redigera
            </button>
            <button onClick={() => onDelete(item)}
                    className="text-xs px-2 py-1 rounded border border-red-200 text-red-400 hover:bg-red-50 transition-colors">
              ✕
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

function ItemModal({ item, onClose, onSaved }) {
  const isNew = !item?.id;
  const [form, setForm] = useState({
    article_number:  item?.article_number  || '',
    name:            item?.name            || '',
    description:     item?.description     || '',
    category:        item?.category        || '',
    quantity:        item?.quantity        || 1,
    part_of_article: item?.part_of_article || '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState(imgSrc(item));
  const [saving, setSaving]       = useState(false);
  const fileRef = useRef();

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  function pickImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = isNew
        ? await api.createCatalogItem(form)
        : await api.updateCatalogItem(item.id, form);
      if (imageFile) await api.uploadCatalogImage(saved.id, imageFile);
      onSaved();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="font-semibold text-military-navy">{isNew ? 'Ny artikel' : 'Redigera artikel'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50
                            flex items-center justify-center overflow-hidden cursor-pointer hover:border-military-steel transition-colors"
                 onClick={() => fileRef.current?.click()}>
              {preview
                ? <img src={preview} alt="" className="w-full h-full object-cover" />
                : <span className="text-3xl text-gray-200">📷</span>
              }
            </div>
            <div>
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary text-xs">
                {preview ? 'Byt bild' : 'Ladda upp bild'}
              </button>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG · max 5 MB</p>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Benämning *</label>
              <input required value={form.name} onChange={f('name')}
                     placeholder="Sovsäck, stridsvärja, ..."
                     className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-military-steel" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Artikelnummer</label>
              <input value={form.article_number} onChange={f('article_number')}
                     placeholder="M1234-123 456"
                     className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-military-steel" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Kategori</label>
              <input value={form.category} onChange={f('category')}
                     placeholder="Beklädnad, Fältmateriel, ..."
                     className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-military-steel" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Antal</label>
              <input type="number" min="1" value={form.quantity} onChange={f('quantity')}
                     className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-military-steel" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Ingår i artikel</label>
              <input value={form.part_of_article} onChange={f('part_of_article')}
                     placeholder="M1234-000 000"
                     className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-military-steel" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Beskrivning</label>
              <textarea value={form.description} onChange={f('description')} rows={3}
                        placeholder="Ingår i fältpersedel typ A. Används vid..."
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-military-steel" />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Avbryt</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Sparar…' : isNew ? 'Skapa artikel' : 'Spara ändringar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Exported as embedded component — no page wrapper */
export default function CatalogTab() {
  const { hasRole } = useAuth();
  const canEdit = hasRole('kvm');

  const [items, setItems]         = useState([]);
  const [view, setView]           = useState('grid');
  const [search, setSearch]       = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [editing, setEditing]     = useState(null);
  const [loading, setLoading]     = useState(true);

  function load() {
    setLoading(true);
    api.catalog().then(setItems).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function del(item) {
    if (!confirm(`Ta bort "${item.name}"?`)) return;
    await api.deleteCatalogItem(item.id).catch(e => alert(e.message));
    load();
  }

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))].sort();

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      i.name.toLowerCase().includes(q) ||
      (i.article_number || '').toLowerCase().includes(q) ||
      (i.description || '').toLowerCase().includes(q);
    return matchSearch && (!catFilter || i.category === catFilter);
  });

  const grouped = filtered.reduce((acc, i) => {
    const k = i.category || 'Övrigt';
    (acc[k] = acc[k] || []).push(i);
    return acc;
  }, {});

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex gap-2 flex-1 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="Sök artikel eller nummer…"
                 className="flex-1 min-w-40 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-military-steel" />
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none">
            <option value="">Alla kategorier</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => setView('grid')}
                    className={`px-3 py-1.5 text-sm transition-colors
                      ${view === 'grid' ? 'bg-military-navy text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              ▦
            </button>
            <button onClick={() => setView('list')}
                    className={`px-3 py-1.5 text-sm border-l border-gray-200 transition-colors
                      ${view === 'list' ? 'bg-military-navy text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              ☰
            </button>
          </div>
          {canEdit && (
            <button onClick={() => setEditing({})} className="btn-primary text-sm">+ Ny artikel</button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Laddar…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {items.length === 0
            ? 'Katalogen är tom — lägg till den första artikeln.'
            : 'Inga träffar'}
        </div>
      ) : (
        Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b, 'sv')).map(([cat, catItems]) => (
          <div key={cat} className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{cat}</h2>
            {view === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {catItems.map(i => (
                  <GridCard key={i.id} item={i} canEdit={canEdit} onEdit={setEditing} onDelete={del} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <ul className="divide-y divide-gray-100">
                  {catItems.map(i => (
                    <ListRow key={i.id} item={i} canEdit={canEdit} onEdit={setEditing} onDelete={del} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      )}

      {editing !== null && (
        <ItemModal
          item={editing?.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </>
  );
}
