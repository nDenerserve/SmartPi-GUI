import axios from 'axios'
import { useAuthStore } from '../stores/auth';

/**
 * Axios basic configuration.
 * baseURL normally tracks the page's own hostname (the SmartPi device serves
 * both the GUI and its API on the same host, just different ports), so the
 * build works unmodified regardless of which device it's deployed to. The
 * commented-out alternatives are hardcoded device IPs swapped in temporarily
 * during local development against a specific test unit - not meant to be
 * committed as the active line.
 */
const config = {
  baseURL: 'http://'+window.location.hostname+':1080/api/v1',
  // baseURL: 'http://10.30.0.70:1080/api/v1', // for testing
  // baseURL: 'http://10.1.0.249:1080/api/v1', // for testing
  headers: {
    common: {
        "Accept": "Application/json, text/plain, */*",
        // "Access-Control-Allow-Credentials" : "true"
    }
  }
}

/**
 * Creating the instance of Axios
 * It is because in large-scale application, we may need
 * to consume APIs from more than a single server,
 */
const api = axios.create(config)

/**
 * Auth interceptors
 * @description Add auth tokens to every outgoing request.
 * @param {*} config
 */
const authInterceptor = (config) => {
//   config.headers.Authorization = `Bearer ${AuthService.token}`
//   config.headers.common.Accept = 'Application/json'
//   config.headers['Access-Control-Allow-Origin'] = '*'
//   config.headers['Access-Control-Allow-Credentials'] = 'true'

    const { token } = useAuthStore();
    const isLoggedIn = !!token;

    if (isLoggedIn) {
        config.headers.Authorization = `Bearer ${token}`
    }

  return config
}


/** Adding the request interceptors */
api.interceptors.request.use(authInterceptor)
// client.interceptors.request.use(loggerInterceptor)

/**
 * Adding the response interceptors.
 * On a 401 (expired/invalid token) this clears the session and sends the
 * user back to /login. Note the error handler *resolves* with `error`
 * instead of re-throwing it, so callers' `.catch()` blocks never fire for
 * failed requests - callers only see a rejected/resolved promise carrying
 * the Axios error object as its value, not a `try/catch` and not a rejection.
 */
api.interceptors.response.use(response => {
   return response;
}, error => {
  if (error.response.status === 401) {
   //place your reentry code
   useAuthStore().logout();
  }
  return error;
});

export default api