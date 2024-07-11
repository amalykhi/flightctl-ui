import * as React from 'react';
import { DeviceList, EnrollmentRequestList } from '@flightctl/types';
import { FilterSearchParams } from '../../../utils/status/devices';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { DeviceLikeResource } from '../../../types/extraTypes';
import { EnrollmentRequestStatus, getApprovalStatus } from '../../../utils/status/enrollmentRequest';
import { FilterStatusMap } from './types';

const getERsEndpoint = (fleedId: string | undefined, activeStatuses: FilterStatusMap) => {
  if (fleedId) {
    return '';
  }
  if (
    Object.values(activeStatuses).some((s) => s.length) &&
    !activeStatuses[FilterSearchParams.DeviceStatus].includes(EnrollmentRequestStatus.Pending)
  ) {
    return '';
  }

  return 'enrollmentrequests';
};

export const getDevicesEndpoint = ({
  fleetId,
  activeStatuses,
  labels,
}: {
  fleetId?: string;
  activeStatuses?: FilterStatusMap;
  labels?: {
    key: string;
    value: string;
  }[];
}) => {
  const filterByAppStatus = activeStatuses?.[FilterSearchParams.AppStatus];
  const filterByDevStatus = activeStatuses?.[FilterSearchParams.DeviceStatus];
  const filterByUpdateStatus = activeStatuses?.[FilterSearchParams.UpdatedStatus];

  if (
    !filterByAppStatus?.length &&
    !filterByUpdateStatus?.length &&
    filterByDevStatus?.length === 1 &&
    filterByDevStatus[0] === EnrollmentRequestStatus.Pending
  ) {
    return '';
  }

  const params = new URLSearchParams();
  if (fleetId) {
    params.set('owner', `Fleet/${fleetId}`);
  }
  filterByAppStatus?.forEach((appSt) => params.append('statusFilter', `applications.summary.status=${appSt}`));
  filterByDevStatus?.forEach((devSt) => {
    if (devSt !== EnrollmentRequestStatus.Pending) {
      params.append('statusFilter', `summary.status=${devSt}`);
    }
  });
  filterByUpdateStatus?.forEach((updSt) => params.append('statusFilter', `updated.status=${updSt}`));
  if (labels?.length) {
    const labelSelector = labels.reduce((acc, curr) => {
      if (!acc) {
        acc = `${curr.key}=${curr.value}`;
      } else {
        acc += `,${curr.key}=${curr.value}`;
      }
      return acc;
    }, '');
    params.append('labelSelector', labelSelector);
  }
  return params.size ? `devices?${params.toString()}` : 'devices';
};

export const useDeviceLikeResources = ({
  fleetId,
  activeStatuses,
}: {
  fleetId?: string;
  activeStatuses: FilterStatusMap;
}): [DeviceLikeResource[], boolean, unknown, boolean, VoidFunction] => {
  const [devicesList, devicesLoading, devicesError, devicesRefetch, erUpdating] = useFetchPeriodically<DeviceList>({
    endpoint: getDevicesEndpoint({ fleetId, activeStatuses }),
  });

  const [erList, erLoading, erError, erRefetch, updating] = useFetchPeriodically<EnrollmentRequestList>({
    endpoint: getERsEndpoint(fleetId, activeStatuses),
  });

  const data = React.useMemo(() => {
    const devices = devicesList?.items || [];
    const ers = erList?.items || [];
    return [...devices, ...ers.filter((er) => getApprovalStatus(er) === EnrollmentRequestStatus.Pending)];
  }, [devicesList?.items, erList?.items]);

  const refetch = React.useCallback(() => {
    devicesRefetch();
    erRefetch();
  }, [devicesRefetch, erRefetch]);

  return [data, devicesLoading || erLoading, devicesError || erError, updating || erUpdating, refetch];
};