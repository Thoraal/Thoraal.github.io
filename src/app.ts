import './estilo.css';
import { validar, minimoParte, maximoParte, pesosEnCentavos, plan, tasaDecimal } from './calculo';
import { codificar, decodificar, type Operacion } from './codigo';

const byId = (id:string) => document.getElementById(id)!;
const campo = (id:string) => byId(id) as HTMLInputElement | HTMLSelectElement;
const btn = (id:string) => byId(id) as HTMLButtonElement;
const texto = (id:string, value:string) => { byId(id).textContent = value; };
const num = new Intl.NumberFormat('es-MX');
const pesos = new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'});
const dinero = (centavos:number) => pesos.format(centavos/100);
const iconos:Record<string,string> = {
  book:'M3 4h6l3 2 3-2h6v14h-6l-3 2-3-2H3z M12 6v14',
  sliders:'M3 7h8m4 0h6M3 17h3m4 0h11M11 4v6m-5 4v6',
  calendar:'M4 5h16v15H4z M4 10h16M8 3v4m8-4v4',
  wallet:'M3 6h16v14H3z M3 6l13-3v3m4 5h-5v4h5z',
  print:'M7 8V3h10v5M7 16H3V8h18v8h-4M7 13h10v8H7z',
  layers:'m3 8 9-5 9 5-9 5z M3 12l9 5 9-5M3 16l9 5 9-5',
  link:'M9 15l6-6M8 11l-2 2a4 4 0 0 0 6 6l2-2m-4-10 2-2a4 4 0 0 1 6 6l-2 2'
};
for(const node of document.querySelectorAll<HTMLElement>('[data-icon]')) {
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','icon');svg.setAttribute('aria-hidden','true');
  const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',iconos[node.dataset.icon!]);svg.append(path);node.replaceWith(svg);
}
type Historial={tasas:Record<string,string>;desde:string;hasta:string};
let historial:Historial|undefined;
let fallo=false, indice=0, pagina=0;
let actual:ReturnType<typeof plan> = [], tasa=0, limite=0;
const porPagina=25;
const hoy = () => new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'America/Cancun'}).format(new Date());
const datos = ():Operacion => ({monto:campo('monto').value,tasa:campo('tasa').value.trim(),cajas:campo('cajas').value,moneda:campo('moneda').value,otra:campo('otra').value.trim(),fecha:campo('fecha').value});
function aplicar(d:Operacion) { for(const [k,v] of Object.entries(d)) campo(k).value=v; indice=pagina=0; render(); }
const moneda = () => campo('moneda').value==='OTRA'?campo('otra').value.trim():campo('moneda').value;
function render() {
  const d=datos(), ref=historial?.tasas[d.fecha];
  byId('otraLabel').hidden=d.moneda!=='OTRA';
  texto('oficial',ref?'$'+ref:fallo?'Historial no disponible':!historial?'Consultando…':!d.fecha?'Selecciona una fecha':d.fecha>historial.hasta?'Pendiente de actualización':d.fecha<historial.desde?'Fuera del historial':'Sin cotización');
  texto('cobertura',historial?'Historial hasta el '+historial.hasta.split('-').reverse().join('/'):'');
  actual=[];limite=0;texto('error','');texto('limites','');
  let convertible=false;
  if(d.tasa && d.monto) try {
    tasa=tasaDecimal(d.tasa);
    if(d.moneda==='OTRA'&&!d.otra) throw Error('Indica el nombre de la moneda.');
    validar(Number(d.monto),Number(d.cajas),tasa);
    convertible=true;
    if(ref) {
      limite=5*Math.floor(maximoParte(tasaDecimal(ref),tasa,d.moneda)/5);
      texto('limites','Por parte: mínimo '+num.format(minimoParte(Number(d.monto)))+' · máximo '+num.format(limite)+' '+moneda()+' · múltiplos de 5');
      actual=plan(Number(d.monto),Number(d.cajas),tasa,limite);
    }
  } catch(e) { texto('error',(e as Error).message); }
  const listo=actual.length>0;
  texto('mxn',convertible?dinero(pesosEnCentavos(Number(d.monto),tasa)):'—');
  texto('divisa',convertible?num.format(Number(d.monto))+' '+moneda():'—');
  texto('tc',convertible?d.tasa:'—');texto('nc',convertible?d.cajas:'—');
  btn('imprimir').disabled=!listo;btn('copiar').disabled=!listo||!d.fecha;
  byId('selector').hidden=actual.length<2;
  const select=campo('caja') as HTMLSelectElement;select.replaceChildren();
  actual.forEach((_,i)=>select.add(new Option((i+1)+' · '+num.format(actual[i].unidades)+' '+moneda(),String(i))));
  indice=Math.min(indice,Math.max(0,actual.length-1));select.value=String(indice);
  texto('estado',listo?'':'Ingresa datos válidos para ver el reparto.');
  if(convertible && !ref) texto('estado','Se necesita la referencia de la fecha para verificar el máximo antes de repartir.');
  if(convertible && ref && !listo) texto('estado','Sin reparto válido. Revisa los límites indicados arriba.');
  byId('estado').hidden=listo && limite>0;
  byId('resultado').hidden=!listo;
  const tabla=byId('filas');tabla.replaceChildren();byId('paginador').hidden=true;
  tabla.closest('table')!.hidden=!limite;
  if(!listo) return;
  const caja=actual[indice];
  texto('subtotal','Caja '+(indice+1)+' · '+num.format(caja.unidades)+' '+moneda()+' · '+dinero(caja.centavos)+' MXN');
  if(!limite) return;
  const partes=caja.filas;
  pagina=Math.min(pagina,Math.ceil(partes.length/porPagina)-1);
  for(let i=pagina*porPagina;i<Math.min(partes.length,(pagina+1)*porPagina);i++){
    const fila=partes[i];const tr=document.createElement('tr');
    for(const valor of [String(i+1),num.format(fila.unidades),dinero(fila.centavos),num.format(fila.restante)]) { const td=document.createElement('td');td.textContent=valor;tr.append(td); }
    tabla.append(tr);
  }
  byId('paginador').hidden=partes.length<=porPagina;
  texto('pagina',(pagina+1)+' de '+Math.ceil(partes.length/porPagina));
  btn('anterior').disabled=pagina===0;btn('siguiente').disabled=(pagina+1)*porPagina>=partes.length;
}
campo('fecha').value=hoy();
for(const id of ['monto','cajas','tasa','moneda','otra','fecha']) {
  campo(id).addEventListener('input',()=>{pagina=0;texto('aviso','');render();});
}
campo('caja').addEventListener('change',()=>{indice=Number(campo('caja').value);pagina=0;render();});
btn('anterior').onclick=()=>{pagina--;render();};btn('siguiente').onclick=()=>{pagina++;render();};
btn('ayuda').onclick=()=>(byId('guia') as HTMLDialogElement).showModal();
btn('reiniciar').onclick=()=>{aplicar({monto:'',tasa:'',cajas:'1',moneda:'USD',otra:'',fecha:hoy()});campo('codigo').value='';texto('aviso','');history.replaceState(null,'',location.pathname);};
btn('copiar').onclick=async()=>{const s=codificar(datos());campo('codigo').value=s;
  try{await navigator.clipboard.writeText(s);texto('aviso','Código copiado.');}catch{(campo('codigo') as HTMLInputElement).select();texto('aviso','Selecciona Copiar para guardar el código.');}};
function cargar(s:string) {
  try{const d=decodificar(s);validar(Number(d.monto),Number(d.cajas),tasaDecimal(d.tasa));aplicar(d);texto('aviso','Operación recuperada.');}
  catch{texto('aviso','El código no es válido. Revisa que esté completo.');}
}
byId('cargar').onsubmit=e=>{e.preventDefault();cargar(campo('codigo').value);};
btn('imprimir').onclick=()=>{
  byId('printout')?.remove();const report=document.createElement('article');report.id='printout';
  const agregar=(tag:string,t:string,contenedor:HTMLElement=report)=>{const el=document.createElement(tag);el.textContent=t;contenedor.append(el);return el;};
  agregar('h1','Fraccionador de divisas');agregar('p','Fecha de referencia: '+campo('fecha').value+' · Banxico: '+byId('oficial').textContent+' · Tipo aplicado: '+campo('tasa').value);
  agregar('p','Total: '+byId('divisa').textContent+' · '+byId('mxn').textContent+' MXN');
  const caja=actual[indice];agregar('h2',byId('subtotal').textContent!);
  if(limite){const detalleCaja=caja.filas,tabla=document.createElement('table');report.append(tabla);
    const cab=tabla.createTHead().insertRow();for(const v of ['Parte','Divisa','Pesos (MXN)','Restante']) agregar('th',v,cab);
    const cuerpo=tabla.createTBody();
    // Para informes excepcionalmente extensos se imprime el resumen exacto en lugar de agotar el navegador.
    if(detalleCaja.length<=5000){for(let i=0;i<detalleCaja.length;i++){const r=detalleCaja[i],row=cuerpo.insertRow();for(const v of [String(i+1),num.format(r.unidades),dinero(r.centavos),num.format(r.restante)]) agregar('td',v,row);}}
    else{tabla.remove();agregar('p',num.format(detalleCaja.length)+' partes. Reporte resumido para distribuciones superiores a 5,000 partes.');}
  }else agregar('p','Detalle por partes pendiente de referencia.');
  document.body.append(report);window.print();
};
if(location.hash.length>1)cargar(location.hash.slice(1));else render();
fetch('/cotizaciones.json',{cache:'no-cache'}).then(async r=>{if(!r.ok)throw Error();const h=await r.json();if(h.serie!=='SF60653'||!h.tasas)throw Error();historial=h;}).catch(()=>{fallo=true;}).finally(render);
