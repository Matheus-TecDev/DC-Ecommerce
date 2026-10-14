import styles from './styles.module.scss';
import InformacoesPessoais from '../InformacoesPessoais';
import InformacoesEntrega from '../InformacoesEntrega';
import Botao from '../Botao';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api, mensagemDeErro } from '../../services/api';
import type { DadosEntrega, DadosPessoais } from '../../types/formularios';

function algumCampoVazio(valores: DadosPessoais | DadosEntrega): boolean {
    return Object.values(valores).some((valor) => valor === '')
}

export default function CriarConta() {
    const { email: emailInicial = '' } = useParams()
    const [contaInfo, setContaInfo] = useState<DadosPessoais>({ nome: "", cpf: "", email: emailInicial, celular: "", senha: "" })
    const [contaEntrega, setContaEntrega] = useState<DadosEntrega>({ endereco: "", bairro: "", cidade: "", cep: "", complemento: "" })
    const [concorda, setConcorda] = useState(false);
    const [erro, setErro] = useState('');
    const [enviando, setEnviando] = useState(false);

    const navigate = useNavigate()
    const { entrar } = useAuth()

    async function handleCadastro() {
        if (algumCampoVazio(contaInfo) || algumCampoVazio(contaEntrega)) {
            alert('Todos os campos devem ser preenchidos')
            return
        }
        if (!concorda) {
            alert("Para continuar, aceite os nossos termos")
            return
        }
        if (enviando) return
        setErro('')
        setEnviando(true)
        try {
            await api.cadastrar({ nome: contaInfo.nome, email: contaInfo.email, senha: contaInfo.senha })
            await entrar({ email: contaInfo.email, senha: contaInfo.senha })
            navigate('/')
        } catch (falha) {
            setErro(mensagemDeErro(falha))
            setEnviando(false)
        }
    }

    return (
        <div className={styles.cadastroContainer}>
            <h1 className={styles.tituloContainer}>Criar Conta</h1>
            <InformacoesPessoais
                valores={contaInfo}
                aoAlterar={(campo, valor) => setContaInfo((atual) => ({ ...atual, [campo]: valor }))}
            />
            <InformacoesEntrega
                valores={contaEntrega}
                aoAlterar={(campo, valor) => setContaEntrega((atual) => ({ ...atual, [campo]: valor }))}
            />
            <div className={styles.checkContainer}>
                <label>
                    <input type="checkbox" className={styles.check} checked={concorda} onChange={(e) => { setConcorda(e.target.checked) }} />
                    <span>Quero receber por email ofertas e novidades das lojas da Digital Store. A frequência de envios pode variar de acordo com a intenção do cliente.</span>
                </label>
            </div>
            {erro && <p role="alert" style={{ color: '#EE4266', fontSize: '14px', marginBottom: '10px' }}>{erro}</p>}
            <div className={styles.Botao} onClick={() => { handleCadastro() }}>
                <Botao texto={enviando ? "Criando conta..." : "Criar Conta"} largura={"100%"} corFundo={"#C92071"} altura={"48px"} />
            </div>
        </div>
    )
}
