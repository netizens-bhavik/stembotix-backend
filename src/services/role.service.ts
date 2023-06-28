import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { Role } from '@/interfaces/role.instance';
import { RoleDto } from '@/dtos/role.dto';
import { RedisFunctions } from '@/redis';

class RoleService {
  public role = DB.Role;
  public redisFunctions = new RedisFunctions();
  public isTrainer(user): boolean {
    return user.role === 'SuperAdmin';
  }

  public async addRole(roleData: RoleDto): Promise<Role> {
    if (isEmpty(roleData)) throw new HttpException(400, 'roleData is empty');

    const findRole = await this.role.findOne({
      where: {
        role_name: roleData.roleName,
      },
    });
    if (findRole) throw new HttpException(409, 'Already exists');

    const role: Role = await this.role.create(roleData);
    await this.redisFunctions.removeDataFromRedis();
    return role;
  }

  public async viewAllRoles(
    user,
    queryObject
  ): Promise<{ totalCount: number; records: (Role | undefined)[] }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const cacheKey = `viewAllRoles:${sortBy}:${order}:${pageSize}:${pageNo}:${search}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }
    const roleData = await this.role.findAndCountAll({
      where: {
        role_name: {
          [searchCondition]: search,
        },
      },
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: roleData.count,
        records: roleData.rows,
      })
    );
    return { totalCount: roleData.count, records: roleData.rows };
  }
  public async listRoles() {
    const cacheKey = `listRoles`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }
    const roleData = await this.role.findAll();
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(roleData));
    return roleData;
  }
  public async updateRole(
    user,
    roleId,
    roleDetails
  ): Promise<{ count: number; rows: Role[] }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const response = await this.role.findOne({
      where: {
        id: roleId,
      },
    });
    if (!response) throw new HttpException(400, 'No data found');

    const updateRole = await this.role.update(
      { ...roleDetails },
      {
        where: {
          id: roleId,
        },
        returning: true,
      }
    );
    await this.redisFunctions.removeDataFromRedis();
    return { count: updateRole[0], rows: updateRole[1] };
  }
  public async deleteRole(roleId, user): Promise<{ count: number }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const res: number = await this.role.destroy({
      where: {
        id: roleId,
      },
    });
    await this.redisFunctions.removeDataFromRedis();
    if (res === 1) throw new HttpException(200, 'Role Deleted Successfully');
    if (res === 0) throw new HttpException(404, 'No data found');

    return { count: res };
  }
}
export default RoleService;
