import { ObjectMeta } from '@types';

const deviceFleetRegExp = /^Fleet\/(?<fleetName>.*)$/;

const getDeviceFleet = (metadata: ObjectMeta) => {
  const match = deviceFleetRegExp.exec(metadata.owner || '');
  return match?.groups?.fleetName || null;
};

const getMissingFleetDetails = (metadata: ObjectMeta): { message: string; owners: string[] } => {
  const multipleOwnersInfo = Object.keys(metadata.annotations || {}).find((key) => key === 'MultipleOwners');
  if (multipleOwnersInfo) {
    // When the multiple owners issue is resolved, the annotation is still present
    const owners = metadata.annotations?.MultipleOwners || '';
    if (owners.length > 0) {
      return {
        message: 'Device is owned by more than one fleet',
        owners: owners.split(','),
      };
    }
  }
  return {
    message: 'No fleet matches the device selectors',
    owners: [],
  };
};

export { getDeviceFleet, getMissingFleetDetails };