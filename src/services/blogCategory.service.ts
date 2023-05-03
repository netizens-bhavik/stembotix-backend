import { HttpException } from '@/exceptions/HttpException';
import DB from '@databases';
import { BlogCategory } from '@interfaces/blogCategory.interface';

class BlogCategoryService {
  public blogCategory = DB.BlogCategory;
  public blog = DB.Blog;

  public isAdmin(user): boolean {
    return user.role === 'Admin';
  }

  public async addBlogCat({ categoryDetails, user }): Promise<BlogCategory> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const categoryData = await this.blogCategory.findOrCreate({
      where: {
        cat_name: categoryDetails.cat_name,
      },
      defaults: {
        ...categoryDetails,
        userId: user.id,
      },
    });
    return categoryData;
  }

  public async getBlogCatAdmin(
    queryObject,
    user
  ): Promise<{
    totalCount: number;
    records: (BlogCategory[] | undefined)[];
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

    const data: (BlogCategory | undefined)[] =
      await this.blogCategory.findAndCountAll({
        where: DB.Sequelize.and({
          deletedAt: null,
          cat_name: {
            [searchCondition]: search,
          },
        }),
        limit: pageSize,
        offset: pageNo,
        order: [[`${sortBy}`, `${order}`]],
      });
    return { totalCount: data.count, records: data.rows };
  }

  public async getBlogCat({ user }): Promise<BlogCategory[]> {
    const data: (BlogCategory | undefined)[] = await this.blogCategory.findAll({
      where: {
        deletedAt: null,
      },
      include: {
        model: this.blog,
      },
    });
    return data;
  }

  public async updateBlogCat({
    catId,
    categoryDetails,
    user,
  }): Promise<{ count: number; rows: BlogCategory[] }> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const blogData = await this.blogCategory.findOne({
      where: {
        id: catId,
      },
    });
    if (!blogData) throw new HttpException(404, 'No Categories found');

    const updateData = await this.blogCategory.update(
      {
        ...categoryDetails,
      },
      {
        where: {
          id: catId,
        },
        returning: true,
      }
    );
    return { count: updateData[0], rows: updateData[1] };
  }

  public async deleteBlogCat(catId, user): Promise<{ count: number }> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }


    const res: number = await this.blogCategory.destroy({
      where: {
        id: catId,
      },
    });
    if (res === 1)
      throw new HttpException(200, 'Blog Category Deleted Successfully');
    if (res === 0) throw new HttpException(404, 'No data found');

    return { count: res };
  }
}
export default BlogCategoryService;
