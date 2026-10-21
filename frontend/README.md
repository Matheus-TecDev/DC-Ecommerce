# Digital Store — Frontend

React 18 single-page application of the Digital Store project, written in TypeScript and built with
Vite, React Router 6 and Sass (CSS Modules). Setup and the feature list are in the
[main README](../README.md).

Requires Node.js 20.19+ or 22.12+ (developed on Node.js 24).

```bash
npm install
npm run dev          # development server on http://localhost:3000, proxies /api to the API
npm run typecheck    # tsc --noEmit for src and for vite.config.ts
npm run lint         # ESLint, fails on any warning
npm test             # Vitest + React Testing Library, single non-interactive run
npm run test:watch   # Vitest in watch mode
npm run build        # type check, then production build in ./build
npm run preview      # serves ./build on http://localhost:3000
```

The API must be running for products, login and the cart to work. From the repository root,
`npm run dev` starts both; on its own the API is started with `npm --prefix ../backend run dev`.

## API address

| Variable | Default | Used by |
| --- | --- | --- |
| `VITE_API_URL` | empty | The browser code. When empty, development uses `/api` (proxied) and a production build uses `http://localhost:3001`. Embedded in the bundle, so it must never hold a secret. |
| `API_PROXY_TARGET` | `http://localhost:3001` | `vite.config.ts` only: target of the `/api` proxy of the development server. |

Copy [.env.example](.env.example) to `.env` to change them.

- **Development** (`npm run dev`): requests go to `http://localhost:3000/api/...` and Vite forwards
  them to `API_PROXY_TARGET` without the `/api` prefix. The browser never makes a cross-origin
  request, so `CORS_ORIGIN` does not matter.
- **Production build** (`npm run build`): there is no proxy. The bundle calls `VITE_API_URL`, or
  `http://localhost:3001` when it is empty, so the site origin must be in the API `CORS_ORIGIN`.
  Set `VITE_API_URL` when building for any other host.
- The production build is a static SPA. The server that hosts it must answer unknown paths (such as
  `/produtos/2`) with `index.html`; `npm run preview` already does this.

## TypeScript setup

- [tsconfig.json](tsconfig.json) covers `src` (application and tests) with `strict` plus
  `noUncheckedIndexedAccess`, `noImplicitReturns`, `noImplicitOverride`, `noUnusedLocals` and
  `noUnusedParameters`, the same extra checks used by the backend. Its only global types are
  `vite/client` (asset imports, SCSS modules, `import.meta.env`), so browser code cannot use Node.js
  globals.
- [tsconfig.node.json](tsconfig.node.json) covers `vite.config.ts` with Node.js types.
- [src/vite-env.d.ts](src/vite-env.d.ts) declares the `VITE_API_URL` variable.
- TypeScript only type-checks (`noEmit`); Vite transpiles the code. The frontend uses TypeScript 5.9
  rather than the backend's TypeScript 7, because `typescript-eslint` supports TypeScript only up to
  6.0.
- Class names from a SCSS module are typed as `string | undefined`, because the module typing cannot
  know which classes exist.
- The source contains no `any`, type assertions (other than `as const`), non-null assertions or
  compiler suppression comments.

## Lint

[eslint.config.js](eslint.config.js) applies the ESLint and `typescript-eslint` recommended rules,
the React hooks rules (`rules-of-hooks`, `exhaustive-deps`) and the same accessibility rules from
`eslint-plugin-jsx-a11y` that Create React App enabled.

## Code organization

```text
index.html               # HTML entry point, loads src/index.tsx
public/                  # favicon, manifest and icons, copied to the build as-is
src/
├── index.tsx            # React root + BrowserRouter
├── App.tsx              # providers, header selection and route table
├── types/
│   ├── modelos.ts       # Produto, UsuarioPublico, UsuarioSessao, cart models, credentials
│   ├── api.ts           # request bodies and responses exactly as the API defines them
│   └── formularios.ts   # sign-up form models
├── services/
│   ├── api.ts           # the only module that calls fetch; token storage; ErroApi
│   └── validacao.ts     # runtime validators that turn unknown JSON into typed models
├── utils/precos.ts      # price formatting and discount calculation
├── routes/routes.ts     # navigation links
├── pages/               # route-level composition
├── components/
│   ├── layout/          # headers, footer and navigation
│   └── ui/              # shared presentation components
├── features/
│   ├── auth/            # session context, login and sign-up
│   ├── produtos/        # catalogue context, product hooks and components
│   ├── carrinho/        # cart context, item list, summary and popover
│   ├── checkout/        # demonstration checkout flow
│   ├── home/            # home-only sections and assets
│   └── perfil/          # profile and order-history presentation
├── testes/apiFalsa.ts   # typed fake API used by the tests
└── setupTests.ts        # jest-dom matchers and cleanup after each test
```

Each feature owns its context, hooks, components and feature-only assets. Shared layout and UI stay
under `components`, while pages only compose features for each route.

## How it talks to the API

- [src/services/api.ts](src/services/api.ts) adds the `Authorization` header when there is a token
  and turns every failure into an `ErroApi` carrying the API message and the HTTP status (`null`
  when the server could not be reached). `mensagemDeErro` and `sessaoExpirada` read those errors
  from `unknown` values in `catch` blocks.
- API responses are treated as `unknown`. [src/services/validacao.ts](src/services/validacao.ts)
  checks each one against the contract (field by field, including nested cart items) and returns a
  typed object with only the known fields. A response outside the contract becomes an error message
  on screen instead of reaching a component.
- The contract types in [src/types](src/types) mirror `backend/src/types`. They are a deliberate
  copy: the two packages are installed and built separately, and neither imports from the other.
- Prices shown in the catalogue are calculated by `precoComDesconto` with the same rounding as the
  API; cart totals always come from the API.

## State

| Context | Hook | Holds |
| --- | --- | --- |
| `AuthContext` | `useAuth()` | `status` (`restaurando`, `anonimo` or `autenticado`), `usuario` (`null` when logged out), `entrar`, `sair` |
| `CartContext` | `useCarrinho()` | the detailed cart returned by the API and `adicionar`, `alterarQuantidade`, `remover`, `esvaziar` |
| `SearchContext` | `useSearch()` | the header search term |

The hooks throw when used outside their provider, so a missing provider fails immediately instead of
rendering with a silent default. `CartContext` reloads the cart when the user changes, clears it on
logout, ends the session when the API answers `401`, and ignores a response that arrives after a
newer cart request was sent.

## Routes

| Route | Screen | Data |
| --- | --- | --- |
| `/` | Home | API (products) |
| `/produtos`, `/categorias` | Product listing | API |
| `/produtos/:id` | Product page | API |
| `/produtos/carrinho` | Cart | API (requires login to have items) |
| `/login` | Login | API |
| `/cadastro`, `/cadastro/:email` | Sign-up | API |
| `/finalizarcompra` | Demonstration checkout | payment method choice that is never sent; summary from the cart |
| `/comprafinalizada` | Demonstration completed | static, fictional data |
| `/meuspedidos` | Orders and profile | static |

Unknown routes redirect to the home page.

## Tests

`npm test` runs Vitest once in a jsdom environment ([vite.config.ts](vite.config.ts), `test`
section). Test files import `describe`, `test`, `expect` and `vi` from `vitest`; mocks created with
`vi.spyOn` are restored after every test, and `VITE_API_URL` is fixed to `http://localhost:3001`.

- [src/App.test.tsx](src/App.test.tsx): the whole application rendered with a memory router, with
  only `fetch` replaced by [src/testes/apiFalsa.ts](src/testes/apiFalsa.ts). Elements are found by
  role and accessible name.
- `src/services/*.test.ts`: response validation and the HTTP client.
- `src/utils/precos.test.ts`: discount rounding and price formatting.
- `src/features/contextos.test.tsx`: hooks used outside their providers.

## Known limitations

- The checkout and "demonstration completed" screens, the order history and profile screens, the
  filter sidebar, the sort selector, the coupon and shipping fields, the size and colour pickers and
  the social login icons are layout only, as described in the [main README](../README.md#features).
  The checkout says so on screen and asks for no personal, delivery or card data.
- The components `Banner`, `Destaques` and `SliderProdutoSelecionado`
  come from the original project and are not rendered by any route. They have no tests.
- Several stylesheets declare element selectors (`input`, `u`, `*`) that CSS Modules does not scope,
  so they apply to the whole application. They were left as they are to preserve the current look.
- The development server does not run the type checker; run `npm run typecheck` (the build does it
  automatically).
- CSS is no longer passed through Autoprefixer as it was with Create React App. The only prefixes it
  added were `::-webkit-input-placeholder` copies of `::placeholder` rules, which current browsers do
  not need.
- The tests still use React Testing Library 13 and user-event 13, the versions used before the move
  to Vitest.
