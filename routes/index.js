/**
 * Created by AyushK on 18/09/20.
 */
import * as ValidationManger from "../middleware/validation";
import AlertModule from "../app/modules/alerts";
import DestinationModule from "../app/modules/destination";
import HistoryModule from "../app/modules/history";
import { stringConstants } from "../app/common/constants";
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../config/swagger.json';
import { authenticate } from "../middleware/authentication";

module.exports = (app) => {
    app.get('/', (req, res) => res.send(stringConstants.SERVICE_STATUS_HTML));

    /**
     * create swagger UI
     * **/
    app.use('/swagger-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    /**
     * Alert definition
     */
    app.post("/alert", authenticate, ValidationManger.validateAddAlert, new AlertModule().addAlert);
    app.post("/alert-list", authenticate, new AlertModule().getAlertList);
    app.get("/alert/:alertId", authenticate, new AlertModule().getAlert);
    app.delete("/alert/:alertId", authenticate, new AlertModule().deleteAlert);
    app.put("/alert/:alertId", authenticate, new AlertModule().updateAlert);

    /**
     * Destination definition
     */
    app.post("/destination", authenticate, ValidationManger.validateAddDestination, new DestinationModule().addDestination);
    app.post("/destination-list", authenticate, new DestinationModule().getDestinations);
    app.delete("/destination/:destinationId", authenticate, new DestinationModule().deleteDestination);

    /**
     * History definition
     */
    app.post("/history-list", authenticate, new HistoryModule().getHistoryList);

};
