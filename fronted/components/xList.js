import React , { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Link, TextField, IconButton, InputAdornment, Tooltip } from '@mui/material';
import CopyAllIcon from '@mui/icons-material/CopyAll';

const TweetList = () => {
    const [data, setData] = useState(null);
    const [apiUrl, setApiUrl] = useState(''); // 获取当前主机名

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/x');
                const jsonData = await response.json();
                setData(jsonData);
            } catch (err) {
            console.error('Error fetching data:', err);
            }
        };

        fetchData();
        if (typeof window !== 'undefined') { // 确保在客户端环境中执行
          const protocol = window.location.protocol; // 获取 HTTP 协议
          const host = window.location.host; // 获取当前主机名
          setApiUrl(`${protocol}//${host}/api/x`); // 设置 API URL
        }
    }, []);
    console.log(data)
    if (!data) return <div>Loading...</div>;
    const tweets = Object.values(data);

    const copyToClipboard = () => {
      navigator.clipboard.writeText(apiUrl).then(() => {
        alert('接口复制成功！');
      }).catch(err => {
        console.error('复制失败:', err);
      });
    };
    

    return (
        <Box display="flex" flexDirection="column" gap={2}>
            <Box 
              display="flex" 
              alignItems="center" 
              sx={{ marginBottom: 3, bgcolor: 'white', borderRadius: 2, padding: 1}}
            >
              <TextField
                label="数据接口"
                variant="outlined"
                value={apiUrl}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="点我复制数据接口">
                        <IconButton onClick={copyToClipboard} edge="end">
                          <CopyAllIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1, marginRight: 1 }}
              />
            </Box>
        {tweets
          .filter(item => item.x_id.startsWith('tweet-') || item.x_id.startsWith('profile-conversation-')) // 过滤有效项
          .sort((a, b) => {
            // 获取时间
            const timeA = a.x_id.startsWith('tweet-') 
                ? new Date(a.data.created_at) 
                : new Date(a.data[0].data.created_at);
            const timeB = b.x_id.startsWith('tweet-') 
                ? new Date(b.data.created_at) 
                : new Date(b.data[0].data.created_at);
            return timeB - timeA; // 从最近到最晚排序
          })
          .map((item) => {
            if (item.x_id.startsWith('tweet-')) {
            return (
                <Card key={item.x_id} variant="outlined">
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                    <Link href={item.user_link} target="_blank" rel="noopener" marginLeft={2}>
                        <Typography variant="h6">{item.username}</Typography>
                    </Link>
                    <Typography variant="caption" color="textSecondary">
                        {new Date(item.data.created_at).toLocaleString()}
                    </Typography>
                    </Box>
                    <Typography variant="body1" paragraph>
                    {item.data.full_text}
                    </Typography>
                    {item.data.urls && Object.keys(item.data.urls).length > 0 && (
                    <Box marginBottom={2}>
                        <Typography variant="subtitle2" gutterBottom>
                        Links:
                        </Typography>
                        {Object.entries(item.data.urls).map(([shortLink, links]) => (
                        <Link key={shortLink} href={links[0]} target="_blank" rel="noopener">
                            {links[0]}
                        </Link>
                        ))}
                    </Box>
                    )}
                    {item.data.medias && Object.keys(item.data.medias).length > 0 && (
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                        Media:
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                        {Object.entries(item.data.medias).map(([shortMedia, mediaLinks]) =>
                            mediaLinks.map((media, index) => (
                            <Box key={index} component="img" src={media} alt="media" sx={{ width: '100%', maxWidth: '200px', borderRadius: 1 }} />
                            ))
                        )}
                        </Box>
                    </Box>
                    )}
                </CardContent>
                </Card>
            );
            } else if (item.x_id.startsWith('profile-conversation-')) {
                return <Card key={item.x_id} variant="outlined">
                    <CardContent>
                        {item.data.map((subItem) => (
                            <Box key={subItem.x_id}>                       
                            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                          <Link href={item.user_link} target="_blank" rel="noopener" marginLeft={2}>
                            <Typography variant="h6">{item.username}</Typography>
                          </Link>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(subItem.data.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body1" paragraph>
                          {subItem.data.full_text}
                        </Typography>
                        {subItem.data.urls && Object.keys(subItem.data.urls).length > 0 && (
                          <Box marginBottom={2}>
                            <Typography variant="subtitle2" gutterBottom>
                              Links:
                            </Typography>
                            {Object.entries(subItem.data.urls).map(([shortLink, links]) => (
                              <Link key={shortLink} href={links[0]} target="_blank" rel="noopener">
                                {links[0]}
                              </Link>
                            ))}
                          </Box>
                        )}
                        {subItem.data.medias && Object.keys(subItem.data.medias).length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Media:
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                              {Object.entries(subItem.data.medias).map(([shortMedia, mediaLinks]) =>
                                mediaLinks.map((media, index) => (
                                  <Box key={index} component="img" src={media} alt="media" sx={{ width: '100%', maxWidth: '200px', borderRadius: 1 }} />
                                ))
                              )}
                            </Box>
                          </Box>
                        )}</Box>))}
                    </CardContent>
                </Card>
            }
            return null;
        })}
        </Box>
    );
};

export default TweetList;
