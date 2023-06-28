export interface HolidayList {
  id: string;
  name: string;
  description: string;
  type_id: string;
}

export interface AllHolidayList {
  totalCount: number;
  records: HolidayList[];
}
