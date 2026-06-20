export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'presupuesto-simple-guaranies',
    title: 'Cómo hacer un presupuesto simple en guaraníes paso a paso',
    description:
      'Guía práctica para armar tu primer presupuesto mensual en guaraníes: ingresos, gastos fijos, variables y ahorro. Sin fórmulas complicadas.',
    date: '2026-06-01',
    content: `
<p>Armar un presupuesto suena complicado, pero no lo es. Necesitás papel, lapicera y un poco de honestidad. Acá te explicamos cómo hacerlo en menos de 30 minutos usando guaraníes.</p>

<h2>¿Por qué presupuestar en guaraníes (y no convertir todo a dólares)?</h2>
<p>La mayoría de las apps de finanzas están pensadas en dólares o euros. El problema es que cuando tu sueldo es en guaraníes, convertir todo el tiempo genera confusión y te desconecta de la realidad de tus gastos. Trabajar directamente en tu moneda local te da una imagen más clara de lo que entra y lo que sale.</p>

<h2>Paso 1: Anotá todos tus ingresos</h2>
<p>Empezá por lo que entra. Sueldo fijo, changas, alquileres, transferencias que recibís regularmente. Si tu ingreso varía mes a mes, usá el promedio de los últimos tres meses. No inflés el número: el presupuesto tiene que ser realista, no optimista.</p>
<p><strong>Ejemplo:</strong> Sueldo fijo ₲ 3.000.000 + ingreso extra promedio ₲ 500.000 = <strong>₲ 3.500.000 total</strong>.</p>

<h2>Paso 2: Listá tus gastos fijos</h2>
<p>Son los gastos que pagás sí o sí todos los meses: alquiler, cuotas, servicios (agua, luz, internet), seguro. Anotá cada uno con su monto exacto.</p>
<p><em>Tip: revisá los últimos 3 extractos de cuenta o resúmenes de tarjeta para no olvidarte de nada.</em></p>

<h2>Paso 3: Estimá los gastos variables</h2>
<p>Acá está el mayor desafío. Comida, transporte, salidas, ropa: cambian cada mes. Revisá tus últimos gastos y calculá un promedio razonable por categoría.</p>
<p>Si nunca llevaste registro, sobreestimá un poco. Es mejor que sobre a que falte.</p>

<h2>Paso 4: Definí un objetivo de ahorro</h2>
<p>Antes de cerrar el presupuesto, reservá una parte para ahorrar. La regla 50-30-20 dice: 50% a necesidades, 30% a gustos, 20% a ahorro. Pero si eso no encaja con tu realidad, empezá con lo que puedas: incluso un 5% ya es un hábito valioso.</p>
<p><strong>Ejemplo:</strong> 10% de ₲ 3.500.000 = <strong>₲ 350.000 de ahorro mensual</strong>.</p>

<h2>Paso 5: Revisá los números</h2>
<p>Sumá todos tus gastos (fijos + variables + ahorro). ¿Entra dentro del ingreso? Si gastos &gt; ingresos, algo tiene que ceder: reducir una categoría variable o buscar un ingreso extra. Si gastos &lt; ingresos, ese margen también podés sumarlo al ahorro o a una meta concreta.</p>

<h2>El presupuesto no es una celda</h2>
<p>Un presupuesto no es una lista de restricciones. Es un mapa. Te dice dónde estás y hacia dónde vas. Lo importante no es seguirlo al pie de la letra todos los meses, sino revisarlo, ajustarlo y aprender de las diferencias.</p>
<p>Con Saldo podés registrar cada movimiento en guaraníes, ver automáticamente en qué categoría gastás más y comparar mes a mes cómo evolucionan tus finanzas. Sin fórmulas de Excel, sin conversiones innecesarias.</p>
    `.trim(),
  },
  {
    slug: 'errores-comunes-manejo-dinero',
    title: '5 errores comunes al manejar la plata (y cómo evitarlos)',
    description:
      'Conocé los cinco errores financieros más frecuentes y las estrategias concretas para corregirlos, sin importar cuánto ganés.',
    date: '2026-06-10',
    content: `
<p>No importa cuánto ganés: si no manejás bien lo que entra, siempre va a faltar. Estos son los cinco errores que más se repiten y cómo salir de cada uno.</p>

<h2>1. No anotar los gastos chicos</h2>
<p>El café, el colectivo, la gaseosa. Son compras de ₲ 5.000 o ₲ 10.000 que parecen insignificantes. El problema es que se acumulan. ₲ 10.000 diarios son ₲ 300.000 al mes, casi el equivalente de una cuota importante.</p>
<p><strong>Cómo evitarlo:</strong> Registrá todo, sin excepción. Reservá 5 minutos al final del día para anotar lo que gastaste. Vas a sorprenderte.</p>

<h2>2. Guardar "lo que sobra" al final del mes</h2>
<p>"Este mes no gasté tanto, voy a guardar lo que sobre." El problema: casi nunca sobre nada. Los gastos tienden a expandirse hasta ocupar todo el ingreso disponible.</p>
<p><strong>Cómo evitarlo:</strong> Pagarte a vos mismo primero. Apenas cobrás, separás el monto de ahorro. Lo que queda es lo que podés gastar. El ahorro no es lo que sobra — es lo primero que sale.</p>

<h2>3. No tener un fondo de emergencia</h2>
<p>Una enfermedad, un electrodoméstico roto, perder trabajo por un mes. Sin un colchón de emergencia, cualquier imprevisto se convierte en deuda.</p>
<p><strong>Cómo evitarlo:</strong> El objetivo básico es tener entre 3 y 6 meses de gastos esenciales guardados. Si estás lejos de eso, empezá con una meta pequeña: ₲ 500.000 guardados para emergencias ya es una diferencia enorme frente a cero.</p>

<h2>4. Pagar solo el mínimo de deudas</h2>
<p>Si tenés tarjeta de crédito con saldo pendiente o una deuda con interés alto, pagar solo el mínimo es lo más caro que podés hacer. El interés compuesto trabaja en tu contra.</p>
<p><strong>Cómo evitarlo:</strong> Identificá cuál deuda te cobra más interés y concentrá pagos ahí. Una vez saldada, usá ese dinero para atacar la siguiente. Se llama método avalancha y es el más eficiente matemáticamente.</p>

<h2>5. No revisar tus gastos nunca</h2>
<p>Suscripciones que ya no usás, servicios que duplican cobertura, compras impulsivas que se repiten mes a mes. Si no revisás, pagás todo sin cuestionarlo.</p>
<p><strong>Cómo evitarlo:</strong> Una vez al mes, mirá en qué categorías gastaste más. ¿Coincide con lo que valorás realmente? Si no, ahí está el ajuste. Saldo te muestra el resumen mensual por categoría de forma automática para que este análisis te lleve menos de dos minutos.</p>

<h2>El error más grande: esperar el momento perfecto</h2>
<p>El mejor momento para empezar a ordenar tus finanzas era hace un año. El segundo mejor momento es ahora. No necesitás ganar más para empezar: necesitás saber a dónde va lo que ya ganás.</p>
    `.trim(),
  },
  {
    slug: 'registro-gastos-relacion-dinero',
    title: 'Por qué llevar un registro de gastos cambia tu relación con el dinero',
    description:
      'El simple acto de anotar tus gastos transforma cómo pensás sobre el dinero. Explicamos el porqué y cómo empezar sin que sea un trabajo extra.',
    date: '2026-06-18',
    content: `
<p>La mayoría de las personas saben, en general, cuánto ganan. Pero muy pocas saben con precisión cuánto gastan y en qué. Esa brecha entre lo que creemos gastar y lo que realmente gastamos es donde se pierde el dinero.</p>

<h2>La primera vez que ves tus números reales</h2>
<p>Hay algo que pasa la primera semana de llevar registro: te sorprendés. No porque gastes demasiado en categorías grandes como alquiler o comida, sino porque aparecen gastos que no recordabas. Una suscripción que pensabas haber cancelado. Cuatro veces de delivery en una semana. Compras pequeñas que juntas suman más que un pago de servicio.</p>
<p>Esa sorpresa no es un juicio sobre vos. Es información. Y la información es poder.</p>

<h2>El efecto "observador"</h2>
<p>En física hay un concepto llamado el efecto del observador: cuando medís algo, lo cambiás. Con el dinero pasa lo mismo. El simple acto de registrar un gasto modifica tu comportamiento. Antes de gastar, hay una fracción de segundo en que pensás: "¿Vale la pena anotarlo?". Y ese instante, a veces, es suficiente para tomar una decisión diferente.</p>
<p>No se trata de privarte de nada. Se trata de gastar con conciencia en vez de gastar en piloto automático.</p>

<h2>De la culpa a la claridad</h2>
<p>Muchas personas evitan mirar sus finanzas porque produce ansiedad. Si no lo ves, no existe. El problema es que existe igual, solo que sin posibilidad de actuar sobre ello.</p>
<p>Llevar registro cambia esa dinámica. En vez de culpa difusa, tenés datos concretos. En vez de "creo que gasté mucho este mes", tenés "gasté ₲ 850.000 en entretenimiento, que es ₲ 300.000 más que el mes pasado". Con esa información, podés decidir si ajustar o no. Pero la decisión es tuya, informada.</p>

<h2>Cómo empezar sin que sea un trabajo extra</h2>
<p>El error más común al intentar llevar registro es tratar de hacerlo perfecto desde el día uno: categorías detalladas, presupuesto completo, revisión diaria. Eso es demasiado para empezar.</p>

<h3>Semana 1</h3>
<p>Solo anotá. Sin juzgar, sin analizar. Cada gasto que hacés, lo registrás. Eso es todo.</p>

<h3>Semanas 2 y 3</h3>
<p>Mirá los patrones. ¿En qué categoría gastás más? ¿Hay algo que se repite que no esperabas?</p>

<h3>Semana 4</h3>
<p>Definí una sola cosa que querés cambiar el mes siguiente. Solo una.</p>

<p>La consistencia vale más que la perfección. Una semana imperfecta de registro es infinitamente más útil que un sistema perfecto que abandonás a los tres días.</p>

<h2>Lo que pasa después de tres meses</h2>
<p>Después de un trimestre llevando registro, algo cambia. Empezás a anticipar gastos en vez de sorprenderte con ellos. Ves los patrones estacionales (meses más caros, meses más tranquilos). Podés hacer proyecciones reales. Y, lo más importante, dejás de tener esa sensación permanente de que el dinero desaparece sin saber por qué.</p>
<p>Ese es el verdadero valor de llevar un registro: no ahorrar más (aunque eso pasa), sino ganar claridad. Y la claridad, con el dinero, es lo que te permite tomar decisiones de verdad.</p>
    `.trim(),
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
