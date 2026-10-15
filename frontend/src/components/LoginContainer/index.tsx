import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import styles from './styles.module.scss'
import faceLogo from '../../assets/images/face-logo.png'
import Botao from '../Botao'
import gmailLogo from '../../assets/images/gmail-logo.png'
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'
import { mensagemDeErro } from '../../services/api'

export default function LoginContainer() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [erro, setErro] = useState('');
    const [enviando, setEnviando] = useState(false);
    const navigate = useNavigate()
    const { entrar } = useAuth()
    const idEmail = useId()
    const idSenha = useId()

    async function handleLogin() {
        if (!email || !password || enviando) return
        setErro('')
        setEnviando(true)
        try {
            await entrar({ email, senha: password })
            navigate("/")
        } catch (falha) {
            setErro(mensagemDeErro(falha))
            setEnviando(false)
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        handleLogin()
    };

    return (<div className={styles.containerLogin}>

        <h1 className={styles.textMain}>Acesse sua conta</h1>
        <h3 className={styles.textSubMain}>Novo cliente? Então registre-se <Link to='/cadastro'> <span className={styles.underscore}>aqui.</span></Link></h3>
        <form onSubmit={handleSubmit}>
            <h3 id={idEmail} className={styles.indicativeText}>Login *</h3>
            <input type="email" aria-labelledby={idEmail} autoComplete="email" value={email} className={styles.inputLogin} required onChange={(e) => { setEmail(e.target.value) }} placeholder='Insira seu login ou email' />
            <h3 id={idSenha} className={styles.indicativeText}>Senha *</h3>
            <input type="password" aria-labelledby={idSenha} autoComplete="current-password" value={password} className={styles.inputLogin} required onChange={(e) => { setPassword(e.target.value) }} placeholder='Insira sua senha' />
            <h3 className={styles.helpPassword}>Esqueci minha senha</h3>
            {erro && <p role="alert" style={{ color: '#EE4266', fontSize: '14px', marginBottom: '10px' }}>{erro}</p>}
            <div >
                <Botao tipo="submit" cor={'white'} corFundo={'#C92071'} largura={"100%"} texto={enviando ? 'Entrando...' : 'Acessar conta'} altura={'48px'} />
            </div>

        </form>
        <div className={styles.containerLoginAlternative}>
            <div className={styles.divAlternative} >
                <h3 className={styles.textLoginAlternative}>Ou faça login com</h3>
            </div>
            <div className={styles.divLogoAlternative} >
                <img src={gmailLogo} className={styles.logoImg} alt="" />
                <img src={faceLogo} className={styles.logoImg} alt="" />
            </div>
        </div>

    </div>)
}
