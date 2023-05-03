import { HttpException } from '@/exceptions/HttpException';
import { deleteFromS3 } from '@/utils/s3/s3Uploads';
import DB from '@databases';
import { Blog } from '@interfaces/blog.interface';

class BlogService {
  public blog = DB.Blog;
  public blogCategory = DB.BlogCategory;
  public blogTag = DB.BlogTags;
  public user = DB.User;

  public isAdmin(user): boolean {
    return user.role === 'Admin';
  }

  public async addBlog({ blogDetails, file, user }): Promise<Blog> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    let tag = [];
    blogDetails.tags?.forEach((element) => {
      tag.push(element);
    });
    const blogData = await this.blog.create({
      ...blogDetails,
      meta: {
        quote: blogDetails.quote,
        author: blogDetails.author,
      },
      blogCatId: blogDetails.blog_cat_id,
      userId: user.id,
      thumbnail: file.path,
    });
    blogData.addBlogTags(tag);
    return blogData;
  }

  public async getBlog({ user }): Promise<Blog[]> {
    const response = await this.blog.findAll({
      where: {
        deletedAt: null,
      },
      include: [
        {
          model: this.user,
        },
        {
          model: this.blogCategory,
        },
        {
          model: this.blogTag,
          through: { attributes: [] },
        },
      ],
    });
    return response;
  }
  public async getBlogAdmin({
    queryObject,
    user,
  }): Promise<{ totalCount: number; records: (Blog | undefined)[] }> {
    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;

    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const response = await this.blog.findAndCountAll({
      where: {
        deletedAt: null,
      },
      include: [
        {
          model: this.user,
          where: DB.Sequelize.and(
            DB.Sequelize.or(
              { firstName: { [searchCondition]: search } },
              { lastName: { [searchCondition]: search } }
            )
          ),
          attributes: ['firstName', 'lastName'],
        },
        {
          model: this.blogCategory,
          attributes: ['id', 'cat_name'],
        },
        {
          model: this.blogTag,
        },
      ],
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: response.count, records: response.rows };
  }
  public async getBlogbyId({ blogId, user }) {
    const data = await this.blog.findOne({
      where: {
        id: blogId,
      },
      include: {
        model: this.blogTag,
      },
    });
    return data;
  }
  public async updateBlog({ blogId, blogDetails, file, user }): Promise<Blog> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    let tag = [];
    blogDetails.tags?.forEach((element) => {
      tag.push(element);
    });
    const blogRes = await this.blog.findByPk(blogId, {
      include: this.blogTag,
    });

    await blogRes.setBlogTags(tag);
    if (file) {
      const thumbnailLink = blogRes.thumbnail;
      const fileName = thumbnailLink.split('/');
      await deleteFromS3(fileName[3]);
    }
    const blogData = await this.blog.update(
      {
        ...blogDetails,
        meta: {
          quote: blogDetails.quote,
          author: blogDetails.author,
        },
        blogCatId: blogDetails.blog_cat_id,
        thumbnail: file?.path,
      },
      {
        where: {
          id: blogId,
        },
        returning: true,
      }
    );
    return blogData;
  }

  public async deleteBlog({ blogId, user }): Promise<{ count: number }> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const blogRes = await this.blog.findOne({
      where: {
        id: blogId,
      },
    });
    if (!blogRes) throw new HttpException(404, 'Blog Not Found');
    const thumbnailLink = blogRes.thumbnail;
    const fileName = thumbnailLink.split('/');
    await deleteFromS3(fileName[3]);
    const res = await this.blog.destroy({
      where: {
        id: blogId,
      },
    });
    if (res === 1) {
      throw new HttpException(200, 'Blog has been deleted');
    }
    return { count: res };
  }
}
export default BlogService;
