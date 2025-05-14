import styles from "./styles/market.module.css"
import {Header } from "../components/header"
export default function Market() {
    return (
      <div className={styles.market}>
        <Header />
        {/* Your content here */}
      </div>
    );
  }