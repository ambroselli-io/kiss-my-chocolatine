import { Fragment, forwardRef, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useNavigate } from "@remix-run/react";

// inspired by https://tailwindui.com/components/application-ui/overlays/modals#component-47a5888a08838ad98779d50878d359b3

/*

Use example:
<ModalContainer>
  <ModalHeader title="A title"><p>anything inside here</p></ModalHeader>
  <ModalBody><p>anything inside here</p></ModalBody>
  <ModalFooter><p>anything inside here, usually some buttons</p></ModalFooter>
</ModalContainer>


 */

interface ModalContainerProps {
  children: React.ReactNode;
  open: boolean;
  onClose?: null | (() => void);
  className?: string;
  onAfterEnter?: () => void;
  onAfterLeave?: () => void;
  onBeforeLeave?: () => void;
  size?: "lg" | "xl" | "3xl" | "full" | "prose";
  blurryBackground?: boolean; // if true, the background will be blurred
}

// omit open
interface ModalRouteContainerProps extends Omit<ModalContainerProps, "open"> {
  title: string;
}

const ModalRouteContainer = ({ title, ...props }: ModalRouteContainerProps) => {
  const [open, setOpen] = useState(false);
  const alreadyOpenedRef = useRef(false);
  useEffect(() => {
    if (!open && !alreadyOpenedRef.current) {
      alreadyOpenedRef.current = true;
      const timeout = setTimeout(() => {
        setOpen(true);
      });
      // return () => clearTimeout(timeout);
    }
  }, [open]);

  function onDismiss() {
    setOpen(false);
  }
  const navigate = useNavigate();

  function onGoBack() {
    navigate("/..");
  }

  return (
    <ModalContainer
      open={open}
      onClose={onDismiss}
      onAfterLeave={onGoBack}
      {...props}
    >
      {!!title && <ModalHeader title={title} onClose={onDismiss} />}
      {props.children}
    </ModalContainer>
  );
};

const ModalContainer = ({
  children,
  open,
  onClose = null,
  // setOpen,
  className = "",
  onAfterEnter = nullFunction,
  onAfterLeave = nullFunction,
  onBeforeLeave = nullFunction,
  size = "lg", // lg, xl, 3xl, full, prose
  blurryBackground = false,
}: ModalContainerProps) => {
  const backgroundRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className={["relative z-[100]", className].join(" ")}
          // onClose={setOpen} // uncomment this if you want backdrop click to close modal
          onClose={nullFunction} // uncomment this if you want backdrop click to NOT close modal
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className={[
                "fixed inset-0 bg-black/70 transition-opacity ",
                blurryBackground ? "backdrop-blur-xl" : "",
              ].join(" ")}
            />
          </Transition.Child>

          <div
            className="fixed inset-0 z-[101] overflow-y-auto"
            ref={backgroundRef}
          >
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                afterEnter={() => {
                  backgroundRef?.current?.scrollTo(0, 0);
                  onAfterEnter();
                }}
                beforeLeave={onBeforeLeave}
                afterLeave={onAfterLeave}
              >
                <Dialog.Panel
                  className={[
                    "relative flex h-full max-h-[90vh] transform flex-col overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full",
                    size === "lg" ? "sm:max-w-lg" : "",
                    size === "xl" ? "sm:max-w-xl" : "",
                    size === "3xl" ? "sm:max-w-3xl" : "",
                    size === "full" ? "sm:max-w-[90vw]" : "",
                    size === "prose" ? "sm:max-w-prose" : "",
                  ].join(" ")}
                >
                  {children}
                  {!!onClose && (
                    <button
                      type="button"
                      aria-label="Fermer"
                      className="absolute right-0 top-4 z-[103] text-gray-900 sm:px-6"
                      onClick={onClose}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

const nullFunction = () => null;

interface ModalHeaderProps {
  children?: React.ReactNode;
  title?: string;
  className?: string;
  onClose?: null | (() => void);
}

const ModalHeader = ({
  children,
  title,
  className,
  onClose,
}: ModalHeaderProps) => {
  return (
    <div
      className={[
        "z-[103] order-1 flex w-full max-w-full shrink-0 items-center justify-between rounded-t-lg bg-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="w-full py-4 sm:flex sm:items-start">
        <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
          {!!title && (
            <Dialog.Title
              as="h3"
              className="mb-0 px-4 text-lg font-medium leading-6 text-gray-900 sm:px-6"
            >
              {title}
            </Dialog.Title>
          )}
          {children}
          {!!onClose && (
            <button
              type="button"
              aria-label="Fermer"
              className="absolute right-0 top-4 text-gray-900 sm:px-6"
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path
                  fillRule="evenodd"
                  d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
  overflowY?: boolean;
}

const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ children, className = "", overflowY = true }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          "z-[102] order-2 shrink",
          overflowY ? "overflow-y-auto" : "",
        ].join(" ")}
      >
        <div className="sm:flex sm:items-start">
          <div
            className={[
              "w-full text-center sm:mt-0 sm:text-left",
              className,
            ].join(" ")}
          >
            {children}
          </div>
        </div>
      </div>
    );
  },
);

interface ModalFooterProps {
  children: React.ReactNode;
}

const ModalFooter = ({ children }: ModalFooterProps) => {
  return (
    <div className="order-3 flex shrink-0 justify-end gap-3 rounded-b-lg border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
      {children}
    </div>
  );
};

export {
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContainer,
  ModalRouteContainer,
};
