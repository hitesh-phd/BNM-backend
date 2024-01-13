import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyGSTNumber } from "../utils/gstVerification";

const verifyGSTN = asyncHandler(async (req, res) => {
  const gstNumber = req.gstNumber;
  const result = await verifyGSTNumber(gstNumber);
  if (!result) throw new ApiError(401, "GST number verification failed");
  return res
    .status(200)
    .json(new ApiResponse(200, result, "GST number verified successfully"));
});

export { verifyGSTN };
