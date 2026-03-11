import { useState, useEffect } from "react";
// ─── GLOBAL STATE (shared address + deals) ────────────────────────────────────
// We use a simple top-level state object passed down via props
const TABS = ["Deal Analyzer", "CMA Comp Grid", "Deals & Pipeline", "Lender", "Market Intel"];
const DEFAULT_ADJ = {
  sqftRate:50, bedroomAdj:5000, bathroomAdj:8000, garageAdj:8000,
  poolAdj:15000, basementAdj:25, conditionAdj:10000, lotAdj:3, yearAdj:500,
};
const GARAGE_TYPES   = ["None","Detached 1","Detached 2","Attached 1","Attached 2","Attached 3+","Carport"];
const HEATING_TYPES  = ["None","Window Units","Forced Air Gas","Forced Air Electric","Central Air","Heat Pump","Radiant"];
const EXTERIOR_TYPES = ["Vinyl","Brick","Brick/Vinyl","Stucco","Hardie Board","Wood","Mixed"];
const INTERIOR_TYPES = ["Outdated","Fair","Average","Updated","Fully Renovated","Custom"];
const PROPERTY_STYLES= ["Single Family","Townhouse","Condo","Multi-Family","Mobile Home"];
const STAGES = ["Lead","Offer Sent","Countered","Accepted","Under Contract","Due Diligence","Title Search","Clear to Close","Closed","Dead"];
const STAGE_COLORS = {
  "Lead":"#6B7280","Offer Sent":"#8B5CF6","Countered":"#6366F1",
  "Accepted":"#3B82F6","Under Contract":"#F59E0B","Due Diligence":"#F97316",
  "Title Search":"#14B8A6","Clear to Close":"#10B981","Closed":"#059669","Dead":"#EF4444"
};
function fmt(n){if(n===null||n===undefined||n===""||isNaN(+n))return"—";return"$"+Number(n).toLocaleString("en-US",{maximumFractionDigits:0});}
function pct(n){return(!n&&n!==0)?"—":Number(n).toFixed(1)+"%";}
function num(v){return parseFloat(v)||0;}
// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Card({label,value,sub,color,small}){
  return(<div style={{background:"#1a1f2e",border:`1px solid ${color||"#2a3044"}`,borderRadius:10,padding:small?"10px 14px":"14px 18px",flex:"1 1 140px",minWidth:130}}>
    <div style={{fontSize:10,color:color||"#8892a4",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1}}>{label}</div>
    <div style={{fontSize:small?16:20,fontWeight:800,color:color||"#e2e8f0",marginTop:3}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:"#6B7280",marginTop:2}}>{sub}</div>}
  </div>);
}
function GreenCard({label,value,sub}){
  return(<div style={{background:"linear-gradient(135deg,#10B981,#059669)",border:"1px solid #10B981",borderRadius:10,padding:"14px 18px",flex:"1 1 140px",minWidth:130}}>
    <div style={{fontSize:10,color:"#d1fae5",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1}}>{label}</div>
    <div style={{fontSize:20,fontWeight:800,color:"#fff",marginTop:3}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:"#a7f3d0",marginTop:2}}>{sub}</div>}
  </div>);
}
function RedCard({label,value,sub}){
  return(<div style={{background:"linear-gradient(135deg,#EF4444,#DC2626)",border:"1px solid #EF4444",borderRadius:10,padding:"14px 18px",flex:"1 1 140px",minWidth:130}}>
    <div style={{fontSize:10,color:"#fecaca",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1}}>{label}</div>
    <div style={{fontSize:20,fontWeight:800,color:"#fff",marginTop:3}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:"#fca5a5",marginTop:2}}>{sub}</div>}
  </div>);
}
function PurpleCard({label,value,sub}){
  return(<div style={{background:"linear-gradient(135deg,#6366F1,#4f46e5)",border:"1px solid #6366F1",borderRadius:10,padding:"14px 18px",flex:"1 1 140px",minWidth:130}}>
    <div style={{fontSize:10,color:"#c7d2fe",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1}}>{label}</div>
    <div style={{fontSize:20,fontWeight:800,color:"#fff",marginTop:3}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:"#a5b4fc",marginTop:2}}>{sub}</div>}
  </div>);
}
function Field({label,value,onChange,prefix,suffix,placeholder,type="text",small,readOnly,highlight}){
  return(<div style={{display:"flex",flexDirection:"column",gap:3}}>
    {label&&<label style={{fontSize:10,color:"#8892a4",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1}}>{label}</label>}
    <div style={{display:"flex",alignItems:"center",background:highlight?"#1a2e1a":readOnly?"#0d1117":"#1a1f2e",border:`1px solid ${highlight?"#10B981":"#2a3044"}`,borderRadius:7,overflow:"hidden"}}>
      {prefix&&<span style={{padding:"0 8px",color:"#6366F1",fontWeight:700,borderRight:"1px solid #2a3044",fontSize:13,flexShrink:0}}>{prefix}</span>}
      <input type={type} value={value} onChange={e=>onChange&&onChange(e.target.value)} placeholder={placeholder||""} readOnly={readOnly}
        style={{flex:1,background:"transparent",border:"none",outline:"none",color:highlight?"#10B981":readOnly?"#6B7280":"#e2e8f0",padding:small?"7px 10px":"9px 12px",fontSize:small?13:14,fontFamily:"monospace",cursor:readOnly?"default":"text"}}/>
      {suffix&&<span style={{padding:"0 8px",color:"#6B7280",fontSize:12,flexShrink:0}}>{suffix}</span>}
    </div>
  </div>);
}
function Sel({label,value,onChange,options,small,color}){
  return(<div style={{display:"flex",flexDirection:"column",gap:3}}>
    {label&&<label style={{fontSize:10,color:"#8892a4",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1}}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{background:"#1a1f2e",border:`1px solid ${color||"#2a3044"}`,borderRadius:7,color:color||"#e2e8f0",padding:small?"7px 10px":"9px 12px",fontSize:small?12:13,outline:"none"}}>
      {options.map(o=><option key={o} value={o} style={{background:"#1a1f2e"}}>{o}</option>)}
    </select>
  </div>);
}
function SH({children,color="#6366F1",action}){
  return(<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,borderBottom:`1px solid ${color}33`,paddingBottom:6}}>
    <div style={{fontSize:12,color,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:2}}>▸ {children}</div>
    {action}
  </div>);
}
function AddressBar({address,onChange}){
  return(<div style={{background:"#111827",border:"1px solid #6366F144",borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
    <div style={{fontSize:11,color:"#6366F1",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1,flexShrink:0}}>📍 Active Property</div>
    <input value={address} onChange={e=>onChange&&onChange(e.target.value)} placeholder="Enter subject property address — auto-populates throughout app"
      style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#e2e8f0",fontSize:14,fontFamily:"monospace",fontWeight:600}}/>
    {address&&<div style={{fontSize:11,color:"#10B981",fontFamily:"monospace",flexShrink:0}}>● Live</div>}
  </div>);
}
// ─── DEAL ANALYZER ────────────────────────────────────────────────────────────
function DealAnalyzer({address,onAddressChange,dealData,onDealDataChange}){
  const d = dealData;
  const s = k => v => onDealDataChange({...d,[k]:v});
  const pp=num(d.purchasePrice),arv=num(d.arv),rehab=num(d.rehabCost);
  const sqft=num(d.sqft),aduSqft=num(d.aduSqft),gross=num(d.grossIncome),opex=num(d.opEx);
  const mao70=arv*.70-rehab, mao75=arv*.75-rehab, spread=mao75-pp;
  const arvRatio=arv>0?(pp/arv)*100:0;
  const equity=arv-pp-rehab, roi=pp>0?(equity/pp)*100:0;
  const aduVal=(aduSqft>0&&sqft>0&&pp>0)?(pp/sqft)*aduSqft*.25:0;
  const noi=gross-opex, capRate=pp>0?(noi/pp)*100:0, grm=gross>0?pp/gross:0;
  const dq=arv>0&&pp>0?arvRatio<65?{label:"STRONG DEAL ✓",c:"#10B981"}:arvRatio<75?{label:"FAIR DEAL",c:"#F59E0B"}:{label:"WEAK DEAL ✗",c:"#EF4444"}:null;
  const formulas=[
    {t:"Fix & Flip MAO (70%)",f:"ARV × 70% − Rehab Cost",c:"#6366F1"},
    {t:"Wholesale MAO (75%)",f:"ARV × 75% − Rehab Cost",c:"#10B981"},
    {t:"ADU Value",f:"(Purchase ÷ Sqft) × ADU Sqft × 25%",c:"#F59E0B"},
    {t:"NOI / Cap Rate",f:"NOI = Gross − OpEx  |  Cap = NOI ÷ Price",c:"#EC4899"},
    {t:"GRM",f:"Purchase Price ÷ Annual Gross Income",c:"#3B82F6"},
    {t:"Equity / ROI",f:"(ARV − Purchase − Rehab) ÷ Purchase",c:"#14B8A6"},
  ];
  return(<div style={{display:"flex",flexDirection:"column",gap:22}}>
    <AddressBar address={address} onChange={onAddressChange}/>
    <div><SH>Formula Reference</SH>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:8}}>
        {formulas.map(f=><div key={f.t} style={{background:"#1a1f2e",border:`1px solid ${f.c}33`,borderLeft:`3px solid ${f.c}`,borderRadius:8,padding:"10px 14px"}}>
          <div style={{fontSize:11,color:f.c,fontWeight:700,fontFamily:"monospace"}}>{f.t}</div>
          <div style={{fontSize:12,color:"#94a3b8",fontFamily:"monospace",marginTop:3,whiteSpace:"pre-line"}}>{f.f}</div>
        </div>)}
      </div>
    </div>
    <div><SH>Property Info</SH>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:10}}>
        <div style={{gridColumn:"1/-1"}}><Field label="Property Address (synced)" value={address} onChange={onAddressChange} placeholder="Auto-populates from address bar" highlight/></div>
        <Sel label="Deal Type" value={d.propertyType||"fix-flip"} onChange={s("propertyType")} options={["fix-flip","wholesale","str","adu","brrr"]}/>
        <Field label="Beds" value={d.beds||""} onChange={s("beds")} placeholder="3"/>
        <Field label="Baths" value={d.baths||""} onChange={s("baths")} placeholder="2"/>
        <Field label="Year Built" value={d.yearBuilt||""} onChange={s("yearBuilt")} placeholder="1985"/>
        <Field label="Living Sqft" value={d.sqft||""} onChange={s("sqft")} suffix="sqft"/>
        <Field label="Lot Size" value={d.lotSize||""} onChange={s("lotSize")} suffix="sqft"/>
      </div>
    </div>
    <div><SH>Core Numbers</SH>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:10}}>
        <Field label="Purchase / Offer Price" value={d.purchasePrice||""} onChange={s("purchasePrice")} prefix="$"/>
        <Field label="After Repair Value (ARV)" value={d.arv||""} onChange={s("arv")} prefix="$"/>
        <Field label="Estimated Rehab" value={d.rehabCost||""} onChange={s("rehabCost")} prefix="$"/>
      </div>
    </div>
    <div><SH color="#F59E0B">ADU</SH>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:10}}>
        <Field label="ADU Square Footage" value={d.aduSqft||""} onChange={s("aduSqft")} suffix="sqft"/>
      </div>
    </div>
    <div><SH color="#EC4899">STR / Rental Income</SH>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:10}}>
        <Field label="Annual Gross Income" value={d.grossIncome||""} onChange={s("grossIncome")} prefix="$"/>
        <Field label="Annual Op. Expenses" value={d.opEx||""} onChange={s("opEx")} prefix="$"/>
      </div>
    </div>
    {(arv>0||pp>0)&&(<div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
        <SH>Analysis Results</SH>
        {dq&&<div style={{background:dq.c+"22",border:`1px solid ${dq.c}`,borderRadius:20,padding:"3px 14px",fontSize:12,color:dq.c,fontWeight:800,fontFamily:"monospace",marginTop:-8}}>{dq.label}</div>}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
        <Card label="Fix & Flip MAO (70%)" value={fmt(mao70)} sub="Max Allowable Offer" color="#6366F1"/>
        {mao75>0&&pp<=mao75?<GreenCard label="Wholesale MAO (75%)" value={fmt(mao75)} sub="✓ Under MAO"/>:<RedCard label="Wholesale MAO (75%)" value={fmt(mao75)} sub="Over MAO"/>}
        {spread>0?<GreenCard label="Wholesale Spread" value={fmt(spread)} sub="Profit Potential"/>:<RedCard label="Wholesale Spread" value={fmt(spread)} sub="Over MAO"/>}
        <Card label="Price / ARV Ratio" value={pct(arvRatio)} sub="Target: < 75%" color={arvRatio<75?"#10B981":"#EF4444"}/>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
        {equity>0?<GreenCard label="Total Equity Built" value={fmt(equity)} sub="ARV − Purchase − Rehab"/>:<RedCard label="Total Equity" value={fmt(equity)}/>}
        <Card label="ROI" value={pct(roi)} color={roi>20?"#10B981":"#F59E0B"}/>
        {sqft>0&&<Card label="Rehab / Sqft" value={"$"+(rehab/sqft).toFixed(0)+"/sqft"} color="#94a3b8"/>}
      </div>
      {aduSqft>0&&<div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}><GreenCard label="ADU Est. Value" value={fmt(aduVal)} sub="25% × (Price/Sqft) × ADU Sqft"/></div>}
      {gross>0&&<div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        <Card label="NOI (Annual)" value={fmt(noi)} color="#EC4899"/>
        {capRate>=7?<GreenCard label="Cap Rate" value={pct(capRate)} sub="✓ Target ≥ 7%"/>:<Card label="Cap Rate" value={pct(capRate)} sub="Target: ≥ 7%" color="#F59E0B"/>}
        <Card label="GRM" value={grm>0?grm.toFixed(1)+"x":"—"} sub="Lower = Better" color="#3B82F6"/>
      </div>}
    </div>)}
    <div><SH>Deal Notes</SH>
      <textarea value={d.notes||""} onChange={e=>s("notes")(e.target.value)} placeholder="Motivated seller, water damage, needs roof…" rows={3}
        style={{width:"100%",background:"#1a1f2e",border:"1px solid #2a3044",borderRadius:8,color:"#e2e8f0",padding:12,fontSize:14,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
    </div>
  </div>);
}
// ─── CMA COMP GRID ────────────────────────────────────────────────────────────
function emptyComp(n){
  return{label:`Comp #${n}`,address:"",salePrice:"",listPrice:"",saleDate:"",dom:"",distance:"",
    sqft:"",sqftAdj:"Same",beds:"",bedsAdj:"Same",baths:"",bathsAdj:"Same",
    yearBuilt:"",yearAdj:"Same",garage:"None",garageAdj:"Same",carport:"None",carportAdj:"Same",
    school:"",schoolAdj:"Same",neighborhood:"B class",neighborhoodAdj:"Same",
    traffic:"Average",trafficAdj:"Same",surroundings:"Average",surroundingsAdj:"Same",
    lotSize:"",lotAdj:"Same",lotLayout:"Average",lotLayoutAdj:"Same",
    view:"Average",viewAdj:"Same",heating:"Central Air",heatingAdj:"Same",
    pool:"None",poolAdj:"Same",basement:"None",basementAdj:"Same",
    exterior:"Vinyl",exteriorAdj:"Same",interior:"Average",interiorAdj:"Same",
    curb:"Average",curbAdj:"Same",style:"Single Family",styleAdj:"Same",weight:33};
}
const LINE_ITEMS=[
  {key:"salePrice",label:"Sale Price",type:"price",noAdj:true},
  {key:"listPrice",label:"List Price",type:"price",noAdj:true},
  {key:"ppsf",label:"Price Per SQFT",type:"computed",noAdj:true},
  {key:"zestimate",label:"Zestimate / Concessions",type:"text",noAdj:true},
  {key:"saleDate",label:"Sale Date",type:"text",noAdj:true},
  {key:"dom",label:"Days on Market",type:"number",noAdj:true},
  {key:"distance",label:"Distance from Subject (mi)",type:"number",noAdj:true},
  {key:"sqft",label:"Square Footage – Above Grade",type:"sqft",adjKey:"sqftAdj"},
  {key:"beds",label:"Beds",type:"number",adjKey:"bedsAdj"},
  {key:"baths",label:"Bathrooms",type:"number",adjKey:"bathsAdj"},
  {key:"yearBuilt",label:"Year Built (< 10yr preferred)",type:"number",adjKey:"yearAdj"},
  {key:"garage",label:"Garage (# of cars)",type:"select",options:GARAGE_TYPES,adjKey:"garageAdj"},
  {key:"carport",label:"Carport (# of cars)",type:"select",options:["None","1","2","3+"],adjKey:"carportAdj"},
  {key:"school",label:"School District",type:"text",adjKey:"schoolAdj"},
  {key:"neighborhood",label:"Neighborhood",type:"select",options:["D class","C class","B class","A class"],adjKey:"neighborhoodAdj"},
  {key:"traffic",label:"Traffic",type:"select",options:["Heavy","Average","Light","None"],adjKey:"trafficAdj"},
  {key:"surroundings",label:"Surrounding Properties",type:"select",options:["Poor","Below Average","Average","Good","Excellent"],adjKey:"surroundingsAdj"},
  {key:"lotSize",label:"Lot Size (sqft)",type:"number",adjKey:"lotAdj"},
  {key:"lotLayout",label:"Lot Layout",type:"select",options:["Irregular","Below Average","Average","Good","Premium"],adjKey:"lotLayoutAdj"},
  {key:"view",label:"View",type:"select",options:["None","Below Average","Average","Good","Premium"],adjKey:"viewAdj"},
  {key:"heating",label:"Heating & Cooling",type:"select",options:HEATING_TYPES,adjKey:"heatingAdj"},
  {key:"pool",label:"Pool",type:"select",options:["None","Above Ground","In-Ground","Heated"],adjKey:"poolAdj"},
  {key:"basement",label:"Basement",type:"select",options:["None","Unfinished","Partial Finished","Full Finished","Walkout"],adjKey:"basementAdj"},
  {key:"exterior",label:"Exterior",type:"select",options:EXTERIOR_TYPES,adjKey:"exteriorAdj"},
  {key:"interior",label:"Interior Condition",type:"select",options:INTERIOR_TYPES,adjKey:"interiorAdj"},
  {key:"curb",label:"Landscaping & Curb Appeal",type:"select",options:["Poor","Below Average","Average","Good","Excellent"],adjKey:"curbAdj"},
  {key:"style",label:"Property Style",type:"select",options:PROPERTY_STYLES,adjKey:"styleAdj"},
];
function calcAutoAdj(subj,comp,adj,key){
  const sv=num(subj[key]),cv=num(comp[key]);
  const qk=["school","neighborhood","traffic","surroundings","lotLayout","view","heating","pool","basement","exterior","interior","curb","style","garage","carport"];
  if(qk.includes(key))return 0;
  if(key==="sqft")return Math.round((sv-cv)*adj.sqftRate);
  if(key==="beds")return Math.round((sv-cv)*adj.bedroomAdj);
  if(key==="baths")return Math.round((sv-cv)*adj.bathroomAdj);
  if(key==="yearBuilt")return Math.round((sv-cv)*adj.yearAdj);
  if(key==="lotSize")return Math.round((sv-cv)*adj.lotAdj);
  return 0;
}
function getAdjAmount(subj,comp,line,adj){
  if(line.noAdj||!line.adjKey)return 0;
  const ac=comp[line.adjKey];
  if(ac==="Same")return 0;
  const auto=calcAutoAdj(subj,comp,adj,line.key);
  if(auto!==0)return ac==="Worse"?Math.abs(auto):-Math.abs(auto);
  const qa={pool:adj.poolAdj,basement:adj.basementAdj,garage:adj.garageAdj};
  const base=qa[line.key]||5000;
  return ac==="Worse"?base:-base;
}
function CMAGrid({address, onAddressChange}){
  const [subject,setSubject]=useState({address:"",salePrice:"",zestimate:"",sqft:"",beds:"",baths:"",yearBuilt:"",garage:"2 attached",carport:"None",school:"",neighborhood:"B class",traffic:"Average",surroundings:"Average",lotSize:"",lotLayout:"Average",view:"Average",heating:"Forced Air, Natural Gas",pool:"None",basement:"None",exterior:"Brick / Vinyl",interior:"Outdated",curb:"Average",style:"Single Family"});
  const [comps,setComps]=useState([emptyComp(1),emptyComp(2),emptyComp(3)]);
  const [adj,setAdj]=useState(DEFAULT_ADJ);
  const [manualAdj,setManualAdj]=useState({});
  const [showAdj,setShowAdj]=useState(false);
  // Always sync address from global into subject
  useEffect(()=>{if(address)setSubject(s=>({...s,address}));},[address]);
  const setSub=k=>v=>setSubject(s=>({...s,[k]:v}));
  const setComp=(i,k)=>v=>setComps(cs=>cs.map((c,idx)=>idx===i?{...c,[k]:v}:c));
  const getMan=(ci,key)=>{const mk=`${ci}_${key}`;return manualAdj[mk]!==undefined?manualAdj[mk]:null;};
  const setMan=(ci,key,val)=>setManualAdj(m=>({...m,[`${ci}_${key}`]:parseFloat(val)||0}));
  const compResults=comps.map((comp,ci)=>{
    const sp=num(comp.salePrice);if(sp===0)return{totalAdj:0,postAdj:0};
    let totalAdj=0;
    LINE_ITEMS.forEach(line=>{if(line.noAdj||!line.adjKey)return;const mk=getMan(ci,line.key);totalAdj+=mk!==null?mk:getAdjAmount(subject,comp,line,adj);});
    return{totalAdj,postAdj:sp+totalAdj};
  });
  const validR=compResults.filter(r=>r.postAdj>0);
  const avgARV=validR.length>0?validR.reduce((a,r)=>a+r.postAdj,0)/validR.length:0;
  const totW=comps.reduce((a,c,i)=>compResults[i].postAdj>0?a+(num(c.weight)):a,0);
  const weightedARV=totW>0?comps.reduce((a,c,i)=>{if(compResults[i].postAdj===0)return a;return a+compResults[i].postAdj*(num(c.weight)/totW);},0):0;
  const adjBtn=(ci,line,choice)=>{
    const cur=comps[ci][line.adjKey];
    const cols={Same:"#4B5563",Better:"#EF4444",Worse:"#10B981"};
    const active=cur===choice;
    return(<button onClick={()=>setComp(ci,line.adjKey)(choice)} style={{background:active?cols[choice]+"33":"transparent",border:`1px solid ${active?cols[choice]:"#2a3044"}`,borderRadius:4,color:active?cols[choice]:"#4B5563",padding:"2px 5px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"monospace"}}>{choice}</button>);
  };
  const cs=isSub=>({padding:"8px 10px",borderBottom:"1px solid #1e2533",background:isSub?"#131929":"transparent",verticalAlign:"middle",minWidth:isSub?160:230});
  const renderSubjCell=(line)=>{
    if(line.key==="ppsf"){const sp=num(subject.salePrice),sq=num(subject.sqft);return <span style={{color:"#94a3b8",fontFamily:"monospace",fontSize:13}}>{sp>0&&sq>0?fmt(sp/sq)+"/sqft":"—"}</span>;}
    const bs={background:"transparent",border:"none",outline:"none",color:"#e2e8f0",fontSize:13,width:"100%",fontFamily:"monospace"};
    const sv=subject[line.key]||"";
    if(line.type==="price")return <input value={sv} onChange={e=>setSub(line.key)(e.target.value)} placeholder="$0" style={{...bs,color:"#6366F1",fontWeight:700}}/>;
    if(line.type==="number"||line.type==="sqft")return <input value={sv} onChange={e=>setSub(line.key)(e.target.value)} placeholder="0" style={bs}/>;
    if(line.type==="text")return <input value={sv} onChange={e=>setSub(line.key)(e.target.value)} placeholder="—" style={bs}/>;
    if(line.type==="select")return <select value={sv||(line.options||[])[0]} onChange={e=>setSub(line.key)(e.target.value)} style={{...bs,padding:0}}>{(line.options||[]).map(o=><option key={o} value={o} style={{background:"#1a1f2e"}}>{o}</option>)}</select>;
    return <span style={{color:"#94a3b8",fontSize:13}}>{sv||"—"}</span>;
  };
  const renderCompCell=(line,ci,comp)=>{
    if(line.key==="ppsf"){const sp=num(comp.salePrice),sq=num(comp.sqft);return <span style={{color:"#94a3b8",fontSize:13,fontFamily:"monospace"}}>{sp>0&&sq>0?fmt(sp/sq)+"/sqft":"—"}</span>;}
    const hasAdj=!line.noAdj&&line.adjKey;
    const mk=getMan(ci,line.key);
    const autoAmt=hasAdj?getAdjAmount(subject,comp,line,adj):0;
    const adjAmt=hasAdj?(mk!==null?mk:autoAmt):0;
    const bs={background:"transparent",border:"none",outline:"none",color:"#e2e8f0",fontSize:13,fontFamily:"monospace",width:"100%"};
    const cv=comp[line.key]||"";
    let inputEl;
    if(line.type==="price")inputEl=<input value={cv} onChange={e=>setComp(ci,line.key)(e.target.value)} placeholder="$0" style={{...bs,color:"#10B981",fontWeight:700}}/>;
    else if(line.type==="number"||line.type==="sqft")inputEl=<input value={cv} onChange={e=>setComp(ci,line.key)(e.target.value)} placeholder="0" style={bs}/>;
    else if(line.type==="text")inputEl=<input value={cv} onChange={e=>setComp(ci,line.key)(e.target.value)} placeholder="—" style={bs}/>;
    else if(line.type==="select")inputEl=<select value={cv||(line.options||[])[0]} onChange={e=>setComp(ci,line.key)(e.target.value)} style={{...bs,padding:0}}>{(line.options||[]).map(o=><option key={o} value={o} style={{background:"#1a1f2e"}}>{o}</option>)}</select>;
    return(<div style={{display:"flex",flexDirection:"column",gap:4}}>
      <div style={{display:"flex",alignItems:"center",gap:5}}>
        {inputEl}
        {hasAdj&&<div style={{display:"flex",gap:2,flexShrink:0}}>{adjBtn(ci,line,"Same")}{adjBtn(ci,line,"Better")}{adjBtn(ci,line,"Worse")}</div>}
      </div>
      {hasAdj&&comp[line.adjKey]!=="Same"&&(
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <input value={mk!==null?mk:""} onChange={e=>setMan(ci,line.key,e.target.value)}
            placeholder={autoAmt!==0?`Auto: ${autoAmt>0?"+":""}${autoAmt.toLocaleString()}`:"$ adj"}
            style={{background:"#0d1117",border:"1px solid #2a3044",borderRadius:4,outline:"none",color:adjAmt>0?"#10B981":"#EF4444",fontSize:11,padding:"2px 6px",width:105,fontFamily:"monospace"}}/>
          {adjAmt!==0&&<span style={{fontSize:10,color:adjAmt>0?"#10B981":"#EF4444",fontFamily:"monospace",fontWeight:700}}>{adjAmt>0?"+":""}{adjAmt.toLocaleString()}</span>}
        </div>
      )}
    </div>);
  };
  return(<div style={{display:"flex",flexDirection:"column",gap:18}}>
    {/* methodology */}
    <div style={{background:"#1a1f2e",border:"1px solid #6366F133",borderLeft:"3px solid #6366F1",borderRadius:8,padding:"12px 16px"}}>
      <div style={{fontSize:11,color:"#6366F1",fontFamily:"monospace",fontWeight:700,marginBottom:4}}>NAR / USPAP SALES COMPARISON APPROACH</div>
      <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.7}}>
        Best comps: sold within <strong style={{color:"#e2e8f0"}}>3–6 months</strong>, within <strong style={{color:"#e2e8f0"}}>0.5 mi urban / 1 mi suburban</strong>, same type & school district.
        <span style={{color:"#10B981",fontWeight:700}}> Worse</span> = comp inferior → ADD value (+). <span style={{color:"#EF4444",fontWeight:700}}>Better</span> = comp superior → SUBTRACT (−).
      </div>
    </div>
    {/* adj settings */}
    <div>
      <button onClick={()=>setShowAdj(s=>!s)} style={{background:"#1a1f2e",border:"1px solid #2a3044",borderRadius:7,color:"#8892a4",padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"monospace"}}>
        {showAdj?"▲":"▼"} Adjustment Rate Settings
      </button>
      {showAdj&&<div style={{marginTop:10,background:"#1a1f2e",border:"1px solid #2a3044",borderRadius:10,padding:16}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:10}}>
          {[["$/Sqft GLA","sqftRate","$/sqft"],["Per Bedroom","bedroomAdj"],["Per Bathroom","bathroomAdj"],["Per Garage Stall","garageAdj"],["Pool Value","poolAdj"],["Fin. Bsmt $/sqft","basementAdj","$/sqft"],["Condition/Grade","conditionAdj"],["Lot $/Sqft","lotAdj","$/sqft"],["Per Year Age","yearAdj"]].map(([lbl,key,sfx])=>(
            <Field key={key} label={lbl} small value={adj[key]} onChange={v=>setAdj(a=>({...a,[key]:+v||0}))} prefix="$" suffix={sfx}/>
          ))}
        </div>
      </div>}
    </div>
    {/* ARV summary */}
    {validR.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:8}}>
      {comps.map((c,i)=>compResults[i].postAdj>0&&(
        <div key={i} style={{background:"#1a1f2e",border:"1px solid #2a3044",borderRadius:8,padding:"10px 16px",flex:"1 1 140px"}}>
          <div style={{fontSize:10,color:"#8892a4",fontFamily:"monospace"}}>COMP #{i+1} POST-ADJ ARV</div>
          <div style={{fontSize:20,fontWeight:800,color:"#10B981"}}>{fmt(compResults[i].postAdj)}</div>
          <div style={{fontSize:11,color:"#6B7280"}}>Adj: {compResults[i].totalAdj>=0?"+":""}{fmt(compResults[i].totalAdj)}</div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
            <span style={{fontSize:10,color:"#8892a4"}}>Weight:</span>
            <input value={c.weight} onChange={e=>setComp(i,"weight")(e.target.value)} style={{width:38,background:"#0d1117",border:"1px solid #2a3044",borderRadius:4,color:"#e2e8f0",padding:"2px 5px",fontSize:12,outline:"none",fontFamily:"monospace",textAlign:"center"}}/>
            <span style={{fontSize:10,color:"#6B7280"}}>%</span>
          </div>
        </div>
      ))}
      <PurpleCard label="Weighted ARV Estimate" value={fmt(weightedARV)} sub={`Simple Avg: ${fmt(avgARV)}`}/>
    </div>}
    {/* main grid */}
    <div style={{overflowX:"auto",borderRadius:12,border:"1px solid #2a3044"}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:960}}>
        <thead>
          <tr style={{background:"#1a1f2e"}}>
            <th style={{padding:"12px 14px",textAlign:"left",fontSize:11,color:"#8892a4",fontFamily:"monospace",borderBottom:"2px solid #2a3044",minWidth:220,position:"sticky",left:0,background:"#1a1f2e",zIndex:2}}>LINE ITEMS</th>
            <th style={{padding:"12px 14px",textAlign:"left",fontSize:11,color:"#6366F1",fontFamily:"monospace",borderBottom:"2px solid #2a3044",minWidth:180,background:"#131929"}}>SUBJECT PROPERTY</th>
            {comps.map((_,i)=><th key={i} style={{padding:"12px 14px",textAlign:"left",fontSize:11,color:"#10B981",fontFamily:"monospace",borderBottom:"2px solid #2a3044",minWidth:250}}>COMP #{i+1}</th>)}
          </tr>
          <tr style={{background:"#15192a"}}>
            <td style={{...cs(false),fontWeight:700,color:"#6B7280",fontSize:11,fontFamily:"monospace",position:"sticky",left:0,background:"#15192a",zIndex:1}}>ADDRESS</td>
            <td style={cs(true)}>
              <input value={subject.address||address} onChange={e=>{setSub("address")(e.target.value); onAddressChange&&onAddressChange(e.target.value);}} placeholder="Auto-filled from address bar"
                style={{background:"transparent",border:"none",outline:"none",color:"#6366F1",fontSize:13,width:"100%",fontFamily:"monospace",fontWeight:600}}/>
            </td>
            {comps.map((c,i)=><td key={i} style={cs(false)}>
              <input value={c.address} onChange={e=>setComp(i,"address")(e.target.value)} placeholder="Comp address…"
                style={{background:"transparent",border:"none",outline:"none",color:"#10B981",fontSize:13,width:"100%",fontFamily:"monospace"}}/>
            </td>)}
          </tr>
        </thead>
        <tbody>
          {LINE_ITEMS.map((line,ri)=>(
            <tr key={line.key} style={{background:ri%2===0?"#0d1117":"#10131c",borderBottom:"1px solid #1e2533"}}>
              <td style={{...cs(false),fontWeight:600,color:"#94a3b8",fontSize:12,position:"sticky",left:0,background:ri%2===0?"#0d1117":"#10131c",zIndex:1,borderRight:"1px solid #1e2533"}}>{line.label}</td>
              <td style={cs(true)}>{renderSubjCell(line)}</td>
              {comps.map((comp,ci)=><td key={ci} style={cs(false)}>{renderCompCell(line,ci,comp)}</td>)}
            </tr>
          ))}
          <tr style={{background:"#1a1f2e",borderTop:"2px solid #6366F1"}}>
            <td style={{...cs(false),fontWeight:800,color:"#6366F1",fontSize:12,fontFamily:"monospace",position:"sticky",left:0,background:"#1a1f2e",zIndex:1}}>POST ADJUSTMENT ARV</td>
            <td style={cs(true)}><span style={{color:"#6B7280",fontSize:12,fontFamily:"monospace"}}>Subject Property</span></td>
            {comps.map((_,ci)=><td key={ci} style={{...cs(false),background:"#1a2238"}}>
              <div style={{fontSize:18,fontWeight:800,color:compResults[ci].postAdj>0?"#10B981":"#4B5563",fontFamily:"monospace"}}>{compResults[ci].postAdj>0?fmt(compResults[ci].postAdj):"—"}</div>
              {compResults[ci].postAdj>0&&<div style={{fontSize:10,color:"#6B7280",fontFamily:"monospace"}}>adj: {compResults[ci].totalAdj>=0?"+":""}{fmt(compResults[ci].totalAdj)}</div>}
            </td>)}
          </tr>
        </tbody>
      </table>
    </div>
    <div style={{fontSize:11,color:"#4B5563",fontFamily:"monospace",textAlign:"center"}}>Worse = inferior comp → ADD (+) · Better = superior comp → SUBTRACT (−) · Per NAR PSA / USPAP</div>
  </div>);
}
// ─── DEALS & PIPELINE (combined Offer Tracker + Pipeline) ─────────────────────
const INIT_DEALS = [
  {id:1,address:"1842 Maple St, Charlotte NC",offerDate:"2026-02-14",offerPrice:185000,askingPrice:220000,arv:310000,rehab:45000,stage:"Countered",followUp:"2026-03-10",closeDate:"",assignFee:0,notes:"Motivated seller, estate sale"},
  {id:2,address:"934 Birchwood Ave, Raleigh NC",offerDate:"2026-02-28",offerPrice:97000,askingPrice:115000,arv:198000,rehab:28000,stage:"Due Diligence",followUp:"2026-03-15",closeDate:"2026-04-01",assignFee:12000,notes:"Water damage in basement"},
  {id:3,address:"271 Elm Terrace, Durham NC",offerDate:"2026-03-01",offerPrice:142000,askingPrice:159000,arv:255000,rehab:35000,stage:"Offer Sent",followUp:"2026-03-12",closeDate:"",assignFee:0,notes:""},
  {id:4,address:"77 Pecan Lane, Cary NC",offerDate:"2026-02-10",offerPrice:265000,askingPrice:280000,arv:410000,rehab:60000,stage:"Title Search",followUp:"2026-04-05",closeDate:"2026-04-15",assignFee:18000,notes:"Clear to close soon"},
];
function DealsAndPipeline({address,dealData}){
  const [deals,setDeals]=useState(INIT_DEALS);
  const [filter,setFilter]=useState("All");
  const [adding,setAdding]=useState(false);
  const [expanded,setExpanded]=useState(null);
  const [form,setForm]=useState({address:"",offerPrice:"",askingPrice:"",arv:"",rehab:"",offerDate:"",followUp:"",closeDate:"",stage:"Lead",assignFee:"",notes:""});
  const addDeal=()=>{
    setDeals(d=>[...d,{...form,id:Date.now(),offerPrice:+form.offerPrice,askingPrice:+form.askingPrice,arv:+form.arv,rehab:+form.rehab,assignFee:+form.assignFee}]);
    setForm({address:"",offerPrice:"",askingPrice:"",arv:"",rehab:"",offerDate:"",followUp:"",closeDate:"",stage:"Lead",assignFee:"",notes:""});
    setAdding(false);
  };
  const updateDeal=(id,key,val)=>setDeals(ds=>ds.map(d=>d.id===id?{...d,[key]:val}:d));
  const movePipeline=(id,stage)=>setDeals(ds=>ds.map(d=>d.id===id?{...d,stage}:d));
  const filtered=filter==="All"?deals:deals.filter(d=>d.stage===filter);
  // Summary stats
  const activePipeline=deals.filter(d=>d.stage!=="Dead"&&d.stage!=="Closed");
  const closedDeals=deals.filter(d=>d.stage==="Closed");
  const totalPotentialProfit=activePipeline.reduce((a,d)=>{
    const profit=d.assignFee>0?d.assignFee:(d.arv-d.offerPrice-d.rehab);
    return a+(profit>0?profit:0);
  },0);
  return(<div style={{display:"flex",flexDirection:"column",gap:20}}>
    {/* Summary */}
    <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
      <Card label="Active Deals" value={activePipeline.length} color="#6366F1"/>
      <GreenCard label="Potential Profit" value={fmt(totalPotentialProfit)} sub="Active pipeline"/>
      <Card label="Closed" value={closedDeals.length} color="#059669"/>
      <Card label="Total Tracked" value={deals.length} color="#8892a4"/>
    </div>
    {/* Stage filter pills */}
    <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
      <span style={{fontSize:11,color:"#6B7280",fontFamily:"monospace",marginRight:4}}>FILTER:</span>
      {["All",...STAGES].map(s=>{
        const count=s==="All"?deals.length:deals.filter(d=>d.stage===s).length;
        const active=filter===s;
        const color=s==="All"?"#6366F1":(STAGE_COLORS[s]||"#6B7280");
        return(<button key={s} onClick={()=>setFilter(s)} style={{background:active?color+"33":"transparent",border:`1px solid ${active?color:"#2a3044"}`,borderRadius:20,color:active?color:"#6B7280",padding:"4px 12px",fontSize:11,fontWeight:active?700:500,cursor:"pointer",fontFamily:"monospace"}}>
          {s} {count>0&&<span style={{opacity:0.7}}>({count})</span>}
        </button>);
      })}
    </div>
    {/* Add deal */}
    <div style={{display:"flex",justifyContent:"flex-end"}}>
      <button onClick={()=>setAdding(a=>!a)} style={{background:"#6366F1",border:"none",borderRadius:8,color:"#fff",padding:"9px 20px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{adding?"✕ Cancel":"+ New Deal"}</button>
    </div>
    {adding&&<div style={{background:"#1a1f2e",border:"1px solid #6366F1",borderRadius:12,padding:20}}>
      <div style={{fontSize:13,color:"#6366F1",fontFamily:"monospace",marginBottom:14,fontWeight:700}}>▸ ADD NEW DEAL</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:10}}>
        <div style={{gridColumn:"1/-1"}}>
          <Field label="Property Address" value={form.address} onChange={v=>setForm(f=>({...f,address:v}))} placeholder={address||"123 Main St, City, NC"} highlight={!!address}/>
        </div>
        <Field label="Asking Price" value={form.askingPrice} onChange={v=>setForm(f=>({...f,askingPrice:v}))} prefix="$"/>
        <Field label="Offer Price" value={form.offerPrice} onChange={v=>setForm(f=>({...f,offerPrice:v}))} prefix="$"/>
        <Field label="ARV" value={form.arv} onChange={v=>setForm(f=>({...f,arv:v}))} prefix="$"/>
        <Field label="Rehab Est." value={form.rehab} onChange={v=>setForm(f=>({...f,rehab:v}))} prefix="$"/>
        <Field label="Assign Fee (if wholesale)" value={form.assignFee} onChange={v=>setForm(f=>({...f,assignFee:v}))} prefix="$"/>
        <Sel label="Pipeline Stage" value={form.stage} onChange={v=>setForm(f=>({...f,stage:v}))} options={STAGES} color={STAGE_COLORS[form.stage]}/>
        <Field label="Offer Date" value={form.offerDate} onChange={v=>setForm(f=>({...f,offerDate:v}))} type="date"/>
        <Field label="Follow-Up Date" value={form.followUp} onChange={v=>setForm(f=>({...f,followUp:v}))} type="date"/>
        <Field label="Target Close Date" value={form.closeDate} onChange={v=>setForm(f=>({...f,closeDate:v}))} type="date"/>
        <div style={{gridColumn:"1/-1"}}>
          <Field label="Notes" value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} placeholder="Deal notes…"/>
        </div>
      </div>
      <button onClick={addDeal} style={{marginTop:14,background:"#10B981",border:"none",borderRadius:8,color:"#fff",padding:"10px 24px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Save Deal</button>
    </div>}
    {/* Deal cards */}
    {filtered.map(deal=>{
      const isExp=expanded===deal.id;
      const profit=deal.assignFee>0?deal.assignFee:(deal.arv-deal.offerPrice-deal.rehab);
      const disc=deal.askingPrice>0?((1-deal.offerPrice/deal.askingPrice)*100):0;
      const toArv=deal.arv>0?(deal.offerPrice/deal.arv*100):0;
      const sc=STAGE_COLORS[deal.stage]||"#6B7280";
      const stageIdx=STAGES.indexOf(deal.stage);
      return(<div key={deal.id} style={{background:"#1a1f2e",border:`1px solid ${sc}55`,borderRadius:12,overflow:"hidden"}}>
        {/* Header */}
        <div style={{padding:"14px 18px",borderBottom:isExp?"1px solid #2a3044":"none",cursor:"pointer"}} onClick={()=>setExpanded(isExp?null:deal.id)}>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:"#e2e8f0"}}>{deal.address}</div>
              <div style={{fontSize:11,color:"#6B7280",marginTop:2}}>Offered {deal.offerDate}{deal.followUp?` · Follow-up ${deal.followUp}`:""}{deal.closeDate?` · Close ${deal.closeDate}`:""}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{background:sc+"22",border:`1px solid ${sc}`,borderRadius:20,padding:"4px 14px",fontSize:12,color:sc,fontWeight:800}}>{deal.stage}</div>
              <div style={{color:"#4B5563",fontSize:14}}>{isExp?"▲":"▼"}</div>
            </div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:14,marginTop:10}}>
            {[["ASKING",fmt(deal.askingPrice),"#94a3b8"],["OFFER",fmt(deal.offerPrice),"#6366F1"],["ARV",fmt(deal.arv),"#10B981"],["REHAB",fmt(deal.rehab),"#F97316"],["PROFIT/SPREAD",fmt(profit),profit>0?"#10B981":"#EF4444"],["DISC.",pct(disc),"#F59E0B"],["OFFER/ARV",pct(toArv),toArv<75?"#10B981":"#EF4444"]].map(([lbl,val,c])=>(
              <div key={lbl}><div style={{fontSize:9,color:"#6B7280",fontFamily:"monospace"}}>{lbl}</div><div style={{fontWeight:700,color:c,fontSize:13}}>{val}</div></div>
            ))}
          </div>
        </div>
        {/* Expanded details */}
        {isExp&&<div style={{padding:"16px 18px",display:"flex",flexDirection:"column",gap:16}}>
          {/* Pipeline progress */}
          <div>
            <div style={{fontSize:10,color:"#8892a4",fontFamily:"monospace",textTransform:"uppercase",marginBottom:8}}>Move Pipeline Stage</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {STAGES.map((s,i)=>{
                const past=i<=stageIdx;
                const c2=STAGE_COLORS[s]||"#6B7280";
                return(<button key={s} onClick={()=>movePipeline(deal.id,s)} style={{flex:"1 1 80px",padding:"5px 6px",fontSize:10,fontWeight:past?700:400,borderRadius:6,cursor:"pointer",border:`1px solid ${past?c2:"#2a3044"}`,background:past?c2+"33":"transparent",color:past?c2:"#4B5563"}}>{s}</button>);
              })}
            </div>
          </div>
          {/* Edit fields */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
            <Field label="Offer Price" value={String(deal.offerPrice)} onChange={v=>updateDeal(deal.id,"offerPrice",+v)} prefix="$" small/>
            <Field label="ARV" value={String(deal.arv)} onChange={v=>updateDeal(deal.id,"arv",+v)} prefix="$" small/>
            <Field label="Rehab" value={String(deal.rehab)} onChange={v=>updateDeal(deal.id,"rehab",+v)} prefix="$" small/>
            <Field label="Assign Fee" value={String(deal.assignFee)} onChange={v=>updateDeal(deal.id,"assignFee",+v)} prefix="$" small/>
            <Field label="Follow-Up" value={deal.followUp} onChange={v=>updateDeal(deal.id,"followUp",v)} type="date" small/>
            <Field label="Close Date" value={deal.closeDate||""} onChange={v=>updateDeal(deal.id,"closeDate",v)} type="date" small/>
          </div>
          <div>
            <label style={{fontSize:10,color:"#8892a4",fontFamily:"monospace",textTransform:"uppercase"}}>Notes</label>
            <textarea value={deal.notes||""} onChange={e=>updateDeal(deal.id,"notes",e.target.value)} rows={2}
              style={{width:"100%",background:"#0d1117",border:"1px solid #2a3044",borderRadius:7,color:"#e2e8f0",padding:"8px 12px",fontSize:13,outline:"none",resize:"none",marginTop:4,boxSizing:"border-box"}}/>
          </div>
        </div>}
      </div>);
    })}
    {filtered.length===0&&<div style={{textAlign:"center",color:"#4B5563",padding:"40px 0",fontFamily:"monospace",fontSize:13}}>No deals in "{filter}" stage</div>}
  </div>);
}
// ─── LENDER TAB ───────────────────────────────────────────────────────────────
function LenderTab({address,dealData,onAddressChange}){
  const [l,setL]=useState({
    lenderName:"",lenderContact:"",lenderPhone:"",lenderEmail:"",loanType:"Hard Money",
    purchasePrice:"",loanAmount:"",ltv:"",ltarv:"",downPayment:"",
    interestRate:"",loanTerm:"12",points:"",originationFee:"",
    monthlyPayment:"",balloonPayment:"",prepayPenalty:"No",
    closingCosts:"",inspectionFee:"",appraisalFee:"",titleFee:"",recordingFee:"",otherFees:"",
    drawSchedule:"",rehab:"",arv:"",exitStrategy:"Fix & Flip",
    notes:"",
  });
  const s=k=>v=>setL(x=>({...x,[k]:v}));
  const pp=num(l.purchasePrice)||num(dealData.purchasePrice);
  const loan=num(l.loanAmount);
  const rate=num(l.interestRate);
  const term=num(l.loanTerm)||12;
  const pts=num(l.points);
  const arv=num(l.arv)||num(dealData.arv);
  const rehab=num(l.rehab)||num(dealData.rehabCost);
  // Calcs
  const calcLTV=pp>0&&loan>0?((loan/pp)*100):0;
  const calcLTARV=arv>0&&loan>0?((loan/arv)*100):0;
  const pointsDollar=loan>0?(loan*(pts/100)):0;
  const monthlyInterest=loan>0&&rate>0?(loan*(rate/100)/12):0;
  const totalInterest=monthlyInterest*term;
  const totalClosing=num(l.closingCosts)+num(l.inspectionFee)+num(l.appraisalFee)+num(l.titleFee)+num(l.recordingFee)+num(l.otherFees);
  const totalLenderCost=pointsDollar+totalInterest+totalClosing+num(l.originationFee);
  const downPmt=pp-loan;
  // Projected profit
  const grossProfit=arv-pp-rehab;
  const netProfit=grossProfit-totalLenderCost;
  const totalCashIn=downPmt+rehab+totalLenderCost;
  const cocROI=totalCashIn>0?(netProfit/totalCashIn)*100:0;
  const loanTypes=["Hard Money","Private Money","Conventional","Bridge Loan","DSCR","Portfolio Loan","Seller Finance","Cash"];
  return(<div style={{display:"flex",flexDirection:"column",gap:22}}>
    <AddressBar address={address} onChange={onAddressChange||(() => {})}/>
    {/* Address auto-carry notice */}
    {address&&<div style={{background:"#1a2e1a",border:"1px solid #10B981",borderRadius:8,padding:"10px 16px",fontSize:13,color:"#10B981"}}>
      📍 Loan tied to: <strong>{address}</strong>
    </div>}
    {/* Quick calc summary */}
    {(loan>0||arv>0)&&<div>
      <SH color="#10B981">Loan Cost Summary</SH>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
        <Card label="LTV" value={pct(calcLTV)} sub="Loan to Value" color={calcLTV<75?"#10B981":"#EF4444"}/>
        <Card label="LT-ARV" value={pct(calcLTARV)} sub="Loan to ARV" color={calcLTARV<65?"#10B981":"#F59E0B"}/>
        <Card label="Points Cost" value={fmt(pointsDollar)} color="#6366F1"/>
        <Card label="Monthly Interest" value={fmt(monthlyInterest)} sub={`${term}mo term`} color="#F59E0B"/>
        <Card label="Total Interest" value={fmt(totalInterest)} sub={`${term} months`} color="#F97316"/>
        <Card label="Total Closing Costs" value={fmt(totalClosing)} color="#8B5CF6"/>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        <RedCard label="Total Lender Cost" value={fmt(totalLenderCost)} sub="Points + Interest + Fees"/>
        <Card label="Down Payment" value={fmt(downPmt)} sub="Purchase − Loan" color="#94a3b8"/>
        {netProfit>0?<GreenCard label="Net Profit (after lender)" value={fmt(netProfit)} sub={`Gross: ${fmt(grossProfit)}`}/>:<RedCard label="Net Profit (after lender)" value={fmt(netProfit)} sub={`Gross: ${fmt(grossProfit)}`}/>}
        <Card label="Cash-on-Cash ROI" value={pct(cocROI)} sub="Net ÷ Total Cash In" color={cocROI>15?"#10B981":"#F59E0B"}/>
      </div>
    </div>}
    {/* Lender Info */}
    <div><SH>Lender Information</SH>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:10}}>
        <Field label="Lender / Company Name" value={l.lenderName} onChange={s("lenderName")} placeholder="ABC Hard Money LLC"/>
        <Field label="Contact Name" value={l.lenderContact} onChange={s("lenderContact")} placeholder="John Smith"/>
        <Field label="Phone" value={l.lenderPhone} onChange={s("lenderPhone")} placeholder="(555) 000-0000"/>
        <Field label="Email" value={l.lenderEmail} onChange={s("lenderEmail")} placeholder="john@lender.com" type="email"/>
        <Sel label="Loan Type" value={l.loanType} onChange={s("loanType")} options={loanTypes}/>
        <Sel label="Exit Strategy" value={l.exitStrategy} onChange={s("exitStrategy")} options={["Fix & Flip","Wholesale","BRRRR","Hold/Rental","STR","ADU"]}/>
      </div>
    </div>
    {/* Loan Terms */}
    <div><SH color="#F59E0B">Loan Terms</SH>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:10}}>
        <Field label="Purchase Price" value={l.purchasePrice||String(dealData.purchasePrice||"")} onChange={s("purchasePrice")} prefix="$" placeholder="Auto from Deal Analyzer"/>
        <Field label="Loan Amount" value={l.loanAmount} onChange={s("loanAmount")} prefix="$"/>
        <Field label="LTV %" value={calcLTV>0?calcLTV.toFixed(1)+"%":l.ltv} onChange={s("ltv")} suffix="%" readOnly={calcLTV>0}/>
        <Field label="LT-ARV %" value={calcLTARV>0?calcLTARV.toFixed(1)+"%":l.ltarv} onChange={s("ltarv")} suffix="%" readOnly={calcLTARV>0}/>
        <Field label="ARV" value={l.arv||String(dealData.arv||"")} onChange={s("arv")} prefix="$" placeholder="Auto from Deal Analyzer"/>
        <Field label="Rehab Budget" value={l.rehab||String(dealData.rehabCost||"")} onChange={s("rehab")} prefix="$" placeholder="Auto from Deal Analyzer"/>
        <Field label="Interest Rate" value={l.interestRate} onChange={s("interestRate")} suffix="% / yr"/>
        <Field label="Loan Term" value={l.loanTerm} onChange={s("loanTerm")} suffix="months"/>
        <Field label="Points" value={l.points} onChange={s("points")} suffix="pts"/>
        <Field label="Monthly Payment" value={l.monthlyPayment||fmt(monthlyInterest).replace("$","")} onChange={s("monthlyPayment")} prefix="$" placeholder={monthlyInterest>0?fmt(monthlyInterest):""}/>
        <Field label="Balloon Payment" value={l.balloonPayment} onChange={s("balloonPayment")} prefix="$"/>
        <Sel label="Prepay Penalty" value={l.prepayPenalty} onChange={s("prepayPenalty")} options={["No","Yes - 3 months","Yes - 6 months","Yes - 1 year","Yes - Other"]}/>
        <Field label="Origination Fee" value={l.originationFee} onChange={s("originationFee")} prefix="$"/>
      </div>
    </div>
    {/* Closing Costs */}
    <div><SH color="#8B5CF6">Closing Costs Breakdown</SH>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:10}}>
        <Field label="Total Closing Costs" value={l.closingCosts} onChange={s("closingCosts")} prefix="$"/>
        <Field label="Inspection Fee" value={l.inspectionFee} onChange={s("inspectionFee")} prefix="$"/>
        <Field label="Appraisal Fee" value={l.appraisalFee} onChange={s("appraisalFee")} prefix="$"/>
        <Field label="Title / Attorney Fee" value={l.titleFee} onChange={s("titleFee")} prefix="$"/>
        <Field label="Recording Fee" value={l.recordingFee} onChange={s("recordingFee")} prefix="$"/>
        <Field label="Other Fees" value={l.otherFees} onChange={s("otherFees")} prefix="$"/>
      </div>
    </div>
    {/* Draw Schedule */}
    <div><SH color="#14B8A6">Rehab Draw Schedule</SH>
      <textarea value={l.drawSchedule} onChange={e=>s("drawSchedule")(e.target.value)} placeholder="Draw 1: Foundation/Demo — $15,000&#10;Draw 2: Framing/Roof — $20,000&#10;Draw 3: Mechanicals — $18,000&#10;Draw 4: Drywall/Finishes — $12,000&#10;Draw 5: Final/Punch — $10,000" rows={5}
        style={{width:"100%",background:"#1a1f2e",border:"1px solid #2a3044",borderRadius:8,color:"#e2e8f0",padding:12,fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"monospace"}}/>
    </div>
    {/* Notes */}
    <div><SH>Loan Notes</SH>
      <textarea value={l.notes} onChange={e=>s("notes")(e.target.value)} placeholder="Special conditions, extension options, personal guarantee required…" rows={3}
        style={{width:"100%",background:"#1a1f2e",border:"1px solid #2a3044",borderRadius:8,color:"#e2e8f0",padding:12,fontSize:14,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
    </div>
  </div>);
}
// ─── MARKET INTEL ─────────────────────────────────────────────────────────────
function MarketIntel({dealData}){
  const [proj,setProj]=useState({
    purchasePrice:dealData.purchasePrice||"",
    arv:dealData.arv||"",
    rehab:dealData.rehabCost||"",
    lenderPoints:"",
    lenderInterest:"",
    lenderFees:"",
    holdingMonths:"6",
    holdingCostPerMonth:"",
    agentCommission:"6",
    sellingCosts:"",
    assignFee:"",
    projType:"fix-flip",
  });
  const s=k=>v=>setProj(p=>({...p,[k]:v}));
  // Sync from deal analyzer
  useEffect(()=>{
    setProj(p=>({...p,
      purchasePrice:dealData.purchasePrice||p.purchasePrice,
      arv:dealData.arv||p.arv,
      rehab:dealData.rehabCost||p.rehab,
    }));
  },[dealData.purchasePrice,dealData.arv,dealData.rehabCost]);
  const pp=num(proj.purchasePrice),arv=num(proj.arv),rehab=num(proj.rehab);
  const points=num(proj.lenderPoints),interest=num(proj.lenderInterest),fees=num(proj.lenderFees);
  const holdMos=num(proj.holdingMonths),holdMo=num(proj.holdingCostPerMonth);
  const commPct=num(proj.agentCommission),sellingCosts=num(proj.sellingCosts);
  const assignFee=num(proj.assignFee);
  const totalLenderExpense=points+interest+fees;
  const holdingTotal=holdMo*holdMos;
  const agentComm=arv>0?(arv*(commPct/100)):0;
  const totalSelling=agentComm+sellingCosts;
  const totalExpenses=pp+rehab+totalLenderExpense+holdingTotal+totalSelling;
  const grossProfit=arv-pp-rehab;
  const netProfit=arv-totalExpenses;
  const roi=pp>0?(netProfit/pp)*100:0;
  const totalCashIn=pp+rehab+totalLenderExpense;
  const cocROI=totalCashIn>0?(netProfit/totalCashIn)*100:0;
  const wholesaleProfit=assignFee>0?assignFee:(arv*0.75-rehab-pp);
  const projTypes=[["fix-flip","Fix & Flip"],["wholesale","Wholesale"],["brrr","BRRRR"],["str","STR/Rental"]];
  return(<div style={{display:"flex",flexDirection:"column",gap:22}}>
    {/* Proj Profit Calculator */}
    <div><SH color="#10B981">Projected Profit Calculator</SH>
      <div style={{background:"#1a1f2e",border:"1px solid #10B98133",borderRadius:10,padding:16,marginBottom:16}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
          {projTypes.map(([val,label])=>(
            <button key={val} onClick={()=>s("projType")(val)} style={{background:proj.projType===val?"#10B981":"transparent",border:`1px solid ${proj.projType===val?"#10B981":"#2a3044"}`,borderRadius:8,color:proj.projType===val?"#fff":"#6B7280",padding:"6px 16px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
              {label}
            </button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:10}}>
          <Field label="Purchase Price (from analyzer)" value={proj.purchasePrice} onChange={s("purchasePrice")} prefix="$"/>
          <Field label="ARV (from analyzer)" value={proj.arv} onChange={s("arv")} prefix="$"/>
          <Field label="Rehab Cost (from analyzer)" value={proj.rehab} onChange={s("rehab")} prefix="$"/>
          <Field label="Lender Points / Fees ($)" value={proj.lenderPoints} onChange={s("lenderPoints")} prefix="$"/>
          <Field label="Total Interest Paid ($)" value={proj.lenderInterest} onChange={s("lenderInterest")} prefix="$"/>
          <Field label="Other Lender Expenses" value={proj.lenderFees} onChange={s("lenderFees")} prefix="$"/>
          <Field label="Holding Period" value={proj.holdingMonths} onChange={s("holdingMonths")} suffix="months"/>
          <Field label="Monthly Holding Cost" value={proj.holdingCostPerMonth} onChange={s("holdingCostPerMonth")} prefix="$" placeholder="Insurance, taxes, utilities"/>
          <Field label="Agent Commission" value={proj.agentCommission} onChange={s("agentCommission")} suffix="%"/>
          <Field label="Other Selling Costs" value={proj.sellingCosts} onChange={s("sellingCosts")} prefix="$" placeholder="Staging, repairs, etc."/>
          {proj.projType==="wholesale"&&<Field label="Assignment Fee" value={proj.assignFee} onChange={s("assignFee")} prefix="$"/>}
        </div>
      </div>
      {/* Profit Waterfall */}
      {(arv>0||pp>0)&&<div>
        <div style={{fontSize:11,color:"#6B7280",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Profit Waterfall</div>
        <div style={{background:"#0d1117",border:"1px solid #2a3044",borderRadius:10,padding:16,display:"flex",flexDirection:"column",gap:8}}>
          {[
            ["ARV (Sale Price)",arv,"#10B981",false],
            ["− Purchase Price",-pp,"#EF4444",false],
            ["− Rehab Cost",-rehab,"#F97316",false],
            ["− Total Lender Expense",-totalLenderExpense,"#8B5CF6",false],
            ["− Holding Costs",-holdingTotal,"#F59E0B",false],
            ["− Selling Costs (agent + other)",-totalSelling,"#6366F1",false],
          ].map(([lbl,val,c])=>{
            const bar=arv>0?Math.abs(val/arv)*100:0;
            return(<div key={lbl} style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:12,color:"#94a3b8",width:240,flexShrink:0}}>{lbl}</div>
              <div style={{flex:1,background:"#1a1f2e",borderRadius:4,height:14,overflow:"hidden"}}>
                <div style={{width:`${Math.min(bar,100)}%`,height:"100%",background:c,borderRadius:4}}/>
              </div>
              <div style={{fontSize:13,fontWeight:700,color:val>=0?c:"#EF4444",width:90,textAlign:"right",fontFamily:"monospace"}}>{val>=0?"+":""}{fmt(val)}</div>
            </div>);
          })}
          <div style={{borderTop:"1px solid #2a3044",paddingTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:13,color:"#e2e8f0",fontWeight:700}}>= Net Profit</div>
            <div style={{fontSize:22,fontWeight:800,color:netProfit>=0?"#10B981":"#EF4444",fontFamily:"monospace"}}>{fmt(netProfit)}</div>
          </div>
        </div>
        {/* Results */}
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:12}}>
          {netProfit>0?<GreenCard label="Net Profit" value={fmt(netProfit)} sub="After all expenses"/>:<RedCard label="Net Profit" value={fmt(netProfit)} sub="After all expenses"/>}
          <Card label="Gross Profit" value={fmt(grossProfit)} sub="ARV − Purchase − Rehab" color="#F59E0B"/>
          <Card label="ROI" value={pct(roi)} sub="Net ÷ Purchase Price" color={roi>15?"#10B981":"#F59E0B"}/>
          <Card label="Cash-on-Cash ROI" value={pct(cocROI)} sub="Net ÷ Total Cash In" color={cocROI>15?"#10B981":"#F59E0B"}/>
          {proj.projType==="wholesale"&&<PurpleCard label="Wholesale Profit" value={fmt(wholesaleProfit)} sub="Assignment or 75% Rule"/>}
          <Card label="Total Expenses" value={fmt(totalExpenses)} sub="All costs combined" color="#EF4444"/>
        </div>
      </div>}
    </div>
    {/* Market stats */}
    <div><SH color="#6366F1">Market Overview</SH>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        <Card label="Avg Days on Market" value="12 days" sub="Hot Market 🔥" color="#F59E0B"/>
        <Card label="Avg $/Sqft" value="$165/sqft" color="#6366F1"/>
        <GreenCard label="SP/LP Ratio" value="99.2%" sub="Sale vs List Price"/>
        <Card label="Active Listings" value="142" sub="30-day supply" color="#3B82F6"/>
      </div>
    </div>
  </div>);
}
// ─── ROOT ─────────────────────────────────────────────────────────────────────
const INIT_DEAL = {purchasePrice:"",arv:"",rehabCost:"",sqft:"",aduSqft:"",grossIncome:"",opEx:"",propertyType:"fix-flip",beds:"",baths:"",yearBuilt:"",lotSize:"",notes:""};
export default function App(){
  const [tab,setTab]=useState(0);
  const [address,setAddress]=useState("");
  const [dealData,setDealData]=useState(INIT_DEAL);
  const panels=[
    <DealAnalyzer address={address} onAddressChange={setAddress} dealData={dealData} onDealDataChange={setDealData}/>,
    <CMAGrid address={address} onAddressChange={setAddress}/>,
    <DealsAndPipeline address={address} dealData={dealData}/>,
    <LenderTab address={address} dealData={dealData} onAddressChange={setAddress}/>,
    <MarketIntel dealData={dealData}/>,
  ];
  return(<div style={{minHeight:"100vh",background:"#0d1117",color:"#e2e8f0",fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
    <div style={{background:"#111827",borderBottom:"1px solid #1e2533",padding:"0 20px",position:"sticky",top:0,zIndex:50}}>
      <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,background:"linear-gradient(135deg,#6366F1,#10B981)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⬡</div>
          <span style={{fontWeight:800,fontSize:16}}>DealFlow <span style={{color:"#6366F1"}}>Pro</span></span>
        </div>
        {address&&<div style={{fontSize:12,color:"#6366F1",fontFamily:"monospace",background:"#6366F111",border:"1px solid #6366F133",padding:"4px 12px",borderRadius:20,maxWidth:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📍 {address}</div>}
        <div style={{fontSize:11,color:"#4B5563",fontFamily:"monospace"}}>Wholesale · Invest · Close</div>
      </div>
    </div>
    <div style={{background:"#111827",borderBottom:"1px solid #1e2533",padding:"0 20px",overflowX:"auto"}}>
      <div style={{maxWidth:1200,margin:"0 auto",display:"flex"}}>
        {TABS.map((t,i)=><button key={t} onClick={()=>setTab(i)} style={{background:"transparent",border:"none",borderBottom:tab===i?"2px solid #6366F1":"2px solid transparent",color:tab===i?"#6366F1":"#6B7280",padding:"13px 16px",fontSize:12,fontWeight:tab===i?700:500,cursor:"pointer",fontFamily:"monospace",whiteSpace:"nowrap"}}>{t}</button>)}
      </div>
    </div>
    <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 20px"}}>{panels[tab]}</div>
  </div>);
}
