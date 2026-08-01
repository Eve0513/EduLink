import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email-ul este obligatoriu").email("Introdu un email valid"),
  password: z.string().min(1, "Parola este obligatorie").min(8, "Parola trebuie să aibă minimum 8 caractere"),
});

export const registerSchema = z.object({
  email: z.string().min(1, "Email-ul este obligatoriu").email("Introdu un email valid"),
  password: z.string().min(8, "Parola trebuie să aibă minimum 8 caractere").regex(/[A-Z]/, "Parola trebuie să conțină cel puțin o literă mare").regex(/[0-9]/, "Parola trebuie să conțină cel puțin o cifră").regex(/[^A-Za-z0-9]/, "Parola trebuie să conțină cel puțin un caracter special"),
  confirmPassword: z.string().min(1, "Confirmarea parolei este obligatorie"),
}).refine((data) => data.password === data.confirmPassword, { message: "Parolele nu coincid", path: ["confirmPassword"] });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
