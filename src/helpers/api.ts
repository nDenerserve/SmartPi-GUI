import axios from 'axios'
import { useAuthStore } from '../stores/auth';

/**
 * Axios basic configuration
 */
const config = {
  baseURL: 'http://'+window.location.hostname+':1080/api/v1',
  // baseURL: 'http://10.30.0.70:1080/api/v1', // for testing
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

/** Adding the response interceptors */
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