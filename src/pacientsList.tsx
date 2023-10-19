import React, { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import db from './libs/firebaseConfig';
import './App.css';

const pacienteCollectionRef = collection(db, 'Pacientes');
const PatientsList: React.FC = () => {
const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const querySnapshot = await getDocs(pacienteCollectionRef);
        const patientsData = querySnapshot.docs.map(async (doc) => {
          const patientData = doc.data();
          const consultasQuery = query(collection(doc.ref, 'consultas'));
          const consultasQuerySnapshot = await getDocs(consultasQuery);
          const consultasData = consultasQuerySnapshot.docs.map((consultaDoc) => ({
            data: consultaDoc.data().data,
            local: consultaDoc.data().local,
            isChecked: false,
          }));


          return {
            id: doc.id,
            ...patientData,
            consultas: consultasData,
            isExpanded: false,
          };
        });
        const patientsWithConsultas = await Promise.all(patientsData);
        setPatients(patientsWithConsultas);
      } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
      }
    };

    fetchPatients();
  }, []);

  const toggleConsultas = (patientId: string) => {
    setPatients((prevPatients) =>
      prevPatients.map((patient) =>
        patient.id === patientId ? { ...patient, isExpanded: !patient.isExpanded } : patient
      )
    );
  };

  const toggleCheckbox = (patientId: string, consultaIndex: number) => {
    setPatients((prevPatients) =>
      prevPatients.map((patient) =>
        patient.id === patientId
          ? {
              ...patient,
              consultas: patient.consultas.map((consulta: any, index: number) =>
                index === consultaIndex
                  ? { ...consulta, isChecked: !consulta.isChecked }
                  : consulta
              ),
            }
          : patient
      )
    );
  };

  return (
    <div>
      <h1>Lista de Pacientes</h1>
      <ul>
        {patients.map((patient: any) => (
          <li className='paciente' key={patient.id}>
            <p><strong>Nome:</strong> {patient.Nome}</p>
            <p><strong>Idade:</strong> {patient.Idade}</p>
            <button onClick={() => toggleConsultas(patient.id)}>
              {patient.isExpanded ? 'Ocultar Consultas' : 'Mostrar Consultas'}
            </button>
            <button>Download</button>
            {patient.isExpanded && (
              <div className='consultas'>
                <h3>Consultas:</h3>
                <ul>
                  {patient.consultas.map((consulta: any, index: number) => (
                    <li className='consulta' key={index}>
                      <input
                        type="checkbox"
                        checked={consulta.isChecked}
                        onChange={() => toggleCheckbox(patient.id, index)}
                      />
                      <p><strong>Data:</strong> {consulta.data}</p>
                      <p><strong>Local:</strong> {consulta.local}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientsList;
