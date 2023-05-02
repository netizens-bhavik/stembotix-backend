import { HttpException } from '@/exceptions/HttpException';
import DB from '@databases';
import { BlogTag } from '@interfaces/blogTag.interface';

class BlogTagService {
  public blogTag = DB.BlogTags;
  public blog = DB.Blogs;

  public isAdmin(user): boolean {
    return user.role === 'Admin';
  }

  public async addBlogTags({ tag, user }): Promise<BlogTag> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const tagData = await this.blogTag.findOrCreate({
      where: {
        tag_name: tag.tag_name,
      },
      defaults: {
        ...tag,
        userId: user.id,
      },
    });
    return tagData;
  }

  public async getBlogTagsAdmin(
    queryObject,
    user
  ): Promise<{
    totalCount: number;
    records: (BlogTag | undefined)[];
  }> {
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];
    const tagData = await this.blogTag.findAndCountAll({
      where: DB.Sequelize.and({ deletedAt: null }),
    });

    const data = await this.blogTag.findAndCountAll({
      where: DB.Sequelize.and({
        deletedAt: null,
        tag_name: {
          [searchCondition]: search,
        },
      }),
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: data.count, records: data.rows };
  }

  public async getBlogTags({ user }): Promise<BlogTag[]> {
    const data: (BlogTag | undefined)[] = await this.blogTag.findAll({
      where: DB.Sequelize.and({
        deletedAt: null,
      }),
      // include: {
      //   model: this.blog,
      // },
    });
    return data;
  }

  public async updateBlogTags({
    tagId,
    tags,
    user,
  }): Promise<{ count: number; rows: BlogTag[] }> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const blogData = await this.blogTag.findOne({
      where: {
        id: tagId,
      },
    });
    if (!blogData) throw new HttpException(404, 'No Tags are found');

    const updateData = await this.blogTag.update(
      {
        ...tags,
      },
      {
        where: {
          id: tagId,
        },
        returning: true,
      }
    );
    return { count: updateData[0], rows: updateData[1] };
  }

  public async deleteBlogTag(tagId, user): Promise<{ count: number }> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    // const data = await this.blogTag.findAndCountAll({
    //   where: {
    //     tag_id: tagId,
    //   },
    // });
    // if (data.count !== 0) {
    //   throw new HttpException(
    //     409,
    //     'Tags is already in used please change tag and try again'
    //   );
    // }

    const res: number = await this.blogTag.destroy({
      where: {
        id: tagId,
      },
    });
    if (res === 1)
      throw new HttpException(200, 'Blog Tag Deleted Successfully');
    if (res === 0) throw new HttpException(404, 'No data found');

    return { count: res };
  }
}
export default BlogTagService;
