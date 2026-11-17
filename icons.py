<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RADAR · İkon Stüdyosu</title>
<style>
  :root{
    --void:#05070F; --deep:#0A0F1E; --panel:#0E1526; --panel2:#131C31; --raise:#18233C;
    --line:#1E2A44; --line2:#2A3A5C;
    --ink:#E8EEFB; --mute:#93A6C7; --dim:#5D7095;
    --azure:#3B82F6; --violet:#8B5CF6; --cyan:#22D3EE; --phos:#4ADE80;
    --amber:#F59E0B; --red:#EF4444; --magenta:#EC4899; --sand:#F6E7CE;
    --mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;
    --sans:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    --top:66px;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%}
  body{
    background:var(--void); color:var(--ink); font-family:var(--sans);
    -webkit-font-smoothing:antialiased; overflow:hidden;
  }
  body::before{
    content:""; position:fixed; inset:0; pointer-events:none; z-index:0;
    background:
      radial-gradient(900px 620px at 12% -8%, rgba(59,130,246,.20), transparent 62%),
      radial-gradient(760px 560px at 92% 4%, rgba(139,92,246,.18), transparent 60%),
      radial-gradient(700px 700px at 60% 108%, rgba(34,211,238,.10), transparent 62%);
  }
  body::after{
    content:""; position:fixed; inset:0; pointer-events:none; z-index:1; opacity:.35;
    background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.028) 0 1px,transparent 1px 3px);
    mix-blend-mode:overlay;
  }

  ::-webkit-scrollbar{width:10px;height:10px}
  ::-webkit-scrollbar-track{background:var(--deep);border-left:1px solid var(--line)}
  ::-webkit-scrollbar-thumb{background:linear-gradient(180deg,var(--azure),var(--violet));border-radius:99px;border:2px solid var(--deep)}
  ::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,var(--cyan),var(--magenta))}
  *{scrollbar-width:thin;scrollbar-color:var(--azure) var(--deep)}

  /* ---------- TOP BAR ---------- */
  .top{
    position:fixed; top:0; left:0; right:0; height:var(--top); z-index:60;
    display:flex; align-items:center; gap:16px; padding:0 18px;
    background:linear-gradient(180deg,rgba(10,15,30,.96),rgba(10,15,30,.86));
    border-bottom:1px solid var(--line); backdrop-filter:blur(14px);
  }
  .brand{display:flex;align-items:center;gap:12px;min-width:0}
  .brand-mark{
    width:38px;height:38px;border-radius:12px;flex-shrink:0;position:relative;
    background:conic-gradient(from 140deg,var(--azure),var(--violet),var(--magenta),var(--azure));
    box-shadow:0 0 0 1px rgba(255,255,255,.10),0 8px 24px rgba(59,130,246,.35);
    overflow:hidden;
  }
  .brand-mark::after{
    content:"";position:absolute;inset:0;
    background:radial-gradient(circle at 50% 50%,#fff 0 3px,transparent 4px),
               radial-gradient(circle at 50% 50%,transparent 0 9px,rgba(255,255,255,.75) 9px 10.5px,transparent 11px),
               radial-gradient(circle at 50% 50%,transparent 0 14px,rgba(255,255,255,.45) 14px 15.5px,transparent 16px);
  }
  .brand h1{font-size:16px;font-weight:900;letter-spacing:-.3px;white-space:nowrap}
  .brand p{font-size:11px;color:var(--dim);font-weight:700;letter-spacing:.6px;text-transform:uppercase}
  .top-spacer{flex:1}
  .pill{
    display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 13px;border-radius:99px;
    background:var(--panel2);border:1px solid var(--line2);color:var(--mute);
    font-size:12.5px;font-weight:800;cursor:pointer;font-family:inherit;white-space:nowrap;transition:.16s;
  }
  .pill:hover{border-color:var(--azure);color:var(--ink);transform:translateY(-1px)}
  .pill.on{background:rgba(74,222,128,.12);border-color:rgba(74,222,128,.45);color:var(--phos)}
  .pill.off{background:rgba(239,68,68,.10);border-color:rgba(239,68,68,.35);color:#FCA5A5}
  .cta{
    height:38px;padding:0 18px;border-radius:99px;border:none;cursor:pointer;font-family:inherit;
    font-size:13px;font-weight:900;color:#fff;letter-spacing:.2px;white-space:nowrap;
    background:linear-gradient(100deg,var(--azure),var(--violet) 55%,var(--magenta));
    box-shadow:0 8px 26px rgba(139,92,246,.42);transition:.16s;
  }
  .cta:hover{transform:translateY(-1px);box-shadow:0 12px 32px rgba(236,72,153,.48)}
  .cta:active{transform:translateY(0)}

  /* ---------- SHELL ---------- */
  .shell{
    position:relative;z-index:2;height:calc(100vh - var(--top));margin-top:var(--top);
    display:grid;grid-template-columns:308px minmax(0,1fr) 392px;gap:0;
  }
  .col{overflow-y:auto;overflow-x:hidden;height:100%;min-height:0}
  .rail{background:linear-gradient(180deg,var(--panel),var(--deep));border-right:1px solid var(--line);padding:16px 14px 40px}
  .stage{padding:22px 24px 60px}
  .side{background:linear-gradient(180deg,var(--panel),var(--deep));border-left:1px solid var(--line);padding:0 0 40px}

  /* ---------- RAIL ---------- */
  .grp{margin-bottom:18px;border:1px solid var(--line);border-radius:16px;background:rgba(19,28,49,.55);overflow:hidden}
  .grp-h{
    display:flex;align-items:center;gap:8px;padding:11px 13px;
    background:linear-gradient(90deg,rgba(59,130,246,.16),rgba(139,92,246,.06));
    border-bottom:1px solid var(--line);
    font-size:11px;font-weight:900;letter-spacing:1.1px;text-transform:uppercase;color:var(--cyan);
  }
  .grp-b{padding:12px 13px 14px;display:flex;flex-direction:column;gap:13px}
  .ctl{display:flex;flex-direction:column;gap:7px}
  .ctl-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
  .ctl-h label{font-size:12.5px;font-weight:700;color:var(--mute)}
  .val{font-family:var(--mono);font-size:11.5px;font-weight:700;color:var(--cyan);background:rgba(34,211,238,.09);
       border:1px solid rgba(34,211,238,.22);padding:1px 7px;border-radius:6px}
  input[type=range]{
    -webkit-appearance:none;appearance:none;width:100%;height:22px;background:transparent;cursor:pointer;
  }
  input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:99px;
    background:linear-gradient(90deg,var(--azure),var(--violet));border:1px solid var(--line2)}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:17px;height:17px;border-radius:50%;
    background:#fff;margin-top:-6.5px;border:3px solid var(--violet);box-shadow:0 2px 10px rgba(139,92,246,.6);transition:.14s}
  input[type=range]::-webkit-slider-thumb:hover{border-color:var(--cyan);transform:scale(1.14)}
  input[type=range]::-moz-range-track{height:6px;border-radius:99px;background:linear-gradient(90deg,var(--azure),var(--violet))}
  input[type=range]::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:#fff;border:3px solid var(--violet)}
  input[type=range]:disabled{opacity:.35;cursor:not-allowed}
  select,.num{
    width:100%;height:36px;padding:0 11px;border-radius:10px;background:var(--raise);
    border:1px solid var(--line2);color:var(--ink);font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;outline:none;
  }
  select:focus,.num:focus{border-color:var(--azure);box-shadow:0 0 0 3px rgba(59,130,246,.18)}
  .colors{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px}
  .sw{display:flex;flex-direction:column;gap:5px}
  .sw span{font-size:10.5px;font-weight:800;color:var(--dim);letter-spacing:.4px}
  input[type=color]{
    -webkit-appearance:none;appearance:none;width:100%;height:38px;border-radius:11px;
    border:1px solid var(--line2);background:var(--raise);cursor:pointer;padding:3px;
  }
  input[type=color]::-webkit-color-swatch-wrapper{padding:0}
  input[type=color]::-webkit-color-swatch{border:none;border-radius:8px}
  .stepper{display:flex;align-items:center;gap:8px}
  .stepper button{
    width:34px;height:34px;border-radius:10px;border:1px solid var(--line2);background:var(--raise);
    color:var(--ink);font-size:17px;font-weight:900;cursor:pointer;line-height:1;transition:.14s;font-family:inherit;
  }
  .stepper button:hover{border-color:var(--cyan);color:var(--cyan)}
  .stepper .num{text-align:center;flex:1;cursor:default}
  .tgl{display:flex;justify-content:space-between;align-items:center;gap:10px;cursor:pointer;user-select:none}
  .tgl span{font-size:12.5px;font-weight:700;color:var(--mute)}
  .sw-t{width:44px;height:24px;border-radius:99px;background:#243352;border:1px solid var(--line2);position:relative;flex-shrink:0;transition:.2s}
  .sw-t::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:var(--dim);transition:.2s}
  .tgl.on .sw-t{background:linear-gradient(90deg,var(--azure),var(--violet));border-color:transparent}
  .tgl.on .sw-t::after{left:22px;background:#fff}
  .tgl.on span{color:var(--ink)}
  .rail-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:2px}
  .btn{
    height:38px;border-radius:11px;border:1px solid var(--line2);background:var(--raise);color:var(--ink);
    font-family:inherit;font-size:12.5px;font-weight:800;cursor:pointer;transition:.15s;
  }
  .btn:hover{border-color:var(--azure);background:#1C2947;transform:translateY(-1px)}
  .btn.wide{grid-column:1/-1}
  .btn.hot{background:linear-gradient(100deg,rgba(59,130,246,.25),rgba(236,72,153,.22));border-color:rgba(236,72,153,.4)}

  /* ---------- STAGE ---------- */
  .stage-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:16px;flex-wrap:wrap}
  .stage-head h2{font-size:23px;font-weight:900;letter-spacing:-.6px}
  .stage-head p{font-size:12.5px;color:var(--dim);font-weight:600;margin-top:3px}
  .badge-live{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:900;color:var(--phos);
    background:rgba(74,222,128,.10);border:1px solid rgba(74,222,128,.3);padding:5px 11px;border-radius:99px;letter-spacing:.6px}
  .dot-live{width:7px;height:7px;border-radius:50%;background:var(--phos);box-shadow:0 0 0 0 rgba(74,222,128,.6);animation:pulse 2s infinite}
  @keyframes pulse{70%{box-shadow:0 0 0 8px rgba(74,222,128,0)}100%{box-shadow:0 0 0 0 rgba(74,222,128,0)}}

  .preview-wrap{
    position:relative;border-radius:26px;border:1px solid var(--line);overflow:hidden;
    background:
      radial-gradient(700px 420px at 50% 0%,rgba(59,130,246,.14),transparent 65%),
      linear-gradient(180deg,#0B1120,#070C18);
    padding:26px;display:flex;justify-content:center;align-items:center;
  }
  .preview-wrap::before{
    content:"";position:absolute;inset:0;opacity:.5;
    background-image:linear-gradient(rgba(59,130,246,.07) 1px,transparent 1px),
                     linear-gradient(90deg,rgba(59,130,246,.07) 1px,transparent 1px);
    background-size:28px 28px;
    mask-image:radial-gradient(circle at 50% 50%,#000 30%,transparent 78%);
    -webkit-mask-image:radial-gradient(circle at 50% 50%,#000 30%,transparent 78%);
  }
  #preview{
    position:relative;width:min(420px,72vw);height:min(420px,72vw);border-radius:20px;
    filter:drop-shadow(0 26px 54px rgba(0,0,0,.6));
  }
  .stage-meta{
    position:absolute;left:16px;bottom:14px;display:flex;gap:8px;flex-wrap:wrap;font-family:var(--mono);font-size:10.5px;color:var(--dim)
  }
  .stage-meta b{color:var(--cyan);font-weight:700}

  .card{background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:18px;margin-top:18px}
  .card-h{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
  .card-h h3{font-size:13px;font-weight:900;letter-spacing:.9px;text-transform:uppercase;color:var(--mute)}
  .card-h em{font-style:normal;font-size:11px;color:var(--dim);font-weight:700}

  .sizes{display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap}
  .size-item{display:flex;flex-direction:column;align-items:center;gap:7px}
  .size-item canvas{border-radius:8px;background:#0B1120;image-rendering:auto}
  .size-item b{font-family:var(--mono);font-size:10.5px;color:var(--dim);font-weight:700}

  .mocks{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px}
  .mock{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--panel2)}
  .mock-t{font-size:10.5px;font-weight:900;letter-spacing:.7px;text-transform:uppercase;color:var(--dim);padding:9px 12px;border-bottom:1px solid var(--line)}
  .mock-b{padding:14px;display:flex;align-items:center;justify-content:center;min-height:112px}
  .tabbar{width:100%;background:#1B2438;border-radius:9px 9px 0 0;padding:7px 9px;display:flex;align-items:center;gap:8px;border:1px solid var(--line2);border-bottom:none}
  .tabbar canvas{border-radius:4px;flex-shrink:0}
  .tabbar span{font-size:11.5px;font-weight:700;color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tabbar i{margin-left:auto;color:var(--dim);font-style:normal;font-size:12px}
  .tabbody{height:26px;background:#0F1728;border:1px solid var(--line2);border-top:none;border-radius:0 0 9px 9px}
  .home{width:100%;border-radius:12px;padding:16px 10px;display:flex;flex-direction:column;align-items:center;gap:8px}
  .home.light{background:linear-gradient(150deg,#F6E7CE,#E9D5FF 60%,#BFDBFE)}
  .home.dark{background:linear-gradient(150deg,#0B1120,#1E1B4B 65%,#082F49)}
  .home canvas{border-radius:14px;box-shadow:0 8px 20px rgba(0,0,0,.35)}
  .home b{font-size:11px;font-weight:700}
  .home.light b{color:#1F2937}
  .home.dark b{color:#E8EEFB}
  .circle-mask{width:84px;height:84px;border-radius:50%;overflow:hidden;box-shadow:0 8px 22px rgba(0,0,0,.45)}
  .circle-mask canvas{display:block}

  .outs{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:13px}
  .out{border:1px solid var(--line);border-radius:15px;background:var(--panel2);padding:12px;display:flex;flex-direction:column;gap:9px;transition:.16s}
  .out:hover{border-color:var(--azure);transform:translateY(-2px)}
  .out-img{width:100%;aspect-ratio:1;border-radius:11px;background:
    conic-gradient(from 45deg,#131C31 0 25%,#0E1526 0 50%,#131C31 0 75%,#0E1526 0) 0 0/16px 16px;
    display:flex;align-items:center;justify-content:center;overflow:hidden}
  .out-img img{width:100%;height:100%;object-fit:contain;display:block}
  .out-name{font-family:var(--mono);font-size:10.5px;color:var(--ink);font-weight:700;word-break:break-all;line-height:1.35}
  .out-sub{font-size:10px;color:var(--dim);font-weight:700}
  .out button{height:32px;border-radius:9px;border:1px solid var(--line2);background:var(--raise);color:var(--ink);
    font-family:inherit;font-size:11.5px;font-weight:800;cursor:pointer;transition:.14s}
  .out button:hover{background:linear-gradient(100deg,var(--azure),var(--violet));border-color:transparent;color:#fff}
  .hint{font-size:11.5px;color:var(--dim);line-height:1.6;margin-top:12px;background:rgba(245,158,11,.07);
    border:1px dashed rgba(245,158,11,.35);border-radius:12px;padding:11px 13px}
  .hint b{color:var(--amber)}

  /* ---------- SIDE ---------- */
  .tabs{display:flex;position:sticky;top:0;z-index:5;background:var(--panel);border-bottom:1px solid var(--line)}
  .tab{flex:1;padding:14px 6px;background:none;border:none;border-bottom:2px solid transparent;color:var(--dim);
    font-family:inherit;font-size:12px;font-weight:900;cursor:pointer;transition:.15s;letter-spacing:.3px}
  .tab:hover{color:var(--mute);background:rgba(59,130,246,.05)}
  .tab.on{color:var(--ink);border-bottom-color:var(--cyan);background:linear-gradient(180deg,rgba(34,211,238,.10),transparent)}
  .pane{display:none;padding:18px 16px}
  .pane.on{display:block}
  .step{display:flex;gap:12px;margin-bottom:15px}
  .step-n{width:26px;height:26px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
    font-size:12px;font-weight:900;color:#fff;background:linear-gradient(135deg,var(--azure),var(--violet))}
  .step-c h4{font-size:13.5px;font-weight:800;margin-bottom:4px}
  .step-c p{font-size:12.5px;color:var(--mute);line-height:1.6}
  .step-c code{font-family:var(--mono);font-size:11.5px;background:rgba(34,211,238,.10);color:var(--cyan);
    padding:1px 6px;border-radius:5px;border:1px solid rgba(34,211,238,.2)}
  .tree{font-family:var(--mono);font-size:11.5px;line-height:1.85;background:var(--deep);border:1px solid var(--line);
    border-radius:13px;padding:13px 14px;color:var(--mute);overflow-x:auto;margin:4px 0 14px}
  .tree .hit{color:var(--phos);font-weight:700}
  .tree .fold{color:var(--azure)}
  .tree .note{color:var(--dim)}
  .linkbtn{display:flex;align-items:center;justify-content:center;gap:8px;height:42px;border-radius:12px;
    background:linear-gradient(100deg,rgba(59,130,246,.2),rgba(139,92,246,.2));border:1px solid rgba(139,92,246,.45);
    color:var(--ink);text-decoration:none;font-size:12.5px;font-weight:800;margin-bottom:10px;transition:.15s}
  .linkbtn:hover{border-color:var(--cyan);transform:translateY(-1px)}
  .codeblock{position:relative;margin-bottom:14px}
  .codeblock textarea{
    width:100%;min-height:132px;resize:vertical;background:var(--deep);border:1px solid var(--line);border-radius:13px;
    color:#CFE3FF;font-family:var(--mono);font-size:11.5px;line-height:1.65;padding:13px 13px;outline:none;
  }
  .codeblock textarea:focus{border-color:var(--azure)}
  .code-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px}
  .code-h b{font-size:11px;font-weight:900;letter-spacing:.7px;text-transform:uppercase;color:var(--mute)}
  .copy{height:28px;padding:0 12px;border-radius:8px;border:1px solid var(--line2);background:var(--raise);
    color:var(--cyan);font-family:inherit;font-size:11px;font-weight:800;cursor:pointer;transition:.14s}
  .copy:hover{background:rgba(34,211,238,.14);border-color:var(--cyan)}
  details.faq{border:1px solid var(--line);border-radius:12px;margin-bottom:9px;background:var(--panel2);overflow:hidden}
  details.faq summary{cursor:pointer;list-style:none;padding:12px 13px;font-size:12.5px;font-weight:800;color:var(--ink);
    display:flex;justify-content:space-between;gap:10px;align-items:center}
  details.faq summary::-webkit-details-marker{display:none}
  details.faq summary::after{content:"+";color:var(--cyan);font-size:16px;font-weight:900}
  details.faq[open] summary::after{content:"−"}
  details.faq[open] summary{border-bottom:1px solid var(--line);background:rgba(59,130,246,.07)}
  details.faq p{padding:12px 13px;font-size:12.5px;color:var(--mute);line-height:1.65}
  .sect-t{font-size:11px;font-weight:900;letter-spacing:1.1px;text-transform:uppercase;color:var(--cyan);margin:18px 0 10px}
  .sect-t:first-child{margin-top:0}

  /* ---------- TOAST / MODAL ---------- */
  .toasts{position:fixed;right:18px;bottom:18px;z-index:200;display:flex;flex-direction:column;gap:9px;align-items:flex-end}
  .toast{background:var(--raise);border:1px solid var(--line2);border-left:3px solid var(--phos);border-radius:12px;
    padding:11px 15px;font-size:12.5px;font-weight:700;color:var(--ink);box-shadow:0 14px 34px rgba(0,0,0,.5);
    animation:slide .25s ease;max-width:330px}
  .toast.warn{border-left-color:var(--amber)}
  .toast.err{border-left-color:var(--red)}
  @keyframes slide{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:none}}
  .modal{position:fixed;inset:0;z-index:300;background:rgba(5,7,15,.82);backdrop-filter:blur(8px);
    display:none;align-items:center;justify-content:center;padding:20px}
  .modal.on{display:flex}
  .modal-c{background:var(--panel);border:1px solid var(--line2);border-radius:20px;max-width:560px;width:100%;
    max-height:86vh;overflow-y:auto;padding:24px}
  .modal-c h3{font-size:17px;font-weight:900;margin-bottom:8px}
  .modal-c p{font-size:12.5px;color:var(--mute);line-height:1.6;margin-bottom:14px}
  .modal-c textarea{width:100%;height:120px;background:var(--deep);border:1px solid var(--line);border-radius:12px;
    color:#CFE3FF;font-family:var(--mono);font-size:10.5px;padding:11px;outline:none;resize:vertical}
  .modal-row{display:flex;gap:10px;margin-top:14px}
  .modal-row .btn{flex:1}
  .mobar{display:none}

  @media (max-width:1180px){
    .shell{grid-template-columns:280px minmax(0,1fr);}
    .side{grid-column:1/-1;border-left:none;border-top:1px solid var(--line)}
    .col{height:auto;overflow:visible}
    .shell{height:auto;display:block}
    body{overflow:auto}
    .rail{border-right:none;border-bottom:1px solid var(--line)}
    .stage{padding:20px 16px 30px}
  }
  @media (max-width:760px){
    :root{--top:60px}
    .brand p{display:none}
    .top{gap:9px;padding:0 12px}
    .top .pill span.lbl{display:none}
    .top .cta{display:none}
    .shell{display:flex;flex-direction:column}
    .stage{order:1;padding:16px 13px 20px}
    .rail{order:2;padding:14px 13px 20px}
    .side{order:3}
    .preview-wrap{padding:16px}
    #preview{width:min(340px,80vw);height:min(340px,80vw)}
    .mobar{
      display:flex;position:fixed;left:0;right:0;bottom:0;z-index:80;gap:10px;padding:10px 13px calc(10px + env(safe-area-inset-bottom,8px));
      background:linear-gradient(180deg,rgba(10,15,30,.9),rgba(10,15,30,.99));border-top:1px solid var(--line);backdrop-filter:blur(12px);
    }
    .mobar .cta{display:block;flex:1}
    .mobar .btn{width:112px}
    body{padding-bottom:78px}
    .toasts{bottom:88px;right:12px;left:12px;align-items:stretch}
    .toast{max-width:none}
  }
</style>
</head>
<body>

<header class="top">
  <div class="brand">
    <div class="brand-mark"></div>
    <div>
      <h1>RADAR · İkon Stüdyosu</h1>
      <p>PWA ikon üretici</p>
    </div>
  </div>
  <div class="top-spacer"></div>
  <button class="pill on" id="soundBtn" title="Tarama pingini aç/kapat">🔊 <span class="lbl">Ses açık</span></button>
  <button class="pill on" id="motionBtn" title="Tarama animasyonunu durdur/başlat">◉ <span class="lbl">Tarama</span></button>
  <button class="cta" id="dlAllTop">⬇ Tüm ikonları indir</button>
</header>

<div class="shell">

  <!-- ================= KONTROL RAYI ================= -->
  <aside class="col rail">
    <div class="grp">
      <div class="grp-h">◈ Zemin</div>
      <div class="grp-b">
        <div class="colors">
          <div class="sw"><span>RENK 1</span><input type="color" id="c1" value="#3B82F6"></div>
          <div class="sw"><span>RENK 2</span><input type="color" id="c2" value="#8B5CF6"></div>
          <div class="sw"><span>SEMBOL</span><input type="color" id="cs" value="#FFFFFF"></div>
        </div>
        <div class="ctl">
          <div class="ctl-h"><label for="ang">Gradyan açısı</label><span class="val" id="angV">135°</span></div>
          <input type="range" id="ang" min="0" max="360" step="1" value="135">
        </div>
        <div class="ctl">
          <div class="ctl-h"><label for="rad">Köşe yuvarlaklığı</label><span class="val" id="radV">22%</span></div>
          <input type="range" id="rad" min="0" max="50" step="1" value="22">
        </div>
        <div class="tgl" id="maskTgl"><span>Maskable (tam kare)</span><div class="sw-t"></div></div>
      </div>
    </div>

    <div class="grp">
      <div class="grp-h">◎ Sembol</div>
      <div class="grp-b">
        <div class="ctl">
          <div class="ctl-h"><label for="sym">Sembol tipi</label></div>
          <select id="sym">
            <option value="radar">Radar kolları</option>
            <option value="wave">Tam halkalar</option>
            <option value="antenna">Anten</option>
            <option value="grid">Nokta ızgarası</option>
          </select>
        </div>
        <div class="ctl">
          <div class="ctl-h"><label for="scl">Sembol ölçeği</label><span class="val" id="sclV">0.78</span></div>
          <input type="range" id="scl" min="0.40" max="1.10" step="0.01" value="0.78">
        </div>
        <div class="ctl">
          <div class="ctl-h"><label for="stk">Çizgi kalınlığı</label><span class="val" id="stkV">0.050</span></div>
          <input type="range" id="stk" min="0.020" max="0.090" step="0.002" value="0.050">
        </div>
        <div class="ctl">
          <div class="ctl-h"><label>Halka sayısı</label><span class="val" id="ringV">2</span></div>
          <div class="stepper">
            <button id="ringDown" aria-label="Azalt">−</button>
            <div class="num" id="ringNum">2</div>
            <button id="ringUp" aria-label="Artır">+</button>
          </div>
        </div>
        <div class="ctl">
          <div class="ctl-h"><label for="dot">Merkez nokta</label><span class="val" id="dotV">0.078</span></div>
          <input type="range" id="dot" min="0.030" max="0.130" step="0.002" value="0.078">
        </div>
      </div>
    </div>

    <div class="grp">
      <div class="grp-h">✦ Işık &amp; Doku</div>
      <div class="grp-b">
        <div class="ctl">
          <div class="ctl-h"><label for="swp">Tarama açısı</label><span class="val" id="swpV">300°</span></div>
          <input type="range" id="swp" min="0" max="360" step="1" value="300">
        </div>
        <div class="ctl">
          <div class="ctl-h"><label for="swi">Tarama şiddeti</label><span class="val" id="swiV">0.26</span></div>
          <input type="range" id="swi" min="0" max="0.60" step="0.01" value="0.26">
        </div>
        <div class="ctl">
          <div class="ctl-h"><label for="glw">Parlama</label><span class="val" id="glwV">0.10</span></div>
          <input type="range" id="glw" min="0" max="0.28" step="0.01" value="0.10">
        </div>
        <div class="ctl">
          <div class="ctl-h"><label for="grn">Doku (grain)</label><span class="val" id="grnV">0.10</span></div>
          <input type="range" id="grn" min="0" max="0.35" step="0.01" value="0.10">
        </div>
        <div class="tgl on" id="guideTgl"><span>Izgara &amp; güvenli alan</span><div class="sw-t"></div></div>
      </div>
    </div>

    <div class="grp">
      <div class="grp-h">⬢ Çıktı</div>
      <div class="grp-b">
        <div class="ctl">
          <div class="ctl-h"><label for="size">Hedef boyut</label></div>
          <select id="size">
            <option value="512">512 × 512</option>
            <option value="192">192 × 192</option>
            <option value="180">180 × 180 (Apple)</option>
            <option value="1024">1024 × 1024</option>
            <option value="64">64 × 64</option>
            <option value="32">32 × 32</option>
          </select>
        </div>
        <div class="ctl">
          <div class="ctl-h"><label for="qual">Kenar yumuşatma</label></div>
          <select id="qual">
            <option value="1">1× — hızlı</option>
            <option value="2" selected>2× — dengeli</option>
            <option value="3">3× — en keskin</option>
          </select>
        </div>
        <div class="rail-actions">
          <button class="btn" id="resetBtn">↺ Sıfırla</button>
          <button class="btn" id="randBtn">✧ Rastgele</button>
          <button class="btn wide hot" id="dlOne">⬇ Bu boyutu indir</button>
        </div>
      </div>
    </div>
  </aside>

  <!-- ================= SAHNE ================= -->
  <main class="col stage">
    <div class="stage-head">
      <div>
        <h2>İkonun canlı hâli</h2>
        <p>Soldaki her ayar anında uygulanır — kaydetmeye gerek yok.</p>
      </div>
      <div class="badge-live"><span class="dot-live"></span> CANLI</div>
    </div>

    <div class="preview-wrap">
      <canvas id="preview" width="720" height="720"></canvas>
      <div class="stage-meta">
        <span>çıktı <b id="mSize">512×512</b></span>
        <span>·</span>
        <span>kalite <b id="mQual">2×</b></span>
        <span>·</span>
        <span>sembol <b id="mSym">radar</b></span>
      </div>
    </div>

    <section class="card">
      <div class="card-h"><h3>Gerçek boyutlarda okunabilirlik</h3><em>favicon → ana ekran</em></div>
      <div class="sizes" id="sizeStrip"></div>
    </section>

    <section class="card">
      <div class="card-h"><h3>Nerede nasıl görünür</h3><em>sekme · ana ekran · Android maskesi</em></div>
      <div class="mocks">
        <div class="mock">
          <div class="mock-t">Tarayıcı sekmesi</div>
          <div class="mock-b">
            <div style="width:100%">
              <div class="tabbar"><canvas id="mkFav" width="16" height="16"></canvas><span>RADAR — Akıllı Haber</span><i>×</i></div>
              <div class="tabbody"></div>
            </div>
          </div>
        </div>
        <div class="mock">
          <div class="mock-t">Ana ekran · açık</div>
          <div class="mock-b"><div class="home light"><canvas id="mkLight" width="64" height="64"></canvas><b>RADAR</b></div></div>
        </div>
        <div class="mock">
          <div class="mock-t">Ana ekran · koyu</div>
          <div class="mock-b"><div class="home dark"><canvas id="mkDark" width="64" height="64"></canvas><b>RADAR</b></div></div>
        </div>
        <div class="mock">
          <div class="mock-t">Android dairesel maske</div>
          <div class="mock-b"><div class="circle-mask"><canvas id="mkCircle" width="84" height="84"></canvas></div></div>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-h"><h3>İndirilecek dosyalar</h3><em id="outCount">5 dosya</em></div>
      <div class="outs" id="outs"></div>
      <div class="hint">
        <b>İndirme çalışmazsa:</b> aşağıdaki görsellere <b>sağ tık → “Resmi farklı kaydet”</b> (telefonda <b>uzun bas → Fotoğraflara Kaydet</b>) yap.
        Dosya adını birebir koru. Tarayıcı “çoklu indirme” izni isterse <b>İzin ver</b> de.
      </div>
    </section>
  </main>

  <!-- ================= YAN PANEL ================= -->
  <aside class="col side">
    <div class="tabs">
      <button class="tab on" data-pane="guide">Yükleme Rehberi</button>
      <button class="tab" data-pane="code">Kod</button>
      <button class="tab" data-pane="auto">Otomatik</button>
    </div>

    <div class="pane on" id="pane-guide">
      <div class="sect-t">İkonlar nereye yüklenecek?</div>
      <div class="tree">
<span class="fold">radar/</span>  <span class="note">← repo kökü (p9ggcdpkmw-maker/radar)</span>
├─ index.html
├─ manifest.json
├─ sw.js
├─ <span class="hit">icon-192.png</span>          <span class="note">← buraya</span>
├─ <span class="hit">icon-512.png</span>          <span class="note">← buraya</span>
├─ <span class="hit">icon-maskable-512.png</span> <span class="note">← buraya</span>
├─ <span class="hit">apple-touch-icon.png</span>  <span class="note">← buraya</span>
├─ <span class="hit">favicon-32.png</span>        <span class="note">← buraya</span>
├─ fetch_and_summarize.py
├─ news.json
└─ <span class="fold">archive/</span>
      </div>
      <p style="font-size:12.5px;color:var(--mute);line-height:1.65;margin-bottom:14px">
        Alt klasör <b style="color:var(--red)">oluşturma</b>. <code style="font-family:var(--mono);color:var(--cyan)">index.html</code> neredeyse ikonlar da orada olacak.
      </p>

      <div class="step"><div class="step-n">1</div><div class="step-c">
        <h4>Beş dosyayı indir</h4>
        <p>Üstteki <b>Tüm ikonları indir</b> düğmesi ya da sahnedeki tek tek indirme düğmeleri. İnmiyorsa görsele sağ tıkla / uzun bas.</p>
      </div></div>
      <div class="step"><div class="step-n">2</div><div class="step-c">
        <h4>GitHub’da yükle</h4>
        <p>Aşağıdaki düğme doğrudan yükleme ekranını açar. Dosyaları sürükle, <b>Commit changes</b> de.</p>
      </div></div>
      <a class="linkbtn" href="https://github.com/p9ggcdpkmw-maker/radar/upload/main" target="_blank" rel="noopener">↗ GitHub yükleme ekranını aç</a>
      <div class="step"><div class="step-n">3</div><div class="step-c">
        <h4>manifest.json’u eşleştir</h4>
        <p><b>Kod</b> sekmesindeki manifest’i yapıştır. Dosya adları birebir aynı olmalı, yoksa kurulum düğmesi çıkmaz.</p>
      </div></div>
      <div class="step"><div class="step-n">4</div><div class="step-c">
        <h4>Doğrula</h4>
        <p>Pages ~1 dakika gecikir. Sonra ikon adresini doğrudan aç — resmi görüyorsan yüklenmiş demektir.</p>
      </div></div>
      <a class="linkbtn" href="https://p9ggcdpkmw-maker.github.io/radar/icon-512.png" target="_blank" rel="noopener">↗ icon-512.png yayında mı?</a>
      <div class="step"><div class="step-n">5</div><div class="step-c">
        <h4>Uygulama gibi kur</h4>
        <p>Siteyi aç, <b>Ctrl+Shift+R</b> yap. Adres çubuğundaki <b>Yükle</b> simgesine bas; telefonda menüden <b>Ana ekrana ekle</b>.</p>
      </div></div>

      <div class="sect-t">İnmiyor / görünmüyor — nedenleri</div>
      <details class="faq" open><summary>Linke tıklıyorum, indirme başlamıyor</summary>
        <p>Tarayıcı aynı anda birden fazla indirmeyi engelliyor olabilir. Adres çubuğunun sağındaki indirme engeli simgesinden <b>İzin ver</b> seç ya da dosyaları tek tek indir. Bu sayfa indirmeyi <code>blob</code> ile yapıyor; eski sürümdeki <code>data:</code> bağlantıları bazı tarayıcılarda sessizce engelleniyordu.</p></details>
      <details class="faq"><summary>iPhone / iPad’de dosya inmiyor</summary>
        <p>iOS Safari indirme bağlantısını çoğu zaman yeni sekmede açar. Sahnedeki ikon görseline <b>uzun bas → Fotoğraflara Kaydet</b>, sonra Dosyalar uygulamasından GitHub’a yükle. Ya da hiç uğraşma: <b>Otomatik</b> sekmesindeki yolu kullan, ikonları bot üretsin.</p></details>
      <details class="faq"><summary>Sayfa açılınca kod görünüyor</summary>
        <p>GitHub’da dosyayı <b>Raw</b> olarak açtın. Çalışması için Pages adresinden aç: <code>p9ggcdpkmw-maker.github.io/radar/icon-uret.html</code>. Dosyayı repoya yükledikten sonra 1 dakika bekle.</p></details>
      <details class="faq"><summary>Dosyayı çift tıklayıp bilgisayarda açtım</summary>
        <p><code>file://</code> altında bazı tarayıcılar indirmeyi kısıtlar. Sayfayı Pages adresinden aç ya da ikon görsellerine sağ tıklayıp kaydet. Çizim ve önizleme her durumda çalışır.</p></details>
      <details class="faq"><summary>Yükledim ama sitede ikon çıkmadı</summary>
        <p>Üç sebep: dosya adı farklı (<code>Icon-512.png</code> ≠ <code>icon-512.png</code>), dosya bir alt klasörde, ya da service worker eski önbelleği veriyor. Adresi doğrudan açarak kontrol et, sonra <b>Ctrl+Shift+R</b>. Gerekirse DevTools → Application → Service Workers → <b>Unregister</b>.</p></details>
      <details class="faq"><summary>Chrome “Yükle” düğmesini hiç göstermiyor</summary>
        <p>Chromium kurulabilirlik için <b>192×192 ve 512×512 PNG</b> ister; SVG tek başına yetmez. Bu stüdyo tam olarak o iki PNG’yi üretir. manifest.json’da <code>start_url</code> ve <code>scope</code> göreli (<code>./</code>) olmalı ve site HTTPS üzerinden açılmalı.</p></details>
    </div>

    <div class="pane" id="pane-code">
      <div class="codeblock">
        <div class="code-h"><b>manifest.json</b><button class="copy" data-copy="manifestCode">Kopyala</button></div>
        <textarea id="manifestCode" readonly spellcheck="false"></textarea>
      </div>
      <div class="codeblock">
        <div class="code-h"><b>index.html · &lt;head&gt; satırları</b><button class="copy" data-copy="headCode">Kopyala</button></div>
        <textarea id="headCode" readonly spellcheck="false"></textarea>
      </div>
      <div class="codeblock">
        <div class="code-h"><b>sw.js · önbellek listesi</b><button class="copy" data-copy="swCode">Kopyala</button></div>
        <textarea id="swCode" readonly spellcheck="false"></textarea>
      </div>
      <div class="hint" style="margin-top:0">
        <b>Sıra:</b> önce PNG’leri yükle, sonra bu üç dosyayı güncelle. Önce manifest’i güncellersen tarayıcı olmayan ikonları indirip kurulumu reddeder.
      </div>
    </div>

    <div class="pane" id="pane-auto">
      <div class="sect-t">Hiç indirmeden: ikonları bot üretsin</div>
      <p style="font-size:12.5px;color:var(--mute);line-height:1.7;margin-bottom:14px">
        İndirme takılıyorsa en temiz yol bu. <b>icons.py</b> dosyasını repo köküne ekle; hiçbir kütüphane kurmaz (sadece Python standart kütüphanesi),
        beş PNG’yi sunucuda çizer ve bot commit eder. Aynı ayarlar her seferinde aynı baytları ürettiği için gereksiz commit oluşmaz.
      </p>
      <div class="step"><div class="step-n">1</div><div class="step-c">
        <h4>icons.py → repo kökü</h4>
        <p>Sohbette verilen dosyanın tamamını <code>icons.py</code> adıyla kaydet. <code>requirements.txt</code> değişmez.</p>
      </div></div>
      <div class="step"><div class="step-n">2</div><div class="step-c">
        <h4>Workflow’a iki satır</h4>
        <p>Aşağıdaki adım <b>commit adımından önce</b> duruyor; <code>git add</code> satırı PNG’leri de kapsıyor.</p>
      </div></div>
      <div class="codeblock">
        <div class="code-h"><b>update-news.yml · ikon adımı</b><button class="copy" data-copy="autoStep">Kopyala</button></div>
        <textarea id="autoStep" readonly spellcheck="false"></textarea>
      </div>
      <div class="codeblock">
        <div class="code-h"><b>update-news.yml · git add satırı</b><button class="copy" data-copy="autoAdd">Kopyala</button></div>
        <textarea id="autoAdd" readonly spellcheck="false"></textarea>
      </div>
      <div class="step"><div class="step-n">3</div><div class="step-c">
        <h4>Actions → Run workflow</h4>
        <p>Logda <code>icon-512.png (512x512) yazildi</code> satırlarını gör. İkonlar repoda belirir; bir daha dokunmana gerek kalmaz.</p>
      </div></div>
      <div class="hint" style="margin-top:4px">
        <b>Renkleri değiştirmek istersen:</b> bu stüdyoda istediğin görünümü ayarla, sonra <code>icons.py</code> içindeki
        <b>COLOR_1 / COLOR_2 / GRAD_DEG / RADIUS</b> değerlerini aynı sayılarla değiştir. İki yol birbiriyle birebir eşleşir.
      </div>
      <div class="codeblock" style="margin-top:14px">
        <div class="code-h"><b>icons.py · şu anki ayarların</b><button class="copy" data-copy="pyCfg">Kopyala</button></div>
        <textarea id="pyCfg" readonly spellcheck="false"></textarea>
      </div>
    </div>
  </aside>
</div>

<div class="mobar">
  <button class="btn" id="dlOneMob">⬇ Tek</button>
  <button class="cta" id="dlAllMob">⬇ Tüm ikonları indir</button>
</div>

<div class="toasts" id="toasts"></div>

<div class="modal" id="fbModal">
  <div class="modal-c">
    <h3>Elle kaydetme yolu</h3>
    <p>Tarayıcı otomatik indirmeyi engelledi. Aşağıdaki görsele <b>sağ tık → Resmi farklı kaydet</b> (telefonda uzun bas) yap ve dosya adını birebir koru. İstersen base64 metnini kopyalayıp bir dönüştürücüyle de kaydedebilirsin.</p>
    <div style="display:flex;justify-content:center;margin-bottom:14px">
      <img id="fbImg" alt="İkon" style="width:180px;height:180px;border-radius:16px;background:#0B1120">
    </div>
    <textarea id="fbText" readonly spellcheck="false"></textarea>
    <div class="modal-row">
      <button class="btn" id="fbCopy">Base64 kopyala</button>
      <button class="btn" id="fbOpen">Yeni sekmede aç</button>
      <button class="btn hot" id="fbClose">Kapat</button>
    </div>
  </div>
</div>

<script>
(function(){
  "use strict";
  var $ = function(id){ return document.getElementById(id); };

  /* ---------------- STATE ---------------- */
  var DEF = {
    c1:"#3B82F6", c2:"#8B5CF6", cs:"#FFFFFF",
    ang:135, rad:22, mask:false,
    sym:"radar", scl:0.78, stk:0.050, rings:2, dot:0.078,
    swp:300, swi:0.26, glw:0.10, grn:0.10,
    guides:true, size:512, qual:2, motion:true, sound:true
  };
  var S = {}; for (var k in DEF) S[k] = DEF[k];

  var TARGETS = [
    { name:"icon-192.png",          size:192, mask:false, note:"Chromium zorunlu" },
    { name:"icon-512.png",          size:512, mask:false, note:"Chromium zorunlu" },
    { name:"icon-maskable-512.png", size:512, mask:true,  note:"Android uyarlanır" },
    { name:"apple-touch-icon.png",  size:180, mask:true,  note:"iOS ana ekran" },
    { name:"favicon-32.png",        size:32,  mask:false, note:"Sekme ikonu" }
  ];

  var preview = $("preview"), pctx = preview.getContext("2d");
  var PRE = 720;
  var baseCanvas = document.createElement("canvas"); baseCanvas.width = baseCanvas.height = PRE;
  var masterCanvas = document.createElement("canvas"); masterCanvas.width = masterCanvas.height = 512;
  var noise = null, rafId = 0, sweepAngle = S.swp * Math.PI/180, lastT = 0, lastPing = -1;
  var outURLs = [], outItems = [], refreshTimer = 0, masterTimer = 0;

  /* ---------------- YARDIMCI ---------------- */
  function hex2rgb(h){
    h = String(h||"#000").replace("#","");
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h,16); if (isNaN(n)) n = 0;
    return [(n>>16)&255,(n>>8)&255,n&255];
  }
  function rgba(c,a){ var r = hex2rgb(c); return "rgba("+r[0]+","+r[1]+","+r[2]+","+a+")"; }
  function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
  function effSS(size,q){ return Math.min(q, size<=256?3:2); }

  function toast(msg,kind){
    var t = document.createElement("div");
    t.className = "toast" + (kind ? " "+kind : "");
    t.textContent = msg;
    $("toasts").appendChild(t);
    setTimeout(function(){ t.style.transition="opacity .3s,transform .3s"; t.style.opacity="0"; t.style.transform="translateX(20px)";
      setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); },320); }, 2900);
  }

  function roundPath(ctx,size,r){
    var x=0,y=0,w=size,h=size;
    r = clamp(r,0,size/2);
    ctx.beginPath();
    if (r<=0.5){ ctx.rect(x,y,w,h); return; }
    ctx.moveTo(x+r,y);
    ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
    ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
    ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
    ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
    ctx.closePath();
  }

  function buildNoise(){
    if (noise) return noise;
    var n = document.createElement("canvas"); n.width = n.height = 96;
    var nc = n.getContext("2d"), img = nc.createImageData(96,96), d = img.data;
    for (var i=0;i<d.length;i+=4){
      var v = 120 + Math.random()*135;
      d[i]=d[i+1]=d[i+2]=v; d[i+3]=26;
    }
    nc.putImageData(img,0,0); noise = n; return n;
  }

  /* ---------------- ÇİZİM ---------------- */
  function paintStatic(ctx,size,o){
    var radius = o.mask ? 0 : (o.rad/100)*size;
    var scl = o.mask ? o.scl*0.77 : o.scl;
    ctx.clearRect(0,0,size,size);
    ctx.save();
    roundPath(ctx,size,radius); ctx.clip();

    var a = o.ang*Math.PI/180, gx = Math.cos(a), gy = Math.sin(a);
    var cx = size/2, cy = size/2, half = size/2;
    var g = ctx.createLinearGradient(cx-gx*half, cy-gy*half, cx+gx*half, cy+gy*half);
    g.addColorStop(0,o.c1); g.addColorStop(1,o.c2);
    ctx.fillStyle = g; ctx.fillRect(0,0,size,size);

    var sheen = ctx.createRadialGradient(size*0.28,size*0.20,0,size*0.28,size*0.20,size*0.85);
    sheen.addColorStop(0,"rgba(255,255,255,.16)"); sheen.addColorStop(1,"rgba(255,255,255,0)");
    ctx.fillStyle = sheen; ctx.fillRect(0,0,size,size);

    if (o.grn>0.001){
      var pat = ctx.createPattern(buildNoise(),"repeat");
      if (pat){ ctx.save(); ctx.globalAlpha = o.grn; ctx.globalCompositeOperation="overlay";
        ctx.fillStyle = pat; ctx.fillRect(0,0,size,size); ctx.restore(); }
    }

    var lw = o.stk*size*(scl/0.78);
    var dotR = o.dot*size*(scl/0.78);
    var base = 0.19*size*(scl/0.78);
    var step = 0.09*size*(scl/0.78);

    if (o.glw>0.001){
      var gr = dotR + o.glw*size*(scl/0.78)*2.2;
      var gg = ctx.createRadialGradient(cx,cy,dotR*0.4,cx,cy,gr);
      gg.addColorStop(0,rgba(o.cs,0.42)); gg.addColorStop(1,rgba(o.cs,0));
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(cx,cy,gr,0,Math.PI*2); ctx.fill();
    }

    ctx.strokeStyle = o.cs; ctx.lineWidth = lw; ctx.lineCap = "round"; ctx.fillStyle = o.cs;

    if (o.sym === "radar"){
      for (var i=0;i<o.rings;i++){
        var r = base + i*step;
        ctx.globalAlpha = clamp(0.58 - i*0.14,0.10,1);
        ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI*0.75,Math.PI*1.25); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx,cy,r,-Math.PI*0.25,Math.PI*0.25); ctx.stroke();
      }
    } else if (o.sym === "wave"){
      for (var j=0;j<o.rings+1;j++){
        var r2 = base*0.72 + j*step;
        ctx.globalAlpha = clamp(0.60 - j*0.13,0.10,1);
        ctx.beginPath(); ctx.arc(cx,cy,r2,0,Math.PI*2); ctx.stroke();
      }
    } else if (o.sym === "antenna"){
      ctx.globalAlpha = 0.92;
      ctx.beginPath(); ctx.moveTo(cx,cy+base*1.55); ctx.lineTo(cx,cy-dotR*0.4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-base*0.62,cy+base*1.55); ctx.lineTo(cx+base*0.62,cy+base*1.55); ctx.stroke();
      for (var m=0;m<o.rings;m++){
        var r3 = base*0.85 + m*step;
        ctx.globalAlpha = clamp(0.58-m*0.15,0.10,1);
        ctx.beginPath(); ctx.arc(cx,cy,r3,Math.PI*1.18,Math.PI*1.82); ctx.stroke();
      }
    } else {
      var gp = base*0.92;
      for (var yy=-1;yy<=1;yy++){
        for (var xx=-1;xx<=1;xx++){
          if (xx===0 && yy===0) continue;
          ctx.globalAlpha = (xx===0||yy===0) ? 0.62 : 0.30;
          ctx.beginPath(); ctx.arc(cx+xx*gp, cy+yy*gp, lw*0.62, 0, Math.PI*2); ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(cx,cy,dotR,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function paintSweep(ctx,size,o,angle){
    if (o.swi<=0.002) return;
    var radius = o.mask ? 0 : (o.rad/100)*size;
    var cx=size/2, cy=size/2;
    ctx.save();
    roundPath(ctx,size,radius); ctx.clip();
    var done = false;
    if (typeof ctx.createConicGradient === "function"){
      try{
        var cg = ctx.createConicGradient(angle,cx,cy);
        cg.addColorStop(0, rgba(o.cs,o.swi));
        cg.addColorStop(0.10, rgba(o.cs,o.swi*0.22));
        cg.addColorStop(0.26, rgba(o.cs,0));
        cg.addColorStop(1, rgba(o.cs,0));
        ctx.fillStyle = cg; ctx.fillRect(0,0,size,size);
        done = true;
      }catch(e){ done = false; }
    }
    if (!done){
      var R = size*0.78;
      var lg = ctx.createLinearGradient(cx,cy,cx+Math.cos(angle)*R,cy+Math.sin(angle)*R);
      lg.addColorStop(0, rgba(o.cs,o.swi*0.85)); lg.addColorStop(1, rgba(o.cs,0));
      ctx.fillStyle = lg;
      ctx.beginPath(); ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,R,angle-0.42,angle); ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = rgba(o.cs,Math.min(0.55,o.swi*1.5));
    ctx.lineWidth = Math.max(1,size*0.006);
    ctx.beginPath(); ctx.moveTo(cx,cy);
    ctx.lineTo(cx+Math.cos(angle)*size*0.72, cy+Math.sin(angle)*size*0.72); ctx.stroke();
    ctx.restore();
  }

  function paintGuides(ctx,size){
    var cx=size/2, cy=size/2;
    ctx.save();
    ctx.strokeStyle="rgba(34,211,238,.30)"; ctx.lineWidth=Math.max(1,size*0.0025);
    for (var i=1;i<10;i++){
      var p=size*i/10;
      ctx.globalAlpha = (i===5)?0.55:0.20;
      ctx.beginPath(); ctx.moveTo(p,0); ctx.lineTo(p,size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,p); ctx.lineTo(size,p); ctx.stroke();
    }
    ctx.globalAlpha=1;
    ctx.setLineDash([size*0.022,size*0.016]);
    ctx.strokeStyle="rgba(245,158,11,.85)"; ctx.lineWidth=Math.max(1.4,size*0.005);
    ctx.beginPath(); ctx.arc(cx,cy,size*0.40,0,Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle="rgba(236,72,153,.75)"; ctx.lineWidth=Math.max(1.2,size*0.004);
    ctx.strokeRect(size*0.06,size*0.06,size*0.88,size*0.88);
    ctx.fillStyle="rgba(245,158,11,.95)";
    ctx.font="700 "+Math.round(size*0.030)+"px ui-monospace,monospace";
    ctx.fillText("güvenli alan", size*0.075, size*0.055);
    ctx.restore();
  }

  function rebuildBase(){
    var b = baseCanvas.getContext("2d");
    paintStatic(b,PRE,S);
  }
  function rebuildMaster(){
    var m = masterCanvas.getContext("2d");
    paintStatic(m,512,S);
    paintSweep(m,512,S,S.swp*Math.PI/180);
    drawStrip(); drawMocks();
  }

  function frame(t){
    rafId = requestAnimationFrame(frame);
    if (!lastT) lastT = t;
    var dt = Math.min(64, t-lastT); lastT = t;
    if (S.motion){
      sweepAngle += dt*0.00058;
      if (sweepAngle > Math.PI*2){ sweepAngle -= Math.PI*2; }
      var deg = sweepAngle*180/Math.PI;
      if (lastPing < 0 || deg < lastPing){ ping(); }
      lastPing = deg;
    }
    pctx.clearRect(0,0,PRE,PRE);
    pctx.drawImage(baseCanvas,0,0);
    paintSweep(pctx,PRE,S,S.motion?sweepAngle:S.swp*Math.PI/180);
    if (S.guides) paintGuides(pctx,PRE);
  }

  /* ---------------- SES ---------------- */
  var actx = null;
  function ensureAudio(){
    if (actx || !S.sound) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try{ actx = new AC(); }catch(e){ actx = null; }
  }
  function ping(){
    if (!S.sound || !actx || actx.state !== "running") return;
    var t = actx.currentTime;
    var o = actx.createOscillator(), g = actx.createGain(), f = actx.createBiquadFilter();
    o.type="sine"; o.frequency.setValueAtTime(1180,t); o.frequency.exponentialRampToValueAtTime(720,t+0.20);
    f.type="lowpass"; f.frequency.value=2400;
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.045,t+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.30);
    o.connect(f); f.connect(g); g.connect(actx.destination);
    o.start(t); o.stop(t+0.32);
  }
  function blip(freq){
    if (!S.sound || !actx || actx.state !== "running") return;
    var t = actx.currentTime;
    var o = actx.createOscillator(), g = actx.createGain();
    o.type="triangle"; o.frequency.setValueAtTime(freq||520,t);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.05,t+0.008);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.13);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t+0.15);
  }
  document.addEventListener("pointerdown", function once(){
    ensureAudio();
    if (actx && actx.state === "suspended") actx.resume().catch(function(){});
    document.removeEventListener("pointerdown", once);
  });
  document.addEventListener("visibilitychange", function(){
    if (document.hidden){ if (rafId){ cancelAnimationFrame(rafId); rafId = 0; } }
    else if (!rafId){ lastT = 0; rafId = requestAnimationFrame(frame); }
  });

  /* ---------------- ÖNİZLEME ŞERİDİ & MAKETLER ---------------- */
  var STRIP = [16,24,32,48,64,96,128];
  function drawStrip(){
    var wrap = $("sizeStrip");
    if (!wrap.childNodes.length){
      STRIP.forEach(function(s){
        var d = document.createElement("div"); d.className="size-item";
        var c = document.createElement("canvas"); c.width=c.height=s; c.dataset.s=s;
        c.style.width=s+"px"; c.style.height=s+"px";
        var b = document.createElement("b"); b.textContent = s+"px";
        d.appendChild(c); d.appendChild(b); wrap.appendChild(d);
      });
    }
    Array.prototype.forEach.call(wrap.querySelectorAll("canvas"), function(c){
      var s = parseInt(c.dataset.s,10), cx = c.getContext("2d");
      cx.clearRect(0,0,s,s); cx.imageSmoothingEnabled = true;
      if (cx.imageSmoothingQuality) cx.imageSmoothingQuality = "high";
      cx.drawImage(masterCanvas,0,0,s,s);
    });
  }
  function put(id,src,size){
    var c = $(id); if (!c) return;
    var cx = c.getContext("2d");
    cx.clearRect(0,0,c.width,c.height);
    cx.imageSmoothingEnabled = true; if (cx.imageSmoothingQuality) cx.imageSmoothingQuality="high";
    cx.drawImage(src,0,0,size||c.width,size||c.height);
  }
  function drawMocks(){
    put("mkFav",masterCanvas,16);
    put("mkLight",masterCanvas,64);
    put("mkDark",masterCanvas,64);
    var mc = document.createElement("canvas"); mc.width=mc.height=256;
    var mx = mc.getContext("2d");
    paintStatic(mx,256,{ c1:S.c1,c2:S.c2,cs:S.cs,ang:S.ang,rad:0,mask:true,
      sym:S.sym,scl:S.scl,stk:S.stk,rings:S.rings,dot:S.dot,swp:S.swp,swi:S.swi,glw:S.glw,grn:S.grn });
    paintSweep(mx,256,S,S.swp*Math.PI/180);
    put("mkCircle",mc,84);
  }

  /* ---------------- ÇIKTILAR ---------------- */
  function buildPNG(size,mask,ss){
    var big = document.createElement("canvas");
    big.width = big.height = size*ss;
    var bx = big.getContext("2d");
    var o = {}; for (var k in S) o[k]=S[k];
    o.mask = mask;
    paintStatic(bx,size*ss,o);
    paintSweep(bx,size*ss,o,S.swp*Math.PI/180);
    var fin = document.createElement("canvas"); fin.width=fin.height=size;
    var fx = fin.getContext("2d");
    fx.imageSmoothingEnabled = true; if (fx.imageSmoothingQuality) fx.imageSmoothingQuality="high";
    if (ss>1) fx.drawImage(big,0,0,size,size); else fx.drawImage(big,0,0);
    return fin;
  }

  function toBlob(canvas){
    return new Promise(function(res,rej){
      if (!canvas.toBlob){
        try{
          var du = canvas.toDataURL("image/png");
          var bin = atob(du.split(",")[1]); var arr = new Uint8Array(bin.length);
          for (var i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i);
          res(new Blob([arr],{type:"image/png"}));
        }catch(e){ rej(e); }
        return;
      }
      try{ canvas.toBlob(function(b){ b?res(b):rej(new Error("blob boş")); },"image/png"); }
      catch(e){ rej(e); }
    });
  }

  function refreshOutputs(){
    var wrap = $("outs");
    outURLs.forEach(function(u){ try{ URL.revokeObjectURL(u); }catch(e){} });
    outURLs = []; outItems = []; wrap.innerHTML = "";
    var ss = effSS(S.size,S.qual);
    TARGETS.forEach(function(t){
      var useSS = effSS(t.size,S.qual);
      var cv = buildPNG(t.size,t.mask,useSS);
      toBlob(cv).then(function(blob){
        var url = URL.createObjectURL(blob); outURLs.push(url);
        var item = { name:t.name, blob:blob, url:url, size:t.size };
        outItems.push(item);
        var card = document.createElement("div"); card.className="out";
        var box = document.createElement("div"); box.className="out-img";
        var img = document.createElement("img"); img.src=url; img.alt=t.name; img.loading="lazy";
        box.appendChild(img);
        var nm = document.createElement("div"); nm.className="out-name"; nm.textContent=t.name;
        var sb = document.createElement("div"); sb.className="out-sub";
        sb.textContent = t.size+"×"+t.size+" · "+(blob.size/1024).toFixed(1)+" KB · "+t.note;
        var bt = document.createElement("button"); bt.textContent="⬇ İndir";
        bt.addEventListener("click", function(){ download(item,bt); });
        card.appendChild(box); card.appendChild(nm); card.appendChild(sb); card.appendChild(bt);
        wrap.appendChild(card);
      }).catch(function(){
        var card = document.createElement("div"); card.className="out";
        var box = document.createElement("div"); box.className="out-img";
        try{
          var img2 = document.createElement("img"); img2.src = cv.toDataURL("image/png"); img2.alt=t.name;
          box.appendChild(img2);
        }catch(e){ box.textContent="önizleme yok"; }
        var nm2 = document.createElement("div"); nm2.className="out-name"; nm2.textContent=t.name;
        var sb2 = document.createElement("div"); sb2.className="out-sub"; sb2.textContent="sağ tık → resmi kaydet";
        card.appendChild(box); card.appendChild(nm2); card.appendChild(sb2);
        wrap.appendChild(card);
      });
    });
    $("outCount").textContent = TARGETS.length+" dosya · "+ss+"× örnekleme";
  }

  function triggerDownload(url,name){
    var a = document.createElement("a");
    a.href = url; a.download = name; a.rel="noopener"; a.style.display="none";
    document.body.appendChild(a); a.click();
    setTimeout(function(){ if (a.parentNode) a.parentNode.removeChild(a); },400);
  }

  function download(item,btn){
    blip(660);
    try{
      triggerDownload(item.url,item.name);
      if (btn){ var o=btn.textContent; btn.textContent="✓ Gönderildi"; setTimeout(function(){ btn.textContent=o; },1600); }
      toast(item.name+" indirilmeye gönderildi");
      setTimeout(function(){ checkSaved(item); },1400);
    }catch(e){ openFallback(item); }
  }

  function checkSaved(item){
    if (downloadConfidence) return;
    openFallback(item);
  }
  var downloadConfidence = false;
  try{
    var probe = document.createElement("a");
    downloadConfidence = ("download" in probe) && location.protocol !== "file:";
  }catch(e){ downloadConfidence = false; }

  function downloadAll(){
    if (!outItems.length){ toast("Çıktılar hazırlanıyor, bir saniye bekle","warn"); return; }
    blip(880);
    var i = 0, blocked = 0;
    (function next(){
      if (i >= outItems.length){
        toast(blocked ? "Bazı dosyalar engellendi — elle kaydetme penceresi açıldı" : "5 dosya indirilmeye gönderildi", blocked?"warn":"");
        if (blocked) openFallback(outItems[0]);
        return;
      }
      var it = outItems[i++];
      try{ triggerDownload(it.url,it.name); }catch(e){ blocked++; }
      setTimeout(next,320);
    })();
  }

  function openFallback(item){
    $("fbImg").src = item.url;
    $("fbImg").setAttribute("data-name",item.name);
    var r = new FileReader();
    r.onload = function(){ $("fbText").value = String(r.result||""); };
    r.onerror = function(){ $("fbText").value = "Base64 okunamadı; görsele sağ tıklayıp kaydedebilirsin."; };
    try{ r.readAsDataURL(item.blob); }catch(e){ $("fbText").value=""; }
    $("fbModal").classList.add("on");
  }

  /* ---------------- KOD BLOKLARI ---------------- */
  function updateCode(){
    $("manifestCode").value =
'{\n'+
'  "name": "RADAR — Akıllı Haber",\n'+
'  "short_name": "RADAR",\n'+
'  "description": "Yapay zeka özetli haber akışı, piyasa takibi ve canlı radyo.",\n'+
'  "lang": "tr",\n'+
'  "start_url": "./",\n'+
'  "scope": "./",\n'+
'  "display": "standalone",\n'+
'  "background_color": "#F8FAFC",\n'+
'  "theme_color": "#F8FAFC",\n'+
'  "icons": [\n'+
'    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },\n'+
'    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },\n'+
'    { "src": "icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }\n'+
'  ]\n'+
'}';
    $("headCode").value =
'<link rel="manifest" href="manifest.json">\n'+
'<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">\n'+
'<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">\n'+
'<meta name="theme-color" content="#F8FAFC">\n'+
'<meta name="apple-mobile-web-app-capable" content="yes">\n'+
'<meta name="apple-mobile-web-app-title" content="RADAR">';
    $("swCode").value =
"const CACHE_VERSION = 'radar-v3';\n"+
"const SHELL = ['./', './index.html', './manifest.json',\n"+
"               './icon-192.png', './icon-512.png',\n"+
"               './icon-maskable-512.png', './apple-touch-icon.png', './favicon-32.png'];";
    $("autoStep").value =
'      - name: PWA ikonlarını üret\n'+
'        run: python icons.py\n';
    $("autoAdd").value =
'          git add news.json archive/ feed.xml feed-*.xml icon-*.png apple-touch-icon.png favicon-32.png';
    var c1 = hex2rgb(S.c1), c2 = hex2rgb(S.c2), cs = hex2rgb(S.cs);
    $("pyCfg").value =
'COLOR_1   = ('+c1[0]+', '+c1[1]+', '+c1[2]+')\n'+
'COLOR_2   = ('+c2[0]+', '+c2[1]+', '+c2[2]+')\n'+
'SYMBOL    = ('+cs[0]+', '+cs[1]+', '+cs[2]+')\n'+
'GRAD_DEG  = '+S.ang.toFixed(1)+'\n'+
'RADIUS    = '+(S.mask?0:(S.rad/100)).toFixed(3)+'\n'+
'SYMBOL_K  = '+S.scl.toFixed(3)+'\n'+
'STROKE_K  = '+S.stk.toFixed(3)+'\n'+
'RINGS     = '+S.rings+'\n'+
'DOT_K     = '+S.dot.toFixed(3)+'\n'+
'GLOW_K    = '+S.glw.toFixed(3);
  }

  function copyText(txt,btn){
    function ok(){ var o=btn.textContent; btn.textContent="✓ Kopyalandı"; blip(760);
      setTimeout(function(){ btn.textContent=o; },1500); }
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(ok).catch(function(){ legacy(); });
    } else legacy();
    function legacy(){
      var ta = document.createElement("textarea");
      ta.value = txt; ta.style.position="fixed"; ta.style.opacity="0";
      document.body.appendChild(ta); ta.select();
      var done=false; try{ done=document.execCommand("copy"); }catch(e){}
      document.body.removeChild(ta);
      if (done) ok(); else toast("Kopyalanamadı — metni elle seç","warn");
    }
  }

  /* ---------------- KONTROL BAĞLAMA ---------------- */
  function syncLabels(){
    $("angV").textContent = S.ang+"°";
    $("radV").textContent = (S.mask?0:S.rad)+"%";
    $("sclV").textContent = S.scl.toFixed(2);
    $("stkV").textContent = S.stk.toFixed(3);
    $("ringV").textContent = S.rings;
    $("ringNum").textContent = S.rings;
    $("dotV").textContent = S.dot.toFixed(3);
    $("swpV").textContent = S.swp+"°";
    $("swiV").textContent = S.swi.toFixed(2);
    $("glwV").textContent = S.glw.toFixed(2);
    $("grnV").textContent = S.grn.toFixed(2);
    $("mSize").textContent = S.size+"×"+S.size;
    $("mQual").textContent = effSS(S.size,S.qual)+"×";
    $("mSym").textContent = S.sym;
    $("rad").disabled = !!S.mask;
    $("maskTgl").classList.toggle("on",S.mask);
    $("guideTgl").classList.toggle("on",S.guides);
    $("motionBtn").classList.toggle("on",S.motion);
    $("motionBtn").classList.toggle("off",!S.motion);
    $("motionBtn").innerHTML = (S.motion?"◉":"⏸")+' <span class="lbl">'+(S.motion?"Tarama":"Durdu")+'</span>';
    $("soundBtn").classList.toggle("on",S.sound);
    $("soundBtn").classList.toggle("off",!S.sound);
    $("soundBtn").innerHTML = (S.sound?"🔊":"🔇")+' <span class="lbl">'+(S.sound?"Ses açık":"Ses kapalı")+'</span>';
  }

  function touch(fast){
    syncLabels(); rebuildBase(); updateCode();
    clearTimeout(masterTimer);
    masterTimer = setTimeout(rebuildMaster, fast?60:140);
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refreshOutputs, 420);
  }

  function bindRange(id,key,parse){
    var el = $(id);
    el.addEventListener("input", function(){
      S[key] = parse ? parse(el.value) : parseFloat(el.value);
      touch(true);
    });
  }
  bindRange("ang","ang",function(v){ return parseInt(v,10); });
  bindRange("rad","rad",function(v){ return parseInt(v,10); });
  bindRange("scl","scl"); bindRange("stk","stk"); bindRange("dot","dot");
  bindRange("swp","swp",function(v){ return parseInt(v,10); });
  bindRange("swi","swi"); bindRange("glw","glw"); bindRange("grn","grn");

  ["c1","c2","cs"].forEach(function(id){
    $(id).addEventListener("input", function(){ S[id] = $(id).value; touch(true); });
  });
  $("sym").addEventListener("change", function(){ S.sym = this.value; touch(); });
  $("size").addEventListener("change", function(){ S.size = parseInt(this.value,10); touch(); });
  $("qual").addEventListener("change", function(){ S.qual = parseInt(this.value,10); touch(); });

  $("ringUp").addEventListener("click", function(){ S.rings = clamp(S.rings+1,1,4); blip(600); touch(); });
  $("ringDown").addEventListener("click", function(){ S.rings = clamp(S.rings-1,1,4); blip(440); touch(); });
  $("maskTgl").addEventListener("click", function(){ S.mask = !S.mask; blip(520); touch(); });
  $("guideTgl").addEventListener("click", function(){ S.guides = !S.guides; syncLabels(); blip(520); });
  $("motionBtn").addEventListener("click", function(){ S.motion = !S.motion; lastPing = -1; syncLabels(); blip(500); });
  $("soundBtn").addEventListener("click", function(){
    S.sound = !S.sound;
    if (S.sound){ ensureAudio(); if (actx && actx.state==="suspended") actx.resume().catch(function(){}); blip(880); }
    syncLabels();
    toast(S.sound ? "Tarama pingi açık" : "Tüm sesler kapatıldı");
  });

  $("resetBtn").addEventListener("click", function(){
    for (var k in DEF) S[k] = DEF[k];
    pushToInputs(); blip(420); touch(); toast("Varsayılan RADAR ikonuna dönüldü");
  });

  var PALETTES = [
    ["#3B82F6","#8B5CF6"],["#22D3EE","#3B82F6"],["#8B5CF6","#EC4899"],
    ["#0EA5E9","#4ADE80"],["#F59E0B","#EF4444"],["#6366F1","#22D3EE"],
    ["#EC4899","#F59E0B"],["#10B981","#0EA5E9"],["#7C3AED","#DB2777"]
  ];
  $("randBtn").addEventListener("click", function(){
    var p = PALETTES[Math.floor(Math.random()*PALETTES.length)];
    S.c1 = p[0]; S.c2 = p[1]; S.cs = "#FFFFFF";
    S.ang = Math.floor(Math.random()*360);
    S.rad = 12 + Math.floor(Math.random()*30);
    S.sym = ["radar","wave","antenna","grid"][Math.floor(Math.random()*4)];
    S.scl = +(0.62 + Math.random()*0.34).toFixed(2);
    S.stk = +(0.034 + Math.random()*0.036).toFixed(3);
    S.rings = 1 + Math.floor(Math.random()*3);
    S.dot = +(0.055 + Math.random()*0.055).toFixed(3);
    S.swp = Math.floor(Math.random()*360);
    S.swi = +(0.16 + Math.random()*0.26).toFixed(2);
    S.glw = +(0.05 + Math.random()*0.16).toFixed(2);
    S.mask = false;
    pushToInputs(); blip(940); touch(); toast("Yeni bir radar varyantı üretildi");
  });

  function pushToInputs(){
    $("c1").value=S.c1; $("c2").value=S.c2; $("cs").value=S.cs;
    $("ang").value=S.ang; $("rad").value=S.rad; $("scl").value=S.scl;
    $("stk").value=S.stk; $("dot").value=S.dot; $("swp").value=S.swp;
    $("swi").value=S.swi; $("glw").value=S.glw; $("grn").value=S.grn;
    $("sym").value=S.sym; $("size").value=String(S.size); $("qual").value=String(S.qual);
  }

  $("dlOne").addEventListener("click", function(){
    var ss = effSS(S.size,S.qual);
    var cv = buildPNG(S.size,false,ss);
    toBlob(cv).then(function(b){
      var u = URL.createObjectURL(b); outURLs.push(u);
      var it = { name:"radar-icon-"+S.size+".png", blob:b, url:u, size:S.size };
      download(it,null);
    }).catch(function(){ toast("PNG üretilemedi, kaliteyi 1× yap","err"); });
  });
  $("dlOneMob").addEventListener("click", function(){ $("dlOne").click(); });
  $("dlAllTop").addEventListener("click", downloadAll);
  $("dlAllMob").addEventListener("click", downloadAll);

  Array.prototype.forEach.call(document.querySelectorAll(".tab"), function(t){
    t.addEventListener("click", function(){
      Array.prototype.forEach.call(document.querySelectorAll(".tab"), function(x){ x.classList.remove("on"); });
      Array.prototype.forEach.call(document.querySelectorAll(".pane"), function(x){ x.classList.remove("on"); });
      t.classList.add("on");
      $("pane-"+t.dataset.pane).classList.add("on");
      blip(560);
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll(".copy"), function(b){
    b.addEventListener("click", function(){ copyText($(b.dataset.copy).value,b); });
  });

  $("fbClose").addEventListener("click", function(){ $("fbModal").classList.remove("on"); });
  $("fbModal").addEventListener("click", function(e){ if (e.target === $("fbModal")) $("fbModal").classList.remove("on"); });
  $("fbCopy").addEventListener("click", function(){ copyText($("fbText").value,$("fbCopy")); });
  $("fbOpen").addEventListener("click", function(){
    var u = $("fbImg").src;
    var w = window.open(u,"_blank");
    if (!w) toast("Yeni sekme engellendi — görsele sağ tıkla","warn");
  });
  document.addEventListener("keydown", function(e){
    if (e.key === "Escape") $("fbModal").classList.remove("on");
  });

  /* ---------------- BAŞLAT ---------------- */
  pushToInputs(); syncLabels(); rebuildBase(); rebuildMaster(); updateCode(); refreshOutputs();
  rafId = requestAnimationFrame(frame);
  setTimeout(function(){
    toast("Beş ikon hazır — sağdaki rehber yükleme yerini gösteriyor");
  },700);
})();
</script>
</body>
</html>
