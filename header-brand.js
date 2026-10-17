/* CH'ANGE — logo global texte/image sans changement des dimensions de l'entête. */
(function(){
  'use strict';
  const wordmark=document.querySelector('.site-header > a.wordmark');
  if(!wordmark)return;
  // On garde le texte original dans le flux : il constitue le gabarit.
  const titleSlot=document.createElement('span');
  titleSlot.className='change-brand-title';
  const textSlot=document.createElement('span');
  textSlot.className='change-brand-text';
  // CH’ANGE ET « INSTITUT DE BEAUTÉ » partagent le même gabarit.
  // Les deux restent dans le flux pour conserver exactement leur encombrement.
  while(wordmark.firstChild){
    textSlot.appendChild(wordmark.firstChild);
  }
  titleSlot.appendChild(textSlot);
  // Conserver les nœuds d'origine (y compris le sous-titre et son gabarit).
  const nameNode=Array.from(textSlot.childNodes||textSlot.children||[]).find(node=>node.nodeType===3)||textSlot.firstChild;
  const subtitle=textSlot.querySelector(':scope > small');
  wordmark.appendChild(titleSlot);
  wordmark.classList.add('change-brand-wordmark');
  const image=document.createElement('img');
  image.className='change-brand-image';
  image.alt='CH’ANGE — Institut de beauté';
  image.decoding='async';
  image.hidden=true;
  titleSlot.appendChild(image);

  const validSrc=(url,preview)=>{
    if(typeof url!=='string'||!url||url.length>8*1024*1024)return '';
    if(preview&&/^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(url))return url;
    try{
      const parsed=new URL(url);
      return parsed.protocol==='https:'?parsed.href:'';
    }catch{return ''}
  };
  function setText(){
    titleSlot.classList.remove('change-brand-mode-image');
    image.hidden=true;
    image.removeAttribute('src');
  }
  image.addEventListener('error',setText);
  let latest='text:',isHair=false,savedDesign=null,savedPreview=false;
  function apply(design,preview=false){
    savedDesign=design;savedPreview=preview;
    // La Coiffure impose temporairement sa signature NAMAJE :
    // une mise à jour tardive de l'accueil ne peut pas remettre son ancien logo.
    if(isHair){setText();latest='coiffure:text';return;}
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
      titleSlot.classList.add('change-brand-mode-image');
    };
    image.hidden=true;
    image.src=src;
    if(image.complete&&image.naturalWidth>0){
      image.hidden=false;
      titleSlot.classList.add('change-brand-mode-image');
    }
  }
  function setUniverse(slug){
    const nextHair=slug==='coiffure';
    if(nextHair===isHair)return;
    isHair=nextHair;
    if(nameNode)nameNode.textContent=nextHair?'NAMAJE ':'CH’ANGE ';
    if(subtitle)subtitle.textContent=nextHair?'INSTITUT DE COIFFURE':'INSTITUT DE BEAUTÉ';
    wordmark.setAttribute?.('aria-label',nextHair
      ?'NAMAJE, institut de coiffure — retour à l’accueil'
      :'CH’ANGE, institut de beauté — retour à l’accueil');
    if(nextHair){
      latest='coiffure:text';
      setText();
    }else{
      // Reprendre fidèlement le logo paramétré dans le Mode éditeur.
      latest='switch:reset';
      apply(savedDesign,savedPreview);
    }
  }
  function routeUniverse(){
    const slug=decodeURIComponent((window.location?.hash||'#accueil').slice(1)).split('?')[0];
    setUniverse(slug||'accueil');
  }
  window.CHANGE_HEADER_BRAND={apply,setUniverse};
  // Le script différé peut être exécuté avant ou après le routeur public.
  if(window.location)routeUniverse();
  window.addEventListener?.('hashchange',routeUniverse);
})();
