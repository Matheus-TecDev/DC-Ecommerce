import logo from '../../assets/images/logo.png'
import styles from './styles.module.scss'
import { CiSearch } from 'react-icons/ci'
import { IconContext } from "react-icons";
import NavLinkMobile from "../NavLinkMobile";
import Carrinho from "../Carrinho"
import { FaBars } from "react-icons/fa";
import { useState } from 'react';
import { useSearch } from '../../contexts/SearchContext';


export default function HeaderMobile() {
        const[ hamburguer, setHamburguer]=useState(false);
        const [popUpInput,setPopUpInput] =useState(false);
        const search = useSearch()
        return (<div className={styles.headerMobileContainer}>

                <IconContext.Provider value={{ color: "rgb (102,102,102)", className: styles.hamburguer }}>
                        <button type="button" className={styles.botaoIcone} aria-label="Menu de navegação" aria-expanded={hamburguer}
                        onClick={()=>{setHamburguer(!hamburguer);setPopUpInput(false)}}>
                                <FaBars className={styles.posicaoIconHamburguer} aria-hidden="true" />
                        </button>
                </IconContext.Provider>



                <div className={styles.imgContainer}>
                        <img src={logo} alt="Logo Digital College" className={styles.imagemLogo} />

                        <div className={styles.tituloLogo} >
                                <span>Digital Store</span>
                                <IconContext.Provider value={{ color: '#C92071', className: styles.icon }}>
                                        <button type="button" className={styles.botaoIcone} aria-label="Pesquisar produto" aria-expanded={popUpInput}
                                         onClick={()=>{setPopUpInput(!popUpInput);setHamburguer(false)}}>
                                                <CiSearch className={styles.posicaoIconSearch} aria-hidden="true" />
                                        </button>
                                </IconContext.Provider>

                        </div>
                        <div className={styles.Carrinho}>
                                <Carrinho />
                        </div>
                        <div className={styles.popHamburguer} style={hamburguer?{left:0}:{left:"-100vw"}} onClick={()=>{setHamburguer(false)}}>
                                <div className={styles.divNavLinkFundo}>
                                <div className={styles.divNavLink}>
                                        <NavLinkMobile/>
                                </div>
                                </div>
                        </div>


                </div>
               {popUpInput&&<div className={styles.containerPesquisaHeaderMobile}>
                    <input type={"text"} placeholder="Pesquisar produto..." aria-label="Pesquisar produto" className={styles.inputPesquisaHeader} value={search.search} onChange={(e)=>{search.setSearch(e.target.value)}}/>
                    <IconContext.Provider value={{  color:'rgb(102, 102, 102)', className: styles.containerIconPesquisaPop }}>
                                        <CiSearch className={styles.iconPesquisaPop} aria-hidden="true" />
                                </IconContext.Provider>
                </div>}
        </div>

        )

}