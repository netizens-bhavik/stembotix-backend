export interface LeaveData {
  id: string;
  Date: Date;
  LeaveReason: string;
  LeaveType: string;
  isApproved: string;
  isInstructor: boolean;
  isStudent: boolean;
  livestreamId: string;
  UserId: string;
}

export interface AddLeaveData {
  Date: Date;
  LeaveReason: string;
  LeaveType: string;
  livestreamId: string;
}
