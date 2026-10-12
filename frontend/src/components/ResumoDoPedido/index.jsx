import estilo from './styles.module.scss'
import Botao from '../Botao'
import { Link } from 'react-router-dom'
import { useContext } from 'react'
import { CartContext } from '../../App'
import { formatarPreco } from '../../services/api'
export default function ResumoDoPedido() {
    const { carrinho } = useContext(CartContext)
    const total = `R$ ${formatarPreco(carrinho.valorTotal)}`
    const parcelamento = `ou 10x de R$ ${formatarPreco(carrinho.valorTotal / 10)} sem juros`
    return (<div>
        <div className={estilo.containerGeral}>

            <div className={estilo.container}>
                <div className={estilo.containerValores}>
                    <label htmlFor="">RESUMO</label>
                    <hr />
                    <div className={estilo.subtotal}>
                        <label htmlFor="">Subtotal</label>
                        <div>R$ {formatarPreco(carrinho.valorBruto)}</div>
                    </div>
                    <div className={estilo.frete}>
                        <label htmlFor="">Frete</label>
                        <div>R$ 0,00</div>
                    </div>
                    <div className={estilo.desconto}>
                        <label htmlFor="">Desconto</label>
                        <div>R$ {formatarPreco(carrinho.descontoTotal)}</div>
                    </div>
                    <div className={estilo.total}>
                        <label htmlFor="">Total</label>
                        <div>{total}</div>
                    </div>
                    <div className={estilo.parcelamento}> {parcelamento}</div>
                    <Link to={'/finalizarcompra'}>
                        <div className={estilo.botao}>
                            <Botao cor={'#F5F5F5'} corFundo={'#F6AA1C'} largura={'274px'} altura={'40px'} texto={'Continuar'} />
                        </div>
                    </Link>
                </div>
            </div>
            <div className={estilo.containerTotal}>
                <div className={estilo.totalComBotao}>
                    <div className={estilo.total}>
                        <label htmlFor="">Total</label>
                        <div>{total}</div>
                    </div>

                    <div className={estilo.parcelamento}> {parcelamento}</div>


                    <Link to={'/finalizarcompra'}>
                        <div className={estilo.botao}>
                            <Botao cor={'#F5F5F5'} corFundo={'#F6AA1C'} largura={'calc(100%)'} altura={'40px'} texto={'Continuar'} />
                        </div>
                    </Link>


                </div>
            </div>
        </div>
    </div>)
}