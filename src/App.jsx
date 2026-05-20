import { useState, useRef, useCallback } from "react";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --cream:#F5F0E8; --warm-white:#FDFAF5; --ink:#1A1A18; --ink-light:#4A4A45; --ink-muted:#8A8A80; --gold:#C8A96E; --gold-light:#E8D5A8; --green:#4A6741; --border:#E0D8C8; --card:#FFFFFF; }
  body { background: var(--cream); font-family: 'DM Sans', sans-serif; color: var(--ink); }
  .serif { font-family: 'Playfair Display', serif; }
`;

const UploadIcon = () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4M8 8l4-4 4 4"/></svg>;
const CheckIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>;
const SpinIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{animation:"spin 1s linear infinite"}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
const DownloadIcon = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v12M8 12l4 4 4-4M4 20h16"/></svg>;
const EditIcon = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

const getUsage = () => { try { return parseInt(localStorage.getItem("photocheck_usage") || "0"); } catch { return 0; } };
const incUsage = () => { try { localStorage.setItem("photocheck_usage", String(getUsage() + 1)); } catch {} };

const exportCSV = (data) => {
  if (!data?.length) return;
  const headers = Object.keys(data[0]);
  const rows = [headers, ...data.map(r => headers.map(h => `"${(r[h]??'').toString().replace(/"/g,'""')}"`))];
  const blob = new Blob(["\uFEFF" + rows.map(r=>r.join(",")).join("\n")], {type:"text/csv;charset=utf-8;"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "photocheck_export.csv"; a.click();
};
const exportJSON = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "photocheck_export.json"; a.click();
};

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [usage] = useState(getUsage);
  const FREE_LIMIT = 3;
  if (screen === "landing") return <Landing onStart={() => setScreen("app")} />;
  if (screen === "upgrade") return <UpgradeScreen onBack={() => setScreen("app")} />;
  return <ConverterApp usage={usage} freeLimit={FREE_LIMIT} onUpgrade={() => setScreen("upgrade")} />;
}

function BrandMark() {
  return <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:600,letterSpacing:"-0.01em"}}>PhotoCheck Docs</div><div style={{fontSize:"11px",color:"var(--ink-muted)",letterSpacing:"0.04em"}}>AI DRAFTS. YOU VERIFY.</div></div>;
}

function Landing({ onStart }) {
  return <div style={{minHeight:"100vh", background:"var(--warm-white)"}}>
    <style>{STYLE}{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp .6s ease forwards}.fade-up-2{animation:fadeUp .6s .15s ease forwards;opacity:0}.fade-up-3{animation:fadeUp .6s .3s ease forwards;opacity:0}.fade-up-4{animation:fadeUp .6s .45s ease forwards;opacity:0}.btn-primary{background:var(--ink);color:#fff;border:none;padding:14px 32px;border-radius:2px;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;cursor:pointer;transition:background .2s,transform .15s}.btn-primary:hover{background:#333;transform:translateY(-1px)}.btn-ghost{background:transparent;color:var(--ink);border:1.5px solid var(--border);padding:13px 28px;border-radius:2px;font-family:'DM Sans',sans-serif;font-size:15px;cursor:pointer}.btn-ghost:hover{border-color:var(--ink)}.tag{background:var(--gold-light);color:#7A5C20;padding:5px 14px;border-radius:100px;font-size:12px;font-weight:500;letter-spacing:.06em;display:inline-block}.step-card{background:#fff;border:1px solid var(--border);border-radius:4px;padding:28px 24px;transition:box-shadow .2s}.step-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.07)}.divider{width:40px;height:1px;background:var(--border);margin:0 auto}`} </style>
    <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 48px",borderBottom:"1px solid var(--border)",background:"var(--warm-white)"}}>
      <BrandMark />
      <div style={{display:"flex",gap:"32px",alignItems:"center"}}><span style={{fontSize:14,color:"var(--ink-light)"}}>功能</span><span style={{fontSize:14,color:"var(--ink-light)"}}>定價</span><span style={{fontSize:14,color:"var(--ink-light)"}}>關於</span><button className="btn-primary" style={{padding:"10px 22px",fontSize:14}} onClick={onStart}>免費試用 →</button></div>
    </nav>
    <div style={{maxWidth:960,margin:"0 auto",padding:"80px 48px 60px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:64,alignItems:"center"}}>
      <div><div className="tag fade-up" style={{marginBottom:24}}>AI 產草稿，人類做判斷</div><h1 className="serif fade-up-2" style={{fontSize:"clamp(36px,5vw,56px)",lineHeight:1.15,marginBottom:20,letterSpacing:"-0.02em"}}>照片秒變<br/><em>可編輯表格</em><br/>不再手打。</h1><p className="fade-up-3" style={{fontSize:15,color:"var(--ink-light)",lineHeight:1.7,marginBottom:32,maxWidth:410}}>上傳進貨單、報表、菜單或手寫紀錄，AI 先轉成可編輯表格，你再確認、修改、匯出。</p><div className="fade-up-4" style={{display:"flex",gap:12}}><button className="btn-primary" onClick={onStart}>免費試用 3 次 →</button><button className="btn-ghost">查看示範</button></div><div className="fade-up-4" style={{marginTop:28,fontSize:13,color:"var(--ink-muted)"}}>✦ 無需安裝 ✦ 前 3 次免費 ✦ CSV / JSON 匯出</div></div>
      <div className="fade-up-3" style={{display:"flex",justifyContent:"center"}}><MockPhone /></div>
    </div>
    <div className="divider" style={{marginBottom:64}} />
    <div style={{maxWidth:900,margin:"0 auto",padding:"0 48px 80px",textAlign:"center"}}><div style={{fontSize:13,color:"var(--ink-muted)",letterSpacing:"0.08em",marginBottom:10}}>HOW IT WORKS</div><h2 className="serif" style={{fontSize:32,marginBottom:48}}>三步驟，文件數位化</h2><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24}}>{[{num:"01",title:"上傳照片",desc:"拍照或選擇圖片，支援 PNG / JPG / WEBP。"},{num:"02",title:"AI 文件辨識",desc:"AI 先擷取圖片中的表格與文字，產生可編輯草稿，等待你人工確認。"},{num:"03",title:"校對後匯出",desc:"網頁即時編輯，確認無誤後下載 CSV 或 JSON。"}].map(s=><div key={s.num} className="step-card"><div style={{fontSize:11,color:"var(--gold)",fontWeight:600,letterSpacing:"0.1em",marginBottom:12}}>{s.num}</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:20,marginBottom:10}}>{s.title}</div><div style={{fontSize:13,color:"var(--ink-light)",lineHeight:1.7}}>{s.desc}</div></div>)}</div></div>
    <div style={{background:"var(--ink)",color:"#fff",padding:"60px 48px",textAlign:"center"}}><div style={{maxWidth:600,margin:"0 auto"}}><h2 className="serif" style={{fontSize:32,marginBottom:12}}>Public Test V1</h2><p style={{fontSize:14,color:"#aaa",marginBottom:28}}>先測試 OCR 成功率與人工校對流程；登入與付費留到後續版本。</p><button className="btn-primary" style={{background:"#fff",color:"var(--ink)"}} onClick={onStart}>開始測試 →</button></div></div>
  </div>;
}

function MockPhone() {
  return <div style={{width:260,background:"#1A1A18",borderRadius:36,padding:"16px 12px",boxShadow:"0 32px 64px rgba(0,0,0,.18)"}}><div style={{background:"var(--warm-white)",borderRadius:24,overflow:"hidden"}}><div style={{background:"var(--ink)",color:"#fff",padding:"16px 18px 12px"}}><div style={{fontSize:11,opacity:.5,marginBottom:2}}>8:00</div><div style={{fontSize:14,fontFamily:"'Playfair Display',serif"}}>Good evening, Creator</div><div style={{fontSize:11,opacity:.6}}>今日草稿已準備好</div></div><div style={{padding:"14px 16px"}}><div style={{fontSize:10,color:"var(--ink-muted)",marginBottom:6}}>今日文件</div><div style={{background:"#F0EBE0",borderRadius:6,padding:"10px 12px",marginBottom:10}}><div style={{fontSize:11,fontWeight:600,marginBottom:4}}>進貨單 · 2026/05/20</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>{[["品名","數量"],["麵粉","25kg"],["砂糖","15kg"]].map(([a,b],i)=><><span style={{background:i===0?"var(--ink)":"#fff",color:i===0?"#fff":"var(--ink)",fontSize:9,padding:"3px 6px",borderRadius:3}}>{a}</span><span style={{background:i===0?"var(--ink)":"#fff",color:i===0?"#fff":"var(--ink)",fontSize:9,padding:"3px 6px",borderRadius:3}}>{b}</span></>)}</div></div><div style={{display:"flex",gap:8}}><button style={{flex:1,border:"1px solid var(--border)",background:"#fff",padding:8,borderRadius:4,fontSize:11}}>編輯</button><button style={{flex:1,background:"var(--ink)",color:"#fff",border:"none",padding:8,borderRadius:4,fontSize:11}}>下載 ↓</button></div></div></div></div>;
}

function ConverterApp({ usage: initUsage, freeLimit, onUpgrade }) {
  const [usage, setUsage] = useState(initUsage);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState(null);
  const [error, setError] = useState(null);
  const [exportFormat, setExportFormat] = useState("csv");
  const fileRef = useRef();
  const remaining = freeLimit - usage;
  const isLocked = usage >= freeLimit;

  const handleFile = useCallback((file) => {
    if (!file?.type.startsWith("image/")) return;
    setTableData(null); setError(null); setPreview(URL.createObjectURL(file));
    const reader = new FileReader(); reader.onloadend = () => setImage(reader.result); reader.readAsDataURL(file);
  }, []);
  const handleDrop = useCallback((e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }, [handleFile]);

  const handleConvert = async () => {
    if (!image || isLocked) return;
    setLoading(true); setError(null);
    try {
      const response = await fetch("/api/ocr", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ image }) });
      if (!response.ok) { const err = await response.json().catch(() => ({})); throw new Error(err.error || "OCR request failed"); }
      const parsed = await response.json();
      if (!Array.isArray(parsed)) throw new Error("後端回傳格式不是 JSON array");
      setTableData(parsed); incUsage(); setUsage(u => u + 1);
    } catch (e) { setError("辨識失敗：" + (e.message || "請確認圖片清晰度後重試")); }
    finally { setLoading(false); }
  };

  const handleExport = () => { if (!tableData) return; exportFormat === "json" ? exportJSON(tableData) : exportCSV(tableData); };
  const handleCellEdit = (ri, key, val) => setTableData(prev => prev.map((row, i) => i === ri ? {...row, [key]: val} : row));

  return <div style={{minHeight:"100vh",background:"var(--cream)"}}><style>{STYLE}{`@keyframes spin{to{transform:rotate(360deg)}}.drop-zone{border:2px dashed var(--border);border-radius:8px;background:#fff;transition:border-color .2s,background .2s;cursor:pointer}.drop-zone:hover{border-color:var(--ink);background:#FDFAF5}.table-input{width:100%;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink);padding:6px 8px;outline:none;border-radius:3px}.table-input:focus{background:#F5F0E8}.pill{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:100px;font-size:12px;font-weight:500;cursor:pointer;border:1.5px solid var(--border)}.pill.active{background:var(--ink);color:#fff;border-color:var(--ink)}.btn-convert{background:var(--ink);color:#fff;border:none;padding:14px 36px;border-radius:2px;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:10px}.btn-convert:disabled{opacity:.4;cursor:not-allowed}.btn-dl{background:var(--green);color:#fff;border:none;padding:10px 22px;border-radius:2px;font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:7px}.lock-banner{background:linear-gradient(135deg,#1A1A18,#3A3A35);color:#fff;border-radius:8px;padding:32px;text-align:center}`}</style>
    <div style={{background:"var(--warm-white)",borderBottom:"1px solid var(--border)",padding:"16px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><BrandMark /><div style={{display:"flex",alignItems:"center",gap:16}}>{!isLocked ? <div style={{fontSize:13,color:"var(--ink-light)"}}>剩餘免費次數：<strong style={{color:"var(--ink)"}}>{remaining}</strong> / {freeLimit}</div> : <div style={{fontSize:13,color:"#C04A2A"}}>免費次數已用完</div>}<button onClick={onUpgrade} style={{background:"var(--gold)",color:"var(--ink)",border:"none",padding:"8px 18px",borderRadius:2,fontSize:13,fontWeight:500,cursor:"pointer"}}>後續版本功能</button></div></div>
    <div style={{maxWidth:900,margin:"0 auto",padding:"36px 24px"}}>{isLocked ? <div className="lock-banner"><div style={{fontFamily:"'Playfair Display',serif",fontSize:28,marginBottom:12}}>免費次數已用盡</div><p style={{fontSize:14,color:"#aaa",marginBottom:28}}>Public Test 使用 localStorage 模擬次數。正式用量控管留到後續版本。</p><button onClick={onUpgrade} style={{background:"var(--gold)",color:"var(--ink)",border:"none",padding:"14px 36px",borderRadius:2,fontSize:15,fontWeight:600,cursor:"pointer"}}>查看後續版本 →</button></div> : <><div className="drop-zone" style={{padding:preview ? 16 : "52px 24px", textAlign:"center", marginBottom:24}} onDrop={handleDrop} onDragOver={e=>e.preventDefault()} onClick={()=>fileRef.current?.click()}><input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>{preview ? <div style={{display:"flex",alignItems:"center",gap:20}}><img src={preview} alt="" style={{maxHeight:120,maxWidth:200,borderRadius:4,objectFit:"contain",border:"1px solid var(--border)"}}/><div style={{textAlign:"left"}}><div style={{fontSize:14,fontWeight:500,marginBottom:4}}>圖片已載入</div><div style={{fontSize:12,color:"var(--ink-muted)"}}>點擊此區域更換圖片</div></div></div> : <><div style={{color:"var(--ink-muted)",marginBottom:12}}><UploadIcon /></div><div style={{fontFamily:"'Playfair Display',serif",fontSize:20,marginBottom:8}}>拖放圖片，或點擊上傳</div><div style={{fontSize:13,color:"var(--ink-muted)"}}>支援 PNG · JPG · WEBP｜進貨單、菜單、報表均可</div></>}</div>{image && <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap",alignItems:"center"}}><span style={{fontSize:13,color:"var(--ink-muted)",marginRight:4}}>匯出格式：</span>{[{id:"csv",label:"CSV"},{id:"json",label:"JSON"}].map(f=><div key={f.id} className={`pill${exportFormat===f.id?" active":""}`} onClick={()=>setExportFormat(f.id)}>{exportFormat===f.id && <CheckIcon />}{f.label}</div>)}</div>}{image && <div style={{marginBottom:28}}><button className="btn-convert" onClick={handleConvert} disabled={loading}>{loading ? <><SpinIcon /> 文件辨識中，請稍候…</> : "✦ 啟動 AI 辨識"}</button></div>}{error && <div style={{background:"#FFF0ED",border:"1px solid #FFCCC7",borderRadius:4,padding:"14px 18px",fontSize:13,color:"#C04A2A",marginBottom:20}}>⚠ {error}</div>}</>}
      {tableData && <div style={{marginTop:8}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div><div style={{fontFamily:"'Playfair Display',serif",fontSize:18}}>辨識結果</div><div style={{fontSize:12,color:"var(--ink-muted)",marginTop:2,display:"flex",gap:6,alignItems:"center"}}><EditIcon /> 可直接在格子內點擊修改</div></div><button className="btn-dl" onClick={handleExport}><DownloadIcon /> 下載 {exportFormat.toUpperCase()}</button></div><div style={{overflowX:"auto",border:"1px solid var(--border)",borderRadius:6,background:"#fff"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{borderBottom:"2px solid var(--border)"}}>{Object.keys(tableData[0]).map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontWeight:600,color:"var(--ink)",whiteSpace:"nowrap",background:"#FDFAF5",fontSize:12,letterSpacing:"0.02em"}}>{h}</th>)}</tr></thead><tbody>{tableData.map((row,ri)=><tr key={ri} style={{borderBottom:"1px solid var(--border)"}}>{Object.keys(tableData[0]).map(h=><td key={h} style={{padding:"2px 4px"}}><input className="table-input" value={row[h] ?? ""} onChange={e=>handleCellEdit(ri,h,e.target.value)}/></td>)}</tr>)}</tbody></table></div><div style={{fontSize:11,color:"var(--ink-muted)",marginTop:10,textAlign:"right"}}>{tableData.length} 列 · {Object.keys(tableData[0]).length} 欄</div></div>}
    </div>
  </div>;
}

function UpgradeScreen({ onBack }) {
  return <div style={{minHeight:"100vh",background:"var(--ink)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}><style>{STYLE}</style><div style={{maxWidth:480,width:"100%",padding:24,textAlign:"center",color:"#fff"}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:"var(--gold)",letterSpacing:"0.1em",marginBottom:20}}>ROADMAP</div><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:40,marginBottom:16,lineHeight:1.2}}>後續版本功能</h2><p style={{color:"#aaa",fontSize:14,marginBottom:36,lineHeight:1.7}}>V1 Public Test 只測試 OCR → 人工校對 → CSV / JSON 匯出。登入、訂閱、真正 Excel / Word、ERP 與簽署流程留到後續版本。</p><div style={{background:"rgba(255,255,255,.06)",borderRadius:6,padding:"24px 28px",marginBottom:28,textAlign:"left"}}>{["V1.2：真正 .xlsx 匯出","V1.3：docx / PDF report","V2：帳號、用量紀錄、訂閱制","V3：線上核對、簽署、ERP 可擷取格式"].map(f=><div key={f} style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,fontSize:14}}><span style={{color:"var(--gold)"}}>✦</span>{f}</div>)}</div><button style={{width:"100%",background:"var(--gold)",color:"var(--ink)",border:"none",padding:16,borderRadius:2,fontSize:16,fontWeight:600,cursor:"pointer",marginBottom:14}} onClick={onBack}>返回測試 →</button></div></div>;
}
