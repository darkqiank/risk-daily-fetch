import Link from 'next/link';
import { Box, Typography, Button } from '@mui/material';

const HomePage = () => {
  return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', padding: 3 }}
      >
        <Typography variant="h1" sx={{ marginBottom: 3, fontWeight: 'bold', color: '#333' }}>
          RISK EYE
        </Typography>
        
        <Link href="/x" passHref>
          <Button variant="outlined" sx={{ marginTop: 2 }}>
            跳转到 Twitter Feed
          </Button>
        </Link>
      </Box>
  );
};

export default HomePage;