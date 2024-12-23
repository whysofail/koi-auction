interface PaginationParams {
  page?: string; // Page number (default to "1" if not provided)
  limit?: string; // Number of items per page (default to "10" if not provided)
}

// Function to calculate the pagination `skip` and `take` values
const paginate = (paginationParams: PaginationParams) => {
  const page = parseInt(paginationParams.page || "1", 10);
  const limit = parseInt(paginationParams.limit || "10", 10);

  // Ensure valid numbers for page and limit
  const skip = (page - 1) * limit; // Offset for pagination
  const take = limit; // Number of items to fetch

  return { skip, take };
};

export default paginate;
