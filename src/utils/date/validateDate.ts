import moment from "moment";

export const isValidDate = (date: string | undefined): boolean =>
  date ? moment(date, "YYYY-MM-DD", true).isValid() : true;

export default isValidDate;
