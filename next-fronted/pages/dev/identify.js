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
1743061486|68-AB-BC-C8-64-70|88-6E-DD-59-61-F5||
1743061887|C8-89-F3-AE-D6-49|88-6E-DD-59-61-F5||
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
          //   count={Math.ceil(filteredData.length / itemsPerPage)}
          count={1000}
          page={currentPage}
          onChange={(_, page) => setCurrentPage(page)}
        />
      </Box>
    </Paper>
  );
};

export default LogViewer;
