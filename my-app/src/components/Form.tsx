import { type FormEvent, useState } from "react";

type FormProps = {
  title: string;
  handleClick: (credentials: { email: string; password: string }) => Promise<void>;
};

export const Form = ({ title, handleClick }: FormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await handleClick({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
        required
      />
      {error && <p>{error}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Loading..." : title}
      </button>
    </form>
  );
};
