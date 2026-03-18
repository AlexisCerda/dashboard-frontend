import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-t-4 border-blue-600">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            SIDSIC Dashboard
          </h1>
        </div>

        <LoginForm />

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>En cas d'oubli, contactez l'administrateur système.</p>
        </div>

      </div>
      
    </div>
  );
}