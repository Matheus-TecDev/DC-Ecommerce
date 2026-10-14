import estilo from './styles.module.scss'
import Botao from '../../components/Botao'
import { useId, useState } from 'react'
import type { CSSProperties } from 'react'
import { useCarrinho } from '../../contexts/CartContext'
import { mensagemDeErro, urlImagem } from '../../services/api'
import { formatarPreco } from '../../utils/precos'
import type { ItemCarrinhoDetalhado } from '../../types/modelos'

const estiloImagem: CSSProperties = { objectFit: "contain" }

export default function MeusPedidos() {
    const { carrinho, alterarQuantidade, remover } = useCarrinho()
    const [erro, setErro] = useState('')
    const id = useId()

    function executar(acao: Promise<void>) {
        setErro('')
        acao.catch((falha: unknown) => setErro(mensagemDeErro(falha)))
    }

    function quantidade(item: ItemCarrinhoDetalhado) {
        return (
            <div className={estilo.quantidade}>
                <div className={estilo.botoes}>
                    <button type="button" aria-label={`Diminuir quantidade de ${item.titulo}`} disabled={item.quantidade <= 1} onClick={() => executar(alterarQuantidade(item.produto_id, item.quantidade - 1))}> - </button>
                    <p>{item.quantidade}</p>
                    <button type="button" aria-label={`Aumentar quantidade de ${item.titulo}`} onClick={() => executar(alterarQuantidade(item.produto_id, item.quantidade + 1))}> + </button>
                </div>
                <button type="button" className={estilo.removerItem} aria-label={`Remover ${item.titulo} do carrinho`} onClick={() => executar(remover(item.produto_id))}>Remover item</button>
            </div>
        )
    }

    function precos(item: ItemCarrinhoDetalhado, valor: number, valorComDesconto: number) {
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

    function identificacao(item: ItemCarrinhoDetalhado) {
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
                        <label htmlFor={`${id}-cupom`}>Cupom de desconto</label>
                        <div>
                            <input type="text" id={`${id}-cupom`} placeholder="Insira seu codigo" /> <Botao cor={'#C92071'} corFundo={'#F5F5F5'} largura={'114px'} altura={'60px'} texto={'OK'} />
                        </div>
                    </div>
                    <div className={estilo.frete}>
                        <label htmlFor={`${id}-frete`}>Calcular frete</label>
                        <div>
                            <input type="text" id={`${id}-frete`} placeholder="Insira seu CEP" /> <Botao cor={'#C92071'} corFundo={'#F5F5F5'} largura={'114px'} altura={'60px'} texto={'OK'} />
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
                        <label htmlFor={`${id}-cupom-mobile`}>Cupom de desconto</label>
                        <div>
                            <input type="text" id={`${id}-cupom-mobile`} placeholder="Insira seu codigo" /> <Botao cor={'#C92071'} corFundo={'#F5F5F5'} largura={'255px'} altura={'60px'} texto={'OK'} />
                        </div>
                    </div>
                </div>
                <div className={estilo.containerFreteMobile}>
                    <div className={estilo.freteMobile}>
                        <label htmlFor={`${id}-frete-mobile`}>Calcular frete</label>
                        <div>
                            <input type="text" id={`${id}-frete-mobile`} placeholder="Insira seu CEP" /> 
                            <Botao cor={'#C92071'} corFundo={'#F5F5F5'} largura={'255px'} altura={'60px'} texto={'OK'} />
                        </div>
                    </div>
                </div>
        </div>
    </div>)
}