import request, { EsmsResponse } from '../utils/request';

type CategoryInfo = {
  id: number;
  categoryName: string;
};

export type QueueInfo = {
  id: number;
  number: number;
  Category: CategoryInfo;
};

type QueueResponse = EsmsResponse<QueueInfo[]>;

export async function getQueues(): Promise<QueueResponse> {
  return request.get('/queues') as Promise<QueueResponse>;
}

type AssignResponse = EsmsResponse<number[]>;

export async function assignQueue(
  counterId: number,
  queueId: number
): Promise<AssignResponse> {
  const payload = { counterId, queueId };
  return request.post('/queues/assign', {
    body: JSON.stringify(payload),
  }) as Promise<AssignResponse>;
}
