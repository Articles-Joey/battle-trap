import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import AppThemeProvider from "@/components/AppThemeProvider";
import packageInfo from "@/package.json";

import "@articles-media/articles-gamepad-helper/dist/articles-gamepad-helper.css";

import SocketLogicHandler from "@/components/SocketLogicHandler";
import LayoutClient from "@/app/layout-client";

export const metadata = {
    title: process.env.NEXT_PUBLIC_GAME_NAME,
    description: packageInfo.description,
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head></head>

            <body>
                <AppRouterCacheProvider options={{ enableCssLayer: true }}>
                    <AppThemeProvider>
                        <SocketLogicHandler />
                        <LayoutClient />
                        {children}
                    </AppThemeProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
