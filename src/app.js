import express from 'express';
import session from 'express-session';
import { engine } from 'express-handlebars';
import dotEnv from 'dotenv';

import routes from './app/routes';
import sessionConfig from './config/session';
import handlebarsConfig from './config/handlebars';

class App {
    constructor() {
        this.server = express();
        this.middlewares();
        this.routes();
        this.session();
        this.viewEngine();
        this.public();
        this.dotEnv();
    }

    middlewares() {
        this.server.use(express.json());
    }

    routes() {
        this.server.use(routes);
    }

    session() {
        this.server.use(session(sessionConfig));
    }

    viewEngine() {
        this.server.set('view engine', 'handlebars');
        this.server.set('views', './views');
        this.server.engine('handlebars', engine(handlebarsConfig));
    }

    public() {
        this.server.use(express.static(path.join(__dirname, 'public')));
    }

    dotEnv() {
        dotEnv.config();
    }
}

export default new App().server;