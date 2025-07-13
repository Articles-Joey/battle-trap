import Image from "next/image";
import styles from "../page.module.css";
import Link from "next/link";
import { Box, Typography } from "@mui/material";
import PageContent from "./PageContent"

export const metadata = {
  title: "Play - Battle Trap",
  robots: {
    index: false,
    follow: true,
  },
};

export default function Play() {
  return (
    <PageContent />
  );
}
