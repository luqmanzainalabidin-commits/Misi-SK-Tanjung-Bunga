(() => {
  'use strict';

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
  const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  const fmtTime = sec => `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(Math.floor(sec%60)).padStart(2,'0')}`;
  const escapeHtml = str => String(str).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  const STORAGE = {
    board: 'misi14_leaderboard_v1',
    save: 'misi14_save_v1',
    audio: 'misi14_audio_v1'
  };

  const locations = {
    pagar: {name:'Pagar Masuk', x:125, y:560},
    pejabat: {name:'Pejabat & Dewan', x:330, y:690},
    makmal: {name:'Makmal Komputer', x:285, y:290},
    pra: {name:'Pra Sekolah', x:575, y:315},
    ppki: {name:'Kelas PPKI', x:800, y:310},
    blok: {name:'Blok Utama', x:710, y:820},
    kantin: {name:'Kantin', x:860, y:690},
    padang: {name:'Padang', x:1085, y:620},
    pulang: {name:'Pagar Pulang', x:1010, y:840}
  };

  const missions = [
    {
      id:1,value:'Hemah Tinggi',icon:'💬',location:'pagar',type:'choice',
      title:'Salam di Pagar Sekolah',
      scenario:'Guru bertugas menyambut anda di pagar sekolah. Apakah ucapan yang paling sesuai?',
      choices:['“Selamat pagi, cikgu.”','“Hoi cikgu!”','Terus berjalan tanpa menyapa.'],correct:0,
      hint:'Pilih ucapan yang sopan apabila bertemu guru.',
      reflection:'Bahasa yang sopan menunjukkan hemah tinggi dan menjaga perasaan orang lain.'
    },
    {
      id:2,value:'Hormat',icon:'🙋',location:'pagar',type:'sequence',
      title:'Masuk Dengan Tertib',
      scenario:'Guru meminta murid masuk ke sekolah dengan tertib. Susun tindakan berikut mengikut urutan yang baik.',
      items:['Beratur dengan rakan','Dengar arahan guru','Masuk ke kawasan sekolah'],order:[0,1,2],
      hint:'Mulakan dengan beratur, kemudian dengar arahan sebelum bergerak.',
      reflection:'Mengikut arahan dan menjaga tertib ialah salah satu cara menunjukkan hormat.'
    },
    {
      id:3,value:'Berterima Kasih',icon:'🙏',location:'pejabat',type:'choice',
      title:'Bantuan di Pejabat',
      scenario:'Kerani sekolah membantu anda mencari buku rekod yang diperlukan. Apakah respons anda?',
      choices:['Ucapkan “Terima kasih.”','Ambil buku dan terus pergi.','Kata “Cepatlah!”'],correct:0,
      hint:'Fikirkan bagaimana kita menghargai bantuan orang lain.',
      reflection:'Ucapan terima kasih menunjukkan kita menghargai pertolongan yang diterima.'
    },
    {
      id:4,value:'Bertanggungjawab',icon:'📨',location:'pejabat',type:'sequence',
      title:'Hantar Surat Dengan Betul',
      scenario:'Guru memberi anda sepucuk surat untuk dihantar ke pejabat. Pilih langkah mengikut urutan yang betul.',
      items:['Bawa surat dengan cermat','Pergi ke pejabat','Serahkan kepada guru/kerani'],order:[0,1,2],
      hint:'Jaga amanah, pergi ke tempat yang betul dan serahkan kepada penerima.',
      reflection:'Melaksanakan amanah hingga selesai menunjukkan sikap bertanggungjawab.'
    },
    {
      id:5,value:'Kejujuran',icon:'🛡️',location:'makmal',type:'choice',
      title:'Pendrive Yang Tertinggal',
      scenario:'Anda ternampak sebuah pendrive tertinggal di meja makmal komputer. Tiada siapa sedang melihat.',
      choices:['Serahkan kepada guru makmal.','Simpan untuk diri sendiri.','Sembunyikan supaya orang lain tidak jumpa.'],correct:0,
      hint:'Barang yang bukan milik kita perlu dipulangkan kepada pihak yang boleh membantu pemiliknya.',
      reflection:'Bersikap jujur bermaksud melakukan perkara yang betul walaupun tiada siapa melihat.'
    },
    {
      id:6,value:'Kerajinan',icon:'💻',location:'makmal',type:'sequence',
      title:'Siapkan Tugasan Komputer',
      scenario:'Guru memberi tugasan ringkas. Susun langkah kerja supaya tugasan dapat disiapkan dengan tekun.',
      items:['Baca arahan tugasan','Siapkan tugasan dengan teliti','Semak sebelum hantar'],order:[0,1,2],
      hint:'Fahami arahan dahulu, buat dengan teliti, kemudian semak.',
      reflection:'Rajin bermaksud berusaha bersungguh-sungguh dan tidak mudah berputus asa.'
    },
    {
      id:7,value:'Baik Hati',icon:'🖍️',location:'pra',type:'collect',
      title:'Pensel Warna Bertaburan',
      scenario:'Seorang murid pra sekolah menjatuhkan pensel warnanya. Bantu kutip semua barang yang bertaburan.',
      items:['🖍️','✏️','📕','🧽','📗'],
      hint:'Tekan semua barang yang bertaburan untuk membantu.',
      reflection:'Membantu orang yang memerlukan tanpa mengharapkan balasan menunjukkan sikap baik hati.'
    },
    {
      id:8,value:'Kasih Sayang',icon:'❤️',location:'pra',type:'choice',
      title:'Rakan Kecil Sedang Sedih',
      scenario:'Seorang murid pra sekolah menangis kerana tidak menjumpai begnya. Apakah tindakan terbaik?',
      choices:['Tenangkan dia dan bantu mencari beg.','Ketawakan dia.','Biarkan dan terus berjalan.'],correct:0,
      hint:'Tunjukkan bahawa anda mengambil berat tentang perasaannya.',
      reflection:'Kasih sayang ditunjukkan melalui perhatian, bantuan dan sikap mengambil berat.'
    },
    {
      id:9,value:'Toleransi',icon:'🤝',location:'ppki',type:'choice',
      title:'Belajar Dengan Cara Berbeza',
      scenario:'Seorang rakan PPKI memerlukan sedikit masa tambahan untuk menyiapkan aktiviti kumpulan.',
      choices:['Tunggu dan bantu mengikut kemampuannya.','Marah kerana dia lambat.','Keluarkan dia daripada kumpulan.'],correct:0,
      hint:'Setiap orang mempunyai keperluan dan kebolehan yang berbeza.',
      reflection:'Toleransi ialah bertolak ansur, sabar dan menghormati perbezaan.'
    },
    {
      id:10,value:'Keadilan',icon:'⚖️',location:'ppki',type:'distribute',
      title:'Bahagi Pensel Dengan Adil',
      scenario:'Terdapat 6 batang pensel untuk 3 orang murid. Bahagikan dengan sama rata.',
      total:6,targets:['Aiman','Siti','Kumar'],targetEach:2,
      hint:'Semua murid perlu menerima jumlah yang sama.',
      reflection:'Berlaku adil bermaksud memberi hak yang sewajarnya kepada setiap orang.'
    },
    {
      id:11,value:'Kerjasama',icon:'🧹',location:'blok',type:'sequence',
      title:'Kelas Bersih, Hati Gembira',
      scenario:'Kelas perlu dikemas sebelum aktiviti seterusnya. Susun cara bekerja secara bekerjasama.',
      items:['Bahagikan tugas','Laksanakan tugas bersama','Periksa kelas selepas siap'],order:[0,1,2],
      hint:'Kerjasama bermula dengan pembahagian tugas yang jelas.',
      reflection:'Kerjasama menjadikan tugasan lebih mudah dan mengeratkan hubungan.'
    },
    {
      id:12,value:'Kepercayaan kepada Tuhan',icon:'🌟',location:'blok',type:'choice',
      title:'Hormati Amalan Keagamaan',
      scenario:'Rakan anda sedang menjalankan amalan keagamaan sebelum aktiviti bermula. Apakah tindakan anda?',
      choices:['Beri ruang dan tunggu dengan tertib.','Ganggu supaya cepat selesai.','Ejek amalan tersebut.'],correct:0,
      hint:'Hormati amalan keagamaan orang lain walaupun berbeza daripada kita.',
      reflection:'Menghormati kepercayaan dan amalan keagamaan membantu mewujudkan suasana harmoni.'
    },
    {
      id:13,value:'Kesederhanaan',icon:'🍱',location:'kantin',type:'choice',
      title:'Ambil Secukupnya',
      scenario:'Di kantin, anda masih ada aktiviti selepas rehat. Pilihan manakah menunjukkan kesederhanaan?',
      choices:['Ambil satu hidangan dan minuman secukupnya.','Ambil banyak makanan walaupun mungkin tidak habis.','Beli semua makanan kegemaran sekaligus.'],correct:0,
      hint:'Pilih berdasarkan keperluan, bukan berlebihan.',
      reflection:'Kesederhanaan membantu kita mengelakkan pembaziran dan membuat pilihan yang wajar.'
    },
    {
      id:14,value:'Keberanian',icon:'🦁',location:'padang',type:'choice',
      title:'Berani Membantu Rakan',
      scenario:'Di padang, anda nampak seorang murid menolak dan mengejek rakannya berulang kali. Apakah tindakan terbaik?',
      choices:['Dapatkan bantuan guru dan pastikan rakan selamat.','Ikut ketawa bersama.','Berpura-pura tidak nampak.'],correct:0,
      hint:'Berani bukan bermaksud bergaduh. Dapatkan bantuan orang dewasa yang dipercayai.',
      reflection:'Keberanian moral ialah berani melakukan perkara yang betul dengan cara yang selamat.'
    }
  ];

  const state = {
    player:{name:'',avatar:'boy',x:125,y:600,dir:'down'},
    missionIndex:0,
    completed:[],
    score:0,
    streak:0,
    streakBonus:0,
    stars:0,
    startedAt:0,
    elapsedBefore:0,
    pausedAt:0,
    pauseAccum:0,
    audioEnabled:true,
    running:false,
    paused:false,
    keys:{},
    touchMove:null,
    lastTs:0,
    camera:{x:0,y:0},
    currentLocation:'Pagar Masuk'
  };

  const mapImg = new Image();
  mapImg.src = 'assets/map-sekolah.png';
  const canvas = $('#gameCanvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // ---------- Audio V1.1: file-based SFX + optional BGM ----------
  class AudioEngine {
    constructor(){
      this.ctx=null; this.enabled=true; this.timer=null; this.step=0; this.mode='menu';
      this.bgm=null;
      this.sfxFiles={
        click:'assets/audio/sfx/click.wav',
        good:'assets/audio/sfx/good.wav',
        bad:'assets/audio/sfx/bad.wav',
        collect:'assets/audio/sfx/collect.wav',
        complete:'assets/audio/sfx/complete.wav',
        streak:'assets/audio/sfx/streak.wav',
        popup:'assets/audio/sfx/popup.wav',
        victory:'assets/audio/sfx/victory.wav'
      };
      this.bgmFiles={
        menu:'assets/audio/bgm/menu-theme.mp3',
        game:'assets/audio/bgm/school-map-theme.mp3',
        result:'assets/audio/bgm/ending-theme.mp3'
      };
    }
    ensure(){
      if(!this.ctx){ const AC=window.AudioContext||window.webkitAudioContext; if(AC) this.ctx=new AC(); }
      if(this.ctx && this.ctx.state==='suspended') this.ctx.resume();
    }
    setEnabled(v){
      this.enabled=!!v; localStorage.setItem(STORAGE.audio, JSON.stringify(this.enabled));
      this.updateButtons(); if(!v)this.stopBgm(); else this.startBgm(this.mode);
    }
    updateButtons(){
      const icon=this.enabled?'🔊':'🔇';
      ['btnHomeAudio','btnAudio'].forEach(id=>{const el=$('#'+id);if(el)el.textContent=icon;});
      const p=$('#btnPauseAudio'); if(p)p.textContent=`${icon} Muzik & Bunyi`;
    }
    note(freq,dur=.12,type='square',vol=.035,when=0){
      if(!this.enabled)return; this.ensure(); if(!this.ctx)return;
      const t=this.ctx.currentTime+when, o=this.ctx.createOscillator(), g=this.ctx.createGain();
      o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
      o.connect(g).connect(this.ctx.destination);o.start(t);o.stop(t+dur+.03);
    }
    fallbackSfx(kind){
      const sets={
        click:[[660,.06],[880,.06,.06]],
        good:[[523,.08],[659,.08,.08],[784,.12,.16]],
        bad:[[220,.1],[175,.14,.09]],
        collect:[[880,.05],[1175,.08,.05]],
        complete:[[523,.08],[659,.08,.08],[784,.08,.16],[1046,.18,.24]],
        streak:[[659,.05],[784,.05,.05],[988,.05,.10],[1318,.15,.16]],
        popup:[[440,.04],[660,.06,.04]],
        victory:[[523,.08],[659,.08,.08],[784,.08,.16],[1046,.12,.24],[1318,.22,.36]]
      };
      (sets[kind]||sets.click).forEach(([f,d,w=0])=>this.note(f,d,'square',.05,w));
    }
    sfx(kind){
      if(!this.enabled)return;
      const src=this.sfxFiles[kind];
      if(!src){this.fallbackSfx(kind);return;}
      const a=new Audio(src); a.volume = kind==='bad' ? .38 : .55;
      a.play().catch(()=>this.fallbackSfx(kind));
    }
    startProceduralBgm(mode='menu'){
      const tracks={
        menu:[523,659,784,659,587,698,880,698,523,659,784,1046,880,784,659,587],
        game:[392,523,659,523,440,587,698,587,392,494,659,494,440,554,698,554],
        result:[523,659,784,1046,784,880,1046,1318]
      };
      const seq=tracks[mode]||tracks.game; this.step=0;
      this.timer=setInterval(()=>{
        if(!this.enabled||state.paused)return;
        const f=seq[this.step%seq.length];
        this.note(f,.13,'triangle',.018);
        if(this.step%4===0)this.note(f/2,.18,'square',.010);
        this.step++;
      },250);
    }
    startBgm(mode='menu'){
      this.mode=mode; this.stopBgm(); if(!this.enabled)return;
      const src=this.bgmFiles[mode];
      if(!src){this.startProceduralBgm(mode);return;}
      const a=new Audio(src);
      a.loop=true; a.volume = mode==='game' ? .20 : .26;
      this.bgm=a;
      a.play().catch(()=>{
        if(this.bgm===a)this.bgm=null;
        this.startProceduralBgm(mode);
      });
    }
    stopBgm(){
      if(this.timer){clearInterval(this.timer);this.timer=null;}
      if(this.bgm){this.bgm.pause();this.bgm.currentTime=0;this.bgm=null;}
    }
    victory(){
      this.stopBgm();
      this.sfx('victory');
      setTimeout(()=>this.startBgm('result'),900);
    }
  }
  const audio = new AudioEngine();
  try { const saved=JSON.parse(localStorage.getItem(STORAGE.audio)); if(typeof saved==='boolean') state.audioEnabled=saved; } catch{}
  audio.enabled=state.audioEnabled; audio.updateButtons();

  // ---------- Avatar pixel drawing ----------
  function drawAvatar(g,x,y,avatar='boy',dir='down',scale=1,walking=false){
    g.save();g.translate(Math.round(x),Math.round(y));g.scale(scale,scale);g.imageSmoothingEnabled=false;
    const hair=avatar==='boy'?'#3b261d':'#2e211c', skin='#f3bc91', shirt='#ffffff', blue='#173f73', shoe='#17191d';
    const bob=walking?1:0;
    // shadow
    g.fillStyle='rgba(0,0,0,.22)';g.fillRect(-9,14,18,5);
    // legs / skirt
    if(avatar==='girl'){
      g.fillStyle=blue;g.fillRect(-8,5+bob,16,9);g.fillRect(-6,14+bob,5,7);g.fillRect(2,14+bob,5,7);
    }else{
      g.fillStyle=blue;g.fillRect(-7,6+bob,6,13);g.fillRect(2,6+bob,6,13);
    }
    g.fillStyle=shoe;g.fillRect(-8,18+bob,7,4);g.fillRect(2,18+bob,7,4);
    // body
    g.fillStyle=shirt;g.fillRect(-9,-6+bob,18,13);g.strokeStyle='#a9c3da';g.lineWidth=1;g.strokeRect(-9,-6+bob,18,13);
    g.fillStyle='#24578c';g.fillRect(-1,-5+bob,2,10);
    // arms
    g.fillStyle=skin;g.fillRect(-12,-4+bob,3,10);g.fillRect(9,-4+bob,3,10);
    // head
    g.fillStyle=skin;g.fillRect(-8,-18+bob,16,13);
    // hair depends direction
    g.fillStyle=hair;g.fillRect(-9,-20+bob,18,5);g.fillRect(-9,-18+bob,3,9);g.fillRect(6,-18+bob,3,9);
    if(avatar==='girl'){g.fillRect(-11,-17+bob,3,10);g.fillRect(8,-17+bob,3,10);g.fillRect(-12,-9+bob,4,5);g.fillRect(8,-9+bob,4,5);}
    if(dir!=='up'){
      g.fillStyle='#2a2a2a';g.fillRect(-4,-13+bob,2,2);g.fillRect(3,-13+bob,2,2);
    }
    // backpack hint
    if(dir==='up'){g.fillStyle='#6b4226';g.fillRect(-7,-7+bob,14,11);}
    g.restore();
  }

  function renderAvatarPreviews(){
    $$('.avatar-preview').forEach(c=>{const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.imageSmoothingEnabled=false;drawAvatar(g,c.width/2,c.height/2+18,c.dataset.preview,'down',3.2,false);});
    const h=$('#hudAvatar'); if(h){const g=h.getContext('2d');g.clearRect(0,0,h.width,h.height);drawAvatar(g,23,28,state.player.avatar,'down',1.25,false);}
  }
  renderAvatarPreviews();

  // ---------- Screen & modal helpers ----------
  function showScreen(name){
    $$('.screen').forEach(s=>s.classList.remove('active'));
    const el=$(`#screen-${name}`); if(el)el.classList.add('active');
    if(name==='home')audio.startBgm('menu');
    if(name==='game')audio.startBgm('game');
    if(name==='result')audio.startBgm('result');
  }
  function showToast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>t.classList.remove('show'),1800);}
  function openModal(html, closable=true){$('#modalBody').innerHTML=html;$('#modal').classList.remove('hidden');$('#modalClose').style.display=closable?'grid':'none';state.paused=true;audio.sfx('popup');}
  function closeModal(){ $('#modal').classList.add('hidden');$('#modalBody').innerHTML='';state.paused=false; state.lastTs=performance.now(); }
  $('#modalClose').addEventListener('click',closeModal);
  $('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});

  // ---------- Local leaderboard/save ----------
  function getBoard(){try{return JSON.parse(localStorage.getItem(STORAGE.board))||[]}catch{return[]}}
  function saveBoard(entry){
    const board=getBoard();board.push(entry);board.sort((a,b)=>b.score-a.score||a.time-b.time);const top=board.slice(0,5);localStorage.setItem(STORAGE.board,JSON.stringify(top));return top;
  }
  function renderBoard(target,currentName=''){
    const box=typeof target==='string'?$(target):target;const board=getBoard();
    if(!board.length){box.innerHTML='<div class="empty-board">Belum ada rekod. Jadilah pemain pertama! 🌱</div>';return;}
    box.innerHTML=board.map((r,i)=>`<div class="leader-row ${r.name===currentName?'me':''}"><div class="leader-rank">${i+1}</div><div class="leader-name">${r.avatar==='girl'?'👧':'👦'} ${escapeHtml(r.name)}</div><div class="leader-score">${r.score}</div></div>`).join('');
  }
  function saveProgress(){
    if(!state.running)return;
    const payload={player:state.player,missionIndex:state.missionIndex,completed:state.completed,score:state.score,streak:state.streak,streakBonus:state.streakBonus,stars:state.stars,elapsed:getElapsed()};
    localStorage.setItem(STORAGE.save,JSON.stringify(payload));updateContinueButton();
  }
  function clearSave(){localStorage.removeItem(STORAGE.save);updateContinueButton();}
  function loadSave(){try{return JSON.parse(localStorage.getItem(STORAGE.save))}catch{return null}}
  function updateContinueButton(){const has=!!loadSave();$('#btnContinue').classList.toggle('hidden',!has);}
  updateContinueButton();

  // ---------- Home/profile ----------
  $('#btnStart').addEventListener('click',()=>{audio.ensure();audio.sfx('click');$('#playerName').value='';$$('.avatar-choice').forEach(x=>x.classList.remove('selected'));state.player.avatar='boy';showScreen('profile');});
  $('#btnContinue').addEventListener('click',()=>{audio.ensure();audio.sfx('click');const s=loadSave();if(!s)return;Object.assign(state,{missionIndex:s.missionIndex||0,completed:s.completed||[],score:s.score||0,streak:s.streak||0,streakBonus:s.streakBonus||0,stars:s.stars||0,elapsedBefore:s.elapsed||0,pauseAccum:0,startedAt:performance.now(),running:true,paused:false});state.player={...state.player,...s.player};renderAvatarPreviews();syncHud();showScreen('game');resizeCanvas();requestAnimationFrame(loop);});
  $('#btnHow').addEventListener('click',()=>{audio.sfx('click');openModal(`<div class="mission-badge">📖 CARA MAIN</div><h2>Mudah sahaja!</h2><p><strong>1.</strong> Gerakkan avatar menggunakan D-pad atau kekunci arah/WASD.</p><p><strong>2.</strong> Pergi ke lokasi bertanda <strong>!</strong> dan tekan <strong>Interaksi</strong>.</p><p><strong>3.</strong> Selesaikan 14 misi moral. Cubaan pertama, tanpa hint dan jawapan sempurna memberi bonus.</p><p><strong>4.</strong> Lengkapkan semua nilai dan cuba rebut tempat Top 5!</p><div class="feedback-box feedback-good">Tip: kelajuan memberi sedikit bonus, tetapi ketepatan lebih penting. 🌱</div>`);});
  $('#btnLeaderboard').addEventListener('click',()=>{audio.sfx('click');openModal(`<div class="mission-badge">🏆 LEADERBOARD</div><h2>Top 5 Peranti Ini</h2><div id="modalBoard" class="leaderboard-list"></div>`);renderBoard($('#modalBoard'));});
  $('#btnHomeAudio').addEventListener('click',()=>{audio.ensure();audio.setEnabled(!audio.enabled);audio.sfx('click');});
  $$('[data-go="home"]').forEach(b=>b.addEventListener('click',()=>{audio.sfx('click');showScreen('home');}));

  $$('.avatar-choice').forEach(btn=>btn.addEventListener('click',()=>{
    audio.sfx('click');$$('.avatar-choice').forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-checked','false')});btn.classList.add('selected');btn.setAttribute('aria-checked','true');state.player.avatar=btn.dataset.avatar;renderAvatarPreviews();
  }));
  $('#btnBeginMission').addEventListener('click',()=>{
    const name=$('#playerName').value.trim();const selected=$('.avatar-choice.selected');
    if(!name){$('#profileError').textContent='Masukkan nama dahulu.';return;}
    if(!selected){$('#profileError').textContent='Pilih avatar lelaki atau perempuan.';return;}
    $('#profileError').textContent='';state.player.name=name.slice(0,12);audio.sfx('good');$('#introGreeting').textContent=`Selamat datang, ${state.player.name}!`;showScreen('intro');
  });
  $('#btnEnterSchool').addEventListener('click',()=>{audio.sfx('click');newGame();});

  // ---------- Game state ----------
  function newGame(){
    Object.assign(state,{missionIndex:0,completed:[],score:0,streak:0,streakBonus:0,stars:0,elapsedBefore:0,pauseAccum:0,startedAt:performance.now(),pausedAt:0,running:true,paused:false,lastTs:performance.now()});
    state.player.x=locations.pagar.x;state.player.y=locations.pagar.y+70;state.player.dir='up';clearSave();renderAvatarPreviews();syncHud();showScreen('game');resizeCanvas();requestAnimationFrame(loop);
  }
  function getElapsed(){
    if(!state.running)return state.elapsedBefore||0;
    let now=performance.now();let elapsed=(now-state.startedAt-state.pauseAccum)/1000+state.elapsedBefore;return Math.max(0,elapsed);
  }
  function currentMission(){return missions[state.missionIndex]||null;}
  function syncHud(){
    $('#hudName').textContent=state.player.name||'Pemain';$('#hudScore').textContent=state.score;$('#hudValues').textContent=`${state.completed.length}/14`;$('#hudStreak').textContent=state.streak;$('#hudLocation').textContent=state.currentLocation;
    const m=currentMission();if(m){$('#questTitle').textContent=`${m.id}. ${m.value}`;$('#questHint').textContent=`Pergi ke ${locations[m.location].name}`;}else{$('#questTitle').textContent='Semua nilai lengkap!';$('#questHint').textContent='Pergi ke Pagar Pulang';}
    renderAvatarPreviews();
  }

  const blockers=[
    {x:130,y:75,w:285,h:180},{x:450,y:80,w:245,h:220},{x:720,y:80,w:195,h:200},
    {x:145,y:650,w:335,h:170},{x:500,y:335,w:390,h:390}
  ];
  function canMove(nx,ny){
    const r=13;if(nx<65||ny<65||nx>1380||ny>850)return false;
    for(const b of blockers){if(nx+r>b.x&&nx-r<b.x+b.w&&ny+r>b.y&&ny-r<b.y+b.h)return false;}
    return true;
  }
  function updateLocation(){
    let best={name:'Laluan Sekolah',d:Infinity};Object.values(locations).forEach(l=>{const d=Math.hypot(state.player.x-l.x,state.player.y-l.y);if(d<best.d){best={name:l.name,d}}});state.currentLocation=best.d<180?best.name:'Laluan Sekolah';$('#hudLocation').textContent=state.currentLocation;
  }

  function resizeCanvas(){
    const stage=$('#gameStage');const dpr=Math.min(window.devicePixelRatio||1,2);const rect=stage.getBoundingClientRect();canvas.width=Math.max(640,Math.floor(rect.width*dpr));canvas.height=Math.max(360,Math.floor(rect.height*dpr));canvas.style.width=rect.width+'px';canvas.style.height=rect.height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;canvas._cssW=rect.width;canvas._cssH=rect.height;
  }
  window.addEventListener('resize',()=>{if($('#screen-game').classList.contains('active'))resizeCanvas();});

  function update(dt){
    if(!state.running||state.paused)return;
    let dx=0,dy=0;const speed=185;
    if(state.keys.ArrowUp||state.keys.w||state.touchMove==='up')dy-=1;
    if(state.keys.ArrowDown||state.keys.s||state.touchMove==='down')dy+=1;
    if(state.keys.ArrowLeft||state.keys.a||state.touchMove==='left')dx-=1;
    if(state.keys.ArrowRight||state.keys.d||state.touchMove==='right')dx+=1;
    if(dx||dy){const len=Math.hypot(dx,dy);dx/=len;dy/=len;if(Math.abs(dx)>Math.abs(dy))state.player.dir=dx>0?'right':'left';else state.player.dir=dy>0?'down':'up';const nx=state.player.x+dx*speed*dt,ny=state.player.y+dy*speed*dt;if(canMove(nx,state.player.y))state.player.x=nx;if(canMove(state.player.x,ny))state.player.y=ny;updateLocation();}
  }

  function render(ts){
    const w=canvas._cssW||canvas.clientWidth,h=canvas._cssH||canvas.clientHeight;ctx.clearRect(0,0,w,h);
    if(!mapImg.complete)return;
    // camera shows part of the full 1448x1086 map; zoom varies by viewport
    const zoom=clamp(Math.min(w/920,h/540),0.72,1.25);const vw=w/zoom,vh=h/zoom;
    const targetX=state.player.x-vw/2,targetY=state.player.y-vh/2;
    state.camera.x+=(clamp(targetX,0,mapImg.width-vw)-state.camera.x)*.12;state.camera.y+=(clamp(targetY,0,mapImg.height-vh)-state.camera.y)*.12;
    ctx.save();ctx.scale(zoom,zoom);ctx.drawImage(mapImg,-state.camera.x,-state.camera.y);
    // dim outside playable lower road a little
    const m=currentMission();const target=m?locations[m.location]:locations.pulang;
    const sx=target.x-state.camera.x,sy=target.y-state.camera.y;
    const pulse=1+Math.sin(ts/180)*.12;ctx.save();ctx.translate(sx,sy);ctx.scale(pulse,pulse);ctx.fillStyle='#ffcf32';ctx.strokeStyle='#8e5700';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-28,18,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#6b4000';ctx.font='900 24px Trebuchet MS';ctx.textAlign='center';ctx.fillText('!',0,-20);ctx.restore();
    const moving=!!(state.keys.ArrowUp||state.keys.ArrowDown||state.keys.ArrowLeft||state.keys.ArrowRight||state.keys.w||state.keys.a||state.keys.s||state.keys.d||state.touchMove);
    drawAvatar(ctx,state.player.x-state.camera.x,state.player.y-state.camera.y,state.player.avatar,state.player.dir,1.35,moving && Math.floor(ts/150)%2===0);
    ctx.restore();
  }

  function loop(ts){
    if(!state.running)return;const dt=Math.min(.035,(ts-(state.lastTs||ts))/1000);state.lastTs=ts;update(dt);render(ts);requestAnimationFrame(loop);
  }

  document.addEventListener('keydown',e=>{
    const k=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','e','w','a','s','d'].includes(k)){if(!['INPUT','TEXTAREA'].includes(document.activeElement.tagName))e.preventDefault();}
    state.keys[k]=true;if((k==='e'||k===' ')&&$('#screen-game').classList.contains('active')&&!state.paused)interact();
  });
  document.addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;state.keys[k]=false;});
  $$('.dpad button').forEach(b=>{
    const start=e=>{e.preventDefault();state.touchMove=b.dataset.move;};const stop=e=>{e.preventDefault();if(state.touchMove===b.dataset.move)state.touchMove=null;};
    b.addEventListener('pointerdown',start);b.addEventListener('pointerup',stop);b.addEventListener('pointercancel',stop);b.addEventListener('pointerleave',stop);
  });
  $('#btnInteract').addEventListener('click',interact);

  function interact(){
    audio.sfx('click');const m=currentMission();const target=m?locations[m.location]:locations.pulang;
    if(dist(state.player,target)>100){showToast(`Pergi lebih dekat ke ${target.name}.`);return;}
    if(!m){finishGame();return;}
    openMission(m);
  }

  // ---------- Mission rendering ----------
  function openMission(m){
    const missionRun={attempts:1,hintUsed:false,mistakes:0,sequence:[],collected:new Set(),dist:Array(3).fill(0),remaining:m.total||0};
    openModal('',false);renderMission(m,missionRun);
  }
  function baseMissionHtml(m,inner,run){
    return `<div class="mission-badge">${m.icon} NILAI ${m.id}/14 · ${escapeHtml(m.value)}</div><h2>${escapeHtml(m.title)}</h2><p>${escapeHtml(m.scenario)}</p>${inner}<div class="hint-row"><div class="mission-meta">Cubaan: <strong>${run.attempts}</strong> · Hint: <strong>${run.hintUsed?'Digunakan':'Belum'}</strong></div><button id="missionHint" class="hint-btn">💡 Hint</button></div><div id="missionFeedback"></div>`;
  }
  function bindHint(m,run){const h=$('#missionHint');if(!h)return;h.addEventListener('click',()=>{run.hintUsed=true;h.disabled=true;h.textContent='💡 '+m.hint;h.style.maxWidth='70%';audio.sfx('click');});}
  function renderMission(m,run){
    let inner='';
    if(m.type==='choice'){
      inner=`<div class="choice-list">${m.choices.map((c,i)=>`<button class="choice-btn" data-choice="${i}">${escapeHtml(c)}</button>`).join('')}</div>`;
      $('#modalBody').innerHTML=baseMissionHtml(m,inner,run);bindHint(m,run);
      $$('.choice-btn',$('#modalBody')).forEach(b=>b.addEventListener('click',()=>{
        const idx=Number(b.dataset.choice);if(idx===m.correct){b.classList.add('correct');audio.sfx('good');setTimeout(()=>completeMission(m,run),450);}else{b.classList.add('wrong');audio.sfx('bad');run.mistakes++;run.attempts++;$('#missionFeedback').innerHTML='<div class="feedback-box feedback-bad">Belum tepat. Cuba fikir semula ya. 🌱</div>';setTimeout(()=>renderMission(m,run),750);}
      }));
    } else if(m.type==='sequence'){
      inner=`<div class="sequence-progress">Urutan anda: ${run.sequence.length?run.sequence.map(i=>escapeHtml(m.items[i])).join(' → '):'Belum dipilih'}</div><div class="sequence-grid">${m.items.map((it,i)=>`<button class="sequence-btn ${run.sequence.includes(i)?'done':''}" data-seq="${i}" ${run.sequence.includes(i)?'disabled':''}>${i+1}. ${escapeHtml(it)}</button>`).join('')}</div>`;
      $('#modalBody').innerHTML=baseMissionHtml(m,inner,run);bindHint(m,run);
      $$('.sequence-btn',$('#modalBody')).forEach(b=>b.addEventListener('click',()=>{
        const idx=Number(b.dataset.seq),expected=m.order[run.sequence.length];
        if(idx===expected){run.sequence.push(idx);audio.sfx('collect');if(run.sequence.length===m.order.length)setTimeout(()=>completeMission(m,run),350);else renderMission(m,run);}else{run.mistakes++;run.attempts++;run.sequence=[];audio.sfx('bad');renderMission(m,run);$('#missionFeedback').innerHTML='<div class="feedback-box feedback-bad">Urutan itu belum sesuai. Cuba semula dari langkah pertama.</div>';}
      }));
    } else if(m.type==='collect'){
      inner=`<div class="collect-grid">${m.items.map((it,i)=>`<button class="collect-item ${run.collected.has(i)?'gone':''}" data-item="${i}" aria-label="Kutip item ${i+1}">${it}</button>`).join('')}</div><div class="feedback-box feedback-good">Dah dikutip: ${run.collected.size}/${m.items.length}</div>`;
      $('#modalBody').innerHTML=baseMissionHtml(m,inner,run);bindHint(m,run);
      $$('.collect-item',$('#modalBody')).forEach(b=>b.addEventListener('click',()=>{run.collected.add(Number(b.dataset.item));audio.sfx('collect');if(run.collected.size===m.items.length)setTimeout(()=>completeMission(m,run),300);else renderMission(m,run);}));
    } else if(m.type==='distribute'){
      inner=`<div class="pencil-bank">✏️ Pensel berbaki: <strong>${run.remaining}</strong></div><div class="distribute-wrap">${m.targets.map((n,i)=>`<div class="student-box"><div class="student-face">${['🧒','👧','👦'][i]}</div><strong>${n}</strong><div>${'✏️'.repeat(run.dist[i])||'—'} (${run.dist[i]})</div><button class="give-btn" data-give="${i}" ${run.remaining<=0?'disabled':''}>Beri 1 pensel</button></div>`).join('')}</div><button id="checkDistribution" class="btn btn-success full">Semak Pembahagian</button>`;
      $('#modalBody').innerHTML=baseMissionHtml(m,inner,run);bindHint(m,run);
      $$('.give-btn',$('#modalBody')).forEach(b=>b.addEventListener('click',()=>{if(run.remaining<=0)return;const i=Number(b.dataset.give);run.dist[i]++;run.remaining--;audio.sfx('collect');renderMission(m,run);}));
      $('#checkDistribution').addEventListener('click',()=>{const ok=run.remaining===0&&run.dist.every(v=>v===m.targetEach);if(ok){audio.sfx('good');completeMission(m,run);}else{run.mistakes++;run.attempts++;run.dist=[0,0,0];run.remaining=m.total;audio.sfx('bad');renderMission(m,run);$('#missionFeedback').innerHTML='<div class="feedback-box feedback-bad">Belum sama rata. Cuba beri jumlah yang sama kepada setiap murid.</div>';}});
    }
  }

  function completeMission(m,run){
    const clean=run.attempts===1&&!run.hintUsed&&run.mistakes===0;
    const first=run.attempts===1?30:0, noHint=run.hintUsed?0:10, perfect=clean?20:0;
    const missionScore=100+first+noHint+perfect;
    let stars=1;if(run.attempts===1||!run.hintUsed)stars=2;if(clean)stars=3;
    state.score+=missionScore;state.stars+=stars;
    if(clean){state.streak++;if([3,6,9,12,14].includes(state.streak)&&state.streakBonus<150){state.streakBonus+=30;state.score+=30;audio.sfx('streak');}}else{state.streak=0;}
    state.completed.push({id:m.id,stars,score:missionScore});state.missionIndex++;
    syncHud();saveProgress();audio.sfx('complete');
    const extra=(clean&&[3,6,9,12,14].includes(state.streak))?'<div class="feedback-box feedback-good">🔥 Bonus streak +30!</div>':'';
    $('#modalBody').innerHTML=`<div class="mission-complete"><div class="big-icon">${m.icon}</div><div class="mission-badge">MISI SELESAI</div><h2>${escapeHtml(m.value)} Dikuasai!</h2><div class="stars">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div><p>${escapeHtml(m.reflection)}</p><div class="score-breakdown"><div><strong>+100</strong><small>Asas</small></div><div><strong>+${first}</strong><small>Cubaan pertama</small></div><div><strong>+${noHint}</strong><small>Tanpa hint</small></div><div><strong>+${perfect}</strong><small>Sempurna</small></div></div>${extra}<button id="missionNext" class="btn btn-primary btn-xl full">Teruskan Misi →</button></div>`;
    $('#missionNext').addEventListener('click',()=>{closeModal();if(state.missionIndex>=missions.length)showToast('Semua 14 nilai lengkap! Pergi ke Pagar Pulang. 🏁');else showToast(`Nilai seterusnya: ${currentMission().value}`);});
  }

  // ---------- Pause ----------
  $('#btnPause').addEventListener('click',()=>{if(state.paused)return;audio.sfx('click');state.paused=true;state.pausedAt=performance.now();$('#pauseOverlay').classList.remove('hidden');});
  $('#btnResume').addEventListener('click',()=>{audio.sfx('click');$('#pauseOverlay').classList.add('hidden');if(state.pausedAt)state.pauseAccum+=performance.now()-state.pausedAt;state.pausedAt=0;state.paused=false;state.lastTs=performance.now();});
  $('#btnAudio').addEventListener('click',()=>{audio.ensure();audio.setEnabled(!audio.enabled);audio.sfx('click');});
  $('#btnPauseAudio').addEventListener('click',()=>{audio.ensure();audio.setEnabled(!audio.enabled);audio.sfx('click');});
  $('#btnQuitHome').addEventListener('click',()=>{saveProgress();$('#pauseOverlay').classList.add('hidden');state.running=false;state.paused=false;showScreen('home');});

  // ---------- End game ----------
  function rankFor(score){if(score>=2450)return'👑 Legenda 14 Nilai';if(score>=2300)return'🏆 Juara Nilai';if(score>=2000)return'🏅 Wira Nilai';if(score>=1600)return'⭐ Sahabat Nilai';return'🌱 Pelatih Nilai';}
  function finishGame(){
    if(state.completed.length<14){showToast('Lengkapkan semua 14 nilai dahulu.');return;}
    const time=getElapsed();const timeBonus=clamp(Math.round(100-Math.max(0,time-360)/3.6),0,100);state.score+=timeBonus+10;state.running=false;clearSave();
    const before=getBoard();const prevBest=before.filter(x=>x.name===state.player.name).reduce((m,x)=>Math.max(m,x.score),0);
    const top=saveBoard({name:state.player.name,avatar:state.player.avatar,score:state.score,time:Math.round(time),date:Date.now()});
    $('#resultTitle').textContent=`Tahniah, ${state.player.name}!`;$('#resultScore').textContent=state.score;$('#resultTime').textContent=fmtTime(time);$('#resultStars').textContent=`${state.stars}/42`;$('#resultRank').textContent=rankFor(state.score);$('#newRecord').classList.toggle('hidden',!(state.score>prevBest));
    renderBoard($('#resultLeaderboardList'),state.player.name);audio.victory();showScreen('result');
  }
  $('#btnPlayAgain').addEventListener('click',()=>{audio.sfx('click');showScreen('profile');$('#playerName').value=state.player.name;$$('.avatar-choice').forEach(x=>x.classList.toggle('selected',x.dataset.avatar===state.player.avatar));});
  $('#btnResultLeaderboard').addEventListener('click',()=>{audio.sfx('click');openModal(`<div class="mission-badge">🏆 LEADERBOARD</div><h2>Top 5 Peranti Ini</h2><div id="modalBoard" class="leaderboard-list"></div>`);renderBoard($('#modalBoard'),state.player.name);});
  $('#btnResultHome').addEventListener('click',()=>{audio.sfx('click');showScreen('home');});

  // ---------- Init ----------
  mapImg.addEventListener('load',()=>{if($('#screen-game').classList.contains('active'))resizeCanvas();});
  window.addEventListener('beforeunload',saveProgress);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.running&&!state.paused)saveProgress();});
  if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
  showScreen('home');
})();
