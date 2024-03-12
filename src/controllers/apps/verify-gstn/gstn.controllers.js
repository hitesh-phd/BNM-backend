import { gstData } from "../../../models/apps/gst-numbers/gstData.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import axios from "axios";

const GST_VERIFICATION_URL =
  "https://app.signalx.ai/apps/gst-verification/gstin-overview";

const verifyGSTNController = asyncHandler(async (req, res) => {
  try {
    const { gstNumber } = req.body;

    if (!gstNumber) {
      return res
        .status(400)
        .json({ error: "GST number is required in the request body" });
    }

    // Check if the GST number exists in the database
    const existingData = await gstData.findOne({ gstNumber });

    if (existingData) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            existingData,
            "GST number data found in the database"
          )
        );
    }

    // Continue with the GST number verification
    const response = await axios.get(`${GST_VERIFICATION_URL}/${gstNumber}`);
    const { data } = response;

    // Extract relevant information
    const {
      gstin,
      legal_business_name,
      trade_name,
      filings,
      goods_and_services_list,
      principal_place_of_business,
      effective_date_of_reg,
    } = data;

    if (
      !gstin &&
      !legal_business_name &&
      (!filings || filings.length === 0) &&
      (!goods_and_services_list || goods_and_services_list.length === 0)
    ) {
      throw new ApiError(422, `Invalid GST Number`);
    }

    // Create the result object
    const result = {
      gstNumber: gstin,
      businessName: legal_business_name
        ? legal_business_name
        : trade_name
        ? trade_name
        : "",
      mobileNumber: "",
      email: "",
      ownerName: "",
      hqLocation: principal_place_of_business || "",
      serviceLocation: principal_place_of_business || "",
      yearOfEstablishment: Date(effective_date_of_reg) || "",
      service: goods_and_services_list[0].goods_services_desc || [],
    };

    // Store the data in the MongoDB database
    const savedGSTData = await gstData.create(result);

    return res
      .status(200)
      .json(
        new ApiResponse(200, savedGSTData, "GST number verified and stored")
      );
  } catch (error) {
    console.error("Error fetching GST data:", error);
    console.error("Error fetching GST data:", error.message);
    throw new ApiError(422, `Invalid GST Number`);
  }
});

export { verifyGSTNController };
