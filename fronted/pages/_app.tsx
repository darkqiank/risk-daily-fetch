import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// const theme = createTheme({
//   shape: {
//     borderRadius: 16,
//   },
// });

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
      },
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
    <CssBaseline />
    <Component {...pageProps} />
    </ThemeProvider>
  )
}
