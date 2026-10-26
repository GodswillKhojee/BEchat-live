import { useState } from "react";

const initialForm = { name: "", email: "", password: "" };

export default function useAuthForm() {
  const [form, setForm] = useState(initialForm);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const reset = () => setForm(initialForm);

  return { form, update, reset };
}