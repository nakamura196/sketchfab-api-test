import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function Footer() {
  const t = await getTranslations('Footer');
  const tCommon = await getTranslations('Common');

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* About Column */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {tCommon('title')}
            </h2>
            <div className="text-gray-600 dark:text-gray-300 mb-4">{tCommon('description')}</div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('quickLinks.title')}
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {t('quickLinks.about')}
                </Link>
              </li>
              <li>
                <Link
                  href="/viewer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {t('resources.example')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('resources.title')}
            </h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://sketchfab.com/developers/data-api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sketchfab API
                </a>
              </li>
              <li>
                <a
                  href="https://docs.pmnd.rs/react-three-fiber"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  React Three Fiber
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('links.title')}
            </h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://sketchfab.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sketchfab
                </a>
              </li>
              <li>
                <a
                  href="https://threejs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Three.js
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/nakamura196/sketchfab-api-test"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-center items-center">
            <p className="text-gray-600 dark:text-gray-300">{t('copyright')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
