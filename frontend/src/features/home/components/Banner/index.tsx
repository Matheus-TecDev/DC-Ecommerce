import Carousel from 'better-react-carousel'
import styles from './styles.module.scss'
import tenis from "./tenis1.png"
import ornament from "./Ornament.png"
import Botao from '../../../../components/ui/Botao'
import { useEffect, useState } from 'react'



const Banner = () => {
  const [widthButton, setWidthButton] = useState('200px')

  useEffect(() => {
    const checkSize = () => {
      setWidthButton(window.innerWidth < 500 ? '80vw' : '200px');
    }
    checkSize()
    window.addEventListener("resize", checkSize)
    return () => {
      window.removeEventListener("resize", checkSize)
    }
  }, [])



  const MyDot = ({ isActive }: { isActive: boolean }) => (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        height: '12px',
        width: '12px',
        background: isActive ? "#C92071" : "#CCCCCC",
        borderRadius: "50%",
        position: 'relative',
        top: '-53px',
      }}
    ></span>
  )
    
  return (

    <div className={styles.bannerContainer}>
      <Carousel cols={1}
        rows={1}
        gap={5}
        showDots={true}
        dot={MyDot}
        loop={true}
        containerStyle={{ height: "681px", width: "100vw" }}
        hideArrow={true}

      >
        <Carousel.Item >
          <div className={styles.divItemCarousel}>
            <div className={styles.divTextoCarouselItem}>
              <h2 className={styles.informativoTexto}>Melhores ofertas personalizadas</h2>
              <h1 className={styles.mainTextoCarousel}>Queima de stoque Nike 🔥</h1>
              <div className={styles.descricaoTextoCarousel}>Consequat culpa exercitation mollit nisi excepteur do do tempor laboris eiusmod irure consectetur.</div>
              <Botao texto={"Ver Ofertas"} corFundo={'#C92071'} largura={widthButton}  />
            </div>
            <div className={styles.divImageCarouselItem}>
              <img src={tenis} alt="" className={styles.tenis} />
            </div>
            <div className={styles.divOrnamentCarousel}>
              <img src={ornament} alt="" />
            </div>
          </div>
        </Carousel.Item>
        <Carousel.Item >
          <div className={styles.divItemCarousel}>
            <div className={styles.divTextoCarouselItem}>
              <h2 className={styles.informativoTexto}>Melhores ofertas personalizadas</h2>
              <h1 className={styles.mainTextoCarousel}>Queima de stoque Nike 🔥</h1>
              <div className={styles.descricaoTextoCarousel}>Consequat culpa exercitation mollit nisi excepteur do do tempor laboris eiusmod irure consectetur.</div>
              <Botao texto={"Ver Ofertas"} corFundo={'#C92071'} largura={widthButton}  />
            </div>
            <div className={styles.divImageCarouselItem}>
              <img src={tenis} alt="" className={styles.tenis} />
            </div>
            <div className={styles.divOrnamentCarousel}>
              <img src={ornament} alt="" />
            </div>
          </div>
        </Carousel.Item>
        <Carousel.Item >
          <div className={styles.divItemCarousel}>
            <div className={styles.divTextoCarouselItem}>
              <h2 className={styles.informativoTexto}>Melhores ofertas personalizadas</h2>
              <h1 className={styles.mainTextoCarousel}>Queima de stoque Nike 🔥</h1>
              <div className={styles.descricaoTextoCarousel}>Consequat culpa exercitation mollit nisi excepteur do do tempor laboris eiusmod irure consectetur.</div>
              <Botao texto={"Ver Ofertas"} corFundo={'#C92071'} largura={widthButton}  />
            </div>
            <div className={styles.divImageCarouselItem}>
              <img src={tenis} alt="" className={styles.tenis} />
            </div>
            <div className={styles.divOrnamentCarousel}>
              <img src={ornament} alt="" />
            </div>
          </div>
        </Carousel.Item>


      </Carousel>
    </div>
  )
}

export default Banner
