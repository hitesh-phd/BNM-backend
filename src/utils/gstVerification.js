const axios = require("axios");
import { GST_VERIFICATION_URL } from "../constants";

const verifyGSTNumber = async (number) => {
  try {
    const response = await axios.get(
      `${GST_VERIFICATION_URL}/${number}/status`
    );
    const { data } = response;

    // Extract relevant information
    const { lgnm, tradeNam, contact, mbr, gtiFY } = data.tax_payer;

    const { mobNum, email } = contact;

    const { adr } = data.places_of_business.pradr;

    // Create the result object
    const result = {
      businessName: lgnm ? lgnm : tradeNam ? tradeNam : "",
      mobileNumber: mobNum,
      email: email,
      ownerName: mbr,
      hqLocation: adr,
      serviceLocation: adr,
      yearOfEstablishment: gtiFY,
    };

    return result;
  } catch (error) {
    console.error("Error fetching GST data:", error.message);
    throw error;
  }
};

export { verifyGSTNumber };
