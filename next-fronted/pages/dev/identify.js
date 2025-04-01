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

const logs = `1743061051|9C-84-B6-CA-26-DE|88-6E-DD-59-61-F5|apis.meari.com.cn|
1743061052|9C-84-B6-CA-26-DE|88-6E-DD-59-61-F5|apis-cn-hangzhou.meari.com.cn|
1743061053|9C-84-B6-CA-26-DE|88-6E-DD-59-61-F5|cnce.mearicloud.cn|
1743061053|9C-84-B6-CA-26-DE|88-6E-DD-59-61-F5|apis-cn-hangzhou.meari.com.cn|
1743061061|9C-84-B6-CA-26-DE|88-6E-DD-59-61-F5|apis-cn-hangzhou.meari.com.cn|
1743061061|9C-84-B6-CA-26-DE|88-6E-DD-59-61-F5|meari-hz.oss-cn-hangzhou.aliyuncs.com|
1743061062|9C-84-B6-CA-26-DE|88-6E-DD-59-61-F5|apis-cn-hangzhou.meari.com.cn|
1743061158|9C-84-B6-CA-26-DE|88-6E-DD-59-61-F5|meari-hz.oss-cn-hangzhou.aliyuncs.com|
1743061158|9C-84-B6-CA-26-DE|88-6E-DD-59-61-F5|apis-cn-hangzhou.meari.com.cn|
1743061062|9C-84-B6-CA-26-DE|88-6E-DD-59-61-F5|apis-cn-hangzhou.meari.com.cn|
1743061174|9A-FE-BB-E3-B0-ED|88-6E-DD-59-61-F5||iPhone; iOS 17.2.1;
1743061174|9A-FE-BB-E3-B0-ED|88-6E-DD-59-61-F5||iPhone; CPU iPhone OS 17_2_1 like Mac OS X;
1743061210|9A-FE-BB-E3-B0-ED|88-6E-DD-59-61-F5||iOS/17.2.1 Model/iPhone12,1
1743061210|9A-FE-BB-E3-B0-ED|88-6E-DD-59-61-F5|www.icloud.com|
1743061486|68-AB-BC-C8-64-70|88-6E-DD-59-61-F5||
1743061887|C8-89-F3-AE-D6-49|88-6E-DD-59-61-F5||
1743061000|6E-67-82-73-85-BA|72-8E-22-85-2D-80|www.apple.com|
1743061001|F6-CA-71-BB-22-E2|72-8E-22-85-2D-80|account.xiaomi.com|
1743061002|EC-73-4A-29-8A-04|F0-83-E7-2A-60-91|www.icloud.com|
1743061003|86-76-B1-72-EB-56|42-3D-02-52-BE-8F|www.microsoft.com|Windows NT 10.0; Win64;
1743061004|7E-14-B4-23-41-6F|F0-83-E7-2A-60-91|account.xiaomi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061005|86-4C-4F-DA-BC-C7|42-3D-02-52-BE-8F|www.icloud.com|iOS/17.2.1 Model/iPhone12,1
1743061006|AE-33-90-E8-4D-41|72-8E-22-85-2D-80|www.apple.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061007|C8-B7-CB-F5-89-05|42-3D-02-52-BE-8F|account.xiaomi.com|
1743061008|28-DB-DF-50-64-1D|42-3D-02-52-BE-8F|www.microsoft.com|Windows NT 10.0; Win64;
1743061009|32-CA-86-47-87-2A|42-3D-02-52-BE-8F|www.icloud.com|iOS/17.2.1 Model/iPhone12,1
1743061010|2C-72-81-47-A6-D7|72-8E-22-85-2D-80|www.microsoft.com|Windows NT 10.0; Win64;
1743061011|2C-24-A1-1D-3A-6A|72-8E-22-85-2D-80||Windows NT 10.0; Win64;
1743061012|5E-30-6A-3B-D9-22|72-8E-22-85-2D-80|www.icloud.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061013|CE-79-F3-36-08-BD|72-8E-22-85-2D-80|www.microsoft.com|Windows NT 10.0; Win64;
1743061014|6A-9A-0C-A7-2F-88|42-3D-02-52-BE-8F|www.microsoft.com|
1743061015|8A-56-9E-52-77-C5|F0-83-E7-2A-60-91|www.icloud.com|iPhone; CPU iPhone OS 17_2_1 like Mac OS X;
1743061016|0C-69-DD-FA-1D-0C|72-8E-22-85-2D-80||Macintosh; Intel Mac OS X 10_15_7
1743061017|FC-D1-58-06-91-9F|F0-83-E7-2A-60-91|www.microsoft.com|Windows NT 10.0; Win64;
1743061018|9C-D4-C9-1E-61-28|42-3D-02-52-BE-8F|api.io.mi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061019|A8-08-8D-5F-3D-34|F0-83-E7-2A-60-91|account.xiaomi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061020|3A-30-60-69-8F-6E|42-3D-02-52-BE-8F|www.microsoft.com|Windows NT 10.0; Win64;
1743061021|20-B3-49-25-3E-44|72-8E-22-85-2D-80|www.microsoft.com|Windows NT 10.0; Win64;
1743061022|90-C4-74-44-FE-45|F0-83-E7-2A-60-91|www.apple.com|iPhone; iOS 17.2.1;
1743061023|B4-15-97-98-33-BF|72-8E-22-85-2D-80|www.apple.com|iPhone; iOS 17.2.1;
1743061024|EA-F6-F9-E4-67-B2|72-8E-22-85-2D-80|www.microsoft.com|Windows NT 10.0; Win64;
1743061025|D0-64-FB-8F-22-43|72-8E-22-85-2D-80|account.xiaomi.com|
1743061026|88-BD-1D-4D-A8-0E|42-3D-02-52-BE-8F||
1743061027|24-0E-6F-2A-79-53|42-3D-02-52-BE-8F|www.microsoft.com|
1743061028|34-6E-67-EA-17-2D|42-3D-02-52-BE-8F|www.icloud.com|iPhone; iOS 17.2.1;
1743061029|92-CB-38-BD-19-4C|72-8E-22-85-2D-80|www.microsoft.com|
1743061030|C0-BD-EA-9F-FA-31|F0-83-E7-2A-60-91||
1743061031|0E-ED-10-86-1C-A7|F0-83-E7-2A-60-91||Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061032|16-D3-C6-BB-DD-26|72-8E-22-85-2D-80|www.microsoft.com|Windows NT 10.0; Win64;
1743061033|58-ED-48-63-72-B4|42-3D-02-52-BE-8F||iPhone; CPU iPhone OS 17_2_1 like Mac OS X;
1743061034|EA-B6-B3-76-BD-C4|72-8E-22-85-2D-80|api.io.mi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061035|F0-92-7C-27-99-2E|F0-83-E7-2A-60-91||Windows NT 10.0; Win64;
1743061036|F8-3A-A3-5F-34-C3|F0-83-E7-2A-60-91||iPhone; CPU iPhone OS 17_2_1 like Mac OS X;
1743061037|40-27-DB-65-B3-4A|F0-83-E7-2A-60-91||Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061038|AA-A5-1B-A0-12-D0|F0-83-E7-2A-60-91|www.apple.com|iPhone; iOS 17.2.1;
1743061039|74-B7-98-45-2E-4B|F0-83-E7-2A-60-91|www.icloud.com|Macintosh; Intel Mac OS X 10_15_7
1743061040|3E-EF-88-2B-69-D3|42-3D-02-52-BE-8F||
1743061041|B6-6F-2B-AD-45-78|42-3D-02-52-BE-8F|www.microsoft.com|
1743061042|20-58-12-F0-99-E5|42-3D-02-52-BE-8F|www.apple.com|
1743061043|88-5D-C7-44-77-6A|42-3D-02-52-BE-8F|account.xiaomi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061044|0C-7A-AE-9E-3F-D1|F0-83-E7-2A-60-91|www.icloud.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061045|8A-9A-AD-14-A6-E7|F0-83-E7-2A-60-91|account.xiaomi.com|
1743061046|44-48-AD-6B-B3-1A|F0-83-E7-2A-60-91|www.microsoft.com|
1743061047|CC-99-3C-96-E2-2A|F0-83-E7-2A-60-91|www.microsoft.com|Windows NT 10.0; Win64;
1743061048|76-AA-A8-D9-82-B5|72-8E-22-85-2D-80||Windows NT 10.0; Win64;
1743061049|56-A4-31-36-8F-AE|F0-83-E7-2A-60-91||
1743061050|90-94-89-DA-0E-DD|72-8E-22-85-2D-80|www.microsoft.com|Windows NT 10.0; Win64;
1743061051|5A-9B-57-52-5A-1B|72-8E-22-85-2D-80|account.xiaomi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061052|52-FD-65-E0-89-91|72-8E-22-85-2D-80||Windows NT 10.0; Win64;
1743061053|54-26-75-52-49-EC|42-3D-02-52-BE-8F|www.icloud.com|
1743061054|32-C0-C1-25-85-37|42-3D-02-52-BE-8F|account.xiaomi.com|
1743061055|04-33-B2-8B-C9-14|72-8E-22-85-2D-80|account.xiaomi.com|
1743061056|30-A4-EE-1F-96-87|42-3D-02-52-BE-8F|www.icloud.com|iOS/17.2.1 Model/iPhone12,1
1743061057|D4-74-6F-F3-F8-5C|42-3D-02-52-BE-8F|www.apple.com|iPhone; iOS 17.2.1;
1743061058|2C-73-11-E5-B7-97|F0-83-E7-2A-60-91|www.microsoft.com|Windows NT 10.0; Win64;
1743061059|70-2D-B6-AE-4D-4F|72-8E-22-85-2D-80|api.io.mi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061060|7E-B5-71-01-3B-F2|42-3D-02-52-BE-8F|www.icloud.com|iPhone; CPU iPhone OS 17_2_1 like Mac OS X;
1743061061|46-33-89-58-60-F4|72-8E-22-85-2D-80|www.microsoft.com|Windows NT 10.0; Win64;
1743061062|E6-52-40-F3-C0-51|72-8E-22-85-2D-80|www.apple.com|
1743061063|22-69-59-75-7A-9D|F0-83-E7-2A-60-91|www.apple.com|Macintosh; Intel Mac OS X 10_15_7
1743061064|46-A1-9C-DA-7F-B0|72-8E-22-85-2D-80|www.icloud.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061065|46-96-8D-F5-53-10|42-3D-02-52-BE-8F|www.microsoft.com|Windows NT 10.0; Win64;
1743061066|DA-E3-22-89-A5-87|72-8E-22-85-2D-80||Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061067|8A-E5-1C-8C-7C-8C|42-3D-02-52-BE-8F||Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061068|5A-3B-23-66-EA-19|F0-83-E7-2A-60-91||Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061069|4E-78-4F-EE-CE-E7|42-3D-02-52-BE-8F|account.xiaomi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061070|08-5F-6E-1F-DD-9E|72-8E-22-85-2D-80|www.microsoft.com|
1743061071|0A-DF-25-13-A8-F9|F0-83-E7-2A-60-91|www.apple.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061072|6E-C5-C6-F0-54-88|72-8E-22-85-2D-80||Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061073|44-76-88-BD-11-A1|F0-83-E7-2A-60-91||Windows NT 10.0; Win64;
1743061074|18-C7-DC-B0-D4-67|F0-83-E7-2A-60-91|www.apple.com|Macintosh; Intel Mac OS X 10_15_7
1743061075|80-D9-14-F0-AF-A6|42-3D-02-52-BE-8F|account.xiaomi.com|
1743061076|F4-6C-E7-64-BC-60|42-3D-02-52-BE-8F|api.io.mi.com|
1743061077|4E-4F-16-56-48-DB|72-8E-22-85-2D-80|www.microsoft.com|Windows NT 10.0; Win64;
1743061078|3E-CA-CD-43-E5-71|F0-83-E7-2A-60-91||iPhone; CPU iPhone OS 17_2_1 like Mac OS X;
1743061079|F6-48-02-9C-60-B1|72-8E-22-85-2D-80|www.icloud.com|iPhone; CPU iPhone OS 17_2_1 like Mac OS X;
1743061080|E0-0A-85-40-5F-53|72-8E-22-85-2D-80|www.apple.com|iOS/17.2.1 Model/iPhone12,1
1743061081|BA-D2-3D-4A-1D-CA|72-8E-22-85-2D-80|www.icloud.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061082|58-F8-E0-7C-38-62|F0-83-E7-2A-60-91|www.microsoft.com|
1743061083|4C-2A-32-55-BF-12|72-8E-22-85-2D-80|www.icloud.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061084|A6-3F-AC-0C-2F-34|F0-83-E7-2A-60-91|account.xiaomi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061085|B4-A6-93-0B-05-4C|42-3D-02-52-BE-8F|www.microsoft.com|Windows NT 10.0; Win64;
1743061086|FC-92-10-00-05-80|72-8E-22-85-2D-80|www.microsoft.com|
1743061087|22-7E-9C-77-17-F2|F0-83-E7-2A-60-91|account.xiaomi.com|
1743061088|EC-DC-9B-1C-5F-1F|F0-83-E7-2A-60-91|account.xiaomi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061089|8A-82-41-BA-2F-C7|42-3D-02-52-BE-8F|www.microsoft.com|
1743061090|CC-12-77-4B-BA-7C|42-3D-02-52-BE-8F||iOS/17.2.1 Model/iPhone12,1
1743061091|A4-2E-79-AE-B7-3E|72-8E-22-85-2D-80|www.microsoft.com|
1743061092|1A-81-F5-4D-2C-38|42-3D-02-52-BE-8F||Windows NT 10.0; Win64;
1743061093|6A-B0-8D-A7-D8-92|72-8E-22-85-2D-80|www.apple.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061094|3A-B9-B3-13-B7-04|72-8E-22-85-2D-80|www.icloud.com|
1743061095|26-C8-73-BF-EC-3F|F0-83-E7-2A-60-91|www.icloud.com|iPhone; CPU iPhone OS 17_2_1 like Mac OS X;
1743061096|08-07-1F-56-D7-09|72-8E-22-85-2D-80|www.icloud.com|Macintosh; Intel Mac OS X 10_15_7
1743061097|F2-0E-98-A4-F6-2A|42-3D-02-52-BE-8F||Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;
1743061098|C2-54-03-22-A6-AE|F0-83-E7-2A-60-91|www.icloud.com|iPad; CPU OS 16_4_1 like Mac OS X
1743061099|00-2C-1C-BA-34-83|F0-83-E7-2A-60-91|api.io.mi.com|Xiaomi/Redmi Note 8 Pro Build/QKQ1.200114.002;

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
