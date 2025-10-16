import { HttpClient } from './http-client';
import type { AuthManager } from './auth';
import { XApiError } from '../errors';
import { TransactionIDGenerator } from './transaction/generator';
import type { EndpointName } from './endpoints';
import { getEndpoint } from './endpoints';

export async function apiRequest<T>(
  endpointName: EndpointName,
  auth: AuthManager,
  http: HttpClient,
  options: {
    method?: 'GET' | 'POST';
    body?: Record<string, unknown>;
    params?: Record<string, string>;
    transactionId?: boolean;
    referer?: string;
    ignoreErrors?: (msg: string) => boolean;
  } = {}
): Promise<T> {
  const { method = 'GET', body, params, transactionId, referer, ignoreErrors } = options;

  const endpoint = await getEndpoint(endpointName);
  let url = endpoint.url;

  if (params) {
    const searchParams = new URLSearchParams(params);
    url = `${url}?${searchParams.toString()}`;
  }

  const urlObj = new URL(endpoint.url);
  let txId: string | undefined;
  if (transactionId) {
    const generator = await TransactionIDGenerator.create();
    txId = generator.generateTransactionId(method, urlObj.pathname);
  }

  const headers = await auth.buildHeaders(false, txId, referer);
  if (body) headers['Content-Type'] = 'application/json';

  const args = http.buildCurlArgs(headers);
  
  let bodyStr: string | undefined;
  if (body) {
    const payload = {
      ...body,
      queryId: endpoint.queryId,
    };
    bodyStr = JSON.stringify(payload);
  }

  if (method === 'POST' && bodyStr) {
    args.push('--data-binary', '@-', url);
    const output = await http.execute(args, bodyStr);
    return parseApiResponse<T>(output, ignoreErrors);
  }

  args.push(url);
  const output = await http.execute(args);
  return parseApiResponse<T>(output, ignoreErrors);
}

function parseApiResponse<T>(buffer: Buffer, ignoreErrors?: (msg: string) => boolean): T {
  const response = JSON.parse(buffer.toString('utf-8').trim());

  if (response.errors) {
    const errors = response.errors as Array<{ message: string; code?: number }>;
    
    if (ignoreErrors) {
      const filteredErrors = errors.filter(e => !ignoreErrors(e.message));
      if (filteredErrors.length === 0) {
        return response;
      }
    }

    const msg = errors.map(e => e.message).join(', ');
    throw new XApiError(msg, 'API_ERROR');
  }

  return response;
}
