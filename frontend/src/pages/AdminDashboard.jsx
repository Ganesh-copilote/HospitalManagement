import React from 'react';
import { Admin, Resource } from 'react-admin';
import { authProvider, dataProvider } from '../services/api';
import { MemberList } from '../components/admin/MemberList';
import { MemberEdit } from '../components/admin/MemberEdit';
import { MemberCreate } from '../components/admin/MemberCreate';

const AdminDashboard = () => {
  
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      title="Hospital Admin Panel"
    >
      <Resource
        name="members"
        list={MemberList}
        edit={MemberEdit}
        create={MemberCreate}
      />
      {/* <Resource
        name="appointments"
        list={AppointmentList}
        edit={AppointmentEdit}
        create={AppointmentCreate}
      /> */}
    </Admin>
  );
};

export default AdminDashboard;