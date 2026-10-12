import styles from './styles.module.scss';
import InformacoesPessoais from '../InformacoesPessoais';
import InformacoesEntrega from '../InformacoesEntrega';
import Botao from '../Botao';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import {AuthContext} from '../../App'
import { api } from '../../services/api'
export default function CriarConta() {

    const[contaInfo, setContaInfo]=useState({nome:"",cpf:"",email:"",celular:"",senha:""})
    const[contaEntrega,setContaEntrega]=useState({endereco:"",bairro:"",cidade:"",cep:"",complemento:""})
    const[concorda,setConcorda]=useState(false);
    const[erro,setErro]=useState('');
    const[enviando,setEnviando]=useState(false);

    let navigate= useNavigate()

    const usuario = useContext(AuthContext)


    async function handleCadastro(){
       for(let propriedade in contaInfo){
        if(contaInfo[propriedade]===''){
            return alert('Todos os campos devem ser preenchidos')
        }
       }
       for(let propriedade in contaEntrega){
        if(contaEntrega[propriedade]===''){
            return alert('Todos os campos devem ser preenchidos')
        }
       }
        if(concorda){
            if(enviando) return
            setErro('')
            setEnviando(true)
            try{
                await api.cadastrar({nome:contaInfo.nome, email:contaInfo.email, senha:contaInfo.senha})
                await usuario.entrar(contaInfo.email, contaInfo.senha)
                navigate('/')
            }catch(falha){
                setErro(falha.message)
                setEnviando(false)
            }
        }else{
            alert("Para continuar, aceite os nossos termos")
        }
      
        
    }

    return (
        <div className={styles.cadastroContainer}>
            <h1 className={styles.tituloContainer}>Criar Conta</h1>
            <InformacoesPessoais contaInfo={contaInfo} setContaInfo={setContaInfo}/>
            <InformacoesEntrega contaEntrega={contaEntrega} setContaEntrega={setContaEntrega} />
            <div className={styles.checkContainer}>
                <label>
                    <input type="checkbox" className={styles.check} onChange={()=>{setConcorda(!concorda)}}/>
                    <span>Quero receber por email ofertas e novidades das lojas da Digital Store. A frequência de envios pode variar de acordo com a intenção do cliente.</span>
                </label>
            </div>
            {erro && <p role="alert" style={{ color: '#EE4266', fontSize: '14px', marginBottom: '10px' }}>{erro}</p>}
            <div className={styles.Botao} onClick={()=>{handleCadastro()}}>
                <Botao texto={enviando ? "Criando conta..." : "Criar Conta"} largura={"100%"} corFundo={"#C92071"} altura={"48px"} />
            </div>
            

        </div>
    )
}