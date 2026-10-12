# Digital Store — Frontend

React 18 single-page application of the Digital Store project, built with Create React App,
React Router 6 and Sass (CSS Modules). Setup and the feature list are in the
[main README](../README.md).

```bash
npm start                     # development server on http://localhost:3000
npm test -- --watchAll=false  # Jest + React Testing Library
npm run build                 # production build in ./build
```

The API must be running for products, login and the cart to work. Its URL comes from
`REACT_APP_API_URL` (default `http://localhost:3001`) — see [.env.example](.env.example).

## How it talks to the API

- [src/services/api.js](src/services/api.js) is the only place that calls `fetch`. It adds the
  `Authorization` header, turns API errors into `Error` objects with the API message, and holds the
  token in `localStorage`.
- [src/App.js](src/App.js) provides three contexts: `AuthContext` (current user, `entrar`, `sair`),
  `CartContext` (cart and its actions) and `SearchContext` (header search term).
- [src/hooks/useProdutos.js](src/hooks/useProdutos.js) loads the catalogue with loading and error states.

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
