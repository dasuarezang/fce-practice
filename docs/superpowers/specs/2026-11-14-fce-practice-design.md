    # FCE Practice — Design Spec

Fecha: 2026-11-14 · Estado: pendiente de revisión del usuario

## 1. Objetivo

Web estática para estudiar el temario de inglés (Cambridge FCE) dado en la academia del usuario. Debe ser un recurso **fiable**: todo lo que sale en los apuntes (`primerosdosexamenes.pdf`, 5 páginas manuscritas) entra en la web, con redundancia entre tipos de ejercicio. Debe poder ampliarse fácilmente conforme se dé más temario.

Publicación: repositorio público `dasuarezang/fce-practice`, GitHub Pages desde `main` → `https://dasuarezang.github.io/fce-practice/`. Commits sin ninguna atribución a Claude.

## 2. Decisiones ya tomadas

- **Enfoque A:** HTML + CSS + JS puro, sin build, sin dependencias de ejecución. Se abre con doble clic en local.
- **Datos separados del código**, un archivo por tema, cargados como scripts clásicos (`window.FCE_DATA`) para que funcione sin servidor.
- **Estilo:** Apple + Liquid Glass. **Sin degradados.** Fondo plano (claro `#f5f5f7`, oscuro `#000`/`#1c1c1e`). El cristal (`backdrop-filter: blur`, fondo translúcido, borde fino) solo en capas flotantes: barra superior, barra inferior de práctica, hojas modales y feedback de respuesta. Tarjetas normales planas, blancas, sombra mínima.
- Tipografía del sistema (SF Pro / Inter de respaldo), claro/oscuro automático, responsive móvil, respeta `prefers-reduced-motion`.
- Interfaz en español; contenido de estudio en inglés (traducciones en español donde los apuntes las dan).
- Progreso en `localStorage`, sin cuentas.
- La caja de la página 1 (venue / lend-borrow / hassle) **queda fuera**, por indicación del usuario.

## 3. Estructura del proyecto

```
index.html
css/        base.css  glass.css
js/         app.js  selector.js  theory.js  coverage.js  store.js
            quiz/   kahoot.js  match.js  gapfill.js  reorder.js
            gen/    generadores de preguntas por tipo de contenido
data/       index.js  tema1-family-affair.js  tema2-leisure-pleasure.js
tools/      check.js          (verificador, Node sin dependencias)
docs/superpowers/specs/       este documento
README.md   cómo ampliar el temario
```

## 4. Modelo de datos

Un tema:

```js
{ id:"t1", titulo:"1. Family Affair", secciones:[ Seccion, ... ] }
```

Una sección: `{ id, titulo, grupo, tipo, items:[...] }` con `grupo` ∈ `vocabulario | gramatica | expressions` (agrupa el selector) y `tipo` ∈:

| tipo | item |
|---|---|
| `pares` | `{id, termino, definicion, fuente}` (phrasal verbs, adjetivos con traducción, -ed/-ing) |
| `antonimos` | `{id, positivo, negativo, fuente}` |
| `colocaciones` | `{id, verbo:"do"\|"make", resto, fuente}` |
| `tabla` | `{id, base, comparativo, superlativo, nota?, fuente}` |
| `regla` | `{id, titulo, formula, puntos[], fuente}` (Present Perfect, -ed/-ing, regla de 3+ sílabas) |
| `estructura` | `{id, proposito, formula, ejemplo, fuente}` (expressions) |

Cada `id` es estable y legible (`t2-expr-by-far`), de modo que editar texto no rompe el progreso guardado. `fuente` es la página del PDF.

## 5. Flujo de pantallas

1. **Inicio:** tarjetas de **1. Family Affair** y **2. Leisure and Pleasure** con progreso, botones *Practicar* / *Teoría*.
2. **Selector:** cada tema se despliega en subtemas con casillas, agrupados en Vocabulario / Gramática / Expressions. "Marcar todo" por tema, contador en vivo de ítems seleccionados, elección de tipo de ejercicio (Mixto, Kahoot, Relacionar, Huecos, Ordenar) y duración (10 / 20 / todo).
3. **Práctica:** una pregunta por pantalla, barra de progreso fina, feedback inmediato con la regla/definición correcta. Los fallos reaparecen al final de la tanda.
4. **Resultados:** porcentaje, lista de fallos, *Repetir solo los fallos*.
5. **Teoría:** los apuntes en limpio. Tablas de comparativos y cajas de Present Perfect como en el cuaderno; estructuras de *expressions* resaltadas en amarillo plano.
6. **Cobertura:** por tema/subtema, ítems totales, trabajados y con fallos.

## 6. Ejercicios

- **Kahoot:** pregunta + 4 tarjetas de colores. Término→definición y definición→término. Distractores del mismo bloque.
- **Relacionar:** dos columnas; se arrastra de un punto a otro para trazar una flecha (ratón y táctil).
- **Huecos:** frase con hueco, escritura libre u opciones. Para *do/make* (`___ the bed`) y para *expressions* (`She finds physics ___ challenging ___ maths`).
- **Ordenar:** palabras sueltas que se arrastran para formar la estructura o la frase de ejemplo.

Cada tipo de contenido declara qué ejercicios admite; los generadores producen las preguntas a partir de los datos, sin escribirlas a mano. *Do/make* solo tiene dos respuestas posibles, por eso se practica sobre todo con huecos y relacionar.

**Parte "Expressions" del Tema 2:** teoría con las estructuras resaltadas; huecos sobre los ejemplos; "elige la estructura según la situación" (diferencia grande/pequeña, igualdad, etc.); reordenar la estructura.

## 7. Garantía de cobertura

`node tools/check.js` falla si:
- los totales no coinciden con el inventario de la sección 8,
- algún ítem no aparece en la teoría o en **menos de 2 tipos de ejercicio**,
- hay `id` duplicados o campos vacíos.

Se ejecuta antes de cada subida. La pantalla de cobertura de la app refleja el mismo inventario.

**Ampliar temario:** copiar un `temaN-*.js`, rellenar secciones con un tipo existente, registrarlo en `data/index.js`, ejecutar el verificador. Un tipo de contenido nuevo implica un generador nuevo en `js/gen/`, sin tocar el resto.

## 8. Inventario y transcripción de los apuntes

Totales verificables: T1 PV 6 · adjetivos 20 · antónimos 8 · Present Perfect 2 cajas · Do/Make 29 · T2 PV 8 · -ed/-ing 2 reglas · tabla regulares 6 filas + regla 3+ sílabas · irregulares 5 · expressions 11.

### Tema 1 · Family Affair (p. 1)

**Phrasal verbs:** hang out = spend time with someone · count on = rely on; depend on · turn into = become; transform · make it up = invent; lie *(¿lie? confirmar)* · carry on = continue · turn up = arrive; appear.

**Adjectives (con traducción):** anxious = ansioso · bad-tempered = malhumorado · bossy = mandón · bright = brillante · considerate = considerado · dishonest = deshonesto · enthusiastic = entusiasta · hard-working = trabajador · impatient = impaciente · disappointed = decepcionado · mature = maduro · organised = organizado · polite = educado/cortés · quiet = callado · reserved = reservado · responsible = responsable · sensitive = sensible · unreliable = poco fiable · wise = sabio · upset = enfadado/molesto.

**Present Perfect Simple:** `have + past participle` · ve la acción como algo permanente · enfatiza el resultado · acción terminada · se centra en cuántas veces ha ocurrido.
**Present Perfect Continuous:** `have + been + verb-ing` · ve la acción como temporal · enfatiza la acción en sí · acción en progreso · se centra en cuánto tiempo lleva en progreso.

**+ Adjective : − Adjective:** considerate : inconsiderate · enthusiastic : unenthusiastic · organised : disorganised · responsible : irresponsible · concerned : unconcerned · mature : immature · polite : impolite · sensitive : insensitive.

### Do or Make (p. 2)

do an activity · make an appointment · make an arrangement · make the bed · do business · make a change · make a choice · do the cleaning · do a course · make a decision · make an effort · make an excuse · do (an) exercise · do a favour · make friends · do homework · do housework · make an impression · do a job · make a mistake · make money · make a noise · make a phone call · make a plan · make progress · make a promise · do the shopping · do (a) sport · do work.

### Tema 2 · Leisure and Pleasure (pp. 3–5)

**Phrasal verbs & expressions:** come across = to meet someone or find something by chance · come along = to arrive or appear in a place · come up against = to have to deal with a problem or difficulty · count on = to be able to depend on something or someone · end up = to finally be in a particular place or situation · go on = to continue to happen or exist · run out of = to finish, use or sell something completely · throw yourself into = to start doing something with a lot of enthusiasm and energy.

**Adjectives ending -ed / -ing:** *-ed* → refer to feelings (ejemplo: "I feel really EXCITED for …") · *-ing* → refer to actions or situations (ejemplo: "Tomorrow's day will be really EXCITING, … is launching!"). *Los dos ejemplos están en letra poco legible: confirmar.*

**Comparison vocabulary:** comparative adjectives compare two things · superlative adjectives compare one thing to a group.

| Adjective | Comparative | Superlative |
|---|---|---|
| high *(one syllable)* | higher | highest |
| small | smaller | smallest |
| fat *(ending single consonant)* | fatter | fattest |
| sad | sadder | saddest |
| clever *(two syllables)* | cleverer / more clever | cleverest / most clever |
| narrow | narrower / more narrow | narrowest / most narrow |

Three or more syllables: more + adjective / most + adjective (experienced → more experienced → most experienced; inconvenient → more inconvenient → most inconvenient).

**Irregular adjectives:** good–better–best · bad–worse–worst · little–less–least · much–more–most · far–further/farther–furthest/farthest.

**Expressions (11):**

| # | Propósito | Estructura | Ejemplo |
|---|---|---|---|
| 1 | Dos cosas iguales | as + adjective + as | She finds physics as challenging as maths. |
| 2 | Una cosa menos que otra | not so/as + adjective + as | The party's majority in Parliament is not so/as big as it was. |
| 3 | Más o menos que otra | less/least + adjective | This coat is less expensive than the other one. / This is the least expensive coat in the shop. |
| 4 | Hacer algo igual que otra persona | as + adverb + as | She dresses as elegantly as a fashion model. |
| 5 | Hacer algo de forma distinta | not so/as + adverb + as | He doesn't adapt to new situations as rapidly as his peers. |
| 6 | Diferencia grande | much/far/a lot/considerably + adjective/adverb + -er/more + adjective/adverb | Acts of kindness are often much more common when societies face big challenges. |
| 7 | Diferencia grande | not nearly as + adjective/adverb + as | The study of genetics is not nearly as well developed as we would wish. *(última palabra poco legible)* |
| 8 | Diferencia grande | by far + superlative | This restaurant's pizza is by far the most authentic I've tried in my city. |
| 9 | Diferencia grande | one of the most + superlative + plural noun *(apuntes: "infinitive"? confirmar)* | Amazingly, one of the filthiest parts of the human body is the mouth, which has 600 different types of bacteria living on it. |
| 10 | Diferencia pequeña | slightly/a bit/a little + adjective/adverb + -er/more + adjective/adverb | Because of the new gambling law, people spend slightly less time in casinos than they did in the past. |
| 11 | Diferencia pequeña | not quite as + adjective/adverb + as | The launch of the new product was not quite as successful as anticipated. |

## 9. Puntos abiertos a confirmar contra el cuaderno

1. T1: *make it up* = invent; **lie**.
2. -ed/-ing: texto exacto de los dos ejemplos.
3. Expression 7: última palabra de la frase de ejemplo ("wish"/"think").
4. Expression 9: "plural noun" frente a "infinitive".
5. *Do or Make* se trata como bloque propio dentro del Tema 1.

## 10. Fuera de alcance (YAGNI)

Cuentas de usuario, backend, audio, sincronización entre dispositivos, escáner de los apuntes originales dentro de la web.
