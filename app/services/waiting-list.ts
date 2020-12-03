import request, { EsmsResponse } from '../utils/request';

type CategoryInfo = {
  id: number;
  categoryName: string;
};

export type WaitingInfo = {
  id: number;
  number: number;
  customerName: string;
  Category: CategoryInfo;
};

type GetWaitingListResponse = EsmsResponse<WaitingInfo[]>;

export async function getWaitingList(): Promise<GetWaitingListResponse> {
  return request.get('/waiting-list') as Promise<GetWaitingListResponse>;
}

type AssignResponse = EsmsResponse<number[]>;

export async function assignWaiting(
  counterId: number,
  waitingId: number
): Promise<AssignResponse> {
  const payload = { counterId, id: waitingId };
  return request.post('/waiting-list/assign', {
    body: JSON.stringify(payload),
  }) as Promise<AssignResponse>;
}

type SkipResponse = EsmsResponse<number>;

export async function skipWaiting(waitingId: number): Promise<SkipResponse> {
  return request.put(`/waiting-list/${waitingId}`) as Promise<SkipResponse>;
}

type RemoveResponse = EsmsResponse<number>;

export async function removeWaiting(
  waitingId: number
): Promise<RemoveResponse> {
  return request.delete(`/waiting-list/${waitingId}`) as Promise<
    RemoveResponse
  >;
}
