export class ResponseError extends Error {
  public response: Response;

  constructor(response: Response) {
    super(response.statusText);
    this.response = response;
  }
}
/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
function parseJSON(response: Response) {
  if (response.status === 204 || response.status === 205) {
    return null;
  }
  return response.json();
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */
function checkStatus(response: Response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new ResponseError(response);
  throw error;
}

export const API_ENDPOINT = 'http://api.esms-team.site';

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} path       The path we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
async function request(
  path: string,
  options?: RequestInit
): Promise<unknown | { err: ResponseError }> {
  const opts = options || {};
  const headers = new Headers(opts.headers);
  headers.append('Content-Type', 'application/json');
  opts.headers = headers;
  const fetchResponse = await fetch(`${API_ENDPOINT}${path}`, opts);
  const response = await checkStatus(fetchResponse);
  return parseJSON(response);
}

let TOKEN: string | null = null;

export const setToken = (token: string) => {
  TOKEN = token;
};

export const getToken = () => {
  return TOKEN;
};

/**
 * Requests a URL with authenticated token, returning a promise
 *
 * @param  {string} path       The path we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
async function requestWithAuth(
  path: string,
  options?: RequestInit
): Promise<unknown | { err: ResponseError }> {
  const opts = options || {};
  if (TOKEN && !opts.headers) {
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${TOKEN}`);
    opts.headers = headers;
  }
  return request(path, opts);
}

/**
 * Requests a URL with GET method, returning a promise
 *
 * @param  {string} path       The path we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
export async function methodGet(
  path: string,
  options?: RequestInit,
  withAuth = true
): Promise<unknown | { err: ResponseError }> {
  const opts = options || {};
  opts.method = 'get';
  return withAuth ? requestWithAuth(path, opts) : request(path, opts);
}

/**
 * Requests a URL with POST method, returning a promise
 *
 * @param  {string} path       The path we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
export async function methodPost(
  path: string,
  options?: RequestInit,
  withAuth = true
): Promise<unknown | { err: ResponseError }> {
  const opts = options || {};
  opts.method = 'post';
  return withAuth ? requestWithAuth(path, opts) : request(path, opts);
}

/**
 * Requests a URL with PUT method, returning a promise
 *
 * @param  {string} path       The path we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
export async function methodPut(
  path: string,
  options?: RequestInit,
  withAuth = true
): Promise<unknown | { err: ResponseError }> {
  const opts = options || {};
  opts.method = 'put';
  return withAuth ? requestWithAuth(path, opts) : request(path, opts);
}

/**
 * Requests a URL with DELETE method, returning a promise
 *
 * @param  {string} path       The path we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
export async function methodDelete(
  path: string,
  options?: RequestInit,
  withAuth = true
): Promise<unknown | { err: ResponseError }> {
  const opts = options || {};
  opts.method = 'delete';
  return withAuth ? requestWithAuth(path, opts) : request(path, opts);
}

export default {
  get: methodGet,
  post: methodPost,
  put: methodPut,
  delete: methodDelete,
};
