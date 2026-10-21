import styles from './styles.module.scss';
import InformacoesPessoais from '../InformacoesPessoais';
import InformacoesEntrega from '../InformacoesEntrega';
import Botao from '../../../../components/ui/Botao';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { api, mensagemDeErro } from '../../../../services/api';
import type { DadosEntrega, DadosPessoais } from '../../../../types/formularios';

function algumCampoVazio(valores: DadosPessoais | DadosEntrega): boolean {
    return Object.values(valores).some((valor) => valor === '')
}

export default function CriarConta() {
    const { email: emailInicial = '' } = useParams()
    const [contaInfo, setContaInfo] = useState<DadosPessoais>({ nome: "", cpf: "", email: emailInicial, celular: "", senha: "" })
    const [contaEntrega, setContaEntrega] = useState<DadosEntrega>({ endereco: "", bairro: "", cidade: "", cep: "", complemento: "" })
    const [erro, setErro] = useState('');
    const [enviando, setEnviando] = useState(false);

    const navigate = useNavigate()
    const { entrar } = useAuth()

    async function handleCadastro() {
        if (algumCampoVazio(contaInfo) || algumCampoVazio(contaEntrega)) {
            setErro('Todos os campos devem ser preenchidos')
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
            {erro && <p role="alert" style={{ color: '#EE4266', fontSize: '14px', marginTop: '30px', marginBottom: '0' }}>{erro}</p>}
            <div className={styles.Botao}>
                <Botao texto={enviando ? "Criando conta..." : "Criar Conta"} largura={"100%"} corFundo={"#C92071"} altura={"48px"} onClick={() => { handleCadastro() }} />
            </div>
        </div>
    )
}
