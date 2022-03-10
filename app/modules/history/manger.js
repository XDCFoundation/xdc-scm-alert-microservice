import HistorySchema from "../../models/history";
export default class Manger {
  
    getHistoryList = async (requestData) => {
        return await HistorySchema.findData(requestData ? requestData : {});
    }
  
}
