
export type Timeline = {
  Decision: string | null;
  Interview: string | null;
  Submit: string | null;
};

export type RecordData = {
  ApplicantID: string;
  Detail: string;
  Final: boolean;
  ProgramID: string;
  ProgramYear: number;
  RecordID: string;
  Season: string;
  Semester: 'Fall' | 'Spring' | 'Summer' | 'Winter';
  Status: 'Admit' | 'Reject' | 'Defer' | 'Waitlist';
  TimeLine: Timeline;
};
