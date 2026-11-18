# Fraccionador de divisas

Aplicación TypeScript publicada en https://thoraal.github.io/. La dirección anterior /fraccionador/ conserva los parámetros y el código de la operación al abrir la portada.

## Cómo explicar una operación

Con 100 USD, tres cajas y una tasa aplicada de 18.50 MXN por USD, el total es 1,850.00 MXN. Al dividir 100 entre tres quedan 33 unidades por caja y sobra una. La primera caja recibe esa unidad: 34, 33 y 33 USD. Sus equivalentes son 629.00, 610.50 y 610.50 MXN.

El límite interno por parte es la parte entera de 1,000 × la referencia Banxico / tasa aplicada. Para dólares se conserva la regla histórica de 990 cuando el resultado entero supera 1,000. Se elige el mínimo número de partes que permite respetar el máximo. Cada parte recibe el cociente entero y las primeras reciben una unidad sobrante. Es un reparto determinista. Los códigos históricos recuperan los datos de entrada y los importes se recalculan con el método actual.

Los cálculos usan unidades enteras y tasas de hasta cuatro decimales. Los centavos de cada fila se obtienen restando dos totales acumulados redondeados. Así cada subtotal y el total general coinciden incluso cuando la tasa produce fracciones de centavo. El reporte corresponde a la caja seleccionada. Por encima de 5,000 partes se imprime un resumen y se conserva el detalle paginado en pantalla.

## Datos y desarrollo

El campo de referencia consulta el historial de la serie SF60653 en public/cotizaciones.json. Una fecha sin dato permite calcular totales y cajas, pero deja pendiente el desglose por partes. El workflow de actualización requiere el secreto de Actions BANXICO_TOKEN. Los visitantes sólo reciben el historial.

Con Node 22.13 o superior, ejecuta npm ci, npm test y npm run build. npm run dev inicia la aplicación local. src/calculo.ts contiene la lógica independiente de la interfaz. GitHub Actions compila con TypeScript y Vite y publica dist/ en Pages.
