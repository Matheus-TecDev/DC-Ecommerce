import type { CSSProperties, MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.scss';

interface BotaoAparencia {
    texto: string;
    corFundo?: string;
    cor?: string;
    largura?: string;
    altura?: string;
}

interface BotaoAcaoProps extends BotaoAparencia {
    para?: undefined;
    tipo?: 'button' | 'submit';
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

interface BotaoLinkProps extends BotaoAparencia {
    para: string;
}

export type BotaoProps = BotaoAcaoProps | BotaoLinkProps;

export default function Botao(props: BotaoProps) {
    const { texto, corFundo, cor, largura, altura } = props;
    const estilo: CSSProperties = { backgroundColor: corFundo, width: largura, color: cor, height: altura };

    if (props.para !== undefined) {
        return (
            <Link to={props.para} className={`${styles.botao} ${styles.link}`} style={estilo}>
                {texto}
            </Link>
        )
    }

    return (
        <button type={props.tipo ?? 'button'} className={styles.botao} style={estilo} onClick={props.onClick}>
            {texto}
        </button>
    )
}
