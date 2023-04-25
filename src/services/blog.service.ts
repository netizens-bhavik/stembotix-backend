import { HttpException } from '@/exceptions/HttpException';
import DB from '@databases';
import { Blog } from '@interfaces/blog.interface';

class BlogService {
  public blog = DB.Blog;

  public isAdmin(user): boolean {
    return user.role === 'Admin';
  }

  public async addBlog({ blogDetails, file, user }): Promise<Blog> {
    console.log(blogDetails);
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    let tag = [];
    blogDetails.tags?.forEach((element) => {
      const obj = {
        tag_id: element,
      };
      tag.push(obj);
    });
    const blogData = await this.blog.create({
      ...blogDetails,
      meta:{
        quote:blogDetails.quote,
        author:blogDetails.author
      },
      thumbnail: file.path,
    });
    return blogData;
  }
}
export default BlogService;
