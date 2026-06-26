import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('sv-SE', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return [
    String(d.getFullYear()),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

function Row({ num, label, value, note }) {
  return (
    <tr className="border-b border-gray-200">
      <td className="py-2 pr-3 text-right text-xs font-mono text-gray-400 w-10 align-top">{num}</td>
      <td className="py-2 pr-4 text-xs text-gray-500 w-48 align-top">{label}</td>
      <td className="py-2 text-sm font-medium text-gray-900 align-top">
        {value || <span className="text-gray-300 italic">—</span>}
        {note && <div className="text-xs text-gray-400 font-normal mt-0.5">{note}</div>}
      </td>
    </tr>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-xs font-bold uppercase tracking-widest text-military-steel mb-3
                     border-b border-military-steel pb-1">
        {title}
      </h2>
      <table className="w-full">{children}</table>
    </div>
  );
}

export default function LossReport() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr]   = useState('');

  useEffect(() => {
    api.getCase(id).then(setData).catch(e => setErr(e.message));
  }, [id]);

  if (err)  return <div className="p-8 text-red-600">{err}</div>;
  if (!data) return <div className="p-8 text-gray-400">Laddar…</div>;

  const created = new Date(data.created_at);

  return (
    <>
      {/* Print controls — hidden when printing */}
      <div className="print:hidden bg-military-navy text-white px-6 py-3 flex items-center gap-4">
        <Link to="/utrustning" className="text-white/60 hover:text-white text-sm">← Tillbaka</Link>
        <span className="text-sm font-medium flex-1">Förbered blankett — {data.equipment_name}</span>
        <button onClick={() => window.print()}
                className="bg-white text-military-navy text-sm font-medium px-4 py-1.5 rounded hover:bg-gray-100">
          Skriv ut
        </button>
      </div>

      {/* Print content */}
      <div className="max-w-3xl mx-auto p-8 print:p-0 print:max-w-none">

        {/* Header */}
        <div className="mb-8 print:mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-military-navy print:text-black">
                FÖRLUSTFÖRTECKNING – ANMÄLAN
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Blankett M7102-500360E · Hv-webben förberedelsesida
              </p>
            </div>
            <div className="text-right text-xs text-gray-400">
              <div>Ärende #{data.id}</div>
              <div>Skapat {fmt(data.created_at)}</div>
            </div>
          </div>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-xs text-yellow-800 print:hidden">
            Fyll i blanketten med hjälp av uppgifterna nedan. Fältnumren matchar blankett M7102-500360E.
            Fält markerade med <em>fylls i manuellt</em> hämtas inte från systemet.
          </div>
        </div>

        {/* Systemuppgifter */}
        <Section title="Hämtas från systemet">
          <tbody>
            <Row num="2"  label="Upprättad"
                 value={`${created.getFullYear()} / ${String(created.getMonth()+1).padStart(2,'0')} / ${String(created.getDate()).padStart(2,'0')}`}
                 note="År / Mån / Dag" />
            <Row num="6"  label="Personnr och namn"
                 value={`${data.personal_number}  ${data.user_name}`} />
            <Row num="20" label="Förrådsbeteckning"
                 value={data.article_number} />
            <Row num="23" label="Förrådsbenämning"
                 value={data.equipment_name} />
            <Row num="22" label="Antal"
                 value={String(data.quantity)} />
            <Row num="—"  label="Enhet / Organisation"
                 value={data.unit_name} />
          </tbody>
        </Section>

        {/* Omständigheter (sida 3) */}
        <Section title="Omständigheter — sida 3 på blanketten">
          <tbody>
            <Row num="—" label="Tid för förlusten"
                 value={data.incident_time ? fmt(data.incident_time) : null} />
            <Row num="—" label="Plats för förlusten"
                 value={data.incident_location} />
            <Row num="—" label="Redogörelse (omständigheter)"
                 value={data.incident_description
                   ? <span className="whitespace-pre-wrap">{data.incident_description}</span>
                   : null} />
            <Row num="—" label="Vittnen / personer som känner till förlusten"
                 value={data.witnesses
                   ? <span className="whitespace-pre-wrap">{data.witnesses}</span>
                   : null} />
            <Row num="—" label="Medger att ersätta förlusten"
                 value={data.agrees_to_compensate === true  ? 'Ja'
                      : data.agrees_to_compensate === false ? 'Nej'
                      : null} />
          </tbody>
        </Section>

        {/* Ärendebeskrivning */}
        {data.description && (
          <Section title="Ärendebeskrivning (från anmälan)">
            <tbody>
              <Row num="—" label="Beskrivning"
                   value={<span className="whitespace-pre-wrap">{data.description}</span>} />
            </tbody>
          </Section>
        )}

        {/* Manuella fält */}
        <Section title="Fylls i manuellt av KVM">
          <tbody>
            <Row num="3"  label="Transkod"        value={null} note="Hämtas från PRIO/FMLOG" />
            <Row num="4"  label="Verifnr"         value={null} note="Tilldelas vid handläggning" />
            <Row num="5"  label="Materielutlämnare" value={null} note="KVM:s namn och enhet" />
            <Row num="7"  label="Avg-typ"         value={null} />
            <Row num="8"  label="Konto"           value={null} note="Konteras enl gällande kontoplan" />
            <Row num="9"  label="Förrådsplats"    value={null} />
            <Row num="10" label="Kloss"           value={null} />
            <Row num="21" label="A-typ"           value={null} note="Ej vid komp (motsv)" />
            <Row num="24" label="Enhet"           value={null} note="st, par, set …" />
            <Row num="26" label="à-pris"          value={null} />
            <Row num="27" label="Belopp"          value={null} />
            <Row num="30" label="Motsv mtrl beställs" value={null} note="Kryssa ruta på blanketten" />
            <Row num="40" label="Beslut"          value={null} note="Överlämnas / Ersatt / Avslutas" />
            <Row num="—"  label="Kompadj sign"    value={null} />
            <Row num="—"  label="Underskrift + tjänstegrad" value={null} />
          </tbody>
        </Section>

        {/* Nedladdning */}
        <div className="print:hidden mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="flex-1 text-sm text-gray-600">Ladda ned den officiella blanketten:</div>
          <a href="/uploads/docs/forlustforteckning.pdf" target="_blank"
             className="btn-primary text-sm">
            Öppna blankett (PDF)
          </a>
        </div>

        {/* Print footer */}
        <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-xs text-gray-400">
          Hv-webben · Ärendeid {data.id} · Utskrivet {new Date().toLocaleString('sv-SE')}
        </div>
      </div>
    </>
  );
}
