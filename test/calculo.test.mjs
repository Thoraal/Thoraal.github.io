import test from 'node:test';
import assert from 'node:assert/strict';
import { capacidad, plan, minimoParte, maximoParte, tasaDecimal, pesosEnCentavos } from '../src/calculo.ts';
import { codificar, decodificar } from '../src/codigo.ts';

test('ejemplo de Alejandro en tres cajas y en el detalle de una caja',()=>{
  const tasa=tasaDecimal('18.50'), max=maximoParte(204820,tasa,'USD');
  assert.deepEqual(plan(1500,3,tasa,max).map(b=>b.unidades),[650,400,450]);
  assert.deepEqual(plan(1500,1,tasa,max)[0].filas.map(f=>f.unidades),[650,400,450]);
});

test('tramos originales de mínimos',()=>{
  for(const [total,min] of [[4995,50],[5000,300],[9995,300],[10000,400],[15000,500],[20000,550],[25000,600]])
    assert.equal(minimoParte(total),min);
});

test('límites estrechos y casos imposibles',()=>{
  for(const [total,cajas,max] of [[155,3,60],[1501,3,990],[1500,3,50],[45,1,990],[100,2,990],[170,3,60]]) assert.throws(()=>plan(total,cajas,185000,max));
  assert.equal(maximoParte(204820,185000,'USD'),990);
  assert.equal(maximoParte(204820,185000,'EUR'),1107);
});

test('cada operación conserva sus importes sin duplicarlos',()=>{
  for(const [total,cajas,max] of [[165,3,60],[1500,3,990],[1500,1,990],[5000,3,990],[25000,4,1107],[30000,2,990],[995,1,999]]){
    const tasa=185025, boxes=plan(total,cajas,tasa,max), filas=boxes.flatMap(b=>b.filas);
    assert.equal(new Set(filas.map(f=>f.unidades)).size,filas.length);
    assert.equal(new Set(boxes.map(b=>b.unidades)).size,cajas);
    assert.equal(boxes.reduce((n,b)=>n+b.unidades,0),total);
    assert.equal(boxes.reduce((n,b)=>n+b.centavos,0),pesosEnCentavos(total,tasa));
    for(const b of boxes){
      assert.equal(b.filas.at(-1).restante,0);
      assert.equal(b.filas.reduce((n,f)=>n+f.centavos,0),b.centavos);
      for(const f of b.filas)assert.ok(f.unidades%5===0 && f.unidades>=minimoParte(total) && f.unidades<=max);
    }
  }
});

test('entradas inválidas',()=>{
 for(const [m,c] of [[0,1],[3.14,1],[10,11],[1000001,3],[100,51]])assert.throws(()=>plan(m,c,100,990));
 for(const r of ['-3','1e4','0','3.14159',''])assert.throws(()=>tasaDecimal(r));

});
test('restaura el código antiguo y conserva cuatro decimales en el nuevo',()=>{
  assert.equal(decodificar('2S.1FE.0.AL.1').fecha,'2025-01-16');
  const d={monto:'100',cajas:'2',moneda:'OTRA',otra:'Libra £',tasa:'24.1825',fecha:'2025-01-16'};
  assert.deepEqual(decodificar(codificar(d)),d);
});

test('capacidad de 35,000 y distancia global en distintas variantes',()=>{
  const rango=capacidad(35000,1,600,990,5);
  assert.deepEqual([rango.cantidades[0],rango.cantidades.at(-1)],[40,48]);
  assert.deepEqual(capacidad(35000,1,600,990,60),{cantidades:[],cupo:7,techo:5670});
  const resultados=new Set();
  for(const semilla of [1,45,99999,2147483647]){
    const p=plan(1500,3,185000,990,60,semilla);
    const montos=p.flatMap(c=>c.filas.map(f=>f.unidades)).sort((a,b)=>a-b);
    assert.equal(montos.reduce((a,b)=>a+b),1500);
    assert.ok(montos.every((n,i)=>n%5===0 && (!i || n-montos[i-1]>=60)));
    assert.deepEqual(plan(1500,3,185000,990,60,semilla),p);
    resultados.add(montos.join(','));
  }
  assert.ok(resultados.size>1);
});
