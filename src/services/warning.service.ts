import warningRepository from "../repositories/warning.repository";
import { ErrorHandler } from "../utils/response/handleError";
import { IWarningFilter } from "../types/entityfilter";
import { PaginationOptions } from "../utils/pagination";
import { userService } from "./user.service";
import Warning from "../entities/Warning";

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

export const warnUser = async (user_id: string, reason: string) => {
  try {
    // Fetch the user by ID along with their warnings
    const user = await userService.getUserById(user_id);
    if (!user) {
      throw ErrorHandler.notFound("User not found");
    }

    const warningsCount = user.warnings?.length ?? 0;

    if (warningsCount >= 3) {
      user.is_banned = true;
      await userService.updateUser(user.user_id, { is_banned: true }); // Save the updated user
    }

    // Create a new warning entry
    const warning = new Warning();
    warning.user = user;
    warning.reason = reason;

    // Save the warning
    const savedWarning = await warningRepository.save(warning);

    return {
      warning_id: savedWarning.warning_id,
      reason: savedWarning.reason,
      created_at: savedWarning.created_at,
      user: {
        user_id: savedWarning.user.user_id,
        username: savedWarning.user.username,
        warnings_count: savedWarning.user.warnings?.length ?? 0,
        is_banned: savedWarning.user.is_banned,
      },
    };
  } catch (error) {
    console.error(error);
    throw ErrorHandler.internalServerError(
      error instanceof Error ? error.message : "Error creating warning",
    );
  }
};
/**
 * Updates a specific warning's reason.
 *
 * @param warning_id - The ID of the warning to update.
 * @param reason - The new reason for the warning.
 * @returns The updated warning.
 */
const updateWarning = async (warning_id: string, reason: string) => {
  try {
    // Find the warning by ID
    const warning = await warningRepository.findOne({ where: { warning_id } });
    if (!warning) {
      throw ErrorHandler.notFound("Warning not found");
    }

    // Update the reason
    warning.reason = reason;

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

export const warningService = {
  getAllWarnings,
  getWarningsByUserId,
  warnUser,
  updateWarning,
  deleteWarning,
};
