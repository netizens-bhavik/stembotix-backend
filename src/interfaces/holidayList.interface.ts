export interface HolidayList {
  id: string;
  name: string;
  description: string;
  type: string;
}

export interface AllHolidayList {
  totalCount: number;
  records: HolidayList[];
}
