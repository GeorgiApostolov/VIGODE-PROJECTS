import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { user, refreshMe } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await refreshMe();
      setLoading(false);
    })();
  }, [refreshMe]);

  if (!user)
    return (
      <div className="mx-auto max-w-4xl p-6 text-white">
        Моля, влез в профила си.
      </div>
    );
  if (loading)
    return <div className="mx-auto max-w-4xl p-6 text-white">Зареждане…</div>;

  return (
    <div className="mx-auto max-w-4xl p-6 text-white">
      <h1 className="mb-6 text-3xl font-bold">Моят профил</h1>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
        <p>
          <strong>Име:</strong> {user.fullName}
        </p>
        <p>
          <strong>Имейл:</strong> {user.email}
        </p>
        <p>
          <strong>Телефон:</strong> {user.phone}
        </p>
      </div>
      <p className="mt-6 text-neutral-400">
        История с часове ще изтеглим от бекенда (ендпойнт `/api/me`).
      </p>
    </div>
  );
}
