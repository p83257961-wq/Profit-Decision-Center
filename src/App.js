import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Trash2,
  BarChart3,
  Search,
  Package,
  FileSpreadsheet,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Download,
  UploadCloud,
  Wallet,
  CreditCard,
  AlertCircle,
  PieChart,
  RotateCcw,
  Lock,
  Loader2,
  Gift,
  Zap,
  Layers,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  Users,
  X,
  Info,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
} from "recharts";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

/* ─── Firebase Config ─────────────────────────────────────────── */
const FBC = {
  apiKey: "AIzaSyBGWCKe1mw87g_KRtt-Ar3ffeAExOoYJrg",
  authDomain: "enterprise-e7704.firebaseapp.com",
  projectId: "enterprise-e7704",
  storageBucket: "enterprise-e7704.firebasestorage.app",
  messagingSenderId: "435446255525",
  appId: "1:435446255525:web:7f1727440a507d7add224c",
};
const FSPC = { collection: "warrooms", docId: "unified_profit_center_v1" };
const FSPC_SL = { collection: "warrooms", docId: "shopline_profit_center_v16" };
const FSPC_SP = { collection: "warrooms", docId: "shopee_profit_center_v2" };
const FSPC_SL_ORD = { collection: "warrooms", docId: "unified_sl_orders_v1" };
const FSPC_SP_ORD = { collection: "warrooms", docId: "unified_sp_orders_v1" };

/* 新的按月拆分 collection */
const SL_MONTHLY_COLL = "sl_orders_monthly";
const SP_MONTHLY_COLL = "sp_orders_monthly";

/* 依 YYYY-MM 把訂單分組 */
const groupOrdersByMonth = (orders) => {
  const byMonth = {};
  Object.entries(orders || {}).forEach(([id, o]) => {
    const ym = String(o?.date || "").substring(0, 7) || "unknown";
    if (!byMonth[ym]) byMonth[ym] = {};
    byMonth[ym][id] = o;
  });
  return byMonth;
};

/* ─── Constants ────────────────────────────────────────────────── */
const SL_PAYMENT_RATES = {
  信用卡: { rate: 0.022, flat: 0 },
  "LINE Pay": { rate: 0.023, flat: 0 },
  "7-11": { rate: 0, flat: 0 },
  全家: { rate: 0, flat: 0 },
  "宅配（貨到付款）": { rate: 0.01, flat: 0 },
  ApplePay: { rate: 0.022, flat: 0 },
  "Apple Pay": { rate: 0.022, flat: 0 },
  銀行轉帳: { rate: 0.01, flat: 0 },
  ATM: { rate: 0.01, flat: 0 },
  PayPal: { rate: 0.044, flat: 10 },
  WeChat: { rate: 0.0275, flat: 0 },
};
const SL_SHIPPING_RATES = {
  "7-11": 65,
  全家: 65,
  宅配: 120,
  順豐: 250,
  SF: 250,
};
const SL_INTL_METHODS = ["EMS", "FEDEX", "中國", "新加坡", "國外"];

const DEFAULT_FP_SL = {
  platformFeeRate: "1.0",
  opExpense: "30.0",
  tax: "6.2",
  targetNet: "17.0",
};
const DEFAULT_FP_SP = { opExpense: "30.0", tax: "6.2", targetNet: "14.0" };

const SK = {
  platform: "upc_platform_v1",
  slFp: "upc_sl_fee_params_v1",
  spFp: "upc_sp_fee_params_v1",
  slCosts: "upc_sl_costs_v1",
  spCosts: "upc_sp_costs_v1",
  slOrders: "upc_sl_orders_v1",
  spOrders: "upc_sp_orders_v1",
  commissions: "upc_commissions_v1",
  theme: "upc_theme_v1",
};

/* ─── Utility Functions ────────────────────────────────────────── */
const fmt$ = (v) =>
  new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(v || 0));
const fmtP = (v) => `${((Number(v) || 0) * 100).toFixed(2)}%`;
const numOrZero = (v) => {
  const n = parseFloat(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const safeText = (v) => String(v ?? "").trim();
/* 日期正規化：容忍 2026/1/5、2026-1-5、含時間字串，一律轉成 YYYY-MM-DD */
const normDate = (raw) => {
  const s = safeText(raw).split(" ")[0].split("T")[0].replace(/\//g, "-");
  const p = s.split("-");
  if (p.length === 3 && p[0].length === 4) {
    const d = `${p[0]}-${p[1].padStart(2, "0")}-${p[2].padStart(2, "0")}`;
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  }
  /* 無法辨識的內容一律進 1970 保底桶（會出現在年份選單，異常看得見），
     不原樣存入以免訂單被所有年月篩選靜默吞掉 */
  return "1970-01-01";
};
const jp = (s, f) => {
  try {
    return JSON.parse(s);
  } catch {
    return f;
  }
};
const gl = (k, f) => {
  try {
    const r = window.localStorage.getItem(k);
    return r ? jp(r, f) : f;
  } catch {
    return f;
  }
};
const sl_s = (k, v) => {
  try {
    window.localStorage.setItem(k, JSON.stringify(v));
    return true;
  } catch {
    return false;
  }
};
const gcid = () => {
  const K = "upc_client_id_v1",
    e = window.localStorage.getItem(K);
  if (e) return e;
  const n = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  window.localStorage.setItem(K, n);
  return n;
};
const deepClean = (o) => {
  if (Array.isArray(o)) return o.map(deepClean).filter((v) => v !== undefined);
  if (o && typeof o === "object") {
    const c = {};
    Object.entries(o).forEach(([k, v]) => {
      if (v !== undefined) c[k] = deepClean(v);
    });
    return c;
  }
  return o === undefined ? undefined : o;
};
const parseCSV = (text) => {
  let p = "",
    row = [""],
    ret = [row],
    i = 0,
    r = 0,
    s = true,
    l;
  for (l of text) {
    if ('"' === l) {
      if (s && l === p) row[i] += l;
      s = !s;
    } else if ("," === l && s) {
      l = row[++i] = "";
    } else if ("\n" === l && s) {
      if ("\r" === p) row[i] = row[i].slice(0, -1);
      row = ret[++r] = [(l = "")];
      i = 0;
    } else {
      row[i] += l;
    }
    p = l;
  }
  if (row[i] === "") row.pop();
  if (ret[ret.length - 1].length <= 1 && ret[ret.length - 1][0] === "")
    ret.pop();
  return ret;
};
const commKey = (yr, mo) =>
  yr === "All" ? "All" : mo === "All" ? yr : `${yr}-${mo}`;

/* 月份是否與自訂區間重疊（自訂區間的月費用以整月計） */
const ymOverlaps = (ym, range) => {
  if (!range) return true;
  const start = `${ym}-01`,
    end = `${ym}-31`;
  if (range.from && end < range.from) return false;
  if (range.to && start > range.to) return false;
  return true;
};
/* 期間費用加總：分潤等按月費用用（key 為 YYYY-MM） */
const periodExpense = (map, y, m, range) => {
  const val = (v) =>
    v !== "" && v !== undefined && v !== null ? Number(v) || 0 : 0;
  if (y === "Custom")
    return Object.entries(map || {}).reduce(
      (s, [k, v]) => (ymOverlaps(k, range) ? s + val(v) : s),
      0
    );
  if (y === "All")
    return Object.values(map || {}).reduce((s, v) => s + val(v), 0);
  if (m === "All")
    return Object.entries(map || {}).reduce(
      (s, [k, v]) => (k.startsWith(y + "-") ? s + val(v) : s),
      0
    );
  return val((map || {})[commKey(y, m)]);
};
/* 數字或 null（NaN 不寫入快照；?? 攔不住 NaN） */
const numOrNull = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
/* 重新匯入同一張訂單時保留舊快照：參數整組沿用、成本按品項 key 比對。
   新品項若在舊快照中沒有對應成本，該單會呈現「部分鎖定」提醒使用者重鎖 */
const withOldSnapshot = (oldOrder, next) => {
  if (!oldOrder?.snapshotFeeParams) return next;
  const oldCost = {};
  (oldOrder.items || []).forEach((i) => {
    if (Object.prototype.hasOwnProperty.call(i, "snapshotCost"))
      oldCost[i.key] = i.snapshotCost;
  });
  return {
    ...next,
    snapshotFeeParams: oldOrder.snapshotFeeParams,
    items: (next.items || []).map((i) =>
      Object.prototype.hasOwnProperty.call(oldCost, i.key)
        ? { ...i, snapshotCost: oldCost[i.key] }
        : i
    ),
  };
};
/* 按月費用（分潤）更新：空值＝刪除該月 key */
const monthlyUpd = (setter, key, value) =>
  setter((prev) => {
    if (value === "" || value === null || value === undefined) {
      const n = { ...prev };
      delete n[key];
      return n;
    }
    return { ...prev, [key]: Number(value) };
  });
/* 輸入防抖：搜尋框用，避免每個按鍵觸發全表過濾 */
const useDebounced = (value, delay = 200) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

/* ─── CSS ─────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Noto+Sans+TC:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap');
[data-theme="light"]{
  --bg:#FFFFFF;--s1:#FFFFFF;--s2:#F8F8F6;--s3:#EAEAE6;--s4:#D8D8D2;
  --t1:#1A1A18;--t2:#5C5C54;--t3:#74746A;--t4:#96968C;
  --accent:#1A6B3C;--accent-dim:rgba(26,107,60,0.06);--accent-bdr:rgba(26,107,60,0.18);--accent-text:#1A6B3C;
  --up:#1A6B3C;--up-dim:rgba(26,107,60,0.06);--up-bdr:rgba(26,107,60,0.18);
  --dn:#C0392B;--dn-dim:rgba(192,57,43,0.05);--dn-bdr:rgba(192,57,43,0.18);
  --wn:#B7600A;--wn-dim:rgba(183,96,10,0.05);--wn-bdr:rgba(183,96,10,0.18);
  --blue:#2E6DA4;--purple:#7B5EA7;--orange:#D4820A;--gold:#8B6914;
  --header-bg:rgba(255,255,255,0.92);
  --bar-track:#EAEAE6;
  --row-loss:rgba(192,57,43,0.04);
  --sp-accent:#EE4D2D;--sp-accent-dim:rgba(238,77,45,0.06);--sp-accent-bdr:rgba(238,77,45,0.2);
}
[data-theme="dark"]{
  --bg:#080A0E;--s1:#0E1117;--s2:#151921;--s3:#1C212B;--s4:#282D38;
  --t1:#E8E6E1;--t2:#9DA0A8;--t3:#7E838E;--t4:#656A73;
  --accent:#2ECC71;--accent-dim:rgba(46,204,113,0.08);--accent-bdr:rgba(46,204,113,0.2);--accent-text:#2ECC71;
  --up:#2ECC71;--up-dim:rgba(46,204,113,0.08);--up-bdr:rgba(46,204,113,0.2);
  --dn:#E74C3C;--dn-dim:rgba(231,76,60,0.08);--dn-bdr:rgba(231,76,60,0.2);
  --wn:#E67E22;--wn-dim:rgba(230,126,34,0.08);--wn-bdr:rgba(230,126,34,0.2);
  --blue:#3498DB;--purple:#9B7FCA;--orange:#F0A030;--gold:#C9A84C;
  --header-bg:rgba(8,10,14,0.88);
  --bar-track:#1C212B;
  --row-loss:rgba(231,76,60,0.07);
  --sp-accent:#FF6533;--sp-accent-dim:rgba(255,101,51,0.08);--sp-accent-bdr:rgba(255,101,51,0.22);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--s4);border-radius:99px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes toastIn{from{opacity:0;transform:translateX(100%);}to{opacity:1;transform:translateX(0);}}
@keyframes toastOut{from{opacity:1;}to{opacity:0;transform:translateX(100%);}}
@keyframes dlgIn{from{opacity:0;transform:scale(.96);}to{opacity:1;transform:scale(1);}}
.spin{animation:spin 1s linear infinite;}
.f0{animation:fadeUp .42s cubic-bezier(.16,1,.3,1) both;}
.f1{animation:fadeUp .42s cubic-bezier(.16,1,.3,1) .06s both;}
.f2{animation:fadeUp .42s cubic-bezier(.16,1,.3,1) .12s both;}
.f3{animation:fadeUp .42s cubic-bezier(.16,1,.3,1) .18s both;}
.f4{animation:fadeUp .42s cubic-bezier(.16,1,.3,1) .24s both;}
.f5{animation:fadeUp .42s cubic-bezier(.16,1,.3,1) .30s both;}
.gm{display:grid;grid-template-columns:240px 1fr;gap:20px;align-items:start;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
@media(max-width:900px){.gm{grid-template-columns:1fr;}.side-sticky{position:static!important;}}
@media(max-width:1000px){.g4{grid-template-columns:repeat(2,1fr);}.g3{grid-template-columns:repeat(2,1fr);}}
@media(max-width:600px){.g4,.g3{grid-template-columns:1fr;}.app-header{position:static!important;}}
.gcmp{display:grid;grid-template-columns:1fr 1px 1fr;border-top:1px solid var(--s3);padding-top:20px;}
.gcmp-l{padding:0 20px 0 0;min-width:0;}
.gcmp-r{padding:0 0 0 20px;min-width:0;}
.gcmp-div{background:var(--s3);margin:0 20px;}
@media(max-width:700px){.gcmp{grid-template-columns:1fr;gap:20px;}.gcmp-div{display:none;}.gcmp-l,.gcmp-r{padding:0;}}
.hero-num{font-size:clamp(40px,8vw,72px);overflow-wrap:anywhere;}
.hero-num-md{font-size:clamp(36px,7vw,64px);overflow-wrap:anywhere;}
.hero-pct{font-size:clamp(30px,5.5vw,48px);}
.hero-pct-md{font-size:clamp(28px,5vw,44px);}
input,select,button{font-family:'Inter','Noto Sans TC',sans-serif;}
button{cursor:pointer;transition:all .12s;}
button:hover{filter:brightness(1.06);}
button:active{transform:scale(.97);}
tr{transition:background .1s;}
tr:hover td{background:var(--s2)!important;}
tr.rw:hover td{background:var(--wn-dim)!important;}
tr.rl:hover td{background:var(--row-loss)!important;}
.rw td{background:var(--wn-dim)!important;}
.rl td{background:var(--row-loss)!important;}
.iw{border-color:var(--wn)!important;}
.iok{border-color:var(--up-bdr)!important;}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;}}
`;

/* ─── Small UI Components ──────────────────────────────────────── */
const mono = "'JetBrains Mono',monospace";
const inp = {
  border: "1px solid var(--s3)",
  borderRadius: 6,
  padding: "6px 8px",
  fontSize: 13,
  fontWeight: 500,
  outline: "none",
  textAlign: "right",
  fontFamily: mono,
  background: "var(--s2)",
  color: "var(--t1)",
  transition: "border-color .15s",
};
const sel = {
  border: "1px solid var(--s3)",
  borderRadius: 8,
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 600,
  background: "var(--s1)",
  color: "var(--t1)",
  outline: "none",
  cursor: "pointer",
};
const th = {
  position: "sticky",
  top: 0,
  background: "var(--s2)",
  fontSize: 11,
  color: "var(--t3)",
  fontWeight: 700,
  padding: "10px 14px",
  borderBottom: "1px solid var(--s3)",
  zIndex: 1,
  userSelect: "none",
  cursor: "pointer",
};
const td2 = {
  padding: "10px 14px",
  borderBottom: "1px solid var(--s3)",
  fontSize: 13,
  verticalAlign: "middle",
  background: "var(--s1)",
};

const SyncDot = ({ status, last }) => {
  const m = {
    idle: { l: "離線", c: "var(--t3)" },
    connecting: { l: "連線中", c: "var(--wn)" },
    synced: { l: "已同步", c: "var(--up)" },
    saving: { l: "儲存中", c: "var(--orange)" },
    error: { l: "失敗", c: "var(--dn)" },
  };
  const v = m[status] || m.idle;
  const t = last
    ? new Date(last).toLocaleString("zh-TW", { hour12: false })
    : "—";
  return (
    <div
      role="status"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        background: "var(--s2)",
        color: v.c,
        fontFamily: mono,
      }}
    >
      <div style={{ width: 6, height: 6, borderRadius: 99, background: v.c }} />
      {(status === "connecting" || status === "saving") && (
        <Loader2 size={11} className="spin" />
      )}
      <span>{v.l}</span>
      <span style={{ color: "var(--s4)" }}>·</span>
      <span style={{ opacity: 0.6, fontSize: 10 }}>{t}</span>
    </div>
  );
};

const Tag = ({ children, v = "default", style: st = {}, onClick }) => {
  const vs = {
    default: { bg: "var(--s2)", c: "var(--t2)", bd: "var(--s3)" },
    ok: { bg: "var(--up-dim)", c: "var(--up)", bd: "var(--up-bdr)" },
    bad: { bg: "var(--dn-dim)", c: "var(--dn)", bd: "var(--dn-bdr)" },
    warn: { bg: "var(--wn-dim)", c: "var(--wn)", bd: "var(--wn-bdr)" },
  };
  const s = vs[v] || vs.default;
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        background: s.bg,
        color: s.c,
        border: `1px solid ${s.bd}`,
        ...st,
      }}
    >
      {children}
    </span>
  );
};

const Btn = ({ children, v = "default", style: st = {}, ...p }) => {
  const vs = {
    default: {
      background: "var(--s2)",
      color: "var(--t1)",
      border: "1px solid var(--s3)",
    },
    primary: {
      background: "var(--accent-dim)",
      color: "var(--accent-text)",
      border: "1px solid var(--accent-bdr)",
    },
    danger: {
      background: "var(--dn-dim)",
      color: "var(--dn)",
      border: "1px solid var(--dn-bdr)",
    },
    ghost: {
      background: "transparent",
      color: "var(--t3)",
      border: "1px solid transparent",
    },
    shopee: {
      background: "var(--sp-accent-dim)",
      color: "var(--sp-accent)",
      border: "1px solid var(--sp-accent-bdr)",
    },
  };
  const s = vs[v] || vs.default;
  return (
    <button
      {...p}
      style={{
        ...s,
        borderRadius: 8,
        padding: "7px 14px",
        fontSize: 11,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
        ...st,
      }}
    >
      {children}
    </button>
  );
};

const Lbl = ({ children }) => (
  <div
    style={{
      fontSize: 12,
      fontWeight: 600,
      color: "var(--t3)",
      marginBottom: 4,
    }}
  >
    {children}
  </div>
);

const SortTh = ({ children, sortKey, currentSort, onSort, align = "left" }) => {
  const isActive = currentSort.key === sortKey;
  const dir = isActive ? currentSort.dir : null;
  return (
    <th
      scope="col"
      tabIndex={0}
      aria-sort={
        isActive ? (dir === "asc" ? "ascending" : "descending") : "none"
      }
      onClick={() => onSort(sortKey)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSort(sortKey);
        }
      }}
      style={{ ...th, textAlign: align }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          justifyContent: align === "right" ? "flex-end" : "flex-start",
        }}
      >
        {children}
        {isActive ? (
          dir === "asc" ? (
            <ChevronUp size={10} />
          ) : (
            <ChevronDown size={10} />
          )
        ) : (
          <ChevronDown size={9} style={{ opacity: 0.3 }} />
        )}
      </div>
    </th>
  );
};

/* 成本輸入框：本地草稿、失焦才寫回，避免每個按鍵觸發全表重算與雲端寫入 */
const CostInput = React.memo(function CostInput({
  costKey,
  label,
  value,
  miss,
  onCommit,
}) {
  const norm = (v) =>
    v === undefined || v === null || v === "" || Number(v) === 0
      ? ""
      : String(v);
  const [draft, setDraft] = useState(() => norm(value));
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setDraft(norm(value));
    // eslint-disable-next-line
  }, [value]);
  return (
    <input
      type="number"
      value={draft}
      placeholder="—"
      aria-label={label}
      onFocus={() => {
        focused.current = true;
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        focused.current = false;
        const n = parseFloat(draft);
        onCommit(costKey, Number.isFinite(n) ? n : 0);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className={miss ? "iw" : Number(value) > 0 ? "iok" : ""}
      style={{ ...inp, width: 80 }}
    />
  );
});

/* 財務參數輸入框：同樣失焦才提交，避免每個按鍵觸發全部訂單重算＋雲端寫入 */
const FpInput = React.memo(function FpInput({ field, label, value, onCommit }) {
  const [draft, setDraft] = useState(() => String(value ?? ""));
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setDraft(String(value ?? ""));
    // eslint-disable-next-line
  }, [value]);
  return (
    <input
      type="number"
      step="0.1"
      aria-label={label}
      value={draft}
      onFocus={() => {
        focused.current = true;
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        focused.current = false;
        onCommit(field, draft);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      style={{ ...inp, width: 60, fontSize: 12 }}
    />
  );
});

/* ─── Overview Dashboard ────────────────────────────────────── */
function OverviewDashboard({
  slData,
  spData,
  slOrders,
  spOrders,
  slCosts,
  spCosts,
  allMonthly,
  theme,
  onNavigate,
  sY,
  sM,
  range,
}) {
  const slD = slData?.summary;
  const spS = spData?.s;
  const isDark = theme === "dark";
  const greenC = isDark ? "#2ECC71" : "#1A6B3C";
  const spC = isDark ? "#FF6533" : "#EE4D2D";
  const goldC = isDark ? "#C9A84C" : "#8B6914";
  const gridC = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  const hasAny = slD || spS;
  const totalRev = (slD?.rev || 0) + (spS?.tG || 0);
  const totalNet = (slD?.net || 0) + (spS?.afterComm || 0);
  const totalNetMargin = totalRev > 0 ? totalNet / totalRev : 0;
  const slRevShare = totalRev > 0 ? (slD?.rev || 0) / totalRev : 0;
  const spRevShare = totalRev > 0 ? (spS?.tG || 0) / totalRev : 0;

  const periodLabel =
    sY === "Custom"
      ? `${range?.from || "起"} ～ ${range?.to || "迄"}`
      : sY === "All"
      ? "歷年"
      : sM === "All"
      ? `${sY}年`
      : `${sY}/${sM}`;

  const alerts = useMemo(() => {
    const list = [];
    if (slD && slD.trueNetMargin < slD.targetNetRate)
      list.push({
        level: "warn",
        platform: "官網",
        msg: `淨利率 ${fmtP(slD.trueNetMargin)} 低於目標 ${fmtP(
          slD.targetNetRate
        )}，差距 ${Math.abs(slD.gapVal).toFixed(1)}%`,
      });
    if (spS && spS.netMargin < spS.targetNet)
      list.push({
        level: "warn",
        platform: "蝦皮",
        msg: `淨利率 ${fmtP(spS.netMargin)} 低於目標 ${fmtP(
          spS.targetNet
        )}，差距 ${((spS.targetNet - spS.netMargin) * 100).toFixed(1)}%`,
      });

    if (slD && slD.lossCount > 0)
      list.push({
        level: "info",
        platform: "官網",
        msg: `本期有 ${slD.lossCount} 筆虧損訂單，建議檢視運費與折扣設定`,
      });
    if (spS && spS.lossN > 0)
      list.push({
        level: "info",
        platform: "蝦皮",
        msg: `本期有 ${spS.lossN} 筆虧損訂單`,
      });
    if (slD && slD.returnRate > 0.05)
      list.push({
        level: "warn",
        platform: "官網",
        msg: `退貨率 ${fmtP(slD.returnRate)}（${
          slD.returnCount
        } 筆），高於 5% 警戒線`,
      });
    if (spS && spS.refundN > 0)
      list.push({
        level: "info",
        platform: "蝦皮",
        msg: `本期排除 ${spS.refundN} 筆退貨/退款訂單（${fmt$(
          spS.refundG
        )} 未計入營收）`,
      });
    if (
      slData?.matrixList?.some(
        (p) =>
          p.soldQty > 0 && (!slCosts[p.key] || Number(slCosts[p.key]) === 0)
      )
    )
      list.push({
        level: "error",
        platform: "官網",
        msg: "有商品成本未填，淨利計算可能偏高",
      });
    if (
      spData?.uniqueProducts?.some(
        (p) =>
          p.soldQty > 0 && (!spCosts[p.key] || Number(spCosts[p.key]) === 0)
      )
    )
      list.push({
        level: "error",
        platform: "蝦皮",
        msg: "有商品成本未填，淨利計算可能偏高",
      });
    /* 月中 run-rate 預警：檢視「本月」且已過 7 日，用上月同期進度對比，
       落後 10% 以上提前示警，不必等月底才發現 */
    if (sY !== "Custom" && sY !== "All" && sM !== "All") {
      const now = new Date();
      const curYm = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;
      if (`${sY}-${sM}` === curYm && now.getDate() >= 7) {
        const mNum = Number(sM);
        const prevYm =
          mNum === 1
            ? `${Number(sY) - 1}-12`
            : `${sY}-${String(mNum - 1).padStart(2, "0")}`;
        const prevRev = allMonthly?.[prevYm]?.rev || 0;
        const daysInM = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        ).getDate();
        const frac = now.getDate() / daysInM;
        const curRev = (slD?.rev || 0) + (spS?.tG || 0);
        if (prevRev > 0 && frac > 0 && curRev > 0) {
          const pace = curRev / (prevRev * frac);
          if (pace < 0.9)
            list.push({
              level: "warn",
              platform: "全站",
              msg: `本月營收進度僅為上月同期的 ${(pace * 100).toFixed(
                0
              )}%（截至 ${now.getDate()} 日），留意月底達成`,
            });
          else if (pace >= 1.1)
            list.push({
              level: "info",
              platform: "全站",
              msg: `本月營收進度為上月同期的 ${(pace * 100).toFixed(
                0
              )}%，超前上月步調`,
            });
        }
      }
    }
    return list;
  }, [slD, spS, slData, spData, slCosts, spCosts, sY, sM, allMonthly]);

  /* 月度趨勢固定顯示整年（或歷年最近 12 個月），不受單月篩選影響；
     淨利線取自 allMonthly（已扣分潤）；自訂區間因非整月，不畫淨利線 */
  const trendData = useMemo(() => {
    const byMonth = {};
    const passPeriod = (d) => {
      if (sY === "Custom") {
        if (range?.from && d < range.from) return false;
        if (range?.to && d > range.to) return false;
        return true;
      }
      if (sY && sY !== "All" && !d.startsWith(sY)) return false;
      return true;
    };
    Object.values(slOrders || {}).forEach((o) => {
      const cx =
        (o.status || "").includes("取消") || (o.status || "").includes("刪除");
      if (cx) return;
      const d = String(o.date || "");
      if (!passPeriod(d)) return;
      const ym = d.substring(0, 7);
      if (!ym || ym.length < 7) return;
      if (!byMonth[ym]) byMonth[ym] = { month: ym, slRev: 0, spRev: 0 };
      byMonth[ym].slRev += o.revenue || 0;
    });
    Object.values(spOrders || {}).forEach((o) => {
      const st = String(o.status || ""),
        rf = String(o.refundStatus || "");
      const bad =
        st.includes("不成立") ||
        st.includes("取消") ||
        rf !== "" ||
        (st.includes("退貨") && !st.includes("已完成"));
      if (bad) return;
      const d = String(o.date || "");
      if (!passPeriod(d)) return;
      const ym = d.substring(0, 7);
      if (!ym || ym.length < 7) return;
      if (!byMonth[ym]) byMonth[ym] = { month: ym, slRev: 0, spRev: 0 };
      const gross = o.grossPrice || 0;
      byMonth[ym].spRev += gross;
    });
    return Object.values(byMonth)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12)
      .map((d) => ({
        ...d,
        label: d.month.substring(2).replace("-", "/"),
        total: d.slRev + d.spRev,
        net: sY === "Custom" ? undefined : allMonthly?.[d.month]?.net,
      }));
  }, [slOrders, spOrders, sY, range, allMonthly]);
  const showNetLine = trendData.some((d) => d.net !== undefined);

  const crossProductRank = useMemo(() => {
    const map = {};
    (slData?.matrixList || []).forEach((p) => {
      if (!map[p.name]) map[p.name] = { name: p.name, slQty: 0, spQty: 0 };
      map[p.name].slQty += p.soldQty || 0;
    });
    (spData?.uniqueProducts || []).forEach((p) => {
      if (!map[p.name]) map[p.name] = { name: p.name, slQty: 0, spQty: 0 };
      map[p.name].spQty += p.soldQty || 0;
    });
    return Object.values(map)
      .filter((p) => p.slQty + p.spQty > 0)
      .sort((a, b) => b.slQty + b.spQty - (a.slQty + a.spQty))
      .slice(0, 8);
  }, [slData, spData]);

  if (!hasAny) {
    return (
      <div
        className="f0"
        style={{
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 14,
          background: "var(--s1)",
          border: "1px solid var(--s3)",
          borderRadius: 16,
        }}
      >
        <BarChart3 size={40} color="var(--s4)" />
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--t3)" }}>
          尚無任何資料
        </div>
        <div style={{ fontSize: 12, color: "var(--t4)" }}>
          請先上傳官網或蝦皮報表
        </div>
      </div>
    );
  }

  const overallStatus =
    totalNetMargin >= 0.15
      ? { label: "整體健康", c: "var(--up)" }
      : totalNetMargin >= 0.11
      ? { label: "需要關注", c: "var(--wn)" }
      : totalNetMargin > 0
      ? { label: "低於警戒", c: "var(--dn)" }
      : { label: "整體虧損", c: "var(--dn)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── 老闆月報 Hero ── */}
      <div
        className="f1"
        style={{
          background: "var(--s1)",
          border: "1px solid var(--s3)",
          borderRadius: 16,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, ${greenC}, ${spC})`,
          }}
        />
        <div style={{ padding: "28px 36px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                borderRadius: 99,
                background: `${overallStatus.c}15`,
                border: `1px solid ${overallStatus.c}40`,
                fontSize: 12,
                fontWeight: 700,
                color: overallStatus.c,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 99,
                  background: overallStatus.c,
                }}
              />
              {overallStatus.label}
            </div>
            <span style={{ fontSize: 12, color: "var(--t3)", fontWeight: 600 }}>
              {periodLabel} 跨平台合計
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 40,
              alignItems: "flex-end",
              marginBottom: 28,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--t3)",
                  marginBottom: 6,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                合計淨利
              </div>
              <div
                className="hero-num-md"
                style={{
                  lineHeight: 1,
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  fontFamily: mono,
                  color: totalNet >= 0 ? "var(--t1)" : "var(--dn)",
                }}
              >
                {fmt$(totalNet)}
              </div>
              <div style={{ fontSize: 12, color: "var(--t4)", marginTop: 8 }}>
                合計營收 {fmt$(totalRev)}
              </div>
              <PeriodCompare monthly={allMonthly} sY={sY} sM={sM} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--t3)",
                  marginBottom: 6,
                }}
              >
                綜合淨利率
              </div>
              <div
                className="hero-pct-md"
                style={{
                  fontWeight: 700,
                  fontFamily: mono,
                  lineHeight: 1,
                  color:
                    totalNetMargin >= 0.15
                      ? "var(--up)"
                      : totalNetMargin >= 0.11
                      ? "var(--wn)"
                      : "var(--dn)",
                }}
              >
                {fmtP(totalNetMargin)}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                height: 8,
                borderRadius: 99,
                background: "var(--s3)",
                overflow: "hidden",
                display: "flex",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: `${slRevShare * 100}%`,
                  background: greenC,
                  transition: "width .6s",
                }}
              />
              <div style={{ flex: 1, background: spC, opacity: 0.8 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: greenC,
                  }}
                />
                <span style={{ color: "var(--t2)" }}>官網</span>
                <span style={{ fontFamily: mono, color: greenC }}>
                  {(slRevShare * 100).toFixed(1)}%
                </span>
                <span style={{ color: "var(--t4)" }}>
                  {fmt$(slD?.rev || 0)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <span style={{ color: "var(--t4)" }}>{fmt$(spS?.tG || 0)}</span>
                <span style={{ fontFamily: mono, color: spC }}>
                  {(spRevShare * 100).toFixed(1)}%
                </span>
                <span style={{ color: "var(--t2)" }}>蝦皮</span>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: spC,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="gcmp">
            {[
              {
                label: "官網",
                color: greenC,
                rev: slD?.rev || 0,
                net: slD?.net || 0,
                margin: slD?.trueNetMargin || 0,
                target: slD?.targetNetRate || 0.15,
                orders: slD?.valid || 0,
                id: "shopline",
              },
              {
                label: "蝦皮",
                color: spC,
                rev: spS?.tG || 0,
                net: spS?.afterComm || 0,
                margin: spS?.netMargin || 0,
                target: spS?.targetNet || 0.14,
                orders: spS?.validN || 0,
                id: "shopee",
              },
            ].map((p, i) => (
              <React.Fragment key={p.id}>
                {i === 1 && <div className="gcmp-div" />}
                <div className={i === 0 ? "gcmp-l" : "gcmp-r"}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          background: p.color,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--t1)",
                        }}
                      >
                        {p.label}
                      </span>
                    </div>
                    <button
                      onClick={() => onNavigate(p.id)}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: p.color,
                        background: "transparent",
                        border: `1px solid ${p.color}44`,
                        borderRadius: 6,
                        padding: "3px 10px",
                        cursor: "pointer",
                      }}
                    >
                      詳細分析 →
                    </button>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    {[
                      {
                        l: "淨利",
                        v: fmt$(p.net),
                        c: p.net >= 0 ? p.color : "var(--dn)",
                      },
                      {
                        l: "淨利率",
                        v: fmtP(p.margin),
                        c: p.margin >= p.target ? p.color : "var(--wn)",
                        sub:
                          p.margin >= p.target
                            ? `超標 +${((p.margin - p.target) * 100).toFixed(
                                1
                              )}%`
                            : `差 ${((p.target - p.margin) * 100).toFixed(1)}%`,
                      },
                      { l: "營收", v: fmt$(p.rev) },
                      { l: "有效訂單", v: `${p.orders} 筆` },
                    ].map((k, j) => (
                      <div
                        key={j}
                        style={{
                          background: "var(--s2)",
                          borderRadius: 8,
                          padding: "10px 12px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--t4)",
                            fontWeight: 600,
                            marginBottom: 3,
                          }}
                        >
                          {k.l}
                        </div>
                        <div
                          style={{
                            fontFamily: mono,
                            fontSize: 13,
                            fontWeight: 700,
                            color: k.c || "var(--t1)",
                          }}
                        >
                          {k.v}
                        </div>
                        {k.sub && (
                          <div
                            style={{
                              fontSize: 9,
                              color: k.c || "var(--t4)",
                              marginTop: 2,
                              fontWeight: 600,
                            }}
                          >
                            {k.sub}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── 異常警示 ── */}
      {alerts.length > 0 && (
        <div
          className="f2"
          style={{
            background: "var(--s1)",
            border: "1px solid var(--s3)",
            borderRadius: 16,
            padding: "18px 24px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--t3)",
              marginBottom: 12,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <AlertTriangle size={13} color="var(--wn)" /> 需要注意
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alerts.map((a, i) => {
              const col =
                a.level === "error"
                  ? "var(--dn)"
                  : a.level === "warn"
                  ? "var(--wn)"
                  : "var(--blue)";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 14px",
                    background: "var(--s2)",
                    border: `1px solid var(--s3)`,
                    borderRadius: 10,
                    borderLeft: `3px solid ${col}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: col,
                      background: "var(--s3)",
                      padding: "2px 8px",
                      borderRadius: 4,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {a.platform}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--t2)",
                      fontWeight: 500,
                      lineHeight: 1.5,
                    }}
                  >
                    {a.msg}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 月度趨勢 ── */}
      {trendData.length >= 1 && (
        <div
          className="f3"
          style={{
            background: "var(--s1)",
            border: "1px solid var(--s3)",
            borderRadius: 16,
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--t2)",
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <TrendingUp size={14} color="var(--t3)" /> 月度營收與淨利趨勢
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--t3)",
              marginBottom: 16,
              display: "flex",
              gap: 16,
            }}
          >
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 3,
                  borderRadius: 2,
                  background: greenC,
                }}
              />
              官網
            </span>
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 3,
                  borderRadius: 2,
                  background: spC,
                }}
              />
              蝦皮
            </span>
            {showNetLine && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 3,
                    borderRadius: 2,
                    background: goldC,
                  }}
                />
                淨利
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart
              data={trendData}
              margin={{ top: 4, right: 16, left: -8, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridC}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{
                  fontSize: 10,
                  fill: "var(--t3)",
                  fontFamily: mono,
                  fontWeight: 600,
                }}
                axisLine={{ stroke: gridC }}
                tickLine={false}
                dy={4}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "var(--t3)", fontFamily: mono }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <RTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const bars = payload.filter((e) => e.dataKey !== "net");
                  const netE = payload.find((e) => e.dataKey === "net");
                  const total = bars.reduce((s, e) => s + (e.value || 0), 0);
                  return (
                    <div
                      style={{
                        background: "var(--s1)",
                        border: "1px solid var(--s3)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                        minWidth: 180,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--t3)",
                          marginBottom: 8,
                          fontFamily: mono,
                        }}
                      >
                        {label}
                      </div>
                      {bars.map((e, i) => {
                        const pct =
                          total > 0
                            ? (((e.value || 0) / total) * 100).toFixed(1)
                            : "0.0";
                        return (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "3px 0",
                            }}
                          >
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 2,
                                background: e.color,
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--t2)",
                                fontWeight: 600,
                                width: 28,
                              }}
                            >
                              {e.name}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: e.color,
                                fontFamily: mono,
                                background: "var(--s3)",
                                padding: "1px 6px",
                                borderRadius: 4,
                                width: 46,
                                textAlign: "center",
                              }}
                            >
                              {pct}%
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: "var(--t1)",
                                fontFamily: mono,
                                textAlign: "right",
                                flex: 1,
                              }}
                            >
                              {fmt$(e.value)}
                            </span>
                          </div>
                        );
                      })}
                      <div
                        style={{
                          borderTop: "1px solid var(--s3)",
                          marginTop: 8,
                          paddingTop: 6,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--t4)",
                            fontWeight: 600,
                          }}
                        >
                          合計營收
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            fontFamily: mono,
                            color: "var(--t1)",
                          }}
                        >
                          {fmt$(total)}
                        </span>
                      </div>
                      {netE && netE.value !== undefined && (
                        <div
                          style={{
                            marginTop: 4,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              color: goldC,
                              fontWeight: 700,
                            }}
                          >
                            淨利
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              fontFamily: mono,
                              color: netE.value >= 0 ? goldC : "var(--dn)",
                            }}
                          >
                            {fmt$(netE.value)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="slRev"
                name="官網"
                fill={greenC}
                opacity={0.85}
                radius={[3, 3, 0, 0]}
                maxBarSize={32}
                stackId="a"
              />
              <Bar
                dataKey="spRev"
                name="蝦皮"
                fill={spC}
                opacity={0.85}
                radius={[3, 3, 0, 0]}
                maxBarSize={32}
                stackId="a"
              />
              {showNetLine && (
                <Line
                  type="monotone"
                  dataKey="net"
                  name="淨利"
                  stroke={goldC}
                  strokeWidth={2}
                  dot={{ r: 2, fill: goldC, strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── 跨平台商品排行 ── */}
      {crossProductRank.length > 0 && (
        <div
          className="f4"
          style={{
            background: "var(--s1)",
            border: "1px solid var(--s3)",
            borderRadius: 16,
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--t2)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <Package size={14} color="var(--t3)" /> 跨平台銷售排行
          </div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 16 }}>
            綠 = 官網　橘 = 蝦皮
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {crossProductRank.map((p, i) => {
              const total = p.slQty + p.spQty;
              const slPct = total > 0 ? p.slQty / total : 0;
              const maxTotal =
                crossProductRank[0].slQty + crossProductRank[0].spQty;
              return (
                <div
                  key={p.name}
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--t4)",
                      fontFamily: mono,
                      width: 16,
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--t1)",
                        marginBottom: 5,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        height: 7,
                        borderRadius: 99,
                        background: "var(--s3)",
                        overflow: "hidden",
                        width: `${(total / maxTotal) * 100}%`,
                      }}
                    >
                      <div style={{ height: "100%", display: "flex" }}>
                        <div
                          style={{
                            width: `${slPct * 100}%`,
                            background: greenC,
                          }}
                        />
                        <div
                          style={{ flex: 1, background: spC, opacity: 0.8 }}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      fontSize: 11,
                      fontFamily: mono,
                      flexShrink: 0,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: greenC, fontWeight: 700 }}>
                      {p.slQty}
                    </span>
                    <span style={{ color: "var(--s4)" }}>+</span>
                    <span style={{ color: spC, fontWeight: 700 }}>
                      {p.spQty}
                    </span>
                    <span
                      style={{
                        color: "var(--t3)",
                        fontWeight: 600,
                        minWidth: 36,
                      }}
                    >
                      = {total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Monthly Expense Panel（分潤等按月費用）─────────────────── */
function MonthlyExpensePanel({
  title,
  icon,
  color = "var(--purple)",
  values,
  onUpdate,
  selYear,
  selMonth,
  range,
  hint,
}) {
  const key = commKey(selYear, selMonth);
  const isAggregated =
    selMonth === "All" || selYear === "All" || selYear === "Custom";
  const aggregatedVal = useMemo(
    () =>
      isAggregated ? periodExpense(values, selYear, selMonth, range) : null,
    [values, selYear, selMonth, range, isAggregated]
  );

  const [local, setLocal] = useState(String(values[key] ?? ""));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    /* 輸入中不被遠端同步覆蓋草稿（與 CostInput/FpInput 同一套防呆） */
    if (!focused) setLocal(String(values[key] ?? ""));
  }, [key, values, focused]);
  const handleBlur = () => {
    setFocused(false);
    const n = parseFloat(local);
    onUpdate(key, isNaN(n) ? "" : n);
  };
  const hasVal =
    values[key] !== undefined && values[key] !== "" && Number(values[key]) > 0;
  const label =
    selYear === "Custom"
      ? "自訂區間"
      : selYear === "All"
      ? "歷年"
      : selMonth === "All"
      ? `${selYear}`
      : `${selYear}/${selMonth}`;

  return (
    <div
      style={{
        background: "var(--s1)",
        border: "1px solid var(--s3)",
        borderRadius: 14,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--t3)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 10,
        }}
      >
        {icon} {title}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: 11,
            fontWeight: 700,
            color,
            background: "var(--s2)",
            border: "1px solid var(--s3)",
            padding: "3px 8px",
            borderRadius: 5,
          }}
        >
          {label}
        </span>
        {!isAggregated && hasVal && (
          <button
            onClick={() => {
              setLocal("");
              onUpdate(key, "");
            }}
            aria-label={`清除此期間${title}`}
            style={{
              border: "none",
              background: "none",
              color: "var(--t4)",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <X size={13} />
          </button>
        )}
      </div>
      {isAggregated ? (
        <div
          style={{
            background: "var(--s2)",
            borderRadius: 8,
            padding: "10px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 10, color: "var(--t4)", fontWeight: 600 }}>
            各月合計
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: 15,
              fontWeight: 700,
              color: aggregatedVal > 0 ? color : "var(--t3)",
            }}
          >
            {fmt$(aggregatedVal)}
          </span>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 10,
              fontWeight: 700,
              color: "var(--t3)",
              fontFamily: mono,
              pointerEvents: "none",
            }}
          >
            NT$
          </span>
          <input
            type="number"
            min="0"
            value={local}
            placeholder="0"
            aria-label={`此期間${title}`}
            onChange={(e) => setLocal(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={handleBlur}
            style={{
              ...inp,
              width: "100%",
              textAlign: "right",
              paddingLeft: 36,
              borderColor: focused ? color : "var(--s3)",
            }}
          />
        </div>
      )}
      <p
        style={{
          fontSize: 10,
          color: "var(--t4)",
          marginTop: 6,
          lineHeight: 1.6,
        }}
      >
        {isAggregated
          ? selYear === "Custom"
            ? "自訂區間以整月合計；要編輯請於上方年份選單改選單一月份"
            : "各月合計；要編輯請於上方選單改選單一月份"
          : hint}
      </p>
    </div>
  );
}

/* ─── 單筆訂單損益計算（畫面與月度彙總共用，勿分岔） ─────────── */
const slOrderFin = (order, fp, costsMap) => {
  const ofp = order.snapshotFeeParams;
  const sfr =
    ((ofp?.platformFeeRate != null
      ? Number(ofp.platformFeeRate)
      : parseFloat(fp.platformFeeRate)) || 0) / 100;
  const oer =
    ((ofp?.opExpense != null
      ? Number(ofp.opExpense)
      : parseFloat(fp.opExpense)) || 0) / 100;
  const dtr =
    ((ofp?.tax != null ? Number(ofp.tax) : parseFloat(fp.tax)) || 0) / 100;
  const pay = String(order.paymentMethod || "");
  const dlv = String(order.deliveryMethod || "");
  let pr = { rate: 0.022, flat: 0 };
  for (const [k, v] of Object.entries(SL_PAYMENT_RATES)) {
    if (pay.includes(k)) {
      pr = v;
      break;
    }
  }
  const pf = order.revenue * pr.rate + pr.flat;
  let sc2 = 0;
  if (SL_INTL_METHODS.some((k) => dlv.includes(k))) sc2 = order.shippingIncome;
  else {
    for (const [k, v] of Object.entries(SL_SHIPPING_RATES)) {
      if (dlv.includes(k)) {
        sc2 = v;
        break;
      }
    }
    if (sc2 === 0) sc2 = 120;
  }
  const plf = order.revenue * sfr;
  let oc = 0;
  (order.items || []).forEach((item) => {
    const cv =
      Object.prototype.hasOwnProperty.call(item, "snapshotCost") &&
      item.snapshotCost !== null
        ? Number(item.snapshotCost) || 0
        : Number(costsMap[item.key]) || 0;
    oc += cv * item.qty;
  });
  const cm = order.revenue - oc - pf - sc2 - plf;
  const tax = order.isTaxExempt ? 0 : order.revenue * dtr;
  const opx = order.revenue * oer;
  return { pf, sc2, plf, oc, cm, tax, opx, net: cm - opx - tax };
};

const spOrderFin = (order, fp, costsMap) => {
  const st = safeText(order.status),
    rf = safeText(order.refundStatus);
  const isCanc = st.includes("不成立") || st.includes("取消");
  const isRef =
    !isCanc && (rf !== "" || (st.includes("退貨") && !st.includes("已完成")));
  const gross = numOrZero(order.grossPrice);
  const ofp = order.snapshotFeeParams;
  const opEx =
    ofp?.opExpense != null
      ? Number(ofp.opExpense) || 0
      : parseFloat(fp.opExpense) || 0;
  const tx =
    ofp?.tax != null ? Number(ofp.tax) || 0 : parseFloat(fp.tax) || 0;
  let oCost = 0;
  (order.items || []).forEach((item) => {
    const ic =
      Object.prototype.hasOwnProperty.call(item, "snapshotCost") &&
      item.snapshotCost !== null
        ? Number(item.snapshotCost) || 0
        : Number(costsMap[item.key]) || 0;
    oCost += ic * (item.qty || 1);
  });
  const voucher = numOrZero(order.sellerVoucher);
  const fee =
    numOrZero(order.exactOrderFee) + numOrZero(order.platformShippingFee);
  const net = gross - voucher - fee;
  const gp = net - oCost;
  const opAmt = gross * (opEx / 100);
  const taxBase = numOrZero(order.buyerTotal) || gross;
  const txAmt = taxBase * (tx / 100);
  return {
    isCanc,
    isRef,
    gross,
    voucher,
    fee,
    oCost,
    net,
    gp,
    opAmt,
    txAmt,
    finalNet: gp - opAmt - txAmt,
    opEx,
    tx,
  };
};

/* ─── 期間比較（環比／同比） ─────────────────────────────────── */
const CmpVal = ({ label, cur, prev }) => {
  let txt, c;
  if (prev > 0) {
    const d = (cur - prev) / prev;
    txt = `${d >= 0 ? "+" : ""}${(d * 100).toFixed(1)}%`;
    c = d > 0 ? "var(--up)" : d < 0 ? "var(--dn)" : "var(--t3)";
  } else {
    const d = cur - prev;
    txt = `${d >= 0 ? "+" : "−"}${fmt$(Math.abs(d))}`;
    c = d > 0 ? "var(--up)" : d < 0 ? "var(--dn)" : "var(--t3)";
  }
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      <span style={{ color: "var(--t3)" }}>{label}</span>
      <span style={{ fontFamily: mono, fontWeight: 700, color: c }}>
        {txt}
      </span>
    </span>
  );
};

function PeriodCompare({ monthly, sY, sM }) {
  const data = useMemo(() => {
    if (!monthly || sY === "All" || sY === "Custom") return null;
    const sumYear = (y) => {
      let rev = 0,
        net = 0,
        has = false;
      Object.entries(monthly).forEach(([k, v]) => {
        if (k.startsWith(y + "-")) {
          rev += v.rev;
          net += v.net;
          has = true;
        }
      });
      return has ? { rev, net } : null;
    };
    /* 節慶型電商季節性強：同比（去年同期）優先，環比僅供參考 */
    let cur;
    let missYoY = null;
    const groups = [];
    if (sM !== "All") {
      cur = monthly[`${sY}-${sM}`];
      const mNum = Number(sM);
      const pmKey =
        mNum === 1
          ? `${Number(sY) - 1}-12`
          : `${sY}-${String(mNum - 1).padStart(2, "0")}`;
      const pyKey = `${Number(sY) - 1}-${sM}`;
      if (monthly[pyKey])
        groups.push({
          label: `同比 ${pyKey.replace("-", "/")}`,
          prev: monthly[pyKey],
          primary: true,
        });
      else missYoY = `同比 ${pyKey.replace("-", "/")}`;
      if (monthly[pmKey])
        groups.push({
          label: `環比 ${pmKey.replace("-", "/")}`,
          prev: monthly[pmKey],
        });
    } else {
      cur = sumYear(sY);
      const py = sumYear(String(Number(sY) - 1));
      if (py)
        groups.push({
          label: `同比 ${Number(sY) - 1}年`,
          prev: py,
          primary: true,
        });
      else missYoY = `同比 ${Number(sY) - 1}年`;
    }
    if (!cur || (!groups.length && !missYoY)) return null;
    return { cur, groups, missYoY };
  }, [monthly, sY, sM]);
  if (!data) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
      {data.groups.map((g) => (
        <div
          key={g.label}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "5px 12px",
            borderRadius: 8,
            background: g.primary ? "var(--accent-dim)" : "var(--s2)",
            border: `1px solid ${g.primary ? "var(--accent-bdr)" : "var(--s3)"}`,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              color: g.primary ? "var(--accent-text)" : "var(--t2)",
              fontWeight: 700,
            }}
          >
            {g.label}
          </span>
          <CmpVal label="營收" cur={data.cur.rev} prev={g.prev.rev} />
          <CmpVal label="淨利" cur={data.cur.net} prev={g.prev.net} />
        </div>
      ))}
      {data.missYoY && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 12px",
            borderRadius: 8,
            background: "var(--s2)",
            border: "1px dashed var(--s4)",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <span style={{ color: "var(--t3)", fontWeight: 700 }}>
            {data.missYoY}
          </span>
          <span style={{ color: "var(--t4)", fontWeight: 500 }}>
            匯入去年報表後顯示
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── 訂單展開明細 ───────────────────────────────────────────── */
function OrderDetail({ order, isSL, slFp, slCosts, spCosts }) {
  const costOf = (item) =>
    Object.prototype.hasOwnProperty.call(item, "snapshotCost") &&
    item.snapshotCost !== null
      ? Number(item.snapshotCost) || 0
      : Number((isSL ? slCosts : spCosts)[item.key]) || 0;

  const lines = isSL
    ? (() => {
        const fin = slOrderFin(order, slFp, slCosts);
        return [
          { l: "訂單營收", v: order.revenue },
          { l: "商品成本", v: -fin.oc, neg: true },
          {
            l: `金流手續費（${order.paymentMethod || "—"}）`,
            v: -fin.pf,
            neg: true,
          },
          {
            l: `物流成本（${order.deliveryMethod || "—"}）`,
            v: -fin.sc2,
            neg: true,
          },
          { l: "系統服務費", v: -fin.plf, neg: true },
          { l: "通路後毛利", v: fin.cm, sub: true },
          { l: "內部營業費", v: -fin.opx, neg: true },
          {
            l: order.isTaxExempt ? "稅賦（免稅）" : "稅賦",
            v: -fin.tax,
            neg: true,
          },
          { l: "最終淨利", v: fin.net, bold: true },
        ];
      })()
    : [
        { l: "商品總價（含補貼還原）", v: order.localGross },
        { l: "賣場優惠券", v: -numOrZero(order.sellerVoucher), neg: true },
        { l: "平台手續費＋金流", v: -order.totalOrderFee, neg: true },
        { l: "商品成本", v: -order.orderCost, neg: true },
        { l: "通路後毛利", v: order.grossProfit, sub: true },
        { l: "內部營業費", v: -order.orderOpExpense, neg: true },
        { l: "稅賦（以買家支付計）", v: -order.orderTax, neg: true },
        { l: "最終淨利", v: order.finalNetProfit, bold: true },
      ];

  const metaBits = isSL
    ? [
        order.status && `狀態：${order.status}`,
        order.voucherAmount > 0 && `優惠折讓：${fmt$(order.voucherAmount)}`,
        order.hasReturn && "⚠ 此訂單有退貨單",
      ].filter(Boolean)
    : [
        order.status && `狀態：${order.status}`,
        order.refundStatus && `退貨/退款：${order.refundStatus}`,
        numOrZero(order.buyerTotal) > 0 &&
          `買家總支付：${fmt$(order.buyerTotal)}`,
      ].filter(Boolean);

  const secTitle = {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--t3)",
    letterSpacing: "0.05em",
    marginBottom: 6,
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 20,
      }}
    >
      <div>
        <div style={secTitle}>商品明細</div>
        {(order.items || []).map((it, i) => {
          const c = costOf(it);
          const price = isSL
            ? Number(it.price) || 0
            : numOrZero(it.activityPrice);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                padding: "5px 0",
                borderBottom: "1px dashed var(--s3)",
                fontSize: 12,
              }}
            >
              <span style={{ color: "var(--t1)", minWidth: 0 }}>
                {it.name}
                {it.option ? `（${it.option}）` : ""} × {it.qty}
                {it.isGift && (
                  <span style={{ color: "var(--purple)" }}>（贈品）</span>
                )}
              </span>
              <span
                style={{
                  fontFamily: mono,
                  whiteSpace: "nowrap",
                  color: "var(--t2)",
                }}
              >
                {fmt$(price * it.qty)} ／ 成本{" "}
                {c > 0 ? (
                  fmt$(c * it.qty)
                ) : (
                  <span style={{ color: "var(--wn)", fontWeight: 700 }}>
                    未填
                  </span>
                )}
              </span>
            </div>
          );
        })}
        {metaBits.length > 0 && (
          <div
            style={{
              fontSize: 11,
              color: "var(--t3)",
              marginTop: 8,
              lineHeight: 1.8,
            }}
          >
            {metaBits.join("　")}
          </div>
        )}
      </div>
      <div>
        <div style={secTitle}>損益拆解</div>
        {lines.map((r, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: r.sub || r.bold ? "8px 0 4px" : "4px 0",
              fontSize: 12,
              borderTop: r.sub || r.bold ? "1px solid var(--s3)" : "none",
              marginTop: r.sub || r.bold ? 4 : 0,
            }}
          >
            <span
              style={{
                color: r.bold ? "var(--t1)" : "var(--t2)",
                fontWeight: r.bold || r.sub ? 700 : 500,
              }}
            >
              {r.l}
            </span>
            <span
              style={{
                fontFamily: mono,
                fontWeight: r.bold ? 800 : 600,
                color: r.bold
                  ? r.v >= 0
                    ? "var(--up)"
                    : "var(--dn)"
                  : r.neg
                  ? "var(--dn)"
                  : "var(--t1)",
              }}
            >
              {fmt$(r.v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main App ───────────────────────────────────────────────── */
function ProfitCenter() {
  const [theme, setTheme] = useState(() => gl(SK.theme, "light"));
  const [platform, setPlatform] = useState(() => gl(SK.platform, "overview"));
  const [slFp, setSlFp] = useState(() => gl(SK.slFp, DEFAULT_FP_SL));
  const [spFp, setSpFp] = useState(() => gl(SK.spFp, DEFAULT_FP_SP));
  const [slCosts, setSlCosts] = useState(() => gl(SK.slCosts, {}));
  const [spCosts, setSpCosts] = useState(() => gl(SK.spCosts, {}));
  const [slOrders, setSlOrders] = useState(() => gl(SK.slOrders, {}));
  const [spOrders, setSpOrders] = useState(() => gl(SK.spOrders, {}));
  const [commissions, setCommissions] = useState(() => gl(SK.commissions, {}));

  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);
  const [confirmBox, setConfirmBox] = useState(null);
  const [sY, setSY] = useState("All");
  const [sM, setSM] = useState("All");
  const [range, setRange] = useState({ from: "", to: "" });
  const [search, setSearch] = useState("");
  const [mSearch, setMSearch] = useState("");
  const dSearch = useDebounced(search);
  const dMSearch = useDebounced(mSearch);
  const [lossOnly, setLossOnly] = useState(false);
  const [sync, setSync] = useState("connecting");
  const [cReady, setCReady] = useState(false);
  const [aReady, setAReady] = useState(false);
  const [costSort, setCostSort] = useState({ key: "soldQty", dir: "desc" });
  const [orderSort, setOrderSort] = useState({ key: "date", dir: "desc" });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(30);
  const [dragOver, setDragOver] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fRef = useRef({});
  const cRef = useRef(null);
  const cDoc = useRef(null);
  const firstMissRef = useRef(null);
  const prevSlMonthlyHashes = useRef({});
  const prevSpMonthlyHashes = useRef({});
  const migrating = useRef(false);
  const applying = useRef(false);
  const sTimer = useRef(null);
  /* 遠端時間戳分開追蹤：meta / 官網月份 / 蝦皮月份 互不干擾 */
  const lRMeta = useRef(0);
  const lRSl = useRef(0);
  const lRSp = useRef(0);
  const lL = useRef(0);
  const meta = useRef({
    clientId: typeof window !== "undefined" ? gcid() : "",
  });
  const [lastSyncAt, setLastSyncAt] = useState(0);

  /* toast：帶動作（復原）的通知給較長的 10 秒，時間到一樣自動消失 */
  const toast = useCallback((msg, opts = {}) => {
    const id = ++toastIdRef.current;
    const { type = "info", action, actionLabel } = opts;
    const duration = opts.duration ?? (action ? 10000 : 3500);
    setToasts((p) => [
      ...p,
      { id, msg, type, duration, action, actionLabel, removing: false },
    ]);
    setTimeout(() => {
      setToasts((p) =>
        p.map((t) => (t.id === id ? { ...t, removing: true } : t))
      );
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 350);
    }, duration);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((p) =>
      p.map((t) => (t.id === id ? { ...t, removing: true } : t))
    );
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 350);
  }, []);

  /* localStorage 寫入失敗（容量滿）時提醒一次，避免無聲遺失本地快取 */
  const storageWarned = useRef(false);
  const persist = useCallback(
    (k, v) => {
      if (!sl_s(k, v) && !storageWarned.current) {
        storageWarned.current = true;
        toast("瀏覽器本地儲存空間不足，離線快取可能不完整（雲端同步不受影響）", {
          type: "warning",
          duration: 8000,
        });
      }
    },
    [toast]
  );

  useEffect(() => {
    persist(SK.theme, theme);
  }, [theme, persist]);
  useEffect(() => {
    persist(SK.platform, platform);
  }, [platform, persist]);
  useEffect(() => {
    persist(SK.slFp, slFp);
  }, [slFp, persist]);
  useEffect(() => {
    persist(SK.spFp, spFp);
  }, [spFp, persist]);
  useEffect(() => {
    persist(SK.slCosts, slCosts);
  }, [slCosts, persist]);
  useEffect(() => {
    persist(SK.spCosts, spCosts);
  }, [spCosts, persist]);
  useEffect(() => {
    persist(SK.slOrders, slOrders);
  }, [slOrders, persist]);
  useEffect(() => {
    persist(SK.spOrders, spOrders);
  }, [spOrders, persist]);
  useEffect(() => {
    persist(SK.commissions, commissions);
  }, [commissions, persist]);

  /* Firebase init */
  useEffect(() => {
    try {
      const app = getApps().length ? getApp() : initializeApp(FBC);
      const auth = getAuth(app),
        db = getFirestore(app);
      cDoc.current = doc(db, FSPC.collection, FSPC.docId);
      fRef.current._db = db;
      fRef.current._slDoc = doc(db, FSPC_SL.collection, FSPC_SL.docId);
      fRef.current._spDoc = doc(db, FSPC_SP.collection, FSPC_SP.docId);
      fRef.current._slOrdDoc = doc(
        db,
        FSPC_SL_ORD.collection,
        FSPC_SL_ORD.docId
      );
      fRef.current._spOrdDoc = doc(
        db,
        FSPC_SP_ORD.collection,
        FSPC_SP_ORD.docId
      );
      fRef.current._slMonthlyColl = collection(db, SL_MONTHLY_COLL);
      fRef.current._spMonthlyColl = collection(db, SP_MONTHLY_COLL);
      setSync("connecting");
      const un = onAuthStateChanged(auth, async (u) => {
        try {
          if (!u) {
            await signInAnonymously(auth);
            return;
          }
          setAReady(true);
        } catch (e) {
          console.error("[Auth Error]", e);
          setSync("error");
        }
      });
      return () => un();
    } catch (e) {
      console.error("[Firebase Init Error]", e);
      setSync("error");
    }
  }, []);

  /* Firebase load (meta + monthly collections) */
  useEffect(() => {
    if (!aReady || !cDoc.current) return;

    const parseMeta = (snap) => {
      if (!snap.exists()) return null;
      const d = snap.data();
      if (d?.payloadJson) {
        try {
          return JSON.parse(d.payloadJson);
        } catch {
          return null;
        }
      }
      if (d?.payload) return d.payload;
      return null;
    };

    const runMigrationIfNeeded = async (metaSnap) => {
      if (migrating.current) return;
      const d = metaSnap.exists() ? metaSnap.data() : {};
      if (d?.splitByMonth === true) return;
      migrating.current = true;
      try {
        console.log("[Migration] Starting old-doc → monthly migration");
        // 以本地 state 為主（避免舊 doc 因寫入失敗而落後）
        let slSource = slOrders;
        let spSource = spOrders;
        if (Object.keys(slSource).length === 0) {
          try {
            const oldSnap = await getDoc(fRef.current._slOrdDoc);
            if (oldSnap.exists() && oldSnap.data()?.ordersJson) {
              slSource = JSON.parse(oldSnap.data().ordersJson);
              setSlOrders(slSource);
            }
          } catch (e) {
            console.error("[Migration read SL]", e);
          }
        }
        if (Object.keys(spSource).length === 0) {
          try {
            const oldSnap = await getDoc(fRef.current._spOrdDoc);
            if (oldSnap.exists() && oldSnap.data()?.ordersJson) {
              spSource = JSON.parse(oldSnap.data().ordersJson);
              setSpOrders(spSource);
            }
          } catch (e) {
            console.error("[Migration read SP]", e);
          }
        }
        const ms = Date.now();
        const slByMonth = groupOrdersByMonth(slSource);
        const spByMonth = groupOrdersByMonth(spSource);
        const writes = [];
        Object.entries(slByMonth).forEach(([ym, orders]) => {
          const json = JSON.stringify(orders);
          prevSlMonthlyHashes.current[ym] = json;
          writes.push(
            setDoc(doc(fRef.current._db, SL_MONTHLY_COLL, ym), {
              ordersJson: json,
              count: Object.keys(orders).length,
              updatedAtMs: ms,
            })
          );
        });
        Object.entries(spByMonth).forEach(([ym, orders]) => {
          const json = JSON.stringify(orders);
          prevSpMonthlyHashes.current[ym] = json;
          writes.push(
            setDoc(doc(fRef.current._db, SP_MONTHLY_COLL, ym), {
              ordersJson: json,
              count: Object.keys(orders).length,
              updatedAtMs: ms,
            })
          );
        });
        await Promise.all(writes);
        await setDoc(
          cDoc.current,
          {
            splitByMonth: true,
            migratedAt: serverTimestamp(),
          },
          { merge: true }
        );
        const totalSl = Object.keys(slSource).length;
        const totalSp = Object.keys(spSource).length;
        console.log(`[Migration] Done. SL=${totalSl}, SP=${totalSp}`);
        toast(`✓ 已完成按月拆分：官網 ${totalSl} 筆 + 蝦皮 ${totalSp} 筆`, {
          type: "success",
          duration: 8000,
        });
      } catch (e) {
        console.error("[Migration Error]", e);
        toast("遷移失敗：" + e.message, { type: "error", duration: 8000 });
      } finally {
        migrating.current = false;
      }
    };

    // === LEGACY DATA RESTORE (manual via DevTools) ===
    // Usage in browser console:
    //   window.forceLegacyRestore()           -> inspect legacy docs only
    //   window.forceLegacyRestore("apply")   -> write legacy orders into monthly collections
    window.forceLegacyRestore = async (mode) => {
      try {
        console.log("[Restore] mode:", mode || "inspect");
        const slOldSnap = await getDoc(fRef.current._slOrdDoc);
        const spOldSnap = await getDoc(fRef.current._spOrdDoc);
        const slOldRaw = slOldSnap.exists() ? slOldSnap.data() : null;
        const spOldRaw = spOldSnap.exists() ? spOldSnap.data() : null;
        const parse = (raw) => {
          if (!raw) return null;
          if (raw.ordersJson) {
            try { return JSON.parse(raw.ordersJson); } catch { return null; }
          }
          return raw.orders || null;
        };
        const slLegacy = parse(slOldRaw) || {};
        const spLegacy = parse(spOldRaw) || {};
        const slCount = Object.keys(slLegacy).length;
        const spCount = Object.keys(spLegacy).length;
        const sample = (obj) =>
          Object.entries(obj)
            .slice(0, 2)
            .map(([k, v]) => ({
              k: k.length > 60 ? k.slice(0, 60) + "..." : k,
              vType: typeof v,
              vKeys: v && typeof v === "object" ? Object.keys(v).slice(0, 8) : null,
            }));
        const slSample = sample(slLegacy);
        const spSample = sample(spLegacy);
        console.log("[Restore] sl legacy count:", slCount, "sample:", slSample);
        console.log("[Restore] sp legacy count:", spCount, "sample:", spSample);
        if (mode !== "apply") {
          console.log("[Restore] inspect-only. Run forceLegacyRestore('apply') to write monthly docs.");
          return { slCount, spCount, slSample, spSample };
        }
        if (!window.confirm("Will write " + slCount + " SL + " + spCount + " SP orders into monthly collections. Proceed?")) return;
        const slByMonth = groupOrdersByMonth(slLegacy);
        const spByMonth = groupOrdersByMonth(spLegacy);
        const ms = Date.now();
        const writes = [];
        for (const [ym, orders] of Object.entries(slByMonth)) {
          writes.push(
            setDoc(doc(fRef.current._db, SL_MONTHLY_COLL, ym), {
              ordersJson: JSON.stringify(orders),
              count: Object.keys(orders).length,
              updatedAtMs: ms,
            })
          );
        }
        for (const [ym, orders] of Object.entries(spByMonth)) {
          writes.push(
            setDoc(doc(fRef.current._db, SP_MONTHLY_COLL, ym), {
              ordersJson: JSON.stringify(orders),
              count: Object.keys(orders).length,
              updatedAtMs: ms,
            })
          );
        }
        await Promise.all(writes);
        setSlOrders(slLegacy);
        setSpOrders(spLegacy);
        console.log("[Restore] DONE. Wrote", writes.length, "monthly docs.");
        return { wrote: writes.length, slCount, spCount };
      } catch (e) {
        console.error("[Restore] error:", e);
        return { error: e.message };
      }
    };
    // === END LEGACY DATA RESTORE ===

    // meta 監聽
    const unMeta = onSnapshot(
      cDoc.current,
      async (snap) => {
        try {
          const metaData = parseMeta(snap);
          const rMs = Number(metaData?.updatedAtMs || 0);
          if (metaData && rMs > lRMeta.current && rMs > lL.current) {
            applying.current = true;
            if (metaData.slFp) setSlFp(metaData.slFp);
            if (metaData.spFp) setSpFp(metaData.spFp);
            if (metaData.slCosts) setSlCosts(metaData.slCosts);
            if (metaData.spCosts) setSpCosts(metaData.spCosts);
            if (metaData.commissions) setCommissions(metaData.commissions);
            lRMeta.current = rMs;
            lL.current = rMs;
            setLastSyncAt(Date.now());
            setTimeout(() => {
              applying.current = false;
            }, 50);
          }
          await runMigrationIfNeeded(snap);
          setCReady(true);
          setSync("synced");
        } catch (e) {
          console.error("[Meta Snapshot Error]", e);
          setCReady(true);
          setSync("error");
        }
      },
      (err) => {
        console.error("[Meta Snapshot Error]", err);
        setCReady(true);
        setSync("error");
      }
    );

    // 官網月份 collection 監聽
    let slFirstLoad = true;
    const unSl = onSnapshot(
      fRef.current._slMonthlyColl,
      (snapshot) => {
        try {
          const all = {};
          let maxMs = 0;
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            if (d?.ordersJson) {
              try {
                Object.assign(all, JSON.parse(d.ordersJson));
              } catch {}
            }
            const m = Number(d?.updatedAtMs || 0);
            if (m > maxMs) maxMs = m;
            prevSlMonthlyHashes.current[docSnap.id] = d?.ordersJson || "";
          });
          if (
            slFirstLoad ||
            (maxMs > lRSl.current && maxMs > lL.current && !applying.current)
          ) {
            slFirstLoad = false;
            applying.current = true;
            setSlOrders(all);
            if (maxMs > lRSl.current) lRSl.current = maxMs;
            setLastSyncAt(Date.now());
            setTimeout(() => {
              applying.current = false;
            }, 50);
          }
        } catch (e) {
          console.error("[SL Monthly Snapshot Error]", e);
        }
      },
      (err) => console.error("[SL Monthly Snapshot Error]", err)
    );

    // 蝦皮月份 collection 監聽
    let spFirstLoad = true;
    const unSp = onSnapshot(
      fRef.current._spMonthlyColl,
      (snapshot) => {
        try {
          const all = {};
          let maxMs = 0;
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            if (d?.ordersJson) {
              try {
                Object.assign(all, JSON.parse(d.ordersJson));
              } catch {}
            }
            const m = Number(d?.updatedAtMs || 0);
            if (m > maxMs) maxMs = m;
            prevSpMonthlyHashes.current[docSnap.id] = d?.ordersJson || "";
          });
          if (
            spFirstLoad ||
            (maxMs > lRSp.current && maxMs > lL.current && !applying.current)
          ) {
            spFirstLoad = false;
            applying.current = true;
            setSpOrders(all);
            if (maxMs > lRSp.current) lRSp.current = maxMs;
            setLastSyncAt(Date.now());
            setTimeout(() => {
              applying.current = false;
            }, 50);
          }
        } catch (e) {
          console.error("[SP Monthly Snapshot Error]", e);
        }
      },
      (err) => console.error("[SP Monthly Snapshot Error]", err)
    );

    return () => {
      unMeta();
      unSl();
      unSp();
    };
    // 監聽器只在登入完成時建立一次；slOrders/spOrders 僅供一次性遷移讀取
    // eslint-disable-next-line
  }, [aReady]);

  /* Firebase save (meta + only changed months) */
  useEffect(() => {
    if (!aReady || !cReady || !cDoc.current || applying.current) return;
    if (migrating.current) return;
    clearTimeout(sTimer.current);
    sTimer.current = setTimeout(async () => {
      try {
        setSync("saving");
        const ms = Date.now();
        const db = fRef.current._db;

        const metaPl = deepClean({
          slFp,
          spFp,
          slCosts,
          spCosts,
          commissions,
          updatedAtMs: ms,
          updatedBy: meta.current.clientId,
        });

        const slByMonth = groupOrdersByMonth(slOrders);
        const spByMonth = groupOrdersByMonth(spOrders);

        const writes = [
          setDoc(
            cDoc.current,
            {
              payloadJson: JSON.stringify(metaPl),
              updatedAtMs: ms,
              updatedBy: metaPl.updatedBy,
              splitByMonth: true,
              updatedAtServer: serverTimestamp(),
            },
            { merge: true }
          ),
        ];

        // 官網：只寫有變動的月份
        Object.entries(slByMonth).forEach(([ym, orders]) => {
          const json = JSON.stringify(orders);
          if (prevSlMonthlyHashes.current[ym] === json) return;
          prevSlMonthlyHashes.current[ym] = json;
          writes.push(
            setDoc(doc(db, SL_MONTHLY_COLL, ym), {
              ordersJson: json,
              count: Object.keys(orders).length,
              updatedAtMs: ms,
            })
          );
        });
        // 官網：偵測已刪除的月份
        Object.keys(prevSlMonthlyHashes.current).forEach((ym) => {
          if (!slByMonth[ym]) {
            delete prevSlMonthlyHashes.current[ym];
            writes.push(deleteDoc(doc(db, SL_MONTHLY_COLL, ym)));
          }
        });

        // 蝦皮：只寫有變動的月份
        Object.entries(spByMonth).forEach(([ym, orders]) => {
          const json = JSON.stringify(orders);
          if (prevSpMonthlyHashes.current[ym] === json) return;
          prevSpMonthlyHashes.current[ym] = json;
          writes.push(
            setDoc(doc(db, SP_MONTHLY_COLL, ym), {
              ordersJson: json,
              count: Object.keys(orders).length,
              updatedAtMs: ms,
            })
          );
        });
        Object.keys(prevSpMonthlyHashes.current).forEach((ym) => {
          if (!spByMonth[ym]) {
            delete prevSpMonthlyHashes.current[ym];
            writes.push(deleteDoc(doc(db, SP_MONTHLY_COLL, ym)));
          }
        });

        await Promise.all(writes);
        lL.current = ms;
        setLastSyncAt(Date.now());
        setSync("synced");
      } catch (e) {
        console.error("[Save Error]", e);
        setSync("error");
      }
    }, 900);
    return () => clearTimeout(sTimer.current);
  }, [
    slFp,
    spFp,
    slCosts,
    spCosts,
    slOrders,
    spOrders,
    commissions,
    aReady,
    cReady,
  ]);

  /* ─── Shopline CSV/XLSX Parser ─────────────────────────────── */
  const processSLParsed = (parsed) => {
    if (!Array.isArray(parsed) || parsed.length < 2) {
      toast("格式錯誤", { type: "error" });
      return;
    }
    const hdrs = parsed[0].map((h) => safeText(h).replace(/^\uFEFF/, ""));
    const idx = (n) => hdrs.indexOf(n);
    const idxF = (a, b) => {
      const i = idx(a);
      return i !== -1 ? i : idx(b);
    };

    const im = {
      cartId: idx("購物車編號"),
      orderId: idx("訂單號碼"),
      date: idxF("訂單日期", "訂單成立於"),
      status: idx("訂單狀態"),
      payMethod: idx("付款方式"),
      delivery: idx("送貨方式"),
      subtotal: idx("訂單小計"),
      shippingFee: idx("運費"),
      discount: idx("優惠折扣"),
      creditOffset: idx("折抵購物金"),
      pointOffset: idx("點數折現"),
      total: idx("訂單合計"),
      paidTotal: idx("付款總金額"),
      refunded: idx("已退款金額"),
      prodName: idx("商品名稱"),
      option: idx("選項"),
      prodId: idx("商品貨號"),
      qty: idx("數量"),
      unitPrice: idxF("商品結帳價", "商品原價"),
      prodType: idx("商品類型"),
      addOnType: idx("加購品類型"),
      itemDiscount: idx("商品折扣金額"),
      orderShare: idx("全單折扣金額"),
      creditShare: idx("折抵購物金分攤"),
      pointShare: idx("點數折現分攤"),
      taxExempt: idx("發票稅別"),
      invoiceStatus: idx("發票狀態"),
      returnId: idx("退貨單編號"),
    };

    if (im.orderId === -1 || im.date === -1) {
      toast("找不到必要欄位（訂單號碼/訂單日期），請確認是 Shopline 標準報表", {
        type: "error",
      });
      return;
    }

    const newOrders = {};
    let count = 0;

    for (let i = 1; i < parsed.length; i++) {
      const row = parsed[i];
      if (!row || row.length < 5) continue;

      const rawOrderId = safeText(row[im.orderId]);
      if (!rawOrderId) continue;

      const cartId = im.cartId > -1 ? safeText(row[im.cartId]) : rawOrderId;
      const groupKey = cartId || rawOrderId;

      const date = normDate(row[im.date]);

      const rowRevenue = () =>
        numOrZero(
          im.paidTotal > -1
            ? row[im.paidTotal]
            : im.total > -1
            ? row[im.total]
            : 0
        );
      const rowVoucher = () =>
        numOrZero(im.discount > -1 ? row[im.discount] : 0) +
        numOrZero(im.creditOffset > -1 ? row[im.creditOffset] : 0) +
        numOrZero(im.pointOffset > -1 ? row[im.pointOffset] : 0);
      const rowShipping = () =>
        numOrZero(im.shippingFee > -1 ? row[im.shippingFee] : 0);

      if (!newOrders[groupKey]) {
        const statusRaw = im.status > -1 ? safeText(row[im.status]) : "";
        const isTaxExempt =
          (im.taxExempt > -1 && safeText(row[im.taxExempt]) === "免稅") ||
          (im.invoiceStatus > -1 &&
            safeText(row[im.invoiceStatus]) === "待開立");
        const hasReturn = im.returnId > -1 && safeText(row[im.returnId]) !== "";
        const payMethod = im.payMethod > -1 ? safeText(row[im.payMethod]) : "";
        const delivMethod = im.delivery > -1 ? safeText(row[im.delivery]) : "";

        newOrders[groupKey] = {
          orderId: rawOrderId,
          date,
          status: statusRaw,
          revenue: rowRevenue(),
          voucherAmount: rowVoucher(),
          shippingIncome: rowShipping(),
          paymentMethod: payMethod,
          deliveryMethod: delivMethod,
          isTaxExempt,
          hasReturn,
          items: [],
          _orderIds: [rawOrderId],
        };
        count++;
      } else if (!newOrders[groupKey]._orderIds.includes(rawOrderId)) {
        // 同一購物車內的另一張訂單：金額累加，避免只取第一張造成漏算
        newOrders[groupKey]._orderIds.push(rawOrderId);
        newOrders[groupKey].revenue += rowRevenue();
        newOrders[groupKey].voucherAmount += rowVoucher();
        newOrders[groupKey].shippingIncome += rowShipping();
      }

      const prodName =
        im.prodName > -1 ? safeText(row[im.prodName]) : "未知商品";
      const option = im.option > -1 ? safeText(row[im.option]) : "";
      const qty = parseInt(im.qty > -1 ? row[im.qty] || 1 : 1, 10) || 1;
      const price = numOrZero(im.unitPrice > -1 ? row[im.unitPrice] : 0);
      const prodType = im.prodType > -1 ? safeText(row[im.prodType]) : "商品";
      const addOnType = im.addOnType > -1 ? safeText(row[im.addOnType]) : "";
      const isGift = prodType === "贈品";

      if (!prodName) continue;

      const costKey = `${prodName}_${option}`.trim();

      newOrders[groupKey].items.push({
        key: costKey,
        name: prodName,
        option,
        qty,
        price,
        isGift,
        isAddOn: prodType === "加購品",
        addOnType,
      });
    }

    setSlOrders((p) => {
      const merged = { ...p };
      /* 成員單號索引：同一購物車的任何一張單號都指回同一筆儲存紀錄，
         避免之後的部分報表（只含 cart 內另一張單）被誤判為新訂單而重複入帳 */
      const memberIdx = {};
      Object.entries(merged).forEach(([sk, o]) => {
        (o.memberIds || [o.orderId]).forEach((id) => {
          memberIdx[id] = sk;
        });
      });
      Object.values(newOrders).forEach((order) => {
        const { _orderIds, ...clean } = order;
        let sk = clean.orderId;
        for (const id of _orderIds) {
          if (memberIdx[id]) {
            sk = memberIdx[id];
            break;
          }
        }
        const old = merged[sk];
        clean.orderId = sk;
        clean.memberIds = [
          ...new Set([...(old?.memberIds || []), ..._orderIds]),
        ];
        clean.memberIds.forEach((id) => {
          memberIdx[id] = sk;
        });
        /* 重匯同單：保留既有快照，避免鎖定的歷史參數被靜默清除 */
        merged[sk] = withOldSnapshot(old, clean);
      });
      return merged;
    });
    const dates = Object.values(newOrders)
      .map((o) => String(o.date))
      .filter(Boolean)
      .sort()
      .reverse();
    if (dates.length) {
      setSY(dates[0].substring(0, 4));
      setSM(dates[0].substring(5, 7));
    }
    toast(`已匯入 ${count} 筆官網訂單`, { type: "success" });
  };

  /* ─── Shopee CSV/XLSX Parser ────────────────────────────────── */
  const processSPParsed = (parsed) => {
    if (!Array.isArray(parsed) || parsed.length < 2) {
      toast("格式錯誤", { type: "error" });
      return;
    }
    const hdrs = parsed[0].map((h) => safeText(h).replace(/^\uFEFF/, ""));
    const idx = (n) => hdrs.indexOf(n);
    const idxF = (a, b) => {
      const i = idx(a);
      return i !== -1 ? i : idx(b);
    };

    const im = {
      orderId: idx("訂單編號"),
      date: idx("訂單成立日期"),
      status: idx("訂單狀態"),
      refundStatus: idx("退貨 / 退款狀態"),
      grossPrice: idx("商品總價"),
      buyerTotal: idx("買家總支付金額"),
      coinDiscount: idx("蝦幣折抵"),
      platformSubsidy: idx("蝦皮補貼金額"),
      platformShippingSubsidy: idx("蝦皮補助運費"),
      sellerVoucher: idxF("賣場優惠券", "賣家負擔優惠券"),
      platformVoucher: idxF("優惠券", "蝦皮負擔優惠券"),
      sellerCoinCashback: idxF("賣家蝦幣回饋券", "賣家負擔蝦幣回饋券"),
      txFee: idx("成交手續費"),
      otherFee: idx("其他服務費"),
      paymentFee: idx("金流與系統處理費"),
      prodName: idx("商品名稱"),
      optName: idx("商品選項名稱"),
      prodId: idx("商品ID"),
      optId: idx("規格ID"),
      qty: idx("數量"),
      activityPrice: idx("商品活動價格"),
    };

    if (im.orderId === -1 || im.date === -1) {
      toast("找不到必要欄位，請確認是蝦皮標準報表", { type: "error" });
      return;
    }

    const newOrders = {};
    let count = 0;

    for (let i = 1; i < parsed.length; i++) {
      const row = parsed[i];
      if (!row || row.length < 5) continue;
      const orderId = safeText(row[im.orderId]);
      if (!orderId) continue;
      const date = normDate(row[im.date]);

      if (!newOrders[orderId]) {
        const rawGross =
          numOrZero(im.grossPrice > -1 ? row[im.grossPrice] : 0) +
          numOrZero(im.coinDiscount > -1 ? row[im.coinDiscount] : 0) +
          numOrZero(im.platformSubsidy > -1 ? row[im.platformSubsidy] : 0) +
          numOrZero(im.platformVoucher > -1 ? row[im.platformVoucher] : 0);

        newOrders[orderId] = {
          orderId,
          date,
          status: im.status > -1 ? safeText(row[im.status]) : "",
          refundStatus:
            im.refundStatus > -1 ? safeText(row[im.refundStatus]) : "",
          grossPrice: rawGross,
          buyerTotal: numOrZero(im.buyerTotal > -1 ? row[im.buyerTotal] : 0),
          sellerVoucher: numOrZero(
            im.sellerVoucher > -1 ? row[im.sellerVoucher] : 0
          ),
          platformVoucher: 0,
          coinOffset: 0,
          sellerCoinCashback: numOrZero(
            im.sellerCoinCashback > -1 ? row[im.sellerCoinCashback] : 0
          ),
          platformShippingFee: 0,
          exactOrderFee:
            numOrZero(im.txFee > -1 ? row[im.txFee] : 0) +
            numOrZero(im.otherFee > -1 ? row[im.otherFee] : 0) +
            numOrZero(im.paymentFee > -1 ? row[im.paymentFee] : 0),
          items: [],
        };
        count++;
      }

      newOrders[orderId].items.push({
        key: `${im.prodId > -1 ? safeText(row[im.prodId]) : ""}_${
          im.optId > -1 ? safeText(row[im.optId]) : ""
        }`,
        qty: parseInt(im.qty > -1 ? row[im.qty] || 1 : 1, 10) || 1,
        name: im.prodName > -1 ? safeText(row[im.prodName]) : "未知商品",
        option: im.optName > -1 ? safeText(row[im.optName]) : "",
        activityPrice: numOrZero(
          im.activityPrice > -1 ? row[im.activityPrice] : 0
        ),
      });
    }

    setSpOrders((p) => {
      const merged = { ...p };
      Object.values(newOrders).forEach((order) => {
        /* 重匯同單：保留既有快照，避免鎖定的歷史參數被靜默清除 */
        merged[order.orderId] = withOldSnapshot(merged[order.orderId], order);
      });
      return merged;
    });
    const dates = Object.values(newOrders)
      .map((o) => String(o.date))
      .filter(Boolean)
      .sort()
      .reverse();
    if (dates.length) {
      setSY(dates[0].substring(0, 4));
      setSM(dates[0].substring(5, 7));
    }
    toast(`已匯入 ${count} 筆蝦皮訂單`, { type: "success" });
  };

  const processFile = (f) => {
    if (!f) return;
    const fname = f.name.toLowerCase();
    const isX = fname.endsWith(".xlsx") || fname.endsWith(".xls");
    if (!isX && !fname.endsWith(".csv")) {
      toast("僅支援 CSV / XLSX / XLS 檔案", { type: "error" });
      return;
    }
    const rd = new FileReader();
    const exec = (d2, x) => {
      if (x) {
        const wb = window.XLSX.read(d2, { type: "array" });
        const j = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
          header: 1,
          defval: "",
          raw: false,
        });
        const rows = j.map((r) => r.map((c) => String(c)));
        if (platform === "shopline") processSLParsed(rows);
        else processSPParsed(rows);
      } else {
        if (platform === "shopline") processSLParsed(parseCSV(d2));
        else processSPParsed(parseCSV(d2));
      }
    };
    rd.onload = (ev) => {
      try {
        exec(ev.target.result, isX);
      } catch (err) {
        console.error("[Parse Error]", err);
        toast("報表解析失敗：" + err.message, { type: "error", duration: 8000 });
      }
    };
    rd.onerror = () => toast("檔案讀取失敗，請重試", { type: "error" });
    if (isX) {
      if (typeof window.XLSX === "undefined") {
        const s2 = document.createElement("script");
        s2.src =
          "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        s2.onload = () => rd.readAsArrayBuffer(f);
        s2.onerror = () =>
          toast("XLSX 解析器載入失敗，請確認網路後重試", { type: "error" });
        document.head.appendChild(s2);
      } else rd.readAsArrayBuffer(f);
    } else rd.readAsText(f);
  };

  const handleFile = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = "";
  };

  /* ─── 期間過濾（年月／自訂區間共用） ────────────────────── */
  const inPeriod = useCallback(
    (d) => {
      const s = String(d || "");
      if (sY === "Custom") {
        if (range.from && s < range.from) return false;
        if (range.to && s > range.to) return false;
        return true;
      }
      if (sY !== "All" && !s.startsWith(sY)) return false;
      if (sM !== "All" && !s.startsWith(`${sY}-${sM}`)) return false;
      return true;
    },
    [sY, sM, range]
  );

  /* ─── Shopline Data Processing ────────────────────────────── */
  const slData = useMemo(() => {
    const all = Object.values(slOrders);
    if (!all.length) return null;
    const years = [...new Set(all.map((o) => o.date.substring(0, 4)))]
      .sort()
      .reverse();
    const months = [
      ...new Set(
        all
          .filter((o) => sY === "All" || o.date.startsWith(sY))
          .map((o) => o.date.substring(5, 7))
      ),
    ].sort();
    const tnr = (parseFloat(slFp.targetNet) || 17) / 100;
    const mm = {};
    Object.keys(slCosts).forEach((k) => {
      const p = k.split("_");
      mm[k] = {
        key: k,
        name: p[0],
        option: p[1]?.trim() || "標準規格",
        soldQty: 0,
        profitContribution: 0,
        totalRevenue: 0,
        totalCost: 0,
      };
    });
    const t = {
      rev: 0,
      inbound: 0,
      pFee: 0,
      sCost: 0,
      platformFee: 0,
      cost: 0,
      net: 0,
      valid: 0,
      voucher: 0,
      opExpTotal: 0,
      taxTotal: 0,
      rawTotal: 0,
      cancelledTotal: 0,
      contributionMargin: 0,
      giftCost: 0,
      giftQty: 0,
      totalQty: 0,
      returnCount: 0,
      returnRev: 0,
      addOnRev: 0,
      addOnQty: 0,
      addOnOrders: 0,
    };
    const fl = all.filter((o) => {
      if (!inPeriod(o.date)) return false;
      const cx = o.status.includes("取消") || o.status.includes("刪除");
      t.rawTotal += o.revenue;
      if (cx) {
        t.cancelledTotal += o.revenue;
        return false;
      }
      return true;
    });
    const ol = fl
      .map((order) => {
        const fin = slOrderFin(order, slFp, slCosts);
        let hasAddOn = false;
        order.items.forEach((item) => {
          const cv =
            Object.prototype.hasOwnProperty.call(item, "snapshotCost") &&
            item.snapshotCost !== null
              ? Number(item.snapshotCost) || 0
              : Number(slCosts[item.key]) || 0;
          t.totalQty += item.qty;
          if (!mm[item.key])
            mm[item.key] = {
              key: item.key,
              name: item.name,
              option: item.option?.trim() || "標準規格",
              soldQty: 0,
              profitContribution: 0,
              totalRevenue: 0,
              totalCost: 0,
            };
          mm[item.key].soldQty += item.qty;
          const ir = (Number(item.price) || 0) * item.qty,
            ic = cv * item.qty;
          mm[item.key].profitContribution += ir - ic;
          mm[item.key].totalRevenue += ir;
          mm[item.key].totalCost += ic;
          if (item.isGift === true || safeText(item.name).includes("贈品")) {
            t.giftCost += ic;
            t.giftQty += item.qty;
          }
          if (item.isAddOn === true) {
            t.addOnRev += ir;
            t.addOnQty += item.qty;
            hasAddOn = true;
          }
        });
        if (hasAddOn) t.addOnOrders++;
        const { pf, sc2, plf, oc, cm, tax, opx, net } = fin;
        t.rev += order.revenue;
        t.pFee += pf;
        t.sCost += sc2;
        t.platformFee += plf;
        t.cost += oc;
        t.contributionMargin += cm;
        t.net += net;
        t.inbound += order.revenue - pf - sc2 - plf;
        t.voucher += order.voucherAmount;
        t.opExpTotal += opx;
        t.taxTotal += tax;
        if (order.hasReturn) {
          t.returnCount++;
          t.returnRev += order.revenue;
        }
        t.valid++;
        return {
          ...order,
          pFee: pf,
          sCost: sc2,
          plFee: plf,
          channelFee: pf + sc2 + plf,
          opx,
          taxAmt: tax,
          net,
          oCost: oc,
          currentOrderContribution: cm,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
    const tnm = t.rev > 0 ? t.net / t.rev : 0;
    return {
      years,
      months,
      orderList: ol,
      lossCount: ol.filter((o) => o.net < 0).length,
      matrixList: Object.values(mm).sort((a, b) => b.soldQty - a.soldQty),
      summary: {
        ...t,
        trueNetMargin: tnm,
        gapVal: (tnm - tnr) * 100,
        targetNetRate: tnr,
        grossMargin: t.rev > 0 ? (t.rev - t.cost) / t.rev : 0,
        realCommissionRate:
          t.rev > 0 ? (t.pFee + t.sCost + t.platformFee) / t.rev : 0,
        voucherRate: t.rev > 0 ? t.voucher / t.rev : 0,
        giftCostRate: t.rev > 0 ? t.giftCost / t.rev : 0,
        returnRate: t.valid > 0 ? t.returnCount / t.valid : 0,
      },
    };
  }, [slOrders, sY, slFp, slCosts, inPeriod]);

  /* ─── Shopee Data Processing ──────────────────────────────── */
  const spData = useMemo(() => {
    const all = Object.values(spOrders);
    if (!all.length) return null;
    const years = [
      ...new Set(
        all.map((o) => String(o.date).substring(0, 4)).filter(Boolean)
      ),
    ]
      .sort()
      .reverse();
    const months =
      sY !== "All"
        ? [
            ...new Set(
              all
                .filter((o) => String(o.date).startsWith(sY))
                .map((o) => String(o.date).substring(5, 7))
                .filter(Boolean)
            ),
          ].sort()
        : [];
    const targetNet = (parseFloat(spFp.targetNet) || 14) / 100;
    const prods = {};
    let tG = 0,
      tV = 0,
      tF = 0,
      tC = 0,
      tOp = 0,
      tTx = 0,
      validN = 0,
      lossN = 0,
      refundN = 0,
      refundG = 0;
    const filtered = all.filter((o) => inPeriod(o.date));
    const orderList = filtered
      .map((order) => {
        const fin = spOrderFin(order, spFp, spCosts);
        if (fin.isCanc) return null;
        if (fin.isRef) {
          refundN++;
          refundG += fin.gross;
          return null;
        }
        (order.items || []).forEach((item) => {
          const ic =
            Object.prototype.hasOwnProperty.call(item, "snapshotCost") &&
            item.snapshotCost !== null
              ? Number(item.snapshotCost) || 0
              : Number(spCosts[item.key]) || 0;
          if (!prods[item.key])
            prods[item.key] = {
              key: item.key,
              name: item.name,
              option: item.option,
              soldQty: 0,
              estProfit: 0,
              totalRevenue: 0,
              totalCost: 0,
            };
          prods[item.key].soldQty += item.qty || 1;
          const ir = numOrZero(item.activityPrice) * (item.qty || 1);
          prods[item.key].totalRevenue += ir;
          prods[item.key].totalCost += ic * (item.qty || 1);
          prods[item.key].estProfit +=
            ir -
            ic * (item.qty || 1) -
            ir * (fin.opEx / 100) -
            ir * (fin.tx / 100);
        });

        tG += fin.gross;
        tV += fin.voucher;
        tF += fin.fee;
        tC += fin.oCost;
        tOp += fin.opAmt;
        tTx += fin.txAmt;
        validN++;
        if (fin.finalNet < 0) lossN++;
        return {
          ...order,
          localGross: fin.gross,
          totalOrderFee: fin.fee,
          channelFee: fin.fee + fin.voucher,
          orderCost: fin.oCost,
          netIncome: fin.net,
          grossProfit: fin.gp,
          finalNetProfit: fin.finalNet,
          orderOpExpense: fin.opAmt,
          orderTax: fin.txAmt,
        };
      })
      .filter(Boolean);
    /* 分潤為期間層級費用，從最終淨利實扣 */
    const comm = periodExpense(commissions, sY, sM, range);
    const tNetPro = tG - tV - tF - tC - tOp - tTx;
    const afterComm = tNetPro - comm;
    const netMargin = tG > 0 ? afterComm / tG : 0;

    let badge = { label: "虧損", color: "var(--dn)" };
    if (netMargin >= targetNet) {
      badge = { label: "優秀", color: "var(--up)" };
    } else if (netMargin >= targetNet * 0.6) {
      badge = { label: "穩健", color: "var(--orange)" };
    } else if (netMargin > 0) {
      badge = { label: "偏弱", color: "var(--wn)" };
    }
    return {
      years,
      months,
      orderList,
      uniqueProducts: Object.values(prods).sort(
        (a, b) => b.soldQty - a.soldQty
      ),
      s: {
        tG,
        tV,
        tF,
        tC,
        tOp,
        tTx,
        tNetPro,
        comm,
        afterComm,
        netMargin,
        targetNet,
        validN,
        lossN,
        refundN,
        refundG,
        badge,
        avgAOV: validN > 0 ? tG / validN : 0,
        avgNetPer: validN > 0 ? afterComm / validN : 0,
        grossMargin: tG > 0 ? (tG - tF - tV - tC) / tG : 0,
        feeRate: tG > 0 ? tF / tG : 0,
        voucherRate: tG > 0 ? tV / tG : 0,
      },
    };
  }, [spOrders, sY, sM, spFp, spCosts, commissions, range, inPeriod]);

  /* ─── 每月營收/淨利彙總（環比/同比用；已扣分潤） ────────── */
  const slMonthly = useMemo(() => {
    const map = {};
    Object.values(slOrders).forEach((o) => {
      const st = String(o.status || "");
      if (st.includes("取消") || st.includes("刪除")) return;
      const ym = String(o.date || "").substring(0, 7);
      if (ym.length < 7) return;
      if (!map[ym]) map[ym] = { rev: 0, net: 0 };
      map[ym].rev += o.revenue || 0;
      map[ym].net += slOrderFin(o, slFp, slCosts).net;
    });
    return map;
  }, [slOrders, slFp, slCosts]);

  const spMonthly = useMemo(() => {
    const map = {};
    Object.values(spOrders).forEach((o) => {
      const ym = String(o.date || "").substring(0, 7);
      if (ym.length < 7) return;
      const fin = spOrderFin(o, spFp, spCosts);
      if (fin.isCanc || fin.isRef) return;
      if (!map[ym]) map[ym] = { rev: 0, net: 0 };
      map[ym].rev += fin.gross;
      map[ym].net += fin.finalNet;
    });
    /* 有分潤但當月無有效訂單時也要入帳（建立負值月份），與主視圖 afterComm 口徑一致 */
    Object.entries(commissions).forEach(([k, v]) => {
      if (v === "" || v === undefined || !/^\d{4}-\d{2}$/.test(k)) return;
      if (!map[k]) map[k] = { rev: 0, net: 0 };
      map[k].net -= Number(v) || 0;
    });
    return map;
  }, [spOrders, spFp, spCosts, commissions]);

  const allMonthly = useMemo(() => {
    const map = {};
    [slMonthly, spMonthly].forEach((src) =>
      Object.entries(src).forEach(([k, v]) => {
        if (!map[k]) map[k] = { rev: 0, net: 0 };
        map[k].rev += v.rev;
        map[k].net += v.net;
      })
    );
    return map;
  }, [slMonthly, spMonthly]);

  /* ─── Derived state ────────────────────────────────────────── */
  const isOverview = platform === "overview";
  const isSL = platform === "shopline";
  const costs = isSL ? slCosts : spCosts;
  const setCosts = isSL ? setSlCosts : setSpCosts;
  const currentData = isSL ? slData : isOverview ? null : spData;
  const aY = isOverview
    ? [...new Set([...(slData?.years || []), ...(spData?.years || [])])]
        .sort()
        .reverse()
    : (isSL ? slData : spData)?.years || [];
  const aM = isOverview
    ? sY !== "All" && sY !== "Custom"
      ? [
          ...new Set(
            [
              ...Object.values(slOrders)
                .filter((o) => o.date.startsWith(sY))
                .map((o) => o.date.substring(5, 7)),
              ...Object.values(spOrders)
                .filter((o) => String(o.date).startsWith(sY))
                .map((o) => String(o.date).substring(5, 7)),
            ].filter(Boolean)
          ),
        ].sort()
      : []
    : (isSL ? slData : spData)?.months || [];

  useEffect(() => {
    setPage(0);
    setExpandedId(null);
  }, [lossOnly, dSearch, orderSort, sY, sM, platform, range]);

  /* 首次載入資料時自動跳到最新月份（僅一次；手動切換年份會重設月份） */
  const autoJumpedRef = useRef(false);
  useEffect(() => {
    if (autoJumpedRef.current) return;
    const slVals = Object.values(slOrders);
    const spVals = Object.values(spOrders);
    if (!slVals.length && !spVals.length) return;
    const dates = [
      ...slVals.map((o) => o.date),
      ...spVals.map((o) => String(o.date)),
    ]
      .filter(Boolean)
      .sort()
      .reverse();
    if (!dates.length) return;
    autoJumpedRef.current = true;
    setSY(dates[0].substring(0, 4));
    setSM(dates[0].substring(5, 7));
  }, [slOrders, spOrders]);

  const matrixList = useMemo(() => {
    const source = isSL ? slData?.matrixList : spData?.uniqueProducts;
    if (!source) return [];
    const gmOf = (p) =>
      p.totalRevenue > 0
        ? (p.totalRevenue - p.totalCost) / p.totalRevenue
        : -Infinity;
    return source
      .filter(
        (p) =>
          !dMSearch ||
          p.name.toLowerCase().includes(dMSearch.toLowerCase()) ||
          (p.option || "").toLowerCase().includes(dMSearch.toLowerCase())
      )
      .sort((a, b) => {
        const { key, dir } = costSort;
        const m = dir === "desc" ? -1 : 1;
        if (key === "name")
          return m * String(a.name).localeCompare(String(b.name));
        if (key === "soldQty") return m * ((a.soldQty || 0) - (b.soldQty || 0));
        if (key === "profit")
          return (
            m *
            ((a.profitContribution || a.estProfit || 0) -
              (b.profitContribution || b.estProfit || 0))
          );
        if (key === "margin") return m * (gmOf(a) - gmOf(b));
        if (key === "cost")
          return (
            m * ((Number(costs[a.key]) || 0) - (Number(costs[b.key]) || 0))
          );
        return 0;
      });
  }, [isSL, slData, spData, dMSearch, costSort, costs]);

  const missCost = useMemo(() => {
    const miss = matrixList.filter((p) => {
      const v = costs[p.key];
      return v === undefined || v === null || v === "" || Number(v) === 0;
    });
    return {
      total: matrixList.length,
      n: miss.length,
      keys: new Set(miss.map((p) => p.key)),
    };
  }, [matrixList, costs]);

  const filteredOrders = useMemo(() => {
    if (!currentData) return [];
    const list = currentData.orderList;
    return list
      .filter((o) => {
        if (lossOnly && (isSL ? o.net >= 0 : o.finalNetProfit >= 0))
          return false;
        if (dSearch) {
          const t = dSearch.toLowerCase();
          const oid = String(o.orderId).toLowerCase();
          if (
            !oid.includes(t) &&
            !(o.items || []).some((i) =>
              String(i.name || "")
                .toLowerCase()
                .includes(t)
            )
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => {
        const { key, dir } = orderSort;
        const m = dir === "desc" ? -1 : 1;
        const gv = (o) =>
          isSL
            ? {
                date: o.date,
                revenue: o.revenue,
                fee: o.channelFee,
                cost: o.oCost,
                profit: o.currentOrderContribution,
                net: o.net,
              }
            : {
                date: o.date,
                revenue: o.localGross,
                fee: o.channelFee,
                cost: o.orderCost,
                profit: o.grossProfit,
                net: o.finalNetProfit,
              };
        const av = gv(a),
          bv = gv(b);
        if (key === "date")
          return (
            m * `${a.date}${a.orderId}`.localeCompare(`${b.date}${b.orderId}`)
          );
        if (key === "revenue")
          return m * ((av.revenue || 0) - (bv.revenue || 0));
        if (key === "fee") return m * ((av.fee || 0) - (bv.fee || 0));
        if (key === "cost") return m * ((av.cost || 0) - (bv.cost || 0));
        if (key === "profit") return m * ((av.profit || 0) - (bv.profit || 0));
        if (key === "net") return m * ((av.net || 0) - (bv.net || 0));
        return 0;
      });
  }, [currentData, isSL, lossOnly, dSearch, orderSort]);

  /* 分頁夾住：資料變少（如重置本期）時避免停在超出範圍的頁碼 */
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const curPage = Math.min(page, totalPages - 1);
  const pagedOrders = useMemo(
    () => filteredOrders.slice(curPage * pageSize, (curPage + 1) * pageSize),
    [filteredOrders, curPage, pageSize]
  );

  const isLocked = useMemo(() => {
    if (!currentData?.orderList?.length) return false;
    const src = isSL ? slOrders : spOrders;
    return currentData.orderList.every((o) => {
      const t = src[o.orderId];
      return (
        t?.snapshotFeeParams &&
        t?.items?.length &&
        t.items.every((i) =>
          Object.prototype.hasOwnProperty.call(i, "snapshotCost")
        )
      );
    });
  }, [currentData, isSL, slOrders, spOrders]);

  /* 目前檢視期間鎖進快照的費率參數（回答「這個月當時用的是幾 %」）；
     期間內若有多組（各月不同）會分組列出 */
  const snapParams = useMemo(() => {
    if (!currentData?.orderList?.length) return null;
    const src = isSL ? slOrders : spOrders;
    const norm = (v) =>
      v === null || v === undefined || Number.isNaN(Number(v))
        ? null
        : Number(v);
    const sets = new Map();
    currentData.orderList.forEach((o) => {
      const sp = src[o.orderId]?.snapshotFeeParams;
      if (!sp) return;
      const p = {
        opExpense: norm(sp.opExpense),
        tax: norm(sp.tax),
        platformFeeRate: norm(sp.platformFeeRate),
      };
      const key = `${p.opExpense}|${p.tax}|${p.platformFeeRate}`;
      if (!sets.has(key)) sets.set(key, { ...p, count: 0 });
      sets.get(key).count++;
    });
    if (!sets.size) return null;
    const list = [...sets.values()].sort((a, b) => b.count - a.count);
    return { list, mixed: sets.size > 1 };
  }, [currentData, isSL, slOrders, spOrders]);
  const pct = (v) => (v === null ? "—" : `${v}%`);

  const toggleSnap = () => {
    if (!currentData?.orderList?.length) return;
    /* 各月營業費 % 不同：限制單一月份操作，避免跨月訂單被寫入同一組（今天的）參數 */
    if (sY === "All" || sY === "Custom" || sM === "All") {
      toast(
        "請先切換到「單一月份」再鎖定/解除快照——各月營業費 % 不同，跨月操作會把同一組參數寫進所有月份",
        { type: "warning", duration: 8000 }
      );
      return;
    }
    const wasLocked = isLocked;
    const apply = () => {
      const fp = isSL ? slFp : spFp;
      const setter = isSL ? setSlOrders : setSpOrders;
      /* functional update：以「按下確定當下」的最新訂單集為基底，
         避免確認框開啟期間遠端同步進來的訂單被過期閉包覆蓋 */
      setter((src) => {
        const no = { ...src };
        currentData.orderList.forEach((o) => {
          const tg = no[o.orderId];
          if (!tg?.items?.length) return;
          if (wasLocked) {
            const nx = { ...tg };
            nx.items = tg.items.map((i) => {
              const ni = { ...i };
              delete ni.snapshotCost;
              return ni;
            });
            delete nx.snapshotFeeParams;
            no[o.orderId] = nx;
          } else {
            no[o.orderId] = {
              ...tg,
              snapshotFeeParams: {
                platformFeeRate: numOrNull(fp.platformFeeRate),
                opExpense: numOrNull(fp.opExpense),
                tax: numOrNull(fp.tax),
                targetNet: numOrNull(fp.targetNet),
              },
              items: tg.items.map((i) => ({
                ...i,
                snapshotCost:
                  costs[i.key] === undefined ? null : Number(costs[i.key]),
              })),
            };
          }
        });
        return no;
      });
      toast(wasLocked ? "已解除快照" : "已鎖定本期成本快照", {
        type: "success",
      });
    };
    const fp = isSL ? slFp : spFp;
    const curLine = `營業費 ${fp.opExpense}%・稅率 ${fp.tax}%${
      isSL ? `・系統費 ${fp.platformFeeRate}%` : ""
    }`;
    const snapLine =
      snapParams && !snapParams.mixed
        ? `營業費 ${pct(snapParams.list[0].opExpense)}・稅率 ${pct(
            snapParams.list[0].tax
          )}${isSL ? `・系統費 ${pct(snapParams.list[0].platformFeeRate)}` : ""}`
        : snapParams
        ? "各月不同（見側欄明細）"
        : "—";
    setConfirmBox({
      title: wasLocked ? "解除快照" : "鎖定快照",
      message: wasLocked
        ? `原快照參數：${snapLine}\n\n解除後，本期訂單將改回以「目前」側欄參數即時計算（${curLine}）。\n\n若是要修正本期的 %：解除後先到側欄改好參數，再重新鎖定。`
        : `鎖定後，本期訂單將固定採用目前參數：\n${curLine}\n\n之後修改側欄參數不會影響本期（「淨利目標」僅為對照線，不隨快照鎖定）。若本期實際營業費 % 還不確定，可先鎖定，之後「解除 → 改 % → 重新鎖定」修正。`,
      danger: wasLocked,
      onOk: apply,
    });
  };

  const expC = () => {
    const b = new Blob([JSON.stringify(costs, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = `${isSL ? "sl" : "sp"}_costs_${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
  };
  const impC = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
          throw new Error("not-an-object");
        setCosts((p) => ({ ...p, ...parsed }));
        toast("成本資料匯入成功", { type: "success" });
      } catch {
        toast("匯入失敗：請選擇本工具「備份」產生的 JSON 檔", {
          type: "error",
        });
      }
    };
    r.readAsText(f);
    e.target.value = "";
  };

  /* ─── 匯出本期損益報表（CSV，含 BOM 供 Excel 直開） ──────── */
  const expReport = () => {
    if (!currentData) return;
    const slD0 = slData?.summary;
    const spS0 = spData?.s;
    const pl =
      sY === "Custom"
        ? `${range.from || "起"}~${range.to || "迄"}`
        : sY === "All"
        ? "歷年"
        : sM === "All"
        ? `${sY}年`
        : `${sY}-${sM}`;
    const esc = (s) => {
      let v = String(s ?? "");
      /* 公式注入防護：以 =/@/+/- 開頭的非數字內容前綴單引號中和 */
      if (/^[=@+\-]/.test(v) && !/^-?\d+(\.\d+)?$/.test(v)) v = "'" + v;
      return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    };
    const r0 = Math.round;
    const rows = [];
    /* 明細列跟畫面同步套用「虧損篩選／搜尋」；彙總列維持全期間口徑並明確標註 */
    const filterBits = [];
    if (lossOnly) filterBits.push("僅虧損單");
    if (dSearch) filterBits.push(`搜尋「${dSearch}」`);
    const detailNote = filterBits.length
      ? `${filterBits.join("、")}，共 ${filteredOrders.length} 筆（上方彙總仍為全期間）`
      : `全期間共 ${filteredOrders.length} 筆`;
    if (isSL && slD0) {
      rows.push(
        ["平台", "官網"],
        ["期間", pl],
        ["有效訂單", slD0.valid],
        ["營收", r0(slD0.rev)],
        ["商品成本", r0(slD0.cost)],
        ["通路費用（金流+物流+系統）", r0(slD0.pFee + slD0.sCost + slD0.platformFee)],
        ["營業費（含廣告）", r0(slD0.opExpTotal)],
        ["稅賦", r0(slD0.taxTotal)],
        ["最終淨利", r0(slD0.net)],
        ["淨利率", (slD0.trueNetMargin * 100).toFixed(2) + "%"],
        []
      );
      rows.push(["明細範圍", detailNote]);
      rows.push([
        "日期",
        "單號",
        "狀態",
        "營收",
        "通路費用",
        "商品成本",
        "通路後毛利",
        "營業費",
        "稅賦",
        "單筆淨利",
      ]);
      filteredOrders.forEach((o) =>
        rows.push([
          o.date,
          o.orderId,
          o.status,
          r0(o.revenue),
          r0(o.channelFee),
          r0(o.oCost),
          r0(o.currentOrderContribution),
          r0(o.opx),
          r0(o.taxAmt),
          r0(o.net),
        ])
      );
    } else if (spS0) {
      rows.push(
        ["平台", "蝦皮"],
        ["期間", pl],
        ["有效訂單", spS0.validN],
        ["營收（含補貼還原）", r0(spS0.tG)],
        ["商品成本", r0(spS0.tC)],
        ["通路費用（手續費+賣場券）", r0(spS0.tF + spS0.tV)],
        ["營業費（含廣告）", r0(spS0.tOp)],
        ["稅賦", r0(spS0.tTx)],
        ["分潤", r0(spS0.comm)],
        ["最終淨利", r0(spS0.afterComm)],
        ["淨利率", (spS0.netMargin * 100).toFixed(2) + "%"],
        []
      );
      rows.push(["明細範圍", detailNote]);
      rows.push([
        "日期",
        "單號",
        "狀態",
        "營收",
        "通路費用",
        "商品成本",
        "通路後毛利",
        "營業費",
        "稅賦",
        "單筆淨利",
      ]);
      filteredOrders.forEach((o) =>
        rows.push([
          o.date,
          o.orderId,
          o.status,
          r0(o.localGross),
          r0(o.channelFee),
          r0(o.orderCost),
          r0(o.grossProfit),
          r0(o.orderOpExpense),
          r0(o.orderTax),
          r0(o.finalNetProfit),
        ])
      );
    }
    if (!rows.length) return;
    const csv = "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\r\n");
    const b = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = `${isSL ? "官網" : "蝦皮"}損益報表_${pl}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("報表已匯出", { type: "success" });
  };

  const handleComm = useCallback(
    (key, value) => monthlyUpd(setCommissions, key, value),
    []
  );
  const commitCost = useCallback(
    (key, n) => {
      const setter = isSL ? setSlCosts : setSpCosts;
      setter((pr) => ({ ...pr, [key]: n }));
    },
    [isSL]
  );
  const commitFp = useCallback(
    (field, v) => {
      const setter = isSL ? setSlFp : setSpFp;
      setter((p) => ({ ...p, [field]: v }));
    },
    [isSL]
  );

  /* ── 未填成本跳轉 helper ── */
  const jumpToFirstMissCost = () => {
    /* 先清空商品搜尋，避免缺成本項目被篩掉導致跳轉落空（延遲需大於搜尋 debounce） */
    setMSearch("");
    setTimeout(() => {
      if (firstMissRef.current) {
        firstMissRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        firstMissRef.current.style.outline = "2px solid var(--wn)";
        firstMissRef.current.style.outlineOffset = "2px";
        setTimeout(() => {
          if (firstMissRef.current) firstMissRef.current.style.outline = "none";
        }, 2000);
      }
    }, 320);
  };

  const slD = slData?.summary;
  const spS = spData?.s;

  const accentColor = isSL ? "var(--accent)" : "var(--sp-accent)";
  const accentDim = isSL ? "var(--accent-dim)" : "var(--sp-accent-dim)";
  const accentBdr = isSL ? "var(--accent-bdr)" : "var(--sp-accent-bdr)";

  return (
    <div
      data-theme={theme}
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--t1)",
        fontFamily: "'Inter','Noto Sans TC',sans-serif",
        transition: "background .3s,color .3s",
      }}
    >
      <style>{CSS}</style>

      {/* Header */}
      <header
        className="app-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "var(--header-bg)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid var(--s3)",
        }}
      >
        <div
          style={{
            maxWidth: 1560,
            margin: "0 auto",
            padding: "10px 24px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: accentDim,
                border: `1px solid ${accentBdr}`,
                color: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Layers size={18} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                }}
              >
                {isOverview ? "跨平台" : isSL ? "官網" : "蝦皮"} 利潤決策中心
              </h1>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--t3)",
                  fontFamily: mono,
                  letterSpacing: "0.06em",
                }}
              >
                PROFIT INTELLIGENCE · FIREBASE SYNC
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            {/* Platform Toggle */}
            <div
              style={{
                display: "flex",
                border: "1px solid var(--s3)",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {[
                { id: "overview", label: "總覽" },
                { id: "shopline", label: "官網" },
                { id: "shopee", label: "蝦皮" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPlatform(p.id);
                    const src = p.id === "shopline" ? slOrders : spOrders;
                    if (p.id === "shopline" || p.id === "shopee") {
                      const allOrders = Object.values(src);
                      if (allOrders.length) {
                        const ly = allOrders
                          .map((o) => String(o.date).substring(0, 4))
                          .filter(Boolean)
                          .sort()
                          .reverse()[0];
                        const lm =
                          allOrders
                            .filter((o) => String(o.date).startsWith(ly))
                            .map((o) => String(o.date).substring(5, 7))
                            .filter(Boolean)
                            .sort()
                            .reverse()[0] || "All";
                        setSY(ly);
                        setSM(lm);
                      } else {
                        setSY("All");
                        setSM("All");
                      }
                    }
                  }}
                  style={{
                    padding: "6px 14px",
                    fontSize: 11,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    background:
                      platform === p.id
                        ? p.id === "overview"
                          ? "var(--blue)"
                          : accentColor
                        : "var(--s1)",
                    color: platform === p.id ? "#fff" : "var(--t2)",
                    transition: "all .15s",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <SyncDot status={sync} last={lastSyncAt} />
            <button
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              aria-label={
                theme === "dark" ? "切換為淺色主題" : "切換為深色主題"
              }
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid var(--s3)",
                background: "var(--s2)",
                color: "var(--t2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <select
              value={sY}
              onChange={(e) => {
                const v = e.target.value;
                /* 會計年度（公司 4 月起算）：換算成自訂區間 4/1～翌年 3/31 */
                if (v.startsWith("FY")) {
                  const y = Number(v.slice(2));
                  setRange({ from: `${y}-04-01`, to: `${y + 1}-03-31` });
                  setSY("Custom");
                  setSM("All");
                  return;
                }
                setSY(v);
                setSM("All");
              }}
              aria-label="選擇年份"
              style={sel}
            >
              <option value="All">歷年數據</option>
              {aY.map((y) => (
                <option key={y} value={y}>
                  {y} 年
                </option>
              ))}
              {[...new Set(aY.flatMap((y) => [Number(y) - 1, Number(y)]))]
                .sort((a, b) => b - a)
                .map((y) => (
                  <option key={`FY${y}`} value={`FY${y}`}>
                    FY{y}（{y}/4～{y + 1}/3）
                  </option>
                ))}
              <option value="Custom">自訂區間</option>
            </select>
            {sY === "Custom" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="date"
                  value={range.from}
                  aria-label="起始日期"
                  onChange={(e) =>
                    setRange((r) => ({ ...r, from: e.target.value }))
                  }
                  style={{
                    ...sel,
                    fontFamily: mono,
                    fontSize: 11,
                    padding: "5px 8px",
                  }}
                />
                <span style={{ color: "var(--t4)", fontSize: 11 }}>～</span>
                <input
                  type="date"
                  value={range.to}
                  aria-label="結束日期"
                  onChange={(e) =>
                    setRange((r) => ({ ...r, to: e.target.value }))
                  }
                  style={{
                    ...sel,
                    fontFamily: mono,
                    fontSize: 11,
                    padding: "5px 8px",
                  }}
                />
              </div>
            ) : (
              <select
                value={sM}
                onChange={(e) => setSM(e.target.value)}
                aria-label="選擇月份"
                style={sel}
              >
                <option value="All">全月份</option>
                {aM.map((m) => (
                  <option key={m} value={m}>
                    {m} 月
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </header>

      <div
        style={{ maxWidth: 1560, margin: "0 auto", padding: "20px 24px 80px" }}
      >
        <div className={isOverview ? "" : "gm"}>
          {/* Sidebar */}
          <aside
            className="f0"
            style={{ display: isOverview ? "none" : undefined }}
          >
            <div
              className="side-sticky"
              style={{
                background: "var(--s1)",
                border: "1px solid var(--s3)",
                borderRadius: 16,
                padding: 16,
                position: "sticky",
                top: 64,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {/* Upload */}
              <div
                role="button"
                tabIndex={0}
                aria-label={`匯入${isSL ? "官網" : "蝦皮"}報表檔案（點擊或拖曳）`}
                onClick={() => fRef.current._fileInput?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fRef.current._fileInput?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  processFile(e.dataTransfer.files?.[0]);
                }}
                style={{
                  border: `1.5px dashed ${
                    dragOver ? accentColor : "var(--s4)"
                  }`,
                  borderRadius: 12,
                  padding: "18px 12px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: dragOver ? accentDim : "var(--s2)",
                  transition: "border-color .15s, background .15s",
                }}
              >
                <input
                  ref={(el) => {
                    if (fRef.current) fRef.current._fileInput = el;
                  }}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFile}
                  style={{ display: "none" }}
                />
                <FileSpreadsheet size={22} color="var(--t3)" />
                <div
                  style={{
                    marginTop: 6,
                    fontWeight: 700,
                    fontSize: 12,
                    color: "var(--t2)",
                  }}
                >
                  匯入{isSL ? "官網" : "蝦皮"}報表
                </div>
                <div style={{ fontSize: 10, color: "var(--t4)", marginTop: 2 }}>
                  CSV · XLSX · 拖曳
                </div>
              </div>
              {currentData && (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--t3)",
                    fontWeight: 600,
                    padding: "4px 2px",
                  }}
                >
                  {isSL ? slD?.valid : spS?.validN} 筆 ·{" "}
                  {sY === "All" ? "歷年" : sY === "Custom" ? "自訂區間" : sY}
                  {sM !== "All" && sY !== "Custom" ? `/${sM}` : ""}
                </div>
              )}

              {/* Fee Params */}
              <div style={{ borderTop: "1px solid var(--s3)", paddingTop: 12 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--t3)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 10,
                  }}
                >
                  <Settings size={12} /> 財務模型參數
                </div>
                {snapParams && (
                  <div
                    style={{
                      background: "var(--wn-dim)",
                      border: "1px solid var(--wn-bdr)",
                      borderRadius: 8,
                      padding: "8px 10px",
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: "var(--wn)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        marginBottom: 4,
                      }}
                    >
                      <Lock size={10} />
                      {isLocked ? "本期已鎖定快照" : "本期部分訂單帶快照"}
                      {snapParams.mixed ? "（各月參數不同）" : ""}
                    </div>
                    {snapParams.list.map((sp, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: 10,
                          color: "var(--t2)",
                          fontFamily: mono,
                          lineHeight: 1.8,
                        }}
                      >
                        營業費 {pct(sp.opExpense)}・稅 {pct(sp.tax)}
                        {isSL ? `・系統費 ${pct(sp.platformFeeRate)}` : ""}
                        {snapParams.mixed ? `（${sp.count} 筆）` : ""}
                      </div>
                    ))}
                    <div
                      style={{
                        fontSize: 9,
                        color: "var(--t4)",
                        marginTop: 4,
                        lineHeight: 1.6,
                      }}
                    >
                      鎖定的訂單以上述參數計算，下方輸入僅影響未鎖定期間。
                      要修正本期 %：解除快照 → 改參數 → 重新鎖定。
                    </div>
                  </div>
                )}
                {(isSL
                  ? [
                      { l: "淨利目標", n: "targetNet" },
                      { l: "內部營業費", n: "opExpense" },
                      { l: "預估稅率", n: "tax" },
                      { l: "系統服務費率", n: "platformFeeRate" },
                    ]
                  : [
                      { l: "淨利目標", n: "targetNet" },
                      { l: "內部營業費", n: "opExpense" },
                      { l: "預估稅率", n: "tax" },
                    ]
                ).map((item) => (
                  <div
                    key={item.n}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "5px 0",
                      borderBottom: "1px solid var(--s3)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--t2)",
                      }}
                    >
                      {item.l}
                    </span>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <FpInput
                        field={item.n}
                        label={`${item.l}（%）`}
                        value={isSL ? slFp[item.n] : spFp[item.n]}
                        onCommit={commitFp}
                      />
                      <span style={{ fontSize: 11, color: "var(--t4)" }}>
                        %
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Commission Panel (Shopee only) */}
              {!isSL && currentData && (
                <MonthlyExpensePanel
                  title="分潤費用"
                  icon={<Users size={12} color="var(--purple)" />}
                  color="var(--purple)"
                  values={commissions}
                  onUpdate={handleComm}
                  selYear={sY}
                  selMonth={sM}
                  range={range}
                  hint="此期間分潤費用將從最終淨利扣除"
                />
              )}

              {/* Reset */}
              <div style={{ display: "flex", gap: 6 }}>
                <Btn
                  v="primary"
                  onClick={() => {
                    const src = isSL ? slOrders : spOrders;
                    const toDelete = Object.keys(src).filter((k) =>
                      inPeriod(String(src[k].date || ""))
                    );
                    if (!toDelete.length) {
                      toast("本期無訂單可清除", { type: "warning" });
                      return;
                    }
                    const periodLabel =
                      sY === "Custom"
                        ? `${range.from || "起"} ～ ${range.to || "迄"}`
                        : sY === "All"
                        ? "歷年"
                        : sM === "All"
                        ? `${sY} 年`
                        : `${sY}/${sM}`;
                    setConfirmBox({
                      title: "重置本期訂單",
                      message: `將清除「${periodLabel}」的${
                        isSL ? "官網" : "蝦皮"
                      }訂單共 ${
                        toDelete.length
                      } 筆。\n清除後 10 秒內可在右下角通知按「復原」，或重新匯入該期報表。${
                        isLocked
                          ? "\n注意：本期已鎖定快照，清除後快照設定將一併移除。"
                          : ""
                      }`,
                      danger: true,
                      onOk: () => {
                        const removed = {};
                        const setter = isSL ? setSlOrders : setSpOrders;
                        /* functional update：以最新訂單集為基底刪除，避免過期閉包 */
                        setter((cur) => {
                          const updated = { ...cur };
                          toDelete.forEach((k) => {
                            if (updated[k] !== undefined) {
                              removed[k] = updated[k];
                              delete updated[k];
                            }
                          });
                          return updated;
                        });
                        setExpandedId(null);
                        toast(`已清除 ${toDelete.length} 筆訂單`, {
                          type: "info",
                          action: () => setter((p) => ({ ...p, ...removed })),
                          actionLabel: "復原",
                        });
                      },
                    });
                  }}
                  style={{ flex: 1, justifyContent: "center", fontSize: 10 }}
                >
                  <RotateCcw size={11} /> 重置本期
                </Btn>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              /* grid 子元素預設 min-width:auto，寬表格會撐開整頁：
                 歸零後讓內層 overflow 容器接手橫向捲動 */
              minWidth: 0,
            }}
          >
            {isOverview ? (
              <OverviewDashboard
                slData={slData}
                spData={spData}
                slOrders={slOrders}
                spOrders={spOrders}
                slCosts={slCosts}
                spCosts={spCosts}
                allMonthly={allMonthly}
                theme={theme}
                sY={sY}
                sM={sM}
                range={range}
                onNavigate={(id) => {
                  setPlatform(id);
                  if (id === "shopline" && slData?.years?.length) {
                    const ly = slData.years[0];
                    setSY(ly);
                    setSM("All");
                  } else if (id === "shopee" && spData?.years?.length) {
                    const ly = spData.years[0];
                    const ms = [
                      ...new Set(
                        Object.values(spOrders || {})
                          .filter((o) => String(o.date).startsWith(ly))
                          .map((o) => String(o.date).substring(5, 7))
                          .filter(Boolean)
                      ),
                    ]
                      .sort()
                      .reverse();
                    setSY(ly);
                    setSM(ms[0] || "All");
                  } else {
                    setSY("All");
                    setSM("All");
                  }
                }}
              />
            ) : !currentData ? (
              <div
                className="f0"
                style={{
                  minHeight: 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 14,
                  background: "var(--s1)",
                  border: "1px solid var(--s3)",
                  borderRadius: 16,
                }}
              >
                <FileSpreadsheet size={40} color="var(--s4)" />
                <div
                  style={{ fontSize: 15, fontWeight: 700, color: "var(--t3)" }}
                >
                  等待財務數據注入
                </div>
                <div style={{ fontSize: 12, color: "var(--t4)" }}>
                  上傳{isSL ? "官網" : "蝦皮"}訂單報表以啟動分析
                </div>
              </div>
            ) : (
              <>
                {/* ══ SHOPLINE HERO + KPI ══ */}
                {isSL && slD && (
                  <>
                    <div
                      className="f1"
                      style={{
                        background: "var(--s1)",
                        border: "1px solid var(--s3)",
                        borderRadius: 16,
                        padding: "32px 36px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                          alignItems: "center",
                          marginBottom: 16,
                        }}
                      >
                        <Tag v={slD.gapVal >= 0 ? "ok" : "bad"}>
                          <Zap size={10} /> {slD.gapVal >= 0 ? "穩健" : "警告"}
                        </Tag>
                        {slD.returnCount > 0 && (
                          <Tag v={slD.returnRate > 0.05 ? "warn" : "default"}>
                            退貨 {slD.returnCount} 筆 ·{" "}
                            {fmtP(slD.returnRate)}
                          </Tag>
                        )}
                        {missCost.n > 0 && (
                          <Tag
                            v="warn"
                            style={{ cursor: "pointer" }}
                            onClick={jumpToFirstMissCost}
                          >
                            <AlertCircle size={10} /> 未填成本 {missCost.n}/
                            {missCost.total}
                          </Tag>
                        )}
                        <Btn
                          v={isLocked ? "danger" : "default"}
                          onClick={toggleSnap}
                        >
                          <Lock size={11} />{" "}
                          {isLocked ? "解除快照" : "鎖定快照"}
                        </Btn>
                        {isLocked && snapParams && (
                          <Tag v="default">
                            <Lock size={10} />{" "}
                            {snapParams.mixed
                              ? "快照參數各月不同（見側欄）"
                              : `快照 營業費 ${pct(
                                  snapParams.list[0].opExpense
                                )}・稅 ${pct(snapParams.list[0].tax)}`}
                          </Tag>
                        )}
                        <span
                          style={{
                            fontSize: 12,
                            color: slD.gapVal >= 0 ? "var(--t3)" : "var(--wn)",
                            marginLeft: 8,
                          }}
                        >
                          {slD.gapVal >= 0
                            ? `✓ 淨利率 ${fmtP(
                                slD.trueNetMargin
                              )}，超標 ${slD.gapVal.toFixed(1)}%`
                            : `⚠ 淨利率 ${fmtP(
                                slD.trueNetMargin
                              )}，距目標差 ${Math.abs(slD.gapVal).toFixed(1)}%`}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 24,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--t3)",
                              marginBottom: 4,
                              letterSpacing: "0.06em",
                            }}
                          >
                            最終結算淨利 · NET PROFIT
                          </div>
                          <div
                            className="hero-num"
                            style={{
                              lineHeight: 1,
                              fontWeight: 700,
                              letterSpacing: "-0.04em",
                              fontFamily: mono,
                              color: slD.net >= 0 ? "var(--t1)" : "var(--dn)",
                            }}
                          >
                            {fmt$(slD.net)}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--t3)",
                              marginTop: 8,
                            }}
                          >
                            原始營收：{fmt$(slD.rawTotal)} ｜ 取消：
                            {fmt$(slD.cancelledTotal)}
                          </div>
                          <PeriodCompare
                            monthly={slMonthly}
                            sY={sY}
                            sM={sM}
                          />
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--t3)",
                            }}
                          >
                            淨利率
                          </div>
                          <div
                            className="hero-pct"
                            style={{
                              fontWeight: 700,
                              fontFamily: mono,
                              lineHeight: 1,
                              color:
                                slD.gapVal >= 0
                                  ? "var(--up)"
                                  : slD.trueNetMargin >=
                                    slD.targetNetRate - 0.03
                                  ? "var(--wn)"
                                  : "var(--dn)",
                            }}
                          >
                            {fmtP(slD.trueNetMargin)}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--t3)",
                              marginTop: 4,
                            }}
                          >
                            目標 {fmtP(slD.targetNetRate)}　差距{" "}
                            <span
                              style={{
                                color:
                                  slD.gapVal >= 0 ? "var(--up)" : "var(--dn)",
                              }}
                            >
                              {slD.gapVal >= 0 ? "+" : ""}
                              {slD.gapVal.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Waterfall：通路後毛利 − 營業費(含廣告) − 稅賦 = 淨利，逐項可驗算 */}
                      <div
                        style={{
                          marginTop: 28,
                          borderTop: "1px solid var(--s3)",
                          paddingTop: 20,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--t3)",
                            marginBottom: 14,
                            letterSpacing: "0.06em",
                          }}
                        >
                          損益分解 · WATERFALL
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "flex-end",
                            gap: 0,
                          }}
                        >
                          {[
                            {
                              l: "通路後毛利",
                              v: slD.contributionMargin,
                              c: "var(--t1)",
                            },
                            { l: "營業費", v: -slD.opExpTotal, c: "var(--dn)" },
                            { l: "稅賦", v: -slD.taxTotal, c: "var(--dn)" },
                            {
                              l: "淨利",
                              v: slD.net,
                              c: "var(--accent)",
                              bold: true,
                            },
                          ].map((item, i, arr) => (
                            <React.Fragment key={i}>
                              <div
                                style={{
                                  flex: "1 1 0",
                                  minWidth: 90,
                                  textAlign: "center",
                                  padding: "0 8px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "var(--t3)",
                                    fontWeight: 600,
                                    marginBottom: 4,
                                  }}
                                >
                                  {item.l}
                                </div>
                                <div
                                  style={{
                                    fontSize: 20,
                                    fontWeight: item.bold ? 800 : 600,
                                    fontFamily: mono,
                                    color: item.c,
                                    letterSpacing: "-0.02em",
                                  }}
                                >
                                  {fmt$(item.v)}
                                </div>
                              </div>
                              {i < arr.length - 1 && (
                                <div
                                  style={{
                                    color: "var(--s4)",
                                    fontSize: 18,
                                    padding: "0 2px",
                                    alignSelf: "center",
                                  }}
                                >
                                  ›
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* KPI 上排 4 */}
                    <div className="g4 f2">
                      {[
                        {
                          l: "精準營收基底",
                          v: fmt$(slD.rev),
                          c: "var(--t1)",
                          h: `原始 ${fmt$(slD.rawTotal)} ｜ 取消 ${fmt$(
                            slD.cancelledTotal
                          )}`,
                        },
                        {
                          l: "預估總入帳",
                          v: fmt$(slD.inbound),
                          c: "var(--blue)",
                          h: "扣除金流+物流+平台費",
                        },
                        {
                          l: "商品毛利率",
                          v: fmtP(slD.grossMargin),
                          c:
                            slD.grossMargin >= 0.62
                              ? "var(--up)"
                              : slD.grossMargin >= 0.58
                              ? "var(--accent)"
                              : "var(--dn)",
                          h:
                            slD.grossMargin >= 0.62
                              ? "✓ 超越目標 62%，表現優異"
                              : slD.grossMargin >= 0.6
                              ? "✓ 達標，目標 60%"
                              : slD.grossMargin >= 0.58
                              ? "⚠ 正常帶下緣，目標 60%"
                              : "⚠ 低於警戒線 58%，檢視成本與定價",
                        },
                        {
                          l: "通路後毛利率",
                          v: fmtP(
                            slD.rev > 0 ? slD.contributionMargin / slD.rev : 0
                          ),
                          c: (() => {
                            const r =
                              slD.rev > 0
                                ? slD.contributionMargin / slD.rev
                                : 0;
                            return r >= 0.565
                              ? "var(--up)"
                              : r >= 0.53
                              ? "var(--accent)"
                              : "var(--dn)";
                          })(),
                          h: (() => {
                            const r =
                              slD.rev > 0
                                ? slD.contributionMargin / slD.rev
                                : 0;
                            return r >= 0.565
                              ? "✓ 超越目標 56.5%，成本控管優秀"
                              : r >= 0.55
                              ? "✓ 達標，目標 55%"
                              : r >= 0.53
                              ? "⚠ 正常帶下緣，目標 55%"
                              : "⚠ 低於警戒線 53%，檢視通路費與折扣";
                          })(),
                        },
                      ].map((k, i) => (
                        <div
                          key={i}
                          style={{
                            background: "var(--s1)",
                            border: "1px solid var(--s3)",
                            borderRadius: 14,
                            padding: "22px 24px",
                          }}
                        >
                          <Lbl>{k.l}</Lbl>
                          <div
                            style={{
                              fontSize: 30,
                              fontWeight: 700,
                              fontFamily: mono,
                              letterSpacing: "-0.03em",
                              color: k.c,
                              marginTop: 6,
                            }}
                          >
                            {k.v}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--t4)",
                              marginTop: 8,
                            }}
                          >
                            {k.h}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* KPI 下排 4 */}
                    <div className="g4 f3">
                      {[
                        {
                          l: "單筆平均淨利",
                          v: fmt$(slD.net / (slD.valid || 1)),
                          c: slD.net >= 0 ? "var(--up)" : "var(--dn)",
                          ic: <PieChart size={13} />,
                          h: "平均每筆訂單實際貢獻盈餘",
                        },
                        {
                          l: "通路總成本佔比",
                          v: fmtP(slD.realCommissionRate),
                          c: "var(--blue)",
                          ic: <CreditCard size={13} />,
                          h: "金流＋物流＋系統費",
                        },
                        {
                          l: "營收折讓率",
                          v: fmtP(slD.voucherRate),
                          ic: <Wallet size={13} />,
                          c:
                            slD.voucherRate > 0.065
                              ? "var(--dn)"
                              : slD.voucherRate > 0.055
                              ? "var(--wn)"
                              : slD.voucherRate <= 0.045
                              ? "var(--up)"
                              : "var(--purple)",
                          h:
                            slD.voucherRate > 0.065
                              ? "⚠ 品牌警戒！單月 >6.5%，立即介入"
                              : slD.voucherRate > 0.055
                              ? "⚠ 超出警戒線 5.5%，啟動檢討"
                              : slD.voucherRate <= 0.045
                              ? "✓ 在目標範圍 4~4.5% 內"
                              : "注意：接近警戒線 5.5%",
                        },
                        {
                          l: "贈品成本佔比",
                          v: fmtP(slD.giftCostRate || 0),
                          ic: <Gift size={13} />,
                          c:
                            (slD.giftCostRate || 0) > 0.045
                              ? "var(--dn)"
                              : (slD.giftCostRate || 0) > 0.035
                              ? "var(--wn)"
                              : (slD.giftCostRate || 0) >= 0.018
                              ? "var(--up)"
                              : "var(--t3)",
                          h:
                            (slD.giftCostRate || 0) > 0.045
                              ? `⚠ 超上限 4.5%！成本 ${fmt$(slD.giftCost)}`
                              : (slD.giftCostRate || 0) > 0.035
                              ? `⚠ 超警戒 3.5%，共 ${slD.giftQty} 件`
                              : (slD.giftCostRate || 0) >= 0.018
                              ? `✓ 目標範圍內，共 ${slD.giftQty} 件`
                              : `低於正常值，共 ${slD.giftQty} 件`,
                        },
                      ].map((k, i) => (
                        <div
                          key={i}
                          style={{
                            background: "var(--s1)",
                            border: "1px solid var(--s3)",
                            borderRadius: 14,
                            padding: "20px 22px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--t3)",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginBottom: 8,
                            }}
                          >
                            {k.ic} {k.l}
                          </div>
                          <div
                            style={{
                              fontSize: 26,
                              fontWeight: 700,
                              fontFamily: mono,
                              letterSpacing: "-0.03em",
                              color: k.c,
                            }}
                          >
                            {k.v}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--t4)",
                              marginTop: 8,
                            }}
                          >
                            {k.h}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* KPI 第三排：客單價與每月加價購檔期成效 */}
                    <div className="g3 f3">
                      {[
                        {
                          l: "平均客單價 AOV",
                          v: fmt$(slD.rev / (slD.valid || 1)),
                          c: "var(--t1)",
                          h: "營收 ÷ 有效訂單（含運費收入）",
                        },
                        {
                          l: "加購品營收",
                          v: fmt$(slD.addOnRev),
                          c: slD.addOnRev > 0 ? "var(--purple)" : "var(--t3)",
                          h: `${slD.addOnQty} 件・佔營收 ${fmtP(
                            slD.rev > 0 ? slD.addOnRev / slD.rev : 0
                          )}`,
                        },
                        {
                          l: "加購滲透率",
                          v: fmtP(
                            slD.valid > 0 ? slD.addOnOrders / slD.valid : 0
                          ),
                          c: "var(--blue)",
                          h: `有加購的訂單 ${slD.addOnOrders}/${slD.valid} 筆・每月加價購檔期成效`,
                        },
                      ].map((k, i) => (
                        <div
                          key={i}
                          style={{
                            background: "var(--s1)",
                            border: "1px solid var(--s3)",
                            borderRadius: 14,
                            padding: "20px 22px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--t3)",
                              marginBottom: 8,
                            }}
                          >
                            {k.l}
                          </div>
                          <div
                            style={{
                              fontSize: 26,
                              fontWeight: 700,
                              fontFamily: mono,
                              letterSpacing: "-0.03em",
                              color: k.c,
                            }}
                          >
                            {k.v}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--t4)",
                              marginTop: 8,
                            }}
                          >
                            {k.h}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ══ SHOPEE HERO + KPI ══ */}
                {!isSL && spS && (
                  <>
                    <div
                      className="f1"
                      style={{
                        background: "var(--s1)",
                        border: "1px solid var(--s3)",
                        borderRadius: 16,
                        padding: "32px 36px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                          alignItems: "center",
                          marginBottom: 16,
                        }}
                      >
                        <Tag
                          v={
                            spS.netMargin >= spS.targetNet
                              ? "ok"
                              : spS.netMargin > 0
                              ? "warn"
                              : "bad"
                          }
                        >
                          {spS.badge.label}
                        </Tag>
                        {missCost.n > 0 && (
                          <Tag
                            v="warn"
                            style={{ cursor: "pointer" }}
                            onClick={jumpToFirstMissCost}
                          >
                            <AlertCircle size={10} /> 未填成本 {missCost.n}/
                            {missCost.total}
                          </Tag>
                        )}
                        <Btn
                          v={isLocked ? "danger" : "default"}
                          onClick={toggleSnap}
                        >
                          <Lock size={11} />{" "}
                          {isLocked ? "解除快照" : "鎖定快照"}
                        </Btn>
                        {isLocked && snapParams && (
                          <Tag v="default">
                            <Lock size={10} />{" "}
                            {snapParams.mixed
                              ? "快照參數各月不同（見側欄）"
                              : `快照 營業費 ${pct(
                                  snapParams.list[0].opExpense
                                )}・稅 ${pct(snapParams.list[0].tax)}`}
                          </Tag>
                        )}
                        {spS.comm > 0 && (
                          <Tag v="warn">
                            <Users size={10} /> 已扣分潤 {fmt$(spS.comm)}
                          </Tag>
                        )}
                        {spS.refundN > 0 && (
                          <Tag v="default">
                            退貨/退款 {spS.refundN} 筆 · {fmt$(spS.refundG)}{" "}
                            未計入
                          </Tag>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 24,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--t3)",
                              marginBottom: 4,
                              letterSpacing: "0.06em",
                            }}
                          >
                            最終結算淨利 · NET PROFIT
                          </div>
                          <div
                            className="hero-num"
                            style={{
                              lineHeight: 1,
                              fontWeight: 700,
                              letterSpacing: "-0.04em",
                              fontFamily: mono,
                              color:
                                spS.afterComm >= 0 ? "var(--t1)" : "var(--dn)",
                            }}
                          >
                            {fmt$(spS.afterComm)}
                          </div>
                          {spS.comm > 0 && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "var(--t3)",
                                marginTop: 6,
                              }}
                            >
                              分潤前：{fmt$(spS.tNetPro)}
                            </div>
                          )}
                          <PeriodCompare
                            monthly={spMonthly}
                            sY={sY}
                            sM={sM}
                          />
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--t3)",
                            }}
                          >
                            淨利率
                          </div>
                          <div
                            className="hero-pct"
                            style={{
                              fontWeight: 700,
                              fontFamily: mono,
                              lineHeight: 1,
                              color:
                                spS.netMargin >= spS.targetNet
                                  ? "var(--up)"
                                  : spS.netMargin >= spS.targetNet * 0.6
                                  ? "var(--orange)"
                                  : spS.netMargin > 0
                                  ? "var(--wn)"
                                  : "var(--dn)",
                            }}
                          >
                            {fmtP(spS.netMargin)}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--t3)",
                              marginTop: 4,
                            }}
                          >
                            目標 {fmtP(spS.targetNet)}
                          </div>
                        </div>
                      </div>
                      {/* Waterfall：通路後毛利 − 營業費(含廣告) − 稅賦 −（分潤）= 淨利，逐項可驗算 */}
                      <div
                        style={{
                          marginTop: 28,
                          borderTop: "1px solid var(--s3)",
                          paddingTop: 20,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--t3)",
                            marginBottom: 14,
                            letterSpacing: "0.06em",
                          }}
                        >
                          損益分解 · WATERFALL
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "flex-end",
                            gap: 0,
                          }}
                        >
                          {[
                            {
                              l: "通路後毛利",
                              v: spS.tG - spS.tV - spS.tF - spS.tC,
                            },
                            { l: "營業費", v: -spS.tOp, neg: true },
                            { l: "稅賦", v: -spS.tTx, neg: true },
                            ...(spS.comm > 0
                              ? [{ l: "分潤", v: -spS.comm, neg: true }]
                              : []),
                            { l: "淨利", v: spS.afterComm, bold: true },
                          ].map((item, i, arr) => (
                            <React.Fragment key={i}>
                              <div
                                style={{
                                  flex: "1 1 0",
                                  minWidth: 80,
                                  textAlign: "center",
                                  padding: "0 6px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "var(--t3)",
                                    fontWeight: 600,
                                    marginBottom: 4,
                                  }}
                                >
                                  {item.l}
                                </div>
                                <div
                                  style={{
                                    fontSize: 18,
                                    fontWeight: item.bold ? 800 : 600,
                                    fontFamily: mono,
                                    letterSpacing: "-0.02em",
                                    color: item.bold
                                      ? spS.afterComm >= 0
                                        ? "var(--up)"
                                        : "var(--dn)"
                                      : item.neg
                                      ? "var(--dn)"
                                      : "var(--t1)",
                                  }}
                                >
                                  {fmt$(item.v)}
                                </div>
                              </div>
                              {i < arr.length - 1 && (
                                <div
                                  style={{
                                    color: "var(--s4)",
                                    fontSize: 16,
                                    padding: "0 2px",
                                    alignSelf: "center",
                                  }}
                                >
                                  ›
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* KPI 上排 4 */}
                    <div className="g4 f2">
                      {[
                        {
                          l: "精準營收基底",
                          v: fmt$(spS.tG),
                          c: "var(--t1)",
                          h: `賣場券 -${fmt$(spS.tV)} ｜ 手續費 -${fmt$(
                            spS.tF
                          )}`,
                        },
                        {
                          l: "預估總入帳",
                          v: fmt$(spS.tG - spS.tV - spS.tF),
                          c: "var(--blue)",
                          h: "扣除賣場券與手續費",
                        },
                        {
                          l: "商品毛利",
                          v: fmt$(spS.tG - spS.tC),
                          c: "var(--up)",
                          h: `毛利率 ${fmtP(
                            spS.tG > 0 ? (spS.tG - spS.tC) / spS.tG : 0
                          )}`,
                        },
                        {
                          l: "結算現金",
                          v: fmt$(spS.afterComm),
                          c:
                            spS.afterComm >= 0
                              ? "var(--sp-accent)"
                              : "var(--dn)",
                          h:
                            spS.comm > 0
                              ? `-${fmt$(spS.comm)} 分潤`
                              : `淨利率 ${fmtP(spS.netMargin)}`,
                          hc: spS.comm > 0 ? "var(--purple)" : "var(--t4)",
                          border: "var(--sp-accent)",
                        },
                      ].map((k, i) => (
                        <div
                          key={i}
                          style={{
                            background: "var(--s1)",
                            border: `1px solid ${k.border || "var(--s3)"}`,
                            borderRadius: 14,
                            padding: "22px 24px",
                            borderLeft: k.border
                              ? `3px solid ${k.border}`
                              : undefined,
                          }}
                        >
                          <Lbl>{k.l}</Lbl>
                          <div
                            style={{
                              fontSize: 30,
                              fontWeight: 700,
                              fontFamily: mono,
                              letterSpacing: "-0.03em",
                              color: k.c,
                              marginTop: 6,
                            }}
                          >
                            {k.v}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: k.hc || "var(--t4)",
                              marginTop: 8,
                            }}
                          >
                            {k.h}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* KPI 下排 4 */}
                    <div className="g4 f3">
                      {[
                        {
                          l: "商品毛利率",
                          v: fmtP(spS.tG > 0 ? (spS.tG - spS.tC) / spS.tG : 0),
                          c: (() => {
                            const r =
                              spS.tG > 0 ? (spS.tG - spS.tC) / spS.tG : 0;
                            return r >= 0.68
                              ? "var(--up)"
                              : r >= 0.63
                              ? "var(--accent)"
                              : "var(--dn)";
                          })(),
                          note: (() => {
                            const r =
                              spS.tG > 0 ? (spS.tG - spS.tC) / spS.tG : 0;
                            return r >= 0.68
                              ? "✓ 超越目標 68%，表現優異"
                              : r >= 0.65
                              ? "✓ 達標，目標 65~67%"
                              : r >= 0.63
                              ? "⚠ 正常帶下緣，目標 65~67%"
                              : "⚠ 低於警戒線 63%，檢視定價";
                          })(),
                        },
                        {
                          l: "真實抽成率",
                          v: fmtP(spS.feeRate),
                          c: "var(--blue)",
                          note: "蝦皮固定抽成費率",
                        },
                        {
                          l: "優惠券發放率",
                          v: fmtP(spS.voucherRate),
                          c:
                            spS.voucherRate > 0.03
                              ? "var(--dn)"
                              : spS.voucherRate > 0.025
                              ? "var(--wn)"
                              : spS.voucherRate <= 0.015
                              ? "var(--up)"
                              : "var(--purple)",
                          note:
                            spS.voucherRate > 0.03
                              ? "⚠ 品牌警戒！單月 >3%，立即介入"
                              : spS.voucherRate > 0.025
                              ? "⚠ 超出警戒線 2.5%，啟動檢討"
                              : spS.voucherRate <= 0.015
                              ? "✓ 在目標範圍 0.8~1.5% 內"
                              : "注意：接近警戒線 2.5%",
                        },
                        {
                          l: "通路後毛利率",
                          v: fmtP(spS.grossMargin),
                          c:
                            spS.grossMargin >= 0.49
                              ? "var(--up)"
                              : spS.grossMargin >= 0.44
                              ? "var(--accent)"
                              : "var(--dn)",
                          note:
                            spS.grossMargin >= 0.49
                              ? "✓ 超越目標 49%，費用控管優秀"
                              : spS.grossMargin >= 0.46
                              ? "✓ 達標，目標 46~48%"
                              : spS.grossMargin >= 0.44
                              ? "⚠ 正常帶下緣，目標 46~48%"
                              : "⚠ 低於警戒線 44%，檢視平台費用",
                        },
                      ].map((k, i) => (
                        <div
                          key={i}
                          style={{
                            background: "var(--s1)",
                            border: "1px solid var(--s3)",
                            borderRadius: 14,
                            padding: "20px 22px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--t3)",
                              marginBottom: 8,
                            }}
                          >
                            {k.l}
                          </div>
                          <div
                            style={{
                              fontSize: 26,
                              fontWeight: 700,
                              fontFamily: mono,
                              letterSpacing: "-0.03em",
                              color: k.c,
                            }}
                          >
                            {k.v}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--t4)",
                              marginTop: 8,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: k.c,
                                flexShrink: 0,
                              }}
                            />
                            {k.note}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* KPI 第三排：券策略錨點與單筆貢獻 */}
                    <div className="g3 f3">
                      {[
                        {
                          l: "平均客單價 AOV",
                          v: fmt$(spS.avgAOV),
                          c: "var(--t1)",
                          h: "優惠券門檻設計的錨點指標（含補貼還原）",
                        },
                        {
                          l: "單筆平均淨利",
                          v: fmt$(spS.avgNetPer),
                          c: spS.avgNetPer >= 0 ? "var(--up)" : "var(--dn)",
                          h: "已扣分潤後平均每單實際貢獻",
                        },
                        {
                          l: "退貨/退款排除",
                          v: `${spS.refundN} 筆`,
                          c: spS.refundN > 0 ? "var(--wn)" : "var(--t3)",
                          h: `${fmt$(spS.refundG)} 未計入營收`,
                        },
                      ].map((k, i) => (
                        <div
                          key={i}
                          style={{
                            background: "var(--s1)",
                            border: "1px solid var(--s3)",
                            borderRadius: 14,
                            padding: "20px 22px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--t3)",
                              marginBottom: 8,
                            }}
                          >
                            {k.l}
                          </div>
                          <div
                            style={{
                              fontSize: 26,
                              fontWeight: 700,
                              fontFamily: mono,
                              letterSpacing: "-0.03em",
                              color: k.c,
                            }}
                          >
                            {k.v}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--t4)",
                              marginTop: 8,
                            }}
                          >
                            {k.h}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ── Cost Matrix ── */}
                <div
                  className="f4"
                  style={{
                    background: "var(--s1)",
                    border: "1px solid var(--s3)",
                    borderRadius: 16,
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Package size={16} color="var(--t3)" />
                      <span style={{ fontSize: 14, fontWeight: 700 }}>
                        商品成本資料庫
                      </span>
                      <span style={{ fontSize: 11, color: "var(--t3)" }}>
                        共 {missCost.total} 項
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", gap: 6, alignItems: "center" }}
                    >
                      <Btn onClick={expC}>
                        <Download size={12} /> 備份
                      </Btn>
                      <Btn v="primary" onClick={() => cRef.current?.click()}>
                        <UploadCloud size={12} /> 還原
                      </Btn>
                      <input
                        ref={cRef}
                        type="file"
                        accept=".json"
                        onChange={impC}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>
                  <div style={{ position: "relative", marginBottom: 14 }}>
                    <Search
                      size={14}
                      color="var(--t4)"
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="搜尋商品名稱或規格 ..."
                      aria-label="搜尋商品名稱或規格"
                      value={mSearch}
                      onChange={(e) => setMSearch(e.target.value)}
                      style={{
                        ...inp,
                        width: "100%",
                        maxWidth: 360,
                        textAlign: "left",
                        paddingLeft: 36,
                        borderRadius: 10,
                        padding: "10px 12px 10px 36px",
                        fontSize: 13,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      overflowX: "auto",
                      overflowY: "auto",
                      maxHeight: 480,
                      border: "1px solid var(--s3)",
                      borderRadius: 12,
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: 760,
                      }}
                    >
                      <thead>
                        <tr>
                          <SortTh
                            sortKey="name"
                            currentSort={costSort}
                            onSort={(k) =>
                              setCostSort((p) => ({
                                key: k,
                                dir:
                                  p.key === k
                                    ? p.dir === "desc"
                                      ? "asc"
                                      : "desc"
                                    : "desc",
                              }))
                            }
                          >
                            商品名稱
                          </SortTh>
                          <th scope="col" style={{ ...th, textAlign: "left" }}>
                            規格
                          </th>
                          <SortTh
                            sortKey="soldQty"
                            currentSort={costSort}
                            onSort={(k) =>
                              setCostSort((p) => ({
                                key: k,
                                dir:
                                  p.key === k
                                    ? p.dir === "desc"
                                      ? "asc"
                                      : "desc"
                                    : "desc",
                              }))
                            }
                            align="right"
                          >
                            銷量
                          </SortTh>
                          <SortTh
                            sortKey="profit"
                            currentSort={costSort}
                            onSort={(k) =>
                              setCostSort((p) => ({
                                key: k,
                                dir:
                                  p.key === k
                                    ? p.dir === "desc"
                                      ? "asc"
                                      : "desc"
                                    : "desc",
                              }))
                            }
                            align="right"
                          >
                            淨利貢獻
                          </SortTh>
                          <SortTh
                            sortKey="margin"
                            currentSort={costSort}
                            onSort={(k) =>
                              setCostSort((p) => ({
                                key: k,
                                dir:
                                  p.key === k
                                    ? p.dir === "desc"
                                      ? "asc"
                                      : "desc"
                                    : "desc",
                              }))
                            }
                            align="right"
                          >
                            毛利率
                          </SortTh>
                          <SortTh
                            sortKey="cost"
                            currentSort={costSort}
                            onSort={(k) =>
                              setCostSort((p) => ({
                                key: k,
                                dir:
                                  p.key === k
                                    ? p.dir === "desc"
                                      ? "asc"
                                      : "desc"
                                    : "desc",
                              }))
                            }
                            align="right"
                          >
                            單位成本
                          </SortTh>
                          <th
                            scope="col"
                            style={{ ...th, textAlign: "center", width: 40 }}
                          ></th>
                        </tr>
                      </thead>
                      <tbody>
                        {!matrixList.length ? (
                          <tr>
                            <td
                              colSpan={7}
                              style={{
                                ...td2,
                                textAlign: "center",
                                color: "var(--t4)",
                                padding: 40,
                              }}
                            >
                              尚無商品數據
                            </td>
                          </tr>
                        ) : (
                          (() => {
                            let missFound = false;
                            return matrixList.map((p) => {
                              const miss = missCost.keys.has(p.key),
                                hs = p.soldQty > 0;
                              const isFirstMiss = miss && !missFound;
                              if (isFirstMiss) missFound = true;
                              const profitVal =
                                p.profitContribution ?? p.estProfit ?? 0;
                              const gmVal =
                                p.totalRevenue > 0
                                  ? (p.totalRevenue - p.totalCost) /
                                    p.totalRevenue
                                  : null;
                              return (
                                <tr
                                  key={p.key}
                                  ref={isFirstMiss ? firstMissRef : undefined}
                                  className={miss && hs ? "rw" : ""}
                                >
                                  <td
                                    style={{
                                      ...td2,
                                      fontWeight: 600,
                                      maxWidth: 260,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                    title={p.name}
                                  >
                                    {p.name}
                                  </td>
                                  <td
                                    style={{
                                      ...td2,
                                      color: "var(--t3)",
                                      fontSize: 12,
                                    }}
                                  >
                                    {p.option}
                                  </td>
                                  <td
                                    style={{
                                      ...td2,
                                      textAlign: "right",
                                      fontWeight: 700,
                                      fontFamily: mono,
                                    }}
                                  >
                                    {p.soldQty}
                                  </td>
                                  <td
                                    style={{
                                      ...td2,
                                      textAlign: "right",
                                      fontWeight: 700,
                                      fontFamily: mono,
                                      color:
                                        profitVal >= 0
                                          ? "var(--up)"
                                          : "var(--dn)",
                                    }}
                                  >
                                    {fmt$(profitVal)}
                                  </td>
                                  <td
                                    style={{
                                      ...td2,
                                      textAlign: "right",
                                      fontWeight: 600,
                                      fontFamily: mono,
                                      color:
                                        gmVal === null
                                          ? "var(--t4)"
                                          : gmVal < 0
                                          ? "var(--dn)"
                                          : gmVal < 0.35
                                          ? "var(--wn)"
                                          : "var(--t1)",
                                    }}
                                  >
                                    {gmVal === null
                                      ? "—"
                                      : `${(gmVal * 100).toFixed(1)}%`}
                                  </td>
                                  <td style={{ ...td2, textAlign: "right" }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-end",
                                        gap: 4,
                                      }}
                                    >
                                      {miss && hs && (
                                        <span
                                          style={{
                                            fontSize: 10,
                                            color: "var(--wn)",
                                            fontWeight: 700,
                                          }}
                                        >
                                          —
                                        </span>
                                      )}
                                      <CostInput
                                        costKey={p.key}
                                        label={`${p.name} ${
                                          p.option || ""
                                        } 單位成本`}
                                        value={costs[p.key]}
                                        miss={miss}
                                        onCommit={commitCost}
                                      />
                                    </div>
                                  </td>
                                  <td style={{ ...td2, textAlign: "center" }}>
                                    <Btn
                                      v="ghost"
                                      aria-label={`刪除 ${p.name} 的成本設定`}
                                      onClick={() =>
                                        setConfirmBox({
                                          title: "刪除成本設定",
                                          message: `確定刪除「${p.name}${
                                            p.option &&
                                            p.option !== "標準規格"
                                              ? `（${p.option}）`
                                              : ""
                                          }」的單位成本？`,
                                          danger: true,
                                          onOk: () => {
                                            const n = { ...costs };
                                            delete n[p.key];
                                            setCosts(n);
                                          },
                                        })
                                      }
                                      style={{ padding: "2px" }}
                                    >
                                      <Trash2 size={12} color="var(--t4)" />
                                    </Btn>
                                  </td>
                                </tr>
                              );
                            });
                          })()
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── Order Table ── */}
                <div
                  className="f5"
                  style={{
                    background: "var(--s1)",
                    border: "1px solid var(--s3)",
                    borderRadius: 16,
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <BarChart3 size={16} color="var(--t3)" />
                      <span style={{ fontSize: 14, fontWeight: 700 }}>
                        單筆訂單決策明細
                      </span>
                      <span style={{ fontSize: 11, color: "var(--dn)" }}>
                        虧損 {isSL ? slData?.lossCount : spS?.lossN} 筆
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <Btn onClick={expReport}>
                        <Download size={12} /> 匯出報表
                      </Btn>
                      <div style={{ position: "relative" }}>
                        <Search
                          size={13}
                          color="var(--t4)"
                          style={{
                            position: "absolute",
                            left: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                          }}
                        />
                        <input
                          type="text"
                          placeholder="搜尋單號或商品..."
                          aria-label="搜尋單號或商品"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          style={{
                            ...inp,
                            width: 180,
                            textAlign: "left",
                            paddingLeft: 30,
                            borderRadius: 10,
                            padding: "7px 12px 7px 30px",
                            fontSize: 12,
                          }}
                        />
                      </div>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--t3)",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={lossOnly}
                          onChange={(e) => setLossOnly(e.target.checked)}
                          style={{ accentColor: "var(--dn)" }}
                        />{" "}
                        只看虧損（本期）
                      </label>
                    </div>
                  </div>
                  <div
                    style={{
                      overflowX: "auto",
                      overflowY: "auto",
                      maxHeight: 500,
                      border: "1px solid var(--s3)",
                      borderRadius: 12,
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: 820,
                      }}
                    >
                      <thead>
                        <tr>
                          <SortTh
                            sortKey="date"
                            currentSort={orderSort}
                            onSort={(k) =>
                              setOrderSort((p) => ({
                                key: k,
                                dir:
                                  p.key === k
                                    ? p.dir === "desc"
                                      ? "asc"
                                      : "desc"
                                    : "desc",
                              }))
                            }
                          >
                            單號
                          </SortTh>
                          {!isSL && (
                            <th
                              scope="col"
                              style={{ ...th, textAlign: "left" }}
                            >
                              商品
                            </th>
                          )}
                          <SortTh
                            sortKey="revenue"
                            currentSort={orderSort}
                            onSort={(k) =>
                              setOrderSort((p) => ({
                                key: k,
                                dir:
                                  p.key === k
                                    ? p.dir === "desc"
                                      ? "asc"
                                      : "desc"
                                    : "desc",
                              }))
                            }
                            align="right"
                          >
                            營收
                          </SortTh>
                          <SortTh
                            sortKey="fee"
                            currentSort={orderSort}
                            onSort={(k) =>
                              setOrderSort((p) => ({
                                key: k,
                                dir:
                                  p.key === k
                                    ? p.dir === "desc"
                                      ? "asc"
                                      : "desc"
                                    : "desc",
                              }))
                            }
                            align="right"
                          >
                            通路費用
                          </SortTh>
                          <SortTh
                            sortKey="cost"
                            currentSort={orderSort}
                            onSort={(k) =>
                              setOrderSort((p) => ({
                                key: k,
                                dir:
                                  p.key === k
                                    ? p.dir === "desc"
                                      ? "asc"
                                      : "desc"
                                    : "desc",
                              }))
                            }
                            align="right"
                          >
                            成本
                          </SortTh>
                          <SortTh
                            sortKey="profit"
                            currentSort={orderSort}
                            onSort={(k) =>
                              setOrderSort((p) => ({
                                key: k,
                                dir:
                                  p.key === k
                                    ? p.dir === "desc"
                                      ? "asc"
                                      : "desc"
                                    : "desc",
                              }))
                            }
                            align="right"
                          >
                            毛利
                          </SortTh>
                          <SortTh
                            sortKey="net"
                            currentSort={orderSort}
                            onSort={(k) =>
                              setOrderSort((p) => ({
                                key: k,
                                dir:
                                  p.key === k
                                    ? p.dir === "desc"
                                      ? "asc"
                                      : "desc"
                                    : "desc",
                              }))
                            }
                            align="right"
                          >
                            最終淨利
                          </SortTh>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedOrders.length > 0 ? (
                          pagedOrders.map((o) => {
                            const isLoss = isSL
                              ? o.net < 0
                              : o.finalNetProfit < 0;
                            const rev = isSL ? o.revenue : o.localGross;
                            const fee = o.channelFee;
                            const cost = isSL ? o.oCost : o.orderCost;
                            const gross = isSL
                              ? o.currentOrderContribution
                              : o.grossProfit;
                            const net = isSL ? o.net : o.finalNetProfit;
                            const isOpen = expandedId === o.orderId;
                            return (
                              <React.Fragment key={o.orderId}>
                              <tr
                                className={isLoss ? "rl" : ""}
                                tabIndex={0}
                                aria-expanded={isOpen}
                                onClick={() =>
                                  setExpandedId(isOpen ? null : o.orderId)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setExpandedId(isOpen ? null : o.orderId);
                                  }
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                <td style={{ ...td2 }}>
                                  <div
                                    style={{
                                      fontWeight: 600,
                                      fontSize: 12,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                  >
                                    {isOpen ? (
                                      <ChevronUp
                                        size={11}
                                        color="var(--t3)"
                                      />
                                    ) : (
                                      <ChevronDown
                                        size={11}
                                        color="var(--t3)"
                                      />
                                    )}
                                    {o.date}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: "var(--t3)",
                                      marginTop: 2,
                                      fontFamily: mono,
                                    }}
                                  >
                                    {o.orderId}
                                  </div>
                                </td>
                                {!isSL && (
                                  <td style={{ ...td2, maxWidth: 180 }}>
                                    <div
                                      style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: "var(--t2)",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        maxWidth: 170,
                                      }}
                                      title={(o.items || [])
                                        .map((i) => i.name)
                                        .join("、")}
                                    >
                                      {(o.items || []).length === 1
                                        ? o.items[0].name
                                        : `${o.items?.[0]?.name || "—"} 等 ${
                                            o.items?.length || 0
                                          } 件`}
                                    </div>
                                  </td>
                                )}
                                <td
                                  style={{
                                    ...td2,
                                    textAlign: "right",
                                    fontFamily: mono,
                                    fontWeight: 600,
                                  }}
                                >
                                  {fmt$(rev)}
                                </td>
                                <td
                                  style={{
                                    ...td2,
                                    textAlign: "right",
                                    fontFamily: mono,
                                    color: "var(--dn)",
                                  }}
                                >
                                  -{fmt$(fee)}
                                </td>
                                <td
                                  style={{
                                    ...td2,
                                    textAlign: "right",
                                    fontFamily: mono,
                                    color: "var(--dn)",
                                  }}
                                >
                                  -{fmt$(cost)}
                                </td>
                                <td
                                  style={{
                                    ...td2,
                                    textAlign: "right",
                                    fontFamily: mono,
                                    fontWeight: 600,
                                  }}
                                >
                                  {fmt$(gross)}
                                </td>
                                <td
                                  style={{
                                    ...td2,
                                    textAlign: "right",
                                    fontFamily: mono,
                                    fontWeight: 800,
                                    color: isLoss
                                      ? "var(--dn)"
                                      : "var(--accent)",
                                  }}
                                >
                                  {fmt$(net)}
                                </td>
                              </tr>
                              {isOpen && (
                                <tr>
                                  <td
                                    colSpan={isSL ? 6 : 7}
                                    style={{
                                      ...td2,
                                      background: "var(--s2)",
                                      padding: "16px 20px",
                                    }}
                                  >
                                    <OrderDetail
                                      order={o}
                                      isSL={isSL}
                                      slFp={slFp}
                                      slCosts={slCosts}
                                      spCosts={spCosts}
                                    />
                                  </td>
                                </tr>
                              )}
                              </React.Fragment>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={isSL ? 6 : 7}
                              style={{
                                ...td2,
                                textAlign: "center",
                                color: "var(--t4)",
                                padding: 40,
                              }}
                            >
                              找不到符合條件的訂單
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  {filteredOrders.length > pageSize && (
                    <div
                      style={{
                        padding: "12px 4px 0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--t3)",
                            fontFamily: mono,
                          }}
                        >
                          {curPage * pageSize + 1}–
                          {Math.min(
                            (curPage + 1) * pageSize,
                            filteredOrders.length
                          )}{" "}
                          / {filteredOrders.length} 筆
                        </span>
                        <span style={{ fontSize: 10, color: "var(--t4)" }}>
                          每頁
                        </span>
                        <select
                          value={pageSize}
                          aria-label="每頁筆數"
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(0);
                          }}
                          style={{
                            ...sel,
                            padding: "3px 8px",
                            fontSize: 11,
                            fontFamily: mono,
                          }}
                        >
                          {[20, 30, 50, 100].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {[
                          {
                            label: "«",
                            aria: "第一頁",
                            action: () => setPage(0),
                          },
                          {
                            label: "‹",
                            aria: "上一頁",
                            action: () =>
                              setPage(Math.max(0, curPage - 1)),
                          },
                          null,
                          {
                            label: "›",
                            aria: "下一頁",
                            action: () =>
                              setPage(Math.min(totalPages - 1, curPage + 1)),
                          },
                          {
                            label: "»",
                            aria: "最後一頁",
                            action: () => setPage(totalPages - 1),
                          },
                        ].map((btn, i) =>
                          btn === null ? (
                            <span
                              key={i}
                              style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: "var(--t1)",
                                fontFamily: mono,
                                padding: "0 10px",
                              }}
                            >
                              {curPage + 1} / {totalPages}
                            </span>
                          ) : (
                            <Btn
                              key={i}
                              v="ghost"
                              aria-label={btn.aria}
                              onClick={btn.action}
                              style={{
                                padding: "4px 8px",
                                fontSize: 12,
                                minWidth: 32,
                                justifyContent: "center",
                              }}
                            >
                              {btn.label}
                            </Btn>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Confirm Dialog */}
      {confirmBox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={confirmBox.title}
          onClick={() => setConfirmBox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setConfirmBox(null);
            }}
            style={{
              background: "var(--s1)",
              border: "1px solid var(--s3)",
              borderRadius: 14,
              padding: "22px 24px",
              maxWidth: 400,
              width: "100%",
              boxShadow: "0 24px 80px rgba(0,0,0,.35)",
              animation: "dlgIn .18s ease both",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                marginBottom: 8,
                color: "var(--t1)",
              }}
            >
              {confirmBox.title}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--t2)",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                marginBottom: 18,
              }}
            >
              {confirmBox.message}
            </div>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <Btn onClick={() => setConfirmBox(null)}>取消</Btn>
              <Btn
                v={confirmBox.danger ? "danger" : "primary"}
                autoFocus
                onClick={() => {
                  const fn = confirmBox.onOk;
                  setConfirmBox(null);
                  fn?.();
                }}
              >
                確定
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          maxWidth: 360,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => {
          const borderCol =
            t.type === "success"
              ? "var(--up)"
              : t.type === "error"
              ? "var(--dn)"
              : t.type === "warning"
              ? "var(--wn)"
              : "var(--orange)";
          return (
            <div
              key={t.id}
              role="status"
              aria-live="polite"
              style={{
                pointerEvents: "auto",
                background: "var(--s1)",
                border: "1px solid var(--s3)",
                borderLeft: `3px solid ${borderCol}`,
                borderRadius: 10,
                padding: "12px 16px",
                boxShadow: "0 8px 30px rgba(0,0,0,.15)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                animation: t.removing
                  ? "toastOut .3s ease forwards"
                  : "toastIn .3s ease",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {t.type === "success" ? (
                <CheckCircle2 size={14} color="var(--up)" />
              ) : t.type === "error" ? (
                <AlertTriangle size={14} color="var(--dn)" />
              ) : (
                <Info size={14} color="var(--orange)" />
              )}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--t1)",
                  flex: 1,
                }}
              >
                {t.msg}
              </span>
              {t.action && (
                <button
                  onClick={() => {
                    t.action();
                    removeToast(t.id);
                  }}
                  style={{
                    border: `1px solid ${borderCol}`,
                    background: "var(--s2)",
                    color: borderCol,
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontSize: 10,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {t.actionLabel || "復原"}
                </button>
              )}
              <button
                onClick={() => removeToast(t.id)}
                aria-label="關閉通知"
                style={{
                  border: "none",
                  background: "none",
                  color: "var(--t4)",
                  cursor: "pointer",
                  padding: 2,
                  display: "flex",
                }}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Error Boundary：單筆資料異常不至於整頁白屏 ────────────── */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) {
    return { err };
  }
  componentDidCatch(err, info) {
    console.error("[ErrorBoundary]", err, info);
  }
  render() {
    if (this.state.err) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            background: "#F8F8F6",
            color: "#1A1A18",
            fontFamily: "'Inter','Noto Sans TC',sans-serif",
            padding: 24,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>
            畫面發生錯誤，資料不受影響
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#8E8E84",
              maxWidth: 480,
              lineHeight: 1.7,
              fontFamily: "monospace",
              wordBreak: "break-all",
            }}
          >
            {String(this.state.err?.message || this.state.err)}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => this.setState({ err: null })}
              style={{
                border: "1px solid #D8D8D2",
                background: "#FFFFFF",
                borderRadius: 8,
                padding: "8px 18px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              重試
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                border: "1px solid rgba(26,107,60,0.18)",
                background: "rgba(26,107,60,0.06)",
                color: "#1A6B3C",
                borderRadius: 8,
                padding: "8px 18px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              重新整理頁面
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ProfitCenter />
    </ErrorBoundary>
  );
}
