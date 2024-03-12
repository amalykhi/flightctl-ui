import * as React from 'react';
import { PropsWithChildren, useEffect } from 'react';

import {
  Navigate,
  RouteObject,
  RouterProvider,
  createBrowserRouter,
  useNavigate,
  useParams,
  useRouteError,
} from 'react-router-dom';
import { Overview } from '@app/old/Overview/Overview';
import { Experimental } from '@app/old/Experimental/Experimental';
import { Experimental2 } from '@app/old/Experimental/Experimental2';
import { Experimental3 } from '@app/old/Experimental/Experimental3';
import { Organization } from '@app/old/Organization/Organization';
import { ImageBuilder } from '@app/old/ImageBuilder/ImageBuilder';
import { Workload } from '@app/old/Workload/Workload';

import AppLayout from '@app/components/AppLayout/AppLayout';
import NotFound from '@app/components/AppLayout/NotFound';
import CreateFleet from '@app/components/Fleet/CreateFleet/CreateFleet';
import FleetList from '@app/components/Fleet/FleetList';
import FleetDetails from '@app/components/Fleet/FleetDetails/FleetDetails';
import EnrollmentRequestList from '@app/components/EnrollmentRequest/EnrollmentRequestList';
import EnrollmentRequestDetails from '@app/components/EnrollmentRequest/EnrollmentRequestDetails/EnrollmentRequestDetails';
import DeviceList from '@app/components/Device/DeviceList';
import DeviceDetails from '@app/components/Device/DeviceDetails/DeviceDetails';
import CreateRepository from '@app/components/Repository/CreateRepository/CreateRepository';
import RepositoryList from '@app/components/Repository/RepositoryList';
import RepositoryDetails from '@app/components/Repository/RepositoryDetails/RepositoryDetails';
import ResourceSyncToRepository from '@app/components/ResourceSync/ResourceSyncToRepository';

import { useDocumentTitle } from '@app/hooks/useDocumentTitle';
import { APP_TITLE } from '@app/constants';
import { UserPreferencesContext } from './components/UserPreferences/UserPreferencesProvider';

export type ExtendedRouteObject = RouteObject & {
  title?: string;
  showInNav?: boolean;
  isExperimental?: boolean;
  children?: ExtendedRouteObject[];
};

const ErrorPage = () => {
  const error = useRouteError() as { status: number };

  if (error.status === 404) {
    return (
      <TitledRoute title="404 Page Not Found">
        <NotFound />
      </TitledRoute>
    );
  }

  return <div>Error page - details should be displayed here</div>;
};

const TitledRoute = ({ title, children }: PropsWithChildren<{ title: string }>) => {
  useDocumentTitle(`${APP_TITLE} | ${title}`);
  return children;
};

const Refresh = () => {
  const navigate = useNavigate();
  useEffect(() => navigate(-1), [navigate]);
  return <></>;
};

const experimentalRoutes: ExtendedRouteObject[] = [
  {
    path: '/experimental',
    title: 'Experimental',
    element: (
      <TitledRoute title="Experimental">
        <Experimental />
      </TitledRoute>
    ),
    isExperimental: true,
  },
  {
    path: '/experimental2',
    title: 'Experimental2',
    element: (
      <TitledRoute title="Experimental2">
        <Experimental2 />
      </TitledRoute>
    ),
    isExperimental: true,
  },
  {
    path: '/experimental3',
    title: 'Experimental3',
    element: (
      <TitledRoute title="Experimental3">
        <Experimental3 />
      </TitledRoute>
    ),
    isExperimental: true,
  },
];

const RedirectToDeviceDetails = () => {
  const { deviceId } = useParams() as { deviceId: string };
  return <Navigate to={`/devicemanagement/devices/${deviceId}`} replace />;
};

const RedirectToEnrollmentDetails = () => {
  const { enrollmentRequestId } = useParams() as { enrollmentRequestId: string };
  return <Navigate to={`/devicemanagement/enrollmentrequests/${enrollmentRequestId}`} replace />;
};

const deviceManagementRoutes = (experimentalFeatures?: boolean): ExtendedRouteObject[] => [
  {
    path: '/',
    showInNav: false,
    element: <Navigate to={experimentalFeatures ? '/devicemanagement/overview' : '/devicemanagement/fleets'} replace />,
  },
  {
    path: '/devicemanagement/overview',
    title: 'Overview',
    element: (
      <TitledRoute title="Overview">
        <Overview />
      </TitledRoute>
    ),
    isExperimental: true,
  },
  ...experimentalRoutes,
  {
    path: '/devicemanagement/enrollmentrequests',
    title: 'Enrollment Requests',
    children: [
      {
        index: true,
        title: 'Enrollment Requests',
        element: (
          <TitledRoute title="Enrollment Requests">
            <EnrollmentRequestList />
          </TitledRoute>
        ),
      },
      {
        path: ':enrollmentRequestId',
        title: 'Enrollment Request Details',
        element: (
          <TitledRoute title="Enrollment Request Details">
            <EnrollmentRequestDetails />
          </TitledRoute>
        ),
      },
    ],
  },
  {
    path: '/enroll/:enrollmentRequestId',
    title: 'Enrollment Request',
    showInNav: false,
    element: <RedirectToEnrollmentDetails />,
  },
  {
    path: '/devicemanagement/fleets',
    title: 'Fleets',
    children: [
      {
        index: true,
        title: 'Fleets',
        element: (
          <TitledRoute title="Fleets">
            <FleetList />
          </TitledRoute>
        ),
      },
      {
        path: 'create',
        title: 'Create Fleet',
        element: (
          <TitledRoute title="Create Fleet">
            <CreateFleet />
          </TitledRoute>
        ),
      },
      {
        path: ':fleetId/*',
        title: 'Fleet Details',
        element: (
          <TitledRoute title="Fleet Details">
            <FleetDetails />
          </TitledRoute>
        ),
      },
    ],
  },
  {
    path: '/manage/:deviceId',
    title: 'Device',
    showInNav: false,
    element: <RedirectToDeviceDetails />,
  },
  {
    path: '/devicemanagement/devices',
    title: 'Devices',
    children: [
      {
        index: true,
        title: 'Devices',
        element: (
          <TitledRoute title="Devices">
            <DeviceList />
          </TitledRoute>
        ),
      },
      {
        path: ':deviceId',
        title: 'Device',
        showInNav: false,
        element: (
          <TitledRoute title="Device">
            <DeviceDetails />
          </TitledRoute>
        ),
      },
    ],
  },
];

const administrationRoutes: ExtendedRouteObject[] = [
  {
    path: '/workload',
    title: 'Workload',
    isExperimental: true,
    element: (
      <TitledRoute title="Workload">
        <Workload />
      </TitledRoute>
    ),
  },
  {
    path: '/administration/repositories',
    title: 'Repositories',
    children: [
      {
        index: true,
        title: 'Repositories',
        element: (
          <TitledRoute title="Repositories">
            <RepositoryList />
          </TitledRoute>
        ),
      },
      {
        path: 'create',
        title: 'Create Repository',
        element: (
          <TitledRoute title="Create Repository">
            <CreateRepository />
          </TitledRoute>
        ),
      },
      {
        path: ':repositoryId/*',
        title: 'Repository Details',
        element: (
          <TitledRoute title="Repository Details">
            <RepositoryDetails />
          </TitledRoute>
        ),
      },
    ],
  },
  {
    path: '/administration/resourcesyncs/:rsId',
    title: 'Resource sync',
    showInNav: false,
    // Fetches the RS from its ID and redirects to the repository page
    element: (
      <TitledRoute title="Resource sync">
        <ResourceSyncToRepository />
      </TitledRoute>
    ),
  },
  {
    path: '/administration/organization',
    title: 'Organization',
    isExperimental: true,
    element: (
      <TitledRoute title="Organization">
        <Organization />
      </TitledRoute>
    ),
  },
  {
    path: '/administration/imagebuilder',
    title: 'Image Builder',
    isExperimental: true,
    element: (
      <TitledRoute title="Image Builder">
        <ImageBuilder />
      </TitledRoute>
    ),
  },
  {
    path: '/refresh',
    element: <Refresh />,
  },
];

const AppRoutes = () => {
  const { experimentalFeatures } = React.useContext(UserPreferencesContext);

  const routes = [...deviceManagementRoutes(experimentalFeatures), ...administrationRoutes];
  const router = createBrowserRouter([
    {
      path: '/',
      element: <AppLayout />,
      errorElement: <ErrorPage />,
      children: routes,
    },
  ]);

  return <RouterProvider router={router} />;
};

type AppRouteSections = 'Device Management' | 'Administration';

const appRouteSections: Record<AppRouteSections, ExtendedRouteObject[]> = {
  'Device Management': deviceManagementRoutes(),
  Administration: administrationRoutes,
};

export { AppRoutes, appRouteSections };
