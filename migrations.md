# 📂 Guía de Migraciones (Database Migrations)

Este documento detalla el flujo de trabajo, los estándares y las medidas de seguridad para modificar el esquema de la base de datos en este proyecto.

## 🚀 Conceptos Fundamentales

Las migraciones son archivos controlados por versiones que permiten transformar el esquema de la base de datos de un estado a otro de forma reproducible. Utilizamos **Sequelize CLI** con TypeScript.

Estructura de una Migración
Cada archivo tiene dos funciones principales:

- `up`: Aplica los cambios (Ej: Crear una tabla, añadir una columna).

- `down`: Revierte los cambios (Ej: Eliminar la tabla, quitar la columna).

_⚠️ *ATENCION!*:En un entorno de `Zero Downtime`, el uso de `down` es altamente riesgoso. Si reviertes una migración de "Expansión" mientras el código nuevo está en ejecución, la aplicación fallará al buscar columnas que ya no existen. Si reviertes una de "Contracción", podrías restaurar una estructura que el código actual ya no sabe gestionar, generando inconsistencia de datos._

_🏆 Regla de oro: En producción, preferimos "Forward-only" (crear una nueva migración que arregle el error) en lugar de ejecutar `down`._

## 🛡️ Flujo de Cambio Seguro: Expandir y Contraer (Parallel Changes)

Para garantizar Zero Downtime (cero tiempo de inactividad) y evitar que la aplicación falle durante un despliegue, nunca realizamos cambios destructivos en un solo paso. Seguimos el flujo de "Expansión y Contracción".

### Fase 1: Expandir (Despliegue 1)

- **Acción**: Añadir nuevos elementos (Tablas, Columnas, Índices).
- **Regla**: Las nuevas columnas deben ser nulables o tener un valor por defecto.
- **Por qué**: El código antiguo que aún corre en producción no conoce la nueva columna y enviará objetos sin ese campo. Si la columna es `NOT NULL`, la base de datos rechazará el registro y la app fallará.

### Fase 2: Sincronizar / Migrar (Despliegue 2)

- **Acción**: El código se actualiza para escribir en ambos campos (viejo y nuevo) o empezar a leer del nuevo. Se ejecutan scripts para mover datos de la columna vieja a la nueva si es necesario.

### Fase 3: Contraer (Despliegue 3)

- **Acción**: Una vez que confirmamos que el código ya no usa la columna vieja, creamos una migración para eliminarla (`DROP COLUMN`).

- **Regla**: Nunca contraigas en el mismo despliegue en el que expandiste. Si necesitas hacer un "Rollback" del código, este buscará la columna que acabas de borrar y la app morirá.

## 📔 Registro de Consultas y Auditoría (`queries.sql`)

Mantenemos un archivo maestro en `database/tools/queries.sql`.

- **Propósito**: Este archivo actúa como un diario de ejecución y "sanación" (healing).

- **Uso**: Antes de escribir una migración en TypeScript, la consulta SQL pura debe probarse y guardarse aquí. Esto permite rastrear la lógica exacta que se aplicó y sirve como respaldo en caso de que necesitemos reconstruir una parte específica del esquema manualmente.

- **Regla**: Si cambias la estructura en una migración, asegúrate de que el cambio quede reflejado en el historial de este archivo.

## 🏗️ Anatomía y Orden de una Migración

Para mantener la integridad referencial y evitar errores de ejecución, cada archivo de migración debe organizar sus operaciones siguiendo estas 6 fases estrictas. Esto asegura que los objetos se creen en el orden lógico que PostgreSQL requiere.

### Fases de Ejecución Interna:

0. **PHASE 0: PRE-CONDITION CHECKS (Fail-Fast)**: Esta fase se ejecuta fuera de la transacción principal (o al puro inicio) para verificar que el entorno es apto. Si algo falta, la migración "explota" de inmediato sin dejar cambios a medias. Verificaremos que la extensión de PostgreSQL necesaria para UUIDs o cálculos avanzados esté disponible, o que las tablas que vamos a modificar realmente existan.

1. **PHASE 1: TYPES (With Guard)**: Definición de Enums o tipos personalizados. Siempre usa un guardián (`IF NOT EXISTS`) para evitar fallos si el tipo ya fue creado en un intento previo.

2. **PHASE 2: NEW TABLES**: Creación de tablas completamente nuevas.

3. **PHASE 3: UPDATING EXISTING TABLES**: Añadir o renombrar columnas en tablas que ya existen.

4. **PHASE 4: DATA HEALING**: Ejecución de scripts SQL para limpiar datos, transformar strings o rellenar nuevas columnas obligatorias antes de aplicar restricciones.

5. **PHASE 5: INDEXES**: Creación de índices para optimizar búsquedas. Se hace al final para no ralentizar la inserción de datos masiva si la hubiera.

6. **PHASE 6: CONSTRAINTS**: Aplicación de `Foreign Keys`, `Unique` o `Check Constraints`. Es el último paso porque requiere que tanto las tablas como los datos (Healing) ya estén correctos.

7. **PHASE 7: CLEANUP & AUDIT**: Esta es la fase de "ordenar la casa" después de la batalla. Se ejecuta justo antes o después del commit. Podemos limpiar registros huérfanos que hayan quedado tras los casts de Enums o registrar un log manual en una tabla de auditoría para confirmar que la reconciliación se completó.

_**Nota**: Dentro de la migración, envuelve siempre estas fases en una Transacción de Sequelize para asegurar que, si falla la Fase 6, no se queden creadas a medias las tablas de la Fase 2._

## 🛠️ Comandos Útiles

### Generar una nueva migración.

Usa siempre el estándar: `[acción]-[entidad]-[descripción]` en minúsculas y separado por guiones.

```bash
# Formato: npx sequelize-cli migration:generate --name accion-entidad-descripcion
npx sequelize-cli migration:generate --name add-status-to-proposals
```

- Acciones comunes: `add`, `remove`, `rename`, `create`, `change`.
- Resultado: Generará `database/migrations/YYYYMMDDHHMMSS-add-status-to-proposals.ts`.

### Aplicar cambios

```bash
npm run db:migrate
```

### Deshacer la última migración (Rollback)

```bash
npx sequelize-cli db:migrate:undo
```

_⚠️ **Atención**: Solo usa `undo` en desarrollo local. En producción, si algo falla, prefiere crear una nueva migración que arregle el problema (Forward-only)._

## 🔄 Sincronización de Datos Post-Migración

Tras ejecutar una migración, la estructura de la base de datos cambia, pero los datos existentes (o los seeds) podrían quedar obsoletos o incompletos. Elige el comando según tu necesidad:

### Escenario A: Solo actualizar estructura (`npm run db:migrate`)

- **Qué hace**: Ejecuta solo los archivos pendientes en la carpeta `migrations/`.
- **Cuándo usar**:
  - En entornos compartidos (Staging).
  - En local, si solo has añadido un índice o una columna opcional y no quieres perder tus datos actuales de prueba.

### Escenario B: Re-sincronizar Seeds (`npm run db:seed`)

- **Qué hace**: Ejecuta los archivos SQL de la carpeta `seeds/` sobre la base actual.
- **Cuándo usar**:
  - Has añadido datos nuevos a los archivos `.sql` y quieres verlos sin borrar el resto de tu base de datos.
  - _**Nota**: Requiere que tus seeds tengan la cláusula `ON CONFLICT` para no duplicar IDs._

### Escenario C: Limpieza Total / Reset (`npm run db:reset`) — RECOMENDADO

- _Qué hace_: Borra el volumen de Docker (`down -v`), recrea el contenedor, aplica todas las migraciones desde cero y carga todos los seeders.
- _Cuándo usar_:
  - Siempre después de un git pull con nuevas migraciones.
  - Si has añadido una columna `NOT NULL` (el `db:migrate` fallará o dejará la base inconsistente si no reseteas para que el seeder rellene esos campos).
  - Si el estado de tu base de datos local es confuso o tiene errores de constraints.

## 📝 Reglas de Oro

- **Inmutabilidad**: Una vez que una migración se ha subido a la rama principal (`main`), no se toca. Si hay un error, se crea una nueva migración para corregirlo.
- **Idempotencia**: Escribe migraciones que no fallen si se ejecutan dos veces (ej. usar `IF NOT EXISTS` si usas `SQL` puro).
- **Locks de Tabla**: En tablas grandes (como `Advisors`), añadir una columna con un valor `DEFAULT` puede bloquear la tabla por minutos. Es mejor añadir la columna como nulable y luego poblarla en lotes (batches).
- **Tipado en TS**: Asegúrate de que los tipos de la migración coincidan exactamente con lo definido en los modelos de `/models`.
- **Cambios de Tipo de Dato (Type Casting)**: Los cambios de tipo de dato en columnas existentes se consideran cambios destructivos.
  - No alteres la columna original.
  - Crea una nueva columna (ej. nombre_v2) con el tipo deseado.
  - Implementa lógica de "Double Write" (escribir en ambas) en el código.
  - Una vez migrados los datos y verificado el funcionamiento, elimina la columna antigua en un despliegue posterior (Fase de Contracción).

## 🔄 Manejo de Errores y "Undo"

- **En Local**: Puedes deshacer cambios para limpiar tu base de datos de pruebas.
- **En Producción**: El comando `undo` es peligroso porque puede causar pérdida de datos irreversible. Siempre revisa el plan de ejecución con tu equipo antes de aplicar cambios en entornos productivos.
