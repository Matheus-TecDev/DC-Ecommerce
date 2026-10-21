import styles from './styles.module.scss'

interface AvisoDemonstrativoProps {
    titulo: string;
    texto: string;
}

export default function AvisoDemonstrativo({ titulo, texto }: AvisoDemonstrativoProps) {
    return (
        <p role="note" className={styles.aviso}>
            <strong>{titulo}</strong> {texto}
        </p>
    )
}
