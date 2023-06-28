import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { RedisFunctions } from '@/redis';
import { PaymentGateway } from '@/interfaces/paymentGateway.interface';
import { deleteFromS3 } from '@/utils/s3/s3Uploads';
import { Op } from 'sequelize';

class PaymentGatewayService {
  public paymentGateway = DB.PaymentGateway;
  public redisFunctions = new RedisFunctions();

  public isSuperAdmin(user): boolean {
    return user.role === 'SuperAdmin';
  }

  public async addPaymentGateWay(
    gatewayDetails,
    user,
    file
  ): Promise<PaymentGateway> {
    if (!this.isSuperAdmin(user))
      throw new HttpException(403, 'Forbidden Resource');

    const checkData = await this.paymentGateway.findOne({
      where: {
        name: gatewayDetails.name,
      },
    });

    if (checkData) throw new HttpException(409, 'Already Exist');
    const newGateway = await this.paymentGateway.create({
      ...gatewayDetails,
      logo: file.path,
      meta: {
        public_key: gatewayDetails.public_key,
        secret_key: gatewayDetails.secret_key,
      },
    });
    await this.redisFunctions.removeDataFromRedis();
    return newGateway;
  }

  public async getActivePaymentGateways(user): Promise<PaymentGateway> {
    if (!user.isEmailVerified)
      throw new HttpException(403, 'Forbidden Resource');

    const cacheKey = `getActivePaymentGateways:${user.id}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const response = await this.paymentGateway.findOne({
      where: {
        isActive: 1,
      },
    });
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(response));
    return response;
  }

  public async getPaymentGateways(user): Promise<PaymentGateway> {
    if (!this.isSuperAdmin(user))
      throw new HttpException(403, 'Forbidden Resource');
    const cacheKey = `getPaymentGateways:${user.id}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const response = await this.paymentGateway.findAll();
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(response));
    return response;
  }

  public async getPaymentGatewayById(user, gatewayId): Promise<PaymentGateway> {
    if (!this.isSuperAdmin(user))
      throw new HttpException(403, 'Forbidden Resource');
    const cacheKey = `getPaymentGatewayById:${gatewayId}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const response = await this.paymentGateway.findOne({
      where: {
        id: gatewayId,
      },
    });
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(response));
    return response;
  }

  // public async updatePaymentGateways({
  //   gatewayId,
  //   gatewayDetails,
  //   file,
  //   user,
  // }): Promise<{ count: number; rows: PaymentGateway[] }> {
  //   if (!this.isSuperAdmin(user)) {
  //     throw new HttpException(403, 'Forbidden Resource');
  //   }

  //   // Find the currently active gateway
  //   const activeGateway = await this.paymentGateway.findOne({
  //     where: { isActive: 1 },
  //   });

  //   // Deactivate the currently active gateway if it exists and is not the one being updated
  //   if (activeGateway && activeGateway.id !== gatewayId) {
  //     await this.paymentGateway.update(
  //       { isActive: 0 },
  //       { where: { id: activeGateway.id }, returning: true }
  //     );
  //   }

  //   // Retrieve the gateway to be updated
  //   const gatewayToBeUpdated = await this.paymentGateway.findOne({
  //     where: { id: gatewayId },
  //   });

  //   if (!gatewayToBeUpdated) {
  //     throw new HttpException(404, 'Payment Gateway not found');
  //   }
  //   if (parseInt(gatewayDetails.isActive) === 0) {
  //     // Deactivate the gateway
  //     await this.paymentGateway.update(
  //       {
  //         ...gatewayDetails,
  //         meta: {
  //           ...gatewayToBeUpdated.meta,
  //           public_key: gatewayDetails.public_key,
  //           secret_key: gatewayDetails.secret_key,
  //         },
  //         isActive: 0,
  //       },
  //       { where: { id: gatewayId }, returning: true }
  //     );
  //   } else {
  //     // Update the gateway and set isActive to 1
  //     if (file) {
  //       const thumbnailLink = gatewayToBeUpdated.logo;
  //       const fileName = thumbnailLink.split('/');
  //       await deleteFromS3(fileName[3]);

  //       await this.paymentGateway.update(
  //         {
  //           ...gatewayDetails,
  //           logo: file.path,
  //           meta: {
  //             public_key: gatewayDetails.public_key,
  //             secret_key: gatewayDetails.secret_key,
  //           },
  //           isActive: 1, // Set isActive to 1 for the updated gateway
  //         },
  //         {
  //           where: {
  //             id: gatewayId,
  //           },
  //           returning: true,
  //         }
  //       );
  //     } else {
  //       await this.paymentGateway.update(
  //         {
  //           ...gatewayDetails,
  //           meta: {
  //             ...gatewayToBeUpdated.meta,
  //             public_key: gatewayDetails.public_key,
  //             secret_key: gatewayDetails.secret_key,
  //           },
  //           isActive: 1, // Set isActive to 1 for the updated gateway
  //         },
  //         {
  //           where: {
  //             id: gatewayId,
  //           },
  //           returning: true,
  //         }
  //       );
  //     }
  //   }

  //   await this.redisFunctions.removeDataFromRedis();
  //   const updatedGateway = await this.paymentGateway.findByPk(gatewayId);
  //   return { count: 1, rows: [updatedGateway] };
  // }

  // public async updatePaymentGateways({
  //   gatewayId,
  //   gatewayDetails,
  //   file,
  //   user,
  // }): Promise<{ count: number; rows: PaymentGateway[] }> {
  //   if (!this.isSuperAdmin(user)) {
  //     throw new HttpException(403, 'Forbidden Resource');
  //   }

  //   // Find the currently active gateway
  //   const activeGateway = await this.paymentGateway.findOne({
  //     where: { isActive: 1 },
  //   });

  //   // Deactivate the currently active gateway if it exists and is not the one being updated
  //   if (activeGateway && activeGateway.id !== gatewayId) {
  //     await this.paymentGateway.update(
  //       { isActive: 0 },
  //       { where: { id: activeGateway.id }, returning: true }
  //     );
  //   }

  //   // Retrieve the gateway to be updated
  //   const gatewayToBeUpdated = await this.paymentGateway.findOne({
  //     where: { id: gatewayId },
  //   });

  //   if (!gatewayToBeUpdated) {
  //     throw new HttpException(404, 'Payment Gateway not found');
  //   }

  //   const updatedGatewayData: Partial<PaymentGateway> = {
  //     ...gatewayDetails,
  //     meta: {
  //       ...gatewayToBeUpdated.meta, // Retain existing meta field values
  //       public_key: gatewayDetails.public_key,
  //       secret_key: gatewayDetails.secret_key,
  //     },
  //     isActive: parseInt(gatewayDetails.isActive) === 0 ? 0 : 1,
  //   };

  //   if (file) {
  //     const thumbnailLink = gatewayToBeUpdated.logo;
  //     const fileName = thumbnailLink.split('/');
  //     await deleteFromS3(fileName[3]);

  //     updatedGatewayData.logo = file.path;
  //   }

  //   await this.paymentGateway.update(updatedGatewayData, {
  //     where: { id: gatewayId },
  //     returning: true,
  //   });

  //   await this.redisFunctions.removeDataFromRedis();
  //   const updatedGateway = await this.paymentGateway.findByPk(gatewayId);
  //   return { count: 1, rows: [updatedGateway] };
  // }

  public async updatePaymentGateways({
    gatewayId,
    gatewayDetails,
    file,
    user,
  }): Promise<{ count: number; rows: PaymentGateway[] }> {
    if (!this.isSuperAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    // Find the currently active gateway
    const activeGateway = await this.paymentGateway.findOne({
      where: { isActive: 1 },
    });

    // Deactivate the currently active gateway if it exists and is not the one being updated
    if (activeGateway && activeGateway.id !== gatewayId) {
      await this.paymentGateway.update(
        { isActive: 0 },
        { where: { id: activeGateway.id }, returning: true }
      );
    }

    // Retrieve the gateway to be updated
    const gatewayToBeUpdated = await this.paymentGateway.findOne({
      where: { id: gatewayId },
    });

    if (!gatewayToBeUpdated) {
      throw new HttpException(404, 'Payment Gateway not found');
    }

    const updatedGatewayData: Partial<PaymentGateway> = {
      ...gatewayDetails,
      isActive: parseInt(gatewayDetails.isActive) === 0 ? 0 : 1,
      meta: gatewayToBeUpdated.meta, // Retain existing meta field values
    };

    if (file) {
      const thumbnailLink = gatewayToBeUpdated.logo;
      const fileName = thumbnailLink.split('/');
      await deleteFromS3(fileName[3]);

      updatedGatewayData.logo = file.path;
    }

    await this.paymentGateway.update(updatedGatewayData, {
      where: { id: gatewayId },
      returning: true,
    });

    await this.redisFunctions.removeDataFromRedis();
    const updatedGateway = await this.paymentGateway.findByPk(gatewayId);
    return { count: 1, rows: [updatedGateway] };
  }

  public async deletePaymentGateway({
    gatewayId,
    user,
  }): Promise<{ count: number }> {
    if (!this.isSuperAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const gatewayRes = await this.paymentGateway.findOne({
      where: {
        id: gatewayId,
      },
    });
    if (!gatewayRes) throw new HttpException(404, 'Payment gateway Not Found');
    const thumbnailLink = gatewayRes.logo;
    const fileName = thumbnailLink.split('/');
    await deleteFromS3(fileName[3]);
    const res = await this.paymentGateway.destroy({
      where: {
        id: gatewayId,
      },
    });
    if (res === 1) {
      throw new HttpException(200, 'Payment gateway has been deleted');
    }
    await this.redisFunctions.removeDataFromRedis();
    return { count: res };
  }
}
export default PaymentGatewayService;
