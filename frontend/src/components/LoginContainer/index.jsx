import React, { useState,useContext } from 'react'
import styles from './styles.module.scss'
import faceLogo from '../../assets/images/face-logo.png'
import Botao from '../Botao'
import gmailLogo from '../../assets/images/gmail-logo.png'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App'
import { Link } from 'react-router-dom'


export default function LoginContainer() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [erro, setErro] = useState('');
    const [enviando, setEnviando] = useState(false);
    let navigate = useNavigate()
    
    const usuario = useContext(AuthContext)
    
    const handleChange = (e) => {
        setEmail(e.target.value);
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        handleLogin()
        
    };
    
    async function handleLogin(){
        if(!email||!password||enviando) return
        setErro('')
        setEnviando(true)
        try{
            await usuario.entrar(email, password)
            navigate("/")
        }catch(falha){
            setErro(falha.message)
            setEnviando(false)
        }
    }

    return (<div className={styles.containerLogin}>

        <h1 className={styles.textMain}>Acesse sua conta</h1>
        <h3 className={styles.textSubMain}>Novo cliente? Então registre-se <Link to='/cadastro'> <span className={styles.underscore}>aqui.</span></Link></h3>
        <form onSubmit={handleSubmit}>
            <h3 className={styles.indicativeText}>Login *</h3>
            <input type="email" value={email} className={styles.inputLogin} required onChange={(e) => { handleChange(e) }} placeholder='Insira seu login ou email' />
            <h3 className={styles.indicativeText}>Senha *</h3>
            <input type="password" value={password} className={styles.inputLogin} required onChange={(e) => { handlePasswordChange(e) }} placeholder='Insira sua senha' />
            <h3 className={styles.helpPassword}>Esqueci minha senha</h3>
            {erro && <p role="alert" style={{ color: '#EE4266', fontSize: '14px', marginBottom: '10px' }}>{erro}</p>}
            <div >
                <Botao cor={'white'} corFundo={'#C92071'} largura={"100%"} texto={enviando ? 'Entrando...' : 'Acessar conta'} altura={'48px'} />
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