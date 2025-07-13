import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { Box, Typography } from "@mui/material";
import GitHubIcon from '@mui/icons-material/GitHub';
import StorageIcon from '@mui/icons-material/Storage';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PageContent from "./PageContent";

export default function Home() {

  return (
    <PageContent />
  )

  return (
    <div className={styles.page}>
      <main className={styles.main}>

        <h1
          className="stencilla-font"
          style={{
            marginBottom: '0rem',
          }}
        >
          Battle Trap
        </h1>

        <div>Tron inspired turn based multiplayer game by Articles Media</div>

        <div className={styles.ctas}>

          <Link
            className={styles.primary}
            href="/play?mode=single"
            rel="noopener noreferrer"
            style={{
              width: '214px'
            }}
          >
            Single Player
          </Link>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}
            >
              <Link
                className={styles.primary}
                href="/play?mode=websocket-multiplayer"
                rel="noopener noreferrer"
                style={{ marginBottom: '0rem' }}
              >
                Websocket Multiplayer
              </Link>
              <Typography variant="caption">(Sign in required)</Typography>
            </Box>
            <Box
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                mb: 1,
                opacity: 0.5,
              }}
            >
              <Link
                className={styles.primary}
                href="/play?mode=p2p-multiplayer"
                rel="noopener noreferrer"
                style={{ marginBottom: '0rem' }}
              >
                P2P Multiplayer
              </Link>
              <Typography variant="caption">(Not Ready!)</Typography>
            </Box>
          </Box>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href={`${process.env.NEXT_PUBLIC_GITHUB_REPO}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MenuBookIcon />
          Docs
        </a>
        <a
          href={process.env.NEXT_PUBLIC_GITHUB_REPO}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon />
          Github
        </a>
        <a
          href="https://articles.media"
          target="_blank"
          rel="noopener noreferrer"
        >
          <StorageIcon />
          Articles Media
        </a>
      </footer>
    </div>
  );

}
