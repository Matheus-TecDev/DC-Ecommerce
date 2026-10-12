import ProdutosHome from "../../components/ProdutosHome";
import OfertaEspecial from "../../components/OfertaEspecial/index.jsx";
import styles from "./styles.module.scss";
import CardDestaques from "../../components/CardDestaques/index.jsx";
import BannerHome from "../../components/BannerHome"
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
