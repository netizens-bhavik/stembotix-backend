import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { deleteFromS3 } from '@/utils/s3/s3Uploads';

class GalleryService {
  public gallery = DB.Gallery;

  public isAdmin(user): boolean {
    return user.role === 'Admin';
  }

  public async createGallery({ user, file }) {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const gallery = await this.gallery.create({
      thumbnail: file.path,
    });
    return gallery;
  }
  public async getGallerybyUser(): Promise<{
    totalCount: number;
    records: object;
  }> {
    const record = await this.gallery.findAndCountAll();
    return { totalCount: record.count, records: record.rows };
  }
  public async getGallerybyId({ user, galleryId }) {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const record = await this.gallery.findOne({
      where: { id: galleryId },
    });
    return record;
  }
  public async getGallerybyAdmin({
    user,
    queryObject,
  }): Promise<{ totalCount: number; records: object }> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;

    const record = await this.gallery.findAndCountAll({
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: record.count, records: record.rows };
  }

  public async updateGallery({
    galleryId,
    user,
    file,
  }): Promise<{ count: number; rows: object }> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const record = await this.gallery.findOne({
      where: {
        id: galleryId,
      },
    });
    if (!record) throw new HttpException(409, 'No data found');
    if (file) {
      const thumbnailLink = record.thumbnail;
      const fileName = thumbnailLink.split('/');
      await deleteFromS3(fileName[3]);

      const updateGallery = await this.gallery.update(
        {
          thumbnail: file?.path,
        },
        {
          where: {
            id: galleryId,
          },
          returning: true,
        }
      );
      return { count: updateGallery[0], rows: updateGallery[1] };
    }
  }

  public async deleteGalleryImage({
    user,
    galleryId,
  }): Promise<{ count: number }> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const record = await this.gallery.findOne({
      where: {
        id: galleryId,
      },
    });
    if (!record) throw new HttpException(409, 'No data found');
    const thumbnailLink = record.thumbnail;
    const fileName = thumbnailLink.split('/');
    await deleteFromS3(fileName[3]);

    const res: number = await this.gallery.destroy({
      where: {
        id: galleryId,
      },
    });
    return { count: res };
  }
}
export default GalleryService;
