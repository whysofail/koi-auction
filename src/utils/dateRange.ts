/* eslint-disable @typescript-eslint/naming-convention */
import {
  FindOptionsWhere,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from "typeorm";

// Define the type for the date range filter
interface DateRange {
  start_datetime?: string;
  end_datetime?: string;
}

/**
 * Utility function to create a date condition based on the provided range.
 * @param fieldName - The field name to apply the filter on (e.g., "created_at").
 * @param start_datetime - The optional start date.
 * @param end_datetime - The optional end date.
 * @returns A partial FindOptionsWhere object with the date filter.
 */
const createDateCondition = <Entity>(
  fieldName: keyof Entity,
  start_datetimetime?: string,
  end_datetime?: string,
): FindOptionsWhere<Entity> | undefined => {
  if (start_datetimetime && end_datetime) {
    return {
      [fieldName]: Between(
        new Date(start_datetimetime),
        new Date(end_datetime),
      ),
    } as FindOptionsWhere<Entity>;
  }

  if (start_datetimetime) {
    return {
      [fieldName]: MoreThanOrEqual(new Date(start_datetimetime)),
    } as FindOptionsWhere<Entity>;
  }

  if (end_datetime) {
    return {
      [fieldName]: LessThanOrEqual(new Date(end_datetime)),
    } as FindOptionsWhere<Entity>;
  }

  return undefined; // No condition if neither start_datetimetime nor end_datetime is provided
};

/**
 * Utility function to build a date range filter for TypeORM queries.
 * @param fieldName - The field name to apply the date range filter on (e.g., "created_at").
 * @param dateRange - An object containing optional start_datetimetime and end_datetime.
 * @returns A FindOptionsWhere object with the date range filter, or undefined if no dates are provided.
 */
const buildDateRangeFilter = <Entity>(
  fieldName: keyof Entity,
  { start_datetime, end_datetime }: DateRange,
): FindOptionsWhere<Entity> | undefined => {
  const condition = createDateCondition(
    fieldName,
    start_datetime,
    end_datetime,
  );
  console.log(condition); // Debugging log for the generated condition
  return condition; // Return undefined if no condition is created
};

export default buildDateRangeFilter;
