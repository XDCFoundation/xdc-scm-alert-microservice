import APP from 'express'
import DBConnection from './config/dbConnection'
import Utils from './app/utils'
import Config from './config'
import routes from './routes'
import { httpConstants } from './app/common/constants';
import QueueController from "./app/modules/queue";
import AMQP from "./library";

const app = new APP()
require('./config/express')(app)
global.lhtWebLog = Utils.lhtLog

class Server {
  static listen () {
    Promise.all([DBConnection.connect(), AMQP.conn(Config.AMQP_HOST_URL, true)]).then(() => {
      app.listen(Config.PORT)
      Utils.lhtLog('listen', `Server Started on port ${Config.PORT}`, {}, 'AyushK', httpConstants.LOG_LEVEL_TYPE.INFO)
      routes(app)
      require('./config/jobInitializer');
      new QueueController().initializeRabbitMQListener();
    }).catch(error => Utils.lhtLog('listen', 'failed to connect', { err: error }, 'AyushK', httpConstants.LOG_LEVEL_TYPE.ERROR))
  }
}

Server.listen()
