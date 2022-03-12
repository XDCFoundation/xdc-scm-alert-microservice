import DestinationSchema from "../../models/destination";
import AlertSchema from "../../models/alert";
import { httpConstants } from "../../common/constants";
import Utils from "../../utils";
export default class Manger {
    addDestination = async (requestData) => {
        const dest = await DestinationSchema.findOneData({
            url: requestData.url,
            userId: requestData.userId
        });
        if (dest) {
            if (dest.isDeleted === true)
                return await DestinationSchema.findOneAndUpdateData({ destinationId: dest.destinationId }, { isDeleted: false });
            else
                throw Utils.error({}, `Destination url already exists`, httpConstants.RESPONSE_CODES.FORBIDDEN);
        }
        const destinationObject = new DestinationSchema(requestData);
        destinationObject["destinationId"] = destinationObject._id;
        return await destinationObject.saveData();
    }
    getDestinations = async (requestData) => {
        return await DestinationSchema.findData(requestData ? requestData : {});
    }
    deleteDestination = async (requestData) => {
        let destination= await DestinationSchema.findOneAndUpdateData({ destinationId: requestData.destinationId }, { isDeleted: true });
        let alert= await AlertSchema.findOneAndUpdateData({ "destinations": requestData.destinationId }, {"destinations":""});
        return {destination,alert}
    }
}
