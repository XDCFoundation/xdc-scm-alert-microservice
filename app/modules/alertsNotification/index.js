import Utils from '../../utils'
import { apiSuccessMessage, httpConstants } from '../../common/constants'
import BLManager from './manger'

export default class Index {
  static async getTransactions(data) {
    await new BLManager().getTransactions(data);
}
}
