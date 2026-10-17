import estilo from './styles.module.scss'
import Botao from '../../components/Botao'
import AvisoDemonstrativo from '../AvisoDemonstrativo'
import img from './assets/confete.png'
import imgTenis from './assets/White-Sneakers-PNG-Clipart 2.svg'

export default function FinalizarCompra() {
    return (
        <div className={estilo.container}>
            <div className={estilo.containerCompra}>

                <div className={estilo.titulo}>
                    <div className={estilo.emoji}>
                        <img src={img} alt="" />
                    </div>
                    <div className={estilo.texto}>
                        Demonstração de compra concluída!
                    </div>
                </div>
                <div className={estilo.aviso}>
                    <AvisoDemonstrativo
                        titulo="Nenhum pagamento foi processado."
                        texto="Nenhum pedido foi criado e nada foi cobrado. Os dados exibidos abaixo são fictícios e servem apenas para ilustrar o layout."
                    />
                </div>
                <hr />
                <div className={estilo.informacoesDePagamento}>
                    <div className={estilo.tituloPagamento}>
                        Informações de Pagamento
                    </div>
                    <div className={estilo.tituarCrt}>
                        <label>Forma de pagamento:</label>
                        <p>
                            Demonstrativa, sem cobrança
                        </p>
                    </div>
                </div>
                <hr />
                <div className={estilo.resumoDaCompra}>
                    <div className={estilo.tituloResumo}>
                        Resumo da compra
                    </div>
                    <div className={estilo.produtos}>
                        <div className={estilo.imgProduto}>
                            <img src={imgTenis} alt="" />
                        </div>
                        <div className={estilo.nomeProduto}>
                            Tênis Nike Revolution 6 Next Nature Masculino
                        </div>
                    </div>
                    <div className={estilo.total}>
                        <div className={estilo.divValor}>
                            <div className={estilo.tituloTotal}>
                                Total
                            </div>
                            <div className={estilo.valor}>
                                R$ 219,00
                            </div>
                        </div>
                        <div className={estilo.parcelamento}>
                            ou 10x de R$ 21,00 sem juros
                        </div>
                    </div>
                </div>
            </div>
            <div className={estilo.botao}>
                <Botao para="/" cor={'#F5F5F5'} corFundo={'#F6AA1C'} largura={'100%'} altura={'50px'} texto={'Voltar para Home'} />
            </div>
        </div>

    )
}

