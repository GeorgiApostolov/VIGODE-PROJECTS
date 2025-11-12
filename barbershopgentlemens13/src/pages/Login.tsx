// src/pages/Login.tsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      location.href = "/";
    } catch (e: any) {
      setError(e.message || "Грешка при вход");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-md mx-auto p-6 bg-neutral-900 rounded-lg"
    >
      <h1 className="text-white text-2xl mb-4">Вход</h1>
      {error && <div className="text-red-500 mb-3">{error}</div>}
      <input
        className="input"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="input mt-3"
        type="password"
        placeholder="Парола"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn mt-4 w-full">Влез</button>
    </form>
  );
}
