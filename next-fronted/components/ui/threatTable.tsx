import React from "react";
import { Link } from "@nextui-org/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  IconButton,
  Collapse,
  Box,
  Typography,
} from "@mui/material";
import { Paper } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import copy from "copy-to-clipboard";

import { MyLinkIcon, VTLogo, XLogo } from "../icons";

const truncateText = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }

  return text;
};

function Row(props: { record: any }) {
  const { record } = props;
  const [open, setOpen] = React.useState(false);

  function BaseRow({
    ioc,
    index,
    span = 1, // 设置默认值为 1
    expand = false, // 设置默认值为 false
  }: {
    ioc: any;
    index: any;
    span?: number; // span 可选，类型为 number
    expand?: boolean; // expand 可选，类型为 boolean
  }) {
    // 传入当前行的IOC值进行复制
    const handleCopy = (ioc: any) => {
      copy(ioc); // 复制ioc的值
      alert("复制成功");
    };

    return (
      <TableRow key={index}>
        {/* 合并单元格逻辑 */}
        <TableCell
          style={{
            maxWidth: "150px",
            whiteSpace: "normal", // 允许换行
            overflow: "hidden",
            wordWrap: "break-word", // 允许长单词换行
          }}
        >
          {ioc.IOC}
          <IconButton
            size="small"
            style={{ fontSize: "12px", color: "#B0B0B0" }} // 设置浅灰色
            onClick={() => handleCopy(ioc.IOC)}
          >
            <FileCopyIcon fontSize="inherit" />
          </IconButton>
          <Link
            href={`https://www.virustotal.com/gui/search/${ioc.IOC}`}
            target="_blank"
          >
            <IconButton size="small" style={{ fontSize: "12px" }}>
              <VTLogo fontSize="inherit" />
            </IconButton>
          </Link>
        </TableCell>
        <TableCell>{ioc.类型}</TableCell>
        <TableCell>{ioc.端口}</TableCell>
        <TableCell>{ioc.威胁等级}</TableCell>
        <TableCell>{ioc.威胁类型}</TableCell>
        <TableCell>{ioc.组织}</TableCell>
        <TableCell>{ioc.家族}</TableCell>
        <TableCell>{ioc.攻击时间}</TableCell>
        <TableCell>{ioc.发表时间}</TableCell>

        {/* Source, APT, 欧美, insertedAt */}
        {index === 0 && (
          <>
            <TableCell rowSpan={span}>
              <Link
                isExternal
                showAnchorIcon
                href={
                  record.source.startsWith("tweet") ||
                  record.source.startsWith("profile-conversation")
                    ? `/api/x?x_id=${record.source}`
                    : record.url.startsWith("http") ||
                        record.url.startsWith("https")
                      ? record.url
                      : "#"
                }
              >
                {/* <p className="text-small">{truncateText(record.source, 15)}</p> */}
                {record.source.startsWith("tweet") ||
                record.source.startsWith("profile-conversation") ? (
                  <IconButton size="small" style={{ fontSize: "12px" }}>
                    <XLogo fontSize="inherit" />
                  </IconButton>
                ) : (
                  <MyLinkIcon height={15} width={15} />
                )}
              </Link>
            </TableCell>
            <TableCell rowSpan={span}>
              {record.extractionResult.data.APT}
            </TableCell>
            <TableCell rowSpan={span}>
              {record.extractionResult.data.欧美}
            </TableCell>
            <TableCell rowSpan={span}>
              {new Date(record.insertedAt)
                .toISOString()
                .slice(0, 19)
                .replace("T", " ")}
            </TableCell>
            {expand ? (
              <>
                <TableCell>
                  <IconButton
                    aria-label="expand row"
                    size="small"
                    onClick={() => setOpen(!open)}
                  >
                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                  {record.extractionResult.data.iocs.length}+
                </TableCell>
              </>
            ) : (
              <TableCell rowSpan={span} />
            )}
          </>
        )}
      </TableRow>
    );
  }

  if (record.extractionResult.data.iocs.length < 6) {
    return (
      <React.Fragment>
        {record.extractionResult.data.iocs.map((ioc: any, index: any) => (
          <BaseRow
            key={index}
            index={index}
            ioc={ioc}
            span={record.extractionResult.data.iocs.length}
          />
        ))}
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <BaseRow
          expand={true}
          index={0}
          ioc={record.extractionResult.data.iocs[0]}
        />

        <TableRow>
          <TableCell colSpan={14} style={{ paddingBottom: 0, paddingTop: 0 }}>
            <Collapse unmountOnExit in={open} timeout="auto">
              <Box sx={{ margin: 1 }}>
                <Typography gutterBottom component="div" variant="h6">
                  More
                </Typography>
                <Table aria-label="more" size="small">
                  <TableBody>
                    {record.extractionResult.data.iocs.map(
                      (ioc: any, index: any) => (
                        <BaseRow
                          key={index}
                          index={index}
                          ioc={ioc}
                          span={record.extractionResult.data.iocs.length}
                        />
                      ),
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }
}

const ThreatTable = ({ threats }: any) => {
  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>IOC</TableCell>
              <TableCell>类型</TableCell>
              <TableCell>端口</TableCell>
              <TableCell>威胁等级</TableCell>
              <TableCell>威胁类型</TableCell>
              <TableCell>组织</TableCell>
              <TableCell>家族</TableCell>
              <TableCell>攻击时间</TableCell>
              <TableCell>发表时间</TableCell>
              <TableCell>source</TableCell>
              <TableCell>APT</TableCell>
              <TableCell>欧美</TableCell>
              <TableCell>插入时间</TableCell>
              <TableCell>更多</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(threats as any).map((record: any, index: any) => {
              return <Row key={index} record={record} />;
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ThreatTable;
