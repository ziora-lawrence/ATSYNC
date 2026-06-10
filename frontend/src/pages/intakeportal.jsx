import React from 'react';
import { useParams } from 'react-router-dom';

const IntakePortal = () => {
  const { agencyId } = useParams();

  return (
    <div style={{ color: 'white', padding: '40px' }}>
      Intake portal for agency: {agencyId}
    </div>
  );
};

export default IntakePortal;