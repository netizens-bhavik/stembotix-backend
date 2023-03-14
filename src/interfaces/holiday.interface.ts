export interface HolidayList {
  id: string;
  name: string;
  description: string;
  type: string;
}

export interface createHolidayData {
  id: string;
  date: Date;
  holidayListId: string;
  instituteId: string;
}

export interface HolidaywithDetails {
  id: string;
  date: Date;
  holidayListId: string;
  holiday: HolidayList;
}

export interface AllHolidaywithDetails {
  totalCount: number;
  records: HolidaywithDetails[];
}
