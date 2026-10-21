import { useId } from "react"
import styles from "./styles.module.scss"
import type { CampoFormulario, DadosPessoais } from "../../../../types/formularios"

const CAMPOS: readonly CampoFormulario<DadosPessoais>[] = [
    { chave: 'nome', titulo: "Nome Completo *", placeholder: "Insira seu nome" },
    { chave: 'cpf', titulo: "CPF *", placeholder: "Insira seu cpf" },
    { chave: 'email', titulo: "E-mail *", placeholder: "Insira seu email" },
    { chave: 'celular', titulo: "Celular *", placeholder: "Insira seu celular" },
    { chave: 'senha', titulo: "Senha *", placeholder: "Crie uma senha (mínimo de 8 caracteres)", tipo: 'password' },
]

interface InformacoesPessoaisProps {
    valores: DadosPessoais;
    aoAlterar: (campo: keyof DadosPessoais, valor: string) => void;
}

export default function InformacoesPessoais({ valores, aoAlterar }: InformacoesPessoaisProps) {
    const id = useId()
    return (
        <div className={styles.infoPessoaisContainer}>
            <h1>Informações Pessoais</h1>
            <hr />
            {CAMPOS.map((campo) => (
                <div key={campo.chave} className={styles.infoPessoalInput}>
                    <h2 id={`${id}-${campo.chave}`}>{campo.titulo}</h2>
                    <input
                        aria-labelledby={`${id}-${campo.chave}`}
                        placeholder={campo.placeholder}
                        type={campo.tipo ?? 'text'}
                        value={valores[campo.chave]}
                        onChange={(e) => { aoAlterar(campo.chave, e.target.value) }}
                    />
                </div>
            ))}
        </div>)
}
