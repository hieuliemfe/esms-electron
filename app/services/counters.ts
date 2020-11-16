import request, { EsmsResponse } from '../utils/request';
import { CategoryInfo } from './categories';

export type CounterInfo = {
  id: number;
  name: string;
  number: number;
  Categories?: CategoryInfo[];
};

type GetCounterInfo = {
  counter: CounterInfo;
};

type GetCounterResponse = EsmsResponse<GetCounterInfo>;

export async function getCounter(
  counterId: number
): Promise<GetCounterResponse> {
  return request.get(`/counters/${counterId}`) as Promise<GetCounterResponse>;
}
