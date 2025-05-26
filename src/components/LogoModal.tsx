import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
// Using regular img tag instead of next/image to avoid SSR issues
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Logo } from './LogoCard';

type LogoModalProps = {
  show?: boolean;
  isOpen?: boolean; // Support both naming conventions
  onHide?: () => void;
  onClose?: () => void; // Support both naming conventions
  logo: Logo;
};

const LogoModal = ({ isOpen, show, onClose, onHide, logo }: LogoModalProps) => {
  // Support both naming conventions (isOpen/show and onClose/onHide)
  const isModalOpen = isOpen || show || false;
  const handleClose = onClose || onHide || (() => {});
  return (
    <Transition appear show={isModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
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
                
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 text-center"
                >
                  {logo.name}
                </Dialog.Title>
                
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <div className="h-48 w-full flex items-center justify-center">
                    <img
                      src={logo.pngUrl}
                      alt={`${logo.name} logo`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500 text-center">
                    Download this logo in your preferred format
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <a
                    href={logo.pngUrl}
                    download={`${logo.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                    className="btn btn-outline text-center flex items-center justify-center"
                  >
                    Download PNG
                  </a>
                  <a
                    href={logo.svgUrl}
                    download={`${logo.name.toLowerCase().replace(/\s+/g, '-')}.svg`}
                    className="btn btn-primary text-center flex items-center justify-center"
                  >
                    Download SVG
                  </a>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Category: <span className="font-medium">{logo.category}</span>
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LogoModal;
