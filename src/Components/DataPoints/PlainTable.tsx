import React, { useState, FC, CSSProperties, ReactNode } from "react";
import {useLocation, NavigateFunction, useNavigate, Location } from "react-router-dom";
import { Button, Tooltip, Typography, TypographyProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import { Check, ExpandMore } from "@mui/icons-material";
import { BoldTypography } from "../common";
import type { RecordData } from "../../Data/RecordDataType";
import "./DataPoints.css";

export const topStickyRowWidth = "90rem";
export const topStickyRowWidthWithoutProgram = "80rem"
export const stickyHeaderWidth = "90rem";
export const stickyHeaderWidthWithoutProgram = "80rem"
export const columnWidthMap = [
  "10rem", // applicant
  "10rem", // program
  "7rem", // status 申请结果
  "7rem", // final 最终去向
  "8rem", // season 申请季
  "6rem", // timeline - decision
  "6rem", // timeline - interview
  "6rem", // timeline - submit
  "23rem", // detail 备注
];

/** 最上面的顶栏, 相当于原来的<thead> */
export const TopStickyRow: FC<{
  style?: CSSProperties;
  filterElem?: ReactNode;
  insideProgramPage: boolean;
}> = ({ style, filterElem, insideProgramPage }) => {
  const [expanded, setExpanded] = useState(false);

  const ExpandableButton: FC<{
    minWidth: string;
    text: string;
  }> = ({ minWidth, text }) => (
      insideProgramPage ? <BoldTypography sx={{fontSize: "clamp(13px, 1.5vw, 15px)"}}>{text}</BoldTypography> : <Button
          onClick={() => setExpanded(!expanded)}
          color="inherit"
          sx={{
              minWidth,
              justifyContent: "flex-start",
              paddingLeft: "0px",
          }}
      >
          <ExpandMore
              fontSize="small"
              style={{
                  transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: "transform 0.5s ease",
              }}
          />
          <BoldTypography sx={{fontSize: "clamp(13px, 1.5vw, 15px)"}}>{text}</BoldTypography>
      </Button>
  );

  return (
    <div
      className="p-datatable-header"
      style={{
        display: "inline-block",
        textAlign: "start",
        width: insideProgramPage ? topStickyRowWidthWithoutProgram : topStickyRowWidth,
        verticalAlign: "middle",
        position: "sticky",
        top: "0px",
        zIndex: 99,
        height: expanded ? "90px" : "40px",
        fontWeight: "bolder",
        transition: "height 0.5s ease",
        overflowY: "hidden",
        ...style,
      }}
    >
      <div>
        <Cell item={<ExpandableButton minWidth={columnWidthMap[0]} text="申请人" />} width={columnWidthMap[0]}
          style={{marginRight: insideProgramPage ? '5px' : '0px'}}
        />
        {insideProgramPage || <Cell item={<ExpandableButton minWidth={columnWidthMap[1]} text="申请项目" />} width={columnWidthMap[1]} />}
        <Cell item={<ExpandableButton minWidth={columnWidthMap[2]} text="申请结果" />} width={columnWidthMap[2]}
          style={{marginRight: insideProgramPage ? '15px' : '0px'}}
        />
        <Cell item={<ExpandableButton minWidth={columnWidthMap[3]} text="最终去向" />} width={columnWidthMap[3]}
          style={{marginRight: insideProgramPage ? '15px' : '0px'}}
        />
        <Cell item={<ExpandableButton minWidth={columnWidthMap[4]} text="申请季" />} width={columnWidthMap[4]}
          style={{marginRight: insideProgramPage ? '-35px' : '0px'}}
        />
        <Cell item={<BoldTypography sx={{ fontSize: "clamp(13px, 1.5vw, 15px)" }}>结果时间</BoldTypography>} width={columnWidthMap[5]} />
        <Cell item={<BoldTypography sx={{ fontSize: "clamp(13px, 1.5vw, 15px)" }}>面试时间</BoldTypography>} width={columnWidthMap[6]} />
        <Cell item={<BoldTypography sx={{ fontSize: "clamp(13px, 1.5vw, 15px)" }}>申请时间</BoldTypography>} width={columnWidthMap[7]} />
        <Cell item={<BoldTypography sx={{ fontSize: "clamp(13px, 1.5vw, 15px)" }}>备注、补充说明等</BoldTypography>} width={columnWidthMap[8]} />
      </div>
      <div>
        <NoMarginCell item={filterElem} width={insideProgramPage ? topStickyRowWidthWithoutProgram : topStickyRowWidth} />
      </div>
    </div>
  );
};

/** 相当于原来的Row Group Header, 只有项目名称和添加记录的加号按钮 */
const StickyRow: FC<{
  record: RecordData;
  width: string;
  style?: CSSProperties;
}> = ({ record, width, style }) => {
  const navigate = useNavigate();

  const InlineTypography = styled(Typography)<TypographyProps>(() => ({
    display: "inline-flex",
    alignItems: "center",
  }));

  return (
    <div
      className="p-rowgroup-header group-header"
      style={{
        display: "inline-block",
        textAlign: "start",
        minWidth: width,
        verticalAlign: "middle",
        position: "sticky",
        top: "0px",
        zIndex: 10,
        // paddingTop: "10px",
        // height: "40px",  // moved into DataPoints.css
        ...style,
      }}
    >
      <div style={{ verticalAlign: "middle", paddingLeft: "10px" }}>
        <InlineTypography component="span" sx={{ gap: "0.5rem" }}>
          <BoldTypography sx={{ fontSize: "clamp(14px, 1.5vw, 16px)" }}>
            {record.ProgramID}
          </BoldTypography>
          <Tooltip title="添加申请记录" arrow>
            <ControlPointIcon
              fontSize={"0.5rem" as any}
              onClick={() =>
                navigate(`/profile/new-record`, {
                  state: {
                    programID: record.ProgramID,
                    from: window.location.pathname,
                  },
                })
              }
              sx={{
                // fontSize: "0.5rem",
                cursor: "pointer",
                "&:hover": {
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#a1a1a1" : "#6b6b6b",
                },
              }}
            />
          </Tooltip>
        </InlineTypography>
      </div>
    </div>
  );
};

/**
 * 普通的一条Cell, 一条Row由多个Cell组成
 */
const Cell: FC<{
  item: ReactNode;
  width: string;
  style?: CSSProperties;
}> = ({ item, width, style }) => (
  <div
    style={{
      display: "inline-block",
      textAlign: "start",
      width: width,
      verticalAlign: "middle",
      marginTop: "6px",
      marginBottom: "6px",
      paddingLeft: "10px",
      ...style,
    }}
  >
    {item}
  </div>
);

const NoMarginCell: FC<{
  item: ReactNode;
  width: string;
  style?: CSSProperties;
}> = ({ item, width, style }) => (
  <div
    style={{
      display: "inline-block",
      textAlign: "start",
      width: width,
      verticalAlign: "middle",
      ...style,
    }}
  >
    {item}
  </div>
);

/** One row in the table, rendering all the fields of a single RecordData. */
const Row: FC<{ record: RecordData, hideProgramColumn: boolean }> = ({ record, hideProgramColumn }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="p-dropdown-item" style={{ minWidth: hideProgramColumn ? stickyHeaderWidthWithoutProgram : stickyHeaderWidth }}>
      <Cell item={applicantBodyTemplate(record, navigate, location)} width={columnWidthMap[0]}/>
      {hideProgramColumn || <Cell item={programBodyTemplate(record, navigate)} width={columnWidthMap[1]}/>}
      <Cell item={statusBodyTemplate(record)} width={columnWidthMap[2]} />
      <Cell item={finalBodyTemplate(record)} width={columnWidthMap[3]} />
      <Cell item={semesterBodyTemplate(record)} width={columnWidthMap[4]} />
      <Cell item={timelineBodyTemplate(record, "Decision")} width={columnWidthMap[5]} />
      <Cell item={timelineBodyTemplate(record, "Interview")} width={columnWidthMap[6]} />
      <Cell item={timelineBodyTemplate(record, "Submit")} width={columnWidthMap[7]} />
      <Cell item={detailTemplate(record)} width={columnWidthMap[8]} />
    </div>
  );
};

/**
 * @see ./TableLight.css ./TableDark.css
 */
const statusChipColorMap = {
    'Admit': 'chip-status-admit-green',
    'Reject': 'chip-status-reject-red',
    'Waitlist': 'chip-status-waitlist-grey',
    'Defer': 'chip-status-defer-orange',
}

const statusBodyTemplate = (rowData: RecordData) => (
  <div
    className={statusChipColorMap[rowData.Status]}
    style={{
      display: "inline-block",
      borderRadius: "16px",
      padding: "0 10px",
      height: "1.6rem",
      lineHeight: "1.6rem",
      fontSize: "0.8rem",
      minWidth: "4.5rem",
      textAlign: "center",
    }}
  >
    {rowData.Status}
  </div>
);

const finalBodyTemplate = (rowData: RecordData) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {rowData.Final ? <Check color="success" fontSize="small" /> : null}
  </div>
);

/**
 * @see ./TableLight.css ./TableDark.css
 */
const semesterBodyColorMap = {
    'Fall': 'chip-semester-fall-orange',
    'Spring': 'chip-semester-spring-cyan',
    'Summer': 'chip-semester-spring-cyan',
    'Winter': 'chip-semester-spring-cyan',
}

const semesterBodyTemplate = (rowData: RecordData) => (
  <div
    className={semesterBodyColorMap[rowData.Semester]}
    style={{
      display: "inline-block",
      color: 'white',
      borderRadius: "16px",
      padding: "0 10px",
      height: "1.6rem",
      lineHeight: "1.6rem",
      fontSize: "0.8rem",
      minWidth: "6rem",
      textAlign: "center",
    }}
  >
    {`${rowData.ProgramYear}${rowData.Semester}`}
  </div>
);

const timelineBodyTemplate = (rowData: RecordData, timelineKey: string) => (
  <div style={{ fontSize: "clamp(11px, 1.5vw, 14px)" }}>
    {
      // @ts-expect-error
      rowData.TimeLine[timelineKey]?.split("T")[0]
    }
  </div>
);

const applicantBodyTemplate = (rowData: RecordData, navigate: NavigateFunction, location: Location) => {
    const handleClick = () => {
        const pathname = location.pathname.split("?")[0];
        navigate(`${pathname}/applicant/${rowData.ApplicantID}`);
    };
    return (
        <div
            title="查看申请人信息"
            className="chip-plain"
            style={{
                display: "block",
                borderRadius: "16px",
                padding: "0 10px",
                height: "1.6rem",
                lineHeight: "1.6rem",
                fontSize: "0.8rem",
                maxWidth: "8rem",
                width: "fit-content",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}
            onClick={handleClick}
        >
            {rowData.ApplicantID}
        </div>
    )
};

const programBodyTemplate = (rowData: RecordData, navigate: NavigateFunction) => (
  <div
    title="查看项目描述"
    className="chip-plain"
    style={{
      display: "block",
      borderRadius: "16px",
      padding: "0 10px",
      height: "1.6rem",
      lineHeight: "1.6rem",
      fontSize: "0.8rem",
      maxWidth: "9rem",
      width: "fit-content",
      cursor: "pointer",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }}
    onClick={() =>
      navigate(
        `/datapoints/program/${encodeURIComponent(rowData.ProgramID)}`
      )
    }
  >
    {rowData.ProgramID}
  </div>
);

const detailTemplate = (rowData: RecordData) => (
  <div
    style={{
      fontSize: "14px",
      // 用于解决detail备注过长也不会自动换行的问题
      // 写成inline style是为了防止被TableLight.css,TableDark.css里的 whiteSpace: nowrap 覆盖.
      whiteSpace: "normal",
    }}
  >
    {rowData.Detail}
  </div>
);

/**
 * A scrollable table that groups records by ProgramID.
 * Inserts a StickyCell header each time the ProgramID changes.
 */
export const PlainTable: FC<{
  records: RecordData[];
  insideProgramPage: boolean;
}> = ({ records, insideProgramPage }) => {
  if (records.length === 0) {
    return <div style={{ textAlign: "center" }}>未找到任何匹配结果</div>;
  }

  const resultJsx: ReactNode[] = [];
  let currentProgramID = "";

  records.forEach((r) => {
    // If a different program name is detected, create a new group header
    if (!insideProgramPage && currentProgramID !== r.ProgramID) {
      currentProgramID = r.ProgramID;
      resultJsx.push(
        <StickyRow
          // key={`header-${r.ProgramID}-${Date.now()}`}
          record={r}
          width={insideProgramPage ? stickyHeaderWidthWithoutProgram : stickyHeaderWidth}
          key={r.ProgramID}
        />
      );
    }
    // A row for this record
    resultJsx.push(<Row 
      // key={r.RecordID+Date.now()} 
      record={r}
      hideProgramColumn={insideProgramPage}
      key={r.RecordID}
      />);
  });

  return (
    <div
      style={{
        height: "100%",
        width: insideProgramPage ? topStickyRowWidthWithoutProgram : topStickyRowWidth,
        overflowY: "scroll",
        overflowX: "hidden",
        scrollbarWidth: "none",
      }}
    >
      {resultJsx}
      <div style={{
        height: insideProgramPage ? '50px' : '110px',
        // backgroundColor: "rgba(128, 128, 128, 0.1)",  // git blame: @caoster (bushi
      }}></div>
    </div>
  );
};
