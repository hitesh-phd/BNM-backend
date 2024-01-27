import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

import axios from "axios";

const GST_VERIFICATION_URL =
  "https://sr1sf8ld8a.execute-api.ap-south-1.amazonaws.com/prod/gsp/gstin";

const verifyGSTNController = asyncHandler(async (req, res) => {
  try {
    const { gstNumber } = req.body;

    if (!gstNumber) {
      return res
        .status(400)
        .json({ error: "GST number is required in the request body" });
    }

    const response = await axios.get(
      `${GST_VERIFICATION_URL}/${gstNumber}/status`
    );
    const { data } = response.data;
    console.log("response", data);

    // Extract relevant information
    const { lgnm, tradeNam, contacted, mbr, gtiFY } = data.tax_payer;

    const { mobNum, email } = contacted;

    const { adr } = data.places_of_business.pradr;

    // Create the result object
    const result = {
      businessName: lgnm ? lgnm : tradeNam ? tradeNam : "",
      mobileNumber: mobNum || "",
      email: email || "",
      ownerName: mbr,
      hqLocation: adr || "",
      serviceLocation: adr || "",
      yearOfEstablishment: gtiFY || "",
    };

    return res
      .status(200)
      .json(new ApiResponse(200, result, "gst number verified"));
  } catch (error) {
    console.error("Error fetching GST data:", error.message);
    throw new ApiError(422, `invalid gst Number`);
  }
});

export { verifyGSTNController };
