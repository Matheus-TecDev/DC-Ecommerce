import { useId } from 'react'
import estilo from './styles.module.scss'

interface GrupoFiltro {
    titulo: string;
    opcoes: readonly string[];
}

const GRUPOS: readonly GrupoFiltro[] = [
    { titulo: 'Marka', opcoes: ['Adiddas', 'Calenciaga', 'K-Swiss', 'Nike', 'Pulma'] },
    { titulo: 'Categoria', opcoes: ['Esporte e lazer', 'Casual', 'Utilitário', 'Corrida'] },
    { titulo: 'Genero', opcoes: ['Masculino', 'Feminino', 'Unisex'] },
    { titulo: 'Estado', opcoes: ['Novo', 'Usado'] },
]

export default function MenuFiltrar() {
    const id = useId()

    return (
        <div className={estilo.container}>
            <div className={estilo.colunaCheckbox}>
                <h5 className={estilo.titulo}>Filtrar Por</h5>
                <hr></hr>
                {GRUPOS.map((grupo) => (
                    <div key={grupo.titulo} role="group" aria-label={grupo.titulo} className={estilo.grupo}>
                        <h5 className={estilo.subtitulos}>{grupo.titulo}</h5>
                        {grupo.opcoes.map((opcao) => (
                            <div key={opcao}>
                                <input type="checkbox" id={`${id}-${grupo.titulo}-${opcao}`} />
                                <label htmlFor={`${id}-${grupo.titulo}-${opcao}`}>{opcao}</label>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}
