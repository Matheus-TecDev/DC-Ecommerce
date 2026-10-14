import estilo from './styles.module.scss'
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
            <div className={estilo.nomeCartao}>
                <div className={estilo.tituloNomeCartao}>
                    Nome do Cartão *
                </div>
                <input type="text" aria-label="Nome do Cartão" placeholder='Insira o nome do Cartão' />
            </div>
            <div className={estilo.numeroCartao}>
                <div className={estilo.cartao}>
                    <div className={estilo.tituloCartao}>
                        Data o Número do Cartão *
                    </div>
                    <input type="text" aria-label="Número do Cartão" placeholder='Insira número do Cartão' />
                </div>
                <div className={estilo.validade}>
                    <div className={estilo.tituloValidade}>
                        Data de validade do Cartão *
                    </div>
                    <input type="text" aria-label="Data de validade do Cartão" placeholder='Insira a valiade do Cartão' />
                </div>
            </div>
            <div className={estilo.cvv}>
                <div className={estilo.tituloCvv}>
                    CVV *
                </div>
                <input type="text" aria-label="CVV" placeholder='CVV *' />
            </div>
        </div>)

}