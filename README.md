# Fraccionador de divisas

Aplicación TypeScript publicada en https://thoraal.github.io/. La dirección anterior /fraccionador/ conserva los parámetros y el código de la operación al abrir la portada.

## Cómo explicar una operación

Con 1,500 USD, tres cajas, referencia 20.4820 y tasa aplicada 18.50, la distribución es 650, 400 y 450 USD. Las tres partidas son múltiplos de cinco y sus equivalentes suman 27,750.00 MXN.

Los mínimos históricos por tramo se aplican al monto total de la operación. El máximo se calcula con la referencia y se ajusta hacia abajo al múltiplo de cinco. La guía en la aplicación muestra todos los tramos. Para cada número posible de partes, se compara el total con la suma de los menores y mayores valores distintos disponibles. Entre los recuentos factibles se prefiere el que aproxima el importe medio al centro del intervalo, con al menos una parte por caja. Para tres partes se prefiere la proporción 8:9:13 cuando es válida. Las cajas agrupan partes sin repetir importes en toda la operación. Un código recupera los datos y los recalcula con estas reglas.

Los cálculos usan unidades enteras y tasas de hasta cuatro decimales. Los centavos de cada fila se obtienen restando dos totales acumulados redondeados. Así cada subtotal y el total general coinciden incluso cuando la tasa produce fracciones de centavo. El reporte corresponde a la caja seleccionada. Por encima de 5,000 partes se imprime un resumen y se conserva el detalle paginado en pantalla.

## Datos y desarrollo

El campo de referencia consulta el historial de la serie SF60653 en public/cotizaciones.json. Una fecha sin dato permite calcular la conversión, pero deja pendiente el desglose por partes. El workflow de actualización requiere el secreto de Actions BANXICO_TOKEN. Los visitantes sólo reciben el historial.

Con Node 22.13 o superior, ejecuta npm ci, npm test y npm run build. npm run dev inicia la aplicación local. src/calculo.ts contiene la lógica independiente de la interfaz. GitHub Actions compila con TypeScript y Vite y publica dist/ en Pages.
