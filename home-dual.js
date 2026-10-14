/* Configurable photo slots. Add images as URLs or local paths to each array.
   Each slot can also reference an existing CMS image by its data-photo key.
   Example: {photo:'soin-visage', alt:'Soin du visage'} or {src:'/images/soin-2.webp',alt:'...'}.
   Empty/inaccessible images are skipped. The existing site CMS still owns data-photo images. */
window.CHANGE_HOME_SLIDES = window.CHANGE_HOME_SLIDES || {
 esthetique:[
  {photo:'soin-visage',alt:'Soin du visage chez Ch’ange'},
  {photo:'hero-mains',alt:'Beauté et attention chez Ch’ange'},
  {photo:'ongles',alt:'Beauté des mains'},
  {photo:'ambiance-spa',alt:'Ambiance bien-être'}
 ],
 coiffure:[
  {photo:'portrait',alt:'Coiffure et balayage chez Ch’ange'},
  {photo:'portrait',alt:'Coiffure : photographie à personnaliser'}
 ]
};
(function(){
 const keys=['esthetique','coiffure'];
 const registry=window.CHANGE_HOME_SLIDES;
 function resolve(item){
  if(item.src)return item.src;
  if(item.photo){const original=document.querySelector('[data-photo="'+CSS.escape(item.photo)+'"]:not(.dual-home__photo img)');return original?.getAttribute('src')||null}
  return null;
 }
 function setup(key){
  const root=document.querySelector('.dual-home__carousel[data-carousel="'+key+'"]');if(!root)return;
  const img=root.querySelector('.dual-home__photo img'),dots=root.querySelector('.dual-home__dots');
  const items=Array.isArray(registry[key])?registry[key].filter(x=>x&&(x.src||x.photo)):[];
  let current=0;
  function show(index){
   if(!items.length){img.removeAttribute('src');img.alt='Photographies à venir';dots.innerHTML='';return}
   current=(index+items.length)%items.length;
   const item=items[current],src=resolve(item);
   if(src){img.src=src;img.alt=item.alt||'Photographie '+key}else{img.removeAttribute('src');img.alt='Photographie à ajouter'}
   dots.replaceChildren();
   items.forEach((x,i)=>{const b=document.createElement('button');b.type='button';b.className='dual-home__dot';b.setAttribute('aria-label','Afficher la photo '+(i+1));b.setAttribute('aria-current',String(i===current));b.addEventListener('click',()=>show(i));dots.appendChild(b)})
  }
  root.querySelector('[data-prev]').addEventListener('click',()=>show(current-1));
  root.querySelector('[data-next]').addEventListener('click',()=>show(current+1));
  let start=null;root.addEventListener('touchstart',e=>{start=e.changedTouches[0]?.screenX??null},{passive:true});root.addEventListener('touchend',e=>{if(start===null)return;const delta=(e.changedTouches[0]?.screenX??start)-start;if(Math.abs(delta)>45)show(current+(delta<0?1:-1));start=null},{passive:true});
  const observer=new MutationObserver(()=>{if(!img.src)show(current)}); // CMS may set image sources asynchronously
  observer.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['src']});
  setTimeout(()=>{observer.disconnect();show(current)},1800);
  show(0);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>keys.forEach(setup));else keys.forEach(setup);
})();