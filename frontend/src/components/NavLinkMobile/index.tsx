import styles from './styles.module.scss'
import { Link, useLocation } from 'react-router-dom'
import { route } from '../../routes/routes'
import Botao from '../Botao';
import { useAuth } from '../../contexts/AuthContext';

export default function NavLinkMobile() {
    const location = useLocation()
    const { usuario, sair } = useAuth()

    return (
        <ul className={styles.navLinkContainer}>
            <h2 className={styles.tituloLinks}>Páginas</h2>
            {route.map((item) => (
                <li key={item.route} className={styles.navLink}>
                    <Link to={item.route} className={location.pathname === item.route ? styles.rotaAtivada : undefined} aria-current={location.pathname === item.route ? 'page' : undefined}>{item.title}</Link>
                </li>
            ))}

            <div className={styles.containerAutenticacao}>
                <hr />
                {usuario ? <>
                    <span className={styles.linkCadastro}>Olá , {usuario.nome}</span>
                    <div>
                        <Botao texto={"Sair"} largura={"calc(100% - 60px)"} corFundo={"#C92071"} onClick={sair} />
                    </div>
                </> : <>
                    <div>
                        <Botao para="/login" texto={"Entrar"} largura={"calc(100% - 60px)"} corFundo={"#C92071"} />
                    </div>

                    <Link to={'/cadastro'} className={styles.linkCadastro}>Cadastre-se</Link>
                </>}
            </div>
        </ul>
    )
}
