import request, { EsmsResponse } from '../utils/request';

export type TaskInfo = {
  id: number;
  name: string;
  code: string;
  categoryId: number;
};

export type CategoryInfo = {
  id: number;
  categoryName: string;
  taskList?: TaskInfo[];
};

type CounterCategoryInfo = {
  Category: CategoryInfo;
};

type CounterCategoryResponse = EsmsResponse<CounterCategoryInfo[]>;

export async function getCounterCategory(
  counterId: number
): Promise<CounterCategoryResponse> {
  return request.get(`/categories/counters/${counterId}`) as Promise<
    CounterCategoryResponse
  >;
}

type CategoryTasksResponse = EsmsResponse<TaskInfo[]>;

export async function getCategoryTasks(
  categoryId: number
): Promise<CategoryTasksResponse> {
  return request.get(`/categories/${categoryId}/tasks`) as Promise<
    CategoryTasksResponse
  >;
}
