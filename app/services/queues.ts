import request, { EsmsResponse } from '../utils/request';

type CategoryInfo = {
  id: number;
  categoryName: string;
};

export type QueueInfo = {
  id: number;
  number: number;
  customerName: string;
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

type SkipResponse = EsmsResponse<number>;

export async function skipQueue(queueId: number): Promise<SkipResponse> {
  return request.put(`/queues/${queueId}`) as Promise<SkipResponse>;
}

type RemoveResponse = EsmsResponse<number>;

export async function removeQueue(queueId: number): Promise<RemoveResponse> {
  return request.delete(`/queues/${queueId}`) as Promise<RemoveResponse>;
}
