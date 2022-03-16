import HistorySchema from "../../models/history";
export default class Manger {
  
    getHistoryList = async (requestData) => {
        const historyListRequest = this.parseGetHistoryListRequest(requestData);
        const historyList = await HistorySchema.getHistoryList(
          historyListRequest.requestData,
          historyListRequest.selectionKeys,
          historyListRequest.skip,
          historyListRequest.limit,
          historyListRequest.sortingKey
        );
        let totalCount = await HistorySchema.countData(historyListRequest.requestData);
        return { historyList, totalCount };
    }
    parseGetHistoryListRequest = (requestObj) => {
        if (!requestObj) return {};
        let skip = 0;
        if (requestObj.skip || requestObj.skip === 0) {
          skip = requestObj.skip;
          delete requestObj.skip;
        }
        let limit = 0;
        if (requestObj.limit) {
          limit = requestObj.limit;
          delete requestObj.limit;
        }
        let sortingKey = "";
        if (requestObj.sortingKey) {
          sortingKey = requestObj.sortingKey;
          delete requestObj.sortingKey;
        }
        let selectionKeys = "";
        if (requestObj.selectionKeys) {
          selectionKeys = requestObj.selectionKeys;
          delete requestObj.selectionKeys;
        }
        let searchQuery = [];
        if (requestObj.searchKeys && requestObj.searchValue && Array.isArray(requestObj.searchKeys) && requestObj.searchKeys.length) {
          requestObj.searchKeys.map((searchKey) => {
            let searchRegex = { $regex: requestObj.searchValue, $options: "i" };
            searchQuery.push({ [searchKey]: searchRegex });
          });
          requestObj["$or"] = searchQuery;
        }
        if (requestObj.searchKeys) delete requestObj.searchKeys;
        if (requestObj.searchValue) delete requestObj.searchValue;
        return {
          requestData: requestObj,
          skip: skip,
          limit: limit,
          sortingKey: sortingKey,
          selectionKeys: selectionKeys,
        };
      };
    
  
}
