const CACHE='cenkar-share-v1';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method==='POST' && u.pathname.endsWith('/share-target')){
    e.respondWith((async()=>{
      try{
        const form=await e.request.formData();
        const file=form.get('file');
        if(file && typeof file.arrayBuffer==='function'){
          const db=await new Promise((res,rej)=>{
            const r=indexedDB.open('cenkar_share_db',1);
            r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('incoming'))r.result.createObjectStore('incoming',{keyPath:'id'});};
            r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);
          });
          await new Promise((res,rej)=>{
            const tx=db.transaction('incoming','readwrite');
            tx.objectStore('incoming').put({id:'latest',name:file.name||'WhatsApp_Teslim_Formu.jpg',blob:file});
            tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);
          });
        }
        return Response.redirect(new URL('./?shared=1',self.location.origin),303);
      }catch(err){
        return Response.redirect(new URL('./?shared=error',self.location.origin),303);
      }
    })());
  }
});
