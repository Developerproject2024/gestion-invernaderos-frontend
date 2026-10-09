# GestionInvernaderosFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Despliegues a Render

El workflow de GitHub Actions compila los pull requests hacia `main`. Cada push exitoso a `main` despliega ese commit a QA. Para promover una versión, publica un GitHub Release con una etiqueta que empiece por `v` (por ejemplo, `v1.2.3`) y basada en un commit de `main` que ya haya pasado por QA. El despliegue a STG espera aprobación; al quedar live, un release estable espera una segunda aprobación antes de promover el mismo commit a PROD. Los pre-releases se despliegan solo a STG.

Esta configuración usa un solo servicio de Render, por lo que QA, STG y PROD son etapas secuenciales sobre la misma URL; cada despliegue reemplaza el anterior. En Render, desactiva Auto-Deploy para que los cambios se publiquen únicamente después del flujo de Actions.

En GitHub, crea los environments `qa`, `stg` y `prod` en **Settings → Environments**. Configura required reviewers para `stg` y `prod`; deja `qa` sin aprobación. Agrega en los tres environments estos Actions secrets:

- `RENDER_API_KEY`: una API key de Render con acceso al servicio.
- `RENDER_SERVICE_ID`: el ID del servicio de Render que se usará en las tres etapas.

El workflow usa la API de Render para desplegar el SHA exacto del push o release y espera a que el despliegue quede live antes de continuar.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
