import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ExclamationTriangleIcon,
  HomeIcon,
  BeakerIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sorry, the page you are looking for does not exist or has been moved to another location.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link href="/ar">
            <Button className="w-full" size="lg">
              <HomeIcon className="w-5 h-5 mr-2" />
              العربية - Arabic
            </Button>
          </Link>
          
          <Link href="/en">
            <Button variant="outline" className="w-full" size="lg">
              <HomeIcon className="w-5 h-5 mr-2" />
              English
            </Button>
          </Link>

          <Link href="/ar/tests">
            <Button variant="outline" className="w-full" size="lg">
              <BeakerIcon className="w-5 h-5 mr-2" />
              Chemical Tests - الاختبارات الكيميائية
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            If you believe this is an error, please contact technical support.
            <br />
            إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع الدعم الفني.
          </p>
        </div>
      </div>
    </div>
  );
}
