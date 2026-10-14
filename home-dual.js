/*
 * Carrousels distincts Esthétique / Coiffure — CH'ANGE
 * Ajouter autant de photos que souhaité dans les tableaux ci-dessous :
 * {photo:'soin-visage',alt:'...'} pour un visuel déjà défini sur le site ;
 * {src:'./photos/coiffure/mon-image.webp',alt:'...'} pour une nouvelle image.
 * Les images elles-mêmes restent des fichiers, jamais un screenshot de la maquette.
 */
window.CHANGE_HOME_SLIDES = window.CHANGE_HOME_SLIDES || {
  esthetique: [
    {photo:'soin-visage',alt:'Soin du visage chez Ch’ange'},
    {photo:'hero-mains',alt:'La beauté en douceur chez Ch’ange'},
    {photo:'ongles',alt:'Beauté des mains chez Ch’ange'},
    {photo:'ambiance-spa',alt:'Ambiance bien-être'}
  ],
  coiffure: [
    {photo:'portrait',alt:'Coiffure et balayage chez Ch’ange'}
  ]
};
(function(){
  'use strict';
  const slides=window.CHANGE_HOME_SLIDES;

  function photoSource(item){
    if (typeof item.src==='string' && item.src.trim()) return item.src.trim();
    if (!item.photo)return '';
    // CH_PHOTOS est le registre originel défini par le site.
    if (typeof CH_PHOTOS!=='undefined' && CH_PHOTOS[item.photo])return CH_PHOTOS[item.photo];
    const related=[...document.querySelectorAll('[data-photo]')].find(el=>el.dataset.photo===item.photo);
    return related?.getAttribute('src') || '';
  }

  function setup(key){
    const root=document.querySelector('.dual-home__carousel[data-carousel="'+key+'"]');
    if(!root)return;
    const img=root.querySelector('.dual-home__photo img');
    const dots=root.querySelector('.dual-home__dots');
    const items=Array.isArray(slides[key])?slides[key].filter(item=>item && (item.src || item.photo)):[];
    let selected=0;

    function show(index){
      if(items.length===0){
        img.removeAttribute('src');
        img.alt='Photographies à ajouter';
        dots.replaceChildren();
        return;
      }
      selected=(index+items.length)%items.length;
      const item=items[selected];
      const source=photoSource(item);
      if(source){
        if(img.getAttribute('src')!==source)img.setAttribute('src',source);
      }else{
        img.removeAttribute('src');
      }
      img.alt=item.alt || (key==='coiffure'?'Photographie coiffure':'Photographie esthétique');
      dots.replaceChildren();
      items.forEach((_,i)=>{
        const dot=document.createElement('button');
        dot.type='button';
        dot.className='dual-home__dot';
        dot.setAttribute('aria-label','Afficher la photo '+(i+1)+' sur '+items.length);
        dot.setAttribute('aria-current',String(selected===i));
        dot.addEventListener('click',()=>show(i));
        dots.appendChild(dot);
      });
    }

    root.querySelector('[data-prev]')?.addEventListener('click',()=>show(selected-1));
    root.querySelector('[data-next]')?.addEventListener('click',()=>show(selected+1));
    let touchStart=null;
    root.addEventListener('touchstart',e=>{
      touchStart=e.changedTouches[0]?.screenX??null;
    },{passive:true});
    root.addEventListener('touchend',e=>{
      if(touchStart===null)return;
      const delta=(e.changedTouches[0]?.screenX??touchStart)-touchStart;
      if(Math.abs(delta)>45)show(selected+(delta<0?1:-1));
      touchStart=null;
    },{passive:true});
    show(0);
  }
  function init(){setup('esthetique');setup('coiffure');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();