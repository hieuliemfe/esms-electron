/* eslint-disable @typescript-eslint/no-explicit-any */
import request, { EsmsResponse } from '../utils/request';
// eslint-disable-next-line import/no-cycle
import { ShiftInfo } from './shifts';

export type EmployeeShiftInfo = {
  id: number;
  employeeId: string;
  counterId: number;
  shiftDate: string;
  statusId: number;
  Shift: ShiftInfo;
};

type GetEmployeeShiftInfo = {
  activeShifts: EmployeeShiftInfo[];
};

type GetEmployeeShiftResponse = EsmsResponse<GetEmployeeShiftInfo>;

export async function getEmployeeShifts(): Promise<GetEmployeeShiftResponse> {
  return request.get('/employee-shifts') as Promise<GetEmployeeShiftResponse>;
}

export type CreateEmployeeShiftData = {
  shiftId: number;
};

export type CreateEmployeeShiftInfo = {
  shiftId: number;
};

type CreateEmployeeShiftResponse = EsmsResponse<CreateEmployeeShiftInfo>;

export async function createEmployeeShift(
  shiftData: CreateEmployeeShiftData
): Promise<CreateEmployeeShiftResponse> {
  return request.post('/employee-shifts', {
    body: JSON.stringify(shiftData),
  }) as Promise<CreateEmployeeShiftResponse>;
}

export async function checkoutEmployeeShift(shiftId: number) {
  return request.put(`/employee-shifts/${shiftId}/checkout`);
}
