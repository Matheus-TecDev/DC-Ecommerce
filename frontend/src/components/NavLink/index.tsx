import styles from './styles.module.scss'
import { Link, useLocation } from 'react-router-dom'
import { route } from '../../routes/routes'

export default function NavLink() {
    const location = useLocation()

    return (
        <ul className={styles.navLinkContainer}>
            {route.map((item) => (
                <li key={item.route} className={styles.navLink}>
                    <Link to={item.route} className={location.pathname === item.route ? styles.rotaAtivada : undefined} aria-current={location.pathname === item.route ? 'page' : undefined}>{item.title}</Link>
                </li>
            ))}
        </ul>
    )
}
