import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Booking } from '../components/Booking';

export function BookingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-neutral-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Назад към началната страница
        </button>

        <Booking />
      </div>
    </div>
  );
}
