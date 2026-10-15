import FinalizarCompra from "../../components/FinalizaCompra";
import InformacoesPagamento from "../../components/InformacoesPagamento";
import FinalizarCompraInformacoesEntrega from "../../components/FinalizarCompraInformacoesEntrega";
import FinalizarCompraInformacoesPessoais from "../../components/FinalizarCompraInformacoesPessoais";
import FinalizarCompraResumo from "../../components/FinalizarCompraResumo";
import AvisoDemonstrativo from "../../components/AvisoDemonstrativo";
import styles from "./styles.module.scss";

export default function Compra() {
    return (
        <div className={styles.containerCompra}>
            <h2>Finalizar compra</h2>
            <div className={styles.aviso}>
                <AvisoDemonstrativo
                    titulo="Checkout demonstrativo."
                    texto="Este é um projeto educacional: nenhum pagamento é processado, nenhum pedido é criado e os dados preenchidos nesta página não são enviados nem armazenados."
                />
            </div>
            <div className={styles.containerSecundario}>
            
                <div >
                    <FinalizarCompraInformacoesPessoais />
                    <FinalizarCompraInformacoesEntrega />
                    <InformacoesPagamento />
                    <FinalizarCompra />
                </div>
                <FinalizarCompraResumo/>
           
            </div>


        </div>
    )
}