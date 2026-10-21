import { ProdutosHome } from "../../features/produtos";
import { BannerHome, CardDestaques, OfertaEspecial } from "../../features/home";
import styles from "./styles.module.scss";
export default function Home() {
	return (
		<div className={styles.homeContainer}>
			<BannerHome/>
			<CardDestaques />
			<ProdutosHome />
			<OfertaEspecial />
		</div>
	);
}
