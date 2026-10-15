import { BsCartDash } from 'react-icons/bs'
import styles from './styles.module.scss'
import { IconContext } from "react-icons";
import { useState } from 'react';
import Botao from '../Botao';
import { useCarrinho } from '../../contexts/CartContext';
import { urlImagem } from '../../services/api';
import { formatarPreco } from '../../utils/precos';

export default function Carrinho() {
    const [abrirCarrinho, setAbrirCarrinho] = useState(false);
    const { carrinho, esvaziar } = useCarrinho();
    const comprasAdicionadas = carrinho.itens;
    const valorTotal = formatarPreco(carrinho.valorTotal);

    return (
        <IconContext.Provider value={{ className: styles.carrinho }} >
            <div>
                <button
                    type="button"
                    className={styles.alternar}
                    aria-label={`Carrinho com ${carrinho.quantidadeItens} ${carrinho.quantidadeItens === 1 ? 'item' : 'itens'}`}
                    aria-expanded={abrirCarrinho}
                    onClick={() => setAbrirCarrinho(!abrirCarrinho)}
                >
                    <span className={styles.qtdComprasAdicionadas} >
                        <span>
                            {carrinho.quantidadeItens}
                        </span>
                    </span>
                    <BsCartDash aria-hidden="true" />
                </button>
                {abrirCarrinho &&
                    <div className={styles.carrinhoPopUp} onClick={() => setAbrirCarrinho(false)}>
                        <div className={styles.titlePopUp}>
                            <h2> Meu Carrinho</h2>
                        </div>
                        {comprasAdicionadas.length === 0 && <h3>Seu carrinho está vazio</h3>}
                        {comprasAdicionadas.map((compra) => (
                            <div key={compra.produto_id} className={styles.cardProd}>
                                <div className={styles.imgContainer}>
                                    <img src={urlImagem(compra.img)} alt="" style={{ width: "51px", height: "26px", objectFit: "contain" }} />
                                </div>
                                <div className={styles.textContainer}>
                                    <h3>{compra.titulo}</h3>
                                    <h3> {compra.quantidade} x {compra.categoria}</h3>
                                    <div className={styles.precoContainer}>
                                        <span className={styles.precoAtual}>R$ {formatarPreco(compra.valorUnitario)}</span>
                                        {compra.desconto > 0 && <span className={styles.precoAnterior}>R$ {formatarPreco(compra.valor)}</span>}
                                    </div>
                                </div>
                            </div>))}
                        <div className={styles.valorTotal}>
                            <h3>Valor total:</h3>
                            <span>R$ {valorTotal}</span>
                        </div>
                        <div className={styles.containerBotoes}>
                            <button type="button" className={styles.botao} onClick={() => { esvaziar().catch(() => undefined) }}>Esvaziar</button>
                            <Botao para="/produtos/carrinho" corFundo={'#C92071'} largura={'124.78px'} texto={'Ver Carrinho'} />
                        </div>
                    </div>
                }
            </div>
        </IconContext.Provider>
    )
}
