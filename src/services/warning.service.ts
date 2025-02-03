import warningRepository from "../repositories/warning.repository";
import { ErrorHandler } from "../utils/response/handleError";
import { IWarningFilter } from "../types/entityfilter";
import { PaginationOptions } from "../utils/pagination";
import { userService } from "./user.service";
import Warning, { WarningStatus } from "../entities/Warning";
import { AppDataSource } from "../config/data-source";
import User from "../entities/User";

const getAllWarnings = async (
  filters?: IWarningFilter,
  paginate?: PaginationOptions,
) => {
  const { warnings, count } = await warningRepository.getAllWarnings(
    filters,
    paginate,
  );
  return { warnings, count };
};

const getWarningsByUserId = async (user_id: string) => {
  const filter: IWarningFilter = { userId: user_id };
  try {
    const { warnings, count } = await warningRepository.getAllWarnings(filter);
    return { warnings, count };
  } catch (error) {
    throw ErrorHandler.internalServerError("Error fetching user warnings");
  }
};

export const warnUser = async (userId: string, data: Partial<Warning>) => {
  try {
    // Fetch the user by ID along with their warnings
    const user = await userService.getUserById(userId);
    if (!user) {
      throw ErrorHandler.notFound("User not found");
    }

    // Validate admin presence
    if (!data.admin || !data.admin.user_id) {
      throw ErrorHandler.badRequest("Admin information is required");
    }

    const admin = await userService.getUserById(data.admin.user_id);
    if (!admin) {
      throw ErrorHandler.notFound("Admin not found");
    }

    // Create and save the warning
    const warning = new Warning();
    warning.user = user;
    warning.reason = data.reason ?? "No reason provided";
    warning.admin = admin;
    warning.status = data.status ?? WarningStatus.ACTIVE;

    const savedWarning = await warningRepository.save(warning);

    // Fetch updated warnings count
    const warningsCount = await warningRepository.count({
      where: { user: { user_id: userId } },
    });

    // Ban user if warnings reach threshold
    if (warningsCount >= 3 && !user.is_banned) {
      await userService.updateUser(user.user_id, { is_banned: true });
    }

    return {
      warning_id: savedWarning.warning_id,
      reason: savedWarning.reason,
      status: savedWarning.status,
      created_at: savedWarning.created_at,
      user: {
        user_id: user.user_id,
        username: user.username,
        warnings_count: warningsCount, // Updated count
        is_banned: user.is_banned,
      },
      admin: {
        user_id: admin.user_id,
        username: admin.username,
      },
    };
  } catch (error) {
    throw ErrorHandler.internalServerError(
      error instanceof Error ? error.message : "Error creating warning",
    );
  }
};

const updateWarning = async (warning_id: string, data: Partial<Warning>) => {
  try {
    // Find the warning by ID
    const warning = await warningRepository.findOne({
      where: { warning_id },
    });
    if (!warning) {
      throw ErrorHandler.notFound("Warning not found");
    }

    Object.keys(data).forEach((key) => {
      if (key in warning) {
        (warning as any)[key] = data[key as keyof typeof data];
      }
    });

    // Save the updated warning
    const updatedWarning = await warningRepository.save(warning);
    return updatedWarning;
  } catch (error) {
    throw ErrorHandler.internalServerError("Error updating warning");
  }
};

const deleteWarning = async (warning_id: string) => {
  try {
    // Find the warning
    const warning = await warningRepository.findOne({
      where: { warning_id },
      relations: ["user"], // Ensure the user relationship is loaded
    });

    if (!warning) {
      throw ErrorHandler.notFound("Warning not found");
    }

    const { user } = warning;

    // Check if the user is banned
    if (user.is_banned === true) {
      // Count active warnings for the user
      const activeWarnings = await warningRepository.count({
        where: { user: { user_id: user.user_id } },
      });

      // If only this warning is present, unban the user
      if (activeWarnings === 1) {
        await userService.updateUser(user.user_id, { is_banned: false }); // Assuming an `updateUserStatus` function exists
      }
    }

    // Soft delete the warning
    await warningRepository.softRemove(warning);

    return { message: "Warning deleted successfully" };
  } catch (error) {
    throw ErrorHandler.internalServerError("Error deleting warning");
  }
};

/** 
  * Ban a user by ID
   @param user_id - The user ID to ban
   @param data - Warning data, including the reason and admin ID
*/
const banUser = async (user_id: string, data: Partial<Warning>) => {
  const dataSource = AppDataSource; // Get your DataSource instance
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.startTransaction(); // Start the transaction

    // Fetch the user by ID
    const user = await queryRunner.manager.findOne(User, {
      where: { user_id },
    });
    if (!user) {
      throw ErrorHandler.notFound("User not found");
    }

    // Validate admin presence
    if (!data.admin || !data.admin.user_id) {
      throw ErrorHandler.badRequest("Admin information is required");
    }

    const admin = await queryRunner.manager.findOne(User, {
      where: { user_id: data.admin.user_id },
    });
    if (!admin) {
      throw ErrorHandler.notFound("Admin not found");
    }

    // Create a warning for the user
    const warning = new Warning();
    warning.user = user;
    warning.reason = data.reason ?? "No reason provided";
    warning.admin = admin;

    const savedWarning = await queryRunner.manager.save(warning);
    if (!savedWarning) {
      throw ErrorHandler.internalServerError("Error creating warning");
    }

    // Ban the user
    user.is_banned = true;
    const savedUser = await queryRunner.manager.save(user);
    if (!savedUser) {
      throw ErrorHandler.internalServerError("Error banning user");
    }

    await queryRunner.commitTransaction(); // Commit the transaction

    return { message: "User banned successfully" };
  } catch (error) {
    // Handle error and rollback if necessary
    await queryRunner.rollbackTransaction(); // Rollback the transaction in case of an error

    if (error instanceof ErrorHandler) {
      throw error; // Re-throw the custom error
    } else {
      throw ErrorHandler.internalServerError(
        error instanceof Error ? error.message : "Error banning user",
      );
    }
  } finally {
    await queryRunner.release(); // Release the query runner
  }
};

/** 
  * Unban a user by ID
   @param user_id - The user ID to unban
   @param admin_id - The admin ID performing the action
*/

const unbanUser = async (user_id: string) => {
  const dataSource = AppDataSource; // Get your DataSource instance
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.startTransaction(); // Start the transaction

    // Fetch the user by ID
    const user = await queryRunner.manager.findOne(User, {
      where: { user_id },
    });
    if (!user) {
      throw ErrorHandler.notFound("User not found");
    }

    // Get user warnings and update the enum to deleted
    const warnings = await queryRunner.manager.find(Warning, {
      where: { user: { user_id } },
    });

    // Update the status of each warning to DELETED
    await Promise.all(
      warnings.map(async (warning) => {
        const updatedWarning = { ...warning, status: WarningStatus.DELETED };
        await queryRunner.manager.save(Warning, updatedWarning);
      }),
    );

    // Unban the user
    user.is_banned = false;
    await queryRunner.manager.save(User, user);

    await queryRunner.commitTransaction(); // Commit the transaction

    return { message: "User unbanned successfully" };
  } catch (error) {
    await queryRunner.rollbackTransaction(); // Rollback the transaction in case of an error

    if (error instanceof ErrorHandler) {
      throw error; // Re-throw the custom error
    } else {
      throw ErrorHandler.internalServerError("Error unbanning user");
    }
  } finally {
    await queryRunner.release(); // Release the query runner
  }
};

export const warningService = {
  getAllWarnings,
  getWarningsByUserId,
  warnUser,
  updateWarning,
  deleteWarning,
  banUser,
  unbanUser,
};
