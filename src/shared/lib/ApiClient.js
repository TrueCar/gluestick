import request from "axios";
import nodeUrl from "url";

class ApiClient {
    constructor(req) {
        ['get', 'delete', 'head'].forEach(method => {
            this[method] = (url, config) => {
                if (__SERVER__) {
                    const parsedUrl = nodeUrl.parse(url);
                    url = `http://${req.headers.host}${parsedUrl.path}`;
                    config = config || {};
                    config.headers = config.headers || {};

                    if (req.get('cookie')) {
                        config.headers['Cookie'] = req.get('cookie');
                    }
                }

                return request[method](url, config);
            }
        });

        ['post', 'put', 'patch'].forEach(method => {
            this[method] = (url, data, config) => {

                if (__SERVER__) {
                    const parsedUrl = nodeUrl.parse(url);
                    url = `http://${req.headers.host}${parsedUrl.path}`;
                    config = config || {};
                    config.headers = config.headers || {};

                    if (req.get('cookie')) {
                        config.headers['Cookie'] = req.get('cookie');
                    }
                }

                return request[method](url, data, config);
            }
        });
    }
}

export default ApiClient;

