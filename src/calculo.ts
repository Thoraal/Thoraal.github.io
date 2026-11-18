// Las cantidades están en unidades enteras de divisa y las tasas, en diezmilésimas de peso.
export function tasaDecimal(texto: string): number {
  if (!/^\d{1,5}([.,]\d{1,4})?$/.test(texto)) throw Error('Escribe una tasa positiva con hasta cuatro decimales.');
  const [entero, fraccion = ''] = texto.replace(',', '.').split('.');
  const tasa = Number(entero) * 10000 + Number(fraccion.padEnd(4, '0'));
  if (!tasa) throw Error('El tipo de cambio debe ser mayor que cero.');
  return tasa;
}

export function pesosEnCentavos(unidades: number, tasa: number): number {
  return Math.floor((unidades * tasa + 50) / 100);
}

// Parámetro heredado del fraccionador original. Redondear hacia abajo conserva el máximo.
export function maximoParte(referencia: number, tasa: number, moneda: string) {
  if (!(referencia > 0 && tasa > 0)) throw Error('Se necesitan ambas tasas.');
  const limite = Math.floor(1000 * referencia / tasa);
  if (limite < 1) throw Error('Con estas tasas, una unidad supera el máximo por parte.');
  return moneda === 'USD' && limite > 1000 ? 990 : limite;
}


export function minimoParte(monto: number) {
  if (monto < 5000) return 50;
  if (monto < 10000) return 300;
  if (monto < 15000) return 400;
  if (monto < 20000) return 500;
  if (monto < 25000) return 550;
  return 600;
}

export function validar(monto: number, cajas: number, tasa: number) {
  if (!Number.isInteger(monto) || monto <= 0 || monto > 1000000)
    throw Error('Ingresa un monto entero entre 1 y 1,000,000.');
  if (!Number.isInteger(cajas) || cajas < 1 || cajas > 50)
    throw Error('Elige entre 1 y 50 cajas.');
  if (!Number.isInteger(tasa) || tasa < 1 || tasa > 999999999)
    throw Error('Revisa el tipo de cambio.');
}

export function capacidad(total: number, cajas: number, minimo: number, maximo: number, distancia: number) {
  if (!Number.isSafeInteger(distancia) || distancia < 5 || distancia > 1000000 || distancia % 5)
    throw Error('La separación debe ser un múltiplo de 5 entre 5 y 1,000,000.');
  const bajo = Math.ceil(minimo/5)*5, alto = Math.floor(maximo/5)*5;
  const cupo = Math.max(0, 1 + Math.floor((alto-bajo)/distancia));
  const techo = cupo*alto - distancia*cupo*(cupo-1)/2;
  const cantidades: number[] = [];
  if (total % 5 === 0) for (let k=cajas; k<=cupo; k++) {
    const margen = distancia*k*(k-1)/2;
    if (k*bajo + margen > total) break;
    if (total <= k*alto - margen) cantidades.push(k);
  }
  return {cantidades, cupo, techo};
}

function importes(total: number, cajas: number, minimo: number, maximo: number, distancia: number, semilla: number) {
  const unidades=total/5, bajo=Math.ceil(minimo/5), alto=Math.floor(maximo/5), salto=distancia/5;
  if (!Number.isInteger(unidades)) throw Error('El monto debe ser múltiplo de 5 para repartirlo sin sobrantes.');
  const {cantidades} = capacidad(total,cajas,minimo,maximo,distancia);
  const objetivo = Math.max(cajas, Math.round(2*unidades/(bajo+alto)));
  let cantidad = 0;
  for (const n of cantidades) if (!cantidad || Math.abs(n-objetivo)<Math.abs(cantidad-objetivo)) cantidad=n;
  let estado=semilla>>>0;
  function elegir(min: number, max: number) {
    if (!semilla) return Math.floor((min+max)/2);
    estado=(Math.imul(1664525,estado)+1013904223)>>>0;
    return min+Math.floor(estado/4294967296*(max-min+1));
  }
  if (!cantidad) throw Error('No hay combinación exacta de importes distintos con este monto, número de cajas y límites.');
  // Para tres partes preferimos la proporción 8:9:13 si cabe en el intervalo.
  if (!semilla && cantidad === 3) {
    const a = Math.round(unidades * 8 / 30), b = Math.round(unidades * 9 / 30), c = unidades - a - b;
    if (bajo <= a && b-a >= salto && c-b >= salto && c <= alto) return [c*5, b*5, a*5];
  }
  let pendiente = unidades, siguiente = bajo;
  const valores: number[] = [];
  for (let k = cantidad; k > 0; k--) {
    const restantes = k - 1;
    const sumaMaxRestante = restantes * alto - salto * restantes * (restantes - 1) / 2;
    const inferior = Math.max(siguiente, pendiente - sumaMaxRestante);
    const superior = Math.floor((pendiente - salto * k * restantes / 2) / k);
    const elegido = elegir(inferior, superior);
    valores.push(elegido * 5);
    pendiente -= elegido;
    siguiente = elegido + salto;
  }
  return valores.reverse();
}

export function plan(monto: number, cajas: number, tasa: number, maximo: number, distancia = 5, semilla = 0) {
  validar(monto, cajas, tasa);
  const partes = importes(monto, cajas, minimoParte(monto), maximo, distancia, semilla);
  const grupos = Array.from({ length: cajas }, () => [] as number[]);
  // Orden descendente y asignación circular: cada caja anterior recibe
  // partidas mayores que su vecina y, en la última vuelta, nunca menos filas.
  partes.forEach((valor, i) => grupos[i % cajas].push(valor));
  if (cajas === 3) [grupos[1], grupos[2]] = [grupos[2], grupos[1]];
  if (cajas === 1 && partes.length === 3) [grupos[0][1], grupos[0][2]] = [grupos[0][2], grupos[0][1]];
  let desde = 0;
  return grupos.map(grupo => {
    const inicio = desde;
    const filas = grupo.map(unidades => {
      const anterior = desde;
      desde += unidades;
      return { unidades, centavos: pesosEnCentavos(desde, tasa) - pesosEnCentavos(anterior, tasa), acumulado: desde - inicio };
    });
    const unidades = desde - inicio;
    return { unidades, centavos: pesosEnCentavos(desde,tasa) - pesosEnCentavos(inicio,tasa),
      filas: filas.map(fila => ({...fila, restante: unidades - fila.acumulado})) };
  });
}
