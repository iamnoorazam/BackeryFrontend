import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

// Predefined toast messages
export const TOAST_MESSAGES = {
  // Success messages
  SUCCESS: {
    LOGIN: { title: "Success!", description: "Logged in successfully" },
    REGISTER: {
      title: "Success!",
      description: "Account created successfully",
    },
    CREATE: { title: "Success!", description: "Created successfully" },
    UPDATE: { title: "Success!", description: "Updated successfully" },
    DELETE: { title: "Success!", description: "Deleted successfully" },
    ADD_CART: { title: "Success!", description: "Added to cart" },
    ORDER: { title: "Success!", description: "Order placed successfully" },
  },
  // Error messages
  ERROR: {
    INVALID_CREDENTIALS: {
      title: "Error!",
      description: "Invalid email or password",
    },
    REQUIRED_FIELD: {
      title: "Error!",
      description: "Please fill all required fields",
    },
    INVALID_EMAIL: {
      title: "Error!",
      description: "Please enter a valid email",
    },
    PASSWORD_MISMATCH: {
      title: "Error!",
      description: "Passwords do not match",
    },
    NETWORK: {
      title: "Network Error!",
      description: "Please check your connection",
    },
    SERVER: {
      title: "Server Error!",
      description: "Something went wrong. Please try again",
    },
    UNAUTHORIZED: {
      title: "Unauthorized!",
      description: "You don't have permission",
    },
    NOT_FOUND: {
      title: "Not Found!",
      description: "The requested item was not found",
    },
    DUPLICATE: { title: "Error!", description: "This item already exists" },
  },
  // Info messages
  INFO: {
    LOADING: { title: "Loading...", description: "Please wait" },
    PROCESSING: { title: "Processing...", description: "Please wait" },
  },
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback(
    ({
      title,
      description = "",
      type = "success",
      variant,
      duration = 3000,
    }) => {
      const resolvedType = variant === "destructive" ? "error" : type;
      setToast({
        title,
        description,
        type: resolvedType,
      });

      if (duration > 0) {
        const timeoutId = setTimeout(() => {
          setToast(null);
        }, duration);

        return () => clearTimeout(timeoutId);
      }
    },
    [],
  );

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, toast: showToast, closeToast }}>
      {children}

      {toast && (
        <div
          className={`
            fixed top-5 right-5 z-50
            min-w-[320px] max-w-[420px]
            rounded-xl
            px-5 py-4
            shadow-2xl
            text-white
            animate-in slide-in-from-right
            border border-opacity-20
            flex items-start gap-3
            backdrop-blur-sm
            transition-all duration-300
            ${
              toast.type === "success"
                ? "bg-gradient-to-r from-green-500 to-green-600 border-green-400"
                : toast.type === "error"
                  ? "bg-gradient-to-r from-red-500 to-red-600 border-red-400"
                  : toast.type === "info"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400"
                    : "bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400"
            }
          `}
          role="alert"
        >
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{toast.title}</h3>
            {toast.description && (
              <p className="text-sm opacity-90 mt-1">{toast.description}</p>
            )}
          </div>
          <button
            onClick={closeToast}
            className="flex-shrink-0 text-white hover:opacity-80 transition mt-0.5"
            aria-label="Close notification"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
