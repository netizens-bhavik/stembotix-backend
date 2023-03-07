export interface HolidayList {
  id: string;
  name: string;
  description: string;
  type: string;
}

export interface Holiday {
  id: string;
  date: Date;
  holidayListId: string;
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
