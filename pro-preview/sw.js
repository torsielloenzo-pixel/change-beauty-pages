/* Prévisualisation Ch’ange Pro — offline limité à l'interface statique, sans données clients. */
const CACHE = 'change-pro-preview-shell-v2';
const ROOT = '/change-beauty-pages/pro-preview/';
const SHELL = [ROOT, ROOT+'index.html', ROOT+'style.css', ROOT+'app.js', ROOT+'icon.svg', ROOT+'manifest.webmanifest'];
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
 event.waitUntil(caches.keys().then(names => Promise.all(names.filter(n => n.startsWith('change-pro-preview-') && n!==CACHE).map(n => caches.delete(n)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin || !SHELL.includes(url.pathname))return;
 // Réseau d'abord pour garantir une prévisualisation toujours actualisée.
 event.respondWith(fetch(req).then(res => {
  if(res.ok) { const copy=res.clone(); caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{}); }
  return res;
 }).catch(()=>caches.match(req)));
});
