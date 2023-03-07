import DB from '@/databases';
import HolidayList from './data/holiday';

class CreateHolidayList {
  public HolidayList = DB.HolidayList;

  public init = async () => {
    try {
      const res = await this.HolidayList.count();
      if (res !== 0) return;
      await this.HolidayList.bulkCreate(HolidayList);
    } catch (error) {
      return error;
    }
  };
}

export default CreateHolidayList;
