export interface LeaveData {
  id: string;
  date: Date;
  leaveReason: string;
  leaveTypeId: string;
  isApproved: string;
  isInstructor: boolean;
  isStudent: boolean;
  livestreamId: string;
  UserId: string;
}

export interface AddLeaveData {
  date: Date;
  leaveReason: string;
  leaveTypeId: string;
  livestreamId: string;
}
