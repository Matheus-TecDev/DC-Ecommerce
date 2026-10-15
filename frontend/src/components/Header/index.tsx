import logo from '../../assets/images/logo.png'
import styles from './styles.module.scss'
import { CiSearch } from 'react-icons/ci'
import { AiOutlineUser } from 'react-icons/ai'
import { IconContext } from "react-icons";
import NavLink from "../NavLink";
import Botao from "../Botao";
import Carrinho from "../Carrinho"
import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSearch } from '../../contexts/SearchContext';

const ESTILO_LOGADO: CSSProperties = { flexDirection: "row-reverse", minWidth: "198.25px", gap: "16px", justifyContent: "space-between" }
const ESTILO_DESLOGADO: CSSProperties = { flexDirection: "row" }

export default function Header() {
    const { usuario, sair } = useAuth();
    const { search, setSearch } = useSearch()

    return (
        <div className={styles.centralizar}>
            <div className={styles.containerHeader}>
                <IconContext.Provider value={{ color: "rgb (102,102,102)", className: styles.icon }}>
                    <div className={styles.topoHeader}>
                        <div className={styles.imgContainer}>
                            <img src={logo} alt="" className={styles.imagemLogo} />
                            <div className={styles.tituloLogo}>
                                Digital Store
                            </div>
                        </div>

                        <div className={styles.inputContainer}>
                            <input type="text" className={styles.inputBuscaHome} placeholder="Pesquisar produto..." aria-label="Pesquisar produto" value={search} onChange={(e) => { setSearch(e.target.value) }} />
                            <div>
                                <CiSearch aria-hidden="true" />
                            </div>
                        </div>
                        <div className={styles.botoesContainer} style={usuario ? ESTILO_LOGADO : ESTILO_DESLOGADO}>
                            {usuario ? <div className={styles.usuarioLogado} >
                                <AiOutlineUser className={styles.usuarioIcon} aria-hidden="true" />
                                <h3 style={{ whiteSpace: "nowrap" }}>Olá , {usuario.nome}</h3>
                                <button type="button" className={styles.sair} onClick={sair}>Sair</button>
                            </div> :
                                <>
                                    <div className={styles.divCadastro}>
                                        <Link to={"/cadastro"}>
                                            Cadastre-se
                                        </Link>
                                    </div>
                                    <div className={styles.divBotaoEntrar}>
                                        <Botao para="/login" corFundo="#C92071" texto="Entrar" largura="7.87vw" />
                                    </div>
                                </>
                            }
                            <div className={styles.Carrinho} >
                                <Carrinho />
                            </div>
                        </div>
                    </div>
                    <div className={styles.divNavLink}>
                        <NavLink />
                    </div>
                </IconContext.Provider>
            </div>
        </div>)
}
