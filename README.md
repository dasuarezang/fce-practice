# FCE Practice

Web para estudiar el temario de inglés del FCE (Cambridge First) con los apuntes de clase. Sin build ni dependencias: HTML, CSS y JavaScript puro.

- Elige temas y subtemas, y practica con ejercicios tipo Kahoot, relacionar con flechas, rellenar huecos y ordenar palabras.
- Consulta la teoría (tus apuntes en limpio) y la pantalla de **Cobertura** para ver qué has practicado.
- El progreso se guarda solo en tu navegador (`localStorage`).

## Ejecutar en local

```
python -m http.server 8000
```

y abre `http://localhost:8000`. También funciona abriendo `index.html` directamente.

## Pruebas y verificador

Requiere Node 18 o superior; no hay dependencias que instalar.

```
npm test          # pruebas unitarias
npm run check     # verifica que NADA de los apuntes se salta
```

`npm run check` falla si los totales no coinciden con el inventario de `tools/inventory.js`, si algún ítem no aparece en la teoría o si algún ítem tiene menos de 2 tipos de ejercicio. Los ítems marcados con `revisar` salen como avisos: son los que hay que confirmar contra el cuaderno.

## Ampliar el temario

1. Copia `data/tema2-leisure-pleasure.js` a `data/temaN-nombre.js` y rellena sus secciones con los tipos existentes (`pares`, `antonimos`, `colocaciones`, `tabla`, `regla`, `estructura`). Cada ítem lleva un `id` estable y `fuente` (página).
2. Regístralo en `data/index.js` (para Node) y en `index.html` (para el navegador), en el mismo orden.
3. Añade sus secciones y totales a `tools/inventory.js`.
4. Ejecuta `npm test && npm run check`.

Si necesitas un tipo de contenido nuevo, añade su generador de ejercicios en `js/gen/`, su soporte en `FCE.gen.SUPPORT` (`js/gen/index.js`) y su vista de teoría en `js/theory.js`.

## Estructura

```
index.html
css/      estilos (Liquid Glass solo en capas flotantes; sin degradados)
data/     un archivo por tema
js/gen/   generadores de preguntas (puros, con pruebas)
js/ui/    pantallas y ejercicios
tools/    inventario, validador y verificador
tests/    pruebas con node:test
docs/     spec y plan de implementación
```
