import { Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';

// Placeholder interno (ou importe de um arquivo separado se preferir)
function ReportsPlaceholder() { 
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-fade-in">
      <div className="bg-gray-100 p-6 rounded-full mb-4">
        <span className="text-4xl">📊</span>
      </div>
      <h1 className="text-2xl font-bold mb-2 text-gray-700">Relatórios Financeiros</h1>
      <p>Este módulo será implementado em breve.</p>
    </div>
  );
}

export function ReportRoutes() {
  return (
    <Route 
      path="/admin/reports" 
      element={
        <PrivateRoute adminOnly={true}>
          <ReportsPlaceholder />
        </PrivateRoute>
      } 
    />
  );
}