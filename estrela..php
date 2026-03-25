<?php
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

// Captura do IP
$clientIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'IP não identificado';
$clientIp = htmlspecialchars(trim(explode(',', (string)$clientIp)[0]), ENT_QUOTES, 'UTF-8');

// Prepara a estrutura garantindo que NENHUM mês de 2018 a 2023 fica de fora
$data = ['itau' => [], 'caixa' => []];
$meses = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];

for ($y = 2018; $y <= 2023; $y++) {
    foreach ($meses as $m) {
        $key = $m . '/' . $y;
        $data['itau'][$key] = [];
        $data['caixa'][$key] = [];
    }
}

// LÊ DIRETAMENTE DO FICHEIRO CSV (Ignorando o JSON incompleto)
$csvFile = 'extratos.csv';
if (!file_exists($csvFile) && file_exists('extratos')) {
    $csvFile = 'extratos'; // Fallback caso o ficheiro não tenha a extensão .csv no nome
}

if (file_exists($csvFile)) {
    $lines = file($csvFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $cols = explode(';', $line);
        if (count($cols) >= 4 && stripos($cols[0], 'Data') === false) {
            $dateStr = trim($cols[0]);
            $bankStr = strtoupper(trim($cols[1]));
            $descStr = trim($cols[2]);
            $valStr = trim($cols[3]);

            $dateParts = explode('/', $dateStr);
            if (count($dateParts) == 3) {
                $mIndex = (int)$dateParts[1] - 1;
                if ($mIndex >= 0 && $mIndex < 12) {
                    $key = $meses[$mIndex] . '/' . $dateParts[2];
                    $bankKey = (strpos($bankStr, 'ITAU') !== false) ? 'itau' : 'caixa';
                    
                    // Trata o valor (ex: "1.500,00 D" para -1500.00)
                    $isDebit = (stripos($valStr, 'D') !== false);
                    $num = preg_replace('/[^0-9,]/', '', $valStr);
                    $num = str_replace(',', '.', $num);
                    $floatVal = (float)$num;
                    if ($isDebit) $floatVal = -abs($floatVal);

                    if (isset($data[$bankKey][$key])) {
                        $data[$bankKey][$key][] = [
                            'date' => $dateStr,
                            'desc' => $descStr,
                            'amount' => $floatVal
                        ];
                    }
                }
            }
        }
    }
}
$jsonData = json_encode($data);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Extratos - Visualização Judicial</title>
<style>
*{box-sizing:border-box}
body{margin:0;padding:20px 12px 40px;background:#e9eef3;color:#1e2a3e;font-family:Arial,sans-serif}
.app{max-width:640px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 24px rgba(0,0,0,.08)}
.header{padding:24px 16px;text-align:center;background:#1f2f3c;color:#fff}
.tit{font-size:32px;font-weight:700}
.sub{margin-top:8px;font-size:13px;opacity:.9}
.tabs{display:flex;background:#f3f6fa;border-bottom:1px solid #dde5ee}
.tab{flex:1;padding:16px;border:0;background:transparent;font-size:18px;font-weight:700;cursor:pointer;color:#54606e}
.tab.active{background:#fff}
.tab.itau.active{border-bottom:3px solid #ec7000;color:#b65a00}
.tab.caixa.active{border-bottom:3px solid #005ca9;color:#004a88}
.content{padding:14px}
.month{border:1px solid #e8eef5;border-radius:18px;overflow:hidden;margin-bottom:14px}
.month-head{display:flex;justify-content:space-between;align-items:center;padding:16px;font-size:18px;font-weight:700;cursor:pointer;background:#fff}
.month-right{display:flex;align-items:center;gap:10px}
.badge{font-size:11px;font-weight:700;padding:4px 8px;border-radius:999px}
.badge.ok{background:#ecfdf3;color:#166534}
.badge.partial{background:#f1f5f9;color:#64748b}
.chev{font-size:16px;color:#64748b}
.month-body{display:none;border-top:1px solid #eef3f8}
.month-body.open{display:block}
.row{display:flex;justify-content:space-between;gap:10px;padding:12px 16px;border-bottom:1px solid #f1f5f9}
.left{min-width:0}
.date{display:inline-block;padding:2px 8px;border-radius:999px;background:#eef2f7;font-size:12px;font-weight:700}
.desc{margin-top:6px;font-size:15px;word-break:break-word}
.value{white-space:nowrap;font-weight:700}
.credit{color:#23743a}
.debit{color:#c43b2b}
.empty{text-align:center;color:#a1a8b3;padding:14px;font-size:13px;line-height:1.4;font-style:italic;background:#fafcff}
.msg{text-align:center;color:#64748b;padding:24px 16px;font-weight:bold;}
.note{margin:10px 14px 0;padding:10px 12px;border-radius:12px;background:#f8fafc;color:#475569;font-size:12px;border:1px solid #e2e8f0}
.footer{text-align:center;padding:18px;background:#f8fafc;border-top:1px solid #e6edf5}
.footer a{text-decoration:none;color:#1f6392;font-weight:700}
.watermark{position:fixed;right:10px;bottom:10px;background:rgba(0,0,0,.55);color:#fff;padding:6px 8px;border-radius:10px;font-size:10px;line-height:1.3;pointer-events:none}
.notice-bar{margin:12px 16px 0;background:#fff4e5;color:#7a4b00;border:1px solid #f3d19c;border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.45;font-weight:600}
.security-overlay{position:fixed;inset:0;background:rgba(10,15,25,.94);color:#fff;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;z-index:99999;opacity:0;pointer-events:none;transition:opacity .2s ease}
.security-overlay.show{opacity:1;pointer-events:auto}
.security-box{max-width:520px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:22px 18px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
.security-box h3{margin:0 0 10px;font-size:18px}
.security-box p{margin:0;font-size:14px;line-height:1.5;color:#e9eef8}
body.protected, body.protected *{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
body.protected img{-webkit-user-drag:none;user-drag:none}
body.blur-sensitive .app{filter:blur(14px);pointer-events:none}
.gate{position:fixed;inset:0;background:rgba(5,10,20,.96);z-index:999999;display:flex;align-items:center;justify-content:center;padding:22px}
.gate.hidden{display:none}
.gate-card{max-width:720px;width:100%;background:#fff;border-radius:18px;padding:26px 22px;box-shadow:0 22px 60px rgba(0,0,0,.35);border:2px solid #e7eef8}
.gate-title{margin:0 0 10px;font-size:24px;font-weight:800;color:#b42318;text-align:center}
.gate-text{font-size:15px;line-height:1.6;color:#344054;margin:0 0 18px;text-align:left}
.gate-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.gate-btn{appearance:none;border:0;border-radius:12px;padding:12px 18px;font-size:15px;font-weight:700;cursor:pointer}
.gate-btn.primary{background:#174ea6;color:#fff}
.gate-btn.secondary{background:#eef2f7;color:#344054}
.locked-content{filter:blur(12px);pointer-events:none;user-select:none}
@media print{body *{visibility:hidden !important} body::before{content:'IMPRESSÃO BLOQUEADA — Processo em segredo de justiça'; visibility:visible !important; display:block; position:fixed; inset:0; padding:40px 20px; background:#fff; color:#000; font:700 22px/1.4 Arial,sans-serif; text-align:center}}
</style>
</head>
<body class="protected">
<div class="security-overlay" id="securityOverlay"><div class="security-box"><h3>Acesso restrito</h3><p>Este processo tramita em segredo de justiça. Copiar, imprimir, salvar ou capturar a tela é desencorajado e poderá ser registado.</p></div></div>
<div class="gate" id="gateOverlay">
  <div class="gate-card">
    <h1 class="gate-title">Aviso de sigilo judicial</h1>
    <p class="gate-text">Este conteúdo contém dados protegidos por <strong>segredo de justiça</strong>. É proibido copiar, repassar, salvar, imprimir ou realizar capturas de tela sem autorização. O acesso é monitorizado e vinculado ao IP exibido na tela.</p>
    <p class="gate-text"><strong>IP identificado:</strong> <?php echo $clientIp; ?></p>
    <div class="gate-actions">
      <button class="gate-btn primary" id="acceptGate" type="button">Li e estou ciente</button>
      <button class="gate-btn secondary" id="leaveGate" type="button">Sair</button>
    </div>
  </div>
</div>
<div class="app locked-content" id="appContent">
  <div class="header">
    <div class="tit">E*** B*** M***</div>
    <div class="sub" id="resumeInfo">Itaú · Ag 1339 · CC 16890-6</div>
  </div>
  <div class="tabs">
    <button class="tab itau active" id="btnItau" type="button">Itaú</button>
    <button class="tab caixa" id="btnCaixa" type="button">Caixa</button>
  </div>
  <div class="note">A linha do tempo compreende estritamente de Jan/2018 a Dez/2023. Meses sem registos extraídos são assinalados no fluxo contínuo.</div>
  <div class="notice-bar">Aviso: processo em segredo de justiça. Não copie, não repasse, não imprima, não salve e não realize capturas de tela deste conteúdo. IP visível e acesso monitorizado.</div>
  <div class="content" id="mainContent"><div class="msg">A carregar dados...</div></div>
  <div class="footer"><a href="https://www.medeirosealbuquerqueadv.com.br" target="_blank" rel="noopener noreferrer">Escritório Medeiros &amp; Albuquerque Advogados</a></div>
</div>
<script>
(function(){
  var bank = 'itau';
  var dataStore = <?php echo $jsonData; ?>;

  function byId(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function money(v){
    var n = Number(v||0);
    return n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  }
  
  function render(){
    var wrap = byId('mainContent');
    var dataset = dataStore[bank] || {};
    var months = Object.keys(dataset); 
    
    // Verifica se os arrays estão realmente vazios (falha na leitura do CSV)
    var totalLancs = 0;
    months.forEach(function(m){ totalLancs += dataset[m].length; });

    if(totalLancs === 0){ 
      wrap.innerHTML = '<div class="msg" style="color:#b42318;">Erro: O ficheiro extratos.csv não foi encontrado ou está vazio. Por favor, coloque o ficheiro CSV na mesma pasta.</div>'; 
      return; 
    }
    
    var html = '';
    months.forEach(function(month, idx){
      var items = dataset[month];
      var isEmpty = items.length === 0;
      
      html += '<div class="month">';
      html += '<div class="month-head" data-target="m'+idx+'">';
      html += '<span>'+esc(month.replace('/', ' de '))+'</span>';
      html += '<span class="month-right">';
      html += isEmpty ? '<span class="badge partial">sem lançamentos extraídos</span>' : '<span class="badge ok">'+items.length+' lanç.</span>';
      html += '<span class="chev">▾</span>';
      html += '</span></div>';
      
      html += '<div class="month-body'+(idx===0?' open':'')+'" id="m'+idx+'">';
      if(isEmpty){
        html += '<div class="empty">Sem lançamentos detalhados processados para este mês.</div>';
      } else {
        items.forEach(function(item){
          var cls = Number(item.amount) < 0 ? 'debit' : 'credit';
          html += '<div class="row">';
          html += '<div class="left"><div class="date">'+esc(item.date||'')+'</div><div class="desc">'+esc(item.desc||'')+'</div></div>';
          html += '<div class="value '+cls+'">'+(Number(item.amount)<0?'- ':'')+money(Math.abs(Number(item.amount||0)))+'</div>';
          html += '</div>';
        });
      }
      html += '</div></div>';
    });
    
    wrap.innerHTML = html;
    
    var headers = document.querySelectorAll('.month-head');
    for(var i=0; i<headers.length; i++) {
      headers[i].addEventListener('click', function(){
        var body = byId(this.getAttribute('data-target'));
        if(body) body.classList.toggle('open');
      });
    }
    
    if(bank === 'itau') {
      byId('resumeInfo').textContent = 'Itaú · Ag 1339 · CC 16890-6';
    } else {
      byId('resumeInfo').textContent = 'Caixa · Ag 33 · Op 001 · CC 13608-2';
    }
  }
  
  byId('btnItau').addEventListener('click', function(){ bank='itau'; this.classList.add('active'); byId('btnCaixa').classList.remove('active'); render(); });
  byId('btnCaixa').addEventListener('click', function(){ bank='caixa'; this.classList.add('active'); byId('btnItau').classList.remove('active'); render(); });

  function showSecurityNotice(message, hold){
    var overlay = byId('securityOverlay');
    if(!overlay) return;
    var p = overlay.querySelector('p');
    if(p && message) p.textContent = message;
    overlay.classList.add('show');
    clearTimeout(showSecurityNotice._t);
    if(!hold){
      showSecurityNotice._t = setTimeout(function(){ overlay.classList.remove('show'); }, 1800);
    }
  }
  
  function hardenProtection(){
    document.addEventListener('contextmenu', function(e){ e.preventDefault(); showSecurityNotice('Clique direito desativado. Processo em segredo de justiça.'); });
    ['copy','cut','paste','dragstart','selectstart'].forEach(function(evt){
      document.addEventListener(evt, function(e){ e.preventDefault(); showSecurityNotice('Ação bloqueada para proteção do conteúdo sigiloso.'); });
    });
    document.addEventListener('keydown', function(e){
      var key = (e.key || '').toLowerCase();
      var blockedCombo = (e.ctrlKey || e.metaKey) && ['p','s','c','u','x','a'].indexOf(key) >= 0;
      var blockedKey = key === 'printscreen' || e.keyCode === 44 || key === 'f12';
      if(blockedCombo || blockedKey){
        e.preventDefault();
        e.stopPropagation();
        try{ navigator.clipboard && navigator.clipboard.writeText && navigator.clipboard.writeText(''); }catch(_e){}
        document.body.classList.add('blur-sensitive');
        showSecurityNotice('Atalho bloqueado. Impressão, salvamento, cópia e tentativas de capturas estão desativados neste documento.', true);
        setTimeout(function(){ if(!document.hidden) document.body.classList.remove('blur-sensitive'); var overlay = byId('securityOverlay'); var gate = byId('gateOverlay'); if(overlay && gate && gate.classList.contains('hidden')) overlay.classList.remove('show'); }, 2200);
      }
    }, true);
    window.addEventListener('beforeprint', function(){
      showSecurityNotice('Impressão bloqueada. Este conteúdo é sigiloso.', true);
      setTimeout(function(){ window.stop && window.stop(); }, 0);
    });
    window.addEventListener('afterprint', function(){
      var overlay = byId('securityOverlay'); if(overlay) overlay.classList.remove('show');
    });
    document.addEventListener('visibilitychange', function(){
      if(document.hidden){
        document.body.classList.add('blur-sensitive');
      } else {
        document.body.classList.remove('blur-sensitive');
      }
    });
  }

  function unlockContent(){
    var app = byId('appContent');
    if(app) app.classList.remove('locked-content');
    var gate = byId('gateOverlay');
    if(gate) gate.classList.add('hidden');
    var overlay = byId('securityOverlay');
    if(overlay) overlay.classList.remove('show');
  }
  
  function initGate(){
    var gate = byId('gateOverlay');
    var accept = byId('acceptGate');
    var leave = byId('leaveGate');
    if(accept) accept.addEventListener('click', unlockContent);
    if(leave) leave.addEventListener('click', function(){ history.back(); });
    if(gate) gate.classList.remove('hidden');
    showSecurityNotice('Confirme o aviso de sigilo para visualizar os dados.', true);
  }

  render();
  hardenProtection();
  initGate();
  
  (function(){
    function getDeviceInfo() {
      var ua = navigator.userAgent || '';
      if (ua.includes('iPhone')) return 'iPhone';
      if (ua.includes('Android')) return 'Android';
      if (ua.includes('Windows')) return 'Windows';
      return 'Desktop';
    }
    var wm = document.createElement('div');
    wm.className = 'watermark';
    wm.innerHTML = 'Segredo de justiça<br>IP: <?php echo $clientIp; ?><br>'+new Date().toLocaleString('pt-BR')+'<br>'+getDeviceInfo();
    document.body.appendChild(wm);
  })();
})();
</script>
</body>
</html>