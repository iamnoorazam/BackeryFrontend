import * as yup from "yup";

// Google Maps Places library set (kept module-level so the array identity is
// stable across renders — useLoadScript warns on a changing `libraries` prop).
export const MAPS_LIBRARIES = ["places"];

export const COUNTRY_CODES = [
  { code: "+91", label: "IN +91" },
  { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" },
  { code: "+61", label: "AU +61" },
  { code: "+971", label: "AE +971" },
  { code: "+65", label: "SG +65" },
  { code: "+852", label: "HK +852" },
  { code: "+86", label: "CN +86" },
  { code: "+81", label: "JP +81" },
];

export const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SG", name: "Singapore" },
  { code: "HK", name: "Hong Kong" },
  { code: "CA", name: "Canada" },
];

export const checkoutSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  countryCode: yup.string().default("+91"),
  phone: yup
    .string()
    .required("Phone is required")
    .matches(/^\d{6,15}$/, "Enter a valid phone number"),
  line1: yup.string().required("Address is required"),
  line2: yup.string().default(""),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  postalCode: yup
    .string()
    .required("Postal code is required")
    .matches(/^\d{4,10}$/, "Invalid postal code"),
  country: yup.string().default("IN"),
  billingLine1: yup.string(),
  billingLine2: yup.string(),
  billingCity: yup.string(),
  billingState: yup.string(),
  billingPostalCode: yup.string(),
  billingCountry: yup.string().default("IN"),
  sameAsShipping: yup.boolean().default(true),
  orderNotes: yup.string().default(""),
  paymentMethod: yup.string().oneOf(["cod", "online"]).default("cod"),
});
