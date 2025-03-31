// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   TextField,
//   Pagination,
//   Box,
// } from "@mui/material";

// const logs = `112.17.79.156|112.13.97.129|9C-84-B6-CA-26-DE|88-6E-DD-59-61-F5|1743061061|http://meari-hz.oss-cn-hangzhou.aliyuncs.com/alertImage/10388658/14792420/14792420-20250327153734-464271.jpg|PUT /alertImage/10388658/14792420/14792420-20250327153734-464271.jpg HTTP/1.1^^Host: meari-hz.oss-cn-hangzhou.aliyuncs.com^^User-Agent: ppsRequests/0.0.1^^Content-Length: 20286^^Content-Type: application/json^^x-oss-security-token: CAISngN1q6Ft5B2yfSjIr5X7CcmFuJ5rgPqOUxTy1k1gfu1rnPeZmDz2IHhEfHZvBOgdtPk0lWpY5/oflqB6T55OSAmcNZIoLFvhLLb7MeT7oMWQweEuDfTHcDHhhHeZsebWZ+LmNtu/Ht6md1HDkAJq3LL+bk/Mdle5MJqP+74FHtMMRVuRZz1cGPJLIhdjsMYAKUbJMfGkPnyPhXHLXnJ1pi12i2509cbZxdaHuDrThVHdwO0YrJiTR5+/dJtDMYtYWdW41/AMYsin6iNL7AVQ
// 112.17.79.156|112.13.97.129|9C-84-B6-CA-26-DE|88-6E-DD-59-61-F5|1743061062|http://meari-hz.oss-cn-hangzhou.aliyuncs.com/alertImage/10388658/14792420/14792420-20250327153735-464271.jpg|PUT /alertImage/10388658/14792420/14792420-20250327153735-464271.jpg HTTP/1.1^^Host: meari-hz.oss-cn-hangzhou.aliyuncs.com^^User-Agent: ppsRequests/0.0.1^^Content-Length: 20036^^Content-Type: application/json^^x-oss-security-token: CAISngN1q6Ft5B2yfSjIr5X7CcmFuJ5rgPqOUxTy1k1gfu1rnPeZmDz2IHhEfHZvBOgdtPk0lWpY5/oflqB6T55OSAmcNZIoLFvhLLb7MeT7oMWQweEuDfTHcDHhhHeZsebWZ+LmNtu/Ht6md1HDkAJq3LL+bk/Mdle5MJqP+74FHtMMRVuRZz1cGPJLIhdjsMYAKUbJMfGkPnyPhXHLXnJ1pi12i2509cbZxdaHuDrThVHdwO0YrJiTR5+/dJtDMYtYWdW41/AMYsin6iNL7AVQ
// 112.17.79.156|112.13.97.129|9C-84-B6-CA-26-DE|88-6E-DD-59-61-F5|1743061158|http://meari-hz.oss-cn-hangzhou.aliyuncs.com/alertImage/10388658/14792420/14792420-20250327153917-378602.jpg|PUT /alertImage/10388658/14792420/14792420-20250327153917-378602.jpg HTTP/1.1^^Host: meari-hz.oss-cn-hangzhou.aliyuncs.com^^User-Agent: ppsRequests/0.0.1^^Content-Length: 20893^^Content-Type: application/json^^x-oss-security-token: CAISngN1q6Ft5B2yfSjIr5X7CcmFuJ5rgPqOUxTy1k1gfu1rnPeZmDz2IHhEfHZvBOgdtPk0lWpY5/oflqB6T55OSAmcNZIoLFvhLLb7MeT7oMWQweEuDfTHcDHhhHeZsebWZ+LmNtu/Ht6md1HDkAJq3LL+bk/Mdle5MJqP+74FHtMMRVuRZz1cGPJLIhdjsMYAKUbJMfGkPnyPhXHLXnJ1pi12i2509cbZxdaHuDrThVHdwO0YrJiTR5+/dJtDMYtYWdW41/AMYsin6iNL7AVQ
// 112.17.79.156|122.14.229.127|9A-FE-BB-E3-B0-ED|88-6E-DD-59-61-F5|1743061158|http://p3.pstatp.com/large/im-resource/bhntul7moaqg8vskeru0.png|GET /large/im-resource/bhntul7moaqg8vskeru0.png HTTP/1.1^^Host: p3.pstatp.com^^Connection: keep-alive^^x-vc-bdturing-sdk-version: 3.6.2^^User-Agent: Aweme 26.7.0 rv:267014 (iPhone; iOS 17.2.1; zh_CN) Cronet
// 112.17.79.156|112.30.134.108|9A-FE-BB-E3-B0-ED|88-6E-DD-59-61-F5|1743061158|http://sns-na-i1.xhscdn.com/spectrum/1040g34o31fg2vbdk5s005p0jd8l4c8vr8ricqr8?imageView2/2/w/540/format/jpg/q/75%7CimageMogr2/strip&redImage/frame/0&ap=11&sc=HF_PRV|GET /spectrum/1040g34o31fg2vbdk5s005p0jd8l4c8vr8ricqr8?imageView2/2/w/540/format/jpg/q/75%7CimageMogr2/strip&redImage/frame/0&ap=11&sc=HF_PRV HTTP/1.1^^Host: sns-na-i1.xhscdn.com^^X-EXT-XHS-URLRequestInfo: 1^^Connection: keep-alive^^X-XHS-TraceId: 85ec260d27d84c98ac9275ac0e668bb8^^X-XHS-Ext-Failover: 16^^Accept: image/*,*/*;q=0.8^^User-Agent: discover/8.77 (iPhone; iOS 17.2.1; Scale/2.00)^^Referer: https://app.xhs.cn/
// 112.17.79.156|101.35.212.35|9A-FE-BB-E3-B0-ED|88-6E-DD-59-61-F5|1743061158|http://101.35.212.35/d?id=25196&ttl=1&dn=10E759845F9BDD86B905CD57CC2F020BA9877FB09841A01C9E47424E1F8432C521AC8EC02B0082B7FB7D050D4F59CFC2&type=addrs|GET /d?id=25196&ttl=1&dn=10E759845F9BDD86B905CD57CC2F020BA9877FB09841A01C9E47424E1F8432C521AC8EC02B0082B7FB7D050D4F59CFC2&type=addrs HTTP/1.1^^Host: 101.35.212.35^^Accept: */*^^User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 ===  iOS/17.2.1 Model/iPhone12,1 BundleID/com.xunmeng.pinduoduo AppVersion/7.42.0 AppBuild/202501051037 pversion/0
// `;

// const logData = logs.split("\n").map((row) => row.split("|"));

// // 正则表达式特殊字符转义
// const escapeRegExp = (string) => {
//   return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// };

// const LogViewer = () => {
//   const [filter, setFilter] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   // 为需要换行的列添加样式
//   const wrapCellStyle = {
//     whiteSpace: "normal",
//     wordBreak: "break-word",
//     maxWidth: "200px", // 可选：限制最大宽度
//   };
//   // 过滤数据
//   const filteredData = logData.filter((row) =>
//     row.some((cell) => cell.includes(filter)),
//   );

//   // 搜索条件变化时重置页码
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [filter]);

//   // 分页数据计算
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const paginatedData = filteredData.slice(startIndex, endIndex);

//   // 高亮显示匹配文本
//   const highlightMatch = (text) => {
//     if (!filter) return text;
//     const regex = new RegExp(`(${escapeRegExp(filter)})`, "gi");

//     return text.split(regex).map((part, index) =>
//       regex.test(part) ? (
//         <span key={index} style={{ backgroundColor: "#ffeb3b" }}>
//           {part}
//         </span>
//       ) : (
//         part
//       ),
//     );
//   };

//   return (
//     <Paper style={{ padding: 20 }}>
//       <TextField
//         fullWidth
//         label="搜索日志"
//         margin="normal"
//         value={filter}
//         variant="outlined"
//         onChange={(e) => setFilter(e.target.value)}
//       />

//       <TableContainer>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>时间戳</TableCell>
//               <TableCell>设备MAC</TableCell>
//               <TableCell>路由器MAC</TableCell>
//               <TableCell>源 IP</TableCell>
//               <TableCell>目标 IP</TableCell>
//               <TableCell sx={{ maxWidth: "200px" }}>URL</TableCell>
//               <TableCell>payload</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {paginatedData.map((row, index) => (
//               <TableRow key={index}>
//                 {[4, 2, 3, 0, 1, 5, 6].map((colIndex) => (
//                   <TableCell key={colIndex} sx={wrapCellStyle}>
//                     {highlightMatch(row[colIndex])}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* 分页控件 */}
//       <Box display="flex" justifyContent="flex-end" mt={2}>
//         <Pagination
//           showFirstButton
//           showLastButton
//           color="primary"
//           //   count={Math.ceil(filteredData.length / itemsPerPage)}
//           count={1000}
//           page={currentPage}
//           onChange={(_, page) => setCurrentPage(page)}
//         />
//       </Box>
//     </Paper>
//   );
// };

// export default LogViewer;


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

const logs = `1743061051|9C-84-B6-CA-26-DE||88-6E-DD-59-61-F5|112.17.79.156||8.8.8.8||53|A|apis.meari.com.cn|A|47.110.186.157|
1743061052|9C-84-B6-CA-26-DE||88-6E-DD-59-61-F5|112.17.79.156||8.8.8.8||53|A|apis-cn-hangzhou.meari.com.cn|A|47.110.186.157|
1743061053|9C-84-B6-CA-26-DE||88-6E-DD-59-61-F5|112.17.79.156||8.8.8.8||53|A|cnce.mearicloud.cn|A|116.62.66.213|
1743061053|9C-84-B6-CA-26-DE||88-6E-DD-59-61-F5|112.17.79.156||8.8.8.8||53|A|apis-cn-hangzhou.meari.com.cn|A|47.110.186.157|
1743061061|9C-84-B6-CA-26-DE||88-6E-DD-59-61-F5|112.17.79.156||192.168.11.1||53|A|apis-cn-hangzhou.meari.com.cn|A|47.110.186.157|
1743061061|9C-84-B6-CA-26-DE||88-6E-DD-59-61-F5|112.17.79.156||192.168.11.1||53|A|meari-hz.oss-cn-hangzhou.aliyuncs.com|A|112.13.97.129|
1743061062|9C-84-B6-CA-26-DE||88-6E-DD-59-61-F5|112.17.79.156||192.168.11.1||53|A|apis-cn-hangzhou.meari.com.cn|A|47.110.186.157|
1743061158|9C-84-B6-CA-26-DE||88-6E-DD-59-61-F5|112.17.79.156||192.168.11.1||53|A|meari-hz.oss-cn-hangzhou.aliyuncs.com|A|112.13.97.129|
1743061158|9C-84-B6-CA-26-DE||88-6E-DD-59-61-F5|112.17.79.156||192.168.11.1||53|A|apis-cn-hangzhou.meari.com.cn|A|47.110.186.157|`;

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
              <TableCell>设备MAC</TableCell>
              <TableCell>路由器MAC</TableCell>
              <TableCell>源 IP</TableCell>
              <TableCell>目标 IP</TableCell>
              <TableCell>端口</TableCell>
              <TableCell>类型</TableCell>
              <TableCell>域名</TableCell>
              <TableCell>解析 IP</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={index}>
                {[0, 1, 3, 4, 6, 8, 9, 10, 12].map((colIndex) => (
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
