import styles from './styles.module.scss'
import faceLogo from '../../assets/images/face-logo.png'
import gmailLogo from '../../assets/images/gmail-logo.png'
import Botao from '../Botao'
import { Link } from 'react-router-dom'
import { useId, useState } from 'react'

export default function CadastroContainer() {
    const [email, setEmail] = useState('')
    const idEmail = useId()

    return (<div className={styles.containerCadastro}>
        <div className={styles.subcontainerPrincipal}>

            <h3 className={styles.criarConta}>Crie sua conta</h3>

            <p className={styles.conviteAoCadastramento1}>Já possui uma conta? Entre  <Link to='/login'><u>aqui</u></Link>.</p>
            <p id={idEmail} className={styles.emailComAsterisco}>Email *</p>

            <input type="text" className={styles.campoDeDigitacaoDoEmail}
                aria-labelledby={idEmail} autoComplete="email"
                placeholder='Insira seu email' value={email} onChange={(e) => { setEmail(e.target.value) }} />

            <Botao para={'/cadastro/' + encodeURIComponent(email)} cor={'white'} corFundo={'#C92071'} largura={'100%'} altura={'48px'} texto={'Criar Conta'} />
        </div>
        <div className={styles.subcontainerSecundario}>
            <span>Ou faça login com</span>
            <img src={gmailLogo} className={styles.iconeGmail} alt="" />
            <img src={faceLogo} className={styles.iconeFacebook} alt="" />
        </div>
    </div>)
}
