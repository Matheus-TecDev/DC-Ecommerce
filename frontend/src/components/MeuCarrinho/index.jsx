import estilo from './styles.module.scss'
import Botao from '../../components/Botao'
import { useContext, useState } from 'react'
import { CartContext } from '../../App'
import { urlImagem, formatarPreco } from '../../services/api'

const estiloImagem = { objectFit: "contain" }

export default function MeusPedidos() {
    const { carrinho, alterarQuantidade, remover } = useContext(CartContext)
    const [erro, setErro] = useState('')

    function executar(acao) {
        setErro('')
        acao.catch((falha) => setErro(falha.message))
    }

    function quantidade(item) {
        return (
            <div className={estilo.quantidade}>
                <div className={estilo.botoes}>
                    <button disabled={item.quantidade <= 1} onClick={() => executar(alterarQuantidade(item.produto_id, item.quantidade - 1))}> - </button>
                    <p>{item.quantidade}</p>
                    <button onClick={() => executar(alterarQuantidade(item.produto_id, item.quantidade + 1))}> + </button>
                </div>
                <p className={estilo.removerItem} onClick={() => executar(remover(item.produto_id))}>Remover item</p>
            </div>
        )
    }

    function precos(item, valor, valorComDesconto) {
        return (<>
            {item.desconto > 0 &&
            <div className={estilo.normalPrice}>
                R$ {formatarPreco(valor)}
            </div>}
            <div className={estilo.discountPrice}>
                R$ {formatarPreco(valorComDesconto)}
            </div>
        </>)
    }

    function identificacao(item) {
        return (
            <div className={estilo.idProduto}>
                <div className={estilo.imagemProduto}>
                    <img src={urlImagem(item.img)} alt="" style={estiloImagem} />
                </div>
                <div className={estilo.especificacoesProduto}>
                    <div className={estilo.nomeProduto}>
                        {item.titulo}
                    </div>
                    <div className={estilo.corProduto}>
                        <label>Categoria:</label> {item.categoria}
                    </div>
                    <div className={estilo.especProduto}>
                        <label>Desconto:</label> {item.desconto}%
                    </div>
                </div>
            </div>
        )
    }

    const vazio = carrinho.itens.length === 0 && <p>Seu carrinho está vazio.</p>
    const mensagemErro = erro && <p role="alert">{erro}</p>

    return (<div>
        <div className={estilo.container}>
            <div className={estilo.carrinho}>
                <div className={estilo.nomes}>
                    <div className={estilo.titulo}>
                        MEU CARRINHO
                    </div>
                    <div className={estilo.subtitulos}>
                        <div className={estilo.subQuantidade}>
                            QUANTIDADE
                        </div>
                        <div className={estilo.subUnitário}>
                            UNITÁRIO
                        </div>
                        <div className={estilo.subTotal}>
                            TOTAL
                        </div>

                    </div>
                </div>
                <hr />
                {vazio}
                {mensagemErro}
                {carrinho.itens.map((item) => (
                <div className={estilo.fileirasProdutos} key={item.produto_id}>
                    {identificacao(item)}
                    <div className={estilo.informacaoPedidos}>
                        {quantidade(item)}
                        <div className={estilo.unidades}>
                            {precos(item, item.valor, item.valorUnitario)}
                        </div>
                        <div className={estilo.total}>
                            {precos(item, item.valor * item.quantidade, item.subtotal)}
                        </div>
                    </div>
                </div>
                ))}
                <hr />
                <div className={estilo.informacoesAdicionais}>
                    <div className={estilo.desconto}>
                        <label htmlFor="">Cupom de desconto</label>
                        <div>
                            <input type="text" name="" id="" placeholder="Insira seu codigo" /> <Botao cor={'#C92071'} corFundo={'#F5F5F5'} largura={'114px'} altura={'60px'} texto={'OK'} />
                        </div>
                    </div>
                    <div className={estilo.frete}>
                        <label htmlFor="">Calcular frete</label>
                        <div>
                            <input type="text" name="" id="" placeholder="Insira seu CEP" /> <Botao cor={'#C92071'} corFundo={'#F5F5F5'} largura={'114px'} altura={'60px'} texto={'OK'} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className={estilo.containerGeralMobile}>

            <div className={estilo.containerMobile}>
                <div className={estilo.carrinhoMobile}>
                    <div className={estilo.titulo}>
                        MEU CARRINHO
                    </div>
                    <hr />
                    {vazio}
                    {mensagemErro}
                    {carrinho.itens.map((item) => (
                    <div key={item.produto_id}>
                    {identificacao(item)}
                    <div className={estilo.subQuantidade}>
                        QUANTIDADE
                    </div>
                    {quantidade(item)}
                    <div className={estilo.informacaoPedidos}>
                        <div className={estilo.unidades}>
                            <div className={estilo.subUnitario}>
                                UNITÁRIO
                            </div>
                            {precos(item, item.valor, item.valorUnitario)}
                        </div>
                        <div className={estilo.total}>
                            <div className={estilo.subTotal}>
                                TOTAL
                            </div>
                            {precos(item, item.valor * item.quantidade, item.subtotal)}
                        </div>
                    </div>
                    </div>
                    ))}
                </div>
            </div>
                <div className={estilo.containerDescontoMobile}>
                    <div className={estilo.descontoMobile}>
                        <label htmlFor="">Cupom de desconto</label>
                        <div>
                            <input type="text" name="" id="" placeholder="Insira seu codigo" /> <Botao cor={'#C92071'} corFundo={'#F5F5F5'} largura={'255px'} altura={'60px'} texto={'OK'} />
                        </div>
                    </div>
                </div>
                <div className={estilo.containerFreteMobile}>
                    <div className={estilo.freteMobile}>
                        <label htmlFor="">Calcular frete</label>
                        <div>
                            <input type="text" name="" id="" placeholder="Insira seu CEP" /> 
                            <Botao cor={'#C92071'} corFundo={'#F5F5F5'} largura={'255px'} altura={'60px'} texto={'OK'} />
                        </div>
                    </div>
                </div>
        </div>
    </div>)
}