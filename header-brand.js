/* CH'ANGE — logo global texte/image sans changement des dimensions de l'entête. */
(function(){
  'use strict';
  const wordmark=document.querySelector('.site-header > a.wordmark');
  if(!wordmark)return;
  // On garde le texte original dans le flux : il constitue le gabarit.
  const textSlot=document.createElement('span');
  textSlot.className='change-brand-text';
  while(wordmark.firstChild)textSlot.appendChild(wordmark.firstChild);
  wordmark.appendChild(textSlot);
  wordmark.classList.add('change-brand-wordmark');
  const image=document.createElement('img');
  image.className='change-brand-image';
  image.alt='CH’ANGE — Institut de beauté';
  image.decoding='async';
  image.hidden=true;
  wordmark.appendChild(image);

  const validSrc=(url,preview)=>{
    if(typeof url!=='string'||!url||url.length>8*1024*1024)return '';
    if(preview&&/^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(url))return url;
    try{
      const parsed=new URL(url);
      return parsed.protocol==='https:'?parsed.href:'';
    }catch{return ''}
  };
  function setText(){
    wordmark.classList.remove('change-brand-mode-image');
    image.hidden=true;
    image.removeAttribute('src');
  }
  image.addEventListener('error',setText);
  let latest='text:';
  function apply(design,preview=false){
    const cfg=design&&typeof design==='object'?design.header_logo:null;
    const mode=cfg?.mode==='image'?'image':'text';
    const src=mode==='image'?validSrc(cfg?.url,preview):'';
    const key=mode+':'+src;
    if(key===latest)return;
    latest=key;
    if(!src){setText();return;}
    // Activer uniquement une image chargée : aucun décalage ni logo absent.
    image.onload=()=>{
      if(latest!==key)return;
      image.hidden=false;
      wordmark.classList.add('change-brand-mode-image');
    };
    image.hidden=true;
    image.src=src;
    if(image.complete&&image.naturalWidth>0){
      image.hidden=false;
      wordmark.classList.add('change-brand-mode-image');
    }
  }
  window.CHANGE_HEADER_BRAND={apply};
})();
