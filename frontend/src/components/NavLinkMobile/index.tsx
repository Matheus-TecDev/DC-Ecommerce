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
                    <Link to={item.route} className={location.pathname === item.route ? styles.rotaAtivada : undefined}>{item.title}</Link>
                </li>
            ))}

            <div className={styles.containerAutenticacao}>
                <hr />
                {usuario ? <>
                    <span className={styles.linkCadastro}>Olá , {usuario.nome}</span>
                    <div onClick={sair}>
                        <Botao texto={"Sair"} largura={"calc(100% - 60px)"} corFundo={"#C92071"} />
                    </div>
                </> : <>
                    <Link to={'/login'}>
                        <Botao texto={"Entrar"} largura={"calc(100% - 60px)"} corFundo={"#C92071"} />
                    </Link>

                    <Link to={'/cadastro'} className={styles.linkCadastro}>Cadastre-se</Link>
                </>}
            </div>
        </ul>
    )
}
