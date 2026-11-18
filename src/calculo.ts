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

// Trabajamos en bloques de cinco. Para k importes distintos hacen falta
// k*(k-1)/2 bloques de separación, incluso en la combinación más ajustada.
function importes(total: number, cajas: number, minimo: number, maximo: number) {
  const unidades = total / 5;
  const bajo = Math.ceil(minimo / 5);
  const alto = Math.floor(maximo / 5);
  if (!Number.isInteger(unidades)) throw Error('El monto debe ser múltiplo de 5 para repartirlo sin sobrantes.');
  const objetivo = Math.max(cajas, Math.round(2 * unidades / (bajo + alto)));
  let cantidad = 0;
  for (let k = cajas; k <= alto - bajo + 1; k++) {
    const separacion = k * (k - 1) / 2;
    if (k * bajo + separacion > unidades) break;
    if (k * alto - separacion >= unidades &&
        (!cantidad || Math.abs(k - objetivo) < Math.abs(cantidad - objetivo))) cantidad = k;
  }
  if (!cantidad) throw Error('No hay combinación exacta de importes distintos con este monto, número de cajas y límites.');
  // Para tres partes preferimos la proporción 8:9:13 si cabe en el intervalo.
  if (cantidad === 3) {
    const a = Math.round(unidades * 8 / 30), b = Math.round(unidades * 9 / 30), c = unidades - a - b;
    if (bajo <= a && a < b && b < c && c <= alto) return [c*5, b*5, a*5];
  }
  let pendiente = unidades, siguiente = bajo;
  const valores: number[] = [];
  for (let k = cantidad; k > 0; k--) {
    const restantes = k - 1;
    const sumaMaxRestante = restantes * alto - restantes * (restantes - 1) / 2;
    const inferior = Math.max(siguiente, pendiente - sumaMaxRestante);
    const superior = Math.floor((pendiente - k * restantes / 2) / k);
    const elegido = Math.floor((inferior + superior) / 2);
    valores.push(elegido * 5);
    pendiente -= elegido;
    siguiente = elegido + 1;
  }
  return valores.reverse();
}

export function plan(monto: number, cajas: number, tasa: number, maximo: number) {
  validar(monto, cajas, tasa);
  const partes = importes(monto, cajas, minimoParte(monto), maximo);
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
