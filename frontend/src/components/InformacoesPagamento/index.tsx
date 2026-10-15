import estilo from './styles.module.scss'
import AvisoDemonstrativo from '../AvisoDemonstrativo'

export default function InformacoesPagamento() {
    return (
        <div className={estilo.container}>
            <div className={estilo.titulo}>
                Informações de Pagamento
            </div>
            <hr />
            <div className={estilo.formaDePagamento}>
                <div className={estilo.tituloFormaDePagamento}>
                    Forma de Pagamento
                </div>
                <div className={estilo.inputsFormaDePagamento}>
                    <div className={estilo.inputCartao}>
                        <input type="radio" name="forma-de-pagamento" id="CartaoDeCrédito" /> <label htmlFor="CartaoDeCrédito">Cartão de Crédito</label>
                    </div>
                    <div className={estilo.inputBoleto}>
                        <input type="radio" name="forma-de-pagamento" id="BoletoBancario" /> <label htmlFor="BoletoBancario">Boleto Bancário</label>
                    </div>
                </div>
            </div>
            <AvisoDemonstrativo
                titulo="Pagamento demonstrativo."
                texto="Esta loja não processa pagamentos e, por isso, não solicita dados de cartão. A forma de pagamento escolhida não é enviada nem armazenada."
            />
        </div>)
}
