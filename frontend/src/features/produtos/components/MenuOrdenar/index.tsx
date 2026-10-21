import estilo from './styles.module.scss'

interface MenuOrdenarProps {
    termo: string;
    total: number;
}

export default function MenuOrdenar({ termo, total }: MenuOrdenarProps) {
    return (
        <div className={estilo.container}>
            <div className={estilo.conteudo}>
                <div className={estilo.tituloResultado}>
                    Resultados para <span>"{termo || 'Todos'}"</span> - <span className={estilo.resultado}>"{total}" Produtos</span>
                </div>
                <div className={estilo.containerOrdenar}>
                    <label className={estilo.tituloOrdenar} htmlFor="ordenar-produtos">Ordenar por:  </label> 
                    <select className={estilo.listChoiceObjects} name="ordenar" id="ordenar-produtos">
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
