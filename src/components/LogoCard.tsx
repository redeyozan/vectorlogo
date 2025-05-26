import { useState, Fragment } from 'react';
import { ArrowDownTrayIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

export type Logo = {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  pngUrl: string;
  svgUrl: string;
  featured: boolean;
};

// Inline LogoModal component
type LogoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  logo: Logo;
};

const LogoModal = ({ isOpen, onClose, logo }: LogoModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-4 sm:p-6 text-left align-middle shadow-xl transition-all">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <Dialog.Title as="h3" className="text-base sm:text-lg font-medium leading-6 text-gray-900">
                  {logo.name}
                </Dialog.Title>
                
                <div className="mt-4 flex justify-center">
                  <img 
                    src={logo.pngUrl} 
                    alt={`${logo.name} logo`} 
                    className="max-h-48 max-w-full object-contain" 
                  />
                </div>
                
                <div className="mt-4 sm:mt-6">
                  <p className="text-sm text-gray-500 mb-2">Category: {logo.category}</p>
                  <div className="flex flex-col space-y-2">
                    <a 
                      href={logo.svgUrl} 
                      download
                      className="btn btn-primary w-full flex items-center justify-center"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                      Download SVG
                    </a>
                    <a 
                      href={logo.pngUrl} 
                      download
                      className="btn btn-outline w-full flex items-center justify-center"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                      Download PNG
                    </a>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

type LogoCardProps = {
  logo: Logo;
};

const LogoCard = ({ logo }: LogoCardProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="card group animate-fade-in h-full relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Logo Image */}
        <div className="h-32 sm:h-40 p-3 sm:p-4 flex items-center justify-center bg-gray-50 border-b">
          <div className="h-full w-full flex items-center justify-center">
            <img
              src={logo.pngUrl}
              alt={`${logo.name} logo`}
              className="max-h-full max-w-full object-contain p-2"
            />
          </div>
        </div>
        
        {/* Logo Info */}
        <div className="p-3 sm:p-4">
          <h3 className="font-medium text-gray-900 text-center text-sm sm:text-base">{logo.name}</h3>
          <p className="text-sm text-gray-500 text-center mt-1">{logo.category}</p>
          
          {/* Actions */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-outline text-xs sm:text-sm flex items-center justify-center py-1 sm:py-2 w-full"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              View & Download
            </button>
          </div>
        </div>
      </div>
      
      {/* Logo Modal */}
      <LogoModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        logo={logo} 
      />
    </>
  );
};

export default LogoCard;
