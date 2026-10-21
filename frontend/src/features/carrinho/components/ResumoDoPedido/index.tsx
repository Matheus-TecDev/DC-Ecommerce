import estilo from './styles.module.scss'
import Botao from '../../../../components/ui/Botao'
import { useCarrinho } from '../../CartContext'
import { formatarPreco } from '../../../../utils/precos'
export default function ResumoDoPedido() {
    const { carrinho } = useCarrinho()
    const total = `R$ ${formatarPreco(carrinho.valorTotal)}`
    const parcelamento = `ou 10x de R$ ${formatarPreco(carrinho.valorTotal / 10)} sem juros`
    return (<div>
        <div className={estilo.containerGeral}>

            <div className={estilo.container}>
                <div className={estilo.containerValores}>
                    <label>RESUMO</label>
                    <hr />
                    <div className={estilo.subtotal}>
                        <label>Subtotal</label>
                        <div>R$ {formatarPreco(carrinho.valorBruto)}</div>
                    </div>
                    <div className={estilo.frete}>
                        <label>Frete</label>
                        <div>R$ 0,00</div>
                    </div>
                    <div className={estilo.desconto}>
                        <label>Desconto</label>
                        <div>R$ {formatarPreco(carrinho.descontoTotal)}</div>
                    </div>
                    <div className={estilo.total}>
                        <label>Total</label>
                        <div>{total}</div>
                    </div>
                    <div className={estilo.parcelamento}> {parcelamento}</div>
                    <div className={estilo.botao}>
                        <Botao para="/finalizarcompra" cor={'#F5F5F5'} corFundo={'#F6AA1C'} largura={'274px'} altura={'40px'} texto={'Continuar'} />
                    </div>
                </div>
            </div>
            <div className={estilo.containerTotal}>
                <div className={estilo.totalComBotao}>
                    <div className={estilo.total}>
                        <label>Total</label>
                        <div>{total}</div>
                    </div>

                    <div className={estilo.parcelamento}> {parcelamento}</div>


                    <div className={estilo.botao}>
                        <Botao para="/finalizarcompra" cor={'#F5F5F5'} corFundo={'#F6AA1C'} largura={'calc(100%)'} altura={'40px'} texto={'Continuar'} />
                    </div>


                </div>
            </div>
        </div>
    </div>)
}
