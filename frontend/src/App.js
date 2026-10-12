
import styles from './App.module.scss';
import Header from './components/Header';
import Home from './pages/Home';
import Produtos from './pages/Produtos';
import MeusPedidos from './pages/MeusPedidos';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro'
import Footer from './components/Footer';
import Compra from './pages/Compra'
import ProdutoSelecionado from './components/ProdutoSelecionado';
import HeaderMobile from './components/HeaderMobile';
import CriarConta from './components/CriarConta';
import HeaderAuth from './components/HeaderAuth';
import { useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback, createContext } from 'react';
import MeusPedidosFinalizados from './components/MeusPedidosFinalizados';
import CompraRealizada from './components/CompraRealizada'
import { api, sessao } from './services/api';
export const AuthContext = createContext(null);
export const SearchContext = createContext(null)
export const CartContext = createContext(null)

const USUARIO_DESLOGADO = { nome: '', email: '' };
const CARRINHO_VAZIO = { itens: [], quantidadeItens: 0, valorBruto: 0, descontoTotal: 0, valorTotal: 0 };

function App() {

  let local = useLocation()
  const [location, setLocation] = useState(local)

  const [currentUser, setCurrentUser] = useState(USUARIO_DESLOGADO);
  const [carrinho, setCarrinho] = useState(CARRINHO_VAZIO);
  const [search, setSearch] = useState('')
  useEffect(() => {

    setLocation(local)
  }, [local])

  const sair = useCallback(() => {
    sessao.limpar()
    setCurrentUser(USUARIO_DESLOGADO)
    setCarrinho(CARRINHO_VAZIO)
  }, [])

  const iniciarSessao = useCallback(async () => {
    const user = await api.usuarioAtual()
    setCurrentUser({ id: user.id, nome: user.user, email: user.email })
    setCarrinho(await api.carrinho())
  }, [])

  const entrar = useCallback(async (email, senha) => {
    const { token } = await api.login(email, senha)
    sessao.salvar(token)
    await iniciarSessao()
  }, [iniciarSessao])

  useEffect(() => {
    if (sessao.token()) {
      iniciarSessao().catch((erro) => { if (erro.status === 401) sair() })
    }
  }, [iniciarSessao, sair])

  const alterarCarrinho = useCallback(async (chamada) => {
    try {
      setCarrinho(await chamada())
    } catch (erro) {
      if (erro.status === 401) sair()
      throw erro
    }
  }, [sair])

  const acoesCarrinho = {
    carrinho,
    adicionar: (produtoId) => alterarCarrinho(() => api.adicionarAoCarrinho(produtoId)),
    alterarQuantidade: (produtoId, quantidade) => alterarCarrinho(() => api.alterarQuantidade(produtoId, quantidade)),
    remover: (produtoId) => alterarCarrinho(() => api.removerDoCarrinho(produtoId)),
    esvaziar: () => alterarCarrinho(() => api.esvaziarCarrinho()),
  }
  return (
    <AuthContext.Provider value={{currentUser,setCurrentUser,entrar,sair}}>
      <SearchContext.Provider value={{search,setSearch}}>
      <CartContext.Provider value={acoesCarrinho}>
      <div className={styles.app}>

        {location.pathname === '/login' || location.pathname.includes('/cadastro') ? <HeaderAuth />
          : <>
            <Header />
            <HeaderMobile />
          </>
        }



        <Routes>
          <Route path="/produtos" >
            <Route index element={<Produtos />} />
            <Route path=":id" element={<ProdutoSelecionado />} />
            <Route path="carrinho" element={<MeusPedidos />} />

          </Route>
          <Route path="/" element={<Home />} />
          <Route path="/meuspedidos" element={<MeusPedidosFinalizados />} />
          <Route path="/categorias" element={<Produtos />} />
          <Route path='/login' element={<Login />} />
          <Route path='/cadastro' >
            <Route index element={<Cadastro />} />
            <Route path=':email' element={<CriarConta />} />
          </Route>
          <Route path='/finalizarcompra' element={<Compra />} />
          <Route path='/comprafinalizada' element={<CompraRealizada />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />

      </div>
      </CartContext.Provider>
      </SearchContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
