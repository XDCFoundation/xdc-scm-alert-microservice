/**
 * Created by AyushK on 18/09/20.
 */
import * as ValidationManger from "../middleware/validation";
import AlertModule from "../app/modules/alerts";
import DestinationModule from "../app/modules/destination";
import HistoryModule from "../app/modules/history";
import {stringConstants} from "../app/common/constants";

module.exports = (app) => {
    app.get('/', (req, res) => res.send(stringConstants.SERVICE_STATUS_HTML));

    /**
     * Alert definition
     */
    app.post("/alert",ValidationManger.validateAddAlert, new AlertModule().addAlert);
    app.post("/alert-list", new AlertModule().getAlertList);
    app.get("/alert/:alertId", new AlertModule().getAlert);
    app.delete("/alert/:alertId", new AlertModule().deleteAlert);
    app.put("/alert/:alertId", new AlertModule().updateAlert);

    /**
     * Destination definition
     */
    app.post("/destination",ValidationManger.validateAddDestination, new DestinationModule().addDestination);
    app.post("/destination-list", new DestinationModule().getDestinations);
    app.delete("/destination/:destinationId", new DestinationModule().deleteDestination);

    /**
     * History definition
     */
    app.post("/history-list", new HistoryModule().getHistoryList);

};
