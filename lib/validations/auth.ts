import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email-ul este obligatoriu")
    .email("Introduceți un email valid"),
  password: z
    .string()
    .min(1, "Parola este obligatorie")
    .min(8, "Parola trebuie să aibă minimum 8 caractere"),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Numele trebuie să aibă minimum 2 caractere")
      .max(100, "Numele nu poate depăși 100 de caractere"),
    email: z
      .string()
      .min(1, "Email-ul este obligatoriu")
      .email("Introduceți un email valid"),
    password: z
      .string()
      .min(8, "Parola trebuie să aibă minimum 8 caractere")
      .regex(/[A-Z]/, "Parola trebuie să conțină cel puțin o literă mare")
      .regex(/[0-9]/, "Parola trebuie să conțină cel puțin o cifră"),
    confirmPassword: z.string().min(1, "Confirmarea parolei este obligatorie"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parolele nu coincid",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
