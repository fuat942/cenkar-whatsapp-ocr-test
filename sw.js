self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(e.request.method==='POST' && u.pathname.endsWith('/share-target')){
  e.respondWith((async()=>{
   try{
    const fd=await e.request.formData(),file=fd.get('file');
    if(file && file.type.startsWith('image/')){
     const db=await new Promise((res,rej)=>{
      const r=indexedDB.open('cenkar_ocr_test_db',1);
      r.onupgradeneeded=()=>r.result.createObjectStore('files',{keyPath:'id'});
      r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);
     });
     await new Promise((res,rej)=>{
      const tx=db.transaction('files','readwrite');
      tx.objectStore('files').put({id:'latest',name:file.name||'teslim-formu.jpg',blob:file,receivedAt:Date.now()});
      tx.oncomplete=res;tx.onerror=()=>rej(tx.error);
     });
    }
    return Response.redirect('./',303);
   }catch(err){
    return new Response('Fotoğraf alınamadı: '+err,{status:500,headers:{'Content-Type':'text/plain;charset=utf-8'}});
   }
  })());
 }
});