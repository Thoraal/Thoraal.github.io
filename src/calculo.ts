// Las cantidades están en unidades enteras de divisa y las tasas, en diezmilésimas de peso.
export function tasaDecimal(texto: string): number {
  if (!/^\d{1,5}([.,]\d{1,4})?$/.test(texto)) throw Error('Escribe una tasa positiva con hasta cuatro decimales.');
  const [entero, fraccion = ''] = texto.replace(',', '.').split('.');
  const tasa = Number(entero) * 10000 + Number(fraccion.padEnd(4, '0'));
  if (!tasa) throw Error('El tipo de cambio debe ser mayor que cero.');
  return tasa;
}

export function repartir(total: number, cantidad: number): number[] {
  if (!Number.isSafeInteger(total) || total < 1 || !Number.isSafeInteger(cantidad) || cantidad < 1 || cantidad > total)
    throw Error('Se necesita al menos una unidad por división.');
  const base = Math.floor(total / cantidad);
  const resto = total % cantidad;
  return Array.from({length: cantidad}, (_, i) => base + Number(i < resto));
}

export function pesosEnCentavos(unidades: number, tasa: number): number {
  return Math.floor((unidades * tasa + 50) / 100);
}

export function plan(monto: number, cajas: number, tasa: number) {
  if (!Number.isInteger(monto) || monto < 1 || monto > 1000000) throw Error('El monto debe ser un entero entre 1 y 1,000,000.');
  if (!Number.isInteger(cajas) || cajas < 1 || cajas > 50 || cajas > monto) throw Error('Usa de 1 a 50 cajas, con al menos una unidad por caja.');
  if (!Number.isInteger(tasa) || tasa < 1 || tasa > 999999999) throw Error('Revisa el tipo de cambio.');
  let inicio = 0;
  return repartir(monto, cajas).map(unidades => {
    const desde = inicio;
    inicio += unidades;
    return { unidades, desde, centavos: pesosEnCentavos(inicio, tasa) - pesosEnCentavos(desde, tasa) };
  });
}

// Parámetro heredado del fraccionador original. Redondear hacia abajo conserva el máximo.
export function maximoParte(referencia: number, tasa: number, moneda: string) {
  if (!(referencia > 0 && tasa > 0)) throw Error('Se necesitan ambas tasas.');
  const limite = Math.floor(1000 * referencia / tasa);
  if (limite < 1) throw Error('Con estas tasas, una unidad supera el máximo por parte.');
  return moneda === 'USD' && limite > 1000 ? 990 : limite;
}

export function detalle(caja: ReturnType<typeof plan>[number], tasa: number, maximo: number) {
  const cantidad = Math.ceil(caja.unidades / maximo);
  const base = Math.floor(caja.unidades / cantidad);
  const resto = caja.unidades % cantidad;
  // Acceso directo por renglón para mantener fluida la pantalla con montos grandes.
  function fila(indice: number) {
    const antes = indice * base + Math.min(indice, resto);
    const unidades = base + Number(indice < resto);
    const acumulado = antes + unidades;
    const alInicio = pesosEnCentavos(caja.desde + antes, tasa);
    const alFinal = pesosEnCentavos(caja.desde + acumulado, tasa);
    return { unidades, centavos: alFinal - alInicio, acumulado, restante: caja.unidades - acumulado };
  }
  return { cantidad, fila };
}
