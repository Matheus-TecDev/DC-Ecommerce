import styles from './styles.module.scss';

export interface BotaoProps {
    texto: string;
    corFundo?: string;
    cor?: string;
    largura?: string;
    altura?: string;
}

export default function Botao({ texto, corFundo, cor, largura, altura }: BotaoProps) {
    return (
        <button className={styles.botao} style={{ backgroundColor: corFundo, width: largura, color: cor, height: altura }}>
            {texto}
        </button>
    )
}
