
export type Timeline = {
  Decision: string;
  Interview: string;
  Submit: string;
};

export type RecordData = {
  ApplicantID: string;
  Detail: string;
  Final: boolean;
  ProgramID: string;
  ProgramYear: number;
  RecordID: string;
  Season: string;
  Semester: string;
  Status: string;
  TimeLine: Timeline;
};
