import styles from './styles.module.scss'
import { Link } from 'react-router-dom'
import { route } from '../../routes/routes.js'
import { useLocation } from 'react-router-dom';
import Botao from '../Botao';
import { useContext } from 'react';
import { AuthContext } from '../../App';
export default function NavLink() {

    let location = useLocation()
    const usuario = useContext(AuthContext)

    return (

        <ul className={styles.navLinkContainer}>
            <h2 className={styles.tituloLinks}>Páginas</h2>
            {route.map((item, index) => (
                <li key={index} className={styles.navLink}>
                    <Link to={item.route} className={location.pathname === item.route && styles.rotaAtivada}>{item.title}</Link>
                </li>
            ))}

            <div className={styles.containerAutenticacao}>
                <hr />
                {usuario.currentUser.nome !== '' ? <>
                    <span className={styles.linkCadastro}>Olá , {usuario.currentUser.nome}</span>
                    <div onClick={usuario.sair}>
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