# Digital Store — Frontend

React 18 single-page application of the Digital Store project, written in TypeScript and built with
Create React App, React Router 6 and Sass (CSS Modules). Setup and the feature list are in the
[main README](../README.md).

```bash
npm start                     # development server on http://localhost:3000
npm run typecheck             # tsc --noEmit over sources and tests
npm run lint                  # ESLint (Create React App rules), fails on any warning
npm test -- --watchAll=false  # Jest + React Testing Library
npm run build                 # production build in ./build
```

The API must be running for products, login and the cart to work. Its URL comes from
`REACT_APP_API_URL` (default `http://localhost:3001`) — see [.env.example](.env.example). The value
is embedded in the bundle, so it must never hold a secret.

## TypeScript setup

- [tsconfig.json](tsconfig.json) enables `strict` plus `noUncheckedIndexedAccess`,
  `noImplicitReturns`, `noImplicitOverride`, `noUnusedLocals` and `noUnusedParameters`, the same
  extra checks used by the backend. JavaScript files are not accepted (`allowJs: false`).
- TypeScript only type-checks (`noEmit`). Create React App compiles the code with Babel, which is why
  `isolatedModules` is on and `module`, `moduleResolution` and `jsx` use the values it requires.
- TypeScript is pinned to the 4.9 line, the newest one supported by `react-scripts` 5.
- [src/react-app-env.d.ts](src/react-app-env.d.ts) loads the Create React App type declarations for
  SCSS modules, images and `process.env`. Class names from a SCSS module are typed as
  `string | undefined`, because the module typing cannot know which classes exist.
- The source contains no `any`, type assertions (other than `as const`), non-null assertions or
  compiler suppression comments.

## Code organization

```text
src/
├── index.tsx            # entry point: React root + BrowserRouter
├── App.tsx              # providers, header selection and route table
├── types/
│   ├── modelos.ts       # Produto, UsuarioPublico, UsuarioSessao, cart models, credentials
│   ├── api.ts           # request bodies and responses exactly as the API defines them
│   └── formularios.ts   # sign-up form models
├── services/
│   ├── api.ts           # the only module that calls fetch; token storage; ErroApi
│   └── validacao.ts     # runtime validators that turn unknown JSON into typed models
├── contexts/            # AuthContext, CartContext, SearchContext
├── hooks/               # useProdutos (catalogue), useProduto (one product)
├── utils/precos.ts      # price formatting and discount calculation
├── routes/routes.ts     # navigation links
├── pages/               # route-level screens
├── components/          # one folder per component: index.tsx + styles.module.scss
└── testes/apiFalsa.ts   # typed fake API used by the tests
```

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
| `/finalizarcompra` | Checkout | static form; summary from the cart |
| `/comprafinalizada` | Order completed | static |
| `/meuspedidos` | Orders and profile | static |

Unknown routes redirect to the home page.

## Tests

`npm test -- --watchAll=false` runs:

- [src/App.test.tsx](src/App.test.tsx): the whole application rendered with a memory router, with
  only `fetch` replaced by [src/testes/apiFalsa.ts](src/testes/apiFalsa.ts). Elements are found by
  role and accessible name.
- `src/services/*.test.ts`: response validation and the HTTP client.
- `src/utils/precos.test.ts`: discount rounding and price formatting.
- `src/contexts/contextos.test.tsx`: hooks used outside their providers.

## Known limitations

- The checkout, "order completed", order history and profile screens, the filter sidebar, the sort
  selector, the coupon and shipping fields, the size and colour pickers and the social login icons
  are layout only, as described in the [main README](../README.md#features).
- The components `Banner`, `Destaques`, `ContainerFinalizarCompra` and `SliderProdutoSelecionado`
  come from the original project and are not rendered by any route. They were migrated to
  TypeScript but have no tests.
- Several stylesheets declare element selectors (`input`, `u`, `*`) that CSS Modules does not scope,
  so they apply to the whole application. They were left as they are to preserve the current look.
- Create React App is no longer maintained. Its tooling prints a Node.js `punycode` deprecation
  notice during tests and an outdated Browserslist notice during builds.
