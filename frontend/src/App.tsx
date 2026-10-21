import styles from './App.module.scss';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Produtos from './pages/Produtos';
import MeusPedidos from './pages/MeusPedidos';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Footer from './components/layout/Footer';
import Compra from './pages/Compra';
import { ProdutoSelecionado, SearchProvider } from './features/produtos';
import HeaderMobile from './components/layout/HeaderMobile';
import { AuthProvider, CriarConta } from './features/auth';
import HeaderAuth from './components/layout/HeaderAuth';
import { MeusPedidosFinalizados } from './features/perfil';
import { CompraRealizada } from './features/checkout';
import { CartProvider } from './features/carrinho';

function App() {
  const { pathname } = useLocation();
  const telaDeAutenticacao = pathname === '/login' || pathname.includes('/cadastro');

  return (
    <AuthProvider>
      <SearchProvider>
        <CartProvider>
          <div className={styles.app}>
            {telaDeAutenticacao ? (
              <HeaderAuth />
            ) : (
              <>
                <Header />
                <HeaderMobile />
              </>
            )}
            <Routes>
              <Route path="/produtos">
                <Route index element={<Produtos />} />
                <Route path=":id" element={<ProdutoSelecionado />} />
                <Route path="carrinho" element={<MeusPedidos />} />
              </Route>
              <Route path="/" element={<Home />} />
              <Route path="/meuspedidos" element={<MeusPedidosFinalizados />} />
              <Route path="/categorias" element={<Produtos />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro">
                <Route index element={<Cadastro />} />
                <Route path=":email" element={<CriarConta />} />
              </Route>
              <Route path="/finalizarcompra" element={<Compra />} />
              <Route path="/comprafinalizada" element={<CompraRealizada />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Footer />
          </div>
        </CartProvider>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;
