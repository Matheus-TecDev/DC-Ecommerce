import styles from './styles.module.scss';

interface DestaqueDescontoProps {
    texto: string;
}

export default function DestaqueDesconto({ texto }: DestaqueDescontoProps) {
    return (
        <div className={styles.descontoContainer}>
            {texto}
        </div>
    )
}
