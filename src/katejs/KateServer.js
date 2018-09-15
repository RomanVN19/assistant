import Database from './database';
import Http from './http';

const trivialLogger = {
  info: (...args) => console.log(...args),
  debug: (...args) => console.log(...args),
  error: (...args) => console.error(...args),
};

class AppServer {
}

export default class KateServer {
  constructor({ App, logger }) {
    this.logger = logger || trivialLogger;

    this.logger.info('Creating KateServer...');
    this.app = new (App(AppServer))();
    const { databaseParams, httpParams, entities: entitiesClasses } = this.app;
    const entities = {};
    Object.keys(entitiesClasses).forEach((name) => {
      entities[name] = new entitiesClasses[name]({ logger: this.logger });
    });

    this.database = new Database({ databaseParams, entities, logger: this.logger });
    this.http = new Http({ httpParams, entities, logger: this.logger });
  }
  run() {
    this.logger.info('starting http server...');
    this.http.listen();
    this.logger.info('... http server started at port', this.http.httpParams.port);
  }
  async syncDatabase() {
    this.logger.info('synchronizing database structure...');
    await this.database.sync();
    this.logger.info('...database structure synchronized');
  }
}