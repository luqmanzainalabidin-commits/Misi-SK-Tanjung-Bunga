const CACHE='misi14-v1.1.0';
const ASSETS=[
  './','./index.html','./style.css','./game.js','./manifest.json',
  './assets/map-sekolah.png','./assets/logo-sktb.jpg','./assets/icon-192.png','./assets/icon-512.png',
  './assets/audio/sfx/click.wav','./assets/audio/sfx/collect.wav','./assets/audio/sfx/good.wav','./assets/audio/sfx/bad.wav',
  './assets/audio/sfx/complete.wav','./assets/audio/sfx/streak.wav','./assets/audio/sfx/popup.wav','./assets/audio/sfx/victory.wav'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
    const copy=res.clone();
    caches.open(CACHE).then(c=>c.put(e.request,copy));
    return res;
  }).catch(()=>caches.match('./index.html'))));
});
