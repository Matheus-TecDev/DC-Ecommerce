import estilo from './styles.module.scss'
import Botao from '../../components/Botao'
import { useCarrinho } from '../../contexts/CartContext'
import { urlImagem } from '../../services/api'
import { formatarPreco } from '../../utils/precos'
export default function FinalizarCompraResumo() {
    const { carrinho } = useCarrinho()

    return (
        <div className={estilo.container}>
            <div className={estilo.titulo}>
                RESUMO
            </div>
            <hr />
            {carrinho.itens.length === 0 && <p>Seu carrinho está vazio.</p>}
            {carrinho.itens.map((item) => (
            <div className={estilo.produtos} key={item.produto_id}>
                <div className={estilo.imgProduto}>
                    <img src={urlImagem(item.img)} alt="" />
                </div>
                <div className={estilo.nomeProduto}>
                    {item.quantidade} x {item.titulo}
                </div>
            </div>
            ))}
            <hr />
            <div className={estilo.subtotal}>
                <label>Subtotal:</label>
                <div>
                    R$ {formatarPreco(carrinho.valorBruto)}
                </div>
            </div>
            <div className={estilo.frete}>
                <label>Frete:</label>
                <div>
                    R$ 0,00
                </div>
            </div>
            <div className={estilo.desconto}>
                <label>Desconto:</label>
                <div>
                    R$ {formatarPreco(carrinho.descontoTotal)}
                </div>
            </div>
            <div className={estilo.total}>
                <div className={estilo.divValor}>
                    <div className={estilo.tituloTotal}>
                        Total
                    </div>
                    <div className={estilo.valor}>
                        R$ {formatarPreco(carrinho.valorTotal)}
                    </div>
                </div>
                <div className={estilo.parcelamento}>
                    ou 10x de R$ {formatarPreco(carrinho.valorTotal / 10)} sem juros
                </div>
            </div>
            <div>
                <div className={estilo.botao}>
                    <Botao para="/comprafinalizada" cor={'white'} corFundo={'#F6AA1C'} largura={'100%'} altura={'50px'} texto={'Realizar Pagamento'} />
                </div>
            </div>
        </div>)

}