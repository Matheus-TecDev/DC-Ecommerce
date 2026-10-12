import estilo from './styles.module.scss'

export default function Produtos({ termo, total }) {

    return (
        <div className={estilo.container}>
            <div className={estilo.conteudo}>
                <div className={estilo.tituloResultado}>
                    Resultados para <span>"{termo || 'Todos'}"</span> - <span className={estilo.resultado}>"{total ?? 0}" Produtos</span>
                </div>
                <div className={estilo.containerOrdenar}>
                    <label className={estilo.tituloOrdenar}>Ordenar por:  </label> 
                    <select className={estilo.listChoiceObjects} name="Ordenar porL:" id="">
                        <option value="">Mais relevantes</option>
                        <option value="">Mais relevantes</option>
                        <option value="">Mais relevantes</option>
                        <option value="">Mais relevantes</option>
                    </select>
                </div>
            </div>
        </div>
    )
}