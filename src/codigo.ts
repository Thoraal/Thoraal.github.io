export type Operacion = { monto:string; tasa:string; cajas:string; moneda:string; otra:string; fecha:string; distancia?:string; semilla?:string; orden?:string };
export function codificar(datos: Operacion) {
  return 'F2.' + new URLSearchParams(Object.entries(datos)).toString();
}
export function decodificar(raw: string): Operacion {
  const s = raw.trim().replace(/^#/, '');
  if (s.length > 800) throw Error('Código demasiado largo.');
  let d: Operacion;
  if (s.startsWith('F2.')) {
    const q = new URLSearchParams(s.slice(3));
    d = { monto:q.get('monto')??'', tasa:q.get('tasa')??'', cajas:q.get('cajas')??'', moneda:q.get('moneda')??'', otra:q.get('otra')??'', fecha:q.get('fecha')??'' };
    if(q.get('orden')==='consecutivo') d.orden='consecutivo';
    if(q.has('distancia') || q.has('semilla')) {
      d.distancia=q.get('distancia')??''; d.semilla=q.get('semilla')??'';
      if (!/^\d{1,7}$/.test(d.distancia) || +d.distancia<5 || +d.distancia>1000000 || +d.distancia%5 ||
          !/^\d{1,10}$/.test(d.semilla) || +d.semilla>4294967295) throw Error('Código inválido.');
    }
  } else {
    const p = s.split('.');
    if (p.length < 5 || p.length > 6 || !p.slice(0,5).every(x=>/^[0-9a-z]+$/i.test(x))) throw Error('Código inválido.');
    const valores=p.slice(0,5).map(x=>parseInt(x,36));
    const [m,t,moneda,dias,c]=valores;
    d={monto:String(m),tasa:(t/100).toFixed(2),moneda:['USD','EUR','CAD','OTRA'][moneda],cajas:String(c),fecha:new Date(Date.UTC(2024,0,1)+dias*86400000).toISOString().slice(0,10),otra:p[5]?atob(p[5]):''};
  }
  if (!['USD','EUR','CAD','OTRA'].includes(d.moneda) || d.otra.length>24 || (d.moneda==='OTRA'&&!d.otra.trim()) || !/^\d{4}-\d{2}-\d{2}$/.test(d.fecha) || new Date(d.fecha).toISOString().slice(0,10)!==d.fecha) throw Error('Código inválido.');
  return d;
}
