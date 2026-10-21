import {
    AvisoDemonstrativo,
    FinalizaCompra,
    FinalizarCompraResumo,
    InformacoesPagamento,
} from "../../features/checkout";
import styles from "./styles.module.scss";

export default function Compra() {
    return (
        <div className={styles.containerCompra}>
            <h2>Finalizar compra</h2>
            <div className={styles.aviso}>
                <AvisoDemonstrativo
                    titulo="Checkout demonstrativo."
                    texto="Este é um projeto educacional: nenhum pagamento é processado, nenhum pedido é criado e nenhum dado pessoal é solicitado."
                />
            </div>
            <div className={styles.containerSecundario}>
            
                <div >
                    <InformacoesPagamento />
                    <FinalizaCompra />
                </div>
                <FinalizarCompraResumo/>
           
            </div>


        </div>
    )
}
