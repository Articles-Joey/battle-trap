import Image from "next/image";
import styles from "../page.module.css";
import Link from "next/link";
import { Box, Typography } from "@mui/material";

export const metadata = {
  title: "Play - Battle Trap",
  robots: {
    index: false,
    follow: true,
  },
};

export default function Play() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>

        <h1
          className="stencilla-font"
          style={{
            marginBottom: '0rem',
          }}
        >
          Play Page
        </h1>

      </main>
    </div>
  );
}
