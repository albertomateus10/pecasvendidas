/* ===== Registro do Plugin de Rótulos do Chart.js ===== */
if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
}

/* ===== Helpers UI ===== */
function showError(msg) { const el = document.getElementById('alertError'); el.querySelector('.msg').textContent = msg; el.classList.add('show'); }
function showWarn(msg) { const el = document.getElementById('alertWarn'); el.querySelector('.msg').textContent = msg; el.classList.add('show'); }

/* ===== Util ===== */
const $ = s => document.querySelector(s);
const BRL = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(+v || 0);
const NUM = v => new Intl.NumberFormat('pt-BR').format(+v || 0);
const PCT = v => (Number.isFinite(v) ? v.toFixed(1).replace('.', ',') : '—') + '%';

/* ===== Scroll estável ===== */
function withStableScroll(fn) {
    const x = window.pageXOffset || 0;
    const y = window.pageYOffset || 0;
    fn();
    requestAnimationFrame(() => {
        window.scrollTo(x, y);
        requestAnimationFrame(() => { window.scrollTo(x, y); });
    });
}

/* ===== Conversões ===== */
function toNumberBR(x) {
    if (x === null || x === undefined || x === '') return 0;
    if (typeof x === 'number') return x;
    const s = String(x).trim();
    const clean = s.replace(/[R$\s]/g, '').replace(/\./g, '').replace(/,/g, '.');
    const n = parseFloat(clean);
    return isNaN(n) ? 0 : n;
}
function parseDateExcel(v) {
    if (typeof v === 'number') {
        const base = new Date(Date.UTC(1899, 11, 30));
        return new Date(base.getTime() + v * 86400000);
    }
    const d = new Date(v); return isNaN(+d) ? null : d;
}
function monthNameFromCell(cell) {
    const nomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    if (cell === null || cell === undefined || cell === '') return 'Não informado';

    if (typeof cell === 'string') {
        const m = cell.match(/\/(\d{2})\/(\d{4})/);
        if (m) {
            const mm = parseInt(m[1], 10);
            const aaaa = m[2];
            if (mm >= 1 && mm <= 12) {
                const nome = nomes[mm - 1];
                return (nome.charAt(0).toUpperCase() + nome.slice(1)) + ' ' + aaaa;
            }
        }
        const d = new Date(cell);
        if (!isNaN(+d)) {
            const nome = d.toLocaleDateString('pt-BR', { month: 'long' });
            const aaaa = d.getFullYear();
            return (nome.charAt(0).toUpperCase() + nome.slice(1)) + ' ' + aaaa;
        }
        return 'Não informado';
    }

    if (typeof cell === 'number') {
        const d = parseDateExcel(cell);
        if (d) {
            const nome = d.toLocaleDateString('pt-BR', { month: 'long' });
            const aaaa = d.getFullYear();
            return (nome.charAt(0).toUpperCase() + nome.slice(1)) + ' ' + aaaa;
        }
        return 'Não informado';
    }

    const d = new Date(cell);
    if (!isNaN(+d)) {
        const nome = d.toLocaleDateString('pt-BR', { month: 'long' });
        const aaaa = d.getFullYear();
        return (nome.charAt(0).toUpperCase() + nome.slice(1)) + ' ' + aaaa;
    }
    return 'Não informado';
}

function dayFromCell(cell) {
    if (cell === null || cell === undefined || cell === '') return null;
    if (typeof cell === 'number') {
        const d = parseDateExcel(cell);
        return d ? d.getDate() : null;
    }
    if (typeof cell === 'string') {
        const m = cell.match(/^(\d{2})\//);
        if (m) return parseInt(m[1], 10);
        const d = new Date(cell);
        return isNaN(+d) ? null : d.getDate();
    }
    const d = new Date(cell);
    return isNaN(+d) ? null : d.getDate();
}

function modelBase(txt) {
    if (!txt) return 'Não informado';
    const u = String(txt).toUpperCase();
    const cats = ['ARGO', 'CRONOS', 'MOBI', 'UNO', 'STRADA', 'TORO', 'FIORINO', 'DUCATO', 'HB20', 'HB20S', 'CRETA', 'GOL', 'POLO', 'VIRTUS', 'T-CROSS', 'GOLF', 'UP', 'PRISMA', 'ONIX', 'TRACKER', 'S10', 'ECOSPORT', 'KA', 'RANGER', 'CIVIC', 'CITY', 'FIT', 'COROLLA', 'HILUX', 'RAV4', 'PULSE', 'AGILE', 'AIRCROSS', 'ALL'];
    for (const c of cats) { if (u.includes(c)) return c; }
    return u.split(/\s+/).find(w => w.length > 2) || 'Outros';
}
function normalizeYear(val) {
    if (val === null || val === undefined || val === '') return null;
    const s = String(val).trim();
    const m4 = s.match(/\b(19|20)\d{2}\b/g);
    if (m4 && m4.length) return parseInt(m4.map(Number).sort((a, b) => b - a)[0], 10);
    const m2pair = s.match(/\b(\d{2})\s*[/\-]\s*(\d{2})\b/);
    if (m2pair) {
        const a = parseInt(m2pair[1], 10), b = parseInt(m2pair[2], 10);
        const two = Math.max(a, b);
        const now2 = new Date().getFullYear() % 100;
        const century = two <= now2 + 1 ? 2000 : 1900;
        return century + two;
    }
    const n = toNumberBR(s);
    if (Number.isFinite(n)) {
        if (n >= 1900 && n <= 2099) return Math.floor(n);
        if (n >= 0 && n < 100) {
            const now2 = new Date().getFullYear() % 100;
            const century = n <= now2 + 1 ? 2000 : 1900;
            return century + Math.floor(n);
        }
    }
    return null;
}
function normalizePlate(val) {
    if (val === null || val === undefined) return 'Não informado';
    let s = String(val).toUpperCase().trim();
    if (!s) return 'Não informado';
    const raw = s.replace(/[^A-Z0-9]/g, '');
    if (raw.length === 7) {
        if (/\d{4}$/.test(raw)) return raw.slice(0, 3) + '-' + raw.slice(3);
        return raw;
    }
    return s;
}

/* ====== NORMALIZADOR DE COR (usa coluna COR) ====== */
function normalizeColorName(raw) {
    if (raw === null || raw === undefined) return 'NÃO INFORMADA';
    let s = String(raw).toUpperCase();
    if (!s.trim()) return 'NÃO INFORMADA';

    // remove acentos simples
    s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // mapeamento direto por palavras-chave (primeira cor que aparecer)
    const cores = [
        'PRETO', 'BRANCO', 'CINZA', 'PRATA', 'AZUL', 'VERMELHO', 'VERDE', 'AMARELO', 'MARROM', 'BEGE', 'DOURADO', 'LARANJA', 'ROXO', 'GRAFITE'
    ];
    for (const c of cores) {
        const re = new RegExp(`\\b${c}\\b`);
        if (re.test(s)) return c === 'GRAFITE' ? 'CINZA' : c;
    }

    // fallback: primeira palavra (muito útil para "AZUL AMALFI TETO PRE")
    const first = s.split(/\s+/)[0];
    return cores.includes(first) ? (first === 'GRAFITE' ? 'CINZA' : first) : first;
}

function findCol(headers, aliases) {
    const lc = headers.map(h => String(h || '').toLowerCase().trim());
    for (const a of aliases) {
        const idx = lc.indexOf(a.toLowerCase());
        if (idx >= 0) return idx;
    }
    return -1;
}

/* ===== Estado ===== */
let allData = [];
let filtered = [];
let charts = { periodo: null, valorItem: null, loja: null, modelo: null, vendedorValor: null, faixas: null, diasEstoque: null };

/* placas excluídas */
const excludedPlates = new Set();

const state = { search: '', Loja: [], Vendedor: [], Modelo: [], Mes: [], Nota: [], CodItem: [], GrupoInterno: [], Dias: [] };
const sortState = { key: null, type: null, dir: 'desc' };

/* ===== Estado da Tabela sob Demanda ===== */
let tableLoaded = false;
let barFilter = null; // { type: 'periodo'|'valorItem'|'modelo'|'loja'|'faixas'|'vendedorValor'|'diasEstoque', label: string }
let currentPage = 1;
const pageSize = 50;


/* ===== Pílulas ===== */
class MultiPill {
    constructor({ label, getter, setter }) {
        this.getter = getter; this.setter = setter;
        this.el = document.createElement('div');
        this.el.className = 'pill'; this.el.tabIndex = 0;
        this.el.innerHTML = `<strong>${label}:</strong> <span class="value">Todos</span> <i class="fa-solid fa-chevron-down chev"></i><div class="menu"></div>`;
        this.menu = this.el.querySelector('.menu'); this.valueEl = this.el.querySelector('.value');
        this.searchInput = null;

        this.el.addEventListener('click', e => {
            if (!e.target.closest('.menu')) {
                const x = window.pageXOffset, y = window.pageYOffset;
                this.el.classList.toggle('open');
                if (this.searchInput) this.searchInput.focus();
                window.scrollTo(x, y);
            }
        });
        document.addEventListener('click', e => {
            if (!this.el.contains(e.target)) {
                const x = window.pageXOffset, y = window.pageYOffset;
                this.el.classList.remove('open');
                window.scrollTo(x, y);
            }
        });
    }
    setOptions(opts, { keepOrder = false } = {}) {
        const unique = [...new Set(opts.filter(Boolean))];
        this.options = keepOrder ? unique : unique.sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));
        this.render();
    }
    render() {
        const sel = new Set(this.getter());
        this.menu.innerHTML = '';
        const s = document.createElement('input');
        s.placeholder = 'Pesquisar...'; s.className = 'menu-search'; this.menu.append(s); this.searchInput = s;
        const acts = document.createElement('div'); acts.className = 'menu-actions';
        const limpar = document.createElement('button'); limpar.textContent = 'Limpar';
        const aplicar = document.createElement('button'); aplicar.textContent = 'Aplicar'; aplicar.className = 'apply';
        acts.append(limpar, aplicar); this.menu.append(acts);
        const list = document.createElement('div'); list.className = 'list'; this.menu.append(list);

        for (const o of this.options) {
            const row = document.createElement('label'); row.className = 'opt'; row.dataset.text = String(o).toLowerCase();
            const chk = document.createElement('input'); chk.type = 'checkbox'; chk.value = o; chk.checked = sel.has(o);
            row.append(chk, document.createElement('span')); row.lastChild.textContent = o;
            list.append(row);
        }

        s.oninput = () => {
            const q = s.value.toLowerCase();
            list.querySelectorAll('.opt').forEach(el => {
                el.style.display = el.dataset.text.includes(q) ? '' : 'none';
            });
        };

        limpar.onclick = () => withStableScroll(() => {
            this.setter([]);
            this.sync();
            applyFilters();
        });
        aplicar.onclick = () => withStableScroll(() => {
            const vals = [...list.querySelectorAll('input:checked')].map(i => i.value);
            this.setter(vals);
            this.el.classList.remove('open');
            this.sync();
            applyFilters();
        });

        list.addEventListener('click', (ev) => {
            const input = ev.target.closest('input[type="checkbox"]');
            if (!input) return;
            const temp = new Set(this.getter());
            if (input.checked) temp.add(input.value); else temp.delete(input.value);
            const arr = [...temp];
            this.valueEl.textContent = !arr.length ? 'Todos' : (arr.length <= 2 ? arr.join(', ') : `${arr[0]}, ${arr[1]} (+${arr.length - 2})`);
        });

        this.sync();
    }
    sync() {
        const v = this.getter();
        this.valueEl.textContent = !v || v.length === 0 ? 'Todos' : (v.length <= 2 ? v.join(', ') : `${v[0]}, ${v[1]} (+${v.length - 2})`);
    }
}
const pillInstances = {
    Mes: new MultiPill({ label: 'Período', getter: () => state.Mes, setter: v => state.Mes = v }),
    Loja: new MultiPill({ label: 'Loja', getter: () => state.Loja, setter: v => state.Loja = v }),
    Vendedor: new MultiPill({ label: 'Vendedor', getter: () => state.Vendedor, setter: v => state.Vendedor = v }),
    Modelo: new MultiPill({ label: 'Peça', getter: () => state.Modelo, setter: v => state.Modelo = v }),
    Nota: new MultiPill({ label: 'Número da Nota', getter: () => state.Nota, setter: v => state.Nota = v }),
    CodItem: new MultiPill({ label: 'Cód. Item', getter: () => state.CodItem, setter: v => state.CodItem = v }),
    GrupoInterno: new MultiPill({ label: 'Grupo Interno', getter: () => state.GrupoInterno, setter: v => state.GrupoInterno = v }),
    Dias: new MultiPill({ label: 'Dias', getter: () => state.Dias, setter: v => state.Dias = v }),
};
(function mountPills() {
    const holder = document.getElementById('filters');
    ['Mes', 'Loja', 'Vendedor', 'Modelo', 'Nota', 'CodItem', 'GrupoInterno', 'Dias'].forEach(k => {
        holder.appendChild(pillInstances[k].el);
    });
})();

/* ===== Upload ===== */
const fileInput = document.getElementById('fileInput');
const fileNameEl = document.getElementById('fileName');
fileInput.addEventListener('change', ev => { const f = ev.target.files?.[0]; if (f) { fileNameEl.textContent = f.name; readFile(f); } });

/* ===== Parser ===== */
async function readFile(file) {
    try {
        if (!window.XLSX) { showError('Biblioteca XLSX não carregada. Verifique sua internet.'); return; }
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        if (!['xlsx', 'xls', 'csv'].includes(ext)) {
            showWarn('Formato não suportado. Use .xlsx, .xls ou .csv'); return;
        }
        if (ext === 'csv') {
            const text = await file.text();
            const wb = XLSX.read(text, { type: 'string' });
            processWorkbook(wb);
        } else {
            const buf = await file.arrayBuffer();
            const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
            processWorkbook(wb);
        }
    } catch (err) {
        console.error(err);
        showError('Falha ao ler o arquivo. Verifique se não está protegido e se possui ao menos uma planilha com dados.');
    }
}

/* ===== Processamento ===== */
function processWorkbook(wb) {
    const name = wb.SheetNames.find(n => {
        const ws = wb.Sheets[n];
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
        return (range.e.r - range.s.r) >= 1;
    }) || wb.SheetNames[0];

    const ws = wb.Sheets[name];
    if (!ws) { showError('A planilha parece vazia.'); return; }

    const mat = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
    if (!mat || !mat.length) { showError('Não encontrei linhas com dados.'); return; }

    let headerIdx = detectHeaderRow(mat);
    const headers = (mat[headerIdx] || []).map(x => String(x || '').trim());
    const dataRows = mat.slice(headerIdx + 1);

    if (headers.filter(x => x).length < 2) {
        showWarn('Não consegui identificar o cabeçalho com clareza. Vou considerar a primeira linha com dados.');
    }

    parseRows(headers, dataRows);
}
function detectHeaderRow(mat) {
    let best = 0, bestIdx = 0;
    const maxCheck = Math.min(10, mat.length);
    for (let i = 0; i < maxCheck; i++) {
        const row = mat[i] || [];
        const filled = row.filter(c => c !== undefined && c !== null && String(c).trim() !== '').length;
        const hasText = row.some(c => typeof c === 'string' && c.trim().length > 0);
        if (hasText && filled > best) { best = filled; bestIdx = i; }
    }
    return bestIdx;
}

/* ===== Leitura das linhas ===== */
/* Mapeamento de código de loja */
function mapLoja(raw) {
    const s = String(raw ?? '').trim();
    if (s === '10') return 'Matriz';
    if (s === '11') return 'Zona Sul';
    if (s === '12') return 'Viamão';
    if (s === '13') return 'Gravataí';
    return s || 'Não informado';
}

function parseRows(headers, data) {
    const idx = {
        vendedor: findCol(headers, ['Vendedor', 'VENDEDOR']),
        loja: 0, /* coluna A conforme especificado */
        codItem: findCol(headers, ['Cód. Item', 'Cd. Item', 'Cod Item', 'Item']),
        descricao: findCol(headers, ['Descrição', 'Descricao', 'Descriao', 'DESCRIÇÃO']),
        quantidade: findCol(headers, ['Quantidade', 'Qtde', 'Qtd', 'QUANTIDADE']),
        precoFinal: findCol(headers, ['Preço Final', 'Preco Final', 'Valor', 'PREÇO FINAL']),
        venda: findCol(headers, ['Venda', 'Data Venda', 'Data', 'DATA']),
        nota: findCol(headers, ['Nota', 'NF', 'NOTA']),
        grupoInterno: 18, /* coluna S (índice 18) */
        qtdPecas: 7,     /* coluna H (índice 7) */
        giro: 2,         /* coluna C (índice 2) */
    };

    allData = data.map(r => {
        const get = (i) => i >= 0 ? r[i] : undefined;
        const vendaCell = get(idx.venda);
        const mesCap = monthNameFromCell(vendaCell);

        return {
            Vendedor: get(idx.vendedor) ?? 'Não informado',
            Loja: mapLoja(r[0]),
            DataVenda: vendaCell ? (typeof vendaCell === 'number' ? parseDateExcel(vendaCell).toLocaleDateString('pt-BR') : String(vendaCell)) : '—',
            Nota: get(idx.nota) ?? '—',
            Giro: (() => { const g = toNumberBR(get(idx.giro)); return g >= 46000 ? 1001 : g; })(),
            CodItem: get(idx.codItem) ?? '—',
            QtdPecas: toNumberBR(get(idx.qtdPecas)),
            GrupoInterno: String(get(idx.grupoInterno) ?? '—').trim() || '—',
            Descricao: get(idx.descricao) ?? '—',
            Quantidade: toNumberBR(get(idx.quantidade)),
            PrecoFinal: toNumberBR(get(idx.precoFinal)),
            MesNome: mesCap,
            DiaVenda: dayFromCell(vendaCell)
        };
    });

    pillInstances.Loja.setOptions(allData.map(x => x.Loja));
    pillInstances.Vendedor.setOptions(allData.map(x => x.Vendedor));
    pillInstances.Modelo.setOptions(allData.map(x => x.Descricao));
    pillInstances.Nota.setOptions(allData.map(x => x.Nota));
    pillInstances.CodItem.setOptions(allData.map(x => x.CodItem));
    pillInstances.GrupoInterno.setOptions(allData.map(x => x.GrupoInterno));

    /* Filtro Dias — faixas fixas baseadas na coluna C */
    const FAIXAS_DIAS = [
        '0 a 90',
        '91 a 180',
        '181 a 365',
        '366 a 1000',
        '1001 ou mais',
    ];
    pillInstances.Dias.setOptions(FAIXAS_DIAS, { keepOrder: true });

    const orderMes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mesesUnicos = [...new Set(allData
        .map(x => x.MesNome)
        .filter(m => m && m !== 'Não informado'))]
        .sort((a, b) => {
            const pa = a.split(' '), pb = b.split(' ');
            const ma = orderMes.indexOf(pa[0].toLowerCase()), mb = orderMes.indexOf(pb[0].toLowerCase());
            const ya = parseInt(pa[1], 10), yb = parseInt(pb[1], 10);
            if (ya !== yb) return ya - yb;
            return ma - mb;
        });
    pillInstances.Mes.setOptions(mesesUnicos, { keepOrder: true });

    applyFilters();
}

/* ===== Busca e Limpar ===== */
document.getElementById('q').addEventListener('input', e => { state.search = e.target.value.toLowerCase(); withStableScroll(() => applyFilters()); });
document.getElementById('clearAll').addEventListener('click', () => {
    withStableScroll(() => {
        state.search = ''; document.getElementById('q').value = '';
        state.Loja = []; state.Vendedor = []; state.Modelo = []; state.Mes = [];
        state.Nota = []; state.CodItem = []; state.GrupoInterno = []; state.Dias = [];
        Object.values(pillInstances).forEach(p => { p.setter([]); p.render(); p.sync(); });
        applyFilters();
    });
});

function applyFilters() {
    filtered = allData.filter(r => {
        const lojaOk = state.Loja.length === 0 || state.Loja.includes(r.Loja);
        const vendOk = state.Vendedor.length === 0 || state.Vendedor.includes(r.Vendedor);
        const modOk = state.Modelo.length === 0 || state.Modelo.includes(r.Descricao);
        const mesOk = state.Mes.length === 0 || state.Mes.includes(r.MesNome);
        const notaOk = state.Nota.length === 0 || state.Nota.includes(r.Nota);
        const codOk = state.CodItem.length === 0 || state.CodItem.includes(r.CodItem);
        const grupoOk = state.GrupoInterno.length === 0 || state.GrupoInterno.includes(r.GrupoInterno);
        const diasOk = state.Dias.length === 0 || state.Dias.some(faixa => {
            const g = +r.Giro || 0;
            if (faixa === '0 a 90')       return g >= 0 && g <= 90;
            if (faixa === '91 a 180')     return g >= 91 && g <= 180;
            if (faixa === '181 a 365')    return g >= 181 && g <= 365;
            if (faixa === '366 a 1000')   return g >= 366 && g <= 1000;
            if (faixa === '1001 ou mais') return g >= 1001;
            return false;
        });

        const q = state.search;
        const qOk = !q || [r.CodItem, r.Descricao].some(vv => (vv || '').toString().toLowerCase().includes(q));

        return lojaOk && vendOk && modOk && mesOk && notaOk && codOk && grupoOk && diasOk && qOk;
    });
    currentPage = 1;
    renderKpiGroups();
    renderCharts(filtered);
    renderTableSection();
}

/* ===== Filtro de Barra dos Gráficos ===== */
function filterByBar(rows, filter) {
    if (!filter || !filter.label) return rows;
    const { type, label } = filter;

    return rows.filter(r => {
        if (type === 'periodo') return r.MesNome === label;
        if (type === 'valorItem' || type === 'modelo') return (r.Descricao || '—') === label;
        if (type === 'loja') return (r.Loja || 'Não informado') === label;
        if (type === 'vendedorValor') return (r.Vendedor || 'Não informado') === label;
        if (type === 'faixas') {
            const v = +r.PrecoFinal || 0;
            if (label === 'Até R$ 50') return v <= 50;
            if (label === 'R$ 50–200') return v > 50 && v <= 200;
            if (label === 'R$ 200–500') return v > 200 && v <= 500;
            if (label === 'R$ 500–1000') return v > 500 && v <= 1000;
            if (label === 'R$ 1000+') return v > 1000;
            return false;
        }
        if (type === 'diasEstoque') {
            const g = +r.Giro || 0;
            if (label === '0 a 90') return g >= 0 && g <= 90;
            if (label === '91 a 180') return g >= 91 && g <= 180;
            if (label === '181 a 365') return g >= 181 && g <= 365;
            if (label === '366 a 1000') return g >= 366 && g <= 1000;
            if (label === '1001 ou mais') return g >= 1001;
            return false;
        }
        return true;
    });
}

function renderTableSection() {
    const chipEl = document.getElementById('barFilterChip');
    const clearBtn = document.getElementById('clearBarFilterBtn');
    const toggleBtn = document.getElementById('toggleTableBtn');
    const placeholder = document.getElementById('tablePlaceholder');
    const gridWrap = document.getElementById('gridWrap');

    let currentRows = barFilter ? filterByBar(filtered, barFilter) : filtered;

    if (barFilter && barFilter.label) {
        chipEl.style.display = 'inline-block';
        chipEl.textContent = `Filtrado por: ${barFilter.label} (${NUM(currentRows.length)} peças)`;
        clearBtn.style.display = 'inline-block';
    } else {
        chipEl.style.display = 'none';
        clearBtn.style.display = 'none';
    }

    if (!tableLoaded) {
        placeholder.style.display = 'block';
        gridWrap.style.display = 'none';
        toggleBtn.innerHTML = `<i class="fa-solid fa-folder-open"></i> Carregar Peças (${NUM(currentRows.length)})`;
    } else {
        placeholder.style.display = 'none';
        gridWrap.style.display = 'block';
        toggleBtn.innerHTML = `<i class="fa-solid fa-folder-minus"></i> Ocultar Peças`;

        const sorted = sortRows([...currentRows]);
        renderTableSlice(sorted);
    }
}

function renderTableSlice(rows) {
    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, total);
    const slice = rows.slice(startIdx, endIdx);

    renderTable(slice);

    const pagEl = document.getElementById('tablePagination');
    if (!pagEl) return;

    if (total === 0) {
        pagEl.innerHTML = `<div class="pagination-info">Nenhuma peça para exibir</div>`;
        return;
    }

    pagEl.innerHTML = `
        <div class="pagination-info">Exibindo ${NUM(startIdx + 1)}–${NUM(endIdx)} de ${NUM(total)} peças</div>
        <div class="pagination-controls">
            <button class="pagination-btn" id="pagFirst" ${currentPage === 1 ? 'disabled' : ''}><i class="fa-solid fa-angles-left"></i></button>
            <button class="pagination-btn" id="pagPrev" ${currentPage === 1 ? 'disabled' : ''}><i class="fa-solid fa-angle-left"></i></button>
            <span class="pagination-info" style="margin: 0 6px;">Pág. ${currentPage} de ${totalPages}</span>
            <button class="pagination-btn" id="pagNext" ${currentPage === totalPages ? 'disabled' : ''}><i class="fa-solid fa-angle-right"></i></button>
            <button class="pagination-btn" id="pagLast" ${currentPage === totalPages ? 'disabled' : ''}><i class="fa-solid fa-angles-right"></i></button>
        </div>
    `;

    document.getElementById('pagFirst')?.addEventListener('click', () => { currentPage = 1; renderTableSlice(rows); });
    document.getElementById('pagPrev')?.addEventListener('click', () => { currentPage--; renderTableSlice(rows); });
    document.getElementById('pagNext')?.addEventListener('click', () => { currentPage++; renderTableSlice(rows); });
    document.getElementById('pagLast')?.addEventListener('click', () => { currentPage = totalPages; renderTableSlice(rows); });
}

/* Event listeners da Tabela sob Demanda */
document.getElementById('toggleTableBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    tableLoaded = !tableLoaded;
    renderTableSection();
});
document.getElementById('tableToggleBar')?.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    tableLoaded = !tableLoaded;
    renderTableSection();
});
document.getElementById('clearBarFilterBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    barFilter = null;
    currentPage = 1;
    renderTableSection();
});

/* ===== KPIs (cálculo) ===== */
function calcKPIs(rows) {
    const n = rows.length;
    const faturamentoTotal = rows.reduce((s, r) => s + (+r.PrecoFinal || 0), 0);
    const qtdTotal = rows.reduce((s, r) => s + (+r.Quantidade || 0), 0);
    const ticketMedio = n ? faturamentoTotal / n : 0;
    const itensPorVenda = n ? qtdTotal / n : 0;

    const descCount = {};
    rows.forEach(r => {
        const key = r.Descricao || '—';
        descCount[key] = (descCount[key] || 0) + (+r.Quantidade || 0);
    });
    const itemMaisVendido = Object.entries(descCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    const giroVals = rows.map(r => +r.Giro || 0).filter(v => v > 0);
    const giroMedio = giroVals.length ? giroVals.reduce((a, b) => a + b, 0) / giroVals.length : 0;

    return {
        n, faturamentoTotal, qtdTotal, ticketMedio, itensPorVenda, itemMaisVendido, giroMedio
    };
}

/* ===== STORYTELLING ===== */
function renderInsights(rows) {
    const grid = document.getElementById('insightsGrid');
    grid.innerHTML = '';
    const n = rows.length;

    if (!n) {
        grid.innerHTML = `
    <div class="insight-card">
        <div class="insight-ico"><i class="fa-solid fa-circle-info"></i></div>
        <div class="insight-body">
            <div class="insight-head">Sem dados no filtro</div>
            <div class="insight-txt muted">Ajuste os filtros para ver os principais insights.</div>
        </div>
    </div>`;
        return;
    }

    const k = calcKPIs(rows);

    const lojaCount = {};
    rows.forEach(r => { const l = r.Loja || 'Não informado'; lojaCount[l] = (lojaCount[l] || 0) + 1; });
    const topLoja = Object.entries(lojaCount).sort((a, b) => b[1] - a[1])[0];

    const vendCount = {};
    rows.forEach(r => { const v = r.Vendedor || 'Não informado'; vendCount[v] = (vendCount[v] || 0) + 1; });
    const topVend = Object.entries(vendCount).sort((a, b) => b[1] - a[1])[0];

    const cards = [
        { icon: 'fa-tags', head: 'Peça destaque', text: `${k.itemMaisVendido} lidera em quantidade.` },
        { icon: 'fa-store', head: 'Loja com mais atendimentos', text: `${topLoja ? topLoja[0] : '—'} lidera com ${NUM(topLoja ? topLoja[1] : 0)} venda(s).` },
        { icon: 'fa-user-tie', head: 'Vendedor destaque', text: `${topVend ? topVend[0] : '—'} soma ${NUM(topVend ? topVend[1] : 0)} venda(s).` },
        { icon: 'fa-ticket', head: 'Ticket médio por item', text: `${BRL(k.ticketMedio)} por peça vendida.` },
        { icon: 'fa-cubes', head: 'Média de itens', text: `${k.itensPorVenda.toFixed(1).replace('.', ',')} itens por nota.` },
        { icon: 'fa-sack-dollar', head: 'Faturamento Total', text: `${BRL(k.faturamentoTotal)} acumulado.` }
    ];

    grid.innerHTML = cards.map(c => `
<div class="insight-card">
    <div class="insight-ico"><i class="fa-solid ${c.icon}"></i></div>
    <div class="insight-body">
        <div class="insight-head">${c.head}</div>
        <div class="insight-txt">${c.text}</div>
    </div>
</div>
`).join('');
}

/* ===== KPIs AGRUPADOS ===== */
function renderKpiGroups() {
    const k = calcKPIs(filtered);

    const gruposHTML = `
<div class="kpi-group">
<div class="title"><i class="fa-solid fa-sack-dollar"></i> Totais e Médias</div>
<div class="kpi-grid">
    <div class="kpi"><div class="lab">Quantidade de Itens</div><div class="val">${NUM(k.n)}</div></div>
    <div class="kpi"><div class="lab">Faturamento Total</div><div class="val">${BRL(k.faturamentoTotal)}</div></div>
    <div class="kpi"><div class="lab">Ticket Médio (Item)</div><div class="val">${BRL(k.ticketMedio)}</div></div>
    <div class="kpi"><div class="lab">Giro Médio</div><div class="val">${k.giroMedio.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div></div>
    <div class="kpi"><div class="lab">Item Mais Vendido</div><div class="val" style="font-size: 1rem;">${k.itemMaisVendido}</div></div>
</div>
</div>
`;
    document.getElementById('kpiGroups').innerHTML = gruposHTML;
}

/* ===== Ordenação/Tabela ===== */
/* ===== Ordenação/Tabela ===== */
const collator = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' });
function sortRows(rows) {
    if (!sortState.key) return rows;
    const key = sortState.key, type = sortState.type, dir = sortState.dir === 'asc' ? 1 : -1;
    return rows.sort((a, b) => {
        let va = a[key], vb = b[key];
        if (type === 'num') {
            va = Number(va) || 0; vb = Number(vb) || 0;
            return dir * (va - vb);
        } else {
            return dir * collator.compare(String(va || ''), String(vb || ''));
        }
    });
}
function renderTable(rows) {
    const tb = document.querySelector('#grid tbody'); tb.innerHTML = '';
    for (const r of rows) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
    <td class="cell-vendedor" style="cursor:pointer; text-decoration:underline;">${r.Vendedor || '—'}</td>
    <td>${r.Loja || '—'}</td>
    <td>${r.DataVenda || '—'}</td>
    <td>${r.Nota || '—'}</td>
    <td>${r.CodItem || '—'}</td>
    <td>${NUM(r.QtdPecas)}</td>
    <td>${r.GrupoInterno || '—'}</td>
    <td>${r.Descricao || '—'}</td>
    <td>${NUM(r.Quantidade)}</td>
    <td>${BRL(r.PrecoFinal)}</td>
`;
        tb.appendChild(tr);
    }
}
function initSorting() {
    const ths = document.querySelectorAll('#grid thead th.sortable');
    ths.forEach(th => {
        th.addEventListener('click', () => withStableScroll(() => {
            const key = th.dataset.key, type = th.dataset.type;
            if (sortState.key === key) {
                sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
            } else {
                sortState.key = key; sortState.type = type; sortState.dir = 'desc';
            }
            ths.forEach(t => { t.classList.remove('active'); t.querySelector('.sort').className = 'fa-solid fa-sort sort'; });
            th.classList.add('active');
            const icon = th.querySelector('.sort');
            icon.className = 'fa-solid ' + (sortState.dir === 'asc' ? 'fa-sort-up' : 'fa-sort-down') + ' sort';
            renderTableSection();
        }));
    });
}
initSorting();

/* seleção pelo vendedor e exclusão por placa */
function toggleVendorSelection(name) {
    if (!name || name === '—' || name === 'Não informado') return;
    const set = new Set(state.Vendedor);
    if (set.has(name)) set.delete(name); else set.add(name);
    state.Vendedor = [...set];
    pillInstances.Vendedor.sync();
    withStableScroll(() => applyFilters());
}
document.querySelector('#grid tbody').addEventListener('click', (e) => {
    const cell = e.target.closest('td');
    if (!cell) return;

    if (cell.classList.contains('cell-vendedor')) {
        const name = (cell.textContent || '').trim();
        toggleVendorSelection(name);
        return;
    }

    if (cell.classList.contains('cell-placa')) {
        const placa = (cell.textContent || '').trim();
        withStableScroll(() => {
            if (excludedPlates.has(placa)) excludedPlates.delete(placa);
            else excludedPlates.add(placa);
            applyFilters();
        });
        return;
    }
});

/* Tooltips e datalabels */
function pctTooltip() {
    return {
        callbacks: {
            label: function (ctx) {
                const val = Number(ctx.raw) || 0;
                const data = ctx.dataset.data || [];
                const total = data.reduce((a, b) => a + (Number(b) || 0), 0) || 1;
                const pct = ((val / total) * 100).toFixed(1).replace('.', ',');
                return `${val} (${pct}%)`;
            }
        }
    };
}

function datalabelsCenter() {
    return {
        color: '#ffffff',
        font: { weight: '700' },
        anchor: 'center',
        align: 'center',
        clip: true,
        formatter: (v, ctx) => {
            const data = ctx.dataset.data || [];
            const total = data.reduce((a, b) => a + (Number(b) || 0), 0) || 1;
            const pct = ((v / total) * 100).toFixed(1).replace('.', ',');
            return `${v} (${pct}%)`;
        }
    };
}

/* Clique nas barras dos gráficos */
function onChartBarClick(evt, elements, chartInstance, chartType) {
    if (!elements || !elements.length) return;
    const idx = elements[0].index;
    const label = chartInstance.data.labels[idx];
    if (!label) return;

    barFilter = { type: chartType, label: label };
    tableLoaded = true;
    currentPage = 1;
    renderTableSection();

    const tableEl = document.getElementById('tableToggleBar');
    if (tableEl) {
        tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/* gráficos */
function renderCharts(rows) {
    const commonOpts = { responsive: true, maintainAspectRatio: false, animation: false, plugins: { datalabels: {} } };

    /* Faturamento por Período (Tooltip detalhado) */
    const statsByMonth = {};
    rows.forEach(r => {
        const k = r.MesNome || 'Não informado';
        if (!statsByMonth[k]) statsByMonth[k] = { valor: 0, qtd: 0 };
        statsByMonth[k].valor += (+r.PrecoFinal || 0);
        statsByMonth[k].qtd += (+r.Quantidade || 0);
    });

    const orderMes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mesesSorted = Object.entries(statsByMonth).sort((a, b) => {
        const pa = a[0].split(' '), pb = b[0].split(' ');
        if (pa[0] === 'Não' || pb[0] === 'Não') return 0;
        const ma = orderMes.indexOf(pa[0].toLowerCase()), mb = orderMes.indexOf(pb[0].toLowerCase());
        const ya = parseInt(pa[1], 10), yb = parseInt(pb[1], 10);
        if (ya !== yb) return ya - yb;
        return ma - mb;
    });

    if (charts.periodo) charts.periodo.destroy();
    charts.periodo = new Chart(document.getElementById('periodoChart').getContext('2d'), {
        type: 'bar',
        data: { 
            labels: mesesSorted.map(x => x[0]), 
            datasets: [{ 
                label: 'Faturamento (R$)', 
                data: mesesSorted.map(x => x[1].valor), 
                backgroundColor: '#10b981',
                borderRadius: 8,
                barPercentage: 0.5,
                categoryPercentage: 0.8
            }] 
        },
        options: { 
            ...commonOpts, 
            onClick: (evt, elements) => onChartBarClick(evt, elements, charts.periodo, 'periodo'),
            scales: {
                y: {
                    grace: '15%'
                }
            },
            plugins: { 
                ...commonOpts.plugins, 
                title: { display: true, text: 'Faturamento por Período (Mês)' },
                datalabels: {
                    display: true,
                    backgroundColor: '#10b981',
                    borderRadius: 4,
                    color: '#fff',
                    font: { weight: 'bold', size: 11 },
                    align: 'top',
                    anchor: 'end',
                    padding: 6,
                    formatter: (v) => (v / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' K'
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const name = context.label;
                            const s = statsByMonth[name] || { valor: 0, qtd: 0 };
                            const avg = s.qtd ? s.valor / s.qtd : 0;
                            return [
                                `Faturamento: ${BRL(s.valor)}`,
                                `Quantidade: ${NUM(s.qtd)}`,
                                `Preço Médio: ${BRL(avg)}`
                            ];
                        }
                    }
                }
            } 
        }
    });

    /* Agregação centralizada para Peças (Tooltip detalhado) */
    const statsByDesc = {};
    rows.forEach(r => {
        const k = r.Descricao || '—';
        if (!statsByDesc[k]) statsByDesc[k] = { valor: 0, qtd: 0, cod: r.CodItem || '—' };
        statsByDesc[k].valor += (+r.PrecoFinal || 0);
        statsByDesc[k].qtd += (+r.Quantidade || 0);
    });

    const accessoryTooltip = {
        callbacks: {
            title: () => '',
            label: (context) => {
                const name = context.label;
                const s = statsByDesc[name] || { valor: 0, qtd: 0, cod: '—' };
                const avg = s.qtd ? s.valor / s.qtd : 0;
                return [
                    `Código: ${s.cod}`,
                    `Faturamento: ${BRL(s.valor)}`,
                    `Quantidade: ${NUM(s.qtd)}`,
                    `Preço Médio: ${BRL(avg)}`
                ];
            }
        }
    };

    /* Top Peças (Valor) */
    const topItemsValor = Object.entries(statsByDesc)
        .sort((a, b) => b[1].valor - a[1].valor)
        .slice(0, 20);

    if (charts.valorItem) charts.valorItem.destroy();
    charts.valorItem = new Chart(document.getElementById('valorItemChart').getContext('2d'), {
        type: 'bar',
        data: { labels: topItemsValor.map(x => x[0]), datasets: [{ label: 'Faturamento (R$)', data: topItemsValor.map(x => x[1].valor), backgroundColor: '#8b5cf6', borderWidth: 2, borderRadius: 8 }] },
        options: { 
            ...commonOpts, 
            indexAxis: 'y', 
            onClick: (evt, elements) => onChartBarClick(evt, elements, charts.valorItem, 'valorItem'),
            plugins: { ...commonOpts.plugins, legend: { display: false }, title: { display: true, text: 'Top 20 Peças (Valor R$)' }, datalabels: { ...datalabelsCenter(), formatter: v => BRL(v) }, tooltip: accessoryTooltip } 
        }
    });

    /* Vendas por Loja (Tooltip detalhado) */
    const statsByLoja = {};
    rows.forEach(r => {
        const k = r.Loja || 'Não informado';
        if (!statsByLoja[k]) statsByLoja[k] = { valor: 0, qtd: 0 };
        statsByLoja[k].valor += (+r.PrecoFinal || 0);
        statsByLoja[k].qtd += (+r.Quantidade || 0);
    });

    const lojaArr = Object.entries(statsByLoja).sort((a, b) => b[1].valor - a[1].valor);
    if (charts.loja) charts.loja.destroy();
    charts.loja = new Chart(document.getElementById('lojaChart').getContext('2d'), {
        type: 'bar',
        plugins: [ChartDataLabels],
        data: { labels: lojaArr.map(x => x[0]), datasets: [{ label: 'Vendas', data: lojaArr.map(x => x[1].valor), borderWidth: 2, borderRadius: 8 }] },
        options: { 
            ...commonOpts, 
            onClick: (evt, elements) => onChartBarClick(evt, elements, charts.loja, 'loja'),
            scales: {
                y: {
                    grace: '20%'
                }
            },
            plugins: { 
                ...commonOpts.plugins, 
                legend: { display: false }, 
                title: { display: true, text: 'Vendas por Loja (Faturamento R$)' }, 
                datalabels: {
                    display: true,
                    align: 'end',
                    anchor: 'end',
                    offset: 4,
                    color: '#1e3a8a',
                    font: { weight: 'bold', size: 11 },
                    formatter: (v, ctx) => {
                        const data = ctx.dataset.data || [];
                        const total = data.reduce((a, b) => a + (Number(b) || 0), 0) || 1;
                        const pct = ((v / total) * 100).toFixed(1).replace('.', ',');
                        return v > 0 ? `${BRL(v)} (${pct}%)` : 'R$ 0,00';
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const name = context.label;
                            const s = statsByLoja[name] || { valor: 0, qtd: 0 };
                            const avg = s.qtd ? s.valor / s.qtd : 0;
                            return [
                                `Faturamento: ${BRL(s.valor)}`,
                                `Quantidade: ${NUM(s.qtd)}`,
                                `Preço Médio: ${BRL(avg)}`
                            ];
                        }
                    }
                }
            } 
        }
    });

    /* Top Peças (Quantidade) */
    const topItemsQtd = Object.entries(statsByDesc)
        .sort((a, b) => b[1].qtd - a[1].qtd)
        .slice(0, 20);

    if (charts.modelo) charts.modelo.destroy();
    charts.modelo = new Chart(document.getElementById('modeloChart').getContext('2d'), {
        type: 'bar',
        data: { labels: topItemsQtd.map(x => x[0]), datasets: [{ label: 'Qtd Vendida', data: topItemsQtd.map(x => x[1].qtd), backgroundColor: '#3b82f6', borderWidth: 2, borderRadius: 8 }] },
        options: { 
            ...commonOpts, 
            indexAxis: 'y', 
            onClick: (evt, elements) => onChartBarClick(evt, elements, charts.modelo, 'modelo'),
            plugins: { ...commonOpts.plugins, legend: { display: false }, title: { display: true, text: 'Top 20 Peças (Quantidade)' }, datalabels: datalabelsCenter(), tooltip: accessoryTooltip } 
        }
    });

    /* Faixas de Preço */
    const faixas = { 'Até R$ 50': 0, 'R$ 50–200': 0, 'R$ 200–500': 0, 'R$ 500–1000': 0, 'R$ 1000+': 0 };
    rows.forEach(r => {
        const v = +r.PrecoFinal || 0;
        if (v <= 50) faixas['Até R$ 50']++;
        else if (v <= 200) faixas['R$ 50–200']++;
        else if (v <= 500) faixas['R$ 200–500']++;
        else if (v <= 1000) faixas['R$ 500–1000']++;
        else faixas['R$ 1000+']++;
    });
    if (charts.faixas) charts.faixas.destroy();
    charts.faixas = new Chart(document.getElementById('faixasPrecoChart').getContext('2d'), {
        type: 'bar',
        data: { labels: Object.keys(faixas), datasets: [{ label: 'Qtd Itens', data: Object.values(faixas), backgroundColor: '#10b981', borderWidth: 2, borderRadius: 8 }] },
        options: { 
            ...commonOpts, 
            onClick: (evt, elements) => onChartBarClick(evt, elements, charts.faixas, 'faixas'),
            plugins: { ...commonOpts.plugins, legend: { display: false }, title: { display: true, text: 'Distribuição por Faixa de Preço' } } 
        }
    });

    /* Vendas por Vendedor (Valor) */
    const porVendVal = {}; rows.forEach(r => { const k = r.Vendedor || 'Não informado'; porVendVal[k] = (porVendVal[k] || 0) + (+r.PrecoFinal || 0); });
    const vendValArr = Object.entries(porVendVal).sort((a, b) => b[1] - a[1]).slice(0, 10);
    if (charts.vendedorValor) charts.vendedorValor.destroy();
    charts.vendedorValor = new Chart(document.getElementById('vendedorValorChart').getContext('2d'), {
        type: 'bar',
        data: { labels: vendValArr.map(x => x[0]), datasets: [{ label: 'Valor (R$)', data: vendValArr.map(x => x[1]), backgroundColor: '#f59e0b', borderWidth: 2, borderRadius: 8 }] },
        options: { 
            ...commonOpts, 
            onClick: (evt, elements) => onChartBarClick(evt, elements, charts.vendedorValor, 'vendedorValor'),
            plugins: { ...commonOpts.plugins, legend: { display: false }, title: { display: true, text: 'Top 10 Vendedores (valor de venda)' }, datalabels: { ...datalabelsCenter(), formatter: v => BRL(v) } } 
        }
    });

    /* Venda de Peças por Dias de Estoque */
    const faixasDiasEstoque = {
        '0 a 90': { valor: 0, qtd: 0 },
        '91 a 180': { valor: 0, qtd: 0 },
        '181 a 365': { valor: 0, qtd: 0 },
        '366 a 1000': { valor: 0, qtd: 0 },
        '1001 ou mais': { valor: 0, qtd: 0 }
    };

    rows.forEach(r => {
        const g = +r.Giro || 0;
        const v = +r.PrecoFinal || 0;
        const q = +r.Quantidade || 0;

        if (g >= 0 && g <= 90) {
            faixasDiasEstoque['0 a 90'].valor += v;
            faixasDiasEstoque['0 a 90'].qtd += q;
        } else if (g >= 91 && g <= 180) {
            faixasDiasEstoque['91 a 180'].valor += v;
            faixasDiasEstoque['91 a 180'].qtd += q;
        } else if (g >= 181 && g <= 365) {
            faixasDiasEstoque['181 a 365'].valor += v;
            faixasDiasEstoque['181 a 365'].qtd += q;
        } else if (g >= 366 && g <= 1000) {
            faixasDiasEstoque['366 a 1000'].valor += v;
            faixasDiasEstoque['366 a 1000'].qtd += q;
        } else if (g >= 1001) {
            faixasDiasEstoque['1001 ou mais'].valor += v;
            faixasDiasEstoque['1001 ou mais'].qtd += q;
        }
    });

    const labelsDias = Object.keys(faixasDiasEstoque);
    const valoresDias = labelsDias.map(k => faixasDiasEstoque[k].valor);

    if (charts.diasEstoque) charts.diasEstoque.destroy();
    charts.diasEstoque = new Chart(document.getElementById('diasEstoqueChart').getContext('2d'), {
        type: 'bar',
        plugins: [ChartDataLabels],
        data: { 
            labels: labelsDias, 
            datasets: [{ 
                label: 'Faturamento (R$)', 
                data: valoresDias, 
                backgroundColor: '#3b82f6', 
                borderRadius: 8,
                barPercentage: 0.5,
                categoryPercentage: 0.8
            }] 
        },
        options: { 
            ...commonOpts, 
            onClick: (evt, elements) => onChartBarClick(evt, elements, charts.diasEstoque, 'diasEstoque'),
            scales: {
                y: {
                    grace: '20%'
                }
            },
            plugins: { 
                ...commonOpts.plugins, 
                title: { display: true, text: 'Venda de Peças por Dias de Estoque' },
                datalabels: {
                    display: true,
                    align: 'end',
                    anchor: 'end',
                    offset: 4,
                    color: '#1e3a8a',
                    font: { weight: 'bold', size: 11 },
                    formatter: (v, ctx) => {
                        const data = ctx.dataset.data || [];
                        const total = data.reduce((a, b) => a + (Number(b) || 0), 0) || 1;
                        const pct = ((v / total) * 100).toFixed(1).replace('.', ',');
                        return v > 0 ? `${BRL(v)} (${pct}%)` : 'R$ 0,00';
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const name = context.label;
                            const s = faixasDiasEstoque[name] || { valor: 0, qtd: 0 };
                            const avg = s.qtd ? s.valor / s.qtd : 0;
                            return [
                                `Faturamento: ${BRL(s.valor)}`,
                                `Quantidade: ${NUM(s.qtd)} peças`,
                                `Preço Médio: ${BRL(avg)}`
                            ];
                        }
                    }
                }
            } 
        }
    });
}
