import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import useLanguageStore from '../store/languageStore';
import { getAllEmployees, getEmployeeProjects } from '../services/supplyApi';

// Predefined roles - these are role enums from the API
const AVAILABLE_ROLES = [
  { value: 'DESIGNER', nameUz: 'Dizayner', nameRu: 'Дизайнер' },
  { value: 'HR_MANAGER', nameUz: 'HR menejer', nameRu: 'HR менеджер' },
  { value: 'SEWING_MANAGER', nameUz: 'Tikuvchilik menejeri', nameRu: 'Менеджер по пошиву' },
];

const SupplySelection = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguageStore();

  const [selectedRole, setSelectedRole] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState('');

  // Clear any previous selection when entering this page
  useEffect(() => {
    sessionStorage.removeItem('supplySelection');
  }, []);

  // Fetch employees when role changes
  useEffect(() => {
    if (!selectedRole) {
      setEmployees([]);
      return;
    }

    console.log('📋 Selected Role:', selectedRole);

    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      setError('');

      try {
        const data = await getAllEmployees(selectedRole);
        console.log('👥 Employees for role:', selectedRole, data);
        setEmployees(data);
      } catch (err) {
        console.error('❌ Failed to fetch employees:', err);
        setError('Failed to load employees');
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [selectedRole]);

  // Fetch projects when employee changes
  useEffect(() => {
    if (!selectedEmployee || !selectedRole) {
      setProjects([]);
      return;
    }

    console.log('👤 Selected Employee:', selectedEmployee);
    console.log('🔍 Fetching projects for employee:', selectedEmployee, 'with role:', selectedRole);

    const fetchProjects = async () => {
      setLoadingProjects(true);
      setError('');

      try {
        const data = await getEmployeeProjects(selectedRole, selectedEmployee);
        console.log('📁 Projects response:', data);
        console.log('📊 Total projects:', data?.length);
        if (data?.[0]) {
          console.log('📝 First project:', data[0]);
        }
        setProjects(data);
      } catch (err) {
        console.error('❌ Failed to fetch projects:', err);
        console.error('❌ Error response:', err.response?.data);
        setError('Failed to load projects');
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [selectedEmployee, selectedRole]);

  const handleContinue = () => {
    if (selectedRole && selectedEmployee && selectedProject) {
      // Store selection in session storage
      const selectionData = {
        role: selectedRole,
        employeeId: selectedEmployee,
        projectId: selectedProject
      };

      console.log('✅ ========================================');
      console.log('✅ FINAL SUPPLY SELECTION:');
      console.log('✅ Role:', selectedRole);
      console.log('✅ Employee ID:', selectedEmployee);
      console.log('✅ Project ID:', selectedProject);
      console.log('✅ Full Data:', selectionData);
      console.log('✅ ========================================');

      sessionStorage.setItem('supplySelection', JSON.stringify(selectionData));
      navigate('/supplying/product-types');
    }
  };

  const handleGoBack = () => {
    navigate('/supplying');
  };

  const isFormComplete = selectedRole && selectedEmployee && selectedProject;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center">
          <button
            onClick={handleGoBack}
            className="mr-4 text-2xl text-gray-600 hover:text-gray-900
              w-12 h-12 rounded-lg hover:bg-gray-100 flex items-center justify-center
              transition-colors"
          >
            ←
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">{t.giveProducts}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="bg-white rounded-2xl p-8 shadow-md">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-6">
            {/* Role Selection */}
            <div>
              <label className="block text-gray-700 mb-3 text-2xl font-medium">
                {t.role}
              </label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setSelectedEmployee(''); // Reset employee when role changes
                  setSelectedProject(''); // Reset project when role changes
                }}
                className={`w-full h-14 border-2 border-gray-300 rounded-lg px-6 text-xl
                  focus:border-gray-900 focus:outline-none ${!selectedRole ? 'text-gray-400' : ''}`}
              >
                <option value="" className="text-gray-400">{t.selectRole}</option>
                {AVAILABLE_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {language === 'uz' ? role.nameUz : role.nameRu}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Selection */}
            <div>
              <label className="block text-gray-700 mb-3 text-2xl font-medium">
                {t.employee}
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => {
                  const employeeId = e.target.value;
                  console.log('👤 Selected Employee ID:', employeeId);
                  const selectedEmpData = employees.find(emp => emp.id === employeeId);
                  if (selectedEmpData) {
                    console.log('👤 Selected Employee Details:', selectedEmpData);
                  }
                  setSelectedEmployee(employeeId);
                  setSelectedProject(''); // Reset project when employee changes
                }}
                disabled={!selectedRole || loadingEmployees}
                className={`w-full h-14 border-2 border-gray-300 rounded-lg px-6 text-xl
                  focus:border-gray-900 focus:outline-none
                  ${!selectedRole || loadingEmployees ? 'bg-gray-100 cursor-not-allowed' : ''}
                  ${!selectedEmployee ? 'text-gray-400' : ''}`}
              >
                <option value="" className="text-gray-400">
                  {loadingEmployees ? 'Loading employees...' : t.selectEmployee}
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Selection (Work Category) */}
            <div>
              <label className="block text-gray-700 mb-3 text-2xl font-medium">
                {t.workCategory}
              </label>
              <select
                value={selectedProject}
                onChange={(e) => {
                  const projectId = e.target.value;
                  console.log('📁 Selected Project ID:', projectId);
                  const selectedProjectData = projects.find(p => p.project_id === projectId);
                  if (selectedProjectData) {
                    console.log('📁 Selected Project Details:', selectedProjectData);
                  }
                  setSelectedProject(projectId);
                }}
                disabled={!selectedEmployee || loadingProjects}
                className={`w-full h-16 border-2 border-gray-300 rounded-lg px-6 text-xl
                  focus:border-gray-900 focus:outline-none
                  ${!selectedEmployee || loadingProjects ? 'bg-gray-100 cursor-not-allowed' : ''}
                  ${!selectedProject ? 'text-gray-400' : ''}`}
              >
                <option value="" className="text-gray-400">
                  {loadingProjects ? 'Loading projects...' : t.selectWorkCategory}
                </option>
                {projects.map((project) => (
                  <option key={project.project_id} value={project.project_id}>
                    {project.project_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Continue Button */}
          <div className="mt-8">
            <button
              onClick={handleContinue}
              disabled={!isFormComplete}
              className={`w-full h-16 text-xl font-medium rounded-xl transition-all
                ${isFormComplete
                  ? 'bg-gray-900 text-white active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              {t.continue}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplySelection;
