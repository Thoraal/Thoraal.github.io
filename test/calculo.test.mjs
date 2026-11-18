import test from 'node:test';
import assert from 'node:assert/strict';
import { plan, detalle, maximoParte, tasaDecimal, pesosEnCentavos, repartir } from '../src/calculo.ts';
import { codificar, decodificar } from '../src/codigo.ts';

test('ejemplo de la guía: 100 USD a 18.50 en tres cajas',()=>{
  const cajas=plan(100,3,tasaDecimal('18.50'));
  assert.deepEqual(cajas.map(x=>x.unidades),[34,33,33]);
  assert.deepEqual(cajas.map(x=>x.centavos),[62900,61050,61050]);
});
test('cuando hay fracciones de centavo la suma se concilia',()=>{
  const cajas=plan(3,3,tasaDecimal('1,0050'));
  assert.deepEqual(cajas.map(x=>x.centavos),[101,100,101]);
});
test('límites internos del fraccionador y casos sin parte posible',()=>{
  assert.equal(maximoParte(204820,185000,'USD'),990);
  assert.equal(maximoParte(204820,185000,'EUR'),1107);
  assert.equal(maximoParte(185000,185000,'USD'),1000);
  assert.throws(()=>maximoParte(1,10001,'EUR'));
});
test('los totales, máximos y remanentes cuadran en distintas operaciones',()=>{
  for(const total of [1,2,49,101,4999,10001,1000000])for(const count of [1,2,3,7,50].filter(n=>n<=total))for(const rate of [1,101,196357,999999999]){
    const boxes=plan(total,count,rate);
    assert.equal(boxes.reduce((n,b)=>n+b.unidades,0),total);
    assert.equal(boxes.reduce((n,b)=>n+b.centavos,0),pesosEnCentavos(total,rate));
    for(const b of boxes){
      const det=detalle(b,rate,990);let units=0,cents=0;
      for(let i=0;i<det.cantidad;i++){const r=det.fila(i);units+=r.unidades;cents+=r.centavos;
        assert.ok(r.unidades>0 && r.unidades<=990);assert.equal(r.restante,b.unidades-units);}
      assert.equal(units,b.unidades);assert.equal(cents,b.centavos);
    }
  }
});
test('entradas inválidas',()=>{
 for(const [m,c] of [[0,1],[3.14,1],[10,11],[1000001,3],[100,51]])assert.throws(()=>plan(m,c,100));
 for(const r of ['-3','1e4','0','3.14159',''])assert.throws(()=>tasaDecimal(r));
 assert.throws(()=>repartir(0,1));
});
test('restaura el código antiguo y conserva cuatro decimales en el nuevo',()=>{
  assert.equal(decodificar('2S.1FE.0.AL.1').fecha,'2025-01-16');
  const d={monto:'100',cajas:'2',moneda:'OTRA',otra:'Libra £',tasa:'24.1825',fecha:'2025-01-16'};
  assert.deepEqual(decodificar(codificar(d)),d);
});
