import TweetList from '../components/xList'
import { Box, Typography } from '@mui/material';

const XPage = () => {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', padding: 3 }}
    >
      <Typography variant="h1" sx={{ marginBottom: 3, fontWeight: 'bold', color: '#333' }}>
        Twitter Feed
      </Typography>
      <Box 
        sx={{ 
          width: '100%', 
          maxWidth: '600px', 
          bgcolor: 'white', 
          borderRadius: 2, 
          boxShadow: 1, 
          padding: 2 
        }}
      >
        <TweetList />
      </Box>
    </Box>
  );
};

export default XPage;
