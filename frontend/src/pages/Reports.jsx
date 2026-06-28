import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const STATUS_META = {
  draft:     { label:'Utkast',     color:'bg-gray-100 text-gray-600'    },
  submitted: { label:'Inskickad',  color:'bg-blue-100 text-blue-700'    },
  reviewed:  { label:'Granskad',   color:'bg-yellow-100 text-yellow-700' },
  approved:  { label:'Attesterad', color:'bg-green-100 text-green-700'  },
  rejected:  { label:'Returnerad', color:'bg-red-100 text-red-700'      },
};

const TYPE_LABELS = {
  km_ers:      'Km-ersättning',
  utlagg:      'Utlägg',
  traktamente: 'Traktamente',
  sava:        'SÄVA',
};

function reportTitle(r) {
  const typ = TYPE_LABELS[r.report_type] || 'Km-ersättning';
  const akt = r.activity_title || r.description || '–';
  return `${typ} | ${akt}`;
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.draft;
  return <span className={`badge ${m.color}`}>{m.label}</span>;
}

export function CreateModal({ onClose, onCreated }) {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({
    report_type:         'km_ers',
    activity_id:         '',
    description:         '',   // used as activity label when activity_id=''
    report_date:         new Date().toISOString().slice(0,10),
    km:                  0,
    expenses:            0,
    expense_description: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.activities().then(setActivities); }, []);

  const useCalendar = form.activity_id !== '' && form.activity_id !== null;

  async function submit(e) {
    e.preventDefault();
    if (!useCalendar && !form.description.trim()) {
      alert('Ange vad redovisningen avser.'); return;
    }
    setSaving(true);
    try {
      await api.createReport({
        ...form,
        activity_id: form.activity_id || null,
      });
      onCreated();
    } catch(err) { alert(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-military-navy">Ny redovisning</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <form onSubmit={submit} className="px-6 py-4 space-y-3">

          {/* Typ */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Ersättningstyp</label>
            <select required value={form.report_type}
                    onChange={e => setForm(f=>({...f, report_type: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-military-steel">
              <option value="km_ers">Km-ersättning</option>
              <option value="utlagg">Utlägg</option>
              <option value="traktamente">Traktamente</option>
              <option value="sava">SÄVA (tid)</option>
            </select>
          </div>

          {/* Aktivitet */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Aktivitet</label>
            <select value={form.activity_id}
                    onChange={e => setForm(f=>({...f, activity_id: e.target.value, description: ''}))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-military-steel">
              <option value="">Övrigt (ange nedan)</option>
              {activities.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>

          {/* Övrigt-beskrivning när ingen aktivitet är vald */}
          {!useCalendar && (
            <div>
              <label className="text-xs text-gray-500 block mb-1">Vad avser redovisningen?</label>
              <input required value={form.description}
                     onChange={e => setForm(f=>({...f, description: e.target.value}))}
                     placeholder="t.ex. Förrådsbesök, Planeringsmöte…"
                     className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-military-steel" />
            </div>
          )}

          {/* Datum */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Datum</label>
            <input type="date" required value={form.report_date}
                   onChange={e => setForm(f=>({...f, report_date: e.target.value}))}
                   className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-military-steel" />
          </div>

          {/* Belopp / Tid */}
          <div className="grid grid-cols-2 gap-2">
            {form.report_type === 'km_ers' && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">Körmil</label>
                <input type="number" min="0" value={form.km}
                       onChange={e => setForm(f=>({...f, km: e.target.value}))}
                       className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
            )}
            {(form.report_type === 'utlagg' || form.report_type === 'traktamente') && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">Belopp (kr)</label>
                <input type="number" min="0" step="0.01" value={form.expenses}
                       onChange={e => setForm(f=>({...f, expenses: e.target.value}))}
                       className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
            )}
            {form.report_type === 'sava' && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">Antal timmar</label>
                <input type="number" min="0.5" step="0.5" value={form.hours}
                       onChange={e => setForm(f=>({...f, hours: e.target.value}))}
                       className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
            )}
          </div>

          {form.report_type === 'utlagg' && parseFloat(form.expenses) > 0 && (
            <>
              <input placeholder="Syfte för utlägg"
                     value={form.expense_description}
                     onChange={e => setForm(f=>({...f, expense_description: e.target.value}))}
                     className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none" />
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                Kom ihåg att skicka originalkvitto per post till MR-grupp/HR.
              </div>
            </>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Avbryt</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Sparar…' : 'Spara som utkast'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Reports() {
  const { hasRole } = useAuth();
  const [tab, setTab]               = useState('mine');
  const [reports, setReports]       = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  function load() {
    api.reports(tab === 'mine' ? '' : tab).then(setReports);
  }
  useEffect(load, [tab]);

  async function submit(id) {
    await api.submitReport(id).catch(e => alert(e.message));
    load();
  }
  async function review(id, action) {
    await api.reviewReport(id, action).catch(e => alert(e.message));
    load();
  }
  async function approve(id, action) {
    await api.approveReport(id, action).catch(e => alert(e.message));
    load();
  }

  const tabs = [
    ['mine',    'Mina'],
    ...(hasRole('pc')    ? [['review',  'Granska']]   : []),
    ...(hasRole('kompc') ? [['approve', 'Attestera']] : []),
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-military-navy">Utlägg / Km-ersättning</h1>
        {tab === 'mine' && (
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
            + Ny redovisning
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors
                    ${tab===key ? 'border-military-navy text-military-navy'
                                : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {label}
          </button>
        ))}
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">Inga rapporter</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {reports.map(r => (
              <li key={r.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Title: Typ | Aktivitet */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{reportTitle(r)}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    {/* Date + submitter */}
                    <div className="text-xs text-gray-400 mt-0.5">
                      {r.report_date}{r.user_name ? ` · ${r.user_name}` : ''}
                    </div>
                    {/* Amounts */}
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      {r.km > 0       && <span>{r.km} km</span>}
                      {r.hours > 0    && <span>{r.hours} tim</span>}
                      {r.expenses > 0 && <span className="text-yellow-700">{Number(r.expenses).toFixed(2)} kr</span>}
                      {r.expense_description && <span className="text-gray-400">— {r.expense_description}</span>}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                    {tab === 'mine' && r.status === 'draft' && (
                      <button onClick={() => submit(r.id)}
                              className="text-xs bg-military-navy text-white px-3 py-1 rounded hover:bg-[#16294a]">
                        Skicka in
                      </button>
                    )}
                    {tab === 'review' && (
                      <>
                        <button onClick={() => review(r.id,'approve')}
                                className="text-xs bg-green-600 text-white px-3 py-1 rounded">Godkänn</button>
                        <button onClick={() => review(r.id,'return')}
                                className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded">Returnera</button>
                      </>
                    )}
                    {tab === 'approve' && (
                      <>
                        <button onClick={() => approve(r.id,'approve')}
                                className="text-xs bg-green-600 text-white px-3 py-1 rounded">Attestera</button>
                        <button onClick={() => approve(r.id,'return')}
                                className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded">Returnera</button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)}
                     onCreated={() => { setShowCreate(false); load(); }} />
      )}
    </div>
  );
}
