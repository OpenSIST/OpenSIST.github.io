import { useNavigate } from "react-router-dom";
import './DataPoints.css';
import React from "react";
import { Chip, Tooltip } from "@mui/material";
import { Check } from "@mui/icons-material";
import { RecordStatusPalette, SemesterPalette } from "../../Data/Schemas";
import {BoldTypography, InlineTypography} from "../common";
import ControlPointIcon from "@mui/icons-material/ControlPoint";

/**
 * @typedef {Object} Timeline
 * @property {string} [Decision]
 * @property {string} [Interview]
 * @property {string} [Submit]
 */

/**
 * @typedef {Object} RecordData
 * @property {string} ApplicantID
 * @property {string} Detail
 * @property {boolean} Final
 * @property {string} ProgramID
 * @property {number} ProgramYear
 * @property {string} RecordID
 * @property {string} Season
 * @property {string} Semester
 * @property {string} Status
 * @property {Timeline} TimeLine
 */

/**
 * 最上面的顶栏, 相当于原来的thead
 * @param {{ width: number, style: any }} props
 * @returns {JSX.Element}
 */
function TopStickyRow({width, style}) {
  return (
      <div
          className="p-datatable-header"
          style={{
            display: 'inline-block',
            textAlign: 'start',
            width: `${width}px`,
            verticalAlign: 'middle',
            position: 'sticky',
            top: '0px',
            zIndex: 99,
            height: '40px',
            fontWeight: 'bolder',
            ...style,
          }}
      >
        <Cell item={"申请项目"} width={180}/>
        {/* 申请人 */}
        <Cell item={"申请人"} width={200}/>
        {/* 申请结果 */}
        <Cell item={"申请结果"} width={100}/>
        {/* 最终去向 */}
        <Cell item={"最终去向"} width={100}/>
        {/* 学期 */}
        <Cell item={"申请季"} width={120}/>
        {/*/!* 结果通知时间 *!/*/}
        <Cell item={"结果时间"} width={105}/>
        {/*/!* 面试时间 *!/*/}
        <Cell item={"面试时间"} width={105}/>
        {/*/!* 申请提交时间 *!/*/}
        <Cell item={"申请时间"} width={105}/>
        {/*/!* 备注 *!/*/}
        <Cell item={"备注、补充说明等"} width={300}/>
      </div>
  );
}

/**
 * 相当于原来的Row Group Header, 只有项目名称和添加记录的加号按钮
 * @param {{ record: RecordData, width: number, style: any }} props
 * @returns {JSX.Element}
 */
function StickyRow({record, width, style}) {
  const navigate = useNavigate();
  return (
    <div
      className="p-rowgroup-header"
      style={{
        display: 'inline-block',
        textAlign: 'start',
        width: `${width}px`,
        verticalAlign: 'middle',
        marginTop: '5px',
        marginBottom: '5px',
        position: 'sticky',
        top: '40px',
        zIndex: 10,
        height: '40px',
        ...style,
      }}
    >
      <div style={{verticalAlign: 'middle'}}>
        <InlineTypography component='span' sx={{gap: '0.5rem'}}>
          <BoldTypography sx={{fontSize: 'clamp(14px, 1.5vw, 16px)'}}>{record.ProgramID}</BoldTypography>
          <Tooltip title="添加申请记录" arrow>
            <ControlPointIcon fontSize='0.5rem' onClick={() => navigate(`/profile/new-record`, {
              state: {
                programID: record.ProgramID,
                from: window.location.pathname
              }
            })} sx={{
              cursor: 'pointer',
              "&:hover": {color: (theme) => theme.palette.mode === "dark" ? "#a1a1a1" : "#6b6b6b"}
            }}/>
          </Tooltip>
        </InlineTypography>
      </div>
    </div>
  );
}

/**
 * 普通的一条Cell, 一条Row由多个Cell组成
 * @param {{ item: JSX.Element, width: number, style: any }} props
 * @returns {JSX.Element}
 */
function Cell({item, width, style}) {
  return (
    <div
      style={{
        display: 'inline-block',
        textAlign: 'start',
        width: `${width}px`,
        verticalAlign: 'middle',
        marginTop: '5px',
        marginBottom: '5px',
        ...style,
      }}
    >
      {item}
    </div>
  );
}

/**
 * One row in the table, rendering all the fields of a single RecordData.
 * @param {{ record: RecordData }} props
 * @returns {JSX.Element}
 */
function Row({record}) {
  const navigate = useNavigate();

  /** @param {RecordData} rowData */
  const statusBodyTemplate = (rowData) => {
    return <Chip
        label={rowData.Status}
        color={RecordStatusPalette[rowData.Status]}
        sx={{
          height: {xs: '1.4rem', sm: '1.6rem'},
          width: {xs: '4rem', sm: '4.5rem'},
          fontSize: {xs: '0.7rem', sm: '0.8rem'},
          '& .MuiChip-label': {
            padding: {xs: '0 4px', sm: '0 6px'}
          }
        }}
    />
  };

  /** @param {RecordData} rowData */
  const finalBodyTemplate = (rowData) => {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      {rowData.Final ? <Check color='success' fontSize='small'/> : null}
    </div>
  };

  /** @param {RecordData} rowData */
  const semesterBodyTemplate = (rowData) => {
    return <Chip
        label={`${rowData.ProgramYear}${rowData.Semester}`}
        color={SemesterPalette[rowData.Semester]}
        sx={{
          height: {xs: '1.4rem', sm: '1.6rem'},
          width: {xs: '5rem', sm: '6rem'},
          fontSize: {xs: '0.7rem', sm: '0.8rem'},
          '& .MuiChip-label': {
            padding: {xs: '0 4px', sm: '0 6px'}
          }
        }}
    />
  };

  /**
   * @param {RecordData} rowData
   * @param {string} timelineKey
   */
  const timelineBodyTemplate = (rowData, timelineKey) => {
    return <div style={{fontSize: 'clamp(11px, 1.5vw, 14px)'}}>
      {rowData.TimeLine[timelineKey]?.split('T')[0]}
    </div>
  };

  /** @param {RecordData} rowData */
  const applicantBodyTemplate = (rowData) => {
    return (
        <Tooltip title='查看申请人信息' arrow>
          <Chip
              label={rowData.ApplicantID}
              sx={{
                maxWidth: {xs: "6rem", sm: "8rem"},
                height: {xs: '1.4rem', sm: '1.6rem'},
                fontSize: {xs: '0.7rem', sm: '0.8rem'},
                '& .MuiChip-label': {
                  padding: {xs: '0 6px', sm: '0 8px'}
                }
              }}
              onClick={() => navigate(`/datapoints/applicant/${rowData.ApplicantID}`)}
          />
        </Tooltip>
    )
  };

  /** @param {RecordData} rowData */
  const programBodyTemplate = (rowData) => {
    return (
        <Tooltip title='查看项目描述' arrow>
          <Chip
              label={rowData.ProgramID}
              sx={{
                maxWidth: {xs: "7rem", sm: "9rem"},
                height: {xs: '1.4rem', sm: '1.6rem'},
                fontSize: {xs: '0.7rem', sm: '0.8rem'},
                '& .MuiChip-label': {
                  padding: {xs: '0 6px', sm: '0 8px'}
                }
              }}
              onClick={() => navigate(`/datapoints/program/${encodeURIComponent(rowData.ProgramID)}`)}
          />
        </Tooltip>
    )
  };

  /** @param {RecordData} rowData */
  const detailTemplate = (rowData) => (
    <div style={{fontSize: '14px'}}>
      {rowData.Detail}
    </div>
  )

  return (
    <div className="p-dropdown-item" style={{width: '1315px'}}>
      {/* 项目 */}
      <Cell item={programBodyTemplate(record)} width={180}/>
      {/* 申请人 */}
      <Cell item={applicantBodyTemplate(record)} width={200}/>
      {/* 申请结果 */}
      <Cell item={statusBodyTemplate(record)} width={100}/>
      {/* 最终去向 */}
      <Cell item={finalBodyTemplate(record)} width={100}/>
      {/* 学期 */}
      <Cell item={semesterBodyTemplate(record)} width={120}/>
      {/* 结果通知时间 */}
      <Cell item={timelineBodyTemplate(record, 'Decision')} width={105}/>
      {/* 面试时间 */}
      <Cell item={timelineBodyTemplate(record, 'Interview')} width={105}/>
      {/* 申请提交时间 */}
      <Cell item={timelineBodyTemplate(record, 'Submit')} width={105}/>
      {/* 备注 */}
      <Cell item={detailTemplate(record)} width={300}/>
    </div>
  );
}

/**
 * A scrollable table that groups records by ProgramID.
 * Inserts a StickyCell header each time the ProgramID changes.
 *
 * @param {{ records: RecordData[] }} props
 * @returns {JSX.Element}
 */
export function PlainTable({records}) {
  const resultJsx = [
    <TopStickyRow key="header-topbar" width={1315} />
  ];
  let currentProgramID = '';

  records.forEach((r) => {
    // If a different program name is detected, create a new group header
    if (currentProgramID !== r.ProgramID) {
      currentProgramID = r.ProgramID;
      resultJsx.push(
          <StickyRow key={`header-${r.ProgramID}`} record={r} width={1315}/>
      );
    }
    // A row for this record
    resultJsx.push(<Row key={r.RecordID} record={r}/>);
  });

  return (
      <>
        <div style={{height: '97%', overflowY: 'scroll'}}>
          {resultJsx}
        </div>
      </>
  );
}

