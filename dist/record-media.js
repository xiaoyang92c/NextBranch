const DATABASE='next-branch-record-media';
const STORE='videos';
const urls=new Set();

function database(){
 return new Promise((resolve,reject)=>{
  if(!('indexedDB' in window)){reject(new Error('此浏览器无法保存视频'));return;}
  const request=indexedDB.open(DATABASE,1);
  request.onupgradeneeded=()=>request.result.createObjectStore(STORE);
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
 });
}

export async function saveRecordVideo(file){
 const db=await database(),id=`video-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
 try{
  await new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readwrite');
   tx.objectStore(STORE).put(file,id);
   tx.oncomplete=resolve;
   tx.onerror=()=>reject(tx.error);
   tx.onabort=()=>reject(tx.error);
  });
  return id;
 }finally{db.close();}
}

export async function removeRecordVideo(id){
 if(!id)return;
 const db=await database();
 try{await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
 finally{db.close();}
}

export async function hydrateRecordVideos(root=document){
 const nodes=[...root.querySelectorAll('video[data-record-video]')].filter(node=>!node.src);
 if(!nodes.length)return;
 let db;
 try{
  db=await database();
  await Promise.all(nodes.map(node=>new Promise(resolve=>{
   const request=db.transaction(STORE,'readonly').objectStore(STORE).get(node.dataset.recordVideo);
   request.onsuccess=()=>{
    if(request.result&&node.isConnected){const url=URL.createObjectURL(request.result);urls.add(url);node.src=url;node.load();}
    resolve();
   };
   request.onerror=resolve;
  })));
 }catch{}finally{db?.close();}
}

export function releaseRecordVideos(){
 for(const url of urls)URL.revokeObjectURL(url);
 urls.clear();
}
