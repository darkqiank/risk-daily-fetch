import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Pagination,
  Box,
} from "@mui/material";

const logs = `1743061051|9c:84:b6:ca:26:de|88:6e:dd:59:61:f5|apis.meari.com.cn|
1743061052|9c:84:b6:ca:26:de|88:6e:dd:59:61:f5|apis-cn-hangzhou.meari.com.cn|
1743061053|9c:84:b6:ca:26:de|88:6e:dd:59:61:f5|cnce.mearicloud.cn|
1743061053|9c:84:b6:ca:26:de|88:6e:dd:59:61:f5|apis-cn-hangzhou.meari.com.cn|
1743061061|9c:84:b6:ca:26:de|88:6e:dd:59:61:f5|apis-cn-hangzhou.meari.com.cn|
1743061061|9c:84:b6:ca:26:de|88:6e:dd:59:61:f5|meari-hz.oss-cn-hangzhou.aliyuncs.com|
1743061062|9c:84:b6:ca:26:de|88:6e:dd:59:61:f5|apis-cn-hangzhou.meari.com.cn|
1743061158|9c:84:b6:ca:26:de|88:6e:dd:59:61:f5|meari-hz.oss-cn-hangzhou.aliyuncs.com|
1743061158|9c:84:b6:ca:26:de|88:6e:dd:59:61:f5|apis-cn-hangzhou.meari.com.cn|
1743061062|9c:84:b6:ca:26:de|88:6e:dd:59:61:f5|apis-cn-hangzhou.meari.com.cn|
1743061174|9a:fe:bb:e3:b0:ed|88:6e:dd:59:61:f5||iPhone; iOS 17.2.1;
1743061174|9a:fe:bb:e3:b0:ed|88:6e:dd:59:61:f5||iPhone; CPU iPhone OS 17_2_1 like Mac OS X;
1743061210|9a:fe:bb:e3:b0:ed|88:6e:dd:59:61:f5||iOS/17.2.1 Model/iPhone12,1
1743061210|9a:fe:bb:e3:b0:ed|88:6e:dd:59:61:f5|www.icloud.com|
1743061486|68:ab:bc:c8:64:70|88:6e:dd:59:61:f5||
1743061887|c8:89:f3:ae:d6:49|88:6e:dd:59:61:f5||
1743061000|6e:67:82:73:85:ba|72:8e:22:85:2d:80|www.apple.com|
1743061001|f6:ca:71:bb:22:e2|72:8e:22:85:2d:80|account.xiaomi.com|
1743061002|ec:73:4a:29:8a:04|f0:83:e7:2a:60:91|www.icloud.com|
1743061003|86:76:b1:72:eb:56|42:3d:02:52:be:8f|www.microsoft.com|Windows NT 10.0; Win64;
1743061004|7e:14:b4:23:41:6f|f0:83:e7:2a:60:91|account.xiaomi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061005|86:4c:4f:da:bc:c7|42:3d:02:52:be:8f|www.icloud.com|iOS/17.2.1 Model/iPhone12,1
1743061006|ae:33:90:e8:4d:41|72:8e:22:85:2d:80|www.apple.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061007|c8:b7:cb:f5:89:05|42:3d:02:52:be:8f|account.xiaomi.com|
1743061008|28:db:df:50:64:1d|42:3d:02:52:be:8f|www.microsoft.com|Windows NT 10.0; Win64;
1743061009|32:ca:86:47:87:2a|42:3d:02:52:be:8f|www.icloud.com|iOS/17.2.1 Model/iPhone12,1
1743061010|2c:72:81:47:a6:d7|72:8e:22:85:2d:80|www.microsoft.com|Windows NT 10.0; Win64;
1743061011|2c:24:a1:1d:3a:6a|72:8e:22:85:2d:80||Windows NT 10.0; Win64;
1743061012|5e:30:6a:3b:d9:22|72:8e:22:85:2d:80|www.icloud.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061013|ce:79:f3:36:08:bd|72:8e:22:85:2d:80|www.microsoft.com|Windows NT 10.0; Win64;
1743061014|6a:9a:0c:a7:2f:88|42:3d:02:52:be:8f|www.microsoft.com|
1743061015|8a:56:9e:52:77:c5|f0:83:e7:2a:60:91|www.icloud.com|iPhone; CPU iPhone OS 17_2_1 like Mac OS X;
1743061016|0c:69:dd:fa:1d:0c|72:8e:22:85:2d:80||Macintosh; Intel Mac OS X 10_15_7
1743061017|fc:d1:58:06:91:9f|f0:83:e7:2a:60:91|www.microsoft.com|Windows NT 10.0; Win64;
1743061018|9c:d4:c9:1e:61:28|42:3d:02:52:be:8f|api.io.mi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061019|a8:08:8d:5f:3d:34|f0:83:e7:2a:60:91|account.xiaomi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061020|3a:30:60:69:8f:6e|42:3d:02:52:be:8f|www.microsoft.com|Windows NT 10.0; Win64;
1743061021|20:b3:49:25:3e:44|72:8e:22:85:2d:80|www.microsoft.com|Windows NT 10.0; Win64;
1743061022|90:c4:74:44:fe:45|f0:83:e7:2a:60:91|www.apple.com|iPhone; iOS 17.2.1;
1743061023|b4:15:97:98:33:bf|72:8e:22:85:2d:80|www.apple.com|iPhone; iOS 17.2.1;
1743061024|ea:f6:f9:e4:67:b2|72:8e:22:85:2d:80|www.microsoft.com|Windows NT 10.0; Win64;
1743061025|d0:64:fb:8f:22:43|72:8e:22:85:2d:80|account.xiaomi.com|
1743061026|88:bd:1d:4d:a8:0e|42:3d:02:52:be:8f||
1743061027|24:0e:6f:2a:79:53|42:3d:02:52:be:8f|www.microsoft.com|
1743061028|34:6e:67:ea:17:2d|42:3d:02:52:be:8f|www.icloud.com|iPhone; iOS 17.2.1;
1743061029|92:cb:38:bd:19:4c|72:8e:22:85:2d:80|www.microsoft.com|
1743061030|c0:bd:ea:9f:fa:31|f0:83:e7:2a:60:91||
1743061031|0e:ed:10:86:1c:a7|f0:83:e7:2a:60:91||Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061032|16:d3:c6:bb:dd:26|72:8e:22:85:2d:80|www.microsoft.com|Windows NT 10.0; Win64;
1743061033|58:ed:48:63:72:b4|42:3d:02:52:be:8f||iPhone; CPU iPhone OS 17_2_1 like Mac OS X;
1743061034|ea:b6:b3:76:bd:c4|72:8e:22:85:2d:80|api.io.mi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061035|f0:92:7c:27:99:2e|f0:83:e7:2a:60:91||Windows NT 10.0; Win64;
1743061036|f8:3a:a3:5f:34:c3|f0:83:e7:2a:60:91||iPhone; CPU iPhone OS 17_2_1 like Mac OS X;
1743061037|40:27:db:65:b3:4a|f0:83:e7:2a:60:91||Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061038|aa:a5:1b:a0:12:d0|f0:83:e7:2a:60:91|www.apple.com|iPhone; iOS 17.2.1;
1743061039|74:b7:98:45:2e:4b|f0:83:e7:2a:60:91|www.icloud.com|Macintosh; Intel Mac OS X 10_15_7
1743061040|3e:ef:88:2b:69:d3|42:3d:02:52:be:8f||
1743061041|b6:6f:2b:ad:45:78|42:3d:02:52:be:8f|www.microsoft.com|
1743061042|20:58:12:f0:99:e5|42:3d:02:52:be:8f|www.apple.com|
1743061043|88:5d:c7:44:77:6a|42:3d:02:52:be:8f|account.xiaomi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061044|0c:7a:ae:9e:3f:d1|f0:83:e7:2a:60:91|www.icloud.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061045|8a:9a:ad:14:a6:e7|f0:83:e7:2a:60:91|account.xiaomi.com|
1743061046|44:48:ad:6b:b3:1a|f0:83:e7:2a:60:91|www.microsoft.com|
1743061047|cc:99:3c:96:e2:2a|f0:83:e7:2a:60:91|www.microsoft.com|Windows NT 10.0; Win64;
1743061048|76:aa:a8:d9:82:b5|72:8e:22:85:2d:80||Windows NT 10.0; Win64;
1743061049|56:a4:31:36:8f:ae|f0:83:e7:2a:60:91||
1743061050|90:94:89:da:0e:dd|72:8e:22:85:2d:80|www.microsoft.com|Windows NT 10.0; Win64;
1743061051|5a:9b:57:52:5a:1b|72:8e:22:85:2d:80|account.xiaomi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061052|52:fd:65:e0:89:91|72:8e:22:85:2d:80||Windows NT 10.0; Win64;
1743061053|54:26:75:52:49:ec|42:3d:02:52:be:8f|www.icloud.com|
1743061054|32:c0:c1:25:85:37|42:3d:02:52:be:8f|account.xiaomi.com|
1743061055|04:33:b2:8b:c9:14|72:8e:22:85:2d:80|account.xiaomi.com|
1743061056|30:a4:ee:1f:96:87|42:3d:02:52:be:8f|www.icloud.com|iOS/17.2.1 Model/iPhone12,1
1743061057|d4:74:6f:f3:f8:5c|42:3d:02:52:be:8f|www.apple.com|iPhone; iOS 17.2.1;
1743061058|2c:73:11:e5:b7:97|f0:83:e7:2a:60:91|www.microsoft.com|Windows NT 10.0; Win64;
1743061059|70:2d:b6:ae:4d:4f|72:8e:22:85:2d:80|api.io.mi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061060|7e:b5:71:01:3b:f2|42:3d:02:52:be:8f|www.icloud.com|iPhone; CPU iPhone OS 17_2_1 like Mac OS X;
1743061061|46:33:89:58:60:f4|72:8e:22:85:2d:80|www.microsoft.com|Windows NT 10.0; Win64;
1743061062|e6:52:40:f3:c0:51|72:8e:22:85:2d:80|www.apple.com|
1743061063|22:69:59:75:7a:9d|f0:83:e7:2a:60:91|www.apple.com|Macintosh; Intel Mac OS X 10_15_7
1743061064|46:a1:9c:da:7f:b0|72:8e:22:85:2d:80|www.icloud.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061065|46:96:8d:f5:53:10|42:3d:02:52:be:8f|www.microsoft.com|Windows NT 10.0; Win64;
1743061066|da:e3:22:89:a5:87|72:8e:22:85:2d:80||Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061067|8a:e5:1c:8c:7c:8c|42:3d:02:52:be:8f||Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061068|5a:3b:23:66:ea:19|f0:83:e7:2a:60:91||Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061069|4e:78:4f:ee:ce:e7|42:3d:02:52:be:8f|account.xiaomi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061070|08:5f:6e:1f:dd:9e|72:8e:22:85:2d:80|www.microsoft.com|
1743061071|0a:df:25:13:a8:f9|f0:83:e7:2a:60:91|www.apple.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061072|6e:c5:c6:f0:54:88|72:8e:22:85:2d:80||Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061073|44:76:88:bd:11:a1|f0:83:e7:2a:60:91||Windows NT 10.0; Win64;
1743061074|18:c7:dc:b0:d4:67|f0:83:e7:2a:60:91|www.apple.com|Macintosh; Intel Mac OS X 10_15_7
1743061075|80:d9:14:f0:af:a6|42:3d:02:52:be:8f|account.xiaomi.com|
1743061076|f4:6c:e7:64:bc:60|42:3d:02:52:be:8f|api.io.mi.com|
1743061077|4e:4f:16:56:48:db|72:8e:22:85:2d:80|www.microsoft.com|Windows NT 10.0; Win64;
1743061078|3e:ca:cd:43:e5:71|f0:83:e7:2a:60:91||iPhone; CPU iPhone OS 17_2_1 like Mac OS X;
1743061079|f6:48:02:9c:60:b1|72:8e:22:85:2d:80|www.icloud.com|iPhone; CPU iPhone OS 17_2_1 like Mac OS X;
1743061080|e0:0a:85:40:5f:53|72:8e:22:85:2d:80|www.apple.com|iOS/17.2.1 Model/iPhone12,1
1743061081|ba:d2:3d:4a:1d:ca|72:8e:22:85:2d:80|www.icloud.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061082|58:f8:e0:7c:38:62|f0:83:e7:2a:60:91|www.microsoft.com|
1743061083|4c:2a:32:55:bf:12|72:8e:22:85:2d:80|www.icloud.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061084|a6:3f:ac:0c:2f:34|f0:83:e7:2a:60:91|account.xiaomi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061085|b4:a6:93:0b:05:4c|42:3d:02:52:be:8f|www.microsoft.com|Windows NT 10.0; Win64;
1743061086|fc:92:10:00:05:80|72:8e:22:85:2d:80|www.microsoft.com|
1743061087|22:7e:9c:77:17:f2|f0:83:e7:2a:60:91|account.xiaomi.com|
1743061088|ec:dc:9b:1c:5f:1f|f0:83:e7:2a:60:91|account.xiaomi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061089|8a:82:41:ba:2f:c7|42:3d:02:52:be:8f|www.microsoft.com|
1743061090|cc:12:77:4b:ba:7c|42:3d:02:52:be:8f||iOS/17.2.1 Model/iPhone12,1
1743061091|a4:2e:79:ae:b7:3e|72:8e:22:85:2d:80|www.microsoft.com|
1743061092|1a:81:f5:4d:2c:38|42:3d:02:52:be:8f||Windows NT 10.0; Win64;
1743061093|6a:b0:8d:a7:d8:92|72:8e:22:85:2d:80|www.apple.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061094|3a:b9:b3:13:b7:04|72:8e:22:85:2d:80|www.icloud.com|
1743061095|26:c8:73:bf:ec:3f|f0:83:e7:2a:60:91|www.icloud.com|iPhone; CPU iPhone OS 17_2_1 like Mac OS X;
1743061096|08:07:1f:56:d7:09|72:8e:22:85:2d:80|www.icloud.com|Macintosh; Intel Mac OS X 10_15_7
1743061097|f2:0e:98:a4:f6:2a|42:3d:02:52:be:8f||Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061098|c2:54:03:22:a6:ae|f0:83:e7:2a:60:91|www.icloud.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061099|00:2c:1c:ba:34:83|f0:83:e7:2a:60:91|api.io.mi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;

;
`;

const logData = logs.split("\n").map((row) => row.split("|"));

// 正则表达式特殊字符转义
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const LogViewer = () => {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 过滤数据
  const filteredData = logData.filter((row) =>
    row.some((cell) => cell.includes(filter)),
  );

  // 搜索条件变化时重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // 分页数据计算
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // 高亮显示匹配文本
  const highlightMatch = (text) => {
    if (!filter) return text;
    const regex = new RegExp(`(${escapeRegExp(filter)})`, "gi");

    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: "#ffeb3b" }}>
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <Paper style={{ padding: 20 }}>
      <TextField
        fullWidth
        label="搜索日志"
        margin="normal"
        value={filter}
        variant="outlined"
        onChange={(e) => setFilter(e.target.value)}
      />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>时间戳</TableCell>
              <TableCell>路由器MAC</TableCell>
              <TableCell>设备MAC</TableCell>
              <TableCell>域名</TableCell>
              <TableCell>UA标识符</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={index}>
                {[0, 2, 1, 3, 4].map((colIndex) => (
                  <TableCell key={colIndex}>
                    {highlightMatch(row[colIndex])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 分页控件 */}
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Pagination
          showFirstButton
          showLastButton
          color="primary"
          count={Math.ceil(filteredData.length / itemsPerPage)}
          // count={1000}
          page={currentPage}
          onChange={(_, page) => setCurrentPage(page)}
        />
      </Box>
    </Paper>
  );
};

export default LogViewer;
