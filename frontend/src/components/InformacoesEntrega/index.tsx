import styles from './styles.module.scss'
import type { CampoFormulario, DadosEntrega } from '../../types/formularios'

const CAMPOS: readonly CampoFormulario<DadosEntrega>[] = [
    { chave: 'endereco', titulo: "Endereço *", placeholder: "Insira seu endereço" },
    { chave: 'bairro', titulo: "Bairro *", placeholder: "Insira seu bairro" },
    { chave: 'cidade', titulo: "Cidade *", placeholder: "Insira seu cidade" },
    { chave: 'cep', titulo: "CEP *", placeholder: "Insira seu cep" },
    { chave: 'complemento', titulo: "Complemento *", placeholder: "Insira seu complemento" },
]

interface InformacoesEntregaProps {
    valores: DadosEntrega;
    aoAlterar: (campo: keyof DadosEntrega, valor: string) => void;
}

export default function InformacoesEntrega({ valores, aoAlterar }: InformacoesEntregaProps) {
    return (
        <div className={styles.infoEntregaContainer}>
            <h1>Informações de Entrega</h1>
            <hr />
            {CAMPOS.map((campo) => (
                <div key={campo.chave} className={styles.infoEntregaInput}>
                    <h2>{campo.titulo}</h2>
                    <input
                        placeholder={campo.placeholder}
                        value={valores[campo.chave]}
                        onChange={(e) => { aoAlterar(campo.chave, e.target.value) }}
                    />
                </div>
            ))}
        </div>)
}
